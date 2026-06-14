require('dotenv').config();
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

app.get('/', (req, res) => res.send('API is running...'));

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

const MONGO_URI = process.env.MONGODB_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB Error:', err.message));
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
