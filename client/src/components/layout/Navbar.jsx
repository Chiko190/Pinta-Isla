import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

const NAV_LINKS = [
  { to: "/artworks", label: "Artworks" },
  { to: "/artists", label: "Artists" },
  { to: "/categories", label: "Categories" },
  { to: "/commissions", label: "Commissions" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout, homeFor } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-950/8 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Pinta Isla" className="h-9 w-9 rounded-full object-cover" />
          <span className="font-display text-lg font-bold text-ink-950">Pinta Isla</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-ink-700" : "text-ink-950/70 hover:text-ink-950"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-ink-950/10 py-1 pl-1 pr-3 hover:bg-ink-50"
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-xs font-semibold text-ink-700">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.firstName?.[0]
                  )}
                </span>
                <span className="text-sm font-medium text-ink-950">{user.firstName}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-ink-950/8 bg-white py-1 shadow-xl">
                  <MenuLink to={homeFor(user.role)} onClick={() => setMenuOpen(false)}>Dashboard</MenuLink>
                  {user.role === "customer" && (
                    <>
                      <MenuLink to="/customer/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</MenuLink>
                      <MenuLink to="/orders" onClick={() => setMenuOpen(false)}>Orders</MenuLink>
                    </>
                  )}
                  <MenuLink to="/messages" onClick={() => setMenuOpen(false)}>Messages</MenuLink>
                  <MenuLink to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</MenuLink>
                  <MenuLink
                    to={user.role === "artist" ? "/artist/profile" : "/customer/profile"}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile Settings
                  </MenuLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-ink-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Register
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-950 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className="block h-0.5 w-6 bg-current" />
          <span className="my-1.5 block h-0.5 w-6 bg-current" />
          <span className="block h-0.5 w-6 bg-current" />
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-950/8 bg-paper px-4 py-3 lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-2 py-2.5 text-sm font-medium text-ink-950 hover:bg-ink-50"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-ink-950/8 pt-3">
            {user ? (
              <>
                <Button as={Link} to={homeFor(user.role)} variant="primary" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Log in
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="block px-4 py-2 text-sm text-ink-950 hover:bg-ink-50">
      {children}
    </Link>
  );
}
