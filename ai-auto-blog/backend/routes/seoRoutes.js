const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const BlogPost = require('../models/BlogPost');

// Get Global SEO Settings
router.get('/settings', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'seoSettings' });
    res.json(setting ? setting.value : {
      siteTitle: 'Trendelope',
      metaDescription: '',
      keywords: '',
      googleConsoleId: '',
      ogImage: ''
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Global SEO Settings
router.post('/settings', async (req, res) => {
  const { value } = req.body;
  try {
    let setting = await Setting.findOne({ key: 'seoSettings' });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = new Setting({ key: 'seoSettings', value });
      await setting.save();
    }
    res.json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get SEO Analysis for all posts
router.get('/analysis', async (req, res) => {
  try {
    const blogs = await BlogPost.find({}, 'title slug seo status');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sitemap Generator (Simple XML)
router.get('/sitemap', async (req, res) => {
  try {
    const blogs = await BlogPost.find({ status: 'published' }, 'slug updatedAt');
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add home page
    xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    
    // Add blogs
    blogs.forEach(blog => {
      xml += `  <url>\n    <loc>${baseUrl}/blog/${blog.slug}</loc>\n    <lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
