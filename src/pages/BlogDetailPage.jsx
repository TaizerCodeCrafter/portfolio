import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Share2 } from 'lucide-react';
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

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blogs/${encodeURIComponent(slug)}`);
        setBlog(res.data);
      } catch (err) {
        console.error('Failed to fetch blog post');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-detail-loading">
        <div className="loader"></div>
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

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="blog-detail-container"
    >
      <div className="blog-detail-header glass">
        <Link to="/articles" className="back-link"><ArrowLeft size={20} /> Back to Articles</Link>
        <div className="blog-detail-meta">
          <span className="category-pill">{blog.category}</span>
          <h1 className="blog-title">{blog.title}</h1>
          <div className="meta-info">
            <span><Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span><User size={16} /> {blog.author || 'Admin Writer'}</span>
            <span><Eye size={16} /> {blog.views} views</span>
            <LikeButton targetType="blog" targetId={blog._id} initialLikes={blog.likes} size={16} />
          </div>
        </div>
      </div>

      <div className="blog-detail-content-wrapper">
        {blog.coverImage && (
          <div className="blog-detail-image">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        <div className="blog-detail-body glass" dangerouslySetInnerHTML={{ __html: cleanBlogContent(blog.content, blog.title) }}></div>
        
        <div className="blog-detail-footer glass">
          <div className="share-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Enjoyed this article?</span>
              <LikeButton targetType="blog" targetId={blog._id} initialLikes={blog.likes} size={18} />
            </div>
            
            <div className="share-btns">
              <button 
                type="button"
                className="share-btn" 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogDetailPage;
