const { schedule } = require('@netlify/functions');
const mongoose = require('mongoose');
const { runDailyAutoBlogging } = require('../cron/cronService');

module.exports.handler = schedule('0 6 * * *', async (event) => {
  console.log('Running Netlify Scheduled Function (Cron)...');
  try {
    const MONGO_URI = process.env.MONGODB_URI;
    if (MONGO_URI) {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB in Cron Job');
      }
    }
    
    await runDailyAutoBlogging();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Cron task executed successfully' })
    };
  } catch (error) {
    console.error('❌ Cron execution failed:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
});
