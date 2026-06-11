import React, { useState } from 'react';
import { Mail, Heart, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GithubIcon, LinkedinIcon, TwitterIcon, FacebookIcon, TiktokIcon, WhatsappIcon } from './BrandIcons';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({ contactEmail: 'supundilshan358@gmail.com' });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) { console.error('Failed to fetch settings'); }
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
      setMessage(response.data.message || 'Thanks for subscribing!');
      setEmail('');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Subscription failed. Please try again.');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 4000);
    }
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-content">
        <div className="footer-content">
          <div className="footer-info">
            <h2 className="footer-logo">Taizer<span className="text-gradient">CodeCrafter</span></h2>
            <p className="footer-tagline">Building digital experiences that matter.</p>
          </div>

          <div className="footer-newsletter">
            <h4>Subscribe to my newsletter</h4>
            <p>Get the latest AI insights and project updates.</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                style={{ 
                  border: status === 'error' ? '1px solid #ef4444' : status === 'success' ? '1px solid #10b981' : '' 
                }}
              />
              <button 
                type="submit" 
                disabled={status === 'loading'}
                style={{ 
                  background: status === 'success' ? '#10b981' : '',
                  transform: status === 'loading' ? 'scale(0.98)' : ''
                }}
              >
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <div className={`newsletter-message ${status}`} style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '12px', 
                color: status === 'success' ? '#10b981' : '#ef4444',
                animation: 'fadeIn 0.3s ease-out'
              }}>
                {status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {message}
              </div>
            )}
          </div>

          <div className="footer-links">
            <h3>Let's Work Together</h3>
            <p>Looking for a freelance Full Stack Developer?</p>
            <a href={`mailto:${settings.contactEmail}`} className="btn-primary" style={{ marginTop: '16px' }}>
              <Mail size={18} /> {settings.contactEmail}
            </a>
          </div>
        </div>
        
        <div className="footer-bottom glass">
          <p className="copyright">
            © {new Date().getFullYear()} TaizerCodeCrafter. Built with <Heart size={14} className="heart-icon" /> and Vite. 
            <Link to="/admin" style={{ marginLeft: '10px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              <Lock size={12} />
            </Link>
          </p>
          
          <div className="footer-socials">
            <a href="https://github.com/TaizerCodeCrafter" target="_blank" rel="noreferrer" className="social-link" title="GitHub"><GithubIcon size={20} /></a>
            <a href="https://www.linkedin.com/in/supun-dilshan-madusanka-182a96173/" target="_blank" rel="noreferrer" className="social-link" title="LinkedIn"><LinkedinIcon size={20} /></a>
            <a href="https://www.facebook.com/share/14eV3kv99jP/" target="_blank" rel="noreferrer" className="social-link" title="Facebook"><FacebookIcon size={20} /></a>
            <a href="https://www.tiktok.com/@dilshan5556?_r=1&_t=ZS-95pOAa7ErDE" target="_blank" rel="noreferrer" className="social-link" title="TikTok"><TiktokIcon size={20} /></a>
            <a href="https://chat.whatsapp.com/JkmFmiDGjmeJxEb4Ebz4EN?mode=gi_t" target="_blank" rel="noreferrer" className="social-link" title="WhatsApp"><WhatsappIcon size={20} /></a>
            <a href="#" className="social-link" title="Twitter"><TwitterIcon size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
