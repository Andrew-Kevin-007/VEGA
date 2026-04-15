import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useReveal } from '../../hooks/useReveal';
import './CTASection.css';

export default function CTASection() {
  const ref = useReveal();
  return (
    <section className="cta-section" ref={ref}>
      <div className="container">
        <div className="cta-section__inner reveal">

          <div className="cta-section__left">
            <h2 className="cta-section__title">
              Ready to find what your<br />scanner missed?
            </h2>
            <p className="cta-section__sub">
              Point VEGA at any web application. Get a full vulnerability report with
              attacker narratives, severity scores, and exploitation chains — in one scan.
              No sign-up. Your data never leaves your machine.
            </p>
          </div>

          <div className="cta-section__right">
            <Link to="/scan" className="cta-section__primary">
              Start scanning
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="cta-section__secondary">
              View live dashboard
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
