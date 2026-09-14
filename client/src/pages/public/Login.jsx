import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";

export default function Login() {
  const { loginWithToken, homeFor, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(identifier, password);
      loginWithToken(res.data.token, res.data.user);
      const dest = location.state?.from?.pathname || homeFor(res.data.user.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSuccess = useCallback(
    (token, user) => {
      setError(null);
      loginWithToken(token, user);
      const dest = location.state?.from?.pathname || homeFor(user.role);
      navigate(dest, { replace: true });
    },
    [loginWithToken, homeFor, navigate, location]
  );

  const handleGoogleError = useCallback((message) => setError(message), []);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-ink-950">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-950/55">Log in to continue to Pinta Isla.</p>

      {sessionMessage && (
        <div className="mt-4 rounded-lg bg-accent-yellow/15 px-4 py-3 text-sm text-[#7a5c0c]">
          {sessionMessage}
          <button onClick={clearSessionMessage} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {googleEnabled && (
        <>
          <div className="mt-7">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>
          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-950/40">
            <div className="h-px flex-1 bg-ink-950/10" />
            Or log in with email
            <div className="h-px flex-1 bg-ink-950/10" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className={googleEnabled ? "space-y-4" : "mt-7 space-y-4"}>
        <Field label="Email or Username" required>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoFocus />
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-950/70">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-ink-700" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-ink-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-950/60">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-ink-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
