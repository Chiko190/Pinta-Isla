export default function EmptyState({ icon = "🎨", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-950/15 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-ink-950">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-950/60">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
