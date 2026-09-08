const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  price: { type: Number, required: true },
  currency: { type: String, default: '$' },
  billingPeriod: { type: String, default: 'One-time' },
  deliveryTime: { type: String, default: '3-5 Days' },
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  badge: { type: String, default: '' },
  color: { type: String, default: '#b35a00' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
