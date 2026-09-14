require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 4000;

async function start() {
  await sequelize.authenticate();
  // alter:true lets new columns (e.g. Google Sign-In fields) get added to an
  // existing table without a manual migration — fine while this project has
  // no production data yet; switch to real migrations before that changes.
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`Pinta Isla API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
