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
 * Qisqa kod yoki to'liq nomdan standart manba nomini qaytaradi.
 */
function normalizeSource(raw: string): string | null {
  const v = raw.toLowerCase().trim();
  if (!v) return null;
  const aliases: Record<string, string> = {
    tg: 'telegram', telegram: 'telegram',
    ig: 'instagram', insta: 'instagram', instagram: 'instagram',
    fb: 'facebook', facebook: 'facebook',
    tt: 'tiktok', tiktok: 'tiktok',
    yt: 'youtube', youtube: 'youtube',
    wa: 'whatsapp', whatsapp: 'whatsapp',
    twitter: 'twitter', x: 'twitter',
    google: 'google', bing: 'bing', yandex: 'yandex', duckduckgo: 'duckduckgo',
    linkedin: 'linkedin', pinterest: 'pinterest', reddit: 'reddit',
    direct: 'direct', other: 'other',
  };
  return aliases[v] || v;
}

/**
 * Referrer URL'dan manba nomini aniqlaydi.
 * android-app:// va ios-app:// sxemalarini ham qo'llab-quvvatlaydi.
 */
function detectSource(referrer: string, currentHost: string): string {
  if (!referrer) return 'direct';

  // Mobil ilovalardan kelgan linklar: android-app://org.telegram.messenger
  const appMatch = referrer.match(/^(?:android|ios)-app:\/\/([^/]+)/i);
  if (appMatch) {
    const pkg = appMatch[1].toLowerCase();
    if (pkg.includes('telegram')) return 'telegram';
    if (pkg.includes('instagram')) return 'instagram';
    if (pkg.includes('facebook') || pkg.includes('katana')) return 'facebook';
    if (pkg.includes('whatsapp')) return 'whatsapp';
    if (pkg.includes('tiktok') || pkg.includes('zhiliaoapp')) return 'tiktok';
    if (pkg.includes('youtube')) return 'youtube';
    if (pkg.includes('twitter') || pkg.includes('com.x.')) return 'twitter';
    if (pkg.includes('google')) return 'google';
    return 'other';
  }

  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'direct';
  }
  if (!host || host === currentHost.replace(/^www\./, '')) return 'direct';

  const map: Array<{ test: RegExp; name: string }> = [
    { test: /(^|\.)(instagram\.com|cdninstagram\.com|l\.instagram\.com)$/, name: 'instagram' },
    { test: /(^|\.)(t\.me|telegram\.org|telegram\.me|web\.telegram\.org)$/, name: 'telegram' },
    { test: /(^|\.)(facebook\.com|fb\.com|m\.facebook\.com|l\.facebook\.com|fb\.me|lm\.facebook\.com)$/, name: 'facebook' },
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

/**
 * URL parametrlaridan manba aniqlanadi: ?utm_source=telegram, ?from=tg, ?ref=ig
 */
function detectFromUrlParams(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw =
      params.get('utm_source') ||
      params.get('source') ||
      params.get('from') ||
      params.get('ref') ||
      '';
    return raw ? normalizeSource(raw) : null;
  } catch {
    return null;
  }
}

/**
 * User-Agent orajasidan botlarni aniqlaydi.
 */
function isBot(): boolean {
  try {
    const ua = (navigator.userAgent || '').toLowerCase();
    const botPatterns = [
      /bot/, /crawler/, /spider/, /scraper/,
      /googlebot/, /bingbot/, /yandexbot/, /duckduckbot/,
      /facebookexternalhit/, /facebot/, /twitterbot/,
      /linkedinbot/, /pinterest/, /telegrambot/, /whatsapp/,
      /applebot/, /semrush/, /ahrefs/, /mj12bot/, /dotbot/,
      /baiduspider/, /sogou/, /exabot/, /ia_archiver/,
      /chrome-lighthouse/, /pagespeed/, /gtmetrix/, /pingdom/,
      /slackbot/, /discordbot/, /skypeuripreview/,
      /phantomjs/, /headlesschrome/, /selenium/,
    ];
    return botPatterns.some((p) => p.test(ua));
  } catch {
    return false;
  }
}

function getReferrerInfo(): { referrer: string | null; source: string } {
  try {
    const cachedRef = sessionStorage.getItem(REFERRER_KEY);
    const cachedSrc = sessionStorage.getItem(REFERRER_SOURCE_KEY);
    if (cachedRef !== null && cachedSrc) {
      return { referrer: cachedRef || null, source: cachedSrc };
    }
    const ref = document.referrer || '';
    // 1-navbat: URL paramlari (eng aniq)
    const fromUrl = detectFromUrlParams();
    const source = fromUrl || detectSource(ref, window.location.hostname);
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

  // Jonli "hozir onlayn" uchun Presence kanali (faqat bir marta ulanadi)
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    if (isBot()) return; // Botlarni "onlayn" ga hisoblamaymiz
    const deviceId = getDeviceId();
    const sessionId = getSessionId();
    const channel = supabase.channel('online-users', {
      config: { presence: { key: deviceId } },
    });
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ session_id: sessionId, online_at: Date.now() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

