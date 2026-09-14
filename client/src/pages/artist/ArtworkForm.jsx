import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createArtwork, updateArtwork, getMyArtwork } from "../../api/artist";
import { getCategories } from "../../api/marketplace";
import Button from "../../components/ui/Button";
import { Field, Input, TextArea, Select } from "../../components/ui/Field";
import { MultiImagePicker } from "../../components/ui/ImagePicker";

const NAV = [
  { to: "/artist/dashboard", label: "Overview", end: true },
  { to: "/artist/artworks", label: "My Artworks" },
  { to: "/orders", label: "Orders" },
  { to: "/commissions", label: "Commissions" },
  { to: "/messages", label: "Messages" },
  { to: "/artist/profile", label: "Profile Settings" },
];

const initial = {
  title: "", description: "", story: "", price: "", type: "original", medium: "", style: "",
  categoryId: "", width: "", height: "", unit: "in", yearCreated: "", framed: false,
  weight: "", quantity: 1, shippingInfo: "",
};

export default function ArtworkForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getMyArtwork(id).then((r) => {
      const a = r.data.artwork;
      setForm({
        title: a.title, description: a.description || "", story: a.story || "",
        price: a.price, type: a.type, medium: a.medium || "", style: a.style || "",
        categoryId: a.categoryId || "", width: a.width || "", height: a.height || "",
        unit: a.unit || "in", yearCreated: a.yearCreated || "", framed: a.framed,
        weight: a.weight || "", quantity: a.quantity, shippingInfo: a.shippingInfo || "",
      });
      setExistingImages(a.images || []);
    });
  }, [id, isEdit]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!isEdit && images.length === 0) return setError("Please upload at least one artwork image.");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("mainImageIndex", String(mainImageIndex));
      images.forEach((f) => fd.append("images", f));

      if (isEdit) {
        await updateArtwork(id, fd);
      } else {
        await createArtwork(fd);
      }
      navigate("/artist/artworks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout title={isEdit ? "Edit Artwork" : "Add Artwork"} navItems={NAV}>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {isEdit && existingImages.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-950/45">Current Images</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-ink-950/10">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {img.isMain && <span className="absolute bottom-0 w-full bg-ink-950/70 py-0.5 text-center text-[10px] text-white">Main</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Field label={isEdit ? "Add More Images" : "Artwork Images"} required={!isEdit} hint="First image marked below becomes the main image.">
          <MultiImagePicker files={images} onChange={setImages} />
          {images.length > 1 && (
            <Select value={mainImageIndex} onChange={(e) => setMainImageIndex(Number(e.target.value))} className="mt-2 max-w-xs">
              {images.map((_, i) => <option key={i} value={i}>Main image: #{i + 1}</option>)}
            </Select>
          )}
        </Field>

        <Field label="Artwork Title" required><Input value={form.title} onChange={(e) => set("title", e.target.value)} required /></Field>
        <Field label="Description"><TextArea value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Story Behind Artwork"><TextArea value={form.story} onChange={(e) => set("story", e.target.value)} /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (₱)" required><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} required /></Field>
          <Field label="Artwork Type">
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="original">Original</option>
              <option value="print">Print</option>
              <option value="commission">Commission</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Medium"><Input placeholder="e.g. Oil, Acrylic" value={form.medium} onChange={(e) => set("medium", e.target.value)} /></Field>
          <Field label="Style"><Input placeholder="e.g. Realism" value={form.style} onChange={(e) => set("style", e.target.value)} /></Field>
        </div>

        <Field label="Category">
          <Select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Width"><Input type="number" step="0.1" value={form.width} onChange={(e) => set("width", e.target.value)} /></Field>
          <Field label="Height"><Input type="number" step="0.1" value={form.height} onChange={(e) => set("height", e.target.value)} /></Field>
          <Field label="Unit">
            <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
              <option value="in">inches</option>
              <option value="cm">cm</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Year Created"><Input type="number" value={form.yearCreated} onChange={(e) => set("yearCreated", e.target.value)} /></Field>
          <Field label="Weight (kg)"><Input type="number" step="0.1" value={form.weight} onChange={(e) => set("weight", e.target.value)} /></Field>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <Field label="Quantity"><Input type="number" min="1" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></Field>
          <label className="mb-2.5 flex items-center gap-2 text-sm text-ink-950/70">
            <input type="checkbox" checked={form.framed} onChange={(e) => set("framed", e.target.checked)} className="accent-ink-700" />
            Framed
          </label>
        </div>

        <Field label="Shipping Information"><TextArea value={form.shippingInfo} onChange={(e) => set("shippingInfo", e.target.value)} /></Field>

        {error && <p className="rounded-lg bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red">{error}</p>}

        <p className="text-xs text-ink-950/45">Submitting will send this artwork to an administrator for review before it appears in the marketplace.</p>

        <Button type="submit" loading={loading}>{isEdit ? "Save & Resubmit for Review" : "Submit for Review"}</Button>
      </form>
    </DashboardLayout>
  );
}
