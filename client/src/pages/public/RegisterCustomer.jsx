import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import PasswordStrength from "../../components/ui/PasswordStrength";
import { SingleImagePicker } from "../../components/ui/ImagePicker";

const initial = {
  firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "",
  phone: "", address: "", city: "", province: "",
};

export default function RegisterCustomer() {
  const { loginWithToken, homeFor } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!agree) return setError("You must agree to the Terms of Service and Privacy Policy.");

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("agreeToTerms", "true");
      if (avatar) fd.append("profileImage", avatar);

      const res = await registerCustomer(fd);
      loginWithToken(res.data.token, res.data.user);
      navigate(homeFor(res.data.user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-display text-2xl font-bold text-ink-950">Create your customer account</h1>
      <p className="mt-1 text-sm text-ink-950/55">Browse, collect, and commission original artwork.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="flex items-center gap-5">
          <SingleImagePicker file={avatar} onChange={setAvatar} />
          <p className="text-xs text-ink-950/50">Optional profile picture. JPG, PNG, or WEBP, up to 5MB.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required /></Field>
          <Field label="Last Name" required><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required /></Field>
        </div>
        <Field label="Username" required><Input value={form.username} onChange={(e) => set("username", e.target.value)} required minLength={3} /></Field>
        <Field label="Email Address" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>

        <Field label="Password" required>
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} className="pr-16" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-700">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </Field>
        <Field label="Confirm Password" required error={form.confirmPassword && form.confirmPassword !== form.password ? "Passwords do not match." : null}>
          <Input type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} required />
        </Field>

        <Field label="Phone Number"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City / Municipality"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Province"><Input value={form.province} onChange={(e) => set("province", e.target.value)} /></Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink-950/70">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-ink-700" required />
          By creating an account, you agree to our{" "}
          <span className="font-medium text-ink-700">Terms of Service</span> and{" "}
          <span className="font-medium text-ink-700">Privacy Policy</span>.
        </label>

        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

        <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-950/60">
        Already have an account? <Link to="/login" className="font-semibold text-ink-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
