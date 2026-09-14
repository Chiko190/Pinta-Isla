import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-950/8 bg-ink-950 pb-24 pt-14 text-ink-100 lg:pb-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Pinta Isla" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display text-lg font-bold text-white">Pinta Isla</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-100/60">
            Discover art. Support artists. Own something original.
          </p>
        </div>
        <FooterCol title="Marketplace" links={[["Artworks", "/artworks"], ["Artists", "/artists"], ["Categories", "/categories"], ["Commissions", "/commissions"]]} />
        <FooterCol title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]]} />
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-xs text-ink-100/40 sm:px-6">
        © {new Date().getFullYear()} Pinta Isla. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-ink-100/60 hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
