const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a tag
router.post('/', async (req, res) => {
  const tag = new Tag({
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  });

  try {
    const newTag = await tag.save();
    res.status(201).json(newTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a tag
router.put('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    if (req.body.name) tag.name = req.body.name;
    if (req.body.slug) tag.slug = req.body.slug;

    const updatedTag = await tag.save();
    res.json(updatedTag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a tag
router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    await Tag.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { generateTags } = require('../services/aiService');
const Setting = require('../models/Setting');

// AI Generate tags from content
router.post('/generate-ai', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
    if (!aiConfigSetting || !aiConfigSetting.value.geminiApiKey) {
      return res.status(400).json({ message: 'Gemini API Key is not configured.' });
    }

    const tags = await generateTags(content, aiConfigSetting.value);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
