const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const app = require('../index');

// Create a wrapper router to handle Netlify's path prefix
const router = express.Router();
router.use('/.netlify/functions/api', app);
router.use('/', app);

const netlifyApp = express();

// Middleware to ensure database connection before handling request
netlifyApp.use(async (req, res, next) => {
  const MONGO_URI = process.env.MONGODB_URI;
  if (MONGO_URI && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB in Serverless Function');
    } catch (err) {
      console.error('❌ MongoDB Connection Error:', err.message);
    }
  }
  next();
});

netlifyApp.use(router);

module.exports.handler = serverless(netlifyApp);
