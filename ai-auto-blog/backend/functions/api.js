const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server setup warning in serverless:', e.message);
}

const app = require('../index');

const FALLBACK_URI = 'mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0';

let connectPromise = null;

async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2 && connectPromise) {
    await connectPromise;
    return;
  }

  const MONGO_URI = process.env.MONGODB_URI || FALLBACK_URI;
  try {
    connectPromise = mongoose.connect(MONGO_URI);
    await connectPromise;
    console.log('✅ Connected to MongoDB in Serverless Function');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (MONGO_URI !== FALLBACK_URI) {
      try {
        console.log('🔄 Attempting fallback connection in Serverless...');
        connectPromise = mongoose.connect(FALLBACK_URI);
        await connectPromise;
        console.log('✅ Connected to MongoDB via fallback in Serverless');
      } catch (fallbackErr) {
        console.error('❌ Serverless Fallback MongoDB Error:', fallbackErr.message);
      }
    }
  }
}

const netlifyApp = express();

// Middleware to ensure database connection before handling request
netlifyApp.use(async (req, res, next) => {
  await ensureDb();
  next();
});

// Create a wrapper router to handle Netlify's path prefix
const router = express.Router();
router.use('/.netlify/functions/api', app);
router.use('/api', app);
router.use('/', app);

netlifyApp.use(router);

module.exports.handler = serverless(netlifyApp);
