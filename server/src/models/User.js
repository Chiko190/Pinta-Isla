const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  role: {
    type: DataTypes.ENUM("customer", "artist", "admin"),
    allowNull: false,
  },
  status: {
    // active | pending_approval | rejected | suspended
    type: DataTypes.ENUM("active", "pending_approval", "rejected", "suspended"),
    allowNull: false,
    defaultValue: "active",
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  // Null for accounts created via Google Sign-In (no password to compare against).
  passwordHash: { type: DataTypes.STRING, allowNull: true },
  authProvider: {
    type: DataTypes.ENUM("local", "google"),
    allowNull: false,
    defaultValue: "local",
  },
  // Not a DB-level unique constraint: SQLite can't ALTER TABLE ADD a UNIQUE
  // column (breaks every existing local dev database on upgrade), and
  // Google's `sub` claim is already guaranteed unique upstream — the lookup
  // in the /google route (find-then-create) is what actually prevents
  // duplicate accounts.
  googleId: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  profileImage: { type: DataTypes.STRING },
  rejectionReason: { type: DataTypes.TEXT },
  isSeed: { type: DataTypes.BOOLEAN, defaultValue: false },
  failedLoginAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  lockedUntil: { type: DataTypes.DATE, allowNull: true },
}, {
  indexes: [{ fields: ["googleId"] }],
});

module.exports = User;
