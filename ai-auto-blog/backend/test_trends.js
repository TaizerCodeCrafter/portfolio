const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
require('dotenv').config();
const Setting = require('./models/Setting');
const { getTrendingTopics } = require('./services/aiService');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const setting = await Setting.findOne({ key: 'aiConfig' });
  try {
    console.log("Fetching trends...");
    const trends = await getTrendingTopics(setting.value);
    console.log("SUCCESS:", JSON.stringify(trends, null, 2));
  } catch (e) {
    console.log("FAILED:", e.message);
  }
  process.exit();
}
check();
