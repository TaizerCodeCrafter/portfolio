import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, X, Clock, ExternalLink, Eye, Tag as TagIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Blog.css';

const Blog = ({ isHomePage = false }) => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(isHomePage ? 3 : 6);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, tagRes] = await Promise.all([
          axios.get('http://localhost:5000/api/blogs'),
          axios.get('http://localhost:5000/api/tags')
        ]);
        setBlogs(blogRes.data);
        setTags(tagRes.data);
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
          <span className="text-gradient">Blog Posts</span>
        </h2>
        <p className="section-subtitle">AI-curated insights and technology trends, updated in real-time.</p>
        
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
        ) : (
          displayBlogs.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="blog-card glass"
            >
              <div className="blog-image-wrapper">
                <img 
                  src={post.coverImage || `https://image.pollinations.ai/prompt/${encodeURIComponent('blog cover for ' + post.title)}?width=800&height=500&nologo=true`} 
                  alt={post.title} 
                  className="blog-image" 
                />
                <div className="blog-category">{post.category || 'Technology'}</div>
              </div>
              
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-meta-item">
                    <Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="blog-meta-item">
                    <User size={14} /> Admin Writer
                  </span>
                  <span className="blog-meta-item">
                    <Eye size={14} /> {post.views || 0}
                  </span>
                </div>
                
                <h3 className="blog-title line-clamp-2">{post.title}</h3>
                <p className="blog-excerpt line-clamp-3">{post.excerpt || 'Click read more to see the full AI generated article.'}</p>
                
                <button 
                   className="read-more-btn"
                   onClick={async () => {
                     setSelectedBlog(post);
                     // Increment view count in backend
                     try {
                       await axios.get(`http://localhost:5000/api/blogs/${post.slug}`);
                       // Update local state to reflect new view count
                       setBlogs(prev => prev.map(b => b._id === post._id ? { ...b, views: (b.views || 0) + 1 } : b));
                     } catch (err) { console.error('View tracking failed:', err); }
                   }}
                 >
                   Read More <ArrowRight size={16} />
                 </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {isHomePage ? (
        <div className="load-more-container">
          <Link to="/blog">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="load-more-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              View All Posts <ExternalLink size={18} />
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

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="blog-modal-overlay"
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="blog-modal-content glass"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedBlog(null)}>
                <X size={24} />
              </button>
              
              <div className="modal-body">
                <div className="blog-modal-header">
                  <span className="modal-category">{selectedBlog.category}</span>
                  <div className="modal-meta">
                    <span><Calendar size={14} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                    <span><Clock size={14} /> 5 min read</span>
                    <span><Eye size={14} /> {selectedBlog.views || 0} views</span>
                  </div>
                  <h1>{selectedBlog.title}</h1>
                </div>
                
                <div 
                  className="modal-text"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />

                {selectedBlog.seo?.keywords && selectedBlog.seo.keywords.length > 0 && (
                  <div className="modal-tags">
                    <TagIcon size={16} />
                    {selectedBlog.seo.keywords.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Blog;
