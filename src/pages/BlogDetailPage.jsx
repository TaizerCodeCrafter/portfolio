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
