const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PasswordResetToken = sequelize.define("PasswordResetToken", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  token: { type: DataTypes.STRING, allowNull: false, unique: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = PasswordResetToken;
