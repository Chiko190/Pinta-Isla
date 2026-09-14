import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  home: "⌂",
  artworks: "▦",
  wishlist: "♡",
  notifications: "🔔",
  account: "☰",
};

export default function MobileTabBar() {
  const { user, homeFor } = useAuth();

  const tabs = [
    { to: "/", icon: ICONS.home, label: "Home" },
    { to: "/artworks", icon: ICONS.artworks, label: "Shop" },
    user?.role === "customer"
      ? { to: "/customer/wishlist", icon: ICONS.wishlist, label: "Wishlist" }
      : { to: "/notifications", icon: ICONS.notifications, label: "Alerts" },
    user
      ? { to: homeFor(user.role), icon: ICONS.account, label: "Account" }
      : { to: "/login", icon: ICONS.account, label: "Log in" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-950/8 bg-white/95 backdrop-blur lg:hidden">
      {tabs.map((t) => (
        <NavLink
          key={t.label}
          to={t.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? "text-ink-700" : "text-ink-950/50"
            }`
          }
        >
          <span className="text-lg leading-none">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
