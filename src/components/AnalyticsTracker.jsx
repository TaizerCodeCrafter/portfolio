import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '../utils/analytics';

/**
 * AnalyticsTracker: Invisible component placed inside BrowserRouter
 * Automatically triggers Google Analytics 4 virtual page views & first-party tracking on SPA navigation
 */
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Fetch custom GA4 measurement ID from backend setting or use fallback
    fetch('/api/analytics/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.gaMeasurementId) {
          initGA(data.gaMeasurementId);
        } else {
          initGA();
        }
      })
      .catch(() => {
        initGA();
      });
  }, []);

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    // Do not track admin / CEO dashboard activities
    if (fullPath.startsWith('/ceo') || fullPath.startsWith('/admin')) {
      return;
    }

    // Allow document.title to update on route transitions
    const timer = setTimeout(() => {
      trackPageView(fullPath, document.title);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
