import { Shield, Search, Cpu, FileText, GitBranch } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import './Features.css';

const items = [
  {
    icon: Search,
    label: 'Discovery',
    title: 'Intelligent crawling',
    desc: 'Playwright-driven crawler discovers endpoints, forms, and API routes with authenticated session support across multiple roles.',
  },
  {
    icon: Cpu,
    label: 'Analysis',
    title: 'Multi-agent reasoning',
    desc: 'Five specialized LLM agents — hypothesis, analysis, false-positive reduction, risk scoring, and narration — work in concert.',
  },
  {
    icon: Shield,
    label: 'Detection',
    title: 'Deep vulnerability coverage',
    desc: 'SQLi, XSS, CSRF, IDOR, JWT tampering, RBAC bypass, GraphQL introspection — with contextual payload generation.',
  },
  {
    icon: GitBranch,
    label: 'Chains',
    title: 'Multi-step attack chains',
    desc: 'Builds sequential exploitation chains where each step injects context from the previous, simulating real-world attacker behavior.',
  },
  {
    icon: FileText,
    label: 'Reporting',
    title: 'Narrative intelligence',
    desc: 'Every finding comes with a plain-English attacker narrative — step-by-step how a real attacker would exploit the vulnerability.',
  },
];

export default function Features() {
  const ref = useReveal();

  return (
    <section className="features" ref={ref}>
      <div className="features__inner container reveal">
        <div className="features__header">
          <p className="features__label">Capabilities</p>
          <h2 className="features__title">
            Security intelligence that goes beyond scanning.
          </h2>
        </div>

        <div className="features__grid stagger">
          {items.map((item, i) => (
            <div key={i} className="features__item reveal">
              <div className="features__icon-wrap">
                <item.icon size={20} strokeWidth={1.5} />
              </div>
              <p className="features__item-label">{item.label}</p>
              <h3 className="features__item-title">{item.title}</h3>
              <p className="features__item-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
