const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../services/aiService');
const Setting = require('../models/Setting');

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('🤖 AI Chat Request received:', message);
    
    // Fetch AI config from settings
    const settingsDoc = await Setting.findOne({ key: 'aiConfig' });
    const config = settingsDoc ? settingsDoc.value : {};

    if (!config.geminiApiKey) {
      console.error('❌ AI Chat Error: Gemini API Key is missing in DB');
      return res.status(400).json({ error: 'AI not configured' });
    }

    // We could fetch projects/services here to provide context
    const context = {
      ownerName: "Supun Dilshan",
      specialties: ["Full Stack Development", "React", "Node.js", "AI Integrations", "Web Design"]
    };

    console.log('🧠 AI is thinking...');
    const reply = await chatWithAI(message, context, config);
    console.log('✅ AI Reply generated successfully');
    res.json({ reply });
  } catch (error) {
    console.error('❌ AI Chat Exception:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
