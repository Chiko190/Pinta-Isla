const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body } = require("express-validator");
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");

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
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit");
const upload = require("../middleware/upload");
const { nextDisplayId } = require("../utils/displayId");
const { notifyAdmins } = require("../utils/notify");

const router = express.Router();

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// Requires 10+ chars and at least 3 of the 4 character classes — strong
// enough to resist dictionary/credential-stuffing attacks without being an
// unusable "must contain a hieroglyph" rule.
function isStrongPassword(pw) {
  if (typeof pw !== "string" || pw.length < 10) return false;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length;
  return classes >= 3;
}

const strongPasswordValidator = body("password")
  .isLength({ min: 10 })
  .withMessage("Password must be at least 10 characters.")
  .custom((value) => isStrongPassword(value))
  .withMessage(
    "Password must include at least 3 of: lowercase, uppercase, numbers, and symbols."
  );

const identityValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").trim().notEmpty().withMessage("Last name is required."),
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters."),
  body("email").trim().isEmail().withMessage("Please enter a valid email address."),
  body("agreeToTerms")
    .custom((v) => v === "true" || v === true)
    .withMessage("You must agree to the Terms of Service and Privacy Policy."),
];

const passwordValidation = [
  strongPasswordValidator,
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
];

const baseAccountValidation = [...identityValidation, ...passwordValidation];

// Shared by /google and the Google-assisted branch of /register/artist.
// Throws { status, message } on any verification failure.
async function verifyGoogleIdToken(credential) {
  if (!googleClient) throw { status: 503, message: "Google Sign-In is not configured on this server yet." };
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw { status: 401, message: "Invalid Google credential." };
  }
  if (!payload.email_verified) {
    throw { status: 403, message: "Your Google email address isn't verified." };
  }
  return payload;
}

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
  registerLimiter,
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
  registerLimiter,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "portfolioImages", maxCount: 8 },
  ]),
  identityValidation,
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
        password,
        googleCredential,
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
      let { email } = req.body;

      // Two ways to prove account ownership: a password (validated here,
      // manually, since the declarative validator above is skipped for the
      // Google-assisted path) or a verified Google credential. Never both.
      let passwordHash = null;
      let googleId = null;
      if (googleCredential) {
        const payload = await verifyGoogleIdToken(googleCredential);
        email = payload.email; // trust the verified token, not the form field
        googleId = payload.sub;
      } else {
        if (!isStrongPassword(password)) {
          return res.status(400).json({
            message:
              "Password must be at least 10 characters and include at least 3 of: lowercase, uppercase, numbers, and symbols.",
          });
        }
        if (password !== req.body.confirmPassword) {
          return res.status(400).json({ message: "Passwords do not match." });
        }
        passwordHash = await bcrypt.hash(password, 12);
      }

      await assertUniqueAccount(username, email);

      const user = await User.create(
        {
          role: "artist",
          status: "pending_approval",
          firstName,
          lastName,
          username,
          email,
          passwordHash,
          authProvider: googleCredential ? "google" : "local",
          googleId,
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
  loginLimiter,
  body("identifier").trim().notEmpty().withMessage("Email or username is required."),
  body("password").notEmpty().withMessage("Password is required."),
  checkValidation,
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body;
      const user = await User.findOne({
        where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
      });
      // Same message whether the account doesn't exist or the password is
      // wrong — don't let the response leak which emails/usernames are real.
      const invalidCredsResponse = () =>
        res.status(401).json({ message: "Invalid email/username or password." });

      if (!user) return invalidCredsResponse();

      if (user.authProvider === "google" && !user.passwordHash) {
        return res.status(400).json({
          message: "This account signs in with Google. Use the \"Continue with Google\" button.",
        });
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
        return res.status(429).json({
          message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        const attempts = user.failedLoginAttempts + 1;
        const lockingNow = attempts >= MAX_FAILED_LOGIN_ATTEMPTS;
        await user.update({
          failedLoginAttempts: lockingNow ? 0 : attempts,
          lockedUntil: lockingNow ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
        });
        return invalidCredsResponse();
      }

      if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await user.update({ failedLoginAttempts: 0, lockedUntil: null });
      }

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
  registerLimiter,
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
  registerLimiter,
  body("token").notEmpty().withMessage("Reset token is required."),
  strongPasswordValidator,
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
      user.authProvider = "local";
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();

      record.used = true;
      await record.save();

      res.json({ message: "Your password has been reset. You can now log in." });
    } catch (err) {
      next(err);
    }
  }
);

// ---------- Google Sign-In (login or registration, same flow) ----------
// `role` distinguishes intent for a BRAND NEW account only (existing users
// always just log in, regardless of what's passed):
//   - "customer": create the account immediately (used by the customer
//     registration page, where intent is unambiguous).
//   - "artist": don't create anything — hand back the verified profile so
//     the frontend can route into the artist application form, which still
//     needs bio/portfolio/etc. before an account exists.
//   - omitted: intent is unknown (the Login page's Google button) — respond
//     with needsRoleChoice so the frontend can ask, then call this again
//     with an explicit role.
router.post(
  "/google",
  loginLimiter,
  body("credential").notEmpty().withMessage("Missing Google credential."),
  checkValidation,
  async (req, res, next) => {
    try {
      const payload = await verifyGoogleIdToken(req.body.credential);
      const { role } = req.body;

      let user = await User.findOne({ where: { googleId: payload.sub } });

      if (!user) {
        // Email already registered locally (or via a different flow) — link
        // this Google identity to it instead of creating a duplicate account.
        // Google having verified the email address is what makes this safe.
        user = await User.findOne({ where: { email: payload.email } });
        if (user && !user.googleId) await user.update({ googleId: payload.sub });
      }

      if (!user) {
        const profile = {
          firstName: payload.given_name || "",
          lastName: payload.family_name || "",
          email: payload.email,
          picture: payload.picture || null,
        };

        if (role === "artist") {
          return res.json({ needsArtistApplication: true, profile });
        }
        if (role !== "customer") {
          return res.json({ needsRoleChoice: true, profile });
        }

        const t = await sequelize.transaction();
        try {
          const username = await uniqueUsernameFromEmail(payload.email);
          user = await User.create(
            {
              role: "customer",
              status: "active",
              firstName: profile.firstName || "New",
              lastName: profile.lastName || "User",
              username,
              email: payload.email,
              passwordHash: null,
              authProvider: "google",
              googleId: payload.sub,
              profileImage: profile.picture,
            },
            { transaction: t }
          );
          await CustomerProfile.create({ userId: user.id }, { transaction: t });
          await t.commit();
        } catch (err) {
          await t.rollback();
          throw err;
        }
      }

      if (user.status === "suspended") {
        return res.status(403).json({ message: "This account has been suspended." });
      }
      if (user.status === "pending_approval") {
        return res.status(403).json({
          message: "Your artist application is still pending admin approval.",
        });
      }
      if (user.status === "rejected") {
        return res.status(403).json({
          message: `Your artist application was not approved. Reason: ${
            user.rejectionReason || "No reason provided."
          }`,
        });
      }

      const token = signToken(user);
      res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  }
);

async function uniqueUsernameFromEmail(email) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
  let candidate = base;
  let suffix = 0;
  while (await User.findOne({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

function sanitizeUser(user) {
  const { id, role, status, firstName, lastName, username, email, phone, profileImage } = user;
  return { id, role, status, firstName, lastName, username, email, phone, profileImage };
}

module.exports = router;
