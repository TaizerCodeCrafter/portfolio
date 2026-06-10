const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  liveLink: { type: String },
  githubLink: { type: String },
  technologies: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isForSale: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
