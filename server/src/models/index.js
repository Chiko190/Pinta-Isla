const sequelize = require("../db");

const User = require("./User");
const CustomerProfile = require("./CustomerProfile");
const ArtistProfile = require("./ArtistProfile");
const PortfolioItem = require("./PortfolioItem");
const Category = require("./Category");
const Artwork = require("./Artwork");
const ArtworkImage = require("./ArtworkImage");
const Wishlist = require("./Wishlist");
const Follow = require("./Follow");
const AdminLog = require("./AdminLog");
const Notification = require("./Notification");
const PasswordResetToken = require("./PasswordResetToken");

// User <-> CustomerProfile (1:1)
User.hasOne(CustomerProfile, { foreignKey: "userId", onDelete: "CASCADE" });
CustomerProfile.belongsTo(User, { foreignKey: "userId" });

// User <-> ArtistProfile (1:1)
User.hasOne(ArtistProfile, { foreignKey: "userId", onDelete: "CASCADE" });
ArtistProfile.belongsTo(User, { foreignKey: "userId" });

// ArtistProfile -> PortfolioItem (1:N)
ArtistProfile.hasMany(PortfolioItem, { foreignKey: "artistProfileId", onDelete: "CASCADE" });
PortfolioItem.belongsTo(ArtistProfile, { foreignKey: "artistProfileId" });

// ArtistProfile -> Artwork (1:N)
ArtistProfile.hasMany(Artwork, { foreignKey: "artistProfileId", onDelete: "CASCADE" });
Artwork.belongsTo(ArtistProfile, { foreignKey: "artistProfileId" });

// Category -> Artwork (1:N)
Category.hasMany(Artwork, { foreignKey: "categoryId" });
Artwork.belongsTo(Category, { foreignKey: "categoryId" });

// Artwork -> ArtworkImage (1:N)
Artwork.hasMany(ArtworkImage, { foreignKey: "artworkId", onDelete: "CASCADE", as: "images" });
ArtworkImage.belongsTo(Artwork, { foreignKey: "artworkId" });

// Wishlist: User <-> Artwork
User.belongsToMany(Artwork, { through: Wishlist, foreignKey: "userId", as: "wishlistedArtworks" });
Artwork.belongsToMany(User, { through: Wishlist, foreignKey: "artworkId", as: "wishlistedBy" });
Wishlist.belongsTo(User, { foreignKey: "userId" });
Wishlist.belongsTo(Artwork, { foreignKey: "artworkId" });

// Follow: User(customer) <-> ArtistProfile
User.belongsToMany(ArtistProfile, { through: Follow, foreignKey: "userId", as: "followedArtists" });
ArtistProfile.belongsToMany(User, { through: Follow, foreignKey: "artistProfileId", as: "followers" });
Follow.belongsTo(User, { foreignKey: "userId" });
Follow.belongsTo(ArtistProfile, { foreignKey: "artistProfileId" });

// AdminLog -> User (admin who performed it)
User.hasMany(AdminLog, { foreignKey: "adminUserId" });
AdminLog.belongsTo(User, { foreignKey: "adminUserId" });

// Notification -> User
User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "userId" });

// PasswordResetToken -> User
User.hasMany(PasswordResetToken, { foreignKey: "userId", onDelete: "CASCADE" });
PasswordResetToken.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  CustomerProfile,
  ArtistProfile,
  PortfolioItem,
  Category,
  Artwork,
  ArtworkImage,
  Wishlist,
  Follow,
  AdminLog,
  Notification,
  PasswordResetToken,
};
