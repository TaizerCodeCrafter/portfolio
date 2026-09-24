const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

// Create new blog
router.post('/', async (req, res) => {
  try {
    let { title, slug, content, category, tags, status, image, seoTitle, seoDescription, focusKeyword } = req.body;
    
    if (!slug) {
      slug = (title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Auto-resolve duplicate slug to prevent MongoDB E11000 duplicate key error
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const finalMetaTitle = seoTitle || req.body.seo?.metaTitle || title || '';
    const finalMetaDesc = seoDescription || req.body.seo?.metaDescription || req.body.excerpt || '';
    const rawKeywords = focusKeyword || req.body.seo?.keywords;
    const finalKeywords = rawKeywords ? (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(k => k.trim()) : rawKeywords) : (tags || []);

    // Quick score calculation
    let calcScore = 20;
    if (finalMetaTitle.length >= 35 && finalMetaTitle.length <= 65) calcScore += 25;
    else if (finalMetaTitle.length > 20) calcScore += 15;
    if (finalMetaDesc.length >= 90 && finalMetaDesc.length <= 165) calcScore += 25;
    else if (finalMetaDesc.length >= 40) calcScore += 15;
    if (finalKeywords.length > 0) calcScore += 15;
    if (content && content.length > 500) calcScore += 15;

    const blogPost = new BlogPost({
      title,
      slug,
      content,
      category,
      tags,
      status: status || 'published',
      coverImage: image || req.body.coverImage,
      seo: {
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDesc,
        keywords: finalKeywords,
        seoScore: Math.min(100, calcScore)
      }
    });

    const savedBlog = await blogPost.save();

    // Facebook Auto-Post if published
    if (status === 'published') {
      try {
        const Setting = require('../models/Setting');
        const { postToFacebook } = require('../services/facebookService');
        const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
        if (aiConfigSetting && aiConfigSetting.value.fbEnabled) {
          await postToFacebook(aiConfigSetting.value, savedBlog);
        }
      } catch (fbErr) {
        console.error('FB Auto-Post Failed:', fbErr.message);
      }
    }

    res.status(201).json(savedBlog);
  } catch (error) {
    console.error('Publish Error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Get all published blogs (excludes heavy content field for fast loading & serverless safety)
router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=86400');
    const blogs = await BlogPost.find({ status: 'published' })
      .select('-content')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all blogs (including drafts)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await BlogPost.find()
      .select('-content -coverImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update blog
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, content, category, tags, status, image, seoTitle, seoDescription, focusKeyword } = req.body;
    
    const finalMetaTitle = seoTitle || req.body.seo?.metaTitle || title || '';
    const finalMetaDesc = seoDescription || req.body.seo?.metaDescription || req.body.excerpt || '';
    const rawKeywords = focusKeyword || req.body.seo?.keywords;
    const finalKeywords = rawKeywords ? (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(k => k.trim()) : rawKeywords) : (tags || []);

    let calcScore = 20;
    if (finalMetaTitle.length >= 35 && finalMetaTitle.length <= 65) calcScore += 25;
    else if (finalMetaTitle.length > 20) calcScore += 15;
    if (finalMetaDesc.length >= 90 && finalMetaDesc.length <= 165) calcScore += 25;
    else if (finalMetaDesc.length >= 40) calcScore += 15;
    if (finalKeywords.length > 0) calcScore += 15;
    if (content && content.length > 500) calcScore += 15;

    const updateData = {
      title,
      slug,
      content,
      category,
      tags,
      status,
      coverImage: image || req.body.coverImage,
      seo: {
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDesc,
        keywords: finalKeywords,
        seoScore: Math.min(100, calcScore)
      }
    };

    const updatedBlog = await BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Facebook Auto-Post if published (and it was a transition to published or just an update to published)
    if (status === 'published') {
      try {
        const Setting = require('../models/Setting');
        const { postToFacebook } = require('../services/facebookService');
        const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
        if (aiConfigSetting && aiConfigSetting.value.fbEnabled) {
          await postToFacebook(aiConfigSetting.value, updatedBlog);
        }
      } catch (fbErr) {
        console.error('FB Auto-Post Failed:', fbErr.message);
      }
    }

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all blogs (Admin)
router.delete('/admin/delete-all', async (req, res) => {
  try {
    await BlogPost.deleteMany({});
    res.json({ message: 'All blogs deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AI Generation
const { generateBlogPost, optimizeSEO, getTrendingTopics } = require('../services/aiService');
const Setting = require('../models/Setting');

router.post('/generate-ai', async (req, res) => {
  try {
    const { topic, keywords, tone, wordCount, category } = req.body;
    const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
    if (!aiConfigSetting || !aiConfigSetting.value.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API Key is not configured.' });
    }
    const aiContent = await generateBlogPost({ topic, keywords, tone, wordCount, category }, aiConfigSetting.value);
    res.json(aiContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/optimize-seo', async (req, res) => {
  try {
    const { keyword, content } = req.body;
    const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
    if (!aiConfigSetting || !aiConfigSetting.value || !aiConfigSetting.value.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API Key is not configured.' });
    }
    const analysis = await optimizeSEO({ keyword, content }, aiConfigSetting.value);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trending-topics', async (req, res) => {
  try {
    const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
    if (!aiConfigSetting || !aiConfigSetting.value || !aiConfigSetting.value.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API Key is not configured.' });
    }
    const trends = await getTrendingTopics(aiConfigSetting.value);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Smart Country-Aware Fallback Keyword Generator
const generateFallbackKeywordData = (seedKeyword, country = 'Sri Lanka', domain = '') => {
  const kw = (seedKeyword || 'software engineering').toLowerCase().trim();
  const c = country || 'Sri Lanka';

  let volMult = 1.0;
  let cpcCurrency = '$';
  let localSuffix = '';

  if (c.includes('Sri Lanka')) {
    volMult = 0.16;
    localSuffix = ' in sri lanka';
  } else if (c.includes('United States') || c === 'US') {
    volMult = 1.0;
  } else if (c.includes('United Kingdom') || c === 'UK') {
    volMult = 0.45;
  } else if (c.includes('India')) {
    volMult = 0.85;
    localSuffix = ' in india';
  } else if (c.includes('Canada')) {
    volMult = 0.35;
  } else if (c.includes('Australia')) {
    volMult = 0.30;
  } else if (c.includes('Germany')) {
    volMult = 0.40;
  } else if (c.includes('United Arab Emirates') || c.includes('UAE')) {
    volMult = 0.25;
    localSuffix = ' in uae';
  } else if (c.includes('Singapore')) {
    volMult = 0.22;
  }

  const formatVol = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getKdLabel = (kd) => {
    if (kd < 15) return 'Very Easy';
    if (kd < 30) return 'Easy';
    if (kd < 50) return 'Possible';
    if (kd < 70) return 'Difficult';
    if (kd < 85) return 'Hard';
    return 'Very Hard';
  };

  const templates = [
    { text: `${kw}`, intent: 'I', baseVol: 24000, kd: 68, cpc: 2.45, match: 'exact', q: false },
    { text: `best ${kw} tools`, intent: 'C', baseVol: 8200, kd: 44, cpc: 3.10, match: 'broad', q: false },
    { text: `how to learn ${kw}`, intent: 'I', baseVol: 12500, kd: 32, cpc: 1.20, match: 'question', q: true },
    { text: `${kw} salary${localSuffix}`, intent: 'C', baseVol: 9800, kd: 28, cpc: 2.10, match: 'phrase', q: false },
    { text: `${kw} course${localSuffix}`, intent: 'C', baseVol: 7400, kd: 36, cpc: 3.80, match: 'phrase', q: false },
    { text: `${kw} jobs${localSuffix}`, intent: 'T', baseVol: 14200, kd: 48, cpc: 2.90, match: 'phrase', q: false },
    { text: `what is ${kw}`, intent: 'I', baseVol: 18500, kd: 22, cpc: 0.85, match: 'question', q: true },
    { text: `${kw} roadmap 2026`, intent: 'I', baseVol: 6100, kd: 26, cpc: 1.45, match: 'broad', q: false },
    { text: `${kw} interview questions`, intent: 'I', baseVol: 8900, kd: 35, cpc: 1.60, match: 'question', q: true },
    { text: `hire ${kw} expert`, intent: 'T', baseVol: 3200, kd: 52, cpc: 5.40, match: 'phrase', q: false },
    { text: `top ${kw} companies${localSuffix}`, intent: 'C', baseVol: 4500, kd: 38, cpc: 2.65, match: 'broad', q: false },
    { text: `why is ${kw} important`, intent: 'I', baseVol: 3800, kd: 19, cpc: 0.95, match: 'question', q: true },
    { text: `${kw} certification online`, intent: 'T', baseVol: 5600, kd: 45, cpc: 4.20, match: 'phrase', q: false },
    { text: `${kw} vs data science`, intent: 'C', baseVol: 4100, kd: 34, cpc: 2.30, match: 'related', q: false },
    { text: `free ${kw} tutorial for beginners`, intent: 'I', baseVol: 7200, kd: 24, cpc: 0.70, match: 'question', q: true },
    { text: `best institute for ${kw}${localSuffix}`, intent: 'C', baseVol: 3900, kd: 29, cpc: 3.15, match: 'phrase', q: false },
    { text: `${kw} projects with source code`, intent: 'I', baseVol: 5300, kd: 21, cpc: 1.10, match: 'broad', q: false },
    { text: `is ${kw} a good career`, intent: 'I', baseVol: 4800, kd: 27, cpc: 1.35, match: 'question', q: true },
    { text: `${kw} services for small business`, intent: 'T', baseVol: 2900, kd: 55, cpc: 6.20, match: 'phrase', q: false },
    { text: `future of ${kw} and AI`, intent: 'I', baseVol: 6700, kd: 31, cpc: 1.80, match: 'related', q: false },
    { text: `entry level ${kw} jobs${localSuffix}`, intent: 'T', baseVol: 5100, kd: 33, cpc: 2.05, match: 'phrase', q: false },
    { text: `which ${kw} degree is best`, intent: 'I', baseVol: 3400, kd: 25, cpc: 1.50, match: 'question', q: true }
  ];

  const sfOptions = [
    ['Featured Snippet', 'SiteLinks', 'People Also Ask'],
    ['People Also Ask', 'Videos', 'SiteLinks'],
    ['Featured Snippet', 'Knowledge Panel'],
    ['SiteLinks', 'People Also Ask', 'Images'],
    ['Local Pack', 'SiteLinks', 'Reviews']
  ];

  const intentLabels = {
    'I': 'Informational',
    'C': 'Commercial',
    'T': 'Transactional',
    'N': 'Navigational'
  };

  const keywords = templates.map((t, idx) => {
    const vol = Math.max(120, Math.round(t.baseVol * volMult));
    const trendBase = Math.floor(Math.random() * 20) + 40;
    const trend = Array.from({ length: 12 }, (_, i) => Math.min(100, Math.max(20, trendBase + Math.floor(Math.sin(i) * 20) + i * 2)));

    return {
      keyword: t.text,
      intent: t.intent,
      intentLabel: intentLabels[t.intent] || 'Informational',
      volume: vol,
      volumeFormatted: formatVol(vol),
      kd: t.kd,
      kdLabel: getKdLabel(t.kd),
      cpc: `${cpcCurrency}${t.cpc.toFixed(2)}`,
      competitiveDensity: Number((0.2 + (t.kd / 160)).toFixed(2)),
      serpFeatures: sfOptions[idx % sfOptions.length],
      matchType: t.match,
      isQuestion: t.q,
      trend
    };
  });

  const totalVolNum = keywords.reduce((sum, k) => sum + k.volume, 0);
  const avgKdNum = Math.round(keywords.reduce((sum, k) => sum + k.kd, 0) / keywords.length);

  return {
    summary: {
      seedKeyword: kw,
      country: c,
      totalKeywords: keywords.length * 85 + 230,
      totalVolume: formatVol(totalVolNum * 4),
      averageKd: avgKdNum,
      averageCpc: '$2.15'
    },
    keywords,
    topicClusters: [
      {
        clusterName: 'Career & Salaries',
        pillar: `${kw} Career Paths`,
        volume: formatVol(Math.round(totalVolNum * 0.4)),
        kd: 34,
        keywordsCount: 8,
        subTopics: [`Salary guide${localSuffix}`, 'Entry level roles', 'Remote opportunities', 'Job requirements']
      },
      {
        clusterName: 'Courses & Education',
        pillar: `Learning ${kw}`,
        volume: formatVol(Math.round(totalVolNum * 0.35)),
        kd: 29,
        keywordsCount: 7,
        subTopics: ['Degrees vs Bootcamps', 'Top online tutorials', 'Free certifications', 'Roadmap 2026']
      },
      {
        clusterName: 'Services & Business',
        pillar: `${kw} Solutions`,
        volume: formatVol(Math.round(totalVolNum * 0.25)),
        kd: 52,
        keywordsCount: 6,
        subTopics: ['Hiring developers', 'Consulting rates', 'Agency vs Freelancer', 'Project planning']
      }
    ]
  };
};

// Keyword Magic Tool Endpoint
router.post('/keyword-magic', async (req, res) => {
  try {
    const { keyword, country, domain } = req.body;
    if (!keyword || !keyword.trim()) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
    if (aiConfigSetting && aiConfigSetting.value && aiConfigSetting.value.geminiApiKey) {
      try {
        const { getKeywordMagicData } = require('../services/aiService');
        const aiData = await getKeywordMagicData({ keyword, country, domain }, aiConfigSetting.value);
        if (aiData && aiData.keywords && Array.isArray(aiData.keywords) && aiData.keywords.length > 0) {
          return res.json(aiData);
        }
      } catch (aiErr) {
        console.warn('AI Keyword Magic fallback activated:', aiErr.message);
      }
    }

    const fallback = generateFallbackKeywordData(keyword, country, domain);
    res.json(fallback);
  } catch (error) {
    console.error('Keyword Magic error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Render OpenGraph HTML Preview for Crawlers & Fallbacks
router.get('/:slug/preview', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
    const query = isObjectId 
      ? { $or: [{ slug: req.params.slug }, { _id: req.params.slug }] }
      : { slug: req.params.slug };

    const blog = await BlogPost.findOne(query);
    if (!blog) return res.status(404).send('Post not found');

    const siteUrl = 'https://taizercodecrafter.com';
    const canonicalUrl = `${siteUrl}/blog/${encodeURIComponent(blog.slug || req.params.slug)}`;
    const title = (blog.seo?.metaTitle || blog.title || 'Tech Article | TaizerCodeCrafter')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const rawDesc = blog.seo?.metaDescription || blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, ' ') : '');
    const description = (rawDesc.replace(/\s+/g, ' ').trim().slice(0, 165) || 'Explore high-performance web apps, AI, and technical tutorials by Supun Dilshan.')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let imageUrl = blog.coverImage || `${siteUrl}/my.webp`;
    if (imageUrl.startsWith('/')) imageUrl = `${siteUrl}${imageUrl}`;
    else if (imageUrl.startsWith('data:')) imageUrl = `${siteUrl}/my.webp`;

    const author = (blog.author || 'Supun Dilshan').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const category = (blog.category || 'Technology').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const publishedTime = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | TaizerCodeCrafter</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${author}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="TaizerCodeCrafter">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:author" content="${author}">
  <meta property="article:section" content="${category}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 40px 20px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px;">
  <p><a href="${canonicalUrl}" style="color: #ff9d42; font-weight: bold;">Read Full Interactive Article &rarr;</a></p>
</body>
</html>`;

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.send(html);
  } catch (error) {
    res.status(500).send('Server Error generating preview');
  }
});

// Get blog by slug or ID
router.get('/:slug', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.slug);
    const query = isObjectId 
      ? { $or: [{ slug: req.params.slug }, { _id: req.params.slug }] }
      : { slug: req.params.slug };

    const blog = await BlogPost.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like blog post
router.post('/:id/like', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { action } = req.body;
    const incValue = action === 'unlike' ? -1 : 1;
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { slug: req.params.id };

    const blog = await BlogPost.findOneAndUpdate(
      query,
      { $inc: { likes: incValue } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    if (blog.likes < 0) {
      blog.likes = 0;
      await blog.save();
    }
    res.json({ likes: blog.likes, blogId: blog._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
