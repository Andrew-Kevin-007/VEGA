import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLaunchAndGo } from '../../hooks/useLaunchAndGo';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const launchAndGo = useLaunchAndGo();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${isDashboard ? 'navbar--dark' : ''}`}>
      <div className="navbar__inner">

        <Link to="/" className="navbar__logo" aria-label="VEGA Home">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="currentColor" strokeWidth="2.2"/>
            <path d="M20 8l-10 7v8l10 7 10-7v-8L20 8z" stroke="var(--accent)" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="2.5" fill="var(--accent)"/>
          </svg>
          <span className="navbar__wordmark">VEGA</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/"          className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>Home</Link>
          <Link to="/scan"      className={`navbar__link ${isActive('/scan') ? 'navbar__link--active' : ''}`}>Scanner</Link>
          <Link to="/docs"      className={`navbar__link ${isActive('/docs') ? 'navbar__link--active' : ''}`}>Docs</Link>
          <Link to="/dashboard" className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}>Dashboard</Link>
        </div>

        {/* Single primary CTA — spawns backend then navigates */}
        <div className="navbar__right">
          <button onClick={launchAndGo} className="navbar__pill-cta">
            Start scanning
            <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>

        <button
          className={`navbar__burger ${mobileOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

