import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import './PrivacyPolicyPage.css';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service | TaizerCodeCrafter';
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="legal-page-container"
    >
      <div className="legal-header">
        <div className="legal-badge">
          <FileText size={16} /> Legal Terms
        </div>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-last-updated">Last Updated: September 24, 2026</p>
      </div>

      <div className="legal-card">
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using <strong>TaizerCodeCrafter</strong> (<a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a>), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Intellectual Property Rights</h2>
          <p>
            The software architecture, source code, designs, branding, logos, and technical articles created by TaizerCodeCrafter remain the intellectual property of Supun Dilshan unless explicitly transferred via a formal freelance/client contract. You may read, share, and reference our public educational tutorials for personal learning.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Web Services & Development Deliverables</h2>
          <p>
            For clients purchasing web development packages or bespoke engineering solutions:
          </p>
          <ul>
            <li>Project scopes, delivery timelines, revisions, and payment milestones are finalized upon mutual agreement before kickoff.</li>
            <li>Post-launch support is provided in accordance with the specific package or service tier selected.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Disclaimer</h2>
          <p>
            The materials on TaizerCodeCrafter's website are provided on an 'as is' basis. We make no warranties, expressed or implied, regarding commercial suitability or accuracy for third-party tools discussed in blog posts or tutorials.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Contact Information</h2>
          <div className="legal-contact-box">
            <p style={{ margin: '4px 0' }}><strong>Developer & Owner:</strong> Supun Dilshan</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> <a href="mailto:supundilshan358@gmail.com" style={{ color: '#ff9d42' }}>supundilshan358@gmail.com</a></p>
            <p style={{ margin: '4px 0' }}><strong>Website:</strong> <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a></p>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default TermsPage;
