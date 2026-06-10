import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowLeft, Share2, MessageCircle } from 'lucide-react';
import axios from 'axios';
import './BlogDetailPage.css';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${slug}`);
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
        <Link to="/blog" className="btn-primary">Back to Blog</Link>
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
        <Link to="/blog" className="back-link"><ArrowLeft size={20} /> Back to Blog</Link>
        <div className="blog-detail-meta">
          <span className="category-pill">{blog.category}</span>
          <h1 className="blog-title">{blog.title}</h1>
          <div className="meta-info">
            <span><Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span><User size={16} /> {blog.author || 'Admin Writer'}</span>
            <span><Eye size={16} /> {blog.views} views</span>
          </div>
        </div>
      </div>

      <div className="blog-detail-content-wrapper">
        {blog.coverImage && (
          <div className="blog-detail-image">
            <img src={blog.coverImage} alt={blog.title} />
          </div>
        )}

        <div className="blog-detail-body glass" dangerouslySetInnerHTML={{ __html: blog.content }}></div>
        
        <div className="blog-detail-footer glass">
          <div className="share-section">
            <h3>Share this article</h3>
            <div className="share-btns">
              <button className="share-btn"><Share2 size={18} /> Share</button>
              <button className="share-btn"><MessageCircle size={18} /> Comment</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogDetailPage;
