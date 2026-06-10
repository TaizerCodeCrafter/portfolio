const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function list() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy...'); // I'll use a placeholder or the one from env
    // Actually I can't list models without a valid key.
    console.log("Checking model names...");
  } catch (e) {
    console.error(e);
  }
}
list();
