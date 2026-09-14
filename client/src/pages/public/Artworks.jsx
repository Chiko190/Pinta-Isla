import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getArtworks, getCategories } from "../../api/marketplace";
import { getWishlist, toggleWishlist } from "../../api/customer";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import { CardGridSkeleton } from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { Select } from "../../components/ui/Field";
import { useAuth } from "../../context/AuthContext";

const PRICE_RANGES = [
  { label: "Any price", min: "", max: "" },
  { label: "Under ₱1,000", min: "", max: "1000" },
  { label: "₱1,000 – ₱5,000", min: "1000", max: "5000" },
  { label: "₱5,000 – ₱10,000", min: "5000", max: "10000" },
  { label: "₱10,000+", min: "10000", max: "" },
];
const MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Charcoal", "Pastel", "Mixed Media", "Digital", "Other"];
const STYLES = ["Realism", "Abstract", "Impressionism", "Modern", "Traditional", "Minimalist", "Other"];

export default function Artworks() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const filters = useMemo(
    () => ({
      q: params.get("q") || "",
      category: params.get("category") || "",
      medium: params.get("medium") || "",
      style: params.get("style") || "",
      availability: params.get("availability") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      sort: params.get("sort") || "newest",
      page: params.get("page") || "1",
    }),
    [params]
  );

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    getArtworks(filters)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    if (user?.role === "customer") {
      getWishlist().then((r) => setWishlistIds(new Set(r.data.items.map((a) => a.id))));
    }
  }, [user]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  }

  function setPage(page) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

  const activeRange = PRICE_RANGES.find((r) => r.min === filters.minPrice && r.max === filters.maxPrice) || PRICE_RANGES[0];
  const hasActiveFilters = filters.q || filters.category || filters.medium || filters.style || filters.availability || filters.minPrice || filters.maxPrice;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-950">Artworks</h1>
        <p className="mt-1 text-sm text-ink-950/55">Browse original paintings and prints from our artists.</p>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          value={filters.q}
          onChange={(e) => updateFilter("q", e.target.value)}
          placeholder="Search by title, medium, or style…"
          className="flex-1 rounded-full border border-ink-950/15 bg-white px-5 py-3 text-sm outline-none focus:border-ink-700"
        />
        <Select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)} className="w-full sm:w-52">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </Select>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="space-y-7 lg:w-64 lg:shrink-0">
          <FilterGroup label="Category">
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.category} onClick={() => updateFilter("category", "")}>All</Chip>
              {categories.map((c) => (
                <Chip key={c.id} active={filters.category === c.slug} onClick={() => updateFilter("category", c.slug)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Price">
            <div className="flex flex-col gap-1.5">
              {PRICE_RANGES.map((r) => (
                <label key={r.label} className="flex items-center gap-2 text-sm text-ink-950/75">
                  <input
                    type="radio"
                    checked={activeRange.label === r.label}
                    onChange={() => {
                      const next = new URLSearchParams(params);
                      if (r.min) next.set("minPrice", r.min); else next.delete("minPrice");
                      if (r.max) next.set("maxPrice", r.max); else next.delete("maxPrice");
                      next.delete("page");
                      setParams(next);
                    }}
                    className="accent-ink-700"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Medium">
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.medium} onClick={() => updateFilter("medium", "")}>All</Chip>
              {MEDIUMS.map((m) => (
                <Chip key={m} active={filters.medium === m} onClick={() => updateFilter("medium", m)}>{m}</Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Style">
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.style} onClick={() => updateFilter("style", "")}>All</Chip>
              {STYLES.map((s) => (
                <Chip key={s} active={filters.style === s} onClick={() => updateFilter("style", s)}>{s}</Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Availability">
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.availability} onClick={() => updateFilter("availability", "")}>All</Chip>
              <Chip active={filters.availability === "available"} onClick={() => updateFilter("availability", "available")}>Available</Chip>
              <Chip active={filters.availability === "sold"} onClick={() => updateFilter("availability", "sold")}>Sold</Chip>
            </div>
          </FilterGroup>

          {hasActiveFilters && (
            <button onClick={() => setParams({})} className="text-sm font-medium text-ink-700 hover:underline">
              Clear all filters
            </button>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <CardGridSkeleton count={9} />
          ) : data?.artworks?.length === 0 ? (
            <EmptyState
              title="No artworks found"
              description="Try adjusting or clearing your filters."
              action={hasActiveFilters && <Button variant="outline" onClick={() => setParams({})}>Clear filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                {data.artworks.map((a) => (
                  <ArtworkCard key={a.id} artwork={a} wishlisted={wishlistIds.has(a.id)} onToggleWishlist={handleToggleWishlist} />
                ))}
              </div>

              {data.pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-9 w-9 rounded-full text-sm font-medium ${
                        data.pagination.page === i + 1 ? "bg-ink-700 text-white" : "text-ink-950/60 hover:bg-ink-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-950/45">{label}</h4>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? "border-ink-700 bg-ink-700 text-white" : "border-ink-950/15 text-ink-950/70 hover:border-ink-700"
      }`}
    >
      {children}
    </button>
  );
}
