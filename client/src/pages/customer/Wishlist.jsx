import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getWishlist, toggleWishlist } from "../../api/customer";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { CardGridSkeleton } from "../../components/ui/Skeleton";

const NAV = [
  { to: "/customer/dashboard", label: "Overview", end: true },
  { to: "/customer/wishlist", label: "Wishlist" },
  { to: "/customer/following", label: "Following" },
  { to: "/orders", label: "Orders" },
  { to: "/customer/profile", label: "Profile Settings" },
];

export default function Wishlist() {
  const [items, setItems] = useState(null);

  function load() {
    getWishlist().then((r) => setItems(r.data.items));
  }
  useEffect(load, []);

  async function handleToggle(id) {
    await toggleWishlist(id);
    load();
  }

  return (
    <DashboardLayout title="Wishlist" navItems={NAV}>
      {!items ? (
        <CardGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save artworks you love to find them here later."
          action={<Button as={Link} to="/artworks">Browse Artworks</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((a) => (
            <ArtworkCard key={a.id} artwork={a} wishlisted onToggleWishlist={handleToggle} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
