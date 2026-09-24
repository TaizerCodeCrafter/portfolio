// Netlify Edge Function: Dynamic OpenGraph & Twitter Card Pre-renderer for Social Media Crawlers
// Intercepts requests to /blog/:slug for WhatsApp, Facebook, Twitter, Telegram, LinkedIn, Discord, Slack, etc.

const BOT_PATTERNS = [
  /facebookexternalhit/i,
  /facebot/i,
  /whatsapp/i,
  /twitterbot/i,
  /telegrambot/i,
  /linkedinbot/i,
  /slackbot/i,
  /discordbot/i,
  /skypeuripreview/i,
  /pinterest/i,
  /applebot/i,
  /googlebot/i,
  /bingbot/i,
  /meta-externalagent/i,
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async (request, context) => {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Allow manual inspection via ?og=true or ?og=1
  const forceOg = url.searchParams.get('og') === 'true' || url.searchParams.get('og') === '1';

  // If not a crawler and not manually requested, pass through to normal SPA
  if (!isCrawler(userAgent) && !forceOg) {
    return context.next();
  }

  // Extract the article slug from /blog/:slug
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts.length < 2 || pathParts[0] !== 'blog') {
    return context.next();
  }

  const slug = pathParts[1];
  const siteUrl = 'https://taizercodecrafter.com';
  const canonicalUrl = `${siteUrl}/blog/${encodeURIComponent(slug)}`;

  let blog = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const apiEndpoint = `${url.origin}/api/blogs/${encodeURIComponent(slug)}`;
    const res = await fetch(apiEndpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      blog = await res.json();
    }
  } catch (err) {
    console.warn('Edge og-preview fetch error:', err.message);
  }

  // Fallback metadata if article not found or API times out
  const title = escapeHtml(blog?.seo?.metaTitle || blog?.title || 'Tech Article | TaizerCodeCrafter');
  const rawDesc = blog?.seo?.metaDescription || blog?.excerpt || (blog?.content ? blog.content.replace(/<[^>]*>/g, ' ') : '');
  const description = escapeHtml(
    rawDesc.replace(/\s+/g, ' ').trim().slice(0, 165) ||
    'Explore high-performance web development, custom AI solutions, and technical tutorials by Supun Dilshan.'
  );

  let imageUrl = blog?.coverImage || `${siteUrl}/my.webp`;
  if (imageUrl.startsWith('/')) {
    imageUrl = `${siteUrl}${imageUrl}`;
  } else if (imageUrl.startsWith('data:')) {
    imageUrl = `${siteUrl}/my.webp`;
  }
  imageUrl = escapeHtml(imageUrl);

  const author = escapeHtml(blog?.author || 'Supun Dilshan');
  const category = escapeHtml(blog?.category || 'Technology');
  const publishedTime = blog?.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | TaizerCodeCrafter</title>
  <meta name="description" content="${description}">
  <meta name="author" content="${author}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph / Facebook / WhatsApp / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="TaizerCodeCrafter">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:author" content="${author}">
  <meta property="article:section" content="${category}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:creator" content="@TaizerCode">

  <!-- Instant client redirect if a human visitor opens this static preview directly -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 40px 20px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <header style="margin-bottom: 24px;">
    <span style="display: inline-block; padding: 4px 12px; background: rgba(255, 157, 66, 0.15); color: #ff9d42; border-radius: 999px; font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
      ${category}
    </span>
    <h1 style="font-size: 2.2rem; margin: 12px 0 8px; line-height: 1.25; color: #ffffff;">${title}</h1>
    <p style="color: #94a3b8; font-size: 0.95rem;">By ${author} • Published on ${new Date(publishedTime).toLocaleDateString()}</p>
  </header>

  <div style="margin: 20px 0; border-radius: 12px; overflow: hidden; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.08);">
    <img src="${imageUrl}" alt="${title}" style="width: 100%; height: auto; display: block; max-height: 480px; object-fit: cover;">
  </div>

  <p style="font-size: 1.15rem; color: #cbd5e1; margin: 24px 0;">${description}</p>

  <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
    <a href="${canonicalUrl}" style="display: inline-flex; align-items: center; gap: 8px; background: #ff9d42; color: #0b1120; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 1rem; box-shadow: 0 4px 20px rgba(255, 157, 66, 0.35);">
      Read Full Interactive Article →
    </a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};

export const config = {
  path: '/blog/*',
};
