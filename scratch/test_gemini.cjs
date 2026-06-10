const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
require('dotenv').config({ path: '../ai-auto-blog/backend/.env' });

const Setting = require('../ai-auto-blog/backend/models/Setting');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const setting = await Setting.findOne({ key: 'aiConfig' });
  if (!setting || !setting.value.geminiApiKey) {
    console.log("No API Key found");
    process.exit();
  }
  
  const genAI = new GoogleGenerativeAI(setting.value.geminiApiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Trying gemini-1.5-flash...");
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash");
  } catch (e) {
    console.log("Failed with gemini-1.5-flash:", e.message);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log("Trying gemini-pro...");
      const result = await model.generateContent("test");
      console.log("Success with gemini-pro");
    } catch (e2) {
      console.log("Failed with gemini-pro:", e2.message);
    }
  }
  process.exit();
}
check();
