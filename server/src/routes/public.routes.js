const express = require("express");
const { Op } = require("sequelize");
const {
  Artwork,
  ArtworkImage,
  ArtistProfile,
  User,
  Category,
  PortfolioItem,
} = require("../models");

const router = express.Router();

const PUBLIC_ARTWORK_INCLUDE = [
  { model: ArtworkImage, as: "images" },
  {
    model: ArtistProfile,
    attributes: ["id", "displayId", "artistName", "location", "verified"],
    include: [{ model: User, attributes: ["profileImage"] }],
  },
  { model: Category, attributes: ["id", "name", "slug"] },
];

// GET /api/categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/artworks — search/filter/sort/pagination, public listing only
router.get("/artworks", async (req, res, next) => {
  try {
    const {
      q,
      category,
      medium,
      style,
      type,
      availability, // "available" | "sold"
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const where = { status: { [Op.in]: ["available", "sold"] } };

    if (availability === "available") where.status = "available";
    if (availability === "sold") where.status = "sold";

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { medium: { [Op.like]: `%${q}%` } },
        { style: { [Op.like]: `%${q}%` } },
      ];
    }
    if (medium) where.medium = medium;
    if (style) where.style = style;
    if (type) where.type = type;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const include = [...PUBLIC_ARTWORK_INCLUDE];
    if (category) {
      include[2] = { model: Category, attributes: ["id", "name", "slug"], where: { slug: category } };
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "price_asc") order = [["price", "ASC"]];
    if (sort === "price_desc") order = [["price", "DESC"]];
    if (sort === "popular") order = [["likeCount", "DESC"]];

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));

    const { rows, count } = await Artwork.findAndCountAll({
      where,
      include,
      order,
      distinct: true,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    res.json({
      artworks: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/artworks/featured — small curated sets for the homepage
router.get("/artworks/featured", async (req, res, next) => {
  try {
    const [newArrivals, popular] = await Promise.all([
      Artwork.findAll({
        where: { status: "available" },
        include: PUBLIC_ARTWORK_INCLUDE,
        order: [["createdAt", "DESC"]],
        limit: 8,
      }),
      Artwork.findAll({
        where: { status: "available" },
        include: PUBLIC_ARTWORK_INCLUDE,
        order: [["likeCount", "DESC"]],
        limit: 8,
      }),
    ]);
    res.json({ newArrivals, popular });
  } catch (err) {
    next(err);
  }
});

// GET /api/artworks/:id
router.get("/artworks/:id", async (req, res, next) => {
  try {
    const artwork = await Artwork.findOne({
      where: { id: req.params.id, status: { [Op.in]: ["available", "sold"] } },
      include: [
        { model: ArtworkImage, as: "images" },
        {
          model: ArtistProfile,
          include: [{ model: User, attributes: ["profileImage"] }],
        },
        { model: Category },
      ],
    });
    if (!artwork) return res.status(404).json({ message: "That artwork is no longer available." });

    artwork.viewCount += 1;
    await artwork.save();

    res.json({ artwork });
  } catch (err) {
    next(err);
  }
});

// GET /api/artists — directory of approved artists
router.get("/artists", async (req, res, next) => {
  try {
    const { q } = req.query;
    const userWhere = { role: "artist", status: "active" };

    const artists = await ArtistProfile.findAll({
      include: [
        { model: User, where: userWhere, attributes: ["id", "profileImage", "status"] },
        { model: Artwork, attributes: ["id"], where: { status: "available" }, required: false },
      ],
      where: q ? { artistName: { [Op.like]: `%${q}%` } } : undefined,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      artists: artists.map((a) => ({
        id: a.id,
        displayId: a.displayId,
        artistName: a.artistName,
        style: a.style,
        location: a.location,
        verified: a.verified,
        profileImage: a.User.profileImage,
        artworkCount: a.Artworks.length,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/featured
router.get("/artists/featured", async (req, res, next) => {
  try {
    const artists = await ArtistProfile.findAll({
      include: [
        { model: User, where: { role: "artist", status: "active" }, attributes: ["profileImage"] },
        { model: Artwork, attributes: ["id"], where: { status: "available" }, required: false },
      ],
      limit: 8,
      order: [["createdAt", "DESC"]],
    });
    res.json({
      artists: artists.map((a) => ({
        id: a.id,
        displayId: a.displayId,
        artistName: a.artistName,
        style: a.style,
        location: a.location,
        verified: a.verified,
        profileImage: a.User.profileImage,
        artworkCount: a.Artworks.length,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/artists/:id — public artist profile
router.get("/artists/:id", async (req, res, next) => {
  try {
    const artist = await ArtistProfile.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, where: { status: "active" }, attributes: ["profileImage", "createdAt"] },
        { model: PortfolioItem },
        {
          model: Artwork,
          where: { status: { [Op.in]: ["available", "sold"] } },
          required: false,
          include: [{ model: ArtworkImage, as: "images" }],
        },
      ],
    });
    if (!artist) return res.status(404).json({ message: "Artist not found." });

    const followerCount = await artist.countFollowers();

    res.json({
      artist: {
        ...artist.toJSON(),
        followerCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
