import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { Typewriter } from 'react-simple-typewriter';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GithubIcon, LinkedinIcon, TwitterIcon, FacebookIcon, TiktokIcon, WhatsappIcon } from './BrandIcons';
import './Hero.css';

const Hero = () => {
  const [settings, setSettings] = useState({ cvUrl: '/resume.pdf' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/settings');
        if (res.data) setSettings(res.data);
      } catch (err) { console.error('Failed to fetch settings'); }
    };
    fetchSettings();
  }, []);
  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="badge"
        >
          <span className="pulse-dot"></span> Available for Freelance Work
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-title"
        >
          Hi, I'm Supun Dilshan <br />
          <div className="typewriter-container">
            <span className="text-gradient typewriter-text">
              <Typewriter
                words={[
                  '💻 Full Stack Developer',
                  '🌐 Frontend | Backend | APIs',
                  '🤖 Exploring AI & Future Tech',
                  '🚀 Building real-world scalable apps'
                ]}
                loop={true}
                cursor
                cursorStyle='|'
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1500}
              />
            </span>
          </div>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hero-subtitle"
        >
          I build real-world scalable apps and explore AI & Future Tech. <br/>
          From frontend to backend APIs, I deliver premium, high-quality digital experiences.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hero-actions"
        >
          <Link to="/projects" className="btn-primary">
            View My Work <ArrowRight size={18} />
          </Link>
          <a href="/#contact-form" className="btn-outline">
            Contact Me
          </a>
          {(settings.isCvActive !== false && settings.cvUrl) && (
            <a href={settings.cvUrl} download className="btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              Download CV
            </a>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="social-links"
        >
          <a href="https://github.com/TaizerCodeCrafter" target="_blank" rel="noreferrer" className="social-icon" title="GitHub"><GithubIcon size={20} /></a>
          <a href="https://www.linkedin.com/in/supun-dilshan-madusanka-182a96173/" target="_blank" rel="noreferrer" className="social-icon" title="LinkedIn"><LinkedinIcon size={20} /></a>
          <a href="https://www.facebook.com/share/14eV3kv99jP/" target="_blank" rel="noreferrer" className="social-icon" title="Facebook"><FacebookIcon size={20} /></a>
          <a href="https://www.tiktok.com/@dilshan5556?_r=1&_t=ZS-95pOAa7ErDE" target="_blank" rel="noreferrer" className="social-icon" title="TikTok"><TiktokIcon size={20} /></a>
          <a href="https://chat.whatsapp.com/JkmFmiDGjmeJxEb4Ebz4EN?mode=gi_t" target="_blank" rel="noreferrer" className="social-icon" title="WhatsApp"><WhatsappIcon size={20} /></a>
          <a href="#" className="social-icon" title="Twitter"><TwitterIcon size={20} /></a>
          <a href={`mailto:${settings.contactEmail || 'supundilshan358@gmail.com'}`} className="social-icon" title="Email"><Mail size={20} /></a>
        </motion.div>
      </div>

      <div className="hero-visual">
        <div className="profile-container">
          <div className="profile-glow"></div>
          <img src={settings.heroImage || "/my.png"} alt="TaizerCodeCrafter - Full Stack Developer" className="profile-image floating" />
          
          <div className="floating-badge badge-1 glass floating" style={{ animationDelay: '0s' }}>
            <span>💻</span> Frontend
          </div>
          <div className="floating-badge badge-2 glass floating" style={{ animationDelay: '1.5s' }}>
            <span>⚙️</span> Backend
          </div>
          <div className="floating-badge badge-3 glass floating" style={{ animationDelay: '3s' }}>
            <span>🚀</span> AI & Tech
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
