import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'mm_session_id';
const DEVICE_KEY = 'mm_device_id';
const SITE_VISIT_KEY = 'mm_site_visit_counted';
const REFERRER_KEY = 'mm_first_referrer';
const REFERRER_SOURCE_KEY = 'mm_first_referrer_source';

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
 * Referrer URL'dan manba nomini aniqlaydi.
 * Misol: "https://t.me/..." => "telegram"
 */
function detectSource(referrer: string, currentHost: string): string {
  if (!referrer) return 'direct';
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (!host || host === currentHost.replace(/^www\./, '')) return 'direct';

  const map: Array<{ test: RegExp; name: string }> = [
    { test: /(^|\.)(instagram\.com|cdninstagram\.com|l\.instagram\.com)$/, name: 'instagram' },
    { test: /(^|\.)(t\.me|telegram\.org|telegram\.me)$/, name: 'telegram' },
    { test: /(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com|fb\.me)$/, name: 'facebook' },
    { test: /(^|\.)(tiktok\.com)$/, name: 'tiktok' },
    { test: /(^|\.)(youtube\.com|youtu\.be|m\.youtube\.com)$/, name: 'youtube' },
    { test: /(^|\.)(twitter\.com|x\.com|t\.co)$/, name: 'twitter' },
    { test: /(^|\.)(google\.[a-z.]+)$/, name: 'google' },
    { test: /(^|\.)(bing\.com)$/, name: 'bing' },
    { test: /(^|\.)(yandex\.[a-z.]+)$/, name: 'yandex' },
    { test: /(^|\.)(duckduckgo\.com)$/, name: 'duckduckgo' },
    { test: /(^|\.)(whatsapp\.com|wa\.me)$/, name: 'whatsapp' },
    { test: /(^|\.)(linkedin\.com|lnkd\.in)$/, name: 'linkedin' },
    { test: /(^|\.)(pinterest\.[a-z.]+)$/, name: 'pinterest' },
    { test: /(^|\.)(reddit\.com)$/, name: 'reddit' },
  ];
  for (const { test, name } of map) {
    if (test.test(host)) return name;
  }
  return 'other';
}

function getReferrerInfo(): { referrer: string | null; source: string } {
  try {
    // Sessiyada birinchi marta saqlangan referrer'ni ishlatamiz
    const cachedRef = sessionStorage.getItem(REFERRER_KEY);
    const cachedSrc = sessionStorage.getItem(REFERRER_SOURCE_KEY);
    if (cachedRef !== null && cachedSrc) {
      return { referrer: cachedRef || null, source: cachedSrc };
    }
    const ref = document.referrer || '';
    const source = detectSource(ref, window.location.hostname);
    sessionStorage.setItem(REFERRER_KEY, ref);
    sessionStorage.setItem(REFERRER_SOURCE_KEY, source);
    return { referrer: ref || null, source };
  } catch {
    const ref = (typeof document !== 'undefined' && document.referrer) || '';
    return { referrer: ref || null, source: detectSource(ref, window.location.hostname) };
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
    const { referrer, source } = getReferrerInfo();

    supabase
      .from('page_visits')
      .insert({
        path,
        session_id: sessionId,
        device_id: deviceId,
        referrer: referrer ? referrer.slice(0, 500) : null,
        referrer_source: source,
      })
      .then(() => {}, () => {});

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
