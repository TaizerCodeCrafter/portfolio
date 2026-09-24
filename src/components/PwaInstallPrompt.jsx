import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles } from 'lucide-react';
import './PwaInstallPrompt.css';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                               window.navigator.standalone === true;
    setIsStandalone(isRunningStandalone);

    if (isRunningStandalone) return;

    // Check if user dismissed recently (within 5 days)
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 5 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Listen for native install prompt (Android / Chrome / Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds after page load before displaying prompt
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS and not standalone, show prompt after 4 seconds
    if (isIosDevice && !isRunningStandalone) {
      setTimeout(() => setIsVisible(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="pwa-install-banner"
        aria-label="Install Web Application"
      >
        <div className="pwa-banner-glow"></div>
        <div className="pwa-banner-card">
          <div className="pwa-icon-wrap">
            <img src="/apple-touch-icon.png" alt="TaizerCode" className="pwa-app-icon" />
            <span className="pwa-sparkle-dot">
              <Sparkles size={11} color="#0b1120" />
            </span>
          </div>

          <div className="pwa-text-wrap">
            <div className="pwa-header-row">
              <span className="pwa-title">Install TaizerCode App</span>
              <span className="pwa-fast-pill">0ms Instant Load</span>
            </div>
            {isIos ? (
              <p className="pwa-desc">
                Tap <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> Share, then tap <strong>'Add to Home Screen'</strong> <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> for the best app experience.
              </p>
            ) : (
              <p className="pwa-desc">
                Add to your home screen for full-screen app access, offline articles, and push notifications.
              </p>
            )}
          </div>

          <div className="pwa-actions">
            {!isIos && deferredPrompt && (
              <button 
                type="button" 
                className="pwa-install-btn" 
                onClick={handleInstallClick}
              >
                <Download size={15} />
                <span>Install</span>
              </button>
            )}
            <button 
              type="button" 
              className="pwa-close-btn" 
              onClick={handleDismiss}
              aria-label="Dismiss install banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default PwaInstallPrompt;
