import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, BookOpen, Layers, Send, AlertTriangle, Compass, Terminal, Code2 } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = '404: Page Not Found | TaizerCodeCrafter';

    // Tell search engine crawlers not to index 404 pages
    let metaRobots = document.querySelector('meta[name="robots"]');
    const prevRobots = metaRobots ? metaRobots.getAttribute('content') : null;
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, follow');
    } else {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      metaRobots.setAttribute('content', 'noindex, follow');
      document.head.appendChild(metaRobots);
    }

    return () => {
      if (metaRobots) {
        metaRobots.setAttribute('content', prevRobots || 'index, follow');
      }
    };
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="notfound-page-container"
    >
      <div className="notfound-content">
        {/* Badge */}
        <div className="notfound-badge">
          <AlertTriangle size={15} /> Error 404 • Destination Not Found
        </div>

        {/* Big Glitch / Glow 404 Number */}
        <div className="notfound-glitch-wrap">
          <span className="notfound-number text-gradient">404</span>
          <div className="notfound-orb-glow"></div>
        </div>

        {/* Headlines */}
        <h1 className="notfound-title">Oops! You've Drifted Off Course</h1>
        <p className="notfound-subtitle">
          The page at <code className="notfound-url-pill">{location.pathname}</code> doesn't exist, was removed, or might have changed coordinates. Even the best developers hit a missing route sometimes!
        </p>

        {/* Interactive Dev Terminal Diagnostic Box */}
        <div className="notfound-terminal-box">
          <div className="notfound-terminal-header">
            <div className="notfound-terminal-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <span className="notfound-terminal-title">
              <Terminal size={13} /> system_diagnostic.sh
            </span>
          </div>
          <div className="notfound-terminal-body">
            <p><span className="t-accent">$</span> curl -I https://taizercodecrafter.com{location.pathname}</p>
            <p className="t-warn">HTTP/2 404 Not Found</p>
            <p className="t-muted">Content-Type: text/html; charset=utf-8</p>
            <p className="t-success">&#10003; Diagnostic complete: Route not registered in router matrix.</p>
            <p className="t-prompt"><span className="t-accent">&gt;</span> Suggested resolution: Reroute to active portal.</p>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn-primary">
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>
          <button 
            type="button" 
            className="notfound-btn-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Discovery Cards */}
        <div className="notfound-destinations">
          <h2 className="notfound-dest-heading">
            <Compass size={16} /> Or explore these popular destinations:
          </h2>
          <div className="notfound-dest-grid">
            <Link to="/articles" className="notfound-dest-card">
              <div className="notfound-dest-icon">
                <BookOpen size={20} />
              </div>
              <div className="notfound-dest-info">
                <h3>Articles & Tutorials</h3>
                <p>Read full-stack guides and AI insights</p>
              </div>
            </Link>

            <Link to="/projects" className="notfound-dest-card">
              <div className="notfound-dest-icon">
                <Code2 size={20} />
              </div>
              <div className="notfound-dest-info">
                <h3>Portfolio Projects</h3>
                <p>Explore live applications and demos</p>
              </div>
            </Link>

            <Link to="/packages" className="notfound-dest-card">
              <div className="notfound-dest-icon">
                <Layers size={20} />
              </div>
              <div className="notfound-dest-info">
                <h3>Development Packages</h3>
                <p>View web & mobile engineering services</p>
              </div>
            </Link>

            <Link to="/contact" className="notfound-dest-card">
              <div className="notfound-dest-icon">
                <Send size={20} />
              </div>
              <div className="notfound-dest-info">
                <h3>Get in Touch</h3>
                <p>Start a conversation with Supun</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default NotFoundPage;
