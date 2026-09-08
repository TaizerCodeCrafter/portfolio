import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, ExternalLink, Calendar, BookOpen, Flame } from 'lucide-react';
import axios from 'axios';
import './FloatingSideTag.css';

const FloatingSideTag = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [blogData, setBlogData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const settingsRes = await axios.get('/api/settings');
        const s = settingsRes.data || {};

        if (!isMounted) return;
        setSettings(s);

        // If tag is disabled in settings, stop
        if (s.sideTagActive === false) {
          setLoading(false);
          return;
        }

        const mode = s.sideTagMode || 'auto';

        if (mode === 'auto' || mode === 'select') {
          const blogRes = await axios.get('/api/blogs');
          const blogs = Array.isArray(blogRes.data) ? blogRes.data : [];

          if (blogs.length > 0) {
            let targetBlog = blogs[0];
            if (mode === 'select' && s.sideTagSelectedBlogId) {
              const matched = blogs.find(b => b._id === s.sideTagSelectedBlogId);
              if (matched) targetBlog = matched;
            }

            setBlogData({
              title: targetBlog.title,
              excerpt: targetBlog.excerpt || 'Discover the latest insights, breakthroughs, and digital updates.',
              image: targetBlog.coverImage || `https://image.pollinations.ai/prompt/${encodeURIComponent(targetBlog.title)}?width=400&height=250&nologo=true`,
              link: `/blog/${targetBlog.slug}`,
              category: targetBlog.category || 'Article',
              date: targetBlog.createdAt ? new Date(targetBlog.createdAt).toLocaleDateString() : 'Recent',
              isInternal: true
            });
          }
        } else if (mode === 'custom') {
          setBlogData({
            title: s.sideTagCustomTitle || 'Featured Insight',
            excerpt: s.sideTagCustomExcerpt || 'Explore curated tools, resources, and custom development highlights.',
            image: s.sideTagCustomImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
            link: s.sideTagCustomLink || '/blog',
            category: s.sideTagCustomCategory || 'Featured',
            date: 'Featured',
            isInternal: (s.sideTagCustomLink || '').startsWith('/')
          });
        }
      } catch (err) {
        console.warn('FloatingSideTag: could not load settings or blog:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // If dismissed or inactive or no data, don't render
  if (isDismissed || loading || !settings || settings.sideTagActive === false || !blogData) {
    return null;
  }

  const position = settings.sideTagPosition || 'left';
  const badgeText = settings.sideTagBadgeText || '🔥 Latest Article';
  const buttonText = settings.sideTagButtonText || 'Read Article';

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (blogData.isInternal) {
      navigate(blogData.link);
    } else {
      window.open(blogData.link, '_blank', 'noopener,noreferrer');
    }
    setIsExpanded(false);
  };

  return (
    <aside 
      className={`floating-side-tag-container position-${position}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      aria-label="Featured Blog Side Ribbon"
    >
      {/* The Sticky Side Pill Button */}
      <button 
        type="button"
        className={`side-tag-pill ${isExpanded ? 'pill-active' : ''}`}
        onClick={() => setIsExpanded(prev => !prev)}
        title="View Featured Article"
      >
        <span className="pulse-indicator">
          <span className="pulse-ping"></span>
          <span className="pulse-dot"></span>
        </span>
        <span className="side-tag-label">{badgeText}</span>
        <Sparkles size={14} className="side-tag-icon" />
      </button>

      {/* Expanded Preview Card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: position === 'left' ? -20 : 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position === 'left' ? -20 : 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`side-tag-preview-card glass position-${position}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Dismiss */}
            <div className="preview-card-header">
              <span className="preview-category-badge">
                <BookOpen size={12} /> {blogData.category}
              </span>
              <button 
                type="button" 
                className="preview-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                title="Collapse"
              >
                <X size={15} />
              </button>
            </div>

            {/* Thumbnail */}
            {blogData.image && (
              <div className="preview-image-wrap" onClick={handleNavigate}>
                <img 
                  src={blogData.image} 
                  alt={blogData.title}
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="preview-image-overlay">
                  <span>View Post</span>
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="preview-card-body">
              <span className="preview-date">
                <Calendar size={12} /> {blogData.date}
              </span>
              <h4 className="preview-title" onClick={handleNavigate}>
                {blogData.title}
              </h4>
              <p className="preview-excerpt">
                {blogData.excerpt}
              </p>

              {/* Action Link Button */}
              <div className="preview-card-footer">
                <button 
                  type="button"
                  onClick={handleNavigate}
                  className="btn-preview-action"
                >
                  <span>{buttonText}</span>
                  {blogData.isInternal ? <ArrowRight size={15} /> : <ExternalLink size={14} />}
                </button>

                <button 
                  type="button"
                  className="btn-preview-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDismissed(true);
                  }}
                  title="Hide for this session"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default FloatingSideTag;
