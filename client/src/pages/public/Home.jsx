import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedArtworks, getFeaturedArtists, getCategories } from "../../api/marketplace";
import { toggleWishlist, getWishlist } from "../../api/customer";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import ArtistCard from "../../components/artist/ArtistCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { CardGridSkeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";

const ACCENT_DOTS = ["accent-red", "accent-purple", "accent-orange", "accent-yellow", "accent-lime", "accent-green", "accent-teal"];

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState(null);
  const [artists, setArtists] = useState(null);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  useEffect(() => {
    getFeaturedArtworks().then((r) => setFeatured(r.data));
    getFeaturedArtists().then((r) => setArtists(r.data.artists));
    getCategories().then((r) => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    if (user?.role === "customer") {
      getWishlist().then((r) => setWishlistIds(new Set(r.data.items.map((a) => a.id))));
    }
  }, [user]);

  async function handleToggleWishlist(artworkId) {
    if (!user) return;
    try {
      const res = await toggleWishlist(artworkId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.data.wishlisted) next.add(artworkId);
        else next.delete(artworkId);
        return next;
      });
    } catch {
      // Silently ignore — the heart just won't toggle; no need to interrupt browsing.
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, var(--color-accent-teal), transparent 35%), radial-gradient(circle at 85% 15%, var(--color-accent-yellow), transparent 30%), radial-gradient(circle at 75% 80%, var(--color-accent-purple), transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-accent-yellow">
            Pinta Isla Marketplace
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Discover Art. Support Artists.
            <br />
            Own Something Original.
          </h1>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button as={Link} to="/artworks" size="lg">
              Explore Artworks
            </Button>
            <Button as={Link} to="/artists" variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
              Meet Artists
            </Button>
            <Button as={Link} to="/commissions" variant="ghost" size="lg" className="text-white/80 hover:bg-white/10">
              Commission Artwork
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Featured Artworks */}
        <Section title="Featured Artworks" subtitle="Fresh, original pieces from our artist community" cta={{ to: "/artworks", label: "View all" }}>
          {!featured ? (
            <CardGridSkeleton />
          ) : featured.newArrivals.length === 0 ? (
            <EmptyState title="No artworks yet" description="Check back soon — artists are still setting up their studios." />
          ) : (
            <Grid>
              {featured.newArrivals.slice(0, 8).map((a) => (
                <ArtworkCard key={a.id} artwork={a} wishlisted={wishlistIds.has(a.id)} onToggleWishlist={handleToggleWishlist} />
              ))}
            </Grid>
          )}
        </Section>

        {/* Featured Artists */}
        <Section title="Featured Artists" subtitle="Meet the painters behind the work" cta={{ to: "/artists", label: "View all" }}>
          {!artists ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-950/8" />
              ))}
            </div>
          ) : artists.length === 0 ? (
            <EmptyState title="No artists yet" description="Artist applications are reviewed by our team before they appear here." />
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {artists.map((a) => (
                <ArtistCard key={a.id} artist={a} />
              ))}
            </div>
          )}
        </Section>

        {/* Categories */}
        <Section title="Browse Categories" subtitle="Find the style that speaks to you">
          {categories.length === 0 ? (
            <EmptyState title="No categories yet" />
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  to={`/artworks?category=${c.slug}`}
                  className="group flex items-center gap-2 rounded-full border border-ink-950/10 bg-white px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:border-ink-700 hover:text-ink-700"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: `var(--color-${ACCENT_DOTS[i % ACCENT_DOTS.length]})` }}
                  />
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* Popular */}
        {featured?.popular?.length > 0 && (
          <Section title="Popular Artworks" subtitle="Loved by the community">
            <Grid>
              {featured.popular.slice(0, 8).map((a) => (
                <ArtworkCard key={a.id} artwork={a} wishlisted={wishlistIds.has(a.id)} onToggleWishlist={handleToggleWishlist} />
              ))}
            </Grid>
          </Section>
        )}
      </div>

      {/* Commission CTA */}
      <section className="mt-8 bg-ink-100 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-ink-950">
            Have an Idea? Let an Artist Create It.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-950/60">
            Commission a custom painting — a family portrait, your pet, your home, or a concept only you can imagine.
          </p>
          <Button as={Link} to="/commissions" size="lg" className="mt-7">
            Request a Custom Painting
          </Button>
        </div>
      </section>
    </div>
  );
}

function Section({ title, subtitle, cta, children }) {
  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-950/55">{subtitle}</p>}
        </div>
        {cta && (
          <Link to={cta.to} className="hidden text-sm font-semibold text-ink-700 hover:underline sm:block">
            {cta.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">{children}</div>;
}
