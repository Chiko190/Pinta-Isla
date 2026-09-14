import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getSellerApplication, submitSellerApplication } from "../../api/customer";
import Button from "../../components/ui/Button";
import { Field, Input, TextArea } from "../../components/ui/Field";
import { MultiImagePicker } from "../../components/ui/ImagePicker";

const NAV = [
  { to: "/customer/dashboard", label: "Overview", end: true },
  { to: "/customer/wishlist", label: "Wishlist" },
  { to: "/customer/following", label: "Following" },
  { to: "/orders", label: "Orders" },
  { to: "/customer/become-seller", label: "Become a Seller" },
  { to: "/customer/profile", label: "Profile Settings" },
];

const initial = {
  artistName: "", bio: "", statement: "", specialization: "", style: "", medium: "",
  yearsExperience: "", intro: "", location: "",
  facebook: "", instagram: "", tiktok: "", website: "",
};

export default function BecomeSeller() {
  const [application, setApplication] = useState(undefined); // undefined = loading, null = none yet
  const [form, setForm] = useState(initial);
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioMeta, setPortfolioMeta] = useState([]);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function load() {
    getSellerApplication().then((r) => setApplication(r.data.application));
  }
  useEffect(load, []);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.artistName) return setError("Artist name is required.");
    if (!agree) return setError("You must agree to the Marketplace Terms, Artist Guidelines, and Copyright Policy.");
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (["facebook", "instagram", "tiktok", "website"].includes(k)) return;
        fd.append(k, v);
      });
      fd.append("agreeArtistTerms", "true");
      fd.append("socialLinks", JSON.stringify({
        facebook: form.facebook, instagram: form.instagram, tiktok: form.tiktok, website: form.website,
      }));
      portfolio.forEach((f) => fd.append("portfolioImages", f));
      fd.append("portfolioMeta", JSON.stringify(portfolioMeta));

      const res = await submitSellerApplication(fd);
      setMessage(res.data.message);
      setApplication(res.data.application);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (application === undefined) {
    return (
      <DashboardLayout title="Become a Seller" navItems={NAV}>
        <p className="text-sm text-ink-950/50">Loading…</p>
      </DashboardLayout>
    );
  }

  if (application?.status === "approved") {
    return (
      <DashboardLayout title="Become a Seller" navItems={NAV}>
        <div className="max-w-lg rounded-2xl border border-ink-950/8 bg-white p-6 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-3 font-display text-xl font-bold text-ink-950">You're an approved seller!</h2>
          <p className="mt-2 text-sm text-ink-950/65">
            Your account keeps its customer access, and you can now also manage artwork listings from your
            artist dashboard.
          </p>
          <Button as={Link} to="/artist/dashboard" className="mt-5">Go to Artist Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (application?.status === "pending_approval") {
    return (
      <DashboardLayout title="Become a Seller" navItems={NAV}>
        <div className="max-w-lg rounded-2xl border border-ink-950/8 bg-white p-6 text-center">
          <div className="text-4xl">⏳</div>
          <h2 className="mt-3 font-display text-xl font-bold text-ink-950">Application under review</h2>
          <p className="mt-2 text-sm text-ink-950/65">
            An administrator is reviewing your seller application. We'll notify you once it's decided —
            your customer account works as normal in the meantime.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Become a Seller" navItems={NAV}>
      {application?.status === "rejected" && (
        <div className="mb-6 max-w-xl rounded-lg bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
          Your previous application wasn't approved. Reason: {application.rejectionReason || "No reason provided."}
          <br />You're welcome to update your details below and reapply.
        </div>
      )}

      <p className="mb-6 max-w-xl text-sm text-ink-950/60">
        Selling on Pinta Isla doesn't change your customer account — you'll keep browsing, wishlisting, and
        following just like now, plus an artist dashboard for listing your own artwork once approved.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <Field label="Artist Name" required><Input value={form.artistName} onChange={(e) => set("artistName", e.target.value)} /></Field>
        <Field label="Location"><Input placeholder="City, Province" value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Short Introduction"><Input value={form.intro} onChange={(e) => set("intro", e.target.value)} /></Field>
        <Field label="Biography"><TextArea value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
        <Field label="Artist Statement"><TextArea value={form.statement} onChange={(e) => set("statement", e.target.value)} /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Specialization"><Input placeholder="e.g. Portrait" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} /></Field>
          <Field label="Style"><Input placeholder="e.g. Realism" value={form.style} onChange={(e) => set("style", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Medium"><Input placeholder="e.g. Oil on canvas" value={form.medium} onChange={(e) => set("medium", e.target.value)} /></Field>
          <Field label="Years of Experience"><Input type="number" min="0" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} /></Field>
        </div>

        <Field label="Facebook"><Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} placeholder="Profile URL" /></Field>
        <Field label="Instagram"><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Profile URL" /></Field>
        <Field label="TikTok"><Input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="Profile URL" /></Field>
        <Field label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>

        <div>
          <p className="mb-3 text-sm text-ink-950/60">Upload a few sample artworks (optional but recommended — helps admin review your application).</p>
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

        <label className="flex items-start gap-2.5 text-sm text-ink-950/70">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-ink-700" />
          I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-700 hover:underline">Marketplace Terms</a>,{" "}
          <span className="font-medium text-ink-700">Artist Guidelines</span>,{" "}
          <span className="font-medium text-ink-700">Copyright Policy</span>, and{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-700 hover:underline">Privacy Policy</a>.
        </label>

        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}
        {message && <p className="rounded-lg bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">{message}</p>}

        <Button type="submit" loading={loading}>Submit Application</Button>
      </form>
    </DashboardLayout>
  );
}
