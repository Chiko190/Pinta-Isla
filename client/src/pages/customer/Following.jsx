import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getFollowing, toggleFollow } from "../../api/customer";
import ArtistCard from "../../components/artist/ArtistCard";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

const NAV = [
  { to: "/customer/dashboard", label: "Overview", end: true },
  { to: "/customer/wishlist", label: "Wishlist" },
  { to: "/customer/following", label: "Following" },
  { to: "/orders", label: "Orders" },
  { to: "/customer/become-seller", label: "Become a Seller" },
  { to: "/customer/profile", label: "Profile Settings" },
];

export default function Following() {
  const [artists, setArtists] = useState(null);

  useEffect(() => {
    getFollowing().then((r) =>
      setArtists(r.data.artists.map((a) => ({ ...a, profileImage: a.User?.profileImage })))
    );
  }, []);

  return (
    <DashboardLayout title="Following" navItems={NAV}>
      {!artists ? (
        <p className="text-sm text-ink-950/50">Loading…</p>
      ) : artists.length === 0 ? (
        <EmptyState
          title="You aren't following any artists yet"
          description="Follow artists to keep up with their new artworks."
          action={<Button as={Link} to="/artists">Discover Artists</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {artists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
