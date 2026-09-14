const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PortfolioItem = sequelize.define("PortfolioItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  image: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  medium: { type: DataTypes.STRING },
  year: { type: DataTypes.INTEGER },
});

module.exports = PortfolioItem;
