const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const {
  sequelize,
  ArtistProfile,
  Artwork,
  ArtworkImage,
  Follow,
  Category,
} = require("../models");
const { requireAuth, requireApprovedArtist } = require("../middleware/auth");
const { checkValidation } = require("../middleware/errorHandler");
const upload = require("../middleware/upload");
const { nextDisplayId } = require("../utils/displayId");

const router = express.Router();
router.use(requireAuth, requireApprovedArtist);

async function getOwnProfile(userId) {
  const profile = await ArtistProfile.findOne({ where: { userId } });
  if (!profile) throw { status: 404, message: "Artist profile not found." };
  return profile;
}

// ---------- Dashboard ----------
router.get("/dashboard", async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.user.id);

    const [available, sold, pendingReview, followers] = await Promise.all([
      Artwork.count({ where: { artistProfileId: profile.id, status: "available" } }),
      Artwork.count({ where: { artistProfileId: profile.id, status: "sold" } }),
      Artwork.count({ where: { artistProfileId: profile.id, status: "pending_review" } }),
      Follow.count({ where: { artistProfileId: profile.id } }),
    ]);

    res.json({
      stats: {
        availableArtworks: available,
        soldArtworks: sold,
        pendingReviewArtworks: pendingReview,
        followers,
        // Orders/commissions/earnings modules aren't built yet — reported as 0.
        totalSales: 0,
        totalEarnings: 0,
        pendingOrders: 0,
        pendingCommissions: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- My artworks ----------
router.get("/artworks", async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.user.id);
    const artworks = await Artwork.findAll({
      where: { artistProfileId: profile.id },
      include: [{ model: ArtworkImage, as: "images" }, { model: Category }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ artworks });
  } catch (err) {
    next(err);
  }
});

router.get("/artworks/:id", async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.user.id);
    const artwork = await Artwork.findOne({
      where: { id: req.params.id, artistProfileId: profile.id },
      include: [{ model: ArtworkImage, as: "images" }, { model: Category }],
    });
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });
    res.json({ artwork });
  } catch (err) {
    next(err);
  }
});

const artworkValidation = [
  body("title").trim().notEmpty().withMessage("Artwork title is required."),
  body("price").isFloat({ min: 0 }).withMessage("Please enter a valid price."),
];

router.post(
  "/artworks",
  upload.array("images", 8),
  artworkValidation,
  checkValidation,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const profile = await getOwnProfile(req.user.id);
      const {
        title,
        description,
        story,
        price,
        type,
        medium,
        style,
        categoryId,
        width,
        height,
        unit,
        yearCreated,
        framed,
        weight,
        quantity,
        shippingInfo,
        mainImageIndex,
      } = req.body;

      const displayId = await nextDisplayId(Artwork, "ART", t);

      const artwork = await Artwork.create(
        {
          artistProfileId: profile.id,
          categoryId: categoryId || null,
          displayId,
          title,
          description,
          story,
          price,
          type: type || "original",
          medium,
          style,
          width: width || null,
          height: height || null,
          unit: unit || "in",
          yearCreated: yearCreated || null,
          framed: framed === "true" || framed === true,
          weight: weight || null,
          quantity: quantity ? parseInt(quantity, 10) : 1,
          shippingInfo,
          status: "pending_review",
        },
        { transaction: t }
      );

      const files = req.files || [];
      if (!files.length) throw { status: 400, message: "At least one artwork image is required." };

      const mainIdx = mainImageIndex ? parseInt(mainImageIndex, 10) : 0;
      await ArtworkImage.bulkCreate(
        files.map((file, i) => ({
          artworkId: artwork.id,
          url: upload.fileUrl(file),
          isMain: i === mainIdx,
          sortOrder: i,
        })),
        { transaction: t }
      );

      await t.commit();
      res.status(201).json({ artwork, message: "Artwork submitted for admin review." });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

router.put(
  "/artworks/:id",
  upload.array("images", 8),
  async (req, res, next) => {
    try {
      const profile = await getOwnProfile(req.user.id);
      const artwork = await Artwork.findOne({
        where: { id: req.params.id, artistProfileId: profile.id },
        include: [{ model: ArtworkImage, as: "images" }],
      });
      if (!artwork) return res.status(404).json({ message: "Artwork not found." });

      const fields = [
        "title",
        "description",
        "story",
        "price",
        "type",
        "medium",
        "style",
        "categoryId",
        "width",
        "height",
        "unit",
        "yearCreated",
        "shippingInfo",
      ];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) artwork[f] = req.body[f];
      });
      if (req.body.framed !== undefined) artwork.framed = req.body.framed === "true" || req.body.framed === true;
      if (req.body.quantity !== undefined) artwork.quantity = parseInt(req.body.quantity, 10);
      if (req.body.weight !== undefined) artwork.weight = req.body.weight;

      // Editing sends it back through moderation.
      artwork.status = "pending_review";
      artwork.rejectionReason = null;
      await artwork.save();

      const newFiles = req.files || [];
      if (newFiles.length) {
        const startOrder = artwork.images.length;
        await ArtworkImage.bulkCreate(
          newFiles.map((file, i) => ({
            artworkId: artwork.id,
            url: upload.fileUrl(file),
            isMain: false,
            sortOrder: startOrder + i,
          }))
        );
      }

      res.json({ artwork, message: "Artwork updated and resubmitted for review." });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/artworks/:id", async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.user.id);
    const artwork = await Artwork.findOne({
      where: { id: req.params.id, artistProfileId: profile.id },
    });
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });

    await artwork.destroy();
    res.json({ message: "Artwork deleted." });
  } catch (err) {
    next(err);
  }
});

