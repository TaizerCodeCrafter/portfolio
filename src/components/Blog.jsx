import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Clock, ExternalLink, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LikeButton from './LikeButton';
import './Blog.css';

const estimateReadTime = (content) => {
  if (!content) return '5 min read';
  const plain = content.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
};

const Blog = ({ isHomePage = false }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(isHomePage ? 3 : 6);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, tagRes] = await Promise.all([
          axios.get('/api/blogs'),
          axios.get('/api/tags')
        ]);
        if (Array.isArray(blogRes.data)) setBlogs(blogRes.data);
        if (Array.isArray(tagRes.data)) setTags(tagRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredBlogs = selectedTag === 'All' 
    ? blogs 
    : blogs.filter(b => b.seo?.keywords?.some(k => k.toLowerCase() === selectedTag.toLowerCase()));

  const displayBlogs = isHomePage ? filteredBlogs.slice(0, 3) : filteredBlogs.slice(0, visibleCount);

  return (
    <section id="blog" className={`section ${!isHomePage ? 'blog-page-padding' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          {isHomePage ? 'Latest ' : 'All '} 
          <span className="text-gradient">Articles & Insights</span>
        </h2>
        <p className="section-subtitle">AI-curated tutorials, developer guides, and tech trends updated in real-time.</p>
        
        {!isHomePage && tags.length > 0 && (
          <div className="tag-filter-bar">
            <button 
              className={`tag-btn ${selectedTag === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedTag('All')}
            >
              All Topics
            </button>
            {tags.map(tag => (
              <button 
                key={tag._id} 
                className={`tag-btn ${selectedTag === tag.name ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag.name)}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <div className="blog-grid">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="blog-card glass animate-pulse h-80"></div>
          ))
        ) : displayBlogs.length > 0 ? (
          displayBlogs.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="blog-card glass"
            >
              <Link 
                to={`/blog/${post.slug || post._id}`}
                className="blog-image-wrapper"
                title={post.title}
              >
                <img 
                  src={post.coverImage || `https://image.pollinations.ai/prompt/${encodeURIComponent('blog cover for ' + post.title)}?width=800&height=500&nologo=true`} 
                  alt={post.title} 
                  className="blog-image" 
                  loading="lazy"
                />
                <div className="blog-category">{post.category || 'Technology'}</div>
              </Link>
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-meta-item">
                    <Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="blog-meta-item">
                    <User size={14} /> {post.author || 'Admin Writer'}
                  </span>
                  <span className="blog-meta-item">
                    <Eye size={14} /> {post.views || 0}
                  </span>
                  <LikeButton targetType="blog" targetId={post._id} initialLikes={post.likes} size={14} />
                </div>
                
                <h3 className="blog-title line-clamp-2">
                  <Link to={`/blog/${post.slug || post._id}`} title={post.title}>
                    {post.title}
                  </Link>
                </h3>
                <p className="blog-excerpt line-clamp-3">{post.excerpt || 'Click read more to see the full AI generated article.'}</p>
                
                <Link 
                   to={`/blog/${post.slug || post._id}`}
                   className="read-more-btn"
                 >
                   Read More <ArrowRight size={16} />
                 </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>No blog posts found at the moment.</p>
            <p style={{ fontSize: '0.88rem', opacity: 0.75 }}>Please ensure the server is running with <code>npm run dev</code>.</p>
          </div>
        )}
      </div>

      {isHomePage ? (
        <div className="load-more-container">
          <Link to="/articles">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="load-more-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              View All Articles <ExternalLink size={18} />
            </motion.button>
          </Link>
        </div>
      ) : (
        visibleCount < blogs.length && (
          <div className="load-more-container">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="load-more-btn"
              onClick={() => setVisibleCount(prev => prev + 6)}
            >
              Show More Posts
            </motion.button>
          </div>
        )
      )}
    </section>
  );
};

export default Blog;
