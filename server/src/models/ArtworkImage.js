const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ArtworkImage = sequelize.define("ArtworkImage", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  url: { type: DataTypes.STRING, allowNull: false },
  isMain: { type: DataTypes.BOOLEAN, defaultValue: false },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = ArtworkImage;
