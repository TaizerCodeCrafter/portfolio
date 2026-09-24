import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { prefetchResource } from '../utils/cache';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navRef = useRef(null);

  // Background prefetch for instant 0ms navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      prefetchResource('articles', '/api/blogs');
      prefetchResource('projects', '/api/projects');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  // Close mobile menu automatically on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu if externally requested (e.g. AI chatbot opened)
  useEffect(() => {
    const handleCloseMenu = () => setMobileMenuOpen(false);
    window.addEventListener('close-mobile-menu', handleCloseMenu);
    return () => window.removeEventListener('close-mobile-menu', handleCloseMenu);
  }, []);

  // Close mobile menu when clicking outside navbar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => {
      const next = !prev;
      if (next) {
        // Close AI chatbot and side previews if opening mobile menu
        window.dispatchEvent(new Event('close-ai-chat'));
      }
      return next;
    });
  };

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Services', href: '/#services' },
    { name: 'Projects', href: '/projects', isRoute: true },
    { name: 'Packages', href: '/packages', isRoute: true },
    { name: 'Articles', href: '/articles', isRoute: true },
    { name: 'Contact', href: '/contact', isRoute: true },
  ];

  return (
    <nav 
      ref={navRef}
      className={`navbar ${scrolled ? 'glass' : ''} ${mobileMenuOpen ? 'menu-open' : ''}`}
    >
      <div className="nav-container">
        <div className="logo">
          <div className="nav-cube-wrapper">
            <div className="nav-cube">
              <div className="nav-face nav-front">💻</div>
              <div className="nav-face nav-back">⚙️</div>
              <div className="nav-face nav-right">🤖</div>
              <div className="nav-face nav-left">🚀</div>
              <div className="nav-face nav-top"></div>
              <div className="nav-face nav-bottom"></div>
            </div>
          </div>
          <span className="logo-text">TaizerCode<span className="text-gradient">Crafter</span></span>
        </div>

        <div className="desktop-menu">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link 
                key={link.name} 
                to={link.href} 
                className="nav-link"
                onMouseEnter={() => {
                  if (link.name === 'Articles') prefetchResource('articles', '/api/blogs');
                  if (link.name === 'Projects') prefetchResource('projects', '/api/projects');
                }}
              >
                {link.name}
              </Link>
            ) : (
              <a key={link.name} href={link.href} className="nav-link">
                {link.name}
              </a>
            )
          ))}
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/contact" className="btn-primary" style={{ padding: '8px 20px' }}>Hire Me</Link>
        </div>

        <motion.button 
          type="button"
          className="mobile-toggle" 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          whileTap={{ scale: 0.88 }}
        >
          <motion.div
            key={mobileMenuOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Menu Dropdown & Backdrop with Smooth Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, y: -18, scaleY: 0.94 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -15, scaleY: 0.94 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <div className="mobile-menu-items">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.035 * idx + 0.04, duration: 0.2 }}
                  >
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="mobile-nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{link.name}</span>
                        <ArrowRight size={15} className="mobile-nav-arrow" />
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="mobile-nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>{link.name}</span>
                        <ArrowRight size={15} className="mobile-nav-arrow" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mobile-menu-bottom"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.22 }}
              >
                <button type="button" className="mobile-theme-toggle" onClick={toggleTheme}>
                  {theme === 'dark' ? <><Sun size={19} /> Light Mode</> : <><Moon size={19} /> Dark Mode</>}
                </button>
                <Link 
                  to="/contact" 
                  className="btn-primary mobile-hire-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hire Me
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
