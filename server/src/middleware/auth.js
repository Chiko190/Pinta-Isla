const jwt = require("jsonwebtoken");
const { User, ArtistProfile } = require("../models");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: "Your session has expired." });
    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do that." });
    }
    next();
  };
}

// Gates the artist dashboard/routes for anyone with an approved seller
// application — a dedicated artist account (role === "artist", which can
// only log in once User.status is "active" anyway) or a customer account
// that separately applied to sell. role === "customer" is unaffected either
// way, so a dual-role user keeps full customer access regardless of their
// seller application's status.
async function requireApprovedArtist(req, res, next) {
  if (!req.user) return res.status(403).json({ message: "You don't have permission to do that." });
  if (req.user.role === "artist") return next();

  const profile = await ArtistProfile.findOne({ where: { userId: req.user.id } });
  if (profile && profile.status === "approved") {
    return next();
  }
  return res.status(403).json({ message: "You don't have permission to do that." });
}

module.exports = { signToken, requireAuth, requireRole, requireApprovedArtist };
