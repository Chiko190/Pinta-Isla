import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-2xl font-bold text-ink-950">Forgot your password?</h1>
      <p className="mt-1 text-sm text-ink-950/55">Enter your email and we'll help you reset it.</p>

      {result ? (
        <div className="mt-7 space-y-4">
          <p className="rounded-lg bg-accent-green/10 px-4 py-3 text-sm text-accent-green">{result.message}</p>
          {result.devResetToken && (
            <div className="rounded-lg border border-dashed border-ink-950/20 p-4 text-sm">
              <p className="font-medium text-ink-950/70">Development mode — no email service is connected yet.</p>
              <p className="mt-1 text-ink-950/60">Use this link to continue:</p>
              <Link to={`/reset-password?token=${result.devResetToken}`} className="mt-1 block break-all font-medium text-ink-700 hover:underline">
                Reset your password →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Field label="Email Address" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Link</Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-950/60">
        <Link to="/login" className="font-semibold text-ink-700 hover:underline">Back to log in</Link>
      </p>
    </div>
  );
}
