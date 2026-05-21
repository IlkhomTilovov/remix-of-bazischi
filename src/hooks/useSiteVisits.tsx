import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'site_visit_counted';

/**
 * Sayt tashriflari sanagichi:
 * - Har bir sessiya (brauzer tabi) uchun bir marta oshiriladi
 * - Real-vaqtda jami sonni qaytaradi
 */
export function useSiteVisits() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const alreadyCounted = typeof sessionStorage !== 'undefined'
          && sessionStorage.getItem(SESSION_KEY) === '1';

        if (!alreadyCounted) {
          const { data, error } = await supabase.rpc('increment_site_visit');
          if (!error && data != null) {
            try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
            if (!cancelled) setTotal(Number(data));
            return;
          }
        }

        // Faqat o'qish
        const { data } = await supabase
          .from('site_visits')
          .select('total_visits')
          .eq('id', 1)
          .maybeSingle();
        if (!cancelled && data) setTotal(Number(data.total_visits));
      } catch {
        // sukunatda o'tib ketamiz
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return total;
}
