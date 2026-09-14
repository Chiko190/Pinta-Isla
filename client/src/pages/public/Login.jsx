import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, googleAuth } from "../../api/auth";
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
  const [googleChoice, setGoogleChoice] = useState(null); // { profile, credential } while awaiting role pick
  const [googleChoiceLoading, setGoogleChoiceLoading] = useState(false);

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
  const handleNeedsRoleChoice = useCallback((profile, credential) => {
    setError(null);
    setGoogleChoice({ profile, credential });
  }, []);

  async function chooseCustomer() {
    setGoogleChoiceLoading(true);
    try {
      const res = await googleAuth(googleChoice.credential, "customer");
      handleGoogleSuccess(res.data.token, res.data.user);
    } catch (err) {
      setError(err.message);
      setGoogleChoice(null);
    } finally {
      setGoogleChoiceLoading(false);
    }
  }

  function chooseArtist() {
    navigate("/register/artist", { state: { googlePrefill: { ...googleChoice.profile, credential: googleChoice.credential } } });
  }

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

      {googleEnabled && googleChoice && (
        <div className="mt-7 rounded-xl border border-ink-950/10 bg-white p-5 text-center">
          <p className="text-sm text-ink-950/70">
            Welcome, {googleChoice.profile.firstName || googleChoice.profile.email}! This is your first time
            signing in with Google — how do you want to use Pinta Isla?
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={chooseCustomer} loading={googleChoiceLoading} className="flex-1">
              Continue as Customer
            </Button>
            <Button variant="outline" onClick={chooseArtist} className="flex-1">
              Continue as Artist
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setGoogleChoice(null)}
            className="mt-3 text-xs font-medium text-ink-950/45 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {googleEnabled && !googleChoice && (
        <>
          <div className="mt-7">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onNeedsRoleChoice={handleNeedsRoleChoice}
              onError={handleGoogleError}
            />
          </div>
          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-950/40">
            <div className="h-px flex-1 bg-ink-950/10" />
            Or log in with email
            <div className="h-px flex-1 bg-ink-950/10" />
          </div>
        </>
      )}

      {(!googleEnabled || !googleChoice) && (
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

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log In
        </Button>
      </form>
      )}

      {error && <p className="mt-4 rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

      <p className="mt-6 text-center text-sm text-ink-950/60">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-ink-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
