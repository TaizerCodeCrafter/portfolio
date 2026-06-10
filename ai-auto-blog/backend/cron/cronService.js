const { fetchTrendingTopics } = require('../services/newsService');
const { generateBlogPost } = require('../services/aiService');
const Topic = require('../models/Topic');
const BlogPost = require('../models/BlogPost');

const runDailyAutoBlogging = async () => {
    console.log('--- Starting Daily Auto-Blogging Task (2 Posts) ---');

    for (let i = 0; i < 2; i++) {
      try {
        console.log(`Processing Post #${i + 1}...`);

        // 1. Fetch new topics (if needed)
        if (i === 0) {
          console.log('Fetching fresh trending topics...');
          await fetchTrendingTopics();
        }

        // 2. Pick an unused topic
        const topic = await Topic.findOne({ isUsed: false }).sort({ createdAt: -1 });

        if (topic) {
          console.log(`Generating blog for topic: ${topic.title}`);

          // 3. Generate blog using AI
          const blogData = await generateBlogPost(topic);

          // Sanitize title for image generation
          const cleanPrompt = blogData.title.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, ' ');

          // 4. Save to DB
          const newPost = new BlogPost({
            ...blogData,
            status: 'published',
            coverImage: `https://image.pollinations.ai/prompt/${encodeURIComponent('technology blog cover ' + cleanPrompt)}?width=800&height=500&nologo=true`
          });
          await newPost.save();

          // 5. Mark topic as used
          topic.isUsed = true;
          await topic.save();

          console.log(`Successfully published blog: ${newPost.title}`);
        } else {
          console.log('No new topics found to process.');
          break; // Stop if no more topics
        }
      } catch (error) {
        console.error(`Error in post #${i + 1}:`, error.message);
      }
    }

    console.log('--- Daily Auto-Blogging Task Completed ---');
};

module.exports = { runDailyAutoBlogging };
