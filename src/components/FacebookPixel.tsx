import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSystemSettings } from '@/hooks/useSystemSettings';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const SCRIPT_ID = 'fb-pixel-script';
const NOSCRIPT_ID = 'fb-pixel-noscript';
const DOMAIN_META_ID = 'fb-domain-verification';

/**
 * Facebook Pixel — admin paneldagi `facebook_pixel_id` qiymati asosida
 * pixel skriptini <head> ichiga joylashtiradi va har bir route o'zgarishida
 * PageView yuboradi. Shuningdek, `facebook_domain_verification` qiymati
 * bo'yicha <meta name="facebook-domain-verification"> tagini <head> ga qo'yadi.
 */
export function FacebookPixel() {
  const { settings } = useSystemSettings();
  const location = useLocation();
  const pixelId = settings?.facebook_pixel_id?.trim();
  const domainVerification = settings?.facebook_domain_verification?.trim();

  // Domain verification meta-tag
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById(DOMAIN_META_ID) as HTMLMetaElement | null;

    if (!domainVerification) {
      existing?.remove();
      return;
    }

    if (existing) {
      if (existing.content !== domainVerification) {
        existing.content = domainVerification;
      }
      return;
    }

    const meta = document.createElement('meta');
    meta.id = DOMAIN_META_ID;
    meta.name = 'facebook-domain-verification';
    meta.content = domainVerification;
    document.head.appendChild(meta);
  }, [domainVerification]);


  // Pixel skriptini <head> ichiga joylash
  useEffect(() => {
    if (!pixelId) return;
    if (typeof window === 'undefined') return;

    const existingId = (window as any).__fbPixelId;

    // Agar fbq allaqachon yuklangan bo'lsa — faqat init qilamiz
    if (window.fbq) {
      if (existingId !== pixelId) {
        try {
          window.fbq('init', pixelId);
          window.fbq('track', 'PageView');
          (window as any).__fbPixelId = pixelId;
        } catch (e) {
          console.error('FB Pixel re-init error', e);
        }
      }
      return;
    }

    // <head> ichiga base code script qo'shamiz
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.text = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    (window as any).__fbPixelId = pixelId;

    // <noscript> fallback img — HTML5 qoidasiga ko'ra <body> ga qo'yiladi
    const noscript = document.createElement('noscript');
    noscript.id = NOSCRIPT_ID;
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
    document.body.appendChild(noscript);

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
      document.getElementById(NOSCRIPT_ID)?.remove();
    };
  }, [pixelId]);

  // Route o'zgarishida PageView
  useEffect(() => {
    if (!pixelId) return;
    if (typeof window === 'undefined' || !window.fbq) return;
    try {
      window.fbq('track', 'PageView');
    } catch (e) {
      // ignore
    }
  }, [location.pathname, pixelId]);

  return null;
}
