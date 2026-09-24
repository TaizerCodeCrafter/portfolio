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
      .select('-content')
      .sort({ createdAt: -1 });
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
