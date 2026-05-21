import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'mm_session_id';
const DEVICE_KEY = 'mm_device_id';
const SITE_VISIT_KEY = 'mm_site_visit_counted';

function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = genId('s');
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return genId('s');
  }
}

/**
 * Qurilma ID — localStorage da doimiy saqlanadi.
 * Foydalanuvchi qancha marta kirsa ham, bitta qurilma deb sanaladi.
 */
function getDeviceId(): string {
  try {
    let did = localStorage.getItem(DEVICE_KEY);
    if (!did) {
      did = genId('d');
      localStorage.setItem(DEVICE_KEY, did);
    }
    return did;
  } catch {
    return genId('d');
  }
}

/**
 * Har bir route o'zgarishida sahifa tashrifini bazaga yozadi.
 * Admin sahifalari yozilmaydi.
 */
export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return;

    const sessionId = getSessionId();
    const deviceId = getDeviceId();

    // Sahifa tashrifini yozish
    supabase
      .from('page_visits')
      .insert({ path, session_id: sessionId, device_id: deviceId })
      .then(() => {}, () => {});

    // Birinchi tashrifda umumiy sanagichni ham oshiramiz
    try {
      if (!sessionStorage.getItem(SITE_VISIT_KEY)) {
        supabase.rpc('increment_site_visit').then(() => {
          try { sessionStorage.setItem(SITE_VISIT_KEY, '1'); } catch {}
        }, () => {});
      }
    } catch {}
  }, [location.pathname]);

  return null;
}
