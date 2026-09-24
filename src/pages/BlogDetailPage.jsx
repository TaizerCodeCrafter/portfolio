import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Share2, Clock, Check } from 'lucide-react';
import axios from 'axios';
import LikeButton from '../components/LikeButton';
import './BlogDetailPage.css';

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
  };
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      } catch (err) {
        // Fallback to clipboard if native share dialog was cancelled or unsupported
      }
    }
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

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="blog-detail-page"
    >
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
                  <span className="blog-author-name">{blog.author || 'Admin Writer'}</span>
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

          <div 
            className="blog-article-content"
            dangerouslySetInnerHTML={{ __html: cleanBlogContent(blog.content, blog.title) }}
          />

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
