const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");
const customerRoutes = require("./routes/customer.routes");
const artistRoutes = require("./routes/artist.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// When the client is built into ../client/dist (Render's single-service deploy),
// the API and the frontend are served from the same origin — no CORS needed for
// that path. CLIENT_ORIGIN stays as a fallback for a split (Vercel) deployment.
const clientDistPath = path.join(__dirname, "..", "..", "client", "dist");
const servingClientBuild = fs.existsSync(clientDistPath);

app.use(helmet({ crossOriginResourcePolicy: false }));
if (!servingClientBuild) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
}
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/artist", artistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

if (servingClientBuild) {
  app.use(express.static(clientDistPath));
  // SPA fallback: any non-API GET (e.g. a deep link to /artworks/5) returns
  // index.html so React Router can take over client-side.
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

app.use(errorHandler);

module.exports = app;
