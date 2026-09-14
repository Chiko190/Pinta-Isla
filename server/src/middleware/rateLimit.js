const rateLimit = require("express-rate-limit");

// Keyed by IP (Express derives this from X-Forwarded-For once "trust proxy"
// is set, which app.js does — required for this to work correctly on Render).

// Brute-force guard for login: generous enough for a real user mistyping a
// password, tight enough to make credential-stuffing impractical.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
});

// Registration / password-reset abuse guard (fake-account spam, email-bombing
// the forgot-password endpoint).
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

module.exports = { loginLimiter, registerLimiter };
