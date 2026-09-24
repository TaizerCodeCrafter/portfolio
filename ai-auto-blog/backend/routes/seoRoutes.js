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

// Intelligent SEO Score Calculator
const calculateSeoScore = (blog) => {
  let score = 0;
  const title = blog.title || '';
  const metaTitle = blog.seo?.metaTitle || '';
  const metaDesc = blog.seo?.metaDescription || '';
  const keywords = Array.isArray(blog.seo?.keywords) ? blog.seo.keywords : [];
  const focusKeyword = keywords[0] || (blog.tags && blog.tags[0]) || '';
  const content = blog.content || '';
  const slug = blog.slug || '';

  // 1. Meta Title (Max 25 pts)
  const effectiveTitle = metaTitle || title;
  if (effectiveTitle.length >= 35 && effectiveTitle.length <= 65) {
    score += 25;
  } else if (effectiveTitle.length > 20) {
    score += 15;
  }

  // 2. Meta Description (Max 25 pts)
  if (metaDesc.length >= 90 && metaDesc.length <= 165) {
    score += 25;
  } else if (metaDesc.length >= 40) {
    score += 15;
  }

  // 3. Focus Keyword relevance (Max 25 pts)
  if (focusKeyword) {
    const fk = focusKeyword.toLowerCase().trim();
    if (effectiveTitle.toLowerCase().includes(fk)) score += 10;
    if (metaDesc.toLowerCase().includes(fk)) score += 8;
    if (slug.toLowerCase().includes(fk.replace(/\s+/g, '-'))) score += 7;
  } else if (keywords.length > 0 || (blog.tags && blog.tags.length > 0)) {
    score += 12;
  }

  // 4. Content Structure (Max 25 pts)
  const plainText = content ? content.replace(/<[^>]*>/g, ' ').trim() : '';
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 600) score += 15;
  else if (wordCount >= 300) score += 10;
  else score += 5;

  if (/<h[2-4][^>]*>/i.test(content)) score += 10;

  return Math.min(100, Math.max(20, score));
};

// Get SEO Analysis for all posts
router.get('/analysis', async (req, res) => {
  try {
    const blogs = await BlogPost.find({}, 'title slug seo status content excerpt coverImage tags');
    const analyzed = blogs.map(b => {
      const doc = b.toObject();
      const score = b.seo?.seoScore || calculateSeoScore(b);
      return {
        ...doc,
        seo: {
          ...doc.seo,
          seoScore: score,
          metaTitle: doc.seo?.metaTitle || doc.title || '',
          metaDescription: doc.seo?.metaDescription || doc.excerpt || '',
          keywords: doc.seo?.keywords && doc.seo.keywords.length > 0 ? doc.seo.keywords : (doc.tags || [])
        }
      };
    });
    res.json(analyzed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auto-Optimize All Posts (Computes real SEO scores & auto-generates missing tags)
router.post('/optimize-all', async (req, res) => {
  try {
    const blogs = await BlogPost.find();
    let updatedCount = 0;

    for (let blog of blogs) {
      let changed = false;
      if (!blog.seo) blog.seo = {};

      // Auto-generate metaTitle if empty
      if (!blog.seo.metaTitle) {
        blog.seo.metaTitle = blog.title.slice(0, 60);
        changed = true;
      }

      // Auto-generate metaDescription if empty
      if (!blog.seo.metaDescription) {
        const plain = (blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, ' ').trim() : '')).slice(0, 150);
        blog.seo.metaDescription = plain ? (plain + '...') : blog.title;
        changed = true;
      }

      // Auto-generate keywords if empty
      if (!blog.seo.keywords || blog.seo.keywords.length === 0) {
        const words = blog.title.split(/\s+/).filter(w => w.length > 3).slice(0, 4);
        blog.seo.keywords = words.length > 0 ? words : ['technology', 'programming'];
        changed = true;
      }

      // Calculate score
      const newScore = calculateSeoScore(blog);
      if (blog.seo.seoScore !== newScore) {
        blog.seo.seoScore = newScore;
        changed = true;
      }

      if (changed) {
        blog.markModified('seo');
        await blog.save();
        updatedCount++;
      }
    }

    res.json({ message: `Successfully optimized ${updatedCount} posts!`, count: updatedCount });
  } catch (err) {
    console.error('Optimize all error:', err);
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
