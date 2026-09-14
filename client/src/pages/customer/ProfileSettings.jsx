import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { updateCustomerProfile } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { SingleImagePicker } from "../../components/ui/ImagePicker";

const NAV = [
  { to: "/customer/dashboard", label: "Overview", end: true },
  { to: "/customer/wishlist", label: "Wishlist" },
  { to: "/customer/following", label: "Following" },
  { to: "/orders", label: "Orders" },
  { to: "/customer/become-seller", label: "Become a Seller" },
  { to: "/customer/profile", label: "Profile Settings" },
];

export default function ProfileSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user.firstName, lastName: user.lastName, phone: user.phone || "",
    address: "", city: "", province: "", password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (avatar) fd.append("profileImage", avatar);
      const res = await updateCustomerProfile(fd);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title="Profile Settings" navItems={NAV}>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="flex items-center gap-5">
          <SingleImagePicker file={avatar} onChange={setAvatar} />
          {!avatar && user.profileImage && <img src={user.profileImage} alt="" className="h-16 w-16 rounded-full object-cover" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Last Name"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
        </div>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Province"><Input value={form.province} onChange={(e) => set("province", e.target.value)} /></Field>
        </div>
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
