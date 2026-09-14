const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Wishlist = sequelize.define("Wishlist", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

module.exports = Wishlist;
