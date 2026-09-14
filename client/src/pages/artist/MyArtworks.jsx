import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyArtworks, deleteArtwork, setArtworkStatus } from "../../api/artist";
import { formatPrice, mainImage } from "../../utils/format";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { Select } from "../../components/ui/Field";

const NAV = [
  { to: "/artist/dashboard", label: "Overview", end: true },
  { to: "/artist/artworks", label: "My Artworks" },
  { to: "/orders", label: "Orders" },
  { to: "/commissions", label: "Commissions" },
  { to: "/messages", label: "Messages" },
  { to: "/artist/profile", label: "Profile Settings" },
];

const STATUS_TONE = {
  pending_review: "yellow",
  available: "green",
  sold: "blue",
  hidden: "neutral",
  rejected: "red",
  draft: "neutral",
};

export default function MyArtworks() {
  const [artworks, setArtworks] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  function load() {
    getMyArtworks().then((r) => setArtworks(r.data.artworks));
  }
  useEffect(load, []);

  async function handleDelete() {
    await deleteArtwork(toDelete.id);
    setToDelete(null);
    load();
  }

  async function handleStatusChange(id, status) {
    await setArtworkStatus(id, status);
    load();
  }

  return (
    <DashboardLayout title="My Artworks" navItems={NAV}>
      <div className="mb-5 flex justify-end">
        <Button as={Link} to="/artist/artworks/new">+ Add Artwork</Button>
      </div>

      {!artworks ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : artworks.length === 0 ? (
        <EmptyState
          title="You haven't added any artworks yet"
          description="Add your first artwork to start selling on Pinta Isla."
          action={<Button as={Link} to="/artist/artworks/new">Add your first artwork</Button>}
        />
      ) : (
        <div className="space-y-3">
          {artworks.map((a) => (
            <div key={a.id} className="flex flex-col gap-4 rounded-2xl border border-ink-950/8 bg-white p-4 sm:flex-row sm:items-center">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                {mainImage(a) && <img src={mainImage(a)} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-950/40">{a.displayId}</p>
                <p className="truncate font-display font-semibold text-ink-950">{a.title}</p>
                <p className="text-sm text-ink-700">{formatPrice(a.price)}</p>
              </div>
              <Badge tone={STATUS_TONE[a.status] || "neutral"}>{a.status.replace("_", " ")}</Badge>
              {a.rejectionReason && a.status === "rejected" && (
                <p className="max-w-xs text-xs text-accent-red">{a.rejectionReason}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {["available", "sold", "hidden"].includes(a.status) && (
                  <Select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    className="!w-auto py-1.5 text-xs"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="hidden">Hidden</option>
                  </Select>
                )}
                <Button as={Link} to={`/artist/artworks/${a.id}/edit`} variant="outline" size="sm">Edit</Button>
                <Button variant="danger" size="sm" onClick={() => setToDelete(a)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete artwork?">
        <p className="text-sm text-ink-950/65">
          This will permanently remove "{toDelete?.title}" from your listings. This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
