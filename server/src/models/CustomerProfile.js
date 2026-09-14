const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const CustomerProfile = sequelize.define("CustomerProfile", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  province: { type: DataTypes.STRING },
});

module.exports = CustomerProfile;
