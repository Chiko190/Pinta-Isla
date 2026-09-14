function scorePassword(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-accent-red", "bg-accent-orange", "bg-accent-yellow", "bg-accent-lime", "bg-accent-green"];

export default function PasswordStrength({ password }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? COLORS[score] : "bg-ink-950/10"}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-950/50">{LABELS[score]}</p>
    </div>
  );
}
