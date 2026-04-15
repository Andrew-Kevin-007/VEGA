import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [phase, setPhase] = useState(0);
  const cardRef   = useRef(null);
  const wrapRef   = useRef(null);
  const rafRef    = useRef(null);

  // Staged entrance: text → underlines → right + card
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 620);
    const t3 = setTimeout(() => setPhase(3), 1050);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  // Parallax zoom — rAF-based for buttery smoothness
  useEffect(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap) return;

    let lastScale  = 0.86;
    let targetScale = 0.86;

    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const vh   = window.innerHeight;
      // 0 when fully below, 1 when card top hits 20% from bottom
      const raw  = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.75)));
      targetScale = 0.86 + 0.14 * raw;

      // Lerp for inertia feel
      lastScale += (targetScale - lastScale) * 0.12;

      const s  = +lastScale.toFixed(4);
      const br = Math.round(24 * (1 - raw));
      card.style.transform    = `scale(${s})`;
      card.style.borderRadius = `${br}px ${br}px 0 0`;
      card.style.opacity      = String(0.5 + 0.5 * raw * 2 > 1 ? 1 : 0.5 + raw);

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="hero">

      {/* ── TWO-COLUMN HERO ── */}
      <div className="hero__top container">

        {/* LEFT — giant headline with drawn underlines */}
        <div className={`hero__left ${phase >= 1 ? 'hero__left--in' : ''}`}>
          <h1 className="hero__headline">
            <span className="hero__line">Security research and</span>
            <span className="hero__line">
              <span className={`hero__ul ${phase >= 2 ? 'hero__ul--drawn' : ''}`}
                style={{ '--ul-delay': '0s' }}>
                attack simulation
              </span>
            </span>
            <span className="hero__line">that leaves nothing</span>
            <span className="hero__line">
              <span className={`hero__ul ${phase >= 2 ? 'hero__ul--drawn' : ''}`}
                style={{ '--ul-delay': '0.22s' }}>
                hidden.
              </span>
            </span>
          </h1>
        </div>

        {/* RIGHT — mission text */}
        <div className={`hero__right ${phase >= 3 ? 'hero__right--in' : ''}`}>
          <p className="hero__mission">
            VEGA autonomously crawls your web application, generates
            contextual attack hypotheses, and confirms real vulnerabilities
            through a five-agent AI pipeline — with less than 2% false
            positive rate.
          </p>
          <div className="hero__actions">
            <Link to="/scan" className="hero__cta-dark">
              Start scanning
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
            <Link to="/dashboard" className="hero__cta-ghost">
              View dashboard
            </Link>
          </div>
        </div>

      </div>

      {/* ── PARALLAX DARK CARD ── */}
      <div
        className={`hero__card-wrap container ${phase >= 3 ? 'hero__card-wrap--in' : ''}`}
        ref={wrapRef}
      >
        <div className="hero__card" ref={cardRef}>
          <div className="hero__card-inner">

            <div className="hero__card-left">
              <span className="hero__card-eyebrow">Live Attack Pipeline</span>
              <h2 className="hero__card-title">
                Watch VEGA's agents discover, attack, and narrate — in real time.
              </h2>
              <div className="hero__card-stats">
                {[['12+','Vulnerability classes'],['5','AI agents'],['&lt;2%','False positives']].map(([n,l],i) => (
                  <div key={i} className="hero__card-stat">
                    <span className="hero__card-stat-num" dangerouslySetInnerHTML={{__html:n}}/>
                    <span className="hero__card-stat-label">{l}</span>
                  </div>
                ))}
              </div>
              <Link to="/scan" className="hero__card-cta">
                Run a scan <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            <div className="hero__card-right">
              <div className="hero__terminal">
                <div className="hero__terminal-bar">
                  <span /><span /><span />
                  <p>VEGA Agent Stream</p>
                </div>
                <div className="hero__terminal-body">
                  <AgentLine delay={0}    agent="Crawler"    text="Discovered /api/users — GET, requires auth" color="#4ade80" />
                  <AgentLine delay={700}  agent="Hypothesis" text="Generating IDOR attack plan for object id…" color="#60a5fa" />
                  <AgentLine delay={1400} agent="Attacker"   text="Testing /api/users/2 as role:guest → 200 OK ⚠" color="#f97316" />
                  <AgentLine delay={2100} agent="Analyzer"   text="Confirmed: IDOR — user data exposed cross-role" color="#f43f5e" />
                  <AgentLine delay={2800} agent="Narrator"   text="Generating exploitation narrative…" color="#a78bfa" />
                  <AgentLine delay={3500} agent="Crawler"    text="Discovered /api/baskets — POST, auth required" color="#4ade80" cursor />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}

function AgentLine({ agent, text, color, delay, cursor }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1300 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`hero__agent-line ${visible ? 'hero__agent-line--in' : ''}`}>
      <span className="hero__agent-badge"
        style={{ color, borderColor: `${color}35`, background: `${color}14` }}>
        {agent}
      </span>
      <span className="hero__agent-text">{text}</span>
      {cursor && visible && <span className="hero__agent-cursor" style={{ background: color }} />}
    </div>
  );
}
