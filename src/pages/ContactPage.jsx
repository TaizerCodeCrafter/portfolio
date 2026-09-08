import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, Send, MapPin, MessageSquare, CheckCircle2, 
  Copy, Check, Clock, Sparkles, ExternalLink, ShieldCheck, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import './ContactPage.css';

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const packageParam = searchParams.get('package') || '';

  const [settings, setSettings] = useState({
    contactEmail: 'supundilshan358@gmail.com',
    contactPhone: '+94 7X XXX XXXX',
    contactWhatsapp: '+94770000000',
    contactLocation: 'Colombo, Sri Lanka',
    whatsappGroupUrl: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: packageParam ? `Package: ${packageParam}` : 'Custom Website Development',
    budget: '$150 - $350',
    subject: packageParam ? `Inquiry about ${packageParam}` : '',
    message: packageParam ? `Hi Supun, I am interested in the "${packageParam}" package. Please let me know how we can get started.` : ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && typeof res.data === 'object') {
          setSettings(prev => ({
            ...prev,
            contactEmail: res.data.contactEmail || prev.contactEmail,
            contactPhone: res.data.contactPhone || prev.contactPhone,
            contactWhatsapp: res.data.contactWhatsapp || res.data.contactPhone || prev.contactWhatsapp,
            contactLocation: res.data.contactLocation || prev.contactLocation,
            whatsappGroupUrl: res.data.whatsappGroupUrl || ''
          }));
        }
      } catch (err) {
        console.warn('Could not fetch settings:', err.message);
      }
    };

    fetchSettings();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(settings.contactEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const getCleanWhatsappNumber = () => {
    return (settings.contactWhatsapp || settings.contactPhone || '').replace(/[^0-9]/g, '');
  };

  const getWhatsappChatUrl = () => {
    const cleanNumber = getCleanWhatsappNumber();
    const defaultText = encodeURIComponent(
      packageParam 
        ? `Hello! I would like to inquire about your "${packageParam}" package.` 
        : `Hello Supun! I saw your portfolio and would like to discuss a project.`
    );
    return `https://wa.me/${cleanNumber}?text=${defaultText}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post('/api/messages', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || `Inquiry for ${formData.service}`,
        message: `Service: ${formData.service} | Budget: ${formData.budget} | Phone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`
      });

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: 'Custom Website Development',
        budget: '$150 - $350',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again or reach out directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="contact-page"
    >
      <div className="container">
        {/* Header */}
        <div className="contact-page-header">
          <div className="contact-badge">
            <Sparkles size={14} /> Direct Communication Channels
          </div>
          <h1 className="contact-page-title">
            Let's Talk About Your <span className="text-gradient">Next Project</span>
          </h1>
          <p className="contact-page-subtitle">
            Need a high-converting website, custom web application, or have questions? Contact me directly via WhatsApp, email, or send a project brief below.
          </p>
        </div>

        {/* Selected Package Banner (if redirected from /packages) */}
        {packageParam && (
          <div className="package-selected-banner">
            <div>
              <span className="badge">Selected Package</span>
              <h3>{packageParam}</h3>
              <p>
                The form below is pre-configured with this package. Fill out your details or chat directly on WhatsApp!
              </p>
            </div>
            <Link to="/packages" className="btn-secondary" style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '0.85rem' }}>
              View All Packages
            </Link>
          </div>
        )}

        {/* Quick Direct Channels Grid */}
        <div className="direct-channels-grid">
          {/* WhatsApp Card */}
          <div className="channel-card whatsapp glass">
            <div>
              <div className="channel-header">
                <div className="channel-icon-wrap whatsapp">
                  <MessageSquare size={26} />
                </div>
                <span className="channel-status-pill">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                  Fastest Reply
                </span>
              </div>
              <h3 className="channel-title">WhatsApp Chat</h3>
              <p className="channel-desc">
                Ideal for immediate project discussions, voice notes, quotes, or instant Q&A.
              </p>
              <div className="channel-contact-val">
                {settings.contactWhatsapp || settings.contactPhone}
              </div>
            </div>
            <div className="channel-actions">
              <a 
                href={getWhatsappChatUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-channel whatsapp"
              >
                Chat on WhatsApp <ExternalLink size={14} />
              </a>
              {settings.whatsappGroupUrl && (
                <a 
                  href={settings.whatsappGroupUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-channel outline"
                >
                  Join Group
                </a>
              )}
            </div>
          </div>

          {/* Direct Email Card */}
          <div className="channel-card email glass">
            <div>
              <div className="channel-header">
                <div className="channel-icon-wrap email">
                  <Mail size={26} />
                </div>
                <span className="channel-status-pill" style={{ background: 'rgba(179, 90, 0, 0.1)', color: '#b35a00' }}>
                  <Clock size={12} /> Within 2-4 hrs
                </span>
              </div>
              <h3 className="channel-title">Direct Email</h3>
              <p className="channel-desc">
                Best for detailed project specifications, RFP documents, contracts, and proposals.
              </p>
              <div className="channel-contact-val">
                {settings.contactEmail}
              </div>
            </div>
            <div className="channel-actions">
              <a 
                href={`mailto:${settings.contactEmail}?subject=${encodeURIComponent(packageParam ? `Inquiry for ${packageParam}` : 'Project Inquiry')}`} 
                className="btn-channel email"
              >
                Send Email <Mail size={14} />
              </a>
              <button 
                type="button" 
                onClick={handleCopyEmail} 
                className="btn-channel outline"
              >
                {copiedEmail ? <><Check size={14} color="#10b981" /> Copied!</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Phone Call Card */}
          <div className="channel-card phone glass">
            <div>
              <div className="channel-header">
                <div className="channel-icon-wrap phone">
                  <Phone size={26} />
                </div>
                <span className="channel-status-pill" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
                  Mon - Sat
                </span>
              </div>
              <h3 className="channel-title">Direct Phone Call</h3>
              <p className="channel-desc">
                Prefer discussing over a voice call? Feel free to call directly during business hours.
              </p>
              <div className="channel-contact-val">
                {settings.contactPhone}
              </div>
            </div>
            <div className="channel-actions">
              <a 
                href={`tel:${(settings.contactPhone || '').replace(/[^0-9+]/g, '')}`} 
                className="btn-channel phone"
              >
                Call Now <Phone size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Why Work With Me */}
        <div className="contact-main-grid">
          {/* Left: Message Form */}
          <div className="contact-form-card">
            <h3 className="contact-card-title">
              Send a Detailed Message
            </h3>
            <p className="contact-card-subtitle">
              Fill in your project requirements and I will respond with a tailored proposal.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 size={56} color="#10b981" style={{ margin: '0 auto 16px auto' }} />
                <h3 className="contact-card-title">Message Received!</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
                  Thank you for reaching out. Your message has been delivered directly to my inbox. I will review it and get back to you shortly.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '12px' }}>
                    Send Another Message
                  </button>
                  <a href={getWhatsappChatUrl()} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Follow up on WhatsApp <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-label">Your Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="contact-input"
                    />
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-label">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      required 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="contact-input"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label className="contact-label">WhatsApp / Phone (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="+94 7X XXX XXXX"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="contact-input"
                    />
                  </div>

                  <div className="contact-form-group">
                    <label className="contact-label">Estimated Budget</label>
                    <select 
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                      className="contact-select"
                    >
                      <option value="< $150">&lt; $150 (Basic / Starter)</option>
                      <option value="$150 - $350">$150 - $350 (Business Website)</option>
                      <option value="$350 - $650">$350 - $650 (Custom Web App / E-Commerce)</option>
                      <option value="$650+">$650+ (Full Enterprise / Custom SaaS)</option>
                    </select>
                  </div>
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Website development inquiry"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="contact-input"
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Project Details & Requirements *</label>
                  <textarea 
                    rows={5}
                    placeholder="Tell me about your project, timeline, features needed, or any questions..."
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="contact-textarea"
                  ></textarea>
                </div>

                {error && (
                  <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600' }}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary contact-submit-btn" 
                  style={{ 
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message Directly'}
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>

          {/* Right: Side Highlights */}
          <div className="contact-side-card">
            <h3 className="contact-card-title" style={{ fontSize: '1.25rem' }}>
              Why Work With Me?
            </h3>

            <div className="side-feature">
              <div className="side-feature-icon">
                <Clock size={22} />
              </div>
              <div>
                <h4>Fast Turnaround</h4>
                <p>Most standard websites are delivered within 3 to 7 business days with clean code and high performance.</p>
              </div>
            </div>

            <div className="side-feature">
              <div className="side-feature-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4>100% Quality & Support</h4>
                <p>Free post-launch support and revisions included with every project to ensure seamless operation.</p>
              </div>
            </div>

            <div className="side-feature">
              <div className="side-feature-icon">
                <MapPin size={22} />
              </div>
              <div>
                <h4>Global Clients & Sri Lanka</h4>
                <p>Based in {settings.contactLocation}, serving businesses and entrepreneurs locally and worldwide.</p>
              </div>
            </div>

            <div className="side-cta-box">
              <h4>Need an instant quote?</h4>
              <p>
                Chat directly on WhatsApp for an immediate estimate and discussion.
              </p>
              <a 
                href={getWhatsappChatUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  background: '#25D366', 
                  color: 'white', 
                  padding: '12px 20px', 
                  borderRadius: '12px', 
                  fontWeight: '700', 
                  fontSize: '0.9rem', 
                  textDecoration: 'none' 
                }}
              >
                <MessageSquare size={18} /> Open WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

export default ContactPage;
