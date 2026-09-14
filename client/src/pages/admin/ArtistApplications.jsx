import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getArtistApplications, approveArtist, rejectArtist } from "../../api/admin";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import { TextArea, Select } from "../../components/ui/Field";
import { formatDate } from "../../utils/format";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

export default function ArtistApplications() {
  const [status, setStatus] = useState("pending_approval");
  const [applications, setApplications] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  function load() {
    getArtistApplications(status).then((r) => setApplications(r.data.applications));
  }
  useEffect(load, [status]);

  async function handleApprove(userId) {
    await approveArtist(userId);
    setViewing(null);
    load();
  }

  async function handleReject() {
    await rejectArtist(rejecting.User.id, reason);
    setRejecting(null);
    setReason("");
    setViewing(null);
    load();
  }

  return (
    <DashboardLayout title="Artist Applications" navItems={NAV}>
      <div className="mb-5 max-w-xs">
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {!applications ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : applications.length === 0 ? (
        <EmptyState title="No applications here" description="Nothing to review in this status." />
      ) : (
        <div className="space-y-3">
          {applications.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 rounded-2xl border border-ink-950/8 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-ink-50">
                  {p.User?.profileImage && <img src={p.User.profileImage} alt="" className="h-full w-full object-cover" />}
                </div>
                <div>
                  <p className="font-display font-semibold text-ink-950">
                    {p.artistName} {p.User?.role === "customer" && <span className="ml-1 text-xs font-normal text-ink-950/40">(existing customer)</span>}
                  </p>
                  <p className="text-xs text-ink-950/50">@{p.User?.username} · {p.User?.email} · {p.location}</p>
                  <p className="text-xs text-ink-950/40">Applied {formatDate(p.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.status === "pending_approval" ? "yellow" : p.status === "approved" ? "green" : "red"}>
                  {p.status === "pending_approval" ? "Pending" : p.status === "approved" ? "Approved" : "Rejected"}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setViewing(p)}>View</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Artist Application">
        {viewing && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto">
            <div>
              <p className="font-display text-lg font-semibold text-ink-950">{viewing.artistName}</p>
              <p className="text-sm text-ink-950/50">@{viewing.User?.username} · {viewing.User?.email} · {viewing.User?.phone}</p>
              <p className="text-sm text-ink-950/50">{viewing.location}</p>
            </div>
            <Info label="Specialization" value={viewing.specialization} />
            <Info label="Style" value={viewing.style} />
            <Info label="Medium" value={viewing.medium} />
            <Info label="Years of Experience" value={viewing.yearsExperience} />
            <Info label="Bio" value={viewing.bio} />
            <Info label="Statement" value={viewing.statement} />

            {viewing.PortfolioItems?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-950/45">Portfolio</p>
                <div className="flex flex-wrap gap-2">
                  {viewing.PortfolioItems.map((p) => (
                    <div key={p.id} className="h-20 w-20 overflow-hidden rounded-lg border border-ink-950/10">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewing.status === "pending_approval" && (
              <div className="flex gap-2 border-t border-ink-950/8 pt-4">
                <Button onClick={() => handleApprove(viewing.User.id)}>Approve</Button>
                <Button variant="danger" onClick={() => setRejecting(viewing)}>Reject</Button>
              </div>
            )}
            {viewing.status === "rejected" && viewing.rejectionReason && (
              <p className="rounded-lg bg-accent-red/10 px-3 py-2 text-sm text-accent-red">
                Rejection reason: {viewing.rejectionReason}
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject Application">
        <TextArea placeholder="Reason for rejection (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="danger" disabled={!reason.trim()} onClick={handleReject}>Confirm Reject</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function Info({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-950/45">{label}</p>
      <p className="text-sm text-ink-950/75">{value}</p>
    </div>
  );
}
