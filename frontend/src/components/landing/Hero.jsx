import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 60); return () => clearTimeout(t); }, []);

  return (
    <section className="hero">
      <div className="hero__top container">

        {/* ── LEFT: Giant headline ── */}
        <div className={`hero__left ${ready ? 'hero__left--in' : ''}`}>
          <h1 className="hero__headline">
            Security research<br />
            and <span className="hero__ul">attack simulation</span><br />
            that leaves nothing<br />
            <span className="hero__ul">hidden.</span>
          </h1>
        </div>

        {/* ── RIGHT: Mission text ── */}
        <div className={`hero__right ${ready ? 'hero__right--in' : ''}`}>
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

      {/* ── DARK FEATURE CARD (below, full width) ── */}
      <div className={`hero__card-wrap container ${ready ? 'hero__card-wrap--in' : ''}`}>
        <div className="hero__card">
          <div className="hero__card-inner">

            <div className="hero__card-left">
              <span className="hero__card-eyebrow">Live Attack Pipeline</span>
              <h2 className="hero__card-title">
                Watch VEGA's agents discover, attack, and narrate — in real time.
              </h2>
              <Link to="/scan" className="hero__card-cta">
                Run a scan
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>

            <div className="hero__card-right">
              {/* Animated agent activity preview */}
              <div className="hero__terminal">
                <div className="hero__terminal-bar">
                  <span /><span /><span />
                  <p>VEGA Agent Stream</p>
                </div>
                <div className="hero__terminal-body">
                  <AgentLine delay={0}   agent="Crawler"     text="Discovered /api/users — GET, requires auth" color="#4ade80" />
                  <AgentLine delay={600}  agent="Hypothesis"  text="Generating IDOR attack plan for object id param…" color="#60a5fa" />
                  <AgentLine delay={1200} agent="Attacker"    text="Testing /api/users/2 as role:guest → 200 OK ⚠" color="#f97316" />
                  <AgentLine delay={1800} agent="Analyzer"    text="Confirmed: IDOR — user data exposed cross-role" color="#f43f5e" />
                  <AgentLine delay={2400} agent="Narrator"    text="Generating exploitation narrative…" color="#a78bfa" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function AgentLine({ agent, text, color, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className={`hero__agent-line ${visible ? 'hero__agent-line--in' : ''}`}>
      <span className="hero__agent-badge" style={{ color, borderColor: `${color}30`, background: `${color}12` }}>
        {agent}
      </span>
      <span className="hero__agent-text">{text}</span>
    </div>
  );
}
