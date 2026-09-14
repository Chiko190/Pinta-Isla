import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import { getArtistDashboard } from "../../api/artist";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/artist/dashboard", label: "Overview", end: true },
  { to: "/artist/artworks", label: "My Artworks" },
  { to: "/orders", label: "Orders" },
  { to: "/commissions", label: "Commissions" },
  { to: "/messages", label: "Messages" },
  { to: "/artist/profile", label: "Profile Settings" },
];

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getArtistDashboard().then((r) => setStats(r.data.stats));
  }, []);

  return (
    <DashboardLayout title={`Welcome, ${user.firstName}`} navItems={NAV}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Sales" value={stats?.totalSales ?? 0} />
        <StatCard label="Total Earnings" value={stats ? `₱${stats.totalEarnings.toLocaleString()}` : "—"} />
        <StatCard label="Available Artworks" value={stats?.availableArtworks ?? "—"} tone="accent" />
        <StatCard label="Sold Artworks" value={stats?.soldArtworks ?? "—"} />
        <StatCard label="Pending Review" value={stats?.pendingReviewArtworks ?? "—"} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders ?? 0} />
        <StatCard label="Pending Commissions" value={stats?.pendingCommissions ?? 0} />
        <StatCard label="Followers" value={stats?.followers ?? "—"} tone="accent" />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/artist/artworks/new">+ Add Artwork</Button>
        <Button as={Link} to="/artist/artworks" variant="outline">My Artworks</Button>
        <Button as={Link} to="/artist/profile" variant="outline">Edit Profile</Button>
      </div>
    </DashboardLayout>
  );
}
