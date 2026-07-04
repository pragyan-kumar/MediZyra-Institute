import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { brand } from "../data/siteData";
import { useAppContext } from "../context/useAppContext";
import brandLogo from "../assets/reference/logo.jpeg";

function NavItem({ children, to }) {
  return (
    <NavLink
      className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
      to={to}
    >
      {children}
    </NavLink>
  );
}

export function SiteHeader() {
  const { appointmentCount, currentUser, logout } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsSigningOut(true);
    await logout();
    setIsOpen(false);
    navigate("/");
    setIsSigningOut(false);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand-lockup" to="/">
          <img alt="MediZyra logo" className="brand-mark" src={brandLogo} />
          <div className="brand-copy">
            <p className="eyebrow">Care operations platform</p>
            <h1>{brand.name}</h1>
          </div>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`site-nav ${isOpen ? "site-nav-open" : ""}`}
          onClickCapture={() => setIsOpen(false)}
        >
          <NavItem to="/">Overview</NavItem>
          <NavItem to="/doctors">Specialists</NavItem>
          <NavItem to="/contact">Contact us</NavItem>
          <NavItem to="/portal">Portal</NavItem>
          {currentUser ? (
            <>
              <div className="nav-user">
                <span>{currentUser.name}</span>
                <small>{currentUser.role}</small>
              </div>
              <button className="nav-ghost" disabled={isSigningOut} type="button" onClick={handleLogout}>
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <Link className="nav-ghost" to="/signin">
              Sign in
            </Link>
          )}
          <Link className="nav-cta" to="/portal">
            {appointmentCount} care records
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { resetDemoData } = useAppContext();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    await resetDemoData();
    setIsResetting(false);
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img alt="MediZyra logo" className="brand-mark" src={brandLogo} />
            <div>
              <h2>{brand.name}</h2>
              <p>{brand.tagline}</p>
            </div>
          </div>
          <p className="footer-copy">
            MediZyra is designed to present appointments, patient communication,
            doctor notes, and admin triage in a clear digital care experience.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <div className="footer-links">
            <Link to="/doctors">Find specialists</Link>
            <Link to="/portal">Open portal</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/signin">Access demo login</Link>
            <button className="footer-button" disabled={isResetting} type="button" onClick={handleReset}>
              {isResetting ? "Resetting..." : "Reset demo data"}
            </button>
          </div>
        </div>

        <div>
          <h3>Contact</h3>
          <div className="footer-links">
            <a href={`tel:${brand.emergencyLine}`}>{brand.emergencyLine}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
            <span>{brand.address}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
