import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="hero">
      <div className="hero__inner container">

        {/* ── Category pills ── */}
        <div className={`hero__pills ${loaded ? 'hero__pills--in' : ''}`}>
          <span className="hero__pill">Security</span>
          <span className="hero__pill">AI Agents</span>
          <span className="hero__pill">Open Source</span>
        </div>

        {/* ── Main headline ── */}
        <h1 className={`hero__headline ${loaded ? 'hero__headline--in' : ''}`}>
          Autonomous penetration testing,<br />
          powered by AI agents.
        </h1>

        {/* ── Sub ── */}
        <p className={`hero__sub ${loaded ? 'hero__sub--in' : ''}`}>
          VEGA crawls your application, generates contextual attack hypotheses,
          validates findings through a multi-agent pipeline, and produces
          an executive-grade vulnerability report — all from a single URL.
        </p>

        {/* ── CTAs ── */}
        <div className={`hero__actions ${loaded ? 'hero__actions--in' : ''}`}>
          <Link to="/scan" className="hero__cta-primary">
            Start scanning
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link to="/dashboard" className="hero__cta-secondary">
            View dashboard
          </Link>
        </div>

        {/* ── Metrics ── */}
        <div className={`hero__metrics ${loaded ? 'hero__metrics--in' : ''}`}>
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
          <div className="hero__metric-div" />
          <div className="hero__metric">
            <span className="hero__metric-num">0</span>
            <span className="hero__metric-label">Config required</span>
          </div>
        </div>

        {/* ── Featured story row ── */}
        <div className={`hero__stories ${loaded ? 'hero__stories--in' : ''}`}>
          <Link to="/scan" className="hero__story hero__story--dark">
            <span className="hero__story-tag">Detection</span>
            <p className="hero__story-title">SQL injection in authentication endpoint — bypassed in one step, confirmed zero false positive.</p>
            <span className="hero__story-meta">Critical · 2-step chain</span>
          </Link>

          <Link to="/scan" className="hero__story hero__story--accent">
            <span className="hero__story-tag">Platform</span>
            <p className="hero__story-title">Five AI agents — from hypothesis to narrative — eliminating noise before you see results.</p>
            <span className="hero__story-meta">Core architecture</span>
          </Link>

          <Link to="/scan" className="hero__story hero__story--light">
            <span className="hero__story-tag">Coverage</span>
            <p className="hero__story-title">SQLi, XSS, IDOR, CSRF, JWT tampering, RBAC bypass, and GraphQL in every scan.</p>
            <span className="hero__story-meta">12 classes tested</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
