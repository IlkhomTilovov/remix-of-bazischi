import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Hook to handle scroll behavior on route changes
 * - If URL has a hash, scroll to that element
 * - On POP (back/forward) preserve native scroll restoration
 * - Otherwise scroll to the top
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      const timeout = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }
      }, 0);
      return () => clearTimeout(timeout);
    }

    // Don't override scroll on back/forward navigation — let browser restore
    if (navigationType === 'POP') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash, navigationType]);
}
