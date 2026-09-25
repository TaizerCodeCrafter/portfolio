import React, { useState } from 'react';
import { X, ShoppingBag, Copy, Check, Send, Coins, Building, ShieldCheck } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import axios from 'axios';
import './ProjectBuyModal.css';

const ProjectBuyModal = ({ project, onClose, paymentSettings = {} }) => {
  const [paymentTab, setPaymentTab] = useState('crypto'); // 'crypto' | 'bank'
  const [copiedField, setCopiedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    github: '',
    txId: ''
  });
  const [formError, setFormError] = useState('');

  // Payment Details from Settings (with fallback defaults)
  const usdtAddress = paymentSettings.binanceUsdtAddress || 'TYDzsYbc2fRkHpx7V9a8x9H4YhQzNmTron';
  const usdtNetwork = paymentSettings.binanceNetwork || 'USDT (TRC20 / BEP20)';
  
  const bankName = paymentSettings.bankName || 'Commercial Bank of Ceylon';
  const bankAccountName = paymentSettings.bankAccountName || 'K. A. Supun Dilshan';
  const bankAccountNumber = paymentSettings.bankAccountNumber || '8008123456';
  const bankBranch = paymentSettings.bankBranch || 'Colombo / Homagama';
  const targetWhatsapp = (paymentSettings.contactWhatsapp || '+94705770398').replace(/[^0-9]/g, '');

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Please enter your WhatsApp/Phone number.');
      return;
    }
    if (!formData.github.trim()) {
      setFormError('Please enter your GitHub username or profile URL.');
      return;
    }

    setIsSubmitting(true);

    const chosenMethod = paymentTab === 'crypto' ? `Binance USDT (${usdtNetwork})` : `Bank Transfer (${bankName})`;

    // 1. Structured WhatsApp Message
    const waMessage = 
