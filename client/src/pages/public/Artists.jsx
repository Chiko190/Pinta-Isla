import { useEffect, useState } from "react";
import { getArtists } from "../../api/marketplace";
import ArtistCard from "../../components/artist/ArtistCard";
import EmptyState from "../../components/ui/EmptyState";

export default function Artists() {
  const [artists, setArtists] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      getArtists({ q }).then((r) => setArtists(r.data.artists));
    }, 250);
    return () => clearTimeout(timeout);
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-ink-950">Artists</h1>
      <p className="mt-1 text-sm text-ink-950/55">Meet the painters and creators of Pinta Isla.</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search artists by name…"
        className="mt-6 w-full max-w-sm rounded-full border border-ink-950/15 bg-white px-5 py-3 text-sm outline-none focus:border-ink-700"
      />

      <div className="mt-8">
        {artists === null ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-950/8" />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <EmptyState title="No artists found" description="Try a different search term." />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {artists.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
