import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, CheckCircle2, Mail } from 'lucide-react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | TaizerCodeCrafter';
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
          <Shield size={16} /> Privacy & Compliance
        </div>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-last-updated">Last Updated: September 24, 2026</p>
      </div>

      <div className="legal-card">
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>TaizerCodeCrafter</strong> (accessible at <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a>). 
            Your privacy is of paramount importance to us. This Privacy Policy outlines the types of information collected, recorded, and how it is used across our portfolio, tutorials, educational articles, and web services.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>When you visit or interact with our website, we may collect the following types of information:</p>
          <ul>
            <li><strong>Voluntary Information:</strong> When you use our contact form or newsletter subscription, you may provide your name, email address, message details, and optional project attachments.</li>
            <li><strong>Log Files:</strong> Standard internet log files which track internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts to analyze trends and administer the site.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Cookies and Web Beacons</h2>
          <p>
            Like any other modern web application, TaizerCodeCrafter uses "cookies" to store information regarding visitors' preferences and the pages on the website that the visitor accessed or visited. The information is used to optimize the user experience by customizing our web page content based on visitors' browser type and device capabilities.
          </p>
        </section>

        {/* --- CRITICAL SECTION FOR GOOGLE ADSENSE APPROVAL --- */}
        <section className="legal-section">
          <h2>4. Google AdSense & DoubleClick DART Cookies</h2>
          <div className="legal-highlight-box">
            <p>
              Google is one of our third-party vendors. Google uses cookies, known as DART cookies, to serve advertisements to our website visitors based on their visit to https://taizercodecrafter.com and other websites across the internet.
            </p>
          </div>
          <p>
            Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL: <br />
            <a 
              href="https://policies.google.com/technologies/ads" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#ff9d42', wordBreak: 'break-all' }}
            >
              https://policies.google.com/technologies/ads
            </a>
          </p>
          <p>
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on TaizerCodeCrafter. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and to personalize the advertising content that you see.
          </p>
          <p>
            <em>Please note that TaizerCodeCrafter has no access to or control over these cookies that are used by third-party advertisers.</em>
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Third-Party Privacy Policies</h2>
          <p>
            TaizerCodeCrafter's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p>Under the California Consumer Privacy Act (CCPA), California consumers have the right to:</p>
          <ul>
            <li>Request that a business disclose the categories and specific pieces of personal data collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business collected.</li>
            <li>Request that a business not sell the consumer's personal data. (We do not sell personal information).</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. GDPR Data Protection Rights</h2>
          <p>We want to ensure you are fully aware of all of your data protection rights. Every user is entitled to:</p>
          <ul>
            <li><strong>The right to access:</strong> Request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> Request correction of inaccurate information.</li>
            <li><strong>The right to erasure:</strong> Request deletion of your personal data under certain conditions.</li>
            <li><strong>The right to restrict processing:</strong> Request that we restrict the processing of your personal data.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Children's Information (COPPA)</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            TaizerCodeCrafter does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Us</h2>
          <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us:</p>
          <div className="legal-contact-box">
            <p style={{ margin: '4px 0' }}><strong>Developer & Owner:</strong> Supun Dilshan (TaizerCodeCrafter)</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> <a href="mailto:supundilshan358@gmail.com" style={{ color: '#ff9d42' }}>supundilshan358@gmail.com</a></p>
            <p style={{ margin: '4px 0' }}><strong>Website:</strong> <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a></p>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default PrivacyPolicyPage;
