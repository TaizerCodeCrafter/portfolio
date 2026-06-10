const axios = require('axios');
const Topic = require('../models/Topic');

const fetchTrendingTopics = async () => {
  try {
    // Using NewsAPI as an example. User should provide API key in .env
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      console.log('NEWS_API_KEY missing, using mock data for demo');
      return [
        { title: 'The Future of Quantum Computing in 2026', description: 'Recent breakthroughs in quantum supremacy.', source: 'TechNews', url: 'https://example.com' },
        { title: 'AI Regulation: New Laws in Europe', description: 'How the EU is shaping the future of AI safety.', source: 'GlobalHerald', url: 'https://example.com' },
        { title: 'Sustainable Architecture: Cities of the Future', description: 'Innovations in green building materials.', source: 'EcoDesign', url: 'https://example.com' }
      ];
    }

    const response = await axios.get(`https://newsapi.org/v2/top-headlines?category=technology&apiKey=${API_KEY}`);
    const articles = response.data.articles;

    const topics = articles.map(article => ({
      title: article.title,
      description: article.description,
      source: article.source.name,
      url: article.url
    }));

    // Save to DB
    for (const topicData of topics) {
      const exists = await Topic.findOne({ title: topicData.title });
      if (!exists) {
        await new Topic(topicData).save();
      }
    }

    return topics;
  } catch (error) {
    console.error('Error fetching trending topics:', error.message);
    return [];
  }
};

module.exports = { fetchTrendingTopics };
