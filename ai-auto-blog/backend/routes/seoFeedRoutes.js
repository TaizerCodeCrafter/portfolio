const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Project = require('../models/Project');

const DOMAIN = 'https://taizercodecrafter.com';

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * GET /sitemap.xml and /api/sitemap.xml
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    const blogs = await BlogPost.find({ status: 'published' })
      .select('slug updatedAt createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/articles', priority: '0.9', changefreq: 'daily' },
      { path: '/projects', priority: '0.8', changefreq: 'weekly' },
      { path: '/packages', priority: '0.8', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' }
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const staticUrlsXml = staticRoutes.map(r => `  <url>
    <loc>${DOMAIN}${r.path}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n');

    const blogUrlsXml = blogs.map(b => {
      const date = b.updatedAt || b.createdAt || new Date();
      const dateStr = new Date(date).toISOString().split('T')[0];
      return `  <url>
    <loc>${DOMAIN}/blog/${escapeXml(b.slug)}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrlsXml}
${blogUrlsXml}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400');
    res.send(xml);
  } catch (error) {
    console.error('Dynamic Sitemap Error:', error);
    res.status(500).send('<!-- Error generating sitemap -->');
  }
});

/**
 * GET /rss.xml and /api/rss.xml
 */
router.get('/rss.xml', async (req, res) => {
  try {
    const blogs = await BlogPost.find({ status: 'published' })
      .select('title slug excerpt content category createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const itemsXml = blogs.map(b => {
      const link = `${DOMAIN}/blog/${escapeXml(b.slug)}`;
      const pubDate = new Date(b.createdAt).toUTCString();
      const rawDesc = b.excerpt || (b.content ? b.content.replace(/<[^>]*>/g, ' ').slice(0, 250) : '');
      const cleanDesc = escapeXml(rawDesc.trim());
      const title = escapeXml(b.title);
      const category = escapeXml(b.category || 'Technology');

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${cleanDesc}</description>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TaizerCodeCrafter Tech Insights &amp; Articles</title>
    <link>${DOMAIN}/articles</link>
    <description>In-depth technical guides, modern web architecture tutorials, and software insights by Supun Dilshan.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${DOMAIN}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400');
    res.send(rssXml);
  } catch (error) {
    console.error('RSS Feed Error:', error);
    res.status(500).send('<!-- Error generating RSS feed -->');
  }
});

module.exports = router;
