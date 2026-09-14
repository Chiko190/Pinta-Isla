const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const AdminLog = sequelize.define("AdminLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  action: { type: DataTypes.STRING, allowNull: false },
  targetType: { type: DataTypes.STRING },
  targetId: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT },
});

module.exports = AdminLog;
