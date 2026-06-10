import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import axios from 'axios';
import './Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/testimonials');
        setTestimonials(res.data);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      }
    };
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;
  return (
    <section id="testimonials" className="section testimonials-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">Client <span className="text-gradient">Testimonials</span></h2>
          <p className="section-subtitle">What others say about working with me.</p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="testimonial-card glass"
            >
              <div className="quote-icon">
                <Quote size={24} />
              </div>
              <div className="rating">
                {[...Array(item.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} fill="#ffb800" color="#ffb800" />
                ))}
              </div>
              <p className="testimonial-content">"{item.content}"</p>
              <div className="testimonial-author">
                <img src={item.avatar} alt={item.name} className="author-avatar" />
                <div className="author-info">
                  <h4 className="author-name">{item.name}</h4>
                  <p className="author-role">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
