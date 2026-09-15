import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, CheckCircle2, Paperclip } from 'lucide-react';
import axios from 'axios';
import FileDropzone from './FileDropzone';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    contactEmail: 'supundilshan358@gmail.com',
    contactPhone: '+94 7X XXX XXXX',
    contactLocation: 'Colombo, Sri Lanka'
  });

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) { console.error('Failed to fetch contact settings'); }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setUploadProgress(files.length > 0 ? 0 : null);

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('subject', formData.subject);
      payload.append('message', formData.message);

      const relPathsMap = {};
      files.forEach((file, idx) => {
        payload.append('attachments', file);
        if (file.customRelativePath || file.webkitRelativePath) {
          const rPath = file.customRelativePath || file.webkitRelativePath;
          relPathsMap[file.name] = rPath;
          payload.append(`relativePath_${idx}`, rPath);
        }
      });
      payload.append('relativePaths', JSON.stringify(relPathsMap));

      await axios.post('/api/messages', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });

      setSubmitted(true);
      setFiles([]);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setUploadProgress(null);
      }, 5000);
    } catch (err) {
      console.error('Submit message error:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="section contact-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">Get In <span className="text-gradient">Touch</span></h2>
          <p className="section-subtitle">Have a project in mind? Let's discuss how I can help you.</p>
        </motion.div>

        <div className="contact-grid">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="contact-info"
          >
            <div className="info-card glass">
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email Me</h4>
                  <p>{settings.contactEmail}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Phone size={20} /></div>
                <div>
                  <h4>Call Me</h4>
                  <p>{settings.contactPhone}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Location</h4>
                  <p>{settings.contactLocation}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="contact-form-wrapper"
          >
            {submitted ? (
              <div className="success-message glass">
                <CheckCircle2 size={48} color="#10b981" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. I'll get back to you as soon as possible.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form glass">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    placeholder="Project Inquiry" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Tell me about your project..." 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} style={{ color: '#b35a00' }} /> Attachments (PDF, Photos, Zip, Folder, Setup .exe)
                  </label>
                  <FileDropzone 
                    files={files} 
                    setFiles={setFiles} 
                    uploadProgress={uploadProgress} 
                    isSubmitting={isSubmitting} 
                  />
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '600' }}>{error}</p>}
                <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Sending Message... <span className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block' }}></span></>
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
