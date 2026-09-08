import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Building2 } from 'lucide-react';
import axios from 'axios';
import './Companies.css';

const defaultCompanies = [
  {
    _id: 'default-1',
    name: 'Google',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
    website: 'https://google.com'
  },
  {
    _id: 'default-2',
    name: 'Meta / Facebook',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    website: 'https://about.meta.com'
  },
  {
    _id: 'default-3',
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    website: 'https://microsoft.com'
  },
  {
    _id: 'default-4',
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    website: 'https://amazon.com'
  },
  {
    _id: 'default-5',
    name: 'OpenAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    website: 'https://openai.com'
  },
  {
    _id: 'default-6',
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    website: 'https://netflix.com'
  },
  {
    _id: 'default-7',
    name: 'Spotify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
    website: 'https://spotify.com'
  },
  {
    _id: 'default-8',
    name: 'GitHub',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    website: 'https://github.com'
  }
];

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('/api/companies');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCompanies(res.data);
        } else {
          setCompanies(defaultCompanies);
        }
      } catch (err) {
        console.warn('Could not fetch companies, using defaults:', err.message);
        setCompanies(defaultCompanies);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const displayList = companies.length > 0 ? companies : defaultCompanies;

  // Duplicate items to ensure smooth infinite seamless marquee loop
  const marqueeItems = [...displayList, ...displayList];

  return (
    <section className="companies-section section" id="companies">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-header text-center"
        >
          <div className="companies-badge">
            <Building2 size={14} />
            <span>Trusted By & Associated With</span>
          </div>
          <h2 className="section-title">
            Companies <span className="text-gradient">& Collaborations</span>
          </h2>
          <p className="section-subtitle">
            Proud to have worked, partnered, and built digital experiences alongside innovative brands.
          </p>
        </motion.div>
      </div>

      {/* Infinite Marquee Track Container */}
      <div className="companies-marquee-wrapper">
        <div className="companies-marquee-track">
          {marqueeItems.map((item, index) => {
            const CardWrapper = item.website ? 'a' : 'div';
            const wrapperProps = item.website 
              ? { href: item.website, target: '_blank', rel: 'noopener noreferrer' } 
              : {};

            return (
              <CardWrapper 
                key={`${item._id || item.name}-${index}`} 
                className="company-card glass"
                {...wrapperProps}
              >
                <div className="company-logo-box">
                  <img 
                    src={item.logo} 
                    alt={item.name} 
                    className="company-logo-img"
                    onError={(e) => {
                      // Fallback if an image fails to load
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2563eb&color=fff&bold=true`;
                    }}
                  />
                </div>
                <div className="company-info">
                  <span className="company-name">{item.name}</span>
                  {item.website && <ExternalLink size={12} className="company-ext-icon" />}
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Companies;
