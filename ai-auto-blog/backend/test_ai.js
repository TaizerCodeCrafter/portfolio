const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
require('dotenv').config();

const Setting = require('./models/Setting');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const setting = await Setting.findOne({ key: 'aiConfig' });
  const genAI = new GoogleGenerativeAI(setting.value.geminiApiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent("test");
    console.log("SUCCESS FLASH V1");
  } catch (e) {
    console.log("FAILED FLASH V1:", e.message);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" }, { apiVersion: "v1" });
      const result = await model.generateContent("test");
      console.log("SUCCESS PRO V1");
    } catch (e2) {
      console.log("FAILED PRO V1:", e2.message);
    }
  }
  process.exit();
}
check();
