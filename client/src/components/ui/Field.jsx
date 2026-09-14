export function Field({ label, error, hint, required, children }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-950">
          {label} {required && <span className="text-accent-red">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-950/50">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-accent-red">{error}</span>}
    </label>
  );
}

const baseInput =
  "w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-ink-950/35 outline-none transition focus:border-ink-700 focus:ring-2 focus:ring-ink-700/15";

export function Input(props) {
  return <input className={baseInput} {...props} />;
}

export function TextArea(props) {
  return <textarea className={`${baseInput} min-h-24 resize-y`} {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className={baseInput} {...props}>
      {children}
    </select>
  );
}
