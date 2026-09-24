const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  path: { type: String, required: true },
  title: { type: String, default: '' },
  referrer: { type: String, default: 'Direct' },
  referrerDomain: { type: String, default: 'direct' },
  device: { type: String, default: 'desktop' }, // mobile, tablet, desktop
  browser: { type: String, default: 'Other' },
  ipHash: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 } // Auto-cleans after 90 days
});

visitorLogSchema.index({ createdAt: -1 });
visitorLogSchema.index({ path: 1 });

module.exports = mongoose.model('VisitorLog', visitorLogSchema);
