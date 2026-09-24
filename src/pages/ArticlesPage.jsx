import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Calendar, Clock, ArrowRight, Eye, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getCachedData, setCachedData } from '../utils/cache';
import './ArticlesPage.css';

const estimateReadTime = (content) => {
  if (!content) return '5 min read';
  const plain = content.replace(/<[^>]*>/g, ' ').trim();
  const words = plain.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 180));
  return `${mins} min read`;
};

const CATEGORIES = ['All', 'Learn & Articles', 'Tutorials', 'Technology', 'AI', 'Business'];

const ArticlesPage = () => {
  const cachedArticles = getCachedData('articles');
  const [articles, setArticles] = useState(cachedArticles || []);
  const [loading, setLoading] = useState(!cachedArticles || cachedArticles.length === 0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Learn & Articles | TaizerCodeCrafter';

    const fetchArticles = async () => {
      try {
        const res = await axios.get('/api/blogs');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setArticles(res.data);
          setCachedData('articles', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(item => {
    const matchesCategory = selectedCategory === 'All' 
      ? true 
      : (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Learn & Articles' && (item.category === 'Learn & Articles' || item.category === 'Tutorials'));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q 
      ? true 
      : (item.title && item.title.toLowerCase().includes(q)) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="articles-page"
    >
      <div className="articles-hero">
        <div className="articles-badge">
          <BookOpen size={16} /> Knowledge & Tutorials
        </div>
        <h1 className="articles-title">
          Learn & <span className="text-gradient">Articles</span>
        </h1>
        <p className="articles-subtitle">
          In-depth technical guides, modern web architecture tutorials, and software insights to elevate your engineering skills.
        </p>
      </div>

      <div className="articles-toolbar">
        {/* Search */}
        <div className="articles-search-wrap">
          <Search size={18} className="articles-search-icon" />
          <input 
            type="text" 
            placeholder="Search tutorials, AI tools, coding guides..." 
            className="articles-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="articles-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading tutorials and articles...
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="articles-grid">
          {filteredArticles.map((post) => {
            const slug = post.slug || post._id;
            const category = post.category || 'Technology';
            const readTime = estimateReadTime(post.content || post.excerpt);

            return (
              <Link 
                to={`/blog/${slug}`} 
                key={post._id} 
                className="article-card"
              >
                <div className="article-thumb-wrap">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="article-thumb" loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9d42' }}>
                      <BookOpen size={48} opacity={0.6} />
                    </div>
                  )}
                  <span className="article-category-badge">{category}</span>
                </div>

                <div className="article-content">
                  <div className="article-meta">
                    <span className="article-meta-item">
                      <Calendar size={13} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span className="article-meta-item">
                      <Clock size={13} /> {readTime}
                    </span>
                  </div>

                  <h3 className="article-title-text">{post.title}</h3>

                  <p className="article-excerpt-text">
                    {post.excerpt || post.content?.replace(/<[^>]*>/g, '').slice(0, 140) + '...'}
                  </p>

                  <div className="article-footer">
                    <span className="article-read-btn">
                      Read Article <ArrowRight size={15} />
                    </span>
                    {post.views > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} /> {post.views}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="articles-empty">
          <h3>No articles found</h3>
          <p>Try searching for a different keyword or category.</p>
        </div>
      )}
    </motion.main>
  );
};

export default ArticlesPage;
