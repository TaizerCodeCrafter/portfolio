import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, CheckCircle2, Mail } from 'lucide-react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | TaizerCodeCrafter';

    // Dynamic Meta Tags for SEO & Compliance Crawlers
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = 'Official Privacy Policy for TaizerCodeCrafter. Learn how we handle your data, Google AdSense cookies, Google Analytics, GDPR, CCPA, and your privacy rights.';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = 'https://taizercodecrafter.com/privacy-policy';
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
        <p className="legal-last-updated">Last Updated: September 2026</p>
      </div>

      <div className="legal-card">
        <section className="legal-section">
          <h2>1. Introduction & Consent</h2>
          <p>
            Welcome to <strong>TaizerCodeCrafter</strong> (accessible at <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a>), founded and operated by Supun Dilshan. 
            We are deeply committed to respecting and protecting the privacy of every visitor, client, and reader across our website, portfolio, technical tutorials, and web application services.
          </p>
          <p>
            By accessing or using our website, you hereby consent to this Privacy Policy and agree to its terms. If you have questions or require further clarification regarding our policies, please contact us at <a href="mailto:supundilshan358@gmail.com" style={{ color: '#ff9d42' }}>supundilshan358@gmail.com</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information in two primary ways: information you provide voluntarily and data collected automatically via standard web technologies.</p>
          <ul>
            <li><strong>Voluntary Information:</strong> When you submit a project inquiry through our Contact Form or subscribe to our newsletter, we may collect your name, email address, phone number, subject, and any message details or specifications you provide.</li>
            <li><strong>Log Files & Device Data:</strong> Like most modern websites, TaizerCodeCrafter utilizes standard log files. The collected information includes internet protocol (IP) addresses, browser type, operating system, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and page interaction metrics. This data is not linked to any personally identifiable information and is used exclusively for site administration, security, and usage trend analysis.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Cookies and Web Beacons</h2>
          <p>
            TaizerCodeCrafter uses "cookies" (small text files placed on your device) to store preferences, optimize page rendering, and deliver personalized content based on visitors' browser characteristics. You can manage or disable cookies at any time via your browser settings.
          </p>
        </section>

        {/* --- CRITICAL SECTION FOR GOOGLE ADSENSE APPROVAL --- */}
        <section className="legal-section">
          <h2>4. Google AdSense & Advertising Cookies</h2>
          <div className="legal-highlight-box">
            <p>
              Google is a third-party vendor on our website. Google uses cookies, including the DoubleClick DART cookie and interest-based identifiers, to serve relevant advertisements to users based on their visits to TaizerCodeCrafter and other websites across the internet.
            </p>
          </div>
          <p>
            Users may choose to opt out of personalized advertising and DART cookie tracking by visiting the following official resources:
          </p>
          <ul>
            <li>
              <strong>Google Ad Settings:</strong>{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9d42' }}>
                https://adssettings.google.com
              </a>
            </li>
            <li>
              <strong>Google Privacy & Terms (Advertising):</strong>{' '}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9d42' }}>
                https://policies.google.com/technologies/ads
              </a>
            </li>
            <li>
              <strong>Network Advertising Initiative (NAI) Opt-Out:</strong>{' '}
              <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9d42' }}>
                https://optout.networkadvertising.org
              </a>
            </li>
            <li>
              <strong>Digital Advertising Alliance (DAA) WebChoices:</strong>{' '}
              <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9d42' }}>
                https://optout.aboutads.info
              </a>
            </li>
          </ul>
          <p>
            Third-party ad networks and ad servers may also use cookies, JavaScript, or Web Beacons within their sponsored links or banners to measure advertising effectiveness. TaizerCodeCrafter has no direct access to or control over these cookies used by third-party advertisers.
          </p>
        </section>

        {/* --- GOOGLE ANALYTICS SECTION --- */}
        <section className="legal-section">
          <h2>5. Google Analytics 4 (GA4)</h2>
          <p>
            We use Google Analytics 4 to collect aggregated, non-personally identifiable traffic metrics such as page views, visitor count, session duration, and geographical region. This telemetry allows us to improve website navigation speed, publish higher quality educational articles, and optimize client experience.
          </p>
          <p>
            You can prevent Google Analytics from recognizing your visits across the web by installing the official{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#ff9d42' }}>
              Google Analytics Opt-out Browser Add-on
            </a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Third-Party Links & External Sites</h2>
          <p>
            Our blog articles and project showcase may contain links to external GitHub repositories, technology documentation, client websites, or partner platforms. TaizerCodeCrafter is not responsible for the privacy practices or content of third-party external domains. We encourage you to review their respective privacy policies when visiting external destinations.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p>Under the California Consumer Privacy Act (CCPA), California consumers have specific rights, including:</p>
          <ul>
            <li>The right to request disclosure of categories and specific pieces of personal data collected.</li>
            <li>The right to request immediate deletion of personal data collected about the consumer.</li>
            <li>The right to opt-out of the sale of personal data. <strong>TaizerCodeCrafter does NOT sell, rent, or trade personal data under any circumstances.</strong></li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. GDPR Data Protection Rights</h2>
          <p>If you reside within the European Economic Area (EEA), you possess comprehensive data protection rights under the General Data Protection Regulation (GDPR):</p>
          <ul>
            <li><strong>The Right to Access:</strong> Request copies of your personal contact records.</li>
            <li><strong>The Right to Rectification:</strong> Request correction of inaccurate or incomplete information.</li>
            <li><strong>The Right to Erasure:</strong> Request the deletion of your personal data from our contact and subscription records.</li>
            <li><strong>The Right to Restrict & Object to Processing:</strong> Request restrictions on how your data is handled.</li>
            <li><strong>The Right to Data Portability:</strong> Request transfer of your data to another organization or directly to you.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>9. Children's Online Privacy Protection (COPPA)</h2>
          <p>
            Protecting the safety of children online is an absolute priority. TaizerCodeCrafter does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has submitted personal details through our contact form, please notify us immediately, and we will promptly purge such records.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Data Security & Storage</h2>
          <p>
            We implement robust modern security standards, including industry-standard Transport Layer Security (TLS/HTTPS encryption), secure database credentialing, and strict access controls to safeguard your transmitted information against unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Contact & Data Controller Information</h2>
          <p>If you have any questions, feedback, or data requests regarding this Privacy Policy, please reach out directly:</p>
          <div className="legal-contact-box">
            <p style={{ margin: '4px 0' }}><strong>Developer & Data Controller:</strong> Supun Dilshan (TaizerCodeCrafter)</p>
            <p style={{ margin: '4px 0' }}><strong>Email:</strong> <a href="mailto:supundilshan358@gmail.com" style={{ color: '#ff9d42' }}>supundilshan358@gmail.com</a></p>
            <p style={{ margin: '4px 0' }}><strong>Location:</strong> Colombo, Sri Lanka</p>
            <p style={{ margin: '4px 0' }}><strong>Official Website:</strong> <a href="https://taizercodecrafter.com" style={{ color: '#ff9d42' }}>https://taizercodecrafter.com</a></p>
          </div>
        </section>
      </div>
    </motion.main>
  );
};

export default PrivacyPolicyPage;
