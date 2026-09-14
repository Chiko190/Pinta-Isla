import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArtwork } from "../../api/marketplace";
import { getWishlist, toggleWishlist, toggleFollow, getFollowing } from "../../api/customer";
import { formatPrice } from "../../utils/format";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";

export default function ArtworkDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [following, setFollowing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setArtwork(null);
    setNotFound(false);
    getArtwork(id)
      .then((r) => setArtwork(r.data.artwork))
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (user?.role === "customer" && artwork) {
      getWishlist().then((r) => setWishlisted(r.data.items.some((a) => a.id === artwork.id)));
      getFollowing().then((r) => setFollowing(r.data.artists.some((a) => a.id === artwork.ArtistProfile.id)));
    }
  }, [user, artwork]);

  async function handleWishlist() {
    if (!user) return setToast("Please log in as a customer to save artworks.");
    try {
      const res = await toggleWishlist(artwork.id);
      setWishlisted(res.data.wishlisted);
    } catch (err) {
      setToast(err.message);
    }
  }

  async function handleFollow() {
    if (!user) return setToast("Please log in as a customer to follow artists.");
    try {
      const res = await toggleFollow(artwork.ArtistProfile.id);
      setFollowing(res.data.following);
    } catch (err) {
      setToast(err.message);
    }
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    setToast("Link copied to clipboard.");
    setTimeout(() => setToast(null), 2500);
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="font-display text-2xl font-bold text-ink-950">That artwork is no longer available.</h2>
        <Button as={Link} to="/artworks" className="mt-6">Browse other artworks</Button>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
        <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const images = artwork.images || [];
  const artist = artwork.ArtistProfile;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-950 px-5 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-ink-50">
            {images[activeImage] ? (
              <img src={images[activeImage].url} alt={artwork.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-950/30">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-ink-700" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-950/40">{artwork.displayId}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink-950">{artwork.title}</h1>
          <Link to={`/artists/${artist.id}`} className="mt-1.5 block text-sm font-medium text-ink-700 hover:underline">
            by {artist.artistName} {artist.verified && "✓"}
          </Link>

          <p className="mt-5 font-display text-3xl font-semibold text-ink-700">{formatPrice(artwork.price)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="blue">{artwork.medium}</Badge>
            <Badge tone="neutral">{artwork.style}</Badge>
            <Badge tone={artwork.status === "sold" ? "red" : "green"}>
              {artwork.status === "sold" ? "Sold" : "Available"}
            </Badge>
            {artwork.Category && <Badge tone="teal">{artwork.Category.name}</Badge>}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div title="Cart & checkout aren't connected yet">
              <Button disabled variant="outline">Add to Cart</Button>
            </div>
            <div title="Cart & checkout aren't connected yet">
              <Button disabled>Buy Now</Button>
            </div>
            <Button variant="subtle" onClick={handleWishlist}>
              {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </Button>
            <Button variant="ghost" onClick={handleShare}>Share</Button>
          </div>
          <p className="mt-2 text-xs text-ink-950/40">
            Cart, checkout, and payments are still in development — see the Coming Soon note on those pages.
          </p>

          {artwork.description && (
            <div className="mt-8">
              <h3 className="font-display text-base font-semibold text-ink-950">Description</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-950/70">{artwork.description}</p>
            </div>
          )}
          {artwork.story && (
            <div className="mt-6">
              <h3 className="font-display text-base font-semibold text-ink-950">Story Behind This Piece</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-950/70">{artwork.story}</p>
            </div>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-ink-950/8 pt-6 text-sm">
            <Detail label="Dimensions" value={artwork.width && artwork.height ? `${artwork.width} × ${artwork.height} ${artwork.unit}` : "—"} />
            <Detail label="Year Created" value={artwork.yearCreated || "—"} />
            <Detail label="Type" value={cap(artwork.type)} />
            <Detail label="Framed" value={artwork.framed ? "Framed" : "Unframed"} />
            <Detail label="Weight" value={artwork.weight ? `${artwork.weight} kg` : "—"} />
            <Detail label="Quantity" value={artwork.quantity} />
          </dl>

          {artwork.shippingInfo && (
            <div className="mt-6 rounded-xl bg-ink-50 p-4 text-sm text-ink-950/70">
              <span className="font-semibold text-ink-950">Shipping: </span>
              {artwork.shippingInfo}
            </div>
          )}
        </div>
      </div>

      {/* Artist section */}
      <div className="mt-16 rounded-2xl border border-ink-950/8 bg-white p-7">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-ink-50">
              {artist.User?.profileImage && (
                <img src={artist.User.profileImage} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-950">
                {artist.artistName} {artist.verified && <span className="text-ink-700">✓ Verified</span>}
              </h3>
              <p className="text-sm text-ink-950/55">{artist.style} · {artist.location}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFollow}>{following ? "Following" : "Follow"}</Button>
            <Button as={Link} to={`/artists/${artist.id}`} variant="subtle">View Profile</Button>
          </div>
        </div>
        {artist.bio && <p className="mt-4 text-sm leading-relaxed text-ink-950/70">{artist.bio}</p>}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-ink-950/45">{label}</dt>
      <dd className="font-medium text-ink-950">{value}</dd>
    </div>
  );
}

function cap(s) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
