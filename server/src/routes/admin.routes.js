const express = require("express");
const { body } = require("express-validator");
const { Op } = require("sequelize");
const {
  User,
  ArtistProfile,
  PortfolioItem,
  Artwork,
  ArtworkImage,
  Category,
  AdminLog,
} = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const { checkValidation } = require("../middleware/errorHandler");
const { logAdminAction } = require("../utils/adminLog");
const { notifyUser } = require("../utils/notify");

const router = express.Router();
router.use(requireAuth, requireRole("admin"));

// ---------- Dashboard stats ----------
router.get("/stats", async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalArtists,
      pendingArtists,
      totalArtworks,
      pendingArtworks,
      totalCategories,
    ] = await Promise.all([
      User.count(),
      ArtistProfile.count({ where: { status: "approved" } }),
      ArtistProfile.count({ where: { status: "pending_approval" } }),
      Artwork.count(),
      Artwork.count({ where: { status: "pending_review" } }),
      Category.count(),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalArtists,
        pendingArtists,
        totalArtworks,
        pendingArtworks,
        totalCategories,
        // Orders/sales/commissions modules aren't built yet — reported as 0.
        totalOrders: 0,
        totalSales: 0,
        pendingCommissions: 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Artist applications ----------
// ArtistProfile.status is the canonical state here — it covers both a
// dedicated artist account (User.role === "artist") and a customer account
// that separately applied to sell, so this list and the approve/reject
// actions below work the same for either.
router.get("/artist-applications", async (req, res, next) => {
  try {
    const { status = "pending_approval" } = req.query;
    const applications = await ArtistProfile.findAll({
      where: { status },
      include: [
        { model: User, attributes: { exclude: ["passwordHash"] } },
        PortfolioItem,
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

router.post("/artist-applications/:userId/approve", async (req, res, next) => {
  try {
    const profile = await ArtistProfile.findOne({ where: { userId: req.params.userId } });
    if (!profile) return res.status(404).json({ message: "Application not found." });

    profile.status = "approved";
    profile.rejectionReason = null;
    await profile.save();

    // A dedicated artist account (not a dual-role customer) is also gated
    // from logging in at all until this flips — keep that in sync.
    const user = await User.findByPk(req.params.userId);
    if (user.role === "artist" && user.status === "pending_approval") {
      user.status = "active";
      user.rejectionReason = null;
      await user.save();
    }

    await logAdminAction({
      adminUserId: req.user.id,
      action: "approve_artist",
      targetType: "User",
      targetId: user.id,
      details: { username: user.username },
    });
    await notifyUser(user.id, "artist_approved", "Your artist application has been approved.", "/artist/dashboard");

    res.json({ message: "Artist approved." });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/artist-applications/:userId/reject",
  body("reason").trim().notEmpty().withMessage("A rejection reason is required."),
  checkValidation,
  async (req, res, next) => {
    try {
      const profile = await ArtistProfile.findOne({ where: { userId: req.params.userId } });
      if (!profile) return res.status(404).json({ message: "Application not found." });

      profile.status = "rejected";
      profile.rejectionReason = req.body.reason;
      await profile.save();

      const user = await User.findByPk(req.params.userId);
      // Only a dedicated artist account's login is gated by this — a
      // dual-role customer keeps shopping normally after a rejection.
      if (user.role === "artist" && user.status === "pending_approval") {
        user.status = "rejected";
        user.rejectionReason = req.body.reason;
        await user.save();
      }

      await logAdminAction({
        adminUserId: req.user.id,
        action: "reject_artist",
        targetType: "User",
        targetId: user.id,
        details: { username: user.username, reason: req.body.reason },
      });

      res.json({ message: "Application rejected." });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Artwork moderation ----------
router.get("/artworks", async (req, res, next) => {
  try {
    const { status = "pending_review" } = req.query;
    const artworks = await Artwork.findAll({
      where: { status },
      include: [{ model: ArtworkImage, as: "images" }, { model: ArtistProfile }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ artworks });
  } catch (err) {
    next(err);
  }
});

router.post("/artworks/:id/approve", async (req, res, next) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id, { include: [ArtistProfile] });
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });

    artwork.status = "available";
    artwork.rejectionReason = null;
    await artwork.save();

    await logAdminAction({
      adminUserId: req.user.id,
      action: "approve_artwork",
      targetType: "Artwork",
      targetId: artwork.id,
      details: { displayId: artwork.displayId },
    });
    await notifyUser(
      artwork.ArtistProfile.userId,
      "artwork_approved",
      `Your artwork "${artwork.title}" has been approved and is now live.`,
      `/artworks/${artwork.id}`
    );

    res.json({ message: "Artwork approved." });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/artworks/:id/reject",
  body("reason").trim().notEmpty().withMessage("A rejection reason is required."),
  checkValidation,
  async (req, res, next) => {
    try {
      const artwork = await Artwork.findByPk(req.params.id, { include: [ArtistProfile] });
      if (!artwork) return res.status(404).json({ message: "Artwork not found." });

      artwork.status = "rejected";
      artwork.rejectionReason = req.body.reason;
      await artwork.save();

      await logAdminAction({
        adminUserId: req.user.id,
        action: "reject_artwork",
        targetType: "Artwork",
        targetId: artwork.id,
        details: { displayId: artwork.displayId, reason: req.body.reason },
      });
      await notifyUser(
        artwork.ArtistProfile.userId,
        "artwork_rejected",
        `Your artwork "${artwork.title}" was not approved. Reason: ${req.body.reason}`,
        `/artist/artworks`
      );

      res.json({ message: "Artwork rejected." });
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/artworks/:id/hide", async (req, res, next) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });
    artwork.status = "hidden";
    await artwork.save();
    await logAdminAction({
      adminUserId: req.user.id,
      action: "hide_artwork",
      targetType: "Artwork",
      targetId: artwork.id,
    });
    res.json({ message: "Artwork hidden." });
  } catch (err) {
    next(err);
  }
});

router.delete("/artworks/:id", async (req, res, next) => {
  try {
    const artwork = await Artwork.findByPk(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });
    await artwork.destroy();
    await logAdminAction({
      adminUserId: req.user.id,
      action: "delete_artwork",
      targetType: "Artwork",
      targetId: req.params.id,
    });
    res.json({ message: "Artwork deleted." });
  } catch (err) {
    next(err);
  }
});

// ---------- Artist verification ----------
router.patch("/artists/:id/verify", async (req, res, next) => {
  try {
    const artist = await ArtistProfile.findByPk(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found." });
    artist.verified = !artist.verified;
    await artist.save();
    await logAdminAction({
      adminUserId: req.user.id,
      action: artist.verified ? "verify_artist" : "unverify_artist",
      targetType: "ArtistProfile",
      targetId: artist.id,
    });
    res.json({ artist });
  } catch (err) {
    next(err);
  }
});

// ---------- User management ----------
router.get("/users", async (req, res, next) => {
  try {
    const { q, role, status } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { username: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { firstName: { [Op.like]: `%${q}%` } },
        { lastName: { [Op.like]: `%${q}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ["passwordHash"] },
      order: [["createdAt", "DESC"]],
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.patch("/users/:id/suspend", async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "You cannot suspend your own account." });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "admin") return res.status(400).json({ message: "Admin accounts cannot be suspended." });

    user.status = "suspended";
    await user.save();
    await logAdminAction({
      adminUserId: req.user.id,
      action: "suspend_user",
      targetType: "User",
      targetId: user.id,
    });
    res.json({ message: "User suspended." });
  } catch (err) {
    next(err);
  }
});

router.patch("/users/:id/restore", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.status = "active";
    await user.save();
    await logAdminAction({
      adminUserId: req.user.id,
      action: "restore_user",
      targetType: "User",
      targetId: user.id,
    });
    res.json({ message: "User restored." });
  } catch (err) {
    next(err);
  }
});

// ---------- Categories ----------
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/categories",
  body("name").trim().notEmpty().withMessage("Category name is required."),
  checkValidation,
  async (req, res, next) => {
    try {
      const { name, description } = req.body;
      const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const category = await Category.create({ name, slug, description });
      await logAdminAction({
        adminUserId: req.user.id,
        action: "create_category",
        targetType: "Category",
        targetId: category.id,
      });
      res.status(201).json({ category });
    } catch (err) {
      next(err);
    }
  }
);

router.put("/categories/:id", async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    if (req.body.name) {
      category.name = req.body.name;
      category.slug = req.body.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    if (req.body.description !== undefined) category.description = req.body.description;
    await category.save();

    await logAdminAction({
      adminUserId: req.user.id,
      action: "update_category",
      targetType: "Category",
      targetId: category.id,
    });
    res.json({ category });
  } catch (err) {
    next(err);
  }
});

router.delete("/categories/:id", async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    await category.destroy();
    await logAdminAction({
      adminUserId: req.user.id,
      action: "delete_category",
      targetType: "Category",
      targetId: req.params.id,
    });
    res.json({ message: "Category deleted." });
  } catch (err) {
    next(err);
  }
});

// ---------- Audit log ----------
router.get("/logs", async (req, res, next) => {
  try {
    const logs = await AdminLog.findAll({
      include: [{ model: User, attributes: ["username", "firstName", "lastName"] }],
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
