const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  category: { type: String, default: 'Technology' },
  tags: [{ type: String }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    seoScore: Number
  },
  author: { type: String, default: 'AI Writer' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
