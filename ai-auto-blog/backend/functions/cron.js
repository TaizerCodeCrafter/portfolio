const { schedule } = require('@netlify/functions');
const mongoose = require('mongoose');
const { runDailyAutoBlogging } = require('../cron/cronService');

module.exports.handler = schedule('0 6 * * *', async (event) => {
  console.log('Running Netlify Scheduled Function (Cron)...');
  try {
    const FALLBACK_URI = 'mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0';
    let MONGO_URI = process.env.MONGODB_URI || FALLBACK_URI;
    if (MONGO_URI.startsWith('mongodb+srv://')) {
      MONGO_URI = FALLBACK_URI;
    }
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
