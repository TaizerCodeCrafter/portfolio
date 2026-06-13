const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent("Say hi");
    console.log("Success with 3.5-flash:", result.response.text());
  } catch (error) {
    console.error("Error with 3.5-flash:", error.message);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hi");
    console.log("Success with 1.5-flash:", result.response.text());
  } catch (error) {
    console.error("Error with 1.5-flash:", error.message);
  }
}

testGemini();
