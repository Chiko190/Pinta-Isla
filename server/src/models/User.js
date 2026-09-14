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
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  profileImage: { type: DataTypes.STRING },
  rejectionReason: { type: DataTypes.TEXT },
  isSeed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = User;
