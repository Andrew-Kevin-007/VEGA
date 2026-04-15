import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${isDashboard ? 'navbar--dark' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="VEGA Home">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M20 2L4 14v12l16 12 16-12V14L20 2z" stroke="currentColor" strokeWidth="2.2"/>
            <path d="M20 8l-10 7v8l10 7 10-7v-8L20 8z" stroke="var(--accent)" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="3" fill="var(--accent)"/>
          </svg>
          <span className="navbar__wordmark">VEGA</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}>
            Home
          </Link>
          <Link to="/scan" className={`navbar__link ${location.pathname === '/scan' ? 'navbar__link--active' : ''}`}>
            Scanner
          </Link>
          <Link to="/dashboard" className={`navbar__link ${location.pathname.startsWith('/dashboard') ? 'navbar__link--active' : ''}`}>
            Dashboard
          </Link>
        </div>

        <div className="navbar__actions">
          <Link to="/scan" className="navbar__cta">
            Start scanning
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
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
