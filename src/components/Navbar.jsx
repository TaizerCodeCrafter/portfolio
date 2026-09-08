import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

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

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Services', href: '/#services' },
    { name: 'Projects', href: '/projects', isRoute: true },
    { name: 'Packages', href: '/packages', isRoute: true },
    { name: 'Blog', href: '/#blog' },
    { name: 'Contact', href: '/contact', isRoute: true },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'glass' : ''}`}>
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
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/contact" className="btn-primary" style={{ padding: '8px 20px' }}>Hire Me</Link>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu glass">
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
          <button className="mobile-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={20} /> Light Mode</> : <><Moon size={20} /> Dark Mode</>}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
