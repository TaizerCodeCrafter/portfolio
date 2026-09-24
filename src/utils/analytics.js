// Google Analytics 4 & First-Party Visitor Analytics Utility
// Features:
// - Dynamic gtag.js injection with configurable GA4 ID
// - SPA route change tracking (virtual page_view)
// - First-party tracking hit (ad-blocker resilient)
// - Custom conversion event tracking (WhatsApp click, contact form submit, project click)

let isGaInitialized = false;
let currentGaId = null;

export const initGA = (measurementId) => {
  const gaId = (measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-D8L7P9QW1X').trim();
  if (!gaId || isGaInitialized || typeof window === 'undefined') return;

  currentGaId = gaId;

  // Check if gtag script already present
  if (!document.getElementById('ga-gtag-script')) {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId, {
      send_page_view: false // Managed manually for SPA route changes
    });

    isGaInitialized = true;
  }
};

/**
 * Tracks a page view across both Google Analytics 4 and internal MongoDB tracker
 * @param {string} path - current path (e.g. '/projects')
 * @param {string} title - page document title
 */
export const trackPageView = (path, title) => {
  if (typeof window === 'undefined') return;

  const currentPath = path || window.location.pathname;
  const currentTitle = title || document.title || 'TaizerCodeCrafter';

  // 1. Google Analytics 4 Event
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', 'page_view', {
        page_path: currentPath,
        page_title: currentTitle,
        page_location: window.location.href
      });
    } catch (e) {
      console.warn('GA4 track error:', e);
    }
  }

  // 2. First-Party Adblocker-Resilient Hit
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentPath,
        title: currentTitle,
        referrer: document.referrer || 'Direct'
      }),
      keepalive: true
    }).catch(() => {});
  } catch (err) {
    // Silent fail
  }
};

/**
 * Tracks custom interactions (e.g., CTA clicks, downloads, contact requests)
 * @param {string} action - Event name (e.g., 'click_whatsapp', 'hire_me_click')
 * @param {object} params - Event parameters
 */
export const trackEvent = (action, params = {}) => {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', action, params);
    } catch (e) {}
  }
};
