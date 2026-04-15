import { useReveal } from '../../hooks/useReveal';
import './HowItWorks.css';

const steps = [
  { num: '01', title: 'Authenticate', desc: 'Login to the target with role-based credentials. VEGA manages JWT tokens and sessions across all roles simultaneously.' },
  { num: '02', title: 'Crawl', desc: 'Playwright-powered browser crawls every page, intercepts network requests, extracts forms and API routes automatically.' },
  { num: '03', title: 'Hypothesize', desc: 'An LLM agent generates targeted attack hypotheses for each endpoint — IDOR, SQLi, XSS, auth bypass, business logic flaws.' },
  { num: '04', title: 'Attack & Analyze', desc: 'Multi-step attack chains execute payloads. Results flow through analyzer, false-positive reducer, and risk scorer agents.' },
  { num: '05', title: 'Report', desc: 'Every confirmed vulnerability gets a severity rating, evidence, and a plain-English attacker narrative explaining exploitation step by step.' },
];

export default function HowItWorks() {
  const ref = useReveal();

  return (
    <section className="how" ref={ref}>
      <div className="how__inner container reveal">
        <div className="how__header">
          <p className="how__label">How it works</p>
          <h2 className="how__title">
            From URL to full vulnerability report in five stages.
          </h2>
        </div>

        <div className="how__steps stagger">
          {steps.map((step, i) => (
            <div key={i} className="how__step reveal">
              <span className="how__num">{step.num}</span>
              <h3 className="how__step-title">{step.title}</h3>
              <p className="how__step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
