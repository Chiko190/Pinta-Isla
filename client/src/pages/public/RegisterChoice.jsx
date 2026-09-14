import { Link } from "react-router-dom";

export default function RegisterChoice() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-center font-display text-2xl font-bold text-ink-950">Create Account As</h1>
      <p className="mt-1 text-center text-sm text-ink-950/55">Choose the account type that fits you.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <ChoiceCard
          to="/register/customer"
          icon="🖼️"
          title="Customer"
          description="Browse, collect, and commission original artwork from talented artists."
        />
        <ChoiceCard
          to="/register/artist"
          icon="🎨"
          title="Artist"
          description="Sell your paintings, build your portfolio, and accept custom commissions."
        />
      </div>

      <p className="mt-8 text-center text-sm text-ink-950/55">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-ink-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function ChoiceCard({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-ink-950/10 bg-white p-7 text-center transition hover:-translate-y-1 hover:border-ink-700 hover:shadow-lg"
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-950">{title}</h3>
      <p className="mt-2 text-sm text-ink-950/60">{description}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-ink-700 group-hover:underline">Continue →</span>
    </Link>
  );
}
