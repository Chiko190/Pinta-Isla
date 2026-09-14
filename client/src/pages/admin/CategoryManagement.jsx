import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from "../../api/admin";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Field, Input, TextArea } from "../../components/ui/Field";
import EmptyState from "../../components/ui/EmptyState";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState(null);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);

  function load() {
    getAdminCategories().then((r) => setCategories(r.data.categories));
  }
  useEffect(load, []);

  function openNew() {
    setForm({ name: "", description: "" });
    setError(null);
    setEditing({});
  }
  function openEdit(c) {
    setForm({ name: c.name, description: c.description || "" });
    setError(null);
    setEditing(c);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    try {
      if (editing.id) await updateCategory(editing.id, form);
      else await createCategory(form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category? Artworks in it will keep their other data but lose this category.")) return;
    await deleteCategory(id);
    load();
  }

  return (
    <DashboardLayout title="Categories" navItems={NAV}>
      <div className="mb-5 flex justify-end">
        <Button onClick={openNew}>+ Add Category</Button>
      </div>

      {!categories ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" action={<Button onClick={openNew}>Add your first category</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink-950/8 bg-white p-4">
              <div>
                <p className="font-medium text-ink-950">{c.name}</p>
                {c.description && <p className="text-xs text-ink-950/50">{c.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Field label="Name" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></Field>
          <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
