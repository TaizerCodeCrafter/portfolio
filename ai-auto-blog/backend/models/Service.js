const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: String, default: '' },
  learning: { type: [String], default: [] },
  color: { type: String, default: '#8b5cf6' },
  icon: { type: String, default: 'Layout' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
