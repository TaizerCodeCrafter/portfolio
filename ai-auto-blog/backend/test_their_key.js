const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const genAI = new GoogleGenerativeAI("AQ.Ab8RN6Jg1vaqjVl0H7mY8FfhMO2LjYFqWX-6Yxh_leKAjpDlFQ");
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  try {
    const result = await model.generateContent("Hi");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}
testGemini();
