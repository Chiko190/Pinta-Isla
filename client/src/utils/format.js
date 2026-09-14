export function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`;
}

export function mainImage(artwork) {
  const images = artwork?.images || [];
  const main = images.find((i) => i.isMain) || images[0];
  return main?.url || null;
}

export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
