import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUsers, suspendUser, restoreUser } from "../../api/admin";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Field";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

const STATUS_TONE = { active: "green", pending_approval: "yellow", rejected: "red", suspended: "neutral" };

export default function UserManagement() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState(null);

  function load() {
    getUsers({ q, role }).then((r) => setUsers(r.data.users));
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q, role]);

  async function handleSuspend(id) {
    await suspendUser(id);
    load();
  }
  async function handleRestore(id) {
    await restoreUser(id);
    load();
  }

  return (
    <DashboardLayout title="User Management" navItems={NAV}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, username, or email…"
          className="flex-1 rounded-lg border border-ink-950/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink-700"
        />
        <Select value={role} onChange={(e) => setRole(e.target.value)} className="sm:w-48">
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="artist">Artists</option>
          <option value="admin">Admins</option>
        </Select>
      </div>

      {!users ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-950/8 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-950/8 text-left text-xs uppercase tracking-wide text-ink-950/45">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink-950/5 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-950">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-ink-950/45">@{u.username} · {u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-950/70">{u.role}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[u.status] || "neutral"}>{u.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== "admin" && (
                      u.status === "suspended" ? (
                        <Button size="sm" variant="outline" onClick={() => handleRestore(u.id)}>Restore</Button>
                      ) : (
                        <Button size="sm" variant="danger" onClick={() => handleSuspend(u.id)}>Suspend</Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
