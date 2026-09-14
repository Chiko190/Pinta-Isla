import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { updateArtistProfile, getArtistProfileSettings } from "../../api/artist";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input, TextArea } from "../../components/ui/Field";
import { SingleImagePicker } from "../../components/ui/ImagePicker";

const NAV = [
  { to: "/artist/dashboard", label: "Overview", end: true },
  { to: "/artist/artworks", label: "My Artworks" },
  { to: "/orders", label: "Orders" },
  { to: "/commissions", label: "Commissions" },
  { to: "/messages", label: "Messages" },
  { to: "/artist/profile", label: "Profile Settings" },
];

export default function ArtistProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    artistName: "", bio: "", statement: "", specialization: "", style: "", medium: "",
    yearsExperience: "", intro: "", location: "",
    facebook: "", instagram: "", tiktok: "", website: "",
    firstName: user.firstName, lastName: user.lastName, phone: user.phone || "", password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getArtistProfileSettings().then((r) => {
      const p = r.data.profile;
      setForm((f) => ({
        ...f,
        artistName: p.artistName || "",
        bio: p.bio || "",
        statement: p.statement || "",
        specialization: p.specialization || "",
        style: p.style || "",
        medium: p.medium || "",
        yearsExperience: p.yearsExperience || "",
        intro: p.intro || "",
        location: p.location || "",
        facebook: p.socialLinks?.facebook || "",
        instagram: p.socialLinks?.instagram || "",
        tiktok: p.socialLinks?.tiktok || "",
        website: p.socialLinks?.website || "",
      }));
    });
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const fd = new FormData();
      const { facebook, instagram, tiktok, website, ...rest } = form;
      Object.entries(rest).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("socialLinks", JSON.stringify({ facebook, instagram, tiktok, website }));
      if (avatar) fd.append("profileImage", avatar);
      if (cover) fd.append("coverImage", cover);
      const res = await updateArtistProfile(fd);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Profile Settings" navItems={NAV}>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div className="flex items-center gap-6">
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-950/60">Profile Photo</p>
            <SingleImagePicker file={avatar} onChange={setAvatar} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-950/60">Cover Image</p>
            <SingleImagePicker file={cover} onChange={setCover} shape="square" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Last Name"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
        </div>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>

        <Field label="Artist Name"><Input value={form.artistName} onChange={(e) => set("artistName", e.target.value)} /></Field>
        <Field label="Location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Short Introduction"><Input value={form.intro} onChange={(e) => set("intro", e.target.value)} /></Field>
        <Field label="Biography"><TextArea value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
        <Field label="Artist Statement"><TextArea value={form.statement} onChange={(e) => set("statement", e.target.value)} /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Specialization"><Input value={form.specialization} onChange={(e) => set("specialization", e.target.value)} /></Field>
          <Field label="Style"><Input value={form.style} onChange={(e) => set("style", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Medium"><Input value={form.medium} onChange={(e) => set("medium", e.target.value)} /></Field>
          <Field label="Years of Experience"><Input type="number" value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)} /></Field>
        </div>

        <Field label="Facebook"><Input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} /></Field>
        <Field label="Instagram"><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
        <Field label="TikTok"><Input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></Field>
        <Field label="Website"><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>

        <Field label="New Password" hint="Leave blank to keep your current password.">
          <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} minLength={8} />
        </Field>

        {message && <p className="rounded-lg bg-accent-green/10 px-4 py-2.5 text-sm text-accent-green">{message}</p>}
        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

        <Button type="submit" loading={loading}>Save Changes</Button>
      </form>
    </DashboardLayout>
  );
}
