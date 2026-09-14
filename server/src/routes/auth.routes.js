const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body } = require("express-validator");
const { Op } = require("sequelize");

const {
  sequelize,
  User,
  CustomerProfile,
  ArtistProfile,
  PortfolioItem,
  PasswordResetToken,
} = require("../models");
const { signToken, requireAuth } = require("../middleware/auth");
const { checkValidation } = require("../middleware/errorHandler");
const upload = require("../middleware/upload");
const { nextDisplayId } = require("../utils/displayId");
const { notifyAdmins } = require("../utils/notify");

const router = express.Router();

const baseAccountValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters."),
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
  body("agreeToTerms")
    .custom((v) => v === "true" || v === true)
    .withMessage("You must agree to the Terms of Service and Privacy Policy."),
];

async function assertUniqueAccount(username, email) {
  const existing = await User.findOne({
    where: { [Op.or]: [{ username }, { email }] },
  });
  if (existing) {
    if (existing.username === username) throw { status: 409, message: "That username is already taken." };
    throw { status: 409, message: "An account with that email already exists." };
  }
}

// ---------- Customer registration ----------
router.post(
  "/register/customer",
  upload.single("profileImage"),
  baseAccountValidation,
  checkValidation,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const { firstName, lastName, username, email, password, phone, address, city, province } =
        req.body;

      await assertUniqueAccount(username, email);
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create(
        {
          role: "customer",
          status: "active",
          firstName,
          lastName,
          username,
          email,
          passwordHash,
          phone,
          profileImage: upload.fileUrl(req.file),
        },
        { transaction: t }
      );

      await CustomerProfile.create(
        { userId: user.id, address, city, province },
        { transaction: t }
      );

      await t.commit();
      const token = signToken(user);
      res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

// ---------- Artist registration ----------
router.post(
  "/register/artist",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "portfolioImages", maxCount: 8 },
  ]),
  baseAccountValidation,
  body("artistName").trim().notEmpty().withMessage("Artist name is required."),
  body("agreeArtistTerms")
    .custom((v) => v === "true" || v === true)
    .withMessage("You must agree to the Marketplace Terms, Artist Guidelines, and Copyright Policy."),
  checkValidation,
  async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        password,
        phone,
        location,
        artistName,
        bio,
        statement,
        specialization,
        style,
        medium,
        yearsExperience,
        intro,
        socialLinks,
        portfolioMeta,
      } = req.body;

      await assertUniqueAccount(username, email);
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create(
        {
          role: "artist",
          status: "pending_approval",
          firstName,
          lastName,
          username,
          email,
          passwordHash,
          phone,
          profileImage: upload.fileUrl(req.files?.profileImage?.[0]),
        },
        { transaction: t }
      );

      const displayId = await nextDisplayId(ArtistProfile, "ARTIST", t);

      let parsedSocialLinks = {};
      try {
        parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};
      } catch {
        parsedSocialLinks = {};
      }

      const artistProfile = await ArtistProfile.create(
        {
          userId: user.id,
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
        },
        { transaction: t }
      );

      let parsedPortfolioMeta = [];
      try {
        parsedPortfolioMeta = portfolioMeta ? JSON.parse(portfolioMeta) : [];
      } catch {
        parsedPortfolioMeta = [];
      }

      const portfolioFiles = req.files?.portfolioImages || [];
      if (portfolioFiles.length) {
        await PortfolioItem.bulkCreate(
          portfolioFiles.map((file, i) => ({
            artistProfileId: artistProfile.id,
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
        `New artist application from ${artistName} (@${username}).`,
        `/admin/artist-applications`
      );

      res.status(201).json({
        message:
          "Your artist application has been submitted successfully. An administrator will review your application.",
      });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  }
);

// ---------- Login ----------
router.post(
  "/login",
  body("identifier").trim().notEmpty().withMessage("Email or username is required."),
  body("password").notEmpty().withMessage("Password is required."),
  checkValidation,
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      const user = await User.findOne({
        where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
      });
      if (!user) return res.status(401).json({ message: "Invalid email/username or password." });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "Invalid email/username or password." });

      if (user.status === "pending_approval") {
        return res.status(403).json({
          message:
            "Your artist application is still pending admin approval. We'll notify you once it's reviewed.",
        });
      }
      if (user.status === "rejected") {
        return res.status(403).json({
          message: `Your artist application was not approved. Reason: ${
            user.rejectionReason || "No reason provided."
          }`,
        });
      }
      if (user.status === "suspended") {
        return res.status(403).json({ message: "This account has been suspended." });
      }

      const token = signToken(user);
      res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Forgot / Reset password ----------
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Please enter a valid email address."),
  checkValidation,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      // Always respond the same way so we don't leak which emails are registered.
      if (!user) {
        return res.json({
          message: "If an account exists for that email, a reset link has been generated.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      await PasswordResetToken.create({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });

      // No email service is wired up yet (placeholder) — return the token directly
      // in this dev build so the reset flow can be exercised end-to-end.
      res.json({
        message: "If an account exists for that email, a reset link has been generated.",
        devResetToken: token,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Reset token is required."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
  checkValidation,
  async (req, res, next) => {
    try {
      const record = await PasswordResetToken.findOne({ where: { token: req.body.token } });
      if (!record || record.used || record.expiresAt < new Date()) {
        return res.status(400).json({ message: "This reset link is invalid or has expired." });
      }

      const user = await User.findByPk(record.userId);
      user.passwordHash = await bcrypt.hash(req.body.password, 12);
      await user.save();

      record.used = true;
      await record.save();

      res.json({ message: "Your password has been reset. You can now log in." });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

function sanitizeUser(user) {
  const { id, role, status, firstName, lastName, username, email, phone, profileImage } = user;
  return { id, role, status, firstName, lastName, username, email, phone, profileImage };
}

module.exports = router;
