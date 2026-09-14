const express = require("express");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");
const {
  sequelize,
  Wishlist,
  Follow,
  Artwork,
  ArtworkImage,
  ArtistProfile,
  PortfolioItem,
  User,
  CustomerProfile,
} = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const { checkValidation } = require("../middleware/errorHandler");
const upload = require("../middleware/upload");
const { nextDisplayId } = require("../utils/displayId");
const { notifyAdmins } = require("../utils/notify");

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

// ---------- Become a seller (customer applies for an artist profile on the
// same account — role stays "customer", full customer access unaffected
// regardless of the application's outcome) ----------
router.get("/seller-application", async (req, res, next) => {
  try {
    const profile = await ArtistProfile.findOne({ where: { userId: req.user.id } });
    res.json({ application: profile });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/seller-application",
  upload.array("portfolioImages", 8),
  body("artistName").trim().notEmpty().withMessage("Artist name is required."),
  body("agreeArtistTerms")
    .custom((v) => v === "true" || v === true)
    .withMessage("You must agree to the Marketplace Terms, Artist Guidelines, and Copyright Policy."),
  checkValidation,
  async (req, res, next) => {
    try {
      const existing = await ArtistProfile.findOne({ where: { userId: req.user.id } });
      if (existing && existing.status !== "rejected") {
        return res.status(409).json({
          message:
            existing.status === "pending_approval"
              ? "You already have a seller application pending review."
              : "You're already an approved seller.",
        });
      }

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
        portfolioMeta,
      } = req.body;

      let parsedSocialLinks = {};
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};
      } catch {
        parsedSocialLinks = {};
      }

      const t = await sequelize.transaction();
      try {
        let profile = existing;
        if (profile) {
          // Re-applying after a rejection — overwrite with the fresh submission.
          Object.assign(profile, {
            artistName,
            bio,
            statement,
            specialization,
            style,
            medium,
            yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : null,
            intro,
            location,
            socialLinks: parsedSocialLinks,
            status: "pending_approval",
            rejectionReason: null,
          });
          await profile.save({ transaction: t });
        } else {
          const displayId = await nextDisplayId(ArtistProfile, "ARTIST", t);
          profile = await ArtistProfile.create(
            {
              userId: req.user.id,
              displayId,
              artistName,
              bio,
              statement,
              specialization,
              style,
              medium,
              yearsExperience: yearsExperience ? parseInt(yearsExperience, 10) : null,
              intro,
              location,
              socialLinks: parsedSocialLinks,
              status: "pending_approval",
            },
            { transaction: t }
          );
        }

        let parsedPortfolioMeta = [];
        try {
          parsedPortfolioMeta = portfolioMeta ? JSON.parse(portfolioMeta) : [];
        } catch {
          parsedPortfolioMeta = [];
        }

        const portfolioFiles = req.files || [];
        if (portfolioFiles.length) {
          await PortfolioItem.bulkCreate(
            portfolioFiles.map((file, i) => ({
              artistProfileId: profile.id,
              image: upload.fileUrl(file),
              title: parsedPortfolioMeta[i]?.title || "",
              description: parsedPortfolioMeta[i]?.description || "",
              medium: parsedPortfolioMeta[i]?.medium || "",
              year: parsedPortfolioMeta[i]?.year ? parseInt(parsedPortfolioMeta[i].year, 10) : null,
            })),
            { transaction: t }
          );
        }

        await t.commit();

        await notifyAdmins(
          "artist_application",
          `${req.user.firstName} ${req.user.lastName} (@${req.user.username}) applied to become a seller.`,
          "/admin/artist-applications"
        );

        res.status(201).json({
          application: profile,
          message: "Your seller application has been submitted. An administrator will review it.",
        });
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
