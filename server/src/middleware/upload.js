const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, or WEBP images are allowed."));
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Centralizes how an uploaded file's public URL is built. Local disk storage
// today (Render's free tier wipes it on redeploy) — swapping to Cloudinary/S3
// later only means changing `storage` above and this function, not every route.
function fileUrl(file) {
  return file ? `/uploads/${file.filename}` : null;
}

module.exports = upload;
module.exports.fileUrl = fileUrl;
