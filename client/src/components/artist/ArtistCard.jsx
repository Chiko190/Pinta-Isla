import { Link } from "react-router-dom";

export default function ArtistCard({ artist }) {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="group flex flex-col items-center rounded-2xl border border-ink-950/8 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-20 w-20 overflow-hidden rounded-full bg-ink-50 ring-2 ring-white ring-offset-2 ring-offset-ink-100">
        {artist.profileImage ? (
          <img src={artist.profileImage} alt={artist.artistName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-950/30">🎨</div>
        )}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-ink-950">
        {artist.artistName} {artist.verified && <span title="Verified artist" className="text-ink-700">✓</span>}
      </h3>
      <p className="mt-0.5 text-xs text-ink-950/55">{artist.style || "Mixed media"}</p>
      <p className="text-xs text-ink-950/40">{artist.location}</p>
      <p className="mt-2 text-xs font-medium text-ink-700">{artist.artworkCount ?? 0} artworks</p>
    </Link>
  );
}