router.patch("/artworks/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body; // artist can toggle available <-> sold/hidden manually
    if (!["available", "sold", "hidden"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const profile = await getOwnProfile(req.user.id);
    const artwork = await Artwork.findOne({
      where: { id: req.params.id, artistProfileId: profile.id },
    });
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });
    if (!["available", "sold", "hidden"].includes(artwork.status)) {
      return res.status(400).json({ message: "This artwork must be approved before its availability can change." });
    }

    artwork.status = status;
    await artwork.save();
    res.json({ artwork });
  } catch (err) {
    next(err);
  }
});

// ---------- Profile ----------
router.get("/profile", async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.user.id);
    const { id, firstName, lastName, phone, profileImage } = req.user;
    res.json({ profile, user: { id, firstName, lastName, phone, profileImage } });
  } catch (err) {
    next(err);
  }
});

router.put(
  "/profile",
  upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  async (req, res, next) => {
    try {
      const profile = await getOwnProfile(req.user.id);
      const {
        artistName,
        bio,
        statement,
        specialization,
        style,
        medium,
        yearsExperience,
        intro,
        location,
        socialLinks,
        firstName,
        lastName,
        phone,
        password,
      } = req.body;

      if (artistName) profile.artistName = artistName;
      if (bio !== undefined) profile.bio = bio;
      if (statement !== undefined) profile.statement = statement;
      if (specialization !== undefined) profile.specialization = specialization;
      if (style !== undefined) profile.style = style;
      if (medium !== undefined) profile.medium = medium;
      if (yearsExperience !== undefined) profile.yearsExperience = parseInt(yearsExperience, 10) || null;
      if (intro !== undefined) profile.intro = intro;
      if (location !== undefined) profile.location = location;
      if (socialLinks !== undefined) {
        try {
          profile.socialLinks = JSON.parse(socialLinks);
        } catch {
          /* ignore malformed payload, keep existing links */
        }
      }
      if (req.files?.coverImage?.[0]) profile.coverImage = upload.fileUrl(req.files.coverImage[0]);
      await profile.save();

      const user = req.user;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (req.files?.profileImage?.[0]) user.profileImage = upload.fileUrl(req.files.profileImage[0]);
      if (password) {
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
        user.passwordHash = await bcrypt.hash(password, 12);
      }
      await user.save();

      res.json({ message: "Profile updated." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
