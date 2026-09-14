const TONES = {
  neutral: "bg-ink-950/5 text-ink-950/70",
  blue: "bg-ink-100 text-ink-700",
  red: "bg-accent-red/10 text-accent-red",
  orange: "bg-accent-orange/10 text-accent-orange",
  yellow: "bg-accent-yellow/15 text-[#8a6a0e]",
  green: "bg-accent-green/10 text-accent-green",
  teal: "bg-accent-teal/15 text-[#116566]",
  purple: "bg-accent-purple/10 text-accent-purple",
};

export default function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
