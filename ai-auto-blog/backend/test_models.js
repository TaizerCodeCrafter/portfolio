const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI("AQ.Ab8RN6Jg1vaqjVl0H7mY8FfhMO2LjYFqWX-6Yxh_leKAjpDlFQ");
  try {
    // We don't have getModels() in the v1beta SDK, let's try a direct HTTP fetch
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6Jg1vaqjVl0H7mY8FfhMO2LjYFqWX-6Yxh_leKAjpDlFQ");
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
listModels();
