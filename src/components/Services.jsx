import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Server, Database, Sparkles, Smartphone, Layout, PenTool, Globe } from 'lucide-react';
import axios from 'axios';
import './Services.css';

const defaultServices = [
  {
    icon: 'Layout',
    title: 'Frontend Development',
    description: 'Pixel-perfect, responsive, and dynamic user interfaces using React, Vue, and modern CSS.',
    details: 'Frontend development is the process of creating the visual and interactive part of a website that users interact with directly. It involves HTML (structure), CSS (styling), and JavaScript (functionality). Modern frameworks like React help build "Single Page Applications" that feel fast and fluid.',
    learning: ['HTML/CSS Basics', 'JavaScript ES6+', 'React Hooks', 'Responsive Layouts'],
    color: '#8b5cf6'
  },
  {
    icon: 'Server',
    title: 'Backend Systems',
    description: 'Robust, scalable server-side architecture and APIs using Node.js, Python, and Java.',
    details: 'The backend is the "brain" of an application that runs on a server, away from the user\'s eyes. It handles data storage, security, and complex logic. Common tools include Node.js, Express, and databases like MongoDB or PostgreSQL.',
    learning: ['Server Logic', 'REST API Design', 'Authentication/JWT', 'Middleware'],
    color: '#0ea5e9'
  },
  {
    icon: 'Database',
    title: 'Database Design',
    description: 'Efficient data modeling and management with SQL and NoSQL databases.',
    details: 'Database design is about organizing data efficiently so it can be retrieved quickly. Relational databases (SQL) use tables, while Non-relational (NoSQL) like MongoDB use flexible document structures. Good design prevents data duplication and errors.',
    learning: ['SQL Queries', 'NoSQL Schema', 'Data Normalization', 'Indexing'],
    color: '#ec4899'
  },
  {
    icon: 'Sparkles',
    title: 'AI Integration',
    description: 'Implementing LLMs, machine learning models, and smart features into real-world apps.',
    details: 'AI Integration involves adding "intelligence" to apps using models like GPT-4 or Gemini. This includes features like chatbots, automatic content generation, and image recognition. It bridges the gap between raw data and smart user experiences.',
    learning: ['Prompt Engineering', 'API Integrations', 'Vector Databases', 'NLP Basics'],
    color: '#10b981'
  },
  {
    icon: 'Smartphone',
    title: 'Responsive Design',
    description: 'Ensuring your application looks and works perfectly across all devices and screen sizes.',
    details: 'Responsive design makes a website look good on everything from a tiny smartphone to a massive 4K monitor. We use flexible grids, images, and CSS Media Queries to rearrange content based on the screen width.',
    learning: ['Flexbox/Grid', 'Media Queries', 'Mobile-First Design', 'Viewport Units'],
    color: '#f59e0b'
  },
  {
    icon: 'Code',
    title: 'API Development',
    description: 'Building secure, fast, and documented RESTful and GraphQL APIs.',
    details: 'APIs (Application Programming Interfaces) are sets of rules that allow two pieces of software to talk to each other. REST is the most common architectural style, while GraphQL allows clients to ask for exactly the data they need.',
    learning: ['HTTP Methods', 'JSON/XML Format', 'GraphQL Schemas', 'API Security'],
    color: '#ef4444'
  }
];

const IconMap = {
  Layout: <Layout size={32} />,
  Server: <Server size={32} />,
  Database: <Database size={32} />,
  Sparkles: <Sparkles size={32} />,
  Smartphone: <Smartphone size={32} />,
  Code: <Code size={32} />,
  PenTool: <PenTool size={32} />,
  Globe: <Globe size={32} />
};

const getIcon = (iconName) => IconMap[iconName] || <Code size={32} />;

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('/api/services');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);

  return (
    <section id="services" className="section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">My <span className="text-gradient">Services</span></h2>
        <p className="section-subtitle">Comprehensive solutions for your digital needs, delivered with premium quality.</p>
      </motion.div>

      <div className="services-grid">
        {services.map((service, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="service-card glass"
            onClick={() => setSelectedService(service)}
            style={{ cursor: 'pointer' }}
          >
            <div className="service-icon" style={{ color: service.color, background: `${service.color}15` }}>
              {getIcon(service.icon)}
            </div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.description}</p>
            <div className="learn-more-btn" style={{ color: service.color }}>Learn More →</div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedService && (
          <div className="modal-overlay" onClick={() => setSelectedService(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="service-modal glass"
              onClick={e => e.stopPropagation()}
            >
              <button className="close-modal" onClick={() => setSelectedService(null)}>×</button>
              <div className="modal-header">
                <div className="modal-icon" style={{ color: selectedService.color, background: `${selectedService.color}15` }}>
                  {getIcon(selectedService.icon)}
                </div>
                <h2 className="modal-title">{selectedService.title}</h2>
              </div>
              <div className="modal-content">
                <h3>Introduction</h3>
                <p>{selectedService.details}</p>
                <div className="learning-path">
                  <h3>Key Concepts to Learn</h3>
                  <div className="learning-tags">
                    {selectedService.learning.map((tag, i) => (
                      <span key={i} className="learn-tag" style={{ border: `1px solid ${selectedService.color}30` }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
