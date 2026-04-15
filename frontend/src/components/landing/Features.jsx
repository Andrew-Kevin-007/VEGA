import { ArrowUpRight } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import './Features.css';

const FEATURES = [
  {
    num: '01',
    headline: 'Crawls like a real browser, thinks like a real attacker.',
    detail: 'Playwright-powered crawler navigates every authenticated page, intercepts all XHR/Fetch requests, and builds a complete application map — across multiple roles simultaneously.',
    stat: '50+ pages / scan',
  },
  {
    num: '02',
    headline: 'Five AI agents eliminate false positives before you ever see results.',
    detail: 'Hypothesis → Attack → Analyze → Score → Narrate. The LangGraph pipeline validates every finding through a dedicated false-positive reducer before surfacing it.',
    stat: '< 2% false positive rate',
  },
  {
    num: '03',
    headline: 'Twelve vulnerability classes tested in parallel on every endpoint.',
    detail: 'SQLi, XSS (DOM + reflected), CSRF, IDOR, JWT tampering, RBAC bypass, GraphQL introspection — each endpoint gets the full battery, every time.',
    stat: '12 vuln classes',
  },
  {
    num: '04',
    headline: 'Multi-step attack chains mirror real-world exploitation paths.',
    detail: 'The chain builder constructs sequential exploits where step 2 uses the output of step 1 — simulating lateral movement and privilege escalation, not just payload injection.',
    stat: 'N-step auto chains',
  },
  {
    num: '05',
    headline: 'Every finding narrated in plain English, ready to show stakeholders.',
    detail: 'The narration agent produces a step-by-step exploitation walk-through, business impact assessment, and remediation recommendation — drop it straight into your security report.',
    stat: 'Auto-generated narrative',
  },
];

export default function Features() {
  const ref = useReveal();

  return (
    <section className="feat" ref={ref}>
      <div className="feat__inner container">

        <div className="feat__header reveal">
          <p className="feat__label">How it works</p>
          <h2 className="feat__title">Built for teams that need results, not noise.</h2>
          <p className="feat__subtitle">
            Traditional scanners fire thousands of payloads and dump every response.
            VEGA reasons about your target, validates each finding, and explains it clearly.
          </p>
        </div>

        <div className="feat__rows">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feat__row reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="feat__row-left">
                <span className="feat__row-num">{f.num}</span>
                <h3 className="feat__row-headline">{f.headline}</h3>
              </div>
              <div className="feat__row-right">
                <p className="feat__row-detail">{f.detail}</p>
                <span className="feat__row-stat">{f.stat}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
