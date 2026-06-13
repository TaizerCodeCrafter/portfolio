require('dotenv').config({ path: 'c:\\Users\\user\\OneDrive\\Desktop\\portfolio\\ai-auto-blog\\backend\\.env' });
const mongoose = require('mongoose');
const Setting = require('c:\\Users\\user\\OneDrive\\Desktop\\portfolio\\ai-auto-blog\\backend\\models\\Setting.js');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB');
  const aiConfigSetting = await Setting.findOne({ key: 'aiConfig' });
  console.log('AI Config:', aiConfigSetting);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
