import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, X, Clock, ExternalLink, Eye, Tag as TagIcon, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LikeButton from './LikeButton';
import './Blog.css';

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
  if (!content) return '5 min read';
  const plain = content.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
};

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

  const handleOpenBlog = async (post) => {
    // If we already have the full post content cached, display it immediately
    if (post.content) {
      setSelectedBlog(post);
    } else {
      setSelectedBlog({ ...post, isContentLoading: true });
    }

    try {
      const slugOrId = post.slug || post._id;
      const res = await axios.get(`/api/blogs/${encodeURIComponent(slugOrId)}`);
      if (res.data) {
        const fullPost = res.data;
        // Only update modal if it is still open for this post
        setSelectedBlog(current => {
          if (!current || (current._id !== post._id && current.slug !== post.slug)) {
            return current;
          }
          return { ...fullPost, isContentLoading: false };
        });
        // Cache full blog data and updated views in the list
        setBlogs(prev => prev.map(b => b._id === post._id ? { ...b, ...fullPost } : b));
      }
    } catch (err) {
      console.error('Failed to fetch full blog post:', err);
      setSelectedBlog(current => {
        if (!current || (current._id !== post._id && current.slug !== post.slug)) {
          return current;
        }
        return { ...current, isContentLoading: false };
      });
    }
  };

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
              <div 
                className="blog-image-wrapper"
                onClick={() => handleOpenBlog(post)}
                style={{ cursor: 'pointer' }}
                title="Read article"
              >
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
                    <User size={14} /> {post.author || 'Admin Writer'}
                  </span>
                  <span className="blog-meta-item">
                    <Eye size={14} /> {post.views || 0}
                  </span>
                  <LikeButton targetType="blog" targetId={post._id} initialLikes={post.likes} size={14} />
                </div>
                
                <h3 
                  className="blog-title line-clamp-2"
                  onClick={() => handleOpenBlog(post)}
                  style={{ cursor: 'pointer' }}
                  title={post.title}
                >
                  {post.title}
                </h3>
                <p className="blog-excerpt line-clamp-3">{post.excerpt || 'Click read more to see the full AI generated article.'}</p>
                
                <button 
                   className="read-more-btn"
                   onClick={() => handleOpenBlog(post)}
                 >
                   Read More <ArrowRight size={16} />
                 </button>
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
                  <span className="modal-category">{selectedBlog.category || 'Technology'}</span>
                  <div className="modal-meta">
                    <span><Calendar size={14} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                    <span><Clock size={14} /> {estimateReadTime(selectedBlog.content)}</span>
                    <span><Eye size={14} /> {selectedBlog.views || 0} views</span>
                    <LikeButton targetType="blog" targetId={selectedBlog._id} initialLikes={selectedBlog.likes} size={15} />
                  </div>
                  <h1>{selectedBlog.title}</h1>
                </div>

                {selectedBlog.coverImage && (
                  <div className="blog-modal-cover">
                    <img 
                      src={selectedBlog.coverImage} 
                      alt={selectedBlog.title} 
                    />
                  </div>
                )}
                
                {selectedBlog.isContentLoading ? (
                  <div className="blog-modal-loading">
                    <div className="loader"></div>
                    <p>Loading full article details...</p>
                  </div>
                ) : (
                  <div 
                    className="modal-text"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanBlogContent(selectedBlog.content, selectedBlog.title) || selectedBlog.excerpt || '<p>No content details found for this article.</p>' 
                    }}
                  />
                )}

                {selectedBlog.seo?.keywords && selectedBlog.seo.keywords.length > 0 && (
                  <div className="modal-tags">
                    <TagIcon size={16} />
                    {selectedBlog.seo.keywords.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div 
                  className="modal-article-footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '15px',
                    marginTop: '35px',
                    paddingTop: '25px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>Enjoyed this article?</span>
                    <LikeButton targetType="blog" targetId={selectedBlog._id} initialLikes={selectedBlog.likes} size={18} />
                  </div>
                  
                  <button 
                    type="button"
                    className="share-btn" 
                    onClick={() => {
                      const url = `${window.location.origin}/blog/${selectedBlog.slug || selectedBlog._id}`;
                      navigator.clipboard.writeText(url);
                      alert('Article link copied to clipboard!');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Blog;
