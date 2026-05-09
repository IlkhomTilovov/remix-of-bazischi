import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to handle scroll behavior on route changes
 * - If URL has a hash, scroll to that element
 * - Otherwise always scroll to the top of the page (hero section)
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Defer to allow target element to mount
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

    // Immediately jump to the top so the new page starts from its hero/top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash]);
}
