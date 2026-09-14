export default function StatCard({ label, value, tone = "default" }) {
  return (
    <div className="rounded-2xl border border-ink-950/8 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-950/45">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-bold ${tone === "accent" ? "text-ink-700" : "text-ink-950"}`}>
        {value}
      </p>
    </div>
  );
}
