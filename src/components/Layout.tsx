import { Link, Outlet } from "react-router-dom";
import { branding } from "../config/branding";

function resolvePublicAsset(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta.env.BASE_URL;
  const rel = path.replace(/^\/+/, "");
  return `${base}${rel}`;
}

export function Layout() {
  const logoUrl = branding.logoSrc ? resolvePublicAsset(branding.logoSrc) : null;

  return (
    <div className="app-shell">
      <header
        className="app-header"
        style={{
          backgroundColor: branding.headerBackground,
          color: branding.headerText,
        }}
      >
        <div className="app-header-inner">
          <Link to="/" className="app-title-link" style={{ color: branding.headerText }}>
            {logoUrl ? (
              <img src={logoUrl} alt="" className="app-logo" width={40} height={40} />
            ) : null}
            <span>{branding.siteTitle}</span>
          </Link>
          <nav className="app-header-nav" aria-label="Primary">
            <Link to="/standings" className="app-header-nav-link" style={{ color: branding.linkColor }}>
              View standings
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
