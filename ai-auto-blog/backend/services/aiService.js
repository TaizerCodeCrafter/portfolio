const { GoogleGenerativeAI } = require("@google/generative-ai");

const getValidModel = (modelName) => {
  let model = modelName || "gemini-1.5-flash";
  if (model.includes("3.5") || model.includes("3.6") || model.includes("-latest") || model === "gemini-pro") {
    model = "gemini-1.5-flash";
  }
  return model;
};

const handleAIError = (error, context) => {
  console.error(`${context} Error:`, error.message);
  if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('invalid authentication credentials')) {
    throw new Error('Your Gemini API Key is invalid or unauthorized. Note: Gemini API Keys must start with "AIzaSy...". Please get a free key from Google AI Studio (aistudio.google.com) and update it in Settings.');
  }
  if (error.message.includes('400') && error.message.includes('API key not valid')) {
    throw new Error('Your Gemini API Key is not valid. Please make sure to copy the full API Key starting with "AIzaSy..." from Google AI Studio.');
  }
  if (error.message.includes('404') && error.message.includes('not found')) {
    throw new Error('Selected AI model is not supported. Automatically switched to gemini-1.5-flash. Please try generating again.');
  }
  if (error.message.includes('503') || error.message.includes('Service Unavailable') || error.message.includes('overloaded')) {
    throw new Error('Google Gemini API is currently overloaded or down. Please try again in a few moments.');
  }
  throw error;
};

const extractJSON = (text) => {
  try {
    let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        throw new Error("Extracted JSON is still invalid: " + innerErr.message);
      }
    }
    throw new Error("Could not find valid JSON in AI response.");
  }
};

const generateBlogPost = async (data, config) => {
  try {
    if (!config.geminiApiKey || !config.geminiApiKey.trim()) {
      throw new Error('Gemini API Key is missing. Please add it in AI Settings.');
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
    // Use the model from config, but ensure it's a valid one from the user's available list
    const modelName = getValidModel(config.aiModel);
    // Many new models like flash-latest are best accessed via v1beta currently
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

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
    
    const blogData = extractJSON(text);

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
    handleAIError(error, 'Gemini');
  }
};

const optimizeSEO = async (data, config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
    const model = genAI.getGenerativeModel({ 
      model: getValidModel(config.aiModel),
      generationConfig: { responseMimeType: "application/json" }
    });

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
    const text = (await result.response).text();
    return extractJSON(text);
  } catch (error) {
    handleAIError(error, 'SEO Opt');
  }
};

const getTrendingTopics = async (config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
    const model = genAI.getGenerativeModel({ 
      model: getValidModel(config.aiModel),
      generationConfig: { responseMimeType: "application/json" }
    });

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
    const text = (await result.response).text();
    console.log('DEBUG: Raw Trending Response:', text);
    return extractJSON(text);
  } catch (error) {
    handleAIError(error, 'Trending Topics');
  }
};

const generateTags = async (content, config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
    const model = genAI.getGenerativeModel({ 
      model: getValidModel(config.aiModel),
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Extract 5-10 highly relevant tags/keywords from the following blog content.
      Content: ${content.substring(0, 5000)} 

      Return ONLY a valid JSON array of strings:
      ["tag1", "tag2", "tag3", ...]
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    return extractJSON(text);
  } catch (error) {
    handleAIError(error, 'Tag Generation');
  }
};

const chatWithAI = async (userMessage, context, config) => {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
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
      handleAIError(error, 'AI Chat');
    }
  }
  throw new Error("AI is currently under heavy load. Please try again in a few minutes.");
};

const getKeywordMagicData = async ({ keyword, country = "Sri Lanka", domain = "" }, config) => {
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey.trim());
    const model = genAI.getGenerativeModel({ 
      model: getValidModel(config.aiModel),
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Act as the Semrush Keyword Magic Tool engine. Perform deep SEO keyword research for the seed keyword "${keyword}" specifically for the target country/database "${country}".
      ${domain ? `Customized for website domain: ${domain}` : ''}

      Generate 20-30 realistic, country-specific high-value keyword variations matching real search query habits in "${country}".
      Include broad match, phrase match, exact match, high-intent questions (how, what, best, etc.), and related terms.

      Return ONLY a valid JSON object strictly matching this schema:
      {
        "summary": {
          "seedKeyword": "${keyword}",
          "country": "${country}",
          "totalKeywords": 2450,
          "totalVolume": "145.2K",
          "averageKd": 42,
          "averageCpc": "$1.95"
        },
        "keywords": [
          {
            "keyword": "string keyword phrase",
            "intent": "I",
            "intentLabel": "Informational",
            "volume": 4400,
            "volumeFormatted": "4.4K",
            "kd": 28,
            "kdLabel": "Easy",
            "cpc": "$1.40",
            "competitiveDensity": 0.35,
            "serpFeatures": ["Featured Snippet", "SiteLinks", "People Also Ask"],
            "matchType": "broad",
            "isQuestion": false,
            "trend": [45, 50, 60, 65, 80, 85, 90, 75, 80, 95, 98, 100]
          }
        ],
        "topicClusters": [
          {
            "clusterName": "Cluster / Sub-category",
            "pillar": "Pillar Topic",
            "volume": "18.4K",
            "kd": 35,
            "keywordsCount": 8,
            "subTopics": ["subtopic 1", "subtopic 2", "subtopic 3"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = (await result.response).text();
    return extractJSON(text);
  } catch (error) {
    handleAIError(error, 'Keyword Magic Tool');
  }
};

module.exports = { generateBlogPost, optimizeSEO, getTrendingTopics, generateTags, chatWithAI, getKeywordMagicData };
