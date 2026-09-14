require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  // alter:true is NOT safe here: on SQLite, Sequelize rebuilds an altered
  // table by copying it to a temp table and dropping the original — dropping
  // a table cascades to every table with a foreign key onDelete: "CASCADE"
  // pointing at it (ArtistProfile, CustomerProfile, Wishlist, Follow,
  // Notification, PasswordResetToken all cascade off User), wiping their
  // rows even though nothing about them changed. Plain sync() only creates
  // tables that don't exist yet; new columns on an existing table need a
  // real migration (or, pre-launch, a one-off manual alter).
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Pinta Isla API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
