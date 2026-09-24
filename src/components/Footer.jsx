import React, { useState, useEffect } from 'react';
import { 
  Mail, Heart, Lock, CheckCircle2, AlertCircle, 
  ArrowRight, HelpCircle, Shield, FileText, ChevronDown, 
  Sparkles, MapPin, Phone, MessageSquare, ExternalLink, X, Check,
  QrCode, Download, Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { GithubIcon, LinkedinIcon, TwitterIcon, FacebookIcon, TiktokIcon, WhatsappIcon } from './BrandIcons';
import './Footer.css';

const FAQ_DATA = [
  {
    q: "How long does it take to develop and launch a website?",
    a: "Most standard business websites and portfolios are designed and delivered within 3 to 7 business days. Custom full-stack web applications, e-commerce platforms, or AI SaaS projects typically take 2 to 3 weeks depending on feature complexity and scope."
  },
  {
    q: "What are your pricing models and payment milestones?",
    a: "I offer transparent fixed-price packages as well as custom milestone-based quotes. Typically, projects are structured with a 50% deposit to initiate architecture, design, and development, and the remaining 50% upon final delivery, testing, and deployment."
  },
  {
    q: "Will my website be mobile-responsive and optimized for Google (SEO)?",
    a: "Yes, 100%. Every website is engineered with a mobile-first philosophy, ensuring lightning-fast loading speeds, fluid responsiveness across all smartphones, tablets, and laptops, clean semantic markup, and built-in search engine optimization."
  },
  {
    q: "Can you integrate AI chatbots and intelligent automated tools?",
    a: "Absolutely! I specialize in integrating LLMs (Google Gemini, OpenAI, Claude) for custom conversational AI chatbots, automated content workflows, smart search, and interactive business tools tailored to your website."
  },
  {
    q: "Do you provide post-launch support and revisions?",
    a: "Yes! Every project includes complimentary post-launch support and revision rounds to ensure everything operates smoothly. Ongoing maintenance, updates, and feature expansion packages are also available."
  },
  {
    q: "How do I get started with my project?",
    a: "Getting started is easy! Reach out directly through the Contact Page or message me on WhatsApp. We will discuss your goals, requirements, timeline, and budget, and I will prepare a tailored proposal to bring your vision to life."
  }
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    contactEmail: 'supundilshan358@gmail.com',
    contactPhone: '+94 7X XXX XXXX',
    contactWhatsapp: '+94770000000',
    contactLocation: 'Colombo, Sri Lanka'
  });

  const [activeModal, setActiveModal] = useState(null); // 'faq' | 'privacy' | 'terms' | 'qr' | null
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && typeof res.data === 'object') {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.warn('Footer: could not fetch settings:', err.message);
      }
    };
    fetchSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const response = await axios.post('/api/subscribe', { email });
      setStatus('success');
      setMessage(response.data.message || 'Thanks for subscribing! Check your inbox soon.');
      setEmail('');
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 4500);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Subscription failed. Please try again.');
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 4500);
    }
  };

  const getCleanWhatsappNumber = () => {
    return (settings.contactWhatsapp || settings.contactPhone || '').replace(/[^0-9]/g, '');
  };

  const getWhatsappChatUrl = () => {
    const cleanNumber = getCleanWhatsappNumber();
    const defaultText = encodeURIComponent("Hello Supun! I saw your portfolio and would like to discuss a project.");
    return `https://wa.me/${cleanNumber}?text=${defaultText}`;
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-container">
        {/* Pre-Footer Call-To-Action Banner */}
        <div className="footer-cta-banner glass">
          <div className="footer-cta-glow"></div>
          <div className="footer-cta-content">
            <div className="footer-cta-badge">
              <Sparkles size={14} /> Available for New Projects
            </div>
            <h2 className="footer-cta-heading">
              Have a project in mind? <span className="text-gradient">Let's build something extraordinary.</span>
            </h2>
            <p className="footer-cta-subtitle">
              From custom high-performance websites to scalable web apps and AI automations, I help businesses and startups stand out in the digital landscape.
            </p>
          </div>
          <div className="footer-cta-actions">
            <Link to="/contact" className="btn-primary footer-cta-btn">
              Hire Me / Get a Quote <ArrowRight size={16} />
            </Link>
            <a 
              href={getWhatsappChatUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-outline footer-whatsapp-cta"
            >
              <MessageSquare size={16} color="#25D366" /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Main 4-Column Footer Grid */}
        <div className="footer-main-grid">
          {/* Column 1: Brand & Contact Info */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-logo">
              <h2 className="footer-logo">Taizer<span className="text-gradient">CodeCrafter</span></h2>
            </div>
            <p className="footer-tagline">
              Crafting scalable web applications, custom AI integrations, and high-performance digital experiences for ambitious businesses worldwide.
            </p>

            <div className="footer-availability-chip">
              <span className="avail-pulse">
                <span className="avail-pulse-ping"></span>
                <span className="avail-pulse-dot"></span>
              </span>
              <span>Available for Freelance & Contracts</span>
            </div>

            <div className="footer-contact-chips">
              <a href={`mailto:${settings.contactEmail}`} className="contact-chip" title="Send Email">
                <Mail size={14} /> {settings.contactEmail}
              </a>
              <a href={getWhatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="contact-chip" title="WhatsApp Chat">
                <MessageSquare size={14} color="#25D366" /> WhatsApp Direct Chat
              </a>
              <div className="contact-chip location">
                <MapPin size={14} /> {settings.contactLocation || 'Colombo, Sri Lanka'}
              </div>
            </div>

            {/* Website QR Code Widget */}
            {settings.websiteQrActive !== false && (
              <div className="footer-qr-card" onClick={() => setActiveModal('qr')} title="Click to view full QR code">
                <div className="footer-qr-img-box">
                  <img 
                    src={settings.websiteQr || '/website-qr.png'} 
                    alt="TaizerCodeCrafter Website QR Code" 
                    className="footer-qr-thumb"
                  />
                </div>
                <div className="footer-qr-text-wrap">
                  <div className="footer-qr-tag">
                    <QrCode size={12} />
                    <span>{settings.websiteQrLabel || 'Scan on Mobile'}</span>
                  </div>
                  <span className="footer-qr-desc">Instant access to portfolio</span>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li><a href="/#home">Home</a></li>
              <li><Link to="/articles">Learn & Articles</Link></li>
              <li><a href="/#services">Services</a></li>
              <li><Link to="/projects">Featured Projects</Link></li>
              <li><Link to="/packages">Website Packages</Link></li>
              <li><Link to="/blog">Blog & Tech Insights</Link></li>
              <li><Link to="/contact">Contact & Hire Me</Link></li>
            </ul>
          </div>

          {/* Column 3: Services & Solutions */}
          <div className="footer-col">
            <h4 className="footer-col-title">Services & Solutions</h4>
            <ul className="footer-links-list">
              <li><Link to="/packages?package=Full%20Stack%20Development">Full Stack Web Development</Link></li>
              <li><Link to="/packages?package=Custom%20Web%20Applications">Custom Web Applications</Link></li>
              <li><Link to="/packages?package=AI%20Chatbots">Custom AI Chatbots & LLMs</Link></li>
              <li><Link to="/packages?package=E-Commerce%20Websites">E-Commerce Platforms</Link></li>
              <li><Link to="/packages?package=SEO%20Optimization">Performance & SEO Optimization</Link></li>
              <li><Link to="/packages?package=API%20Architecture">API Architecture & Deployments</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Legal/Support */}
          <div className="footer-col footer-col-newsletter">
            <h4 className="footer-col-title">Stay In The Loop</h4>
            <p className="newsletter-subtitle">
              Subscribe to get the latest tech insights, new project launches, and AI tutorials.
            </p>

            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  className="newsletter-input"
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="newsletter-submit-btn"
                >
                  {status === 'loading' ? 'Joining...' : status === 'success' ? <Check size={16} /> : 'Subscribe'}
                </button>
              </div>
            </form>

            {message && (
              <div className={`newsletter-feedback ${status}`}>
                {status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{message}</span>
              </div>
            )}

            {/* Quick Legal & FAQ Buttons */}
            <div className="footer-resource-badges">
              <button type="button" onClick={() => setActiveModal('faq')} className="resource-btn">
                <HelpCircle size={14} /> FAQs
              </button>
              <Link to="/privacy-policy" className="resource-btn">
                <Shield size={14} /> Privacy Policy
              </Link>
              <Link to="/terms" className="resource-btn">
                <FileText size={14} /> Terms of Service
              </Link>
              <button type="button" onClick={() => setActiveModal('qr')} className="resource-btn">
                <QrCode size={14} /> Scan QR
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar glass">
          <div className="copyright-section">
            <p className="copyright-text">
              © {new Date().getFullYear()} TaizerCodeCrafter. Built with <Heart size={14} className="heart-icon" /> and Vite.
            </p>
            <div className="footer-legal-inline">
              <button type="button" onClick={() => setActiveModal('faq')}>FAQ</button>
              <span>•</span>
              <Link to="/privacy-policy">Privacy</Link>
              <span>•</span>
              <Link to="/terms">Terms</Link>
              <span>•</span>
              <button type="button" onClick={() => setActiveModal('qr')}>QR Code</button>
              <Link to="/ceo" title="CEO Portal" className="admin-lock-link">
                <Lock size={12} />
              </Link>
            </div>
          </div>
          
          <div className="footer-socials">
            <a href="https://github.com/TaizerCodeCrafter" target="_blank" rel="noreferrer" className="social-link" title="GitHub"><GithubIcon size={18} /></a>
            <a href="https://www.linkedin.com/in/supun-dilshan-madusanka-182a96173/" target="_blank" rel="noreferrer" className="social-link" title="LinkedIn"><LinkedinIcon size={18} /></a>
            <a href="https://www.facebook.com/share/14eV3kv99jP/" target="_blank" rel="noreferrer" className="social-link" title="Facebook"><FacebookIcon size={18} /></a>
            <a href="https://www.tiktok.com/@dilshan5556?_r=1&_t=ZS-95pOAa7ErDE" target="_blank" rel="noreferrer" className="social-link" title="TikTok"><TiktokIcon size={18} /></a>
            <a href={getWhatsappChatUrl()} target="_blank" rel="noreferrer" className="social-link" title="WhatsApp"><WhatsappIcon size={18} /></a>
            <a href="#" className="social-link" title="Twitter"><TwitterIcon size={18} /></a>
          </div>
        </div>
      </div>

      {/* Interactive Modals: FAQ, Privacy Policy, Terms of Service */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="footer-modal-overlay"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="footer-modal-card glass"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="footer-modal-header">
                <div className="modal-title-wrap">
                  {activeModal === 'faq' && <HelpCircle size={22} className="modal-icon-faq" />}
                  {activeModal === 'privacy' && <Shield size={22} className="modal-icon-privacy" />}
                  {activeModal === 'terms' && <FileText size={22} className="modal-icon-terms" />}
                  {activeModal === 'qr' && <QrCode size={22} className="modal-icon-qr" />}
                  <div>
                    <h3>
                      {activeModal === 'faq' && 'Frequently Asked Questions (FAQ)'}
                      {activeModal === 'privacy' && 'Privacy Policy'}
                      {activeModal === 'terms' && 'Terms of Service'}
                      {activeModal === 'qr' && 'Website QR Code'}
                    </h3>
                    <p>
                      {activeModal === 'faq' && 'Find instant answers to common questions about my development workflow.'}
                      {activeModal === 'privacy' && 'How we collect, protect, and handle your information.'}
                      {activeModal === 'terms' && 'Clear, professional terms governing projects and deliverables.'}
                      {activeModal === 'qr' && 'Scan with any smartphone camera to browse or share this portfolio.'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="modal-close-btn"
                  onClick={() => setActiveModal(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="footer-modal-body">
                {/* 1. FAQ Accordion */}
                {activeModal === 'faq' && (
                  <div className="faq-accordion-list">
                    {FAQ_DATA.map((item, index) => {
                      const isOpen = expandedFaq === index;
                      return (
                        <div key={index} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                          <button 
                            type="button" 
                            className="faq-question-btn"
                            onClick={() => setExpandedFaq(isOpen ? null : index)}
                          >
                            <span>{item.q}</span>
                            <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="faq-answer-wrap"
                              >
                                <p className="faq-answer-text">{item.a}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    <div className="faq-extra-cta">
                      <p>Have a unique question or ready to discuss your requirements?</p>
                      <a 
                        href={getWhatsappChatUrl()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-primary" 
                        style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem' }}
                      >
                        Ask Directly on WhatsApp <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                )}

                {/* 2. Privacy Policy Content */}
                {activeModal === 'privacy' && (
                  <div className="legal-content-wrap">
                    <span className="last-updated">Last Updated: September 2026</span>
                    
                    <h4>1. Information Collection</h4>
                    <p>
                      We only collect personal information that you voluntarily provide when contacting us, requesting a project estimate, or subscribing to our newsletter. This includes your name, email address, phone number, and project specifications.
                    </p>

                    <h4>2. How We Use Your Information</h4>
                    <p>
                      The information you provide is used exclusively to evaluate project requirements, send proposals and invoices, deliver requested development services, and occasionally share relevant technology insights if subscribed to our newsletter.
                    </p>

                    <h4>3. Client Confidentiality & Code Security</h4>
                    <p>
                      We strictly respect your intellectual property, business logic, and proprietary ideas. We never sell, rent, or disclose your confidential project details or personal information to third-party advertisers or external organizations.
                    </p>

                    <h4>4. Cookies & Website Analytics</h4>
                    <p>
                      Our portfolio uses essential session cookies and standard anonymous analytics to measure performance, monitor navigation flow, and optimize page load speeds across devices.
                    </p>

                    <h4>5. Your Data Rights</h4>
                    <p>
                      You have full rights to request access to, correction of, or deletion of your stored contact data at any time by contacting us directly at <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.
                    </p>
                  </div>
                )}

                {/* 3. Terms of Service Content */}
                {activeModal === 'terms' && (
                  <div className="legal-content-wrap">
                    <span className="last-updated">Last Updated: September 2026</span>
                    
                    <h4>1. Project Scope & Proposals</h4>
                    <p>
                      Every web development or design project is governed by a mutually agreed proposal outlining specific deliverables, milestone timelines, technical specifications, and total compensation.
                    </p>

                    <h4>2. Intellectual Property & Code Ownership</h4>
                    <p>
                      Upon receipt of 100% final payment, full intellectual property rights, database schemas, and source code are unconditionally transferred to the client. Pre-existing open-source libraries remain subject to their respective MIT/Apache licenses.
                    </p>

                    <h4>3. Revision Policy & Quality Assurance</h4>
                    <p>
                      Every package includes dedicated revision cycles during development to ensure all deliverables match agreed visual designs and functional criteria before final deployment.
                    </p>

                    <h4>4. Client Responsibilities</h4>
                    <p>
                      The client agrees to provide necessary media assets, brand guidelines, content copy, and timely feedback required to adhere to scheduled milestone completions.
                    </p>

                    <h4>5. Warranty & Post-Launch Support</h4>
                    <p>
                      All web projects include complimentary post-launch bug fixing and support to ensure seamless operation on target browsers and hosting environments.
                    </p>
                  </div>
                )}

                {/* 4. QR Code Modal */}
                {activeModal === 'qr' && (
                  <div className="qr-modal-body">
                    <div className="qr-enlarged-card">
                      <img 
                        src={settings.websiteQr || '/website-qr.png'} 
                        alt="TaizerCodeCrafter Website QR Code" 
                        className="qr-enlarged-img" 
                      />
                    </div>
                    <div className="qr-modal-details">
                      <h4>Point your camera to scan</h4>
                      <p>
                        Scan this QR code with any smartphone camera or QR reader to instantly open and browse this portfolio on your mobile device.
                      </p>
                      <div className="qr-modal-actions">
                        <a 
                          href={settings.websiteQr || '/website-qr.png'} 
                          download="TaizerCodeCrafter-QR.png" 
                          className="btn-primary" 
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Download size={15} /> Download QR Image
                        </a>
                        <button 
                          type="button" 
                          onClick={handleCopyLink} 
                          className="btn-outline" 
                          style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          {copiedLink ? <><Check size={15} color="#10b981" /> Link Copied!</> : <><Copy size={15} /> Copy Website Link</>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
