/**
 * Meta Pixel Integration Utility
 * Complies with strict privacy guidelines: NEVER transmits customer PII (names, phone numbers, emails)
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    __metaPixelInitialized?: boolean;
  }
}

// Configurable Meta Pixel ID from environment or fallback placeholder
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '1289456209187342';

/**
 * Initializes Meta Pixel in the DOM safely if not already present
 */
export function initMetaPixel(): void {
  if (typeof window === 'undefined' || window.__metaPixelInitialized) return;

  try {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    if (window.fbq) {
      window.fbq('init', META_PIXEL_ID);
      window.__metaPixelInitialized = true;
    }
  } catch (err) {
    console.warn('Meta Pixel initialization skipped or blocked:', err);
  }
}

/**
 * Tracks standard PageView event
 */
export function trackPageView(pageName?: string): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView', {
      page: pageName || window.location.pathname,
    });
  }
}

// Track fired lead transaction IDs to prevent duplicates on refresh or replay
const firedLeadEvents = new Set<string>();

/**
 * Tracks Lead conversion event ONLY after successful Firestore persistence.
 * strictly anonymized - NO personal data is sent to Meta Pixel.
 */
export function trackLeadEvent(applicationId: string, loanPurpose: string): boolean {
  if (!applicationId || firedLeadEvents.has(applicationId)) {
    return false; // Prevent duplicate firing
  }

  // Check sessionStorage for duplicate prevention across page refreshes
  const sessionKey = `dfl_lead_tracked_${applicationId}`;
  if (typeof window !== 'undefined') {
    if (sessionStorage.getItem(sessionKey)) {
      return false;
    }
  }

  firedLeadEvents.add(applicationId);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(sessionKey, 'true');
  }

  if (typeof window !== 'undefined' && window.fbq) {
    // Strictly anonymized event data, NO PII
    window.fbq('track', 'Lead', {
      content_name: 'Dhani Finance Loan Lead',
      content_category: loanPurpose,
      application_id: applicationId,
      currency: 'INR',
    });
    return true;
  }

  return false;
}
