import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getArtistProfile } from "../../api/marketplace";
import { toggleFollow, getFollowing } from "../../api/customer";
import ArtworkCard from "../../components/artwork/ArtworkCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";

const TABS = ["Portfolio", "Available", "Sold", "Reviews"];

export default function ArtistProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState(null);
  const [tab, setTab] = useState("Portfolio");
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setArtist(null);
    getArtistProfile(id).then((r) => setArtist(r.data.artist));
  }, [id]);

  useEffect(() => {
    if (user?.role === "customer" && artist) {
      getFollowing().then((r) => setFollowing(r.data.artists.some((a) => a.id === artist.id)));
    }
  }, [user, artist]);

  async function handleFollow() {
    if (!user) return;
    try {
      const res = await toggleFollow(artist.id);
      setFollowing(res.data.following);
    } catch {
      // Silently ignore — the button just won't toggle.
    }
  }

  if (!artist) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const artworks = artist.Artworks || [];
  const available = artworks.filter((a) => a.status === "available");
  const sold = artworks.filter((a) => a.status === "sold");

  return (
    <div>
      <div className="h-56 w-full overflow-hidden bg-ink-950 sm:h-72">
        {artist.coverImage && <img src={artist.coverImage} alt="" className="h-full w-full object-cover opacity-80" />}
      </div>

      <div className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
          <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-paper bg-ink-50 shadow-lg">
            {artist.User?.profileImage && <img src={artist.User.profileImage} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="font-display text-2xl font-bold text-white sm:text-ink-950">
              {artist.artistName} {artist.verified && <span className="text-ink-700">✓ Verified Artist</span>}
            </h1>
            <p className="text-sm text-ink-950/55">{artist.location}</p>
          </div>
          <div className="flex gap-2 pb-1">
            <Button variant="outline" onClick={handleFollow}>{following ? "Following" : "Follow"}</Button>
            <Button variant="subtle" disabled title="Messaging isn't connected yet">Message</Button>
            <Button as={Link} to="/commissions">Commission Artwork</Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4 rounded-2xl border border-ink-950/8 bg-white p-5 text-center sm:max-w-lg">
          <Stat label="Artworks" value={artworks.length} />
          <Stat label="Followers" value={artist.followerCount ?? 0} />
          <Stat label="Sales" value={sold.length} />
          <Stat label="Reviews" value="—" />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            {artist.bio && <ProfileBlock title="Biography" text={artist.bio} />}
            {artist.statement && <ProfileBlock title="Artist Statement" text={artist.statement} />}
            <div className="rounded-2xl border border-ink-950/8 bg-white p-5 text-sm">
              <Row label="Style" value={artist.style} />
              <Row label="Medium" value={artist.medium} />
              <Row label="Experience" value={artist.yearsExperience ? `${artist.yearsExperience} years` : "—"} />
            </div>
            <SocialLinks links={artist.socialLinks} />
          </div>

          <div className="md:col-span-2">
            <div className="mb-5 flex gap-2 overflow-x-auto border-b border-ink-950/8">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                    tab === t ? "border-ink-700 text-ink-700" : "border-transparent text-ink-950/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Portfolio" && (
              artworks.length === 0 ? (
                <EmptyState title="No artworks yet" />
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {artworks.map((a) => <ArtworkCard key={a.id} artwork={{ ...a, ArtistProfile: artist }} />)}
                </div>
              )
            )}
            {tab === "Available" && (
              available.length === 0 ? (
                <EmptyState title="Nothing available right now" />
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {available.map((a) => <ArtworkCard key={a.id} artwork={{ ...a, ArtistProfile: artist }} />)}
                </div>
              )
            )}
            {tab === "Sold" && (
              sold.length === 0 ? (
                <EmptyState title="No sold pieces yet" />
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                  {sold.map((a) => <ArtworkCard key={a.id} artwork={{ ...a, ArtistProfile: artist }} />)}
                </div>
              )
            )}
            {tab === "Reviews" && (
              <EmptyState title="No reviews yet" description="Reviews will appear here once the order & review system is connected." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-display text-xl font-bold text-ink-950">{value}</p>
      <p className="text-xs text-ink-950/45">{label}</p>
    </div>
  );
}

function ProfileBlock({ title, text }) {
  return (
    <div className="rounded-2xl border border-ink-950/8 bg-white p-5">
      <h4 className="font-display text-sm font-semibold text-ink-950">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-950/65">{text}</p>
    </div>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-ink-950/5 py-1.5 last:border-0">
      <span className="text-ink-950/45">{label}</span>
      <span className="font-medium text-ink-950">{value}</span>
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "website", label: "Website" },
];

function normalizeUrl(value) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function SocialLinks({ links }) {
  const active = SOCIAL_PLATFORMS.filter((p) => links?.[p.key]);
  if (!active.length) return null;

  return (
    <div className="rounded-2xl border border-ink-950/8 bg-white p-5">
      <h4 className="font-display text-sm font-semibold text-ink-950">Find on social</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {active.map((p) => (
          <a
            key={p.key}
            href={normalizeUrl(links[p.key])}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink-950/10 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-700 hover:bg-ink-700/5"
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}
