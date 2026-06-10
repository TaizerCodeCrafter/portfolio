const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'image' },
  size: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
