import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import './CTASection.css';

export default function CTASection() {
  const ref = useReveal();
  return (
    <section className="cta-section" ref={ref}>
      <div className="cta-section__inner container reveal">
        <div className="cta-section__left">
          <h2 className="cta-section__title">
            Ready to find what your scanner missed?
          </h2>
          <p className="cta-section__sub">
            Point VEGA at any web application. Get a full vulnerability report with attacker
            narratives, severity scores, and exploitation chains in one run.
          </p>
        </div>
        <div className="cta-section__right">
          <Link to="/scan" className="cta-section__primary">
            Start scanning free
            <ArrowRight size={16} />
          </Link>
          <p className="cta-section__note">
            No sign-up. Runs on your machine. Your data never leaves.
          </p>
        </div>
      </div>
    </section>
  );
}
