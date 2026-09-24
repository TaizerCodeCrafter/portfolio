import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Monitor, Smartphone, X, MessageSquare, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import { getCachedData, setCachedData } from '../utils/cache';
import './Projects.css';

const defaultProjects = [
  {
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution with Next.js, Stripe integration, and an admin dashboard.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&auto=format&fit=crop',
    links: { github: '#', live: 'https://example.com' }
  },
  {
    title: 'AI Content Generator',
    description: 'An AI-powered application that generates high-quality marketing copy using OpenAI API.',
    tags: ['Vue', 'Python', 'FastAPI', 'OpenAI'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
    links: { github: '#', live: 'https://reactjs.org' }
  },
  {
    title: 'FinTech Dashboard',
    description: 'A scalable financial dashboard with real-time data visualization and secure authentication.',
    tags: ['React', 'TypeScript', 'PostgreSQL', 'AWS'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    links: { github: '#', live: 'https://vitejs.dev' }
  }
];

export const normalizeProject = (p) => {
  if (!p) return null;
  const tags = Array.isArray(p.tags) && p.tags.length > 0
    ? p.tags
    : (Array.isArray(p.technologies) ? p.technologies : []).filter(Boolean);
  
  const links = p.links || {
    live: p.liveLink || p.live || '',
    github: p.githubLink || p.github || ''
  };

  return {
    ...p,
    title: p.title || 'Untitled Project',
    category: p.category || 'Web App',
    description: p.description || '',
    image: p.image || p.coverImage || 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000&auto=format&fit=crop',
    tags,
    links
  };
};

export const cleanProjectDesc = (desc) => {
  if (!desc) return '';
  return desc
    .replace(/[*_#`~]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

const Projects = ({ isPage = false }) => {
  const cachedProjects = getCachedData('projects');
  const [projects, setProjects] = useState(() => {
    if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
      return cachedProjects.map(normalizeProject).filter(Boolean);
    }
    return defaultProjects.map(normalizeProject);
  });
  const [previewProject, setPreviewProject] = useState(null);
  const [commentProject, setCommentProject] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [categories, setCategories] = useState(() => {
    const source = (Array.isArray(cachedProjects) && cachedProjects.length > 0) ? cachedProjects : defaultProjects;
    return ['All', ...new Set(source.map(p => p.category).filter(Boolean))];
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedDescs, setExpandedDescs] = useState({});

  const toggleDesc = (id) => {
    setExpandedDescs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const mappedData = data.map(normalizeProject).filter(Boolean);
          setProjects(mappedData);
          setCachedData('projects', mappedData);
          
          const cats = ['All', ...new Set(mappedData.map(p => p.category).filter(Boolean))];
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      }
    };
    fetchProjects();
  }, []);

  const displayProjects = projects.length > 0 ? projects : defaultProjects.map(normalizeProject);
  const filteredProjects = displayProjects.filter(p => activeCategory === 'All' || p.category === activeCategory);

  return (
    <section id="projects" className="section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {isPage ? (
          <h1 className="section-title">Featured <span className="text-gradient">Projects</span></h1>
        ) : (
          <h2 className="section-title">Featured <span className="text-gradient">Projects</span></h2>
        )}
        <p className="section-subtitle">A selection of my recent freelance work and scalable applications.</p>
        
        <div className="project-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="project-card glass"
          >
            <div 
              className="project-image-container"
              onClick={() => setPreviewProject(project)}
              style={{ cursor: 'pointer' }}
              title="Click to preview project"
            >
              <img src={project.image} alt={project.title} className="project-image" loading="lazy" decoding="async" />
              <div className="project-overlay">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewProject(project);
                  }} 
                  className="big-preview-btn"
                >
                  Preview
                </button>
              </div>
            </div>
            
            <div className="project-info">
              <h3 
                className="project-title"
                onClick={() => setPreviewProject(project)}
                style={{ cursor: 'pointer' }}
                title="Click to preview project"
              >
                {project.title}
              </h3>
              {(() => {
                const pId = project._id || `proj-${index}`;
                const fullDesc = cleanProjectDesc(project.description);
                const isLongDesc = fullDesc && fullDesc.length > 85;
                const isExpanded = !!expandedDescs[pId];

                return (
                  <div className="project-desc-wrapper">
                    <p className={`project-desc ${isExpanded ? 'expanded' : ''}`}>
                      {fullDesc}
                    </p>
                    {isLongDesc && (
                      <button 
                        type="button"
                        className="project-desc-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDesc(pId);
                        }}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? 'See Less' : 'See More'}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    )}
                  </div>
                );
              })()}
              
              <div className="project-footer">
                <button
                  type="button"
                  className="mobile-preview-btn"
                  onClick={() => setPreviewProject(project)}
                >
                  <Eye size={12} /> Preview
                </button>
                <div className="project-tags">
                  {(project.tags || []).map(tag => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {project._id && (
                    <LikeButton targetType="project" targetId={project._id} initialLikes={project.likes} size={14} />
                  )}
                  {project._id && (
                    <button 
                      type="button" 
                      onClick={() => setCommentProject(project)} 
                      className="project-comment-btn"
                      title="Discussion & Feedback"
                    >
                      <MessageSquare size={14} />
                    </button>
                  )}
                  {project.isForSale && (
                    <button 
                      className="buy-now-btn" 
                      onClick={() => window.open(`https://wa.me/94705770398?text=Hi! I want to buy the project: ${project.title}`, '_blank')}
                      title={`Buy this project for $${project.price}`}
                    >
                      Buy ${project.price}
                    </button>
                  )}
                  {project.links?.github && (
                    <a 
                      href={project.links.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="github-link-btn"
                      title="View Source Code"
                    >
                      <GithubIcon size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No projects found in this category.</p>
          </div>
        )}
      </div>

      {previewProject && (
        <div className="preview-modal-overlay" onClick={() => setPreviewProject(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <button 
                type="button" 
                className="project-modal-back-btn"
                onClick={() => setPreviewProject(null)}
              >
                <ArrowLeft size={16} /> Back to Projects
              </button>
              <div className="preview-title-bar">
                <span>{previewProject.title || 'Template preview'}</span>
              </div>
              <div className="preview-controls">
                <button className="close-preview" onClick={() => setPreviewProject(null)} aria-label="Close preview">
                  <X size={20} color="#111827" />
                </button>
              </div>
            </div>
            
            <div className="preview-iframe-container">
              {(() => {
                let iframeSrc = previewProject.links?.live;
                if (!iframeSrc || iframeSrc === '#') return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#374151', padding: '40px 24px', textAlign: 'center', maxWidth: '650px', margin: '0 auto', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '14px', color: '#111827' }}>{previewProject.title}</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#4b5563', whiteSpace: 'pre-line', marginBottom: '20px' }}>
                      {cleanProjectDesc(previewProject.description)}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                      {(previewProject.tags || []).map(t => (
                        <span key={t} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#374151' }}>{t}</span>
                      ))}
                    </div>
                  </div>
                );
                
                // Fix Windows paths (e.g. C:\Users\...)
                iframeSrc = iframeSrc.replace(/\\/g, '/');
                
                // If they pasted the full computer path, extract only the public web path
                if (iframeSrc.includes('/templates/')) {
                  iframeSrc = iframeSrc.substring(iframeSrc.indexOf('/templates/'));
                } else {
                  // Fix common typos: if it starts with 'templates' or 'my-', prepend '/'
                  if (!iframeSrc.startsWith('http') && !iframeSrc.startsWith('/')) {
                    iframeSrc = '/' + iframeSrc;
                  }
                  // If they accidentally typed http://templates/...
                  if (iframeSrc.startsWith('http://templates/')) {
                    iframeSrc = iframeSrc.replace('http://templates/', '/templates/');
                  }
                }

                return (
                  <iframe 
                    src={iframeSrc} 
                    title="Template Preview"
                    className="preview-iframe"
                  ></iframe>
                );
              })()}
            </div>

            <div className="preview-footer">
              <span className="created-with">Created with <span style={{ fontWeight: 800 }}>TaizerCodeCrafter</span></span>
              <a href={previewProject.links.live} target="_blank" rel="noreferrer" className="use-template-btn">Use template</a>
            </div>
          </div>
        </div>
      )}

      {/* Project Details, Full View & Discussion Modal */}
      {commentProject && (
        <div className="preview-modal-overlay" onClick={() => setCommentProject(null)}>
          <div 
            className="project-detail-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header with Back to Projects and Close */}
            <div className="project-modal-sticky-header">
              <button 
                type="button" 
                className="project-modal-back-btn" 
                onClick={() => setCommentProject(null)}
              >
                <ArrowLeft size={16} /> Back to Projects
              </button>
              <button 
                type="button" 
                className="project-modal-close-btn" 
                onClick={() => setCommentProject(null)}
                aria-label="Close project modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="project-modal-body-scroll">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <span className="project-tag">{commentProject.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <LikeButton targetType="project" targetId={commentProject._id} initialLikes={commentProject.likes} size={15} />
                  {commentProject.links?.live && (
                    <a 
                      href={commentProject.links.live} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="buy-now-btn"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <ExternalLink size={13} /> Live Demo
                    </a>
                  )}
                  {commentProject.isForSale && (
                    <button 
                      className="buy-now-btn" 
                      onClick={() => window.open(`https://wa.me/94705770398?text=Hi! I want to buy the project: ${commentProject.title}`, '_blank')}
                      title={`Buy this project for $${commentProject.price}`}
                    >
                      Buy ${commentProject.price}
                    </button>
                  )}
                  {commentProject.links?.github && (
                    <a 
                      href={commentProject.links.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="github-link-btn"
                      title="View Source Code"
                    >
                      <GithubIcon size={18} />
                    </a>
                  )}
                </div>
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '8px 0 14px 0', color: 'var(--text-primary)' }}>
                {commentProject.title}
              </h2>

              {/* Full View Image Container - NO CROPPING */}
              {commentProject.image && (
                <div className="project-modal-full-img-container">
                  <img 
                    src={commentProject.image} 
                    alt={commentProject.title} 
                    className="project-modal-full-img"
                  />
                </div>
              )}

              <div className="project-modal-desc-text">
                {cleanProjectDesc(commentProject.description)}
              </div>

              <CommentSection 
                targetType="project" 
                targetId={commentProject._id} 
                targetTitle={commentProject.title} 
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
