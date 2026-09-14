const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ArtistProfile = sequelize.define("ArtistProfile", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  displayId: { type: DataTypes.STRING, allowNull: false, unique: true }, // ARTIST-000001
  artistName: { type: DataTypes.STRING, allowNull: false },
  bio: { type: DataTypes.TEXT },
  statement: { type: DataTypes.TEXT },
  specialization: { type: DataTypes.STRING },
  style: { type: DataTypes.STRING },
  medium: { type: DataTypes.STRING },
  yearsExperience: { type: DataTypes.INTEGER },
  intro: { type: DataTypes.TEXT },
  location: { type: DataTypes.STRING },
  coverImage: { type: DataTypes.STRING },
  socialLinks: {
    type: DataTypes.TEXT,
    defaultValue: "{}",
    get() {
      const raw = this.getDataValue("socialLinks");
      try {
        return JSON.parse(raw || "{}");
      } catch {
        return {};
      }
    },
    set(value) {
      this.setDataValue("socialLinks", JSON.stringify(value || {}));
    },
  },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  rejectionReason: { type: DataTypes.TEXT },
});

module.exports = ArtistProfile;
