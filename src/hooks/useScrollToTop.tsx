import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const getScrollStorageKey = (locationKey: string) => `route-scroll:${locationKey}`;

const saveCurrentScroll = (locationKey: string) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(getScrollStorageKey(locationKey), String(window.scrollY));
};

const restoreSavedScroll = (locationKey: string) => {
  if (typeof window === 'undefined') return;
  const saved = sessionStorage.getItem(getScrollStorageKey(locationKey));
  if (!saved) return;

  const y = Number.parseInt(saved, 10);
  if (Number.isFinite(y)) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior });
    });
  }
};

/**
 * Hook to handle scroll behavior on route changes
 * - If URL has a hash, scroll to that element
 * - On POP (back/forward) preserve native scroll restoration
 * - Otherwise scroll to the top
 */
export function useScrollToTop() {
  const location = useLocation();
  const { pathname, hash, key } = location;
  const navigationType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => saveCurrentScroll(key);
  }, [key]);

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

    if (navigationType === 'POP') {
      restoreSavedScroll(key);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash, navigationType, key]);
}
