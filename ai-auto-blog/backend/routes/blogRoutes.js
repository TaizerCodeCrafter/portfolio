const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Create new blog
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, category, tags, status, image, seoTitle, seoDescription, focusKeyword } = req.body;
    
    const blogPost = new BlogPost({
      title,
      slug,
      content,
      category,
      tags,
      status,
      coverImage: image,
      seo: {
        metaTitle: seoTitle,
        metaDescription: seoDescription,
        keywords: focusKeyword ? (typeof focusKeyword === 'string' ? focusKeyword.split(',').map(k => k.trim()) : focusKeyword) : []
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

// Get all published blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await BlogPost.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Admin: Get all blogs (including drafts)
router.get('/admin/all', async (req, res) => {
  try {
    const blogs = await BlogPost.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update blog
router.put('/:id', async (req, res) => {
  try {
    const { title, slug, content, category, tags, status, image, seoTitle, seoDescription, focusKeyword } = req.body;
    
    const updateData = {
      title,
      slug,
      content,
      category,
      tags,
      status,
      coverImage: image,
      seo: {
        metaTitle: seoTitle,
        metaDescription: seoDescription,
        keywords: focusKeyword ? (typeof focusKeyword === 'string' ? focusKeyword.split(',').map(k => k.trim()) : focusKeyword) : []
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

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all blogs
router.delete('/admin/delete-all', async (req, res) => {
  try {
    await BlogPost.deleteMany({});
    res.json({ message: 'All blogs deleted' });
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

// Get blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const blog = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
