import { ArrowUpRight } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import './Features.css';

/* Anthropic-style: no icon boxes, no cards. Just editorial rows with a large
   serif statement on the left and a description on the right. */

const FEATURES = [
  {
    num: '01',
    headline: 'Crawls like a real browser, thinks like a real attacker.',
    detail: 'Playwright-powered crawler navigates every page, intercepts API calls, and builds a complete application map — authenticated across multiple roles simultaneously.',
    stat: '50+ pages/scan',
  },
  {
    num: '02',
    headline: 'Five AI agents eliminate false positives before you ever see results.',
    detail: 'Hypothesis → Attack → Analyze → Score → Narrate. The LangGraph pipeline validates every finding through a false-positive reducer and risk scorer before surfacing it.',
    stat: '<2% FP rate',
  },
  {
    num: '03',
    headline: 'Twelve vulnerability classes tested in parallel on every endpoint.',
    detail: 'SQLi, XSS (DOM + reflected), CSRF, IDOR, JWT tampering, RBAC bypass, GraphQL introspection, business logic flaws — each endpoint gets the full battery.',
    stat: '12 vuln classes',
  },
  {
    num: '04',
    headline: 'Multi-step attack chains mirror real-world exploitation paths.',
    detail: 'Chain builder constructs sequential exploits where step 2 uses the output of step 1 — simulating lateral movement and privilege escalation, not just isolated payload injection.',
    stat: 'N-step chains',
  },
  {
    num: '05',
    headline: 'Every finding comes with an attacker narrative written in plain English.',
    detail: 'The narration agent produces a step-by-step exploitation walk-through, business impact assessment, and remediation recommendation — ready to drop into a security report.',
    stat: 'Auto-narrative',
  },
];

export default function Features() {
  const ref = useReveal();

  return (
    <section className="feat" ref={ref}>
      <div className="feat__inner container reveal">

        <div className="feat__header">
          <p className="feat__label">How VEGA works</p>
          <h2 className="feat__title">Built for teams that need results, not noise.</h2>
          <p className="feat__subtitle">
            Traditional scanners fire thousands of payloads and dump every response.
            VEGA reasons about targets, validates findings, and explains each one.
          </p>
        </div>

        <div className="feat__rows stagger">
          {FEATURES.map((f, i) => (
            <div key={i} className="feat__row reveal">
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
