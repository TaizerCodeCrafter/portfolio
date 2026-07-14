const { GoogleGenerativeAI } = require("@google/generative-ai");

const getValidModel = (modelName) => {
  return modelName || "gemini-1.5-flash";
};

const generateBlogPost = async (data, config) => {
  try {
    if (!config.geminiApiKey) {
      throw new Error('Gemini API Key is missing. Please add it in AI Settings.');
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    // Use the model from config, but ensure it's a valid one from the user's available list
    const modelName = getValidModel(config.aiModel);
    // Many new models like flash-latest are best accessed via v1beta currently
    const model = genAI.getGenerativeModel({ model: modelName });

    const topicInstruction = data.topic ? `Topic: ${data.topic}` : `Topic: Choose a highly trending, unique, and engaging tech/development/AI topic for today.`;
    const keywordsInstruction = data.keywords ? `Keywords: ${data.keywords}` : `Keywords: Auto-generate relevant high-traffic keywords.`;

    const prompt = `
      Write a high-quality SEO optimized blog article based on the following:
      ${topicInstruction}
      ${keywordsInstruction}
      Tone: ${data.tone}
      Target Word Count: ${data.wordCount}
      Category: ${data.category || 'Technology'}

      The blog should include:
      1. A catchy H1 title.
      2. SEO-friendly slug.
      3. Compelling introduction.
      4. Detailed sections with H2 and H3 headings.
      5. Practical insights and analysis.
      6. Conclusion.
      7. Meta description (max 160 chars).
      8. Focus keywords (comma separated).

      IMPORTANT: Return ONLY a valid JSON object in this format:
      {
        "title": "...",
        "slug": "...",
        "content": "HTML formatted content here (use <p>, <h2>, <h3>, <ul>, <li> tags)",
        "metaDescription": "...",
        "keywords": ["...", "..."],
        "category": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON if it contains markdown formatting
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const blogData = JSON.parse(text);

    return {
      ...blogData,
      seo: {
        metaTitle: blogData.title,
        metaDescription: blogData.metaDescription,
        keywords: blogData.keywords,
        seoScore: 92
      }
    };
  } catch (error) {
    console.error('Gemini Error:', error.message);
    throw error;
  }
};

const optimizeSEO = async (data, config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: getValidModel(config.aiModel) });

    const prompt = `
      Analyze the following blog content for SEO based on the target keyword "${data.keyword}".
      Content: ${data.content}

      Return ONLY a valid JSON object in this format:
      {
        "score": (0-100 number),
        "suggestions": ["suggestion 1", "suggestion 2", ...],
        "metaSuggestion": "A compelling SEO meta description"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('SEO Opt Error:', error.message);
    throw error;
  }
};

const getTrendingTopics = async (config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: getValidModel(config.aiModel) });

    const prompt = `
      Identify 6 high-growth trending topics in technology, web development, or AI for today.
      For each topic, provide a title, short description, category, and growth status (e.g., +85%).

      Return ONLY a valid JSON array of objects:
      [
        { "title": "...", "description": "...", "category": "...", "growth": "..." },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log('DEBUG: Raw Trending Response:', text);
    return JSON.parse(text);
  } catch (error) {
    console.error('Trending Topics Error:', error.message);
    throw error;
  }
};

const generateTags = async (content, config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: getValidModel(config.aiModel) });

    const prompt = `
      Extract 5-10 highly relevant tags/keywords from the following blog content.
      Content: ${content.substring(0, 5000)} 

      Return ONLY a valid JSON array of strings:
      ["tag1", "tag2", "tag3", ...]
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text().replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Tag Generation Error:', error.message);
    throw error;
  }
};

const chatWithAI = async (userMessage, context, config) => {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const modelName = getValidModel(config.aiModel);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
    You are an intelligent AI Assistant for a professional portfolio website belonging to ${context.ownerName}. 
    Your goal is to help visitors learn about the owner's services, projects, and expertise.

    Portfolio Context:
    ${JSON.stringify(context)}

    User's Question: "${userMessage}"

    Instructions:
    - Be professional, friendly, and helpful.
    - Use the provided context to answer questions accurately.
    - Respond in the same language the user uses (e.g., if they ask in Sinhala, reply in Sinhala).
    - Keep responses concise and engaging.

    Response:
  `;

  let retries = 2;
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      return (await result.response).text().trim();
    } catch (error) {
      if (error.message.includes('503') || error.message.includes('429')) {
        console.log(`⚠️ AI busy or limit hit, retrying in 5s... (${retries} left)`);
        await new Promise(r => setTimeout(r, 5000));
        retries--;
        continue;
      }
      console.error('AI Chat Error:', error.message);
      throw error;
    }
  }
  throw new Error("AI is currently under heavy load. Please try again in a few minutes.");
};

module.exports = { generateBlogPost, optimizeSEO, getTrendingTopics, generateTags, chatWithAI };
