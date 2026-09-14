import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../../api/marketplace";
import EmptyState from "../../components/ui/EmptyState";

const ACCENTS = ["accent-red", "accent-purple", "accent-orange", "accent-yellow", "accent-lime", "accent-green", "accent-teal"];

export default function Categories() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.categories));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold text-ink-950">Categories</h1>
      <p className="mt-1 text-sm text-ink-950/55">Browse artworks by category.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories === null ? (
          <p className="text-sm text-ink-950/50">Loading…</p>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/artworks?category=${c.slug}`}
              className="rounded-2xl border border-ink-950/8 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="h-2.5 w-2.5 rounded-full inline-block mb-3" style={{ backgroundColor: `var(--color-${ACCENTS[i % ACCENTS.length]})` }} />
              <h3 className="font-display font-semibold text-ink-950">{c.name}</h3>
              {c.description && <p className="mt-1 text-xs text-ink-950/50">{c.description}</p>}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
