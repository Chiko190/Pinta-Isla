import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Button from "../../components/ui/Button";
import { getCustomerDashboard } from "../../api/customer";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/customer/dashboard", label: "Overview", end: true },
  { to: "/customer/wishlist", label: "Wishlist" },
  { to: "/customer/following", label: "Following" },
  { to: "/orders", label: "Orders" },
  { to: "/customer/become-seller", label: "Become a Seller" },
  { to: "/customer/profile", label: "Profile Settings" },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCustomerDashboard().then((r) => setStats(r.data.stats));
  }, []);

  return (
    <DashboardLayout title={`Welcome, ${user.firstName}`} navItems={NAV}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Wishlist" value={stats?.wishlistCount ?? "—"} tone="accent" />
        <StatCard label="Following" value={stats?.followingCount ?? "—"} tone="accent" />
        <StatCard label="Orders" value={stats?.ordersCount ?? 0} />
        <StatCard label="Commissions" value={stats?.commissionsCount ?? 0} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/artworks">Browse Artworks</Button>
        <Button as={Link} to="/artists" variant="outline">Meet Artists</Button>
        <Button as={Link} to="/commissions" variant="outline">Request Commission</Button>
        <Button as={Link} to="/customer/become-seller" variant="outline">Become a Seller</Button>
      </div>
    </DashboardLayout>
  );
}
