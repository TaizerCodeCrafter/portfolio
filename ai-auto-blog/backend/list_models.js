const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDzkPUwWbaZ-SEQv3iWueFRYxUFWyZVf08');
async function run() {
  const models = await genAI.getModels();
  for (const m of models.models) {
    console.log(m.name);
  }
}
run();
