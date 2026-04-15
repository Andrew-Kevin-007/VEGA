import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import './Hero.css';

const FEATURED = [
  {
    tag: 'Detection',
    title: 'Confirmed SQL Injection in authentication endpoint bypasses admin login in one step.',
    meta: 'Critical · 2 min exploit chain',
    bg: '#c4623f',
    color: '#fff',
  },
  {
    tag: 'Platform',
    title: 'Five AI agents work in concert — from hypothesis to narrative — eliminating false positives automatically.',
    meta: 'Core Architecture',
    bg: '#191a1a',
    color: '#faf9f6',
  },
  {
    tag: 'Coverage',
    title: 'SQLi, XSS, IDOR, CSRF, JWT tampering, RBAC bypass, and GraphQL injection — all in one scan.',
    meta: '12 vulnerability classes',
    bg: '#f3f0eb',
    color: '#191a1a',
    border: true,
  },
];

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero__container container">

        {/* ── Left column: mission statement ── */}
        <div className={`hero__left ${loaded ? 'hero__left--in' : ''}`}>
          <div className="hero__pills">
            <span className="hero__pill">security · AI</span>
            <span className="hero__pill">open source</span>
          </div>

          <p className="hero__statement">
            VEGA is an autonomous penetration testing platform that thinks like an attacker
            and reports like a professional. No signatures. No noise. Just real vulnerabilities,
            validated and narrated by AI agents.
          </p>

          <div className="hero__links">
            <Link to="/scan" className="hero__link-primary">
              Start a free scan
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link to="/dashboard" className="hero__link-secondary">
              See live dashboard
              <ArrowUpRight size={14} strokeWidth={2} />
            </Link>
          </div>

          <div className="hero__metrics">
            <div className="hero__metric">
              <span className="hero__metric-num">12+</span>
              <span className="hero__metric-label">Vulnerability classes</span>
            </div>
            <div className="hero__metric-div" />
            <div className="hero__metric">
              <span className="hero__metric-num">5</span>
              <span className="hero__metric-label">AI agents in pipeline</span>
            </div>
            <div className="hero__metric-div" />
            <div className="hero__metric">
              <span className="hero__metric-num">&lt;2%</span>
              <span className="hero__metric-label">False positive rate</span>
            </div>
          </div>
        </div>

        {/* ── Right column: editorial cards ── */}
        <div className={`hero__right ${loaded ? 'hero__right--in' : ''}`}>
          {FEATURED.map((card, i) => (
            <Link
              to="/scan"
              key={i}
              className={`hero__card ${card.border ? 'hero__card--bordered' : ''}`}
              style={{
                background: card.bg,
                color: card.color,
                transitionDelay: `${200 + i * 100}ms`,
              }}
            >
              <span
                className="hero__card-tag"
                style={{ color: card.color === '#fff' || card.color === '#faf9f6' ? 'rgba(255,255,255,0.55)' : 'var(--accent)' }}
              >
                {card.tag}
              </span>
              <h3 className="hero__card-title" style={{ color: card.color }}>
                {card.title}
              </h3>
              <div className="hero__card-footer">
                <span
                  className="hero__card-meta"
                  style={{ color: card.color === '#191a1a' ? 'var(--text-secondary)' : 'rgba(255,255,255,0.5)' }}
                >
                  {card.meta}
                </span>
                <ArrowUpRight
                  size={16}
                  style={{ color: card.color }}
                  className="hero__card-arrow"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
