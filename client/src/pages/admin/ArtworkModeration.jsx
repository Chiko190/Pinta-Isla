import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminArtworks, approveArtwork, rejectArtwork, hideArtwork, deleteArtworkAdmin } from "../../api/admin";
import { formatPrice, mainImage } from "../../utils/format";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TextArea, Select } from "../../components/ui/Field";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

export default function ArtworkModeration() {
  const [status, setStatus] = useState("pending_review");
  const [artworks, setArtworks] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  function load() {
    getAdminArtworks(status).then((r) => setArtworks(r.data.artworks));
  }
  useEffect(load, [status]);

  async function handleApprove(id) {
    await approveArtwork(id);
    load();
  }
  async function handleReject() {
    await rejectArtwork(rejecting.id, reason);
    setRejecting(null);
    setReason("");
    load();
  }
  async function handleHide(id) {
    await hideArtwork(id);
    load();
  }
  async function handleDelete(id) {
    if (!confirm("Permanently delete this artwork?")) return;
    await deleteArtworkAdmin(id);
    load();
  }

  return (
    <DashboardLayout title="Artwork Moderation" navItems={NAV}>
      <div className="mb-5 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending_review">Pending Review</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rejected">Rejected</option>
          <option value="hidden">Hidden</option>
        </Select>
      </div>

      {!artworks ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : artworks.length === 0 ? (
        <EmptyState title="Nothing here" description="No artworks in this status." />
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
                <p className="text-xs text-ink-950/50">by {a.ArtistProfile?.artistName}</p>
                <p className="text-sm text-ink-700">{formatPrice(a.price)}</p>
              </div>
              <Badge tone={status === "pending_review" ? "yellow" : status === "available" ? "green" : status === "rejected" ? "red" : "neutral"}>
                {a.status.replace("_", " ")}
              </Badge>
              <div className="flex flex-wrap items-center gap-2">
                {status === "pending_review" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(a.id)}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => setRejecting(a)}>Reject</Button>
                  </>
                )}
                {(status === "available" || status === "sold") && (
                  <Button size="sm" variant="outline" onClick={() => handleHide(a.id)}>Hide</Button>
                )}
                <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject Artwork">
        <TextArea placeholder="Reason for rejection (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="danger" disabled={!reason.trim()} onClick={handleReject}>Confirm Reject</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
