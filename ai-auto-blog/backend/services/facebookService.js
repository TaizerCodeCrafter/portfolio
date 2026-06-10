const axios = require('axios');

const postToFacebook = async (config, blogData) => {
  if (!config.fbEnabled || !config.fbAccessToken || !config.fbPageId) {
    return null;
  }

  try {
    const message = `🚀 New Blog Post: ${blogData.title}\n\n${blogData.metaDescription}\n\nRead more: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${blogData.slug}`;
    
    const url = `https://graph.facebook.com/v21.0/${config.fbPageId}/feed`;
    
    const response = await axios.post(url, {
      message: message,
      link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${blogData.slug}`,
      access_token: config.fbAccessToken
    });

    console.log('✅ Posted to Facebook:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Facebook API Error:', error.response?.data || error.message);
    return null;
  }
};

module.exports = { postToFacebook };
