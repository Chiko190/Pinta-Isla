// Generates human-readable, zero-padded sequential IDs (ART-000001, ARTIST-000001).
// Uses the highest existing numeric suffix (not a row count) so deletions never
// cause a collision, and runs inside the caller's transaction for atomicity.
async function nextDisplayId(model, prefix, transaction) {
  const last = await model.findOne({
    order: [["id", "DESC"]],
    transaction,
  });
  let nextNumber = 1;
  if (last && last.displayId) {
    const match = last.displayId.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(nextNumber).padStart(6, "0")}`;
}

module.exports = { nextDisplayId };
