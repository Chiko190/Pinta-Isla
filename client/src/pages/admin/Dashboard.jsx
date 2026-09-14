import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { getAdminStats } from "../../api/admin";

const NAV = [
  { to: "/admin/dashboard", label: "Overview", end: true },
  { to: "/admin/artist-applications", label: "Artist Applications" },
  { to: "/admin/artworks", label: "Artwork Moderation" },
  { to: "/admin/users", label: "User Management" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/logs", label: "Audit Log" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminStats().then((r) => setStats(r.data.stats));
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" navItems={NAV}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="Total Artists" value={stats?.totalArtists ?? "—"} />
        <StatCard label="Pending Artists" value={stats?.pendingArtists ?? "—"} tone="accent" />
        <StatCard label="Total Artworks" value={stats?.totalArtworks ?? "—"} />
        <StatCard label="Pending Artworks" value={stats?.pendingArtworks ?? "—"} tone="accent" />
        <StatCard label="Categories" value={stats?.totalCategories ?? "—"} />
        <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
        <StatCard label="Pending Commissions" value={stats?.pendingCommissions ?? 0} />
      </div>
      <p className="mt-6 text-xs text-ink-950/40">
        Orders, sales totals, and commission analytics will populate once those modules are connected.
      </p>
    </DashboardLayout>
  );
}
