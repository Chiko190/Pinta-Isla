import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/notifications";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { formatDate } from "../../utils/format";

export default function Notifications() {
  const [data, setData] = useState(null);

  function load() {
    getNotifications().then((r) => setData(r.data));
  }

  useEffect(load, []);

  async function handleRead(n) {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      load();
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-950">Notifications</h1>
        {data?.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllNotificationsRead().then(load)}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {!data ? (
          <p className="text-sm text-ink-950/50">Loading…</p>
        ) : data.notifications.length === 0 ? (
          <EmptyState title="No notifications yet" description="You'll see updates about your orders, artworks, and applications here." />
        ) : (
          data.notifications.map((n) => (
            <Link
              key={n.id}
              to={n.link || "#"}
              onClick={() => handleRead(n)}
              className={`block rounded-xl border px-4 py-3.5 text-sm transition ${
                n.isRead ? "border-ink-950/8 bg-white text-ink-950/60" : "border-ink-700/20 bg-ink-100/60 text-ink-950"
              }`}
            >
              <p>{n.message}</p>
              <p className="mt-1 text-xs text-ink-950/40">{formatDate(n.createdAt)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
