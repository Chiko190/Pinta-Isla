const { validationResult } = require("express-validator");

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
}

// Centralized handler: log the real error server-side, never leak internals to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "That value is already in use." });
  }
  if (err.name === "MulterError" || /images? (are|is) allowed/i.test(err.message || "")) {
    return res.status(400).json({ message: err.message || "Unable to upload file." });
  }

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Something went wrong. Please try again.",
  });
}

module.exports = { checkValidation, errorHandler };
