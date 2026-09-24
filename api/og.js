// Vercel Serverless Function: Dynamic OpenGraph preview generator
// Handles crawler requests for /blog/:slug if deployed on Vercel

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send('Missing slug parameter');
  }

  const siteUrl = 'https://taizercodecrafter.com';
  const canonicalUrl = `${siteUrl}/blog/${encodeURIComponent(slug)}`;

  let blog = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'] || 'taizercodecrafter.com';
    const apiEndpoint = `${protocol}://${host}/api/blogs/${encodeURIComponent(slug)}`;

    const response = await fetch(apiEndpoint, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      blog = await response.json();
    }
  } catch (err) {
    console.warn('Vercel og fetch error:', err.message);
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
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:author" content="${author}">
  <meta property="article:section" content="${category}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b1120; color: #f8fafc; padding: 40px 20px; max-width: 800px; margin: 0 auto; line-height: 1.6;">
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${title}" style="max-width: 100%; border-radius: 8px;">
  <p><a href="${canonicalUrl}" style="color: #ff9d42; font-weight: bold;">Read Full Interactive Article &rarr;</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return res.status(200).send(html);
}
