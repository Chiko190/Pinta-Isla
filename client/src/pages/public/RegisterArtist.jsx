import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerArtist } from "../../api/auth";
import Button from "../../components/ui/Button";
import { Field, Input, TextArea, Select } from "../../components/ui/Field";
import PasswordStrength from "../../components/ui/PasswordStrength";
import { SingleImagePicker, MultiImagePicker } from "../../components/ui/ImagePicker";

const STEPS = ["Personal Info", "Artist Info", "Portfolio", "Agreement"];

const initial = {
  firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "",
  phone: "", location: "",
  artistName: "", bio: "", statement: "", specialization: "", style: "", medium: "",
  yearsExperience: "", intro: "",
  facebook: "", instagram: "", tiktok: "", website: "",
};

export default function RegisterArtist() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial);
  const [avatar, setAvatar] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioMeta, setPortfolioMeta] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setPortfolioFiles(files) {
    setPortfolio(files);
    setPortfolioMeta((prev) => files.map((_, i) => prev[i] || { title: "", description: "", medium: "", year: "" }));
  }

  function setMeta(i, key, value) {
    setPortfolioMeta((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  function validateStep() {
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) {
        return "Please fill in all required personal information.";
      }
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    if (step === 1 && !form.artistName) return "Artist name is required.";
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agreeAll) return setError("You must agree to the Marketplace Terms, Artist Guidelines, and Copyright Policy.");
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      ["firstName", "lastName", "username", "email", "password", "confirmPassword", "phone", "location",
        "artistName", "bio", "statement", "specialization", "style", "medium", "yearsExperience", "intro"]
        .forEach((k) => fd.append(k, form[k]));
      fd.append("agreeToTerms", "true");
      fd.append("agreeArtistTerms", "true");
      fd.append("socialLinks", JSON.stringify({
        facebook: form.facebook, instagram: form.instagram, tiktok: form.tiktok, website: form.website,
      }));
      if (avatar) fd.append("profileImage", avatar);
      portfolio.forEach((f) => fd.append("portfolioImages", f));
      fd.append("portfolioMeta", JSON.stringify(portfolioMeta));

      await registerArtist(fd);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-950">Application submitted!</h1>
        <p className="mt-3 text-ink-950/65">
          Your artist application has been submitted successfully. An administrator will review your application.
        </p>
        <Button as={Link} to="/" className="mt-8">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold text-ink-950">Apply as an Artist</h1>
      <p className="mt-1 text-sm text-ink-950/55">Your application will be reviewed by an administrator before your dashboard is activated.</p>

      <div className="mt-7 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-ink-700 text-white" : "bg-ink-950/10 text-ink-950/40"}`}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-ink-700" : "bg-ink-950/10"}`} />}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-950/45">{STEPS[step]}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <div className="flex items-center gap-5">
              <SingleImagePicker file={avatar} onChange={setAvatar} />
              <p className="text-xs text-ink-950/50">Optional profile picture.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
              <Field label="Last Name" required><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
            </div>
            <Field label="Username" required><Input value={form.username} onChange={(e) => set("username", e.target.value)} /></Field>
            <Field label="Email" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Password" required>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className="pr-16" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-700">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </Field>
            <Field label="Confirm Password" required><Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} /></Field>
            <Field label="Phone Number"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Location"><Input placeholder="City, Province" value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Artist Name" required><Input value={form.artistName} onChange={(e) => set("artistName", e.target.value)} /></Field>
            <Field label="Short Introduction"><Input value={form.intro} onChange={(e) => set("intro", e.target.value)} /></Field>
            <Field label="Artist Biography"><TextArea value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
            <Field label="Artist Statement"><TextArea value={form.statement} onChange={(e) => set("statement", e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Art Specialization"><Input placeholder="e.g. Portrait" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} /></Field>
              <Field label="Art Style"><Input placeholder="e.g. Realism" value={form.style} onChange={(e) => set("style", e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Medium"><Input placeholder="e.g. Oil on canvas" value={form.medium} onChange={(e) => set("medium", e.target.value)} /></Field>
              <Field label="Years of Experience"><Input type="number" min="0" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} /></Field>
            </div>
            <Field label="Facebook"><Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="Profile URL" /></Field>
            <Field label="Instagram"><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Profile URL" /></Field>
            <Field label="TikTok"><Input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="Profile URL" /></Field>
            <Field label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
          </>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm text-ink-950/60">Upload a few sample artworks for your portfolio (optional but recommended — helps admin review your application).</p>
            <MultiImagePicker files={portfolio} onChange={setPortfolioFiles} />
            {portfolio.length > 0 && (
              <div className="mt-6 space-y-4">
                {portfolio.map((f, i) => (
                  <div key={i} className="rounded-xl border border-ink-950/10 p-4">
                    <p className="mb-2 text-xs font-semibold text-ink-950/50">Item {i + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Title" value={portfolioMeta[i]?.title || ""} onChange={(e) => setMeta(i, "title", e.target.value)} />
                      <Input placeholder="Medium" value={portfolioMeta[i]?.medium || ""} onChange={(e) => setMeta(i, "medium", e.target.value)} />
                      <Input placeholder="Year created" value={portfolioMeta[i]?.year || ""} onChange={(e) => setMeta(i, "year", e.target.value)} />
                      <Input placeholder="Short description" value={portfolioMeta[i]?.description || ""} onChange={(e) => setMeta(i, "description", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 rounded-xl border border-ink-950/10 bg-white p-5">
            <p className="text-sm text-ink-950/70">Please confirm you agree to the following before submitting your application:</p>
            <label className="flex items-start gap-2.5 text-sm text-ink-950/70">
              <input type="checkbox" checked={agreeAll} onChange={(e) => setAgreeAll(e.target.checked)} className="mt-0.5 accent-ink-700" />
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-700 hover:underline">Marketplace Terms</a>,{" "}
              <span className="font-medium text-ink-700">Artist Guidelines</span>,{" "}
              <span className="font-medium text-ink-700">Copyright Policy</span>, and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-700 hover:underline">Privacy Policy</a>.
            </label>
          </div>
        )}

        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

        <div className="flex justify-between pt-2">
          {step > 0 ? <Button type="button" variant="outline" onClick={back}>Back</Button> : <span />}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>Continue</Button>
          ) : (
            <Button type="submit" loading={loading}>Submit Application</Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-ink-950/60">
        Already have an account? <Link to="/login" className="font-semibold text-ink-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
