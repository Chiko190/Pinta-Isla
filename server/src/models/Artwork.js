const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Artwork = sequelize.define("Artwork", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  displayId: { type: DataTypes.STRING, allowNull: false, unique: true }, // ART-000001
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  story: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  type: {
    type: DataTypes.ENUM("original", "print", "commission"),
    defaultValue: "original",
  },
  medium: { type: DataTypes.STRING },
  style: { type: DataTypes.STRING },
  width: { type: DataTypes.FLOAT },
  height: { type: DataTypes.FLOAT },
  unit: { type: DataTypes.STRING, defaultValue: "in" },
  yearCreated: { type: DataTypes.INTEGER },
  framed: { type: DataTypes.BOOLEAN, defaultValue: false },
  weight: { type: DataTypes.FLOAT },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  shippingInfo: { type: DataTypes.TEXT },
  status: {
    // draft | pending_review | approved | rejected | available | sold | hidden
    type: DataTypes.ENUM(
      "draft",
      "pending_review",
      "approved",
      "rejected",
      "available",
      "sold",
      "hidden"
    ),
    defaultValue: "pending_review",
  },
  rejectionReason: { type: DataTypes.TEXT },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  likeCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isSeed: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Artwork;
