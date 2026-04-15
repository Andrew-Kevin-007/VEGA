import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero__inner container">
        {/* Anthropic-style: small caps label above the headline */}
        <p className={`hero__label ${loaded ? 'hero__label--visible' : ''}`}>
          security research
        </p>

        <h1 className={`hero__headline ${loaded ? 'hero__headline--visible' : ''}`}>
          Vulnerability intelligence,<br />
          orchestrated by AI agents.
        </h1>

        <p className={`hero__sub ${loaded ? 'hero__sub--visible' : ''}`}>
          VEGA is an autonomous security platform that crawls, hypothesizes, attacks,
          and narrates — discovering real vulnerabilities with multi-agent orchestration
          and false-positive reduction.
        </p>

        <div className={`hero__actions ${loaded ? 'hero__actions--visible' : ''}`}>
          <Link to="/scan" className="hero__cta-primary">
            Start a scan
            <ArrowRight size={18} strokeWidth={2} />
          </Link>
          <Link to="/dashboard" className="hero__cta-secondary">
            View dashboard
          </Link>
        </div>
      </div>

      {/* Anthropic-style featured card below hero */}
      <div className={`hero__featured container ${loaded ? 'hero__featured--visible' : ''}`}>
        <div className="hero__card">
          <div className="hero__card-meta">
            <span className="hero__card-tag">Platform</span>
          </div>
          <h2 className="hero__card-title">
            Five specialized AI agents work in concert to eliminate false positives
            and surface real threats.
          </h2>
          <Link to="/scan" className="hero__card-link">
            Explore the scanner
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
