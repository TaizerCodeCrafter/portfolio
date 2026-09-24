import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import './PrivacyPolicyPage.css';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Terms of Service | TaizerCodeCrafter';

    // Dynamic Meta Tags for SEO & Compliance Crawlers
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Terms of Service for TaizerCodeCrafter. Review our guidelines on intellectual property, freelance development contracts, educational content, and acceptable use.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://taizercodecrafter.com/terms';
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
          <FileText size={16} /> Legal Terms & Guidelines
        </div>
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-last-updated">Last Updated: September 2026</p>
      </div>

      <div className="legal-card">
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using <strong>TaizerCodeCrafter</strong> (<a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a>), you agree to be bound by these Terms of Service, all applicable laws and regulations, and acknowledge that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Intellectual Property Rights</h2>
          <p>
            Unless otherwise stated, all source code, software architecture, UI/UX designs, articles, graphics, and branding on TaizerCodeCrafter are the exclusive intellectual property of Supun Dilshan.
          </p>
          <ul>
            <li><strong>Educational Use:</strong> You are granted a limited, non-exclusive license to read, share, and reference code snippets from our public blog tutorials for personal, non-commercial education.</li>
            <li><strong>Client Ownership:</strong> Deliverables created for clients under formal development agreements become the property of the client upon fulfillment of agreed payment milestones.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Acceptable Use Policy</h2>
          <p>When using this website or our contact forms, you agree NOT to:</p>
          <ul>
            <li>Engage in automated data harvesting, web scraping, or denial-of-service attempts.</li>
            <li>Transmit unsolicited advertising, spam messages, or malicious payloads via our contact systems.</li>
            <li>Attempt to probe, scan, or breach the security of our application infrastructure or administrative portals.</li>
            <li>Misrepresent your identity or impersonate any person or entity.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Third-Party Advertisements & External Links</h2>
          <p>
            TaizerCodeCrafter may display advertisements served by Google AdSense and third-party advertising networks. We do not endorse or assume liability for the products, services, or claims advertised in these sponsored placements.
          </p>
          <p>
            Our website also contains links to external developer resources, npm packages, and GitHub repositories. Accessing external websites is done at your own discretion, subject to those platforms' terms and policies.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Web Services & Development Deliverables</h2>
          <p>
            For clients commissioning web development packages, custom AI chatbots, or web applications:
          </p>
          <ul>
            <li><strong>Scope of Work:</strong> Project deliverables, revision limits, milestones, and timelines are confirmed in writing prior to project commencement.</li>
            <li><strong>Payment Milestones:</strong> Standard contracts require a 50% initiation deposit, with the remaining 50% due upon final testing and production deployment.</li>
            <li><strong>Warranty & Support:</strong> Complimentary bug-fix support is provided post-launch as defined in the agreed service package.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Disclaimer of Warranties</h2>
          <p>
            All information, tutorials, and materials on TaizerCodeCrafter are provided on an "as is" and "as available" basis. While we strive for extreme precision and current best practices, we make no warranties regarding completeness, suitability, or fitness for a particular purpose of open-source scripts or tutorial demonstrations.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall TaizerCodeCrafter or Supun Dilshan be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the materials or services provided on this website.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Governing Law & Jurisdiction</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the laws of Sri Lanka, without regard to conflict of law principles. Any legal proceedings arising under these terms shall be subject to the jurisdiction of the competent courts in Sri Lanka.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Modifications to Terms</h2>
          <p>
            We reserve the right to revise or update these Terms of Service at any time without prior notice. By continuing to use this website after revisions become effective, you agree to be bound by the updated terms.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact Information</h2>
          <div className="legal-contact-box">
            <p style={{ margin: '4px 0' }}><strong>Developer & Owner:</strong> Supun Dilshan (TaizerCodeCrafter)</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> <a href="mailto:supundilshan358@gmail.com" style={{ color: '#ff9d42' }}>supundilshan358@gmail.com</a></p>
            <p style={{ margin: '4px 0' }}><strong>Location:</strong> Colombo, Sri Lanka</p>
            <p style={{ margin: '4px 0' }}><strong>Official Website:</strong> <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a></p>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default TermsPage;
