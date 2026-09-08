import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, X, ExternalLink, Calendar, BookOpen, 
  Flame, Package, MessageSquare, Zap, Star, FileText, Globe, Rocket, Award, Briefcase 
} from 'lucide-react';
import axios from 'axios';
import { SIDE_TAG_PRESETS } from '../data/sideTagPresets';
import './FloatingSideTag.css';

const ICON_COMPONENTS = {
  Flame,
  Sparkles,
  Package,
  MessageSquare,
  Zap,
  Star,
  FileText,
  Globe,
  Rocket,
  Award,
  BookOpen,
  Briefcase
};

const FloatingSideTag = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [activeTagId, setActiveTagId] = useState(null);
  const [dismissedTags, setDismissedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [settingsRes, blogRes] = await Promise.allSettled([
          axios.get('/api/settings'),
          axios.get('/api/blogs')
        ]);

        if (!isMounted) return;

        const s = settingsRes.status === 'fulfilled' && settingsRes.value?.data ? settingsRes.value.data : {};
        const b = blogRes.status === 'fulfilled' && Array.isArray(blogRes.value?.data) ? blogRes.value.data : [];

        setSettings(s);
        setBlogs(b);
      } catch (err) {
        console.warn('FloatingSideTag: could not load settings or blogs:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Close card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveTagId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (loading || !settings || settings.sideTagActive === false) {
    return null;
  }

  // Resolve tags: check if array exists in settings.sideTags, otherwise build from legacy or defaults
  let configuredTags = [];
  if (Array.isArray(settings.sideTags) && settings.sideTags.length > 0) {
    configuredTags = settings.sideTags;
  } else {
    // Fallback for backward compatibility with previously configured single tag
    const legacyMode = settings.sideTagMode || 'auto';
    configuredTags = [
      {
        id: 'default_tag_1',
        badgeText: settings.sideTagBadgeText || '🔥 Latest Article',
        icon: 'Flame',
        color: '#ff9d42',
        mode: legacyMode,
        category: settings.sideTagCustomCategory || 'Tech Insights',
        title: settings.sideTagCustomTitle || '',
        excerpt: settings.sideTagCustomExcerpt || '',
        image: settings.sideTagCustomImage || '',
        targetLink: settings.sideTagCustomLink || '/blog',
        buttonText: settings.sideTagButtonText || 'Read Article',
        blogId: settings.sideTagSelectedBlogId || '',
        isActive: true
      }
    ];
  }

  // Filter active & non-dismissed tags
  const activeTags = configuredTags.filter(tag => tag.isActive !== false && !dismissedTags.includes(tag.id));

  if (activeTags.length === 0) {
    return null;
  }

  const position = settings.sideTagPosition || 'left';

  // Helper to resolve card content for any given tag
  const getTagResolvedData = (tag) => {
    const mode = tag.mode || 'custom';
    if (mode === 'auto' || mode === 'blog' || mode === 'select') {
      let targetBlog = blogs.length > 0 ? blogs[0] : null;
      if (mode === 'select' && tag.blogId) {
        const found = blogs.find(b => b._id === tag.blogId);
        if (found) targetBlog = found;
      }

      if (targetBlog) {
        return {
          title: targetBlog.title,
          excerpt: targetBlog.excerpt || 'Discover our latest insights, case studies, and engineering breakthroughs.',
          image: targetBlog.coverImage || targetBlog.image || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80`,
          link: `/blog/${targetBlog.slug}`,
          category: targetBlog.category || tag.category || 'Article',
          date: targetBlog.createdAt ? new Date(targetBlog.createdAt).toLocaleDateString() : 'Recent',
          buttonText: tag.buttonText || 'Read Article',
          isInternal: true
        };
      }
    }

    // Custom or fallback
    const link = tag.targetLink || tag.link || '/packages';
    return {
      title: tag.title || 'Featured Highlight',
      excerpt: tag.excerpt || 'Explore curated tools, resources, and custom development highlights.',
      image: tag.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      link: link,
      category: tag.category || 'Special',
      date: 'Featured',
      buttonText: tag.buttonText || 'Learn More',
      isInternal: link.startsWith('/')
    };
  };

  const handleNavigate = (resolved, e) => {
    e.stopPropagation();
    setActiveTagId(null);
    if (resolved.isInternal) {
      navigate(resolved.link);
    } else {
      window.open(resolved.link, '_blank', 'noopener,noreferrer');
    }
  };

  const activeTag = activeTags.find(t => t.id === activeTagId);
  const activeResolved = activeTag ? getTagResolvedData(activeTag) : null;

  return (
    <aside 
      ref={containerRef}
      className={`floating-side-tags-stack position-${position}`}
      aria-label="Featured Side Tags & Ribbons"
    >
      {/* Pills Stack */}
      <div className="side-pills-list">
        {activeTags.map((tag) => {
          const IconComp = ICON_COMPONENTS[tag.icon] || Sparkles;
          const isCurrentActive = activeTagId === tag.id;
          const tagColor = tag.color || '#ff9d42';

          return (
            <button
              key={tag.id}
              type="button"
              className={`side-tag-pill ${isCurrentActive ? 'pill-active' : ''}`}
              style={{ '--tag-accent': tagColor }}
              onClick={() => setActiveTagId(prev => prev === tag.id ? null : tag.id)}
              onMouseEnter={() => setActiveTagId(tag.id)}
              title={tag.badgeText}
            >
              <span className="pulse-indicator">
                <span className="pulse-ping" style={{ background: tagColor }}></span>
                <span className="pulse-dot" style={{ background: tagColor, boxShadow: `0 0 10px ${tagColor}` }}></span>
              </span>
              <span className="side-tag-label">{tag.badgeText}</span>
              <IconComp size={14} className="side-tag-icon" style={{ color: tagColor }} />
            </button>
          );
        })}
      </div>

      {/* Expanded Preview Card for Currently Active Tag */}
      <AnimatePresence>
        {activeTag && activeResolved && (
          <motion.div
            key={activeTag.id}
            initial={{ opacity: 0, x: position === 'left' ? -25 : 25, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position === 'left' ? -25 : 25, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`side-tag-preview-card glass position-${position}`}
            style={{ '--tag-accent': activeTag.color || '#ff9d42' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Dismiss */}
            <div className="preview-card-header">
              <span className="preview-category-badge" style={{ color: activeTag.color || '#ff9d42', borderColor: `${activeTag.color || '#ff9d42'}40`, background: `${activeTag.color || '#ff9d42'}15` }}>
                <BookOpen size={12} /> {activeResolved.category}
              </span>
              <button 
                type="button" 
                className="preview-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTagId(null);
                }}
                title="Collapse"
              >
                <X size={15} />
              </button>
            </div>

            {/* Thumbnail */}
            {activeResolved.image && (
              <div className="preview-image-wrap" onClick={(e) => handleNavigate(activeResolved, e)}>
                <img 
                  src={activeResolved.image} 
                  alt={activeResolved.title}
                  className="preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="preview-image-overlay">
                  <span>Explore Now</span>
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="preview-card-body">
              {activeResolved.date && (
                <span className="preview-date">
                  <Calendar size={12} /> {activeResolved.date}
                </span>
              )}
              <h4 className="preview-title" onClick={(e) => handleNavigate(activeResolved, e)}>
                {activeResolved.title}
              </h4>
              <p className="preview-excerpt">
                {activeResolved.excerpt}
              </p>

              {/* Action Link Button */}
              <div className="preview-card-footer">
                <button 
                  type="button"
                  onClick={(e) => handleNavigate(activeResolved, e)}
                  className="btn-preview-action"
                  style={{ background: `linear-gradient(135deg, ${activeTag.color || '#ff9d42'}, #b35a00)` }}
                >
                  <span>{activeResolved.buttonText}</span>
                  {activeResolved.isInternal ? <ArrowRight size={15} /> : <ExternalLink size={14} />}
                </button>

                <button 
                  type="button"
                  className="btn-preview-dismiss"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDismissedTags(prev => [...prev, activeTag.id]);
                    setActiveTagId(null);
                  }}
                  title="Hide this tag for this session"
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