`🛍️ *NEW PROJECT PURCHASE REQUEST*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Project:* ${project.title}
💰 *Price:* $${project.price} USD

👤 *Buyer Details:*
• *Full Name:* ${formData.name.trim()}
• *Email:* ${formData.email.trim()}
• *WhatsApp / Phone:* ${formData.phone.trim()}
• *GitHub Account:* ${formData.github.trim()}

💳 *Payment Information:*
• *Payment Method:* ${chosenMethod}
• *Reference / TxID:* ${formData.txId.trim() || 'Paid / Sending screenshot in chat'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_Please confirm payment and grant source code access to my GitHub account._`;

    // 2. Also log as a lead message to backend so owner has permanent record
    try {
      await axios.post('/api/messages', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: `[BUY REQUEST] ${project.title} ($${project.price})`,
        message: `Project Purchase Request:\nProject: ${project.title} ($${project.price})\nBuyer: ${formData.name}\nPhone: ${formData.phone}\nGitHub: ${formData.github}\nPayment: ${chosenMethod}\nTxID/Ref: ${formData.txId || 'None'}`
      });
    } catch (err) {
      console.warn('Could not archive order to backend:', err.message);
    }

    // 3. Open WhatsApp directly with pre-filled message
    const waUrl = `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="buy-modal-overlay" onClick={onClose}>
      <div className="buy-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="buy-modal-header">
          <div className="buy-modal-title-wrap">
            <div className="buy-modal-icon-badge">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="buy-modal-title">Purchase Project</h3>
              <p className="buy-modal-subtitle">Instant Source Code & License Access</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="buy-modal-close-btn"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="buy-modal-body">
          {/* Project Summary Banner */}
          <div className="buy-modal-project-summary">
            <div className="buy-modal-project-left">
              {project.image ? (
                <img src={project.image} alt={project.title} className="buy-modal-project-thumb" />
              ) : (
                <div className="buy-modal-project-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} color="#ff9d42" />
                </div>
              )}
              <div>
                <h4 className="buy-modal-project-name">{project.title}</h4>
                <p className="buy-modal-project-tagline">Full Source Code + Setup Documentation</p>
              </div>
            </div>
            <div className="buy-modal-price-tag">
              ${project.price} USD
            </div>
          </div>

          {/* Payment Method Selector */}
          <h5 className="buy-modal-section-title">1. Choose Payment Method</h5>
          <div className="buy-modal-tabs">
            <button
              type="button"
              className={`buy-modal-tab-btn ${paymentTab === 'crypto' ? 'active' : ''}`}
              onClick={() => setPaymentTab('crypto')}
            >
              <Coins size={16} /> Binance USDT
            </button>
            <button
              type="button"
              className={`buy-modal-tab-btn ${paymentTab === 'bank' ? 'active' : ''}`}
              onClick={() => setPaymentTab('bank')}
            >
              <Building size={16} /> Bank Transfer
            </button>
          </div>

          {/* Payment Details Card */}
          {paymentTab === 'crypto' ? (
            <div className="buy-modal-pay-card">
              <div className="buy-modal-field-row">
                <span className="buy-modal-field-label">Accepted Currency</span>
                <span className="buy-modal-field-value" style={{ color: '#22c55e' }}>USDT ({usdtNetwork})</span>
              </div>
              <div className="buy-modal-field-row" style={{ alignItems: 'flex-start' }}>
                <span className="buy-modal-field-label" style={{ marginTop: '4px' }}>Wallet Address</span>
                <div className="buy-modal-field-val-wrap">
                  <span className="buy-modal-field-value">{usdtAddress}</span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(usdtAddress, 'usdt')}
                    className={`buy-modal-copy-btn ${copiedField === 'usdt' ? 'copied' : ''}`}
                  >
                    {copiedField === 'usdt' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'usdt' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="buy-modal-pay-card">
              <div className="buy-modal-field-row">
                <span className="buy-modal-field-label">Bank Name</span>
                <span className="buy-modal-field-value">{bankName}</span>
              </div>
              <div className="buy-modal-field-row">
                <span className="buy-modal-field-label">Account Name</span>
                <span className="buy-modal-field-value">{bankAccountName}</span>
              </div>
              <div className="buy-modal-field-row">
                <span className="buy-modal-field-label">Account Number</span>
                <div className="buy-modal-field-val-wrap">
                  <span className="buy-modal-field-value">{bankAccountNumber}</span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(bankAccountNumber, 'bank')}
                    className={`buy-modal-copy-btn ${copiedField === 'bank' ? 'copied' : ''}`}
                  >
                    {copiedField === 'bank' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'bank' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="buy-modal-field-row">
                <span className="buy-modal-field-label">Branch</span>
                <span className="buy-modal-field-value">{bankBranch}</span>
              </div>
            </div>
          )}

          {/* Buyer Details Form */}
          <h5 className="buy-modal-section-title">2. Buyer & Access Information</h5>

          {formError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '12px' }}>
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="buy-modal-form-grid">
              <div className="buy-modal-input-group">
                <label>Full Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  className="buy-modal-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="buy-modal-input-group">
                <label>WhatsApp / Phone <span className="required">*</span></label>
                <input 
                  type="tel" 
                  required
                  placeholder="e.g. +94 7X XXX XXXX"
                  className="buy-modal-input"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="buy-modal-input-group">
                <label>Email Address <span className="required">*</span></label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. john@example.com"
                  className="buy-modal-input"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="buy-modal-input-group">
                <label>
                  <GithubIcon size={13} style={{ display: 'inline', marginRight: '4px' }} /> 
                  GitHub Username / Profile <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. @yourusername or github.com/..."
                  className="buy-modal-input"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                />
              </div>

              <div className="buy-modal-input-group full-width">
                <label>Transaction ID / Reference Note (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. USDT TxID / Bank Ref No. (or attach slip in WhatsApp chat)"
                  className="buy-modal-input"
                  value={formData.txId}
                  onChange={e => setFormData({ ...formData, txId: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="buy-modal-submit-btn"
              disabled={isSubmitting}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Sending Request...' : 'Submit Order via WhatsApp'}</span>
            </button>
            <p className="buy-modal-submit-note">
              🔒 Your details are securely encrypted and forwarded directly to WhatsApp to complete your order and grant repository access.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuyModal;
