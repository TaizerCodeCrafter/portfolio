import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Monitor, Smartphone, X, MessageSquare } from 'lucide-react';
import { GithubIcon } from './BrandIcons';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
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

const Projects = ({ isPage = false }) => {
  const [projects, setProjects] = useState([]);
  const [previewProject, setPreviewProject] = useState(null);
  const [commentProject, setCommentProject] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Map backend data to frontend structure
          const mappedData = data.map(p => ({
            ...p,
            tags: (Array.isArray(p.technologies) ? p.technologies : []).filter(Boolean),
            links: { live: p.liveLink, github: p.githubLink }
          }));
          
          setProjects(mappedData.length > 0 ? mappedData : defaultProjects);
          
          // Extract unique categories
          const cats = ['All', ...new Set(mappedData.map(p => p.category).filter(Boolean))];
          setCategories(cats);
        } else {
          setProjects(defaultProjects);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects(defaultProjects);
      }
    };
    fetchProjects();
  }, []);

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
        {projects
          .filter(p => activeCategory === 'All' || p.category === activeCategory)
          .map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="project-card glass"
          >
            <div className="project-image-container">
              <img src={project.image} alt={project.title} className="project-image" />
              <div className="project-overlay">
                <button 
                  onClick={() => setPreviewProject(project)} 
                  className="big-preview-btn"
                >
                  Preview
                </button>
              </div>
            </div>
            
            <div className="project-info">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              
              <div className="project-footer">
                <div className="project-tags">
                  {project.tags.map(tag => (
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
                  {project.links.github && (
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
        ))}
      </div>

      {previewProject && (
        <div className="preview-modal-overlay">
          <div className="preview-modal">
            <div className="preview-header">
              <div className="preview-title-bar">
                <span style={{ color: '#111827', fontWeight: 600 }}>Template preview</span>
              </div>
              <div className="preview-controls">
                <button className="close-preview" onClick={() => setPreviewProject(null)}>
                  <X size={20} color="#111827" />
                </button>
              </div>
            </div>
            
            <div className="preview-iframe-container">
              {(() => {
                let iframeSrc = previewProject.links.live;
                if (!iframeSrc || iframeSrc === '#') return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#374151' }}>
                    <h3>No Live Preview Available</h3>
                    <p>This project does not have a valid template URL.</p>
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

      {/* Project Comments & Discussion Modal */}
      {commentProject && (
        <div className="preview-modal-overlay" onClick={() => setCommentProject(null)}>
          <div 
            className="project-comments-modal glass" 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '750px',
              width: '92%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '30px',
              borderRadius: '24px',
              margin: 'auto',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="project-tag" style={{ marginBottom: '8px', display: 'inline-block' }}>{commentProject.category}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 8px 0', color: '#fff' }}>{commentProject.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LikeButton targetType="project" targetId={commentProject._id} initialLikes={commentProject.likes} size={16} />
                  {commentProject.links?.live && (
                    <a 
                      href={commentProject.links.live} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ fontSize: '0.82rem', color: '#b35a00', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 700 }}
                    >
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setCommentProject(null)} 
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              >
                <X size={18} />
              </button>
            </div>

            {commentProject.image && (
              <div style={{ width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
                <img src={commentProject.image} alt={commentProject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {commentProject.description}
            </p>

            <CommentSection 
              targetType="project" 
              targetId={commentProject._id} 
              targetTitle={commentProject.title} 
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
