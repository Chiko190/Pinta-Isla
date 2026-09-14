import { Link } from "react-router-dom";
import { formatPrice, mainImage } from "../../utils/format";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";

export default function ArtworkCard({ artwork, wishlisted, onToggleWishlist }) {
  const { user } = useAuth();
  const img = mainImage(artwork);
  const artist = artwork.ArtistProfile;

  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-50">
        <Link to={`/artworks/${artwork.id}`}>
          {img ? (
            <img
              src={img}
              alt={artwork.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-950/30">No image</div>
          )}
        </Link>

        {artwork.status === "sold" && (
          <Badge tone="neutral" className="absolute left-3 top-3 bg-ink-950/80 text-white">
            Sold
          </Badge>
        )}

        {user?.role === "customer" && (
          <button
            onClick={() => onToggleWishlist?.(artwork.id)}
            aria-label="Toggle wishlist"
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 ${
              wishlisted ? "text-accent-red" : "text-ink-950/40"
            }`}
          >
            {wishlisted ? "♥" : "♡"}
          </button>
        )}

        <Link
          to={`/artworks/${artwork.id}`}
          className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-white/95 py-2 text-center text-xs font-semibold text-ink-950 opacity-0 shadow-sm transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Quick View
        </Link>
      </div>

      <div className="mt-3">
        <Link to={`/artworks/${artwork.id}`} className="line-clamp-2 font-display text-[15px] font-semibold text-ink-950 hover:text-ink-700">
          {artwork.title}
        </Link>
        {artist && (
          <Link
            to={`/artists/${artist.id}`}
            className="mt-0.5 block text-xs text-ink-950/55 hover:text-ink-700"
          >
            {artist.artistName} {artist.verified && <span title="Verified artist">✓</span>}
          </Link>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-ink-700">
            {formatPrice(artwork.price)}
          </span>
          {artwork.medium && <span className="text-[11px] text-ink-950/45">{artwork.medium}</span>}
        </div>
      </div>
    </div>
  );
}
