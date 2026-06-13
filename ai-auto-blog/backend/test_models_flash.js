const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AQ.Ab8RN6Jg1vaqjVl0H7mY8FfhMO2LjYFqWX-6Yxh_leKAjpDlFQ");
    const data = await response.json();
    const flashModels = data.models.filter(m => m.name.includes("flash")).map(m => m.name);
    console.log("Flash models:", flashModels);
  } catch (err) {
    console.error("Error:", err);
  }
}
listModels();
