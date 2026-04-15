import { useEffect, useRef } from 'react';

/**
 * Attach ref to a container. When it enters the viewport,
 * this adds 'visible' to every .reveal child (and itself if it has .reveal).
 * Supports stagger via nth-child delays in CSS.
 */
export function useReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const activate = () => {
      // Activate self
      if (el.classList.contains('reveal')) {
        el.classList.add('visible');
      }
      // Activate all reveal children
      el.querySelectorAll('.reveal').forEach(child => {
        child.classList.add('visible');
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activate();
          observer.unobserve(el);
        }
      },
      {
        threshold: options.threshold || 0.08,
        rootMargin: options.rootMargin || '0px 0px -60px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
