import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Clock, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import './Packages.css';

const defaultPackages = [
  {
    _id: 'default-pkg-1',
    title: 'Starter Website',
    subtitle: 'Perfect for personal branding, portfolios, and single-page showcases.',
    price: 150,
    currency: '$',
    billingPeriod: 'One-time',
    deliveryTime: '3-5 Days',
    isPopular: false,
    badge: 'Starter',
    color: '#3b82f6',
    features: [
      'Custom 1-3 Page Responsive Design',
      'Mobile, Tablet & Desktop Optimized',
      'Basic SEO Setup & Meta Tags',
      'Interactive Contact Form & Social Links',
      'Fast Performance & Modern Animations',
      '1 Month Free Technical Support'
    ]
  },
  {
    _id: 'default-pkg-2',
    title: 'Business Pro',
    subtitle: 'Full-featured web solution for growing businesses, agencies, and startups.',
    price: 350,
    currency: '$',
    billingPeriod: 'One-time',
    deliveryTime: '5-7 Days',
    isPopular: true,
    badge: 'Most Popular',
    color: '#b35a00',
    features: [
      'Up to 7 Pages Custom Dynamic Web App',
      'Full Admin Panel & Content Management',
      'Integrated Blog & AI-Powered Tools',
      'Advanced SEO & Google Search Console Setup',
      'Google Analytics & Speed Optimization',
      'Custom Domain & Free Deployment Setup',
      '3 Months Priority Support & Revisions'
    ]
  },
  {
    _id: 'default-pkg-3',
    title: 'Full-Stack & E-Commerce',
    subtitle: 'High-performance web apps, online stores, or custom SaaS architectures.',
    price: 650,
    currency: '$',
    billingPeriod: 'One-time',
    deliveryTime: '10-14 Days',
    isPopular: false,
    badge: 'Enterprise',
    color: '#8b5cf6',
    features: [
      'Full-Stack Architecture (React/Node/MongoDB)',
      'Payment Gateway Integration (Stripe / PayPal)',
      'Secure User Authentication & Roles',
      'Custom Database Design & RESTful APIs',
      'Automated Backups & High-Security Standards',
      'Admin Sales Dashboard & Inventory',
      '6 Months VIP Maintenance & Direct Support'
    ]
  }
];

const Packages = ({ isPage = false }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get('/api/packages');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPackages(res.data);
        } else {
          setPackages(defaultPackages);
        }
      } catch (err) {
        console.warn('Could not fetch packages, using defaults:', err.message);
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const displayPackages = packages.length > 0 ? packages : defaultPackages;

  const handleSelectPackage = (pkg) => {
    const message = `Hi, I am interested in ordering the "${pkg.title}" (${pkg.currency || '$'}${pkg.price}) package. Could we discuss the details?`;
    // Store in sessionStorage so contact form can auto-fill if on page or redirected
    sessionStorage.setItem('selected_package_msg', message);
    sessionStorage.setItem('selected_package_title', pkg.title);
    
    // Smooth scroll to contact or redirect to /#contact
    if (window.location.pathname === '/') {
      const contactEl = document.getElementById('contact') || document.getElementById('contact-form');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.location.href = '/#contact';
  };

  return (
    <section id="packages" className={`packages-section section ${isPage ? 'packages-page-padding' : ''}`}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-header text-center"
        >
          <div className="packages-badge">
            <Zap size={14} />
            <span>Transparent Pricing & Plans</span>
          </div>
          <h2 className="section-title">
            Website Development <span className="text-gradient">Packages</span>
          </h2>
          <p className="section-subtitle">
            Tailored solutions with clean code, lightning-fast performance, and dedicated support.
          </p>
        </motion.div>

        <div className="packages-grid">
          {displayPackages.map((pkg, index) => {
            const isHighlighted = pkg.isPopular;
            return (
              <motion.div
                key={pkg._id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`package-card glass ${isHighlighted ? 'popular' : ''}`}
                style={{
                  '--pkg-color': pkg.color || '#b35a00'
                }}
              >
                {isHighlighted && (
                  <div className="popular-ribbon">
                    <Sparkles size={12} />
                    <span>{pkg.badge || 'Most Popular'}</span>
                  </div>
                )}

                <div className="package-header">
                  <div className="package-title-row">
                    <h3 className="package-title">{pkg.title}</h3>
                    {!isHighlighted && pkg.badge && (
                      <span className="pkg-sub-badge">{pkg.badge}</span>
                    )}
                  </div>
                  <p className="package-subtitle">{pkg.subtitle}</p>
                </div>

                <div className="package-pricing">
                  <div className="price-amount">
                    <span className="currency">{pkg.currency || '$'}</span>
                    <span className="amount">{pkg.price}</span>
                  </div>
                  <span className="period">{pkg.billingPeriod || 'One-time'}</span>
                </div>

                <div className="delivery-time-badge">
                  <Clock size={14} />
                  <span>Delivery in <strong>{pkg.deliveryTime || '3-5 Days'}</strong></span>
                </div>

                <div className="package-divider"></div>

                <div className="package-features">
                  <span className="features-label">What's Included:</span>
                  <ul className="features-list">
                    {(Array.isArray(pkg.features) ? pkg.features : []).map((feat, fIndex) => (
                      <li key={fIndex} className="feature-item">
                        <div className="feature-check-icon">
                          <Check size={14} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="package-footer">
                  <button 
                    onClick={() => handleSelectPackage(pkg)} 
                    className={`package-btn ${isHighlighted ? 'btn-popular' : 'btn-regular'}`}
                  >
                    <span>Choose {pkg.title}</span>
                    <ArrowRight size={16} />
                  </button>
                  <div className="package-guarantee">
                    <ShieldCheck size={14} />
                    <span>100% Satisfaction Guarantee</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Packages;
