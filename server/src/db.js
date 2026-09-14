const path = require("path");
const { Sequelize } = require("sequelize");

// Single place that knows which DB engine we're on. Local dev uses a SQLite
// file with zero setup; production (Render, etc.) sets DATABASE_URL and we
// switch to Postgres automatically. Model files never reference the dialect.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: path.join(__dirname, "..", "data", "pintaisla.sqlite"),
      logging: false,
    });

module.exports = sequelize;
