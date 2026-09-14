const express = require("express");
const bcrypt = require("bcryptjs");
const {
  Wishlist,
  Follow,
  Artwork,
  ArtworkImage,
  ArtistProfile,
  User,
  CustomerProfile,
} = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();
router.use(requireAuth, requireRole("customer"));

// ---------- Wishlist ----------
router.get("/wishlist", async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Artwork,
          include: [
            { model: ArtworkImage, as: "images" },
            { model: ArtistProfile, attributes: ["id", "artistName"] },
          ],
        },
      ],
    });
    res.json({ items: items.map((i) => i.Artwork).filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

router.post("/wishlist/:artworkId", async (req, res, next) => {
  try {
    const artwork = await Artwork.findByPk(req.params.artworkId);
    if (!artwork) return res.status(404).json({ message: "That artwork is no longer available." });

    const existing = await Wishlist.findOne({
      where: { userId: req.user.id, artworkId: artwork.id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ wishlisted: false });
    }

    await Wishlist.create({ userId: req.user.id, artworkId: artwork.id });
    res.json({ wishlisted: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Follow ----------
router.get("/following", async (req, res, next) => {
  try {
    const items = await Follow.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: ArtistProfile,
          include: [{ model: User, attributes: ["profileImage"] }],
        },
      ],
    });
    res.json({ artists: items.map((i) => i.ArtistProfile).filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

router.post("/follow/:artistId", async (req, res, next) => {
  try {
    const artist = await ArtistProfile.findByPk(req.params.artistId);
    if (!artist) return res.status(404).json({ message: "Artist not found." });

    const existing = await Follow.findOne({
      where: { userId: req.user.id, artistProfileId: artist.id },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ following: false });
    }

    await Follow.create({ userId: req.user.id, artistProfileId: artist.id });
    res.json({ following: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Dashboard ----------
router.get("/dashboard", async (req, res, next) => {
  try {
    const [wishlistCount, followingCount] = await Promise.all([
      Wishlist.count({ where: { userId: req.user.id } }),
      Follow.count({ where: { userId: req.user.id } }),
    ]);
    res.json({
      stats: {
        wishlistCount,
        followingCount,
        // Orders/commissions modules aren't built yet — reported as 0 rather than faked.
        ordersCount: 0,
        commissionsCount: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Profile ----------
router.put("/profile", upload.single("profileImage"), async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, city, province, password } = req.body;
    const user = req.user;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (req.file) user.profileImage = upload.fileUrl(req.file);
    if (password) {
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    await user.save();

    const profile = await CustomerProfile.findOne({ where: { userId: user.id } });
    if (profile) {
      if (address !== undefined) profile.address = address;
      if (city !== undefined) profile.city = city;
      if (province !== undefined) profile.province = province;
      await profile.save();
    }

    res.json({ message: "Profile updated." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
