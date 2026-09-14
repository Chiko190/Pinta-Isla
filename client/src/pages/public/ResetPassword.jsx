import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import PasswordStrength from "../../components/ui/PasswordStrength";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword({ token, password, confirmPassword });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-ink-950/70">This reset link is missing a token.</p>
        <Link to="/forgot-password" className="mt-3 inline-block font-medium text-ink-700 hover:underline">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-2xl font-bold text-ink-950">Reset your password</h1>

      {done ? (
        <p className="mt-7 rounded-lg bg-accent-green/10 px-4 py-3 text-sm text-accent-green">
          Your password has been reset. Redirecting to log in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <Field label="New Password" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <PasswordStrength password={password} />
          </Field>
          <Field label="Confirm Password" required error={confirmPassword && confirmPassword !== password ? "Passwords do not match." : null}>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Field>
          {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Reset Password</Button>
        </form>
      )}
    </div>
  );
}
