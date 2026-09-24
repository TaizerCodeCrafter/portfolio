import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, User, Eye, ArrowLeft, Share2, Clock, Check, 
  List, MessageCircle, Copy, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import LikeButton from '../components/LikeButton';
import './BlogDetailPage.css';

const LinkedInIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const cleanBlogContent = (content, title) => {
  if (!content) return '';
  if (!title) return content;
  
  const trimmed = content.trim();
  const h1Match = trimmed.match(/^<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    const h1Text = h1Match[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
    const titleText = title.trim().toLowerCase();
    if (h1Text === titleText || titleText.includes(h1Text) || h1Text.includes(titleText)) {
      return trimmed.replace(/^<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    }
  }
  return content;
};

const prepareBlogContent = (content, title) => {
  let cleaned = cleanBlogContent(content, title);
  let headingIndex = 0;
  cleaned = cleaned.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const rawText = inner.replace(/<[^>]*>/g, '').trim();
    const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `section-${headingIndex++}`;
    if (!attrs.includes('id=')) {
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    }
    return match;
  });
  return cleaned;
};

const estimateReadTime = (content) => {
  if (!content) return '4 min read';
  const plain = content.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
};

const updateMetaTags = (blog) => {
  if (!blog) return () => {};

  const defaultTitle = 'TaizerCodeCrafter | Full Stack Developer & AI Solutions';
  const defaultDesc = 'Explore TaizerCodeCrafter by Supun Dilshan - Expert Full Stack Web Developer specializing in scalable React apps, Node.js backends, custom AI integrations, and technical tutorials.';
  const defaultImage = 'https://taizercodecrafter.com/my.webp';
  const defaultUrl = 'https://taizercodecrafter.com/';

  const title = blog.title ? `${blog.title} | TaizerCodeCrafter` : defaultTitle;
  const rawDesc = blog.seo?.metaDescription || blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, ' ').slice(0, 160) : '');
  const description = rawDesc.replace(/\s+/g, ' ').trim() || defaultDesc;

  let imageUrl = blog.coverImage || defaultImage;
  if (imageUrl.startsWith('/')) {
    imageUrl = `https://taizercodecrafter.com${imageUrl}`;
  } else if (imageUrl.startsWith('data:')) {
    imageUrl = defaultImage;
  }
  const currentUrl = window.location.href;

  document.title = title;

  const setMeta = (selector, attrKey, attrVal, content) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrKey, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[name="title"]', 'name', 'title', title);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
  setMeta('meta[property="og:url"]', 'property', 'og:url', currentUrl);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'article');
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);

  // Inject Google Schema.org BlogPosting Structured Data
  let ldJsonEl = document.getElementById('blog-schema-jsonld');
  if (!ldJsonEl) {
    ldJsonEl = document.createElement('script');
    ldJsonEl.id = 'blog-schema-jsonld';
    ldJsonEl.type = 'application/ld+json';
    document.head.appendChild(ldJsonEl);
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'description': description,
    'image': imageUrl,
    'datePublished': blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString(),
    'dateModified': blog.updatedAt ? new Date(blog.updatedAt).toISOString() : (blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString()),
    'author': {
      '@type': 'Person',
      'name': blog.author || 'Supun Dilshan',
      'url': 'https://taizercodecrafter.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'TaizerCodeCrafter',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://taizercodecrafter.com/icon-512.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': currentUrl
    }
  };
  ldJsonEl.textContent = JSON.stringify(schemaData);

  return () => {
    document.title = defaultTitle;
    setMeta('meta[name="description"]', 'name', 'description', defaultDesc);
    setMeta('meta[name="title"]', 'name', 'title', defaultTitle);
    setMeta('meta[property="og:title"]', 'property', 'og:title', defaultTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', defaultDesc);
    setMeta('meta[property="og:image"]', 'property', 'og:image', defaultImage);
    setMeta('meta[property="og:url"]', 'property', 'og:url', defaultUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', defaultTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', defaultDesc);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', defaultImage);
    if (ldJsonEl) ldJsonEl.remove();
  };
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showToc, setShowToc] = useState(true);

  // Track Reading Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        const current = (window.scrollY / total) * 100;
        setReadingProgress(Math.min(100, Math.max(0, current)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blogs/${encodeURIComponent(slug)}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (blog) {
      const cleanup = updateMetaTags(blog);
      return cleanup;
    }
  }, [blog]);

  // Extract H2 & H3 Headings for Dynamic Table of Contents
  const tocHeadings = useMemo(() => {
    if (!blog || !blog.content) return [];
    const regex = /<h([2-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const items = [];
    let match;
    let idx = 0;
    while ((match = regex.exec(blog.content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      if (text) {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `section-${idx++}`;
        items.push({ level: Number(match[1]), text, id });
      }
    }
    return items;
  }, [blog?.content]);

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title || 'Article',
          text: blog?.excerpt || blog?.title,
          url: url,
        });
        return;
      } catch (err) {}
    }
    copyToClipboard(url);
  };

  const copyToClipboard = async (url = window.location.href) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy link', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="loader"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-error">
        <h2>Post Not Found</h2>
        <p>The article you are looking for doesn't exist or has been moved.</p>
        <Link to="/articles" className="btn-primary">Back to Articles</Link>
      </div>
    );
  }

  const readTime = estimateReadTime(blog.content);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = encodeURIComponent(blog.title || 'Technical Article');

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="blog-detail-page"
    >
      {/* Sleek Fixed Reading Progress Bar */}
      <div 
        className="blog-reading-progress" 
        style={{ width: `${readingProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      <div className="blog-detail-container">
        {/* Navigation & Action Bar */}
        <div className="blog-top-bar">
          <Link to="/articles" className="blog-back-link">
            <ArrowLeft size={18} />
            <span>Back to Articles</span>
          </Link>

          <button 
            type="button"
            className={`blog-top-share-btn ${copied ? 'copied' : ''}`}
            onClick={handleShare}
            aria-label="Share article"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Clean, Unified Article Canvas */}
        <article className="blog-article-canvas">
          <header className="blog-article-header">
            <div className="blog-category-tag-row">
              <span className="blog-category-pill">{blog.category || 'Technology'}</span>
              <span className="blog-read-badge">
                <Clock size={13} /> {readTime}
              </span>
            </div>

            <h1 className="blog-article-title">{blog.title}</h1>

            <div className="blog-article-meta">
              <div className="blog-author-box">
                <div className="blog-author-avatar">
                  <User size={16} />
                </div>
                <div>
                  <span className="blog-author-name">{blog.author || 'Supun Dilshan'}</span>
                  <span className="blog-meta-date">
                    <Calendar size={13} /> {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="blog-meta-right">
                <span className="blog-views-count">
                  <Eye size={15} /> {blog.views || 0} views
                </span>
                <div className="blog-header-like">
                  <LikeButton targetType="blog" targetId={blog._id} initialLikes={blog.likes} size={16} />
                </div>
              </div>
            </div>
          </header>

          {blog.coverImage && (
            <div className="blog-article-cover">
              <img src={blog.coverImage} alt={blog.title} loading="eager" />
            </div>
          )}

          {/* Table of Contents (TOC) if 2 or more headings */}
          {tocHeadings.length >= 2 && (
            <div className="blog-toc-card">
              <div className="blog-toc-header" onClick={() => setShowToc(!showToc)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <List size={18} color="#b35a00" />
                  <span className="blog-toc-title">Table of Contents</span>
                  <span className="blog-toc-count">{tocHeadings.length} sections</span>
                </div>
                <button type="button" className="blog-toc-toggle-btn" aria-label="Toggle Table of Contents">
                  {showToc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <AnimatePresence>
                {showToc && (
                  <motion.ul 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="blog-toc-list"
                  >
                    {tocHeadings.map((h, i) => (
                      <li key={i} className={`blog-toc-item level-${h.level}`}>
                        <button 
                          type="button" 
                          onClick={() => scrollToHeading(h.id)}
                          className="blog-toc-link"
                        >
                          <span className="blog-toc-num">{i + 1}.</span> {h.text}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Article Rendered Content */}
          <div 
            className="blog-article-content"
            dangerouslySetInnerHTML={{ __html: prepareBlogContent(blog.content, blog.title) }}
          />

          {/* Direct One-Click Social Share Strip */}
          <div className="blog-social-share-strip">
            <span className="blog-share-label">Share this article:</span>
            <div className="blog-social-icons">
              <a 
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-pill whatsapp"
                title="Share on WhatsApp"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>

              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-pill linkedin"
                title="Share on LinkedIn"
              >
                <LinkedInIcon /> LinkedIn
              </a>

              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-share-pill twitter"
                title="Share on X (Twitter)"
              >
                <TwitterXIcon /> X (Twitter)
              </a>

              <button 
                type="button" 
                onClick={() => copyToClipboard(currentUrl)} 
                className={`social-share-pill copy ${copied ? 'active' : ''}`}
                title="Copy Link to Clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <footer className="blog-article-footer">
            <div className="blog-footer-feedback">
              <div>
                <h3 className="blog-feedback-title">Did you find this article helpful?</h3>
                <p className="blog-feedback-desc">Share some love or pass it along to your developer peers.</p>
              </div>
              <div className="blog-footer-like">
                <LikeButton targetType="blog" targetId={blog._id} initialLikes={blog.likes} size={20} />
              </div>
            </div>

            <div className="blog-footer-actions">
              <Link to="/articles" className="blog-footer-back-btn">
                <ArrowLeft size={16} /> Explore All Articles
              </Link>
              <button 
                type="button" 
                className={`blog-footer-share-btn ${copied ? 'copied' : ''}`}
                onClick={handleShare}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
              </button>
            </div>
          </footer>
        </article>
      </div>
    </motion.main>
  );
};

export default BlogDetailPage;
