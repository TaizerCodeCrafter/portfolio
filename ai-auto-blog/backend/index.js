const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server setup warning:', e.message);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const statRoutes = require('./routes/statRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const seoRoutes = require('./routes/seoRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// API Routes
app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/subscribe', require('./routes/subscriberRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/cv', require('./routes/cvRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

app.get('/', (req, res) => res.send('API is running...'));

// Health & Keep-Alive Ping Endpoints
app.get(['/api/health', '/api/ping'], (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  res.status(200).json({
    status: 'ok',
    service: 'TaizerCodeCrafter API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Vercel Cron Job Endpoint
const { runDailyAutoBlogging } = require('./cron/cronService');
app.get('/api/cron/run', async (req, res) => {
  try {
    await runDailyAutoBlogging();
    res.status(200).json({ message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Cron job failed:', error);
    res.status(500).json({ message: 'Cron job failed', error: error.message });
  }
});

const FALLBACK_URI = 'mongodb://supundilshan358_db_user:ZaAoLY6pOTlsPg5D@ac-h1v7wnr-shard-00-00.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-01.ouxm37c.mongodb.net:27017,ac-h1v7wnr-shard-00-02.ouxm37c.mongodb.net:27017/my-portfolio-blog?ssl=true&replicaSet=atlas-xaj0ke-shard-0&authSource=admin&appName=Cluster0';
let MONGO_URI = process.env.MONGODB_URI || FALLBACK_URI;
if (MONGO_URI.startsWith('mongodb+srv://')) {
  console.log('⚠️ mongodb+srv URI detected. Auto-substituting direct replica-set URI to avoid DNS query hanging.');
  MONGO_URI = FALLBACK_URI;
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB Connection Error with primary URI:', err.message);
    if (MONGO_URI !== FALLBACK_URI) {
      console.log('🔄 Attempting fallback direct replica-set connection...');
      try {
        await mongoose.connect(FALLBACK_URI);
        console.log('✅ Connected to MongoDB Atlas via Fallback Replica Set');
      } catch (fallbackErr) {
        console.error('❌ MongoDB Fallback Error:', fallbackErr.message);
      }
    }
  }
};

connectDB();

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // Automatic Keep-Alive Ping for Render Free-Tier (pings every 12 mins before 15 min sleep)
    const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || `http://localhost:${PORT}`;
    setInterval(async () => {
      try {
        const pingUrl = `${targetUrl.replace(/\/$/, '')}/api/health`;
        const res = await fetch(pingUrl, { headers: { 'User-Agent': 'Internal-KeepAlive/1.0' } });
        console.log(`⏱️ [Keep-Alive] Pinged ${pingUrl} - Status: ${res.status}`);
      } catch (err) {
        console.warn(`⚠️ [Keep-Alive] Ping failed:`, err.message);
      }
    }, 12 * 60 * 1000);
    console.log(`⏱️ [Keep-Alive] Timer scheduled every 12 mins targeting ${targetUrl}`);
  });
  // Disable server timeout for multi-gigabyte uploads
  server.timeout = 0;
  server.headersTimeout = 0;
  server.requestTimeout = 0;
  server.keepAliveTimeout = 65000;
}

module.exports = app;
