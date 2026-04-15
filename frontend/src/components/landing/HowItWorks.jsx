/* Anthropic editorial article list — plain rows with border-bottom,
   no cards, no icons. Like their news/research article list. */

import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReveal } from '../../hooks/useReveal';
import './HowItWorks.css';

const COVERAGE = [
  { tag: 'Injection', name: 'SQL Injection & Blind SQLi',      desc: 'Boolean-based, time-based, and error-based inference attacks across all input vectors.' },
  { tag: 'Client-Side', name: 'Cross-Site Scripting (DOM + Reflected)', desc: 'Full DOM analyzer with sink/source tracing and payload reflection detection.' },
  { tag: 'Access Control', name: 'IDOR & Privilege Escalation', desc: 'Object reference manipulation tested across all discovered roles simultaneously.' },
  { tag: 'Auth', name: 'JWT Token Tampering',          desc: 'Algorithm confusion, none-algorithm, key confusion, and claim manipulation attacks.' },
  { tag: 'Authorization', name: 'RBAC Bypass Detection',       desc: 'Every endpoint tested from every role — unauthorized access is flagged and evidence captured.' },
  { tag: 'API', name: 'GraphQL Security Testing',     desc: 'Introspection exposure, query depth limits, injection through GraphQL arguments.' },
  { tag: 'Web', name: 'CSRF & State Manipulation',    desc: 'Token validation testing and same-site cookie analysis across authenticated flows.' },
  { tag: 'Logic', name: 'Business Logic Flaws',        desc: 'LLM-generated hypotheses target workflow bypasses specific to the application\'s behaviour.' },
];

const STEPS = [
  { num: '01', title: 'Authenticate',    desc: 'VEGA logs in as each provided role using Playwright, capturing session tokens and cookies.' },
  { num: '02', title: 'Crawl',           desc: 'Playwright navigates protected pages, intercepting all XHR/Fetch requests and form submissions.' },
  { num: '03', title: 'Hypothesize',     desc: 'An LLM agent reads each endpoint\'s parameters and generates targeted, context-aware attack plans.' },
  { num: '04', title: 'Attack & Chain',  desc: 'Attack chains execute. Each step\'s output feeds the next. Baseline diffing identifies anomalies.' },
  { num: '05', title: 'Analyze & Score', desc: 'A second LLM agent validates findings. FP Reducer scores noise. Risk Scorer assigns severity.' },
  { num: '06', title: 'Narrate & Report',desc: 'Narrator agent writes plain-English exploitation steps. Report generated with PDF export.' },
];

export default function HowItWorks() {
  const ref1 = useReveal();
  const ref2 = useReveal();

  return (
    <>
      {/* ── Coverage List (Anthropic article-list style) ── */}
      <section className="coverage" ref={ref1}>
        <div className="coverage__inner container reveal">
          <div className="coverage__header">
            <p className="coverage__label">Vulnerability Coverage</p>
            <h2 className="coverage__title">
              Twelve attack classes. Every endpoint. Every role.
            </h2>
          </div>

          <div className="coverage__list stagger">
            {COVERAGE.map((item, i) => (
              <div key={i} className="coverage__item reveal">
                <span className="coverage__item-tag">{item.tag}</span>
                <div className="coverage__item-body">
                  <h3 className="coverage__item-name">{item.name}</h3>
                  <p className="coverage__item-desc">{item.desc}</p>
                </div>
                <ArrowUpRight size={16} className="coverage__item-arrow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section className="pipeline" ref={ref2}>
        <div className="pipeline__inner container reveal">
          <div className="pipeline__header">
            <p className="pipeline__label">Pipeline</p>
            <h2 className="pipeline__title">
              From a single URL to a complete vulnerability report in six stages.
            </h2>
          </div>

          <div className="pipeline__grid stagger">
            {STEPS.map((step, i) => (
              <div key={i} className="pipeline__step reveal">
                <div className="pipeline__step-top">
                  <span className="pipeline__num">{step.num}</span>
                  <div className="pipeline__line" />
                </div>
                <h3 className="pipeline__step-title">{step.title}</h3>
                <p className="pipeline__step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
