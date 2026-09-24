import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const navRef = useRef(null);

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
              <Link key={link.name} to={link.href} className="nav-link">
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

        <button 
          type="button"
          className="mobile-toggle" 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.name}
                to={link.href}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href} 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            )
          ))}
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
