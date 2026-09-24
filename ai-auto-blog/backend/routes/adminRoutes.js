const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const Stat = require('../models/Stat');
const Skill = require('../models/Skill');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Company = require('../models/Company');
const Package = require('../models/Package');
const Subscriber = require('../models/Subscriber');
const Comment = require('../models/Comment');
const Setting = require('../models/Setting');

// Short in-memory cache to prevent pounding MongoDB on rapid reloads (TTL: 20s)
let adminCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 20 * 1000;

// Export cache invalidate helper for mutations
const invalidateAdminCache = () => {
  adminCache = null;
  lastCacheTime = 0;
};

// GET /api/admin/bootstrap - 1-Shot Consolidated Admin Dashboard Fetch
router.get('/bootstrap', async (req, res) => {
  try {
    const now = Date.now();
    const forceRefresh = req.query.fresh === 'true';

    if (!forceRefresh && adminCache && (now - lastCacheTime < CACHE_TTL_MS)) {
      res.set('X-Cache', 'HIT');
      return res.json(adminCache);
    }

    const [
      blogsRes,
      projectsRes,
      testimonialsRes,
      statsRes,
      skillsRes,
      servicesRes,
      categoriesRes,
      tagsRes,
      companiesRes,
      packagesRes,
      subscribersRes,
      commentsRes,
      settingsRes
    ] = await Promise.allSettled([
      BlogPost.find()
        .select('-content -coverImage')
        .sort({ createdAt: -1 })
        .lean(),
      Project.find().sort({ createdAt: -1 }).lean(),
      Testimonial.find().sort({ createdAt: -1 }).lean(),
      Stat.find().sort({ order: 1 }).lean(),
      Skill.find().sort({ order: 1 }).lean(),
      Service.find().sort({ order: 1 }).lean(),
      Category.find().sort({ name: 1 }).lean(),
      Tag.find().sort({ name: 1 }).lean(),
      Company.find().sort({ order: 1 }).lean(),
      Package.find().sort({ order: 1 }).lean(),
      Subscriber.find().sort({ createdAt: -1 }).lean(),
      Comment.find().sort({ createdAt: -1 }).lean(),
      Setting.findOne().lean()
    ]);

    const data = {
      blogs: blogsRes.status === 'fulfilled' ? blogsRes.value : [],
      projects: projectsRes.status === 'fulfilled' ? projectsRes.value : [],
      testimonials: testimonialsRes.status === 'fulfilled' ? testimonialsRes.value : [],
      stats: statsRes.status === 'fulfilled' ? statsRes.value : [],
      skills: skillsRes.status === 'fulfilled' ? skillsRes.value : [],
      services: servicesRes.status === 'fulfilled' ? servicesRes.value : [],
      categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value : [],
      tags: tagsRes.status === 'fulfilled' ? tagsRes.value : [],
      companies: companiesRes.status === 'fulfilled' ? companiesRes.value : [],
      packages: packagesRes.status === 'fulfilled' ? packagesRes.value : [],
      subscribers: subscribersRes.status === 'fulfilled' ? subscribersRes.value : [],
      comments: commentsRes.status === 'fulfilled' ? commentsRes.value : [],
      settings: settingsRes.status === 'fulfilled' ? settingsRes.value : null
    };

    adminCache = data;
    lastCacheTime = now;

    res.set('X-Cache', 'MISS');
    res.json(data);
  } catch (error) {
    console.error('Admin bootstrap error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  router,
  invalidateAdminCache
};
