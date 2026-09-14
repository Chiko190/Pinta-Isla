import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAuditLogs } from "../../api/admin";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate } from "../../utils/format";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

const ACTION_LABELS = {
  approve_artist: "approved artist",
  reject_artist: "rejected artist application",
  approve_artwork: "approved artwork",
  reject_artwork: "rejected artwork",
  hide_artwork: "hid artwork",
  delete_artwork: "deleted artwork",
  verify_artist: "verified artist",
  unverify_artist: "removed artist verification",
  suspend_user: "suspended user",
  restore_user: "restored user",
  create_category: "created category",
  update_category: "updated category",
  delete_category: "deleted category",
};

export default function AuditLog() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    getAuditLogs().then((r) => setLogs(r.data.logs));
  }, []);

  return (
    <DashboardLayout title="Audit Log" navItems={NAV}>
      {!logs ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : logs.length === 0 ? (
        <EmptyState title="No admin actions recorded yet" />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="rounded-xl border border-ink-950/8 bg-white px-4 py-3 text-sm">
              <span className="font-medium text-ink-950">{l.User?.firstName} {l.User?.lastName}</span>{" "}
              <span className="text-ink-950/70">{ACTION_LABELS[l.action] || l.action}</span>{" "}
              {l.targetType && <span className="text-ink-950/45">({l.targetType} #{l.targetId})</span>}
              <p className="mt-0.5 text-xs text-ink-950/40">{formatDate(l.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
