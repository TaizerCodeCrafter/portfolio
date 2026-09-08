import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, FolderTree, Tag, Image, 
  Search, BarChart2, Sparkles, Settings, LogOut, 
  PlusCircle, Globe, ChevronRight, MoreHorizontal,
  FileStack, Eye, Users, DollarSign, Trash2, Save, X, Check, Lock, Mail, Upload,
  TrendingUp, Activity, MessageSquare, ShieldCheck, Zap, User, Key, Filter, Briefcase, Plus, Send, MapPin, Phone,
  Bold, Italic, Underline, List, Link as LinkIcon, Video, RotateCcw, RotateCw, Type, AlignLeft, Quote, Strikethrough, Code, ListOrdered, Minus, File,
  Award, Coffee, Star, Heart, Cpu, Rocket,
  AlertCircle, CheckCircle2, Info, Maximize, Minimize, AlignCenter, AlignRight, Edit2, PenTool, Layout, Server, Database, Smartphone, LayoutGrid,
  Building2, ExternalLink, CreditCard, Package as PackageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('admin_active_tab') || 'Dashboard');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [promptData, setPromptData] = useState({ visible: false, title: '', placeholder: '', onConfirm: null, value: '' });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const [imgToolbarPos, setImgToolbarPos] = useState({ top: 0, left: 0 });

  const [showAddBlog, setShowAddBlog] = useState(false);
  const [editorTab, setEditorTab] = useState('Content');
  const [blogForm, setBlogForm] = useState({
    title: '', slug: '', category: 'Technology', content: '', image: '', altText: '', tags: '',
    focusKeyword: '', seoTitle: '', seoDescription: '',
    ogTitle: '', ogDescription: '', ogImage: '',
    twitterTitle: '', twitterDescription: '', twitterImage: '',
    canonicalUrl: '', noIndex: false,
    status: 'published', isFeatured: false
  });

  const [blogSearch, setBlogSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [adminProfile, setAdminProfile] = useState({
    name: 'Supun Dilshan', company: 'DSJ ACADEMY', email: 'supundilshan358@gmail.com', password: 'admin123', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
  });

  const [emailInput, setEmailInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [settingsForm, setSettingsForm] = useState({ ...adminProfile });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && res.data.adminProfile) {
          setAdminProfile(res.data.adminProfile);
          setSettingsForm(res.data.adminProfile);
        }
      } catch (err) {
        console.error('Failed to fetch admin profile', err);
      }
    };
    fetchAdminProfile();
  }, []);

  // AI Assistant State
  const [aiTab, setAiTab] = useState('Auto Generate & Post');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState(null);
  const [aiForm, setAiForm] = useState({
    topic: '', keywords: '', tone: 'Professional', wordCount: '~1500 words', category: 'Technology', autoPublish: false
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState(null);
  const [aiSettings, setAiSettings] = useState({
    geminiApiKey: '',
    defaultTone: 'Professional',
    defaultWordCount: '~1000 words',
    aiModel: 'gemini-2.0-flash',
    fbPageId: '',
    fbAccessToken: '',
    fbEnabled: false
  });

  const [showAdvancedSeo, setShowAdvancedSeo] = useState(false);

  // Projects State
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '', category: 'Web App', description: '', image: '', liveLink: '', githubLink: '', technologies: '', isFeatured: false, isForSale: false, price: 0
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', content: '', avatar: '', rating: 5 });

  // Stats State
  const [stats, setStats] = useState([]);
  const [showAddStat, setShowAddStat] = useState(false);
  const [statForm, setStatForm] = useState({ label: '', value: '', icon: 'Briefcase', color: '#b35a00', order: 0 });

  // Skills State
  const [skills, setSkills] = useState([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ name: '', level: 0, category: 'Frontend Development', order: 0 });

  // Services State
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', details: '', learning: '', color: '#8b5cf6', icon: 'Layout', order: 0 });

  // Companies / Partners State
  const [companies, setCompanies] = useState([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: '', logo: '', website: '', order: 0, isActive: true });

  // Packages State
  const [packages, setPackages] = useState([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [packageForm, setPackageForm] = useState({
    title: '', subtitle: '', price: 150, currency: '$', billingPeriod: 'One-time',
    deliveryTime: '3-5 Days', features: '', isPopular: false, badge: '', color: '#b35a00', order: 0, isActive: true
  });

  const [webContentTab, setWebContentTab] = useState('Stats');
  const [settings, setSettings] = useState({ cvUrl: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState([]);
  
  // Categories & Tags & SEO State
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  
  const [tags, setTags] = useState([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [tagForm, setTagForm] = useState({ name: '', slug: '' });
  
  const [seoSettings, setSeoSettings] = useState({ siteTitle: '', metaDescription: '', keywords: '', googleConsoleId: '', ogImage: '' });
  const [seoAnalysis, setSeoAnalysis] = useState([]);
  const [seoTab, setSeoTab] = useState('Global Settings');
  
  const [messages, setMessages] = useState([]);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates');
      if (Array.isArray(res.data)) setAvailableTemplates(res.data);
    } catch (err) { console.error('Failed to fetch templates'); }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages');
      if (Array.isArray(res.data)) setMessages(res.data);
    } catch (err) { console.error('Failed to fetch messages'); }
  };

  const handleDeleteMessage = async (id) => {
    showConfirm('Delete this message?', async () => {
      try {
        await axios.delete(`/api/messages/${id}`);
        fetchMessages();
        showAlert('Message deleted');
      } catch (err) { showAlert('Failed to delete', 'error'); }
    });
  };

  const fetchMedia = async () => {
    try {
      const res = await axios.get('/api/media');
      if (Array.isArray(res.data)) setMedia(res.data);
    } catch (err) { console.error('Failed to fetch media'); }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data && typeof res.data === 'object') setSettings(res.data);
    } catch (err) { console.error('Failed to fetch settings'); }
  };

  const [confirmModal, setConfirmModal] = useState({ visible: false, message: '', onConfirm: null });

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ visible: true, message, onConfirm });
  };

  useEffect(() => {
    if (localStorage.getItem('admin_logged_in') === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchSettings();
      fetchMedia();
      fetchAiSettings();
      fetchMessages();
      fetchTemplates();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        blogRes, projectRes, testimonialRes, statRes, skillRes, serviceRes, catRes, tagRes, seoRes, seoAnRes, companyRes, packageRes
      ] = await Promise.allSettled([
        axios.get('/api/blogs/admin/all'),
        axios.get('/api/projects'),
        axios.get('/api/testimonials'),
        axios.get('/api/stats'),
        axios.get('/api/skills'),
        axios.get('/api/services'),
        axios.get('/api/categories'),
        axios.get('/api/tags'),
        axios.get('/api/seo/settings'),
        axios.get('/api/seo/analysis'),
        axios.get('/api/companies/admin/all'),
        axios.get('/api/packages/admin/all')
      ]);

      if (blogRes.status === 'fulfilled' && Array.isArray(blogRes.value?.data)) setBlogs(blogRes.value.data);
      if (projectRes.status === 'fulfilled' && Array.isArray(projectRes.value?.data)) setProjects(projectRes.value.data);
      if (testimonialRes.status === 'fulfilled' && Array.isArray(testimonialRes.value?.data)) setTestimonials(testimonialRes.value.data);
      if (statRes.status === 'fulfilled' && Array.isArray(statRes.value?.data)) setStats(statRes.value.data);
      if (skillRes.status === 'fulfilled' && Array.isArray(skillRes.value?.data)) setSkills(skillRes.value.data);
      if (serviceRes.status === 'fulfilled' && Array.isArray(serviceRes.value?.data)) setServices(serviceRes.value.data);
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.data)) setCategories(catRes.value.data);
      if (tagRes.status === 'fulfilled' && Array.isArray(tagRes.value?.data)) setTags(tagRes.value.data);
      if (seoRes.status === 'fulfilled' && seoRes.value?.data && typeof seoRes.value.data === 'object') setSeoSettings(seoRes.value.data);
      if (seoAnRes.status === 'fulfilled' && Array.isArray(seoAnRes.value?.data)) setSeoAnalysis(seoAnRes.value.data);
      if (companyRes.status === 'fulfilled' && Array.isArray(companyRes.value?.data)) setCompanies(companyRes.value.data);
      if (packageRes.status === 'fulfilled' && Array.isArray(packageRes.value?.data)) setPackages(packageRes.value.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const showPrompt = (title, placeholder, onConfirm) => {
    setPromptData({ visible: true, title, placeholder, onConfirm, value: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (emailInput === adminProfile.email && passInput === adminProfile.password) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_logged_in', 'true');
      showAlert('Welcome back, Admin!');
    } else { showAlert('Invalid Credentials!', 'error'); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_logged_in');
    showAlert('Logged out successfully');
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem('admin_active_tab', tabName);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/settings', { key: 'adminProfile', value: settingsForm });
      setAdminProfile(settingsForm);
      showAlert('Profile updated successfully!');
    } catch (err) {
      showAlert('Failed to update profile', 'error');
    }
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    syncContent();
  };

  const syncContent = () => {
    if (editorRef.current) {
      setBlogForm(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'IMG') {
      setSelectedImg(e.target);
      setImgToolbarPos({ top: e.target.offsetTop - 50, left: e.target.offsetLeft });
    } else { setSelectedImg(null); }
  };

  const resizeImg = (size) => {
    if (!selectedImg) return;
    if (size === 'small') selectedImg.style.width = '25%';
    else if (size === 'medium') selectedImg.style.width = '50%';
    else if (size === 'large') selectedImg.style.width = '75%';
    else selectedImg.style.width = '100%';
    syncContent();
  };

  const alignImg = (align) => {
    if (!selectedImg) return;
    selectedImg.style.display = align === 'center' ? 'block' : 'inline-block';
    selectedImg.style.margin = align === 'center' ? '15px auto' : align === 'right' ? '15px 0 15px auto' : '15px auto 15px 0';
    syncContent();
  };

  const handleEditorImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => execCommand('insertHTML', `<img src="${reader.result}" style="width:100%; border-radius:15px; display:block; margin:15px auto; cursor:pointer;" draggable="true" />`);
      reader.readAsDataURL(file);
    }
  };

  const handleEditorFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileLink = `<a href="${reader.result}" download="${file.name}" style="display: flex; align-items: center; gap: 10px; padding: 15px; background: #fcf8f4; border-radius: 12px; border: 1px solid #e8e0d5; text-decoration: none; color: #b35a00; font-weight: 700; margin: 15px 0;">📎 Download: ${file.name}</a>`;
        execCommand('insertHTML', fileLink);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishBlog = async () => {
    const finalContent = editorRef.current ? editorRef.current.innerHTML : blogForm.content;
    if (!blogForm.title || !finalContent) return showAlert('Title and Content required!', 'error');
    
    const payload = { 
      ...blogForm, 
      content: finalContent,
      coverImage: blogForm.image, // Ensure coverImage is set for backend
      tags: typeof blogForm.tags === 'string' ? blogForm.tags.split(',').map(t => t.trim()) : blogForm.tags,
      seo: {
        metaTitle: blogForm.seoTitle,
        metaDescription: blogForm.seoDescription,
        keywords: typeof blogForm.focusKeyword === 'string' ? blogForm.focusKeyword.split(',').map(k => k.trim()) : blogForm.focusKeyword
      }
    };

    try {
      if (blogForm._id) {
        await axios.put(`/api/blogs/${blogForm._id}`, payload);
        showAlert('Blog Updated!');
      } else {
        await axios.post('/api/blogs', payload);
        showAlert('Blog Published!');
      }
      setShowAddBlog(false);
      fetchData();
    } catch (err) { 
      console.error('Publishing Error:', err.response?.data || err.message);
      showAlert(`Failed to ${blogForm._id ? 'update' : 'publish'}!`, 'error'); 
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/blogs/${id}`, { status });
      showAlert(`Status updated to ${status}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const [menuOpenId, setMenuOpenId] = useState(null);

  const handleDeleteBlog = async (id) => {
    showConfirm('Are you sure you want to delete this post?', async () => {
      try {
        await axios.delete(`/api/blogs/${id}`);
        showAlert('Post deleted successfully');
        fetchData();
      } catch (err) { showAlert('Failed to delete!', 'error'); }
    });
  };

  useEffect(() => {
    if (showAddBlog && editorRef.current && blogForm.content) {
      editorRef.current.innerHTML = blogForm.content;
    }
  }, [showAddBlog, blogForm._id]);

  const handleEditBlog = (blog) => {
    setBlogForm({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      category: blog.category || 'Technology',
      content: blog.content,
      image: blog.image || '',
      altText: blog.altText || '',
      tags: blog.tags ? blog.tags.join(', ') : '',
      status: blog.status,
      isFeatured: blog.isFeatured || false,
      seoTitle: blog.seoTitle || blog.seo?.metaTitle || '',
      seoDescription: blog.seoDescription || blog.seo?.metaDescription || '',
      focusKeyword: blog.focusKeyword || (blog.seo?.keywords ? blog.seo.keywords.join(', ') : ''),
      ogTitle: blog.ogTitle || '',
      ogDescription: blog.ogDescription || '',
      ogImage: blog.ogImage || '',
      twitterTitle: blog.twitterTitle || '',
      twitterDescription: blog.twitterDescription || '',
      twitterImage: blog.twitterImage || '',
      canonicalUrl: blog.canonicalUrl || '',
      noIndex: blog.noIndex || false
    });
    setEditorTab('Content');
    setShowAddBlog(true);
    setMenuOpenId(null);
  };

  const handleOptimizeSEO = async (keyword, content) => {
    if (!content) return showAlert('Please paste some content!', 'error');
    setIsGenerating(true);
    setGeneratedPreview(null);
    try {
      const res = await axios.post('/api/blogs/optimize-seo', { keyword, content });
      setGeneratedPreview({ seoAnalysis: res.data });
      showAlert('SEO Analysis Complete!');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'SEO Analysis Failed!';
      showAlert(errorMessage, 'error');
    }
    setIsGenerating(false);
  };

  const handleFetchTrending = async () => {
    setIsGenerating(true);
    setGeneratedPreview(null);
    try {
      const res = await axios.get('/api/blogs/trending-topics');
      setGeneratedPreview({ trendingTopics: res.data });
      showAlert('Latest Trends Discovered!');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch trends!';
      showAlert(errorMessage, 'error');
    }
    setIsGenerating(false);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setGeneratedPreview(null);
    try {
      const res = await axios.post('/api/blogs/generate-ai', aiForm);
      const cleanTitle = (res.data.title || '').replace(/[^a-zA-Z0-9 ]/g, '');
      setGeneratedPreview({
        ...res.data,
        image: `https://image.pollinations.ai/prompt/${encodeURIComponent('blog cover for ' + cleanTitle)}?width=800&height=500&nologo=true&seed=${Math.floor(Math.random() * 10000)}`
      });
      showAlert('AI Generated Content Ready!');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'AI Generation Failed!';
      showAlert(errorMessage, 'error');
    }
    setIsGenerating(false);
  };

  const handleOneClickPost = async (topicTitle) => {
    showConfirm(`Auto-generate and publish a blog post about: "${topicTitle}"?`, async () => {
      setIsGenerating(true);
      try {
        const res = await axios.post('/api/blogs/generate-ai', { ...aiForm, topic: topicTitle });
        const cleanTitle = aiForm.topic || 'Technology Update';
        const cleanPrompt = cleanTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
        
        await axios.post('/api/blogs', {
          ...res.data,
          status: 'published',
          image: `https://image.pollinations.ai/prompt/${encodeURIComponent('technology blog cover ' + cleanPrompt)}?width=800&height=500&nologo=true&seed=${Math.floor(Math.random() * 10000)}`
        });
        showAlert('Article Published Successfully!');
        fetchData();
      } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || 'Failed to publish AI article!';
        showAlert(errorMessage, 'error');
      }
      setIsGenerating(false);
    });
  };

  const handleSaveGeneratedBlog = async () => {
    if (!generatedPreview) return;
    try {
      const cleanTitle = (generatedPreview.title || '').replace(/[^a-zA-Z0-9 ]/g, '');
      await axios.post('/api/blogs', {
        ...generatedPreview,
        status: aiForm.autoPublish ? 'published' : 'draft',
        image: generatedPreview.image || `https://image.pollinations.ai/prompt/${encodeURIComponent('technology blog cover ' + cleanPrompt)}?width=800&height=500&nologo=true&seed=${Math.floor(Math.random() * 10000)}`,
        seoTitle: generatedPreview.seo?.metaTitle || generatedPreview.title,
        seoDescription: generatedPreview.seo?.metaDescription || generatedPreview.metaDescription,
        focusKeyword: generatedPreview.seo?.keywords ? generatedPreview.seo.keywords.join(', ') : (generatedPreview.keywords ? generatedPreview.keywords.join(', ') : '')
      });
      showAlert('Blog Saved Successfully!');
      setGeneratedPreview(null);
      setAiForm({ ...aiForm, topic: '', keywords: '' });
      fetchData();
    } catch (err) { showAlert('Failed to save!', 'error'); }
  };

  // Projects Handlers
  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description) return showAlert('Title and Description required!', 'error');
    const payload = {
      ...projectForm,
      technologies: typeof projectForm.technologies === 'string' ? projectForm.technologies.split(',').map(t => t.trim()) : projectForm.technologies
    };
    try {
      if (projectForm._id) {
        await axios.put(`/api/projects/${projectForm._id}`, payload);
        showAlert('Project Updated!');
      } else {
        await axios.post('/api/projects', payload);
        showAlert('Project Created!');
      }
      setShowAddProject(false);
      fetchData();
    } catch (err) { showAlert('Failed to save project!', 'error'); }
  };

  const handleEditProject = (p) => {
    setProjectForm({ 
      ...p, 
      technologies: Array.isArray(p.technologies) ? p.technologies.filter(Boolean).join(', ') : (p.technologies || '') 
    });
    setShowAddProject(true);
  };

  const handleDeleteProject = async (id) => {
    showConfirm('Delete this project?', async () => {
      try {
        await axios.delete(`/api/projects/${id}`);
        showAlert('Project Deleted!');
        fetchData();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  // Testimonials Handlers
  const handleSaveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.content) return showAlert('Name and Content required!', 'error');
    try {
      if (testimonialForm._id) {
        await axios.put(`/api/testimonials/${testimonialForm._id}`, testimonialForm);
        showAlert('Testimonial Updated!');
      } else {
        await axios.post('/api/testimonials', testimonialForm);
        showAlert('Testimonial Added!');
      }
      setShowAddTestimonial(false);
      setTestimonialForm({ name: '', role: '', content: '', avatar: '', rating: 5 });
      fetchData();
    } catch (err) { showAlert('Failed to save testimonial!', 'error'); }
  };

  const handleDeleteTestimonial = async (id) => {
    showConfirm('Delete this testimonial?', async () => {
      try {
        await axios.delete(`/api/testimonials/${id}`);
        showAlert('Testimonial Deleted!');
        fetchData();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  // Stats Handlers
  const handleSaveStat = async () => {
    if (!statForm.label || !statForm.value) return showAlert('Label and Value required!', 'error');
    try {
      if (statForm._id) {
        await axios.put(`/api/stats/${statForm._id}`, statForm);
        showAlert('Stat Updated!');
      } else {
        await axios.post('/api/stats', statForm);
        showAlert('Stat Added!');
      }
      setShowAddStat(false);
      setStatForm({ label: '', value: '', icon: 'Briefcase', color: '#b35a00', order: 0 });
      fetchData();
    } catch (err) { showAlert('Failed to save stat!', 'error'); }
  };

  const handleDeleteStat = async (id) => {
    showConfirm('Delete this stat?', async () => {
      try {
        await axios.delete(`/api/stats/${id}`);
        showAlert('Stat Deleted!');
        fetchData();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  // Skills Handlers
  const handleSaveSkill = async () => {
    if (!skillForm.name || !skillForm.level) return showAlert('Name and Level required!', 'error');
    try {
      if (skillForm._id) {
        await axios.put(`/api/skills/${skillForm._id}`, skillForm);
        showAlert('Skill Updated!');
      } else {
        await axios.post('/api/skills', skillForm);
        showAlert('Skill Added!');
      }
      setShowAddSkill(false);
      setSkillForm({ name: '', level: 0, category: 'Frontend Development', order: 0 });
      fetchData();
    } catch (err) { showAlert('Failed to save skill!', 'error'); }
  };

  const handleDeleteSkill = async (id) => {
    showConfirm('Delete this skill?', async () => {
      try {
        await axios.delete(`/api/skills/${id}`);
        showAlert('Skill Deleted!');
        fetchData();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  // Services Handlers
  const handleSaveService = async () => {
    if (!serviceForm.title || !serviceForm.description) return showAlert('Title and Description required!', 'error');
    try {
      const payload = {
        ...serviceForm,
        learning: typeof serviceForm.learning === 'string' ? serviceForm.learning.split(',').map(s => s.trim()).filter(Boolean) : serviceForm.learning
      };
      if (serviceForm._id) {
        await axios.put(`/api/services/${serviceForm._id}`, payload);
        showAlert('Service Updated!');
      } else {
        await axios.post('/api/services', payload);
        showAlert('Service Added!');
      }
      setShowAddService(false);
      setServiceForm({ title: '', description: '', details: '', learning: '', color: '#8b5cf6', icon: 'Layout', order: 0 });
      fetchData();
    } catch (err) { showAlert('Failed to save service!', 'error'); }
  };

  const handleDeleteService = async (id) => {
    showConfirm('Delete this service?', async () => {
      try {
        await axios.delete(`/api/services/${id}`);
        showAlert('Service Deleted!');
        fetchData();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  // Companies Handlers
  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/companies/admin/all');
      if (Array.isArray(res.data)) setCompanies(res.data);
    } catch (err) { console.error('Failed to fetch companies'); }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name) return showAlert('Company name is required!', 'error');
    if (!companyForm.logo) return showAlert('Company logo is required!', 'error');

    try {
      if (companyForm._id) {
        await axios.put(`/api/companies/${companyForm._id}`, companyForm);
        showAlert('Company Updated!');
      } else {
        await axios.post('/api/companies', companyForm);
        showAlert('Company Added!');
      }
      setShowAddCompany(false);
      setCompanyForm({ name: '', logo: '', website: '', order: 0, isActive: true });
      fetchCompanies();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save company!', 'error');
    }
  };

  const handleEditCompany = (c) => {
    setCompanyForm({ ...c });
    setShowAddCompany(true);
  };

  const handleDeleteCompany = async (id) => {
    showConfirm('Delete this company/partner?', async () => {
      try {
        await axios.delete(`/api/companies/${id}`);
        showAlert('Company Deleted!');
        fetchCompanies();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  const handleCompanyLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return showAlert('Image file must be under 2MB', 'error');
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyForm(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Packages Handlers
  const fetchPackages = async () => {
    try {
      const res = await axios.get('/api/packages/admin/all');
      if (Array.isArray(res.data)) setPackages(res.data);
    } catch (err) { console.error('Failed to fetch packages'); }
  };

  const handleSavePackage = async () => {
    if (!packageForm.title) return showAlert('Package title is required!', 'error');
    if (packageForm.price === undefined || packageForm.price === '') return showAlert('Price is required!', 'error');

    const payload = {
      ...packageForm,
      features: typeof packageForm.features === 'string'
        ? packageForm.features.split('\n').map(f => f.trim()).filter(Boolean)
        : packageForm.features
    };

    try {
      if (packageForm._id) {
        await axios.put(`/api/packages/${packageForm._id}`, payload);
        showAlert('Package Updated!');
      } else {
        await axios.post('/api/packages', payload);
        showAlert('Package Created!');
      }
      setShowAddPackage(false);
      setPackageForm({
        title: '', subtitle: '', price: 150, currency: '$', billingPeriod: 'One-time',
        deliveryTime: '3-5 Days', features: '', isPopular: false, badge: '', color: '#b35a00', order: packages.length, isActive: true
      });
      fetchPackages();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to save package!', 'error');
    }
  };

  const handleEditPackage = (pkg) => {
    setPackageForm({
      ...pkg,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || '')
    });
    setShowAddPackage(true);
  };

  const handleDeletePackage = async (id) => {
    showConfirm('Delete this package?', async () => {
      try {
        await axios.delete(`/api/packages/${id}`);
        showAlert('Package Deleted!');
        fetchPackages();
      } catch (err) { showAlert('Delete failed!', 'error'); }
    });
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      await axios.post('/api/settings', { key, value });
      showAlert('Settings updated!');
      fetchSettings();
    } catch (err) { showAlert('Update failed!', 'error'); }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) return showAlert('File too large! Max 15MB (MongoDB Limit)', 'error');
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await axios.post('/api/settings', { key: 'cvUrl', value: reader.result });
          await axios.post('/api/settings', { key: 'cvName', value: file.name });
          await axios.post('/api/settings', { key: 'isCvActive', value: true });
          // Also save to media library
          try {
            await axios.post('/api/media', { name: file.name, url: reader.result, type: 'document', size: file.size });
          } catch (mErr) { console.warn(mErr); }
          showAlert('CV Uploaded and activated successfully!');
          fetchSettings();
          fetchMedia();
        } catch (err) {
          showAlert('Upload failed! ' + (err.response?.data?.message || 'File might be too large for database.'), 'error');
        } finally {
          setIsUploading(false);
          if (e.target) e.target.value = '';
        }
      };
      reader.onerror = () => {
        showAlert('Error reading file!', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAiSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.aiConfig) {
        setAiSettings(res.data.aiConfig);
      }
    } catch (err) { console.error('Failed to fetch AI settings'); }
  };

  const handleUpdateAiSettings = async (newConfig) => {
    try {
      await axios.post('/api/settings', { key: 'aiConfig', value: newConfig });
      showAlert('AI Settings updated!');
      fetchAiSettings();
    } catch (err) { showAlert('Update failed!', 'error'); }
  };

  const filteredBlogs = (Array.isArray(blogs) ? blogs : []).filter(b => 
    (b.title || '').toLowerCase().includes((blogSearch || '').toLowerCase()) && 
    (statusFilter === 'All' || (b.status || '').toLowerCase() === (statusFilter || '').toLowerCase())
  );

  const avgSeoScore = (Array.isArray(blogs) && blogs.length > 0) ? Math.round(blogs.reduce((acc, b) => {
    let score = 0;
    const title = b.seoTitle || b.seo?.metaTitle || b.title || '';
    const desc = b.seoDescription || b.seo?.metaDescription || '';
    const keyword = b.focusKeyword || (b.seo?.keywords && b.seo.keywords.length > 0 ? 'yes' : '');
    if (title) score += 20;
    if (desc) score += 20;
    if (keyword) score += 20;
    if (b.image || b.coverImage) score += 10;
    if (title.length >= 10 && title.length <= 60) score += 10;
    if (desc.length >= 50 && desc.length <= 160) score += 20;
    return acc + score;
  }, 0) / blogs.length) : 0;

  if (!isAuthenticated) {
    // ... (rest of the login logic remains same)
    return (
      <div className="admin-page-container">
        <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />
        <div className="admin-login-container">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="admin-login-card">
            <div className="login-header"><h1>Admin Login</h1></div>
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-input-group"><label>Email</label><input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} required /></div>
              <div className="login-input-group"><label>Password</label><input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} required /></div>
              <button type="submit" className="login-submit-btn">Sign in</button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard }, 
    { name: 'Blogs', icon: FileText }, 
    { name: 'Projects', icon: Zap },
    { name: 'Web Content', icon: Globe },
    { name: 'Categories', icon: FolderTree }, 
    { name: 'Tags', icon: Tag },
    { name: 'SEO', icon: Globe }, 
    { name: 'Analytics', icon: BarChart2 }, 
    { name: 'AI Assistant', icon: Sparkles },
    { name: 'Inbox', icon: Mail },
  ];

  const handleDeleteAll = async () => {
    showConfirm('CRITICAL: This will permanently delete ALL blog posts. Are you sure?', async () => {
      try {
        await axios.delete('/api/blogs/admin/delete-all');
        showAlert('All posts deleted successfully');
        fetchData();
      } catch (err) { showAlert('Failed to delete all!', 'error'); }
    });
  };

  return (
    <div className="admin-page-container" onClick={() => setMenuOpenId(null)}>
      <CustomToast visible={toast.visible} message={toast.message} type={toast.type} />
      <CustomConfirm 
        visible={confirmModal.visible} 
        message={confirmModal.message} 
        onConfirm={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, visible: false }); }} 
        onCancel={() => setConfirmModal({ ...confirmModal, visible: false })} 
      />
      <CustomPrompt visible={promptData.visible} title={promptData.title} placeholder={promptData.placeholder} onCancel={() => setPromptData({ ...promptData, visible: false })} onConfirm={(val) => { promptData.onConfirm(val); setPromptData({ ...promptData, visible: false }); }} />

      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="nav-cube-wrapper"><div className="nav-cube"><div className="nav-face nav-front">💻</div><div className="nav-face nav-back">⚙️</div><div className="nav-face nav-right">🤖</div><div className="nav-face nav-left">🚀</div><div className="nav-face nav-top"></div><div className="nav-face nav-bottom"></div></div></div>
          <span className="logo-text-admin">Portfolio</span>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">{navItems.map((item) => (
            <li key={item.name}><button onClick={() => handleTabChange(item.name)} className={`nav-btn ${activeTab === item.name ? 'active' : ''}`}><item.icon size={18} /> {item.name}</button></li>
          ))}</ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => handleTabChange('Settings')} className={`nav-btn ${activeTab === 'Settings' ? 'active' : ''}`} style={{ marginBottom: '4px' }}><Settings size={18} /> Settings</button>
          <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      <div className="admin-main-content">
        <header className="admin-top-bar">
          <div className="admin-search-wrapper"><Search className="search-icon" size={16} /><input type="text" placeholder="Search..." className="admin-search-input" /></div>
          <div className="admin-profile">
            <div className="profile-info"><div className="profile-name">{adminProfile.name}</div><div className="profile-role">{adminProfile.company}</div></div>
            <img src={adminProfile.photo} className="profile-img" alt="avatar" />
          </div>
        </header>

        <div className="dashboard-body">
          {activeTab === 'Blogs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnimatePresence>
                {showAddBlog ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      {['Content', 'SEO', 'Settings'].map(t => (<button key={t} onClick={() => setEditorTab(t)} style={{ padding: '12px 30px', borderRadius: '15px', background: editorTab === t ? '#b35a00' : 'white', border: 'none', fontWeight: '800', fontSize: '0.9rem', color: editorTab === t ? 'white' : '#888', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', transition: '0.3s' }}>{t}</button>))}
                      <div style={{ flexGrow: 1 }}></div>
                      <button onClick={() => setShowAddBlog(false)} className="btn-secondary" style={{ background: '#eee', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                      <button onClick={handlePublishBlog} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 25px', borderRadius: '15px' }}>{blogForm._id ? 'Update Post' : 'Publish Post'}</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: editorTab === 'Content' ? '2.5fr 1fr' : '1fr', gap: '25px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="white-card" style={{ padding: '25px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            <div className="login-input-group" style={{ flexGrow: 1, marginBottom: 0 }}><label>Title</label><input type="text" value={blogForm.title} onChange={e => { const t = e.target.value; setBlogForm({...blogForm, title: t, slug: t.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}); }} placeholder="Enter title..." /></div>
                            <div className="login-input-group" style={{ width: '250px', marginBottom: 0 }}><label>Slug</label><input type="text" value={blogForm.slug} readOnly style={{ background: '#f9f9f9', color: '#888' }} /></div>
                          </div>
                        </div>

                        <div className="white-card" style={{ padding: '25px', minHeight: '600px' }}>
                          <div style={{ display: editorTab === 'Content' ? 'block' : 'none' }}>
                            <div style={{ position: 'relative' }}>
                              <AnimatePresence>{selectedImg && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: 'absolute', top: imgToolbarPos.top, left: imgToolbarPos.left, zIndex: 100, display: 'flex', gap: '5px', padding: '8px', background: '#222', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}><ImgToolBtn icon={Minimize} onClick={() => resizeImg('small')} /><ImgToolBtn icon={Maximize} onClick={() => resizeImg('medium')} /><ImgToolBtn icon={Maximize} label="Full" onClick={() => resizeImg('full')} /><div style={{ width: '1px', background: '#444', margin: '0 5px' }} /><ImgToolBtn icon={AlignLeft} onClick={() => alignImg('left')} /><ImgToolBtn icon={AlignCenter} onClick={() => alignImg('center')} /><div style={{ width: '1px', background: '#444', margin: '0 5px' }} /><ImgToolBtn icon={Trash2} color="#ef4444" onClick={() => { selectedImg.remove(); setSelectedImg(null); syncContent(); }} /></motion.div>)}</AnimatePresence>
                              <div className="card-title">Content</div>
                              <div style={{ display: 'flex', gap: '8px', padding: '10px', background: '#fcf8f4', borderRadius: '12px 12px 0 0', border: '1px solid #e8e0d5', borderBottom: 'none', flexWrap: 'wrap' }}><ToolbarBtn icon={Bold} onClick={() => execCommand('bold')} /><ToolbarBtn icon={Italic} onClick={() => execCommand('italic')} /><ToolbarBtn icon={Underline} onClick={() => execCommand('underline')} /><div style={{ width: '1px', background: '#e8e0d5', margin: '0 5px' }} /><ToolbarBtn icon={Type} label="H1" onClick={() => execCommand('formatBlock', 'H1')} /><ToolbarBtn icon={Type} label="H2" onClick={() => execCommand('formatBlock', 'H2')} /><div style={{ width: '1px', background: '#e8e0d5', margin: '0 5px' }} /><ToolbarBtn icon={LinkIcon} onClick={() => showPrompt('Link URL', 'https://...', (v) => execCommand('createLink', v))} /><ToolbarBtn icon={Image} onClick={() => fileInputRef.current.click()} /><input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleEditorImageUpload} /><ToolbarBtn icon={File} onClick={() => docInputRef.current.click()} /><input type="file" ref={docInputRef} hidden accept=".pdf,.doc,.docx" onChange={handleEditorFileUpload} /></div>
                              <div ref={editorRef} contentEditable="true" onClick={handleEditorClick} onInput={syncContent} onBlur={syncContent} style={{ width: '100%', minHeight: '500px', padding: '25px', borderRadius: '0 0 12px 12px', border: '1px solid #e8e0d5', fontSize: '1.1rem', lineHeight: '1.7', outline: 'none', background: 'white' }}></div>
                            </div>
                          </div>

                          {editorTab === 'SEO' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                              <h3 style={{ fontWeight: '800' }}>SEO Settings</h3>
                              <div className="login-input-group"><label>Focus Keyword</label><input type="text" value={blogForm.focusKeyword} onChange={e => setBlogForm({...blogForm, focusKeyword: e.target.value})} /></div>
                              <div className="login-input-group"><div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Meta Title</label><span style={{ fontSize: '0.75rem', color: (blogForm.seoTitle || '').length > 60 ? '#ef4444' : '#16a34a', fontWeight: '700' }}>{(blogForm.seoTitle || '').length}/60</span></div><input type="text" value={blogForm.seoTitle || ''} onChange={e => setBlogForm({...blogForm, seoTitle: e.target.value})} /></div>
                              <div className="login-input-group"><div style={{ display: 'flex', justifyContent: 'space-between' }}><label>Meta Description</label><span style={{ fontSize: '0.75rem', color: (blogForm.seoDescription || '').length > 160 ? '#ef4444' : '#16a34a', fontWeight: '700' }}>{(blogForm.seoDescription || '').length}/160</span></div><textarea rows="4" value={blogForm.seoDescription || ''} onChange={e => setBlogForm({...blogForm, seoDescription: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                              <div style={{ padding: '20px', background: '#fcf8f4', borderRadius: '15px', border: '1px solid #e8e0d5' }}><div className="card-title" style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Search Preview</div><div style={{ background: 'white', padding: '15px', borderRadius: '10px' }}><div style={{ color: '#1a0dab', fontSize: '1.2rem', marginBottom: '4px' }}>{blogForm.seoTitle || blogForm.title || 'Post Title'}</div><div style={{ color: '#006621', fontSize: '0.85rem' }}>dsj-academy.com/blog/{blogForm.slug || 'post-slug'}</div><div style={{ color: '#545454', fontSize: '0.85rem' }}>{blogForm.seoDescription || 'Meta description preview...'}</div></div></div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f9f9f9', borderRadius: '15px', marginTop: '10px' }}>
                                <label className="switch">
                                  <input type="checkbox" checked={showAdvancedSeo} onChange={e => setShowAdvancedSeo(e.target.checked)} />
                                  <span className="slider round"></span>
                                </label>
                                <span style={{ fontWeight: '700', color: '#555', fontSize: '0.9rem' }}>Show Advanced Options</span>
                              </div>

                              {showAdvancedSeo && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                  {/* Open Graph Section */}
                                  <div style={{ padding: '25px', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
                                    <h4 style={{ fontWeight: '800', marginBottom: '20px', color: '#333' }}>Open Graph (Facebook, LinkedIn)</h4>
                                    <div className="login-input-group"><label>OG Title</label><input type="text" value={blogForm.ogTitle} onChange={e => setBlogForm({...blogForm, ogTitle: e.target.value})} placeholder="Article title for social media" /></div>
                                    <div className="login-input-group"><label>OG Description</label><textarea rows="3" value={blogForm.ogDescription} onChange={e => setBlogForm({...blogForm, ogDescription: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                                    <div className="login-input-group" style={{ marginBottom: '5px' }}><label>OG Image URL</label><input type="text" value={blogForm.ogImage} onChange={e => setBlogForm({...blogForm, ogImage: e.target.value})} /></div>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Recommended: 1200x630 pixels</span>
                                  </div>

                                  {/* Twitter Section */}
                                  <div style={{ padding: '25px', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
                                    <h4 style={{ fontWeight: '800', marginBottom: '20px', color: '#333' }}>Twitter Card</h4>
                                    <div className="login-input-group"><label>Twitter Title</label><input type="text" value={blogForm.twitterTitle} onChange={e => setBlogForm({...blogForm, twitterTitle: e.target.value})} /></div>
                                    <div className="login-input-group"><label>Twitter Description</label><textarea rows="3" value={blogForm.twitterDescription} onChange={e => setBlogForm({...blogForm, twitterDescription: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                                    <div className="login-input-group"><label>Twitter Image URL</label><input type="text" value={blogForm.twitterImage} onChange={e => setBlogForm({...blogForm, twitterImage: e.target.value})} /></div>
                                  </div>

                                  {/* Other Options Section */}
                                  <div style={{ padding: '25px', background: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
                                    <h4 style={{ fontWeight: '800', marginBottom: '20px', color: '#333' }}>Other Options</h4>
                                    <div className="login-input-group" style={{ marginBottom: '5px' }}><label>Canonical URL</label><input type="text" value={blogForm.canonicalUrl} onChange={e => setBlogForm({...blogForm, canonicalUrl: e.target.value})} placeholder="https://example.com/original-post" /></div>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Use if this content exists elsewhere</span>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
                                      <label className="switch">
                                        <input type="checkbox" checked={blogForm.noIndex} onChange={e => setBlogForm({...blogForm, noIndex: e.target.checked})} />
                                        <span className="slider round"></span>
                                      </label>
                                      <span style={{ fontWeight: '700', color: '#555', fontSize: '0.9rem' }}>No Index (hide from search engines)</span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : editorTab === 'Settings' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                              <h3 style={{ fontWeight: '800' }}>Post Settings</h3>
                              <div className="login-input-group" style={{ width: '200px' }}><label>Status</label><select className="admin-input" value={blogForm.status} onChange={e => setBlogForm({...blogForm, status: e.target.value})}><option value="published">Published</option><option value="draft">Draft</option></select></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: '1px solid #eee' }}><div><div style={{ fontWeight: '700' }}>Featured Post</div><div style={{ fontSize: '0.85rem', color: '#888' }}>Show this post in the featured section</div></div><label className="switch"><input type="checkbox" checked={blogForm.isFeatured} onChange={e => setBlogForm({...blogForm, isFeatured: e.target.checked})} /><span className="slider round"></span></label></div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* --- SIDEBAR ONLY SHOWS ON CONTENT TAB --- */}
                      {editorTab === 'Content' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                          <div className="white-card" style={{ padding: '20px' }}>
                            <div className="card-title">Cover Image</div>
                            <div style={{ position: 'relative', marginTop: '15px', height: '180px', background: '#f9f9f9', borderRadius: '15px', overflow: 'hidden', border: '2px dashed #e8e0d5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {blogForm.image ? (<><img src={blogForm.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><button onClick={() => setBlogForm({...blogForm, image: ''})} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '5px' }}><X size={14} /></button></>) : (<label style={{ cursor: 'pointer', textAlign: 'center', color: '#888' }}><Upload size={32} style={{ margin: '0 auto 10px auto' }} /> <div>Upload Image</div><input type="file" hidden onChange={e => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onloadend = () => setBlogForm({...blogForm, image: r.result}); r.readAsDataURL(f); } }} /></label>)}
                            </div>
                          </div>
                          <div className="white-card" style={{ padding: '20px' }}>
                            <div className="card-title">Organization</div>
                            <div className="login-input-group" style={{ marginTop: '15px' }}><label>Category</label><select className="admin-input" value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})}><option>Technology</option><option>Design</option><option>Business</option><option>AI</option></select></div>
                            <div className="login-input-group" style={{ marginBottom: 0 }}>
                              <label>Tags</label>
                              <div style={{ padding: '8px', border: '1px solid #e8e0d5', borderRadius: '12px', background: 'white', minHeight: '45px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                {(typeof blogForm.tags === 'string' && blogForm.tags ? blogForm.tags.split(',') : (Array.isArray(blogForm.tags) ? blogForm.tags : [])).map(t => typeof t === 'string' ? t.trim() : '').filter(t => t).map((t, i) => (
                                  <div key={i} style={{ background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {t}
                                    <X size={12} style={{ cursor: 'pointer', color: '#888' }} onClick={() => {
                                      const currentTags = (typeof blogForm.tags === 'string' ? blogForm.tags.split(',') : (Array.isArray(blogForm.tags) ? blogForm.tags : [])).map(tag => typeof tag === 'string' ? tag.trim() : '').filter(tag => tag);
                                      setBlogForm({...blogForm, tags: currentTags.filter(tag => tag !== t).join(', ')});
                                    }} />
                                  </div>
                                ))}
                                <input 
                                  type="text" 
                                  placeholder="Add tag..." 
                                  style={{ border: 'none', outline: 'none', background: 'transparent', flexGrow: 1, minWidth: '80px', fontSize: '0.9rem' }} 
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                      e.preventDefault();
                                      const val = e.target.value.trim();
                                      if (val) {
                                        const currentTags = (typeof blogForm.tags === 'string' && blogForm.tags ? blogForm.tags.split(',') : (Array.isArray(blogForm.tags) ? blogForm.tags : [])).map(t => typeof t === 'string' ? t.trim() : '').filter(t => t);
                                        if (!currentTags.includes(val)) {
                                          setBlogForm({...blogForm, tags: [...currentTags, val].join(', ')});
                                        }
                                        e.target.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                              
                              {tags && tags.length > 0 && (
                                <div style={{ marginTop: '10px' }}>
                                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>Available Tags:</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {tags.filter(t => {
                                      const currentTags = (typeof blogForm.tags === 'string' && blogForm.tags ? blogForm.tags.split(',') : (Array.isArray(blogForm.tags) ? blogForm.tags : [])).map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '');
                                      return t.name && !currentTags.includes(t.name.toLowerCase());
                                    }).map(t => (
                                      <div 
                                        key={t._id} 
                                        onClick={() => {
                                          const currentTags = (typeof blogForm.tags === 'string' && blogForm.tags ? blogForm.tags.split(',') : (Array.isArray(blogForm.tags) ? blogForm.tags : [])).map(tag => typeof tag === 'string' ? tag.trim() : '').filter(tag => tag);
                                          setBlogForm({...blogForm, tags: [...currentTags, t.name].join(', ')});
                                        }}
                                        style={{ background: '#fcf8f4', border: '1px solid #eee', padding: '3px 10px', borderRadius: '15px', fontSize: '0.75rem', cursor: 'pointer', color: '#b35a00', transition: '0.2s' }}
                                      >
                                        + {t.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '15px', flexGrow: 1 }}>
                        <div style={{ position: 'relative', flexGrow: 1 }}>
                          <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={18} />
                          <input type="text" placeholder="Search posts..." className="admin-input" style={{ paddingLeft: '45px', marginBottom: '0' }} value={blogSearch} onChange={e => setBlogSearch(e.target.value)} />
                        </div>
                        <select className="admin-input" style={{ width: '180px', marginBottom: 0 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                          <option value="All">All Status</option>
                          <option value="Published">Published</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleDeleteAll} className="btn-primary" style={{ background: '#ef4444', color: 'white', padding: '10px 25px', borderRadius: '15px', marginLeft: '20px' }}><Trash2 size={18} /> Delete All</button>
                        <button onClick={() => { setBlogForm({ title: '', slug: '', category: 'Technology', content: '', image: '', altText: '', tags: '', focusKeyword: '', seoTitle: '', seoDescription: '', status: 'published', isFeatured: false }); if(editorRef.current) editorRef.current.innerHTML = ''; setShowAddBlog(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Post</button>
                      </div>
                    </div>
                    <div className="white-card" style={{ padding: '0', overflow: 'visible' }}>
                      <table className="admin-table">
                        <thead>
                          <tr><th>Title</th><th>Category</th><th>Status</th><th>Date & Views</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {filteredBlogs.map(b => (
                            <tr key={b._id}>
                              <td>{b.title}</td>
                              <td>{b.category}</td>
                              <td><span className={`status-pill ${b.status === 'published' ? 'status-published' : 'status-draft'}`}>{b.status}</span></td>
                              <td>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                                <div style={{ fontSize: '0.75rem', color: '#b35a00', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                                  <Eye size={12} /> {b.views || 0}
                                </div>
                              </td>
                              <td style={{ position: 'relative' }}>
                                <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === b._id ? null : b._id); }} className="action-menu-btn">
                                  <MoreHorizontal size={18} />
                                </button>
                                <AnimatePresence>
                                  {menuOpenId === b._id && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="action-dropdown">
                                      <button onClick={() => window.open(`${window.location.origin}/blog/${b.slug}`, '_blank')}><Eye size={14} /> View</button>
                                      <button onClick={() => handleEditBlog(b)}><Edit2 size={14} /> Edit</button>
                                      <button onClick={() => handleDeleteBlog(b._id)} style={{ color: '#ef4444' }}><Trash2 size={14} /> Delete</button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {activeTab === 'Dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Main Stats Grid */}
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <StatCard label="Total Blogs" value={blogs.length} icon={FileText} color="#b35a00" bg="#fcf8f4" />
                <StatCard label="Projects" value={projects.length} icon={Zap} color="#3b82f6" bg="#eff6ff" />
                <StatCard label="Categories" value={categories.length} icon={FolderTree} color="#16a34a" bg="#f0fdf4" />
                <StatCard label="Tags" value={tags.length} icon={Tag} color="#8b5cf6" bg="#f5f3ff" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
                {/* Recent Activity Section */}
                <div className="white-card" style={{ padding: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="card-title" style={{ margin: 0 }}>Recent Blog Posts</div>
                    <button onClick={() => setActiveTab('Blogs')} style={{ fontSize: '0.8rem', color: '#b35a00', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer' }}>View All →</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {blogs.slice(0, 5).map((blog, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: '#f9f9f9', borderRadius: '15px', border: '1px solid #eee' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b35a00' }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#222' }}>{blog.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#b35a00', fontWeight: '700' }}>
                              <Eye size={12} /> {blog.views || 0}
                            </span>
                          </div>
                        </div>
                        <span className={`status-pill ${blog.status === 'published' ? 'status-published' : 'status-draft'}`} style={{ fontSize: '0.65rem' }}>{blog.status}</span>
                      </div>
                    ))}
                    {blogs.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No posts yet. Start writing!</div>}
                  </div>
                </div>

                {/* Performance & Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {/* SEO Performance Card */}
                  <div className="white-card" style={{ padding: '25px', background: '#b35a00', color: 'white' }}>
                    <div style={{ fontWeight: '800', marginBottom: '15px', fontSize: '0.9rem', opacity: 0.9 }}>Average SEO Score</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ fontSize: '3.5rem', fontWeight: '900' }}>
                        {avgSeoScore}%
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>
                        Your content is performing well. Optimization is key to ranking.
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="white-card" style={{ padding: '25px' }}>
                    <div className="card-title">Quick Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                      <button onClick={() => { setActiveTab('Blogs'); setShowAddBlog(true); }} className="admin-btn-secondary" style={{ flexDirection: 'column', padding: '15px', gap: '8px', height: 'auto', textAlign: 'center' }}>
                        <Plus size={20} color="#b35a00" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>New Blog</span>
                      </button>
                      <button onClick={() => { setActiveTab('Projects'); setShowAddProject(true); }} className="admin-btn-secondary" style={{ flexDirection: 'column', padding: '15px', gap: '8px', height: 'auto', textAlign: 'center' }}>
                        <Zap size={20} color="#3b82f6" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>New Project</span>
                      </button>
                      <button onClick={() => setActiveTab('Categories')} className="admin-btn-secondary" style={{ flexDirection: 'column', padding: '15px', gap: '8px', height: 'auto', textAlign: 'center' }}>
                        <FolderTree size={20} color="#16a34a" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>Categories</span>
                      </button>
                      <button onClick={() => setActiveTab('AI Assistant')} className="admin-btn-secondary" style={{ flexDirection: 'column', padding: '15px', gap: '8px', height: 'auto', textAlign: 'center' }}>
                        <Sparkles size={20} color="#8b5cf6" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>AI Writer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="settings-container">
              <div className="white-card settings-card">
                <div className="card-title">Admin Profile Settings</div>
                <form onSubmit={handleSaveSettings} className="settings-form">
                  <div className="profile-upload-section">
                    <div className="profile-img-preview">
                      <img src={settingsForm.photo} alt="Profile" />
                      <label className="upload-overlay">
                        <Upload size={20} />
                        <input type="file" hidden accept="image/*" onChange={handleProfilePhotoUpload} />
                      </label>
                    </div>
                    <div className="upload-info">
                      <h3>Profile Photo</h3>
                      <p>Update your avatar for the admin panel</p>
                    </div>
                  </div>

                  <div className="settings-grid">
                    <div className="login-input-group">
                      <label><User size={16} /> Full Name</label>
                      <input 
                        type="text" 
                        value={settingsForm.name} 
                        onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="login-input-group">
                      <label><Briefcase size={16} /> Company Name</label>
                      <input 
                        type="text" 
                        value={settingsForm.company} 
                        onChange={e => setSettingsForm({...settingsForm, company: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="login-input-group">
                      <label><Mail size={16} /> Email Address</label>
                      <input 
                        type="email" 
                        value={settingsForm.email} 
                        onChange={e => setSettingsForm({...settingsForm, email: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="login-input-group">
                      <label><Lock size={16} /> Password</label>
                      <input 
                        type="password" 
                        value={settingsForm.password} 
                        onChange={e => setSettingsForm({...settingsForm, password: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="settings-footer">
                    <button type="submit" className="save-settings-btn">
                      <Save size={18} /> Save Profile Changes
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '1px solid #f0e6da' }}>
                  <div className="card-title">Contact & Portfolio Settings</div>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '25px' }}>These details will be displayed in your portfolio's contact section and footer.</p>
                  
                  <div className="settings-grid">
                    <div className="login-input-group" style={{ gridColumn: 'span 2' }}>
                      <label><Image size={16} /> Hero Profile Image</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: '#fcf8f4', padding: '15px', borderRadius: '15px', border: '1px solid #e8e0d5', marginTop: '5px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '15px', overflow: 'hidden', background: 'white', border: '1px solid #eee' }}>
                          <img src={settings.heroImage || "/my.png"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Hero Preview" />
                        </div>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px', wordBreak: 'break-all', opacity: 0.7 }}>
                            {settings.heroImage ? 'Custom image is active' : 'Default image is active'}
                          </div>
                          <button onClick={() => { setMediaPickerCallback(() => (url) => { setSettings(prev => ({...prev, heroImage: url})); handleUpdateSetting('heroImage', url); }); setShowMediaPicker(true); }} className="admin-btn-secondary" style={{ background: '#b35a00', color: 'white', border: 'none', padding: '8px 15px' }}><Image size={16} /> Change Hero Photo</button>
                        </div>
                      </div>
                    </div>
                    <div className="login-input-group">
                      <label><Mail size={16} /> Contact Email</label>
                      <input 
                        type="email" 
                        value={settings.contactEmail || ''} 
                        onChange={e => setSettings({...settings, contactEmail: e.target.value})} 
                        onBlur={() => handleUpdateSetting('contactEmail', settings.contactEmail)}
                      />
                    </div>
                    <div className="login-input-group">
                      <label><Phone size={16} /> Contact Phone</label>
                      <input 
                        type="text" 
                        value={settings.contactPhone || ''} 
                        onChange={e => setSettings({...settings, contactPhone: e.target.value})} 
                        onBlur={() => handleUpdateSetting('contactPhone', settings.contactPhone)}
                      />
                    </div>
                    <div className="login-input-group">
                      <label><MessageSquare size={16} /> WhatsApp Number (e.g. +947XXXXXXXX)</label>
                      <input 
                        type="text" 
                        placeholder="+947XXXXXXXX"
                        value={settings.contactWhatsapp || ''} 
                        onChange={e => setSettings({...settings, contactWhatsapp: e.target.value})} 
                        onBlur={() => handleUpdateSetting('contactWhatsapp', settings.contactWhatsapp)}
                      />
                    </div>
                    <div className="login-input-group">
                      <label><ExternalLink size={16} /> WhatsApp Group / Community URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="https://chat.whatsapp.com/..."
                        value={settings.whatsappGroupUrl || ''} 
                        onChange={e => setSettings({...settings, whatsappGroupUrl: e.target.value})} 
                        onBlur={() => handleUpdateSetting('whatsappGroupUrl', settings.whatsappGroupUrl)}
                      />
                    </div>
                    <div className="login-input-group">
                      <label><MapPin size={16} /> Contact Location</label>
                      <input 
                        type="text" 
                        value={settings.contactLocation || ''} 
                        onChange={e => setSettings({...settings, contactLocation: e.target.value})} 
                        onBlur={() => handleUpdateSetting('contactLocation', settings.contactLocation)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Analytics' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="analytics-container">
              <div className="admin-header-flex">
                <div>
                  <h1>Analytics & Insights</h1>
                  <p>Track your blog performance and visitor engagement</p>
                </div>
              </div>

              <div className="admin-stats-grid" style={{ marginBottom: '30px' }}>
                <StatCard 
                  label="Total Blog Views" 
                  value={blogs.reduce((acc, b) => acc + (b.views || 0), 0).toLocaleString()} 
                  icon={Eye} 
                  color="#b35a00" 
                  bg="#fef3c7" 
                />
                <StatCard 
                  label="Total Articles" 
                  value={blogs.length} 
                  icon={FileText} 
                  color="#2563eb" 
                  bg="#dbeafe" 
                />
                <StatCard 
                  label="Contact Inquiries" 
                  value={messages.length} 
                  icon={Mail} 
                  color="#16a34a" 
                  bg="#dcfce7" 
                />
                <StatCard 
                  label="Avg Views / Post" 
                  value={blogs.length > 0 ? Math.round(blogs.reduce((acc, b) => acc + (b.views || 0), 0) / blogs.length) : 0} 
                  icon={BarChart2} 
                  color="#8b5cf6" 
                  bg="#f3e8ff" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                {/* Top Posts Table */}
                <div className="white-card" style={{ padding: '25px' }}>
                  <div className="card-title">Top Performing Articles</div>
                  <div className="admin-table-wrapper" style={{ marginTop: '20px' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Post Title</th>
                          <th>Category</th>
                          <th style={{ textAlign: 'right' }}>Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs
                          .sort((a, b) => (b.views || 0) - (a.views || 0))
                          .slice(0, 5)
                          .map(post => (
                            <tr key={post._id}>
                              <td style={{ fontWeight: '600' }}>{post.title}</td>
                              <td><span className="category-badge">{post.category}</span></td>
                              <td style={{ textAlign: 'right', fontWeight: '800', color: '#b35a00' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                                  <Eye size={14} /> {post.views || 0}
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="white-card" style={{ padding: '25px' }}>
                  <div className="card-title">Content Distribution</div>
                  <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.entries(
                      blogs.reduce((acc, b) => {
                        acc[b.category] = (acc[b.category] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([cat, count]) => {
                      const percentage = Math.round((count / blogs.length) * 100);
                      return (
                        <div key={cat}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '600' }}>{cat}</span>
                            <span style={{ opacity: 0.7 }}>{count} posts ({percentage}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#f5f5f5', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #b35a00, #ff8c00)', borderRadius: '10px' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Inbox' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="blogs-container">
              <div className="admin-header-flex">
                <div>
                  <h1>Inbox</h1>
                  <p>Messages received from your portfolio contact form</p>
                </div>
                <button onClick={fetchMessages} className="admin-btn-secondary">
                  <RotateCcw size={18} /> Refresh
                </button>
              </div>

              <div className="white-card" style={{ padding: '0', overflow: 'visible' }}>
                <div className="admin-table-wrapper" style={{ overflow: 'visible' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Sender</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length > 0 ? messages.map((msg) => (
                        <tr key={msg._id}>
                          <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{msg.name}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{msg.email}</div>
                          </td>
                          <td style={{ fontWeight: '600' }}>{msg.subject}</td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {msg.message}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => showPrompt(`Message from ${msg.name}`, msg.message, () => {})} 
                                className="action-btn view" 
                                title="Read Full Message"
                              >
                                <Eye size={16} />
                              </button>
                              <a href={`mailto:${msg.email}`} className="action-btn edit" title="Reply">
                                <Send size={16} />
                              </a>
                              <button onClick={() => handleDeleteMessage(msg._id)} className="action-btn delete" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '50px', opacity: 0.5 }}>
                            No messages in your inbox yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'AI Assistant' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ai-assistant-container">
              <div className="ai-header">
                <h1>AI Assistant</h1>
                <p>AI-powered tools for content creation and optimization</p>
              </div>

              <div className="ai-tabs">
                {['Auto Generate & Post', 'Blog Writer', 'SEO Optimizer', 'Trending Topics', 'Settings'].map(tab => (
                  <button 
                    key={tab} 
                    className={`ai-tab-btn ${aiTab === tab ? 'active' : ''}`}
                    onClick={() => setAiTab(tab)}
                  >
                    {tab === 'Auto Generate & Post' && <Zap size={16} />}
                    {tab === 'Blog Writer' && <FileText size={16} />}
                    {tab === 'SEO Optimizer' && <Search size={16} />}
                    {tab === 'Trending Topics' && <TrendingUp size={16} />}
                    {tab === 'Settings' && <Settings size={16} />}
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {aiTab === 'Settings' && (
                  <motion.div key="ai-settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="white-card" style={{ padding: '35px' }}>
                      <div className="card-header-ai">
                        <div style={{ width: '50px', height: '50px', background: '#f5f0e9', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShieldCheck size={24} color="#b35a00" />
                        </div>
                        <div>
                          <h3>AI API Configuration</h3>
                          <p>Connect your Gemini API key to enable AI features</p>
                        </div>
                      </div>

                      <div className="ai-form" style={{ maxWidth: '600px' }}>
                        <div className="login-input-group">
                          <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Gemini API Key
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#b35a00', textDecoration: 'none' }}>Get FREE API Key →</a>
                          </label>
                          <input 
                            type="password" 
                            className="admin-input" 
                            placeholder="Enter your Google Gemini API Key"
                            value={aiSettings.geminiApiKey}
                            onChange={(e) => setAiSettings({...aiSettings, geminiApiKey: e.target.value})}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="login-input-group">
                            <label>Default Tone</label>
                            <select 
                              className="admin-input"
                              value={aiSettings.defaultTone}
                              onChange={(e) => setAiSettings({...aiSettings, defaultTone: e.target.value})}
                            >
                              <option>Professional</option>
                              <option>Creative</option>
                              <option>Friendly</option>
                              <option>Informative</option>
                            </select>
                          </div>
                          <div className="login-input-group">
                            <label>Preferred Model</label>
                            <select 
                              className="admin-input"
                              value={aiSettings.aiModel}
                              onChange={(e) => setAiSettings({...aiSettings, aiModel: e.target.value})}
                            >
                              <option value="gemini-3.5-flash">gemini-3.5-flash (Fast)</option>
                              <option value="gemini-3.6-flash">gemini-3.6-flash (Smart)</option>
                              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Lite)</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          className="generate-btn-ai" 
                          style={{ marginTop: '10px', marginBottom: '30px' }}
                          onClick={() => handleUpdateAiSettings(aiSettings)}
                        >
                          <Save size={18} /> Save AI Configuration
                        </button>

                        <div className="card-header-ai" style={{ marginTop: '20px' }}>
                          <div style={{ width: '50px', height: '50px', background: '#e7f3ff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={24} color="#1877f2" />
                          </div>
                          <div>
                            <h3>Facebook Auto-Post</h3>
                            <p>Automatically share your blog posts to your Facebook Page</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                          <div className="login-input-group">
                            <label>Facebook Page ID</label>
                            <input 
                              type="text" 
                              className="admin-input" 
                              placeholder="e.g., 1029384756"
                              value={aiSettings.fbPageId || ''}
                              onChange={(e) => setAiSettings({...aiSettings, fbPageId: e.target.value})}
                            />
                          </div>
                          <div className="login-input-group">
                            <label>Facebook Page Access Token</label>
                            <input 
                              type="password" 
                              className="admin-input" 
                              placeholder="Enter Page Access Token"
                              value={aiSettings.fbAccessToken || ''}
                              onChange={(e) => setAiSettings({...aiSettings, fbAccessToken: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="ai-switch-row" style={{ marginTop: '10px' }}>
                          <div>
                            <div style={{ fontWeight: '700' }}>Enable FB Auto-Post</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Share link automatically when blog is published</div>
                          </div>
                          <label className="switch">
                            <input type="checkbox" checked={aiSettings.fbEnabled || false} onChange={e => setAiSettings({...aiSettings, fbEnabled: e.target.checked})} />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiTab === 'SEO Optimizer' && (
                  <motion.div key="seo-opt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="ai-content-grid">
                      <div className="white-card ai-form-card">
                        <div className="card-header-ai">
                          <Search size={20} color="#b35a00" />
                          <div>
                            <h3>SEO Content Optimizer</h3>
                            <p>Analyze your content and get AI suggestions to rank higher on Google</p>
                          </div>
                        </div>
                        <div className="ai-form">
                          <div className="login-input-group">
                            <label>Target Keyword</label>
                            <input type="text" placeholder="e.g., React Tutorial" id="seo-keyword" />
                          </div>
                          <div className="login-input-group">
                            <label>Content to Analyze</label>
                            <textarea 
                              placeholder="Paste your article content here..." 
                              style={{ width: '100%', height: '250px', padding: '15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', resize: 'none' }}
                              id="seo-content"
                            ></textarea>
                          </div>
                          <button className="generate-btn-ai" onClick={() => {
                            const kw = document.getElementById('seo-keyword').value;
                            const ct = document.getElementById('seo-content').value;
                            handleOptimizeSEO(kw, ct);
                          }}>
                            {isGenerating ? <div className="loader-ai"></div> : <><Sparkles size={18} /> Analyze Content</>}
                          </button>
                        </div>
                      </div>

                      <div className="white-card ai-preview-card">
                        {generatedPreview?.seoAnalysis ? (
                          <div className="seo-analysis-result">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                              <h3 style={{ margin: 0 }}>SEO Score</h3>
                              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '5px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#16a34a' }}>
                                {generatedPreview.seoAnalysis.score}%
                              </div>
                            </div>
                            <div className="seo-tips">
                              <h4 style={{ marginBottom: '10px' }}>Suggestions for Improvement:</h4>
                              <ul style={{ paddingLeft: '20px' }}>
                                {generatedPreview.seoAnalysis.suggestions.map((s, i) => (
                                  <li key={i} style={{ marginBottom: '8px', color: '#555' }}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="seo-preview-box" style={{ marginTop: '20px', background: '#f0fdf4', padding: '15px', borderRadius: '12px' }}>
                              <div style={{ color: '#16a34a', fontWeight: '700', marginBottom: '5px' }}>Optimized Meta Description:</div>
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>{generatedPreview.seoAnalysis.metaSuggestion}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="ai-preview-empty">
                            <BarChart2 size={48} color="#ddd" />
                            <h3>Paste your content to get an instant SEO audit</h3>
                            <p>We check keyword density, readability, and meta tags</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiTab === 'Blog Writer' && (
                  <motion.div key="blog-writer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="white-card" style={{ padding: '30px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                      <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                        <FileText size={24} color="#b35a00" />
                        <div>
                          <h3>Interactive AI Writer</h3>
                          <p>Write your articles manually and use AI to expand, rewrite, or fix grammar</p>
                        </div>
                      </div>
                      <div className="ai-preview-empty" style={{ flexGrow: 1, border: '2px dashed #eee', borderRadius: '20px' }}>
                        <div style={{ padding: '20px', background: '#fcf8f4', borderRadius: '50%', marginBottom: '20px' }}>
                          <PenTool size={32} color="#b35a00" />
                        </div>
                        <h3>Interactive Editor is Coming Soon!</h3>
                        <p style={{ maxWidth: '400px', margin: '0 auto', color: '#666' }}>We are currently building a Notion-style interactive AI editor where you can type '/ai' to generate paragraphs, rewrite sentences, and collaborate with Gemini AI in real-time.</p>
                        <button className="admin-btn-secondary" style={{ marginTop: '20px' }} onClick={() => setAiTab('Auto Generate & Post')}>
                          Use Auto Generate For Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiTab === 'Trending Topics' && (
                  <motion.div key="trending" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="white-card" style={{ padding: '30px' }}>
                      <div className="card-header-ai" style={{ marginBottom: '30px' }}>
                        <TrendingUp size={24} color="#b35a00" />
                        <div>
                          <h3>Hot Trending Topics</h3>
                          <p>AI-discovered trending tech topics to write about today</p>
                        </div>
                      </div>
                      
                      <button 
                        className="generate-btn-ai" 
                        style={{ width: 'auto', padding: '12px 30px', marginBottom: '30px' }}
                        onClick={handleFetchTrending}
                        disabled={isGenerating}
                      >
                        {isGenerating ? <div className="loader-ai"></div> : <><RotateCcw size={18} /> Refresh Trends</>}
                      </button>

                      <div className="trending-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {generatedPreview?.trendingTopics ? generatedPreview.trendingTopics.map((topic, i) => (
                          <div key={i} className="trending-card" style={{ padding: '20px', borderRadius: '20px', background: '#f9f9f9', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#b35a00', background: '#fff3e0', padding: '4px 10px', borderRadius: '20px' }}>{topic.category}</span>
                              <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '700' }}><TrendingUp size={14} /> {topic.growth}</span>
                            </div>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{topic.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>{topic.description}</p>
                            <button 
                              className="admin-btn-secondary" 
                              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', background: '#b35a00', color: 'white', border: 'none' }}
                              onClick={() => handleOneClickPost(topic.title)}
                            >
                              <Sparkles size={14} /> 1-Click Generate & Publish
                            </button>
                          </div>
                        )) : (
                          <div style={{ gridColumn: '1/ -1', textAlign: 'center', padding: '50px', color: '#999' }}>
                            <Globe size={48} opacity={0.2} style={{ marginBottom: '15px' }} />
                            <p>Click refresh to see latest tech trends</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {aiTab === 'Auto Generate & Post' && (
                  <div key="auto-gen" className="ai-content-grid">
                <div className="white-card ai-form-card">
                  <div className="card-header-ai">
                    <Zap size={20} color="#b35a00" />
                    <div>
                      <h3>Auto Generate & Post</h3>
                      <p>AI generates complete blog post with images, tags, SEO - saves to database automatically</p>
                    </div>
                  </div>

                  <div className="ai-form">
                    <div className="login-input-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Topic / Title <span style={{ color: '#888', fontSize: '0.8em', fontWeight: 'normal' }}>(Optional)</span></span>
                        <button type="button" onClick={() => { setAiForm({...aiForm, topic: '', keywords: ''}); handleGenerateAI(); }} style={{ background: '#f5f0e9', border: 'none', color: '#b35a00', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> Surprise Me
                        </button>
                      </label>
                      <input 
                        type="text" 
                        placeholder="Leave blank to auto-generate a trending topic..."
                        value={aiForm.topic}
                        onChange={e => setAiForm({...aiForm, topic: e.target.value})}
                      />
                    </div>
                    <div className="login-input-group">
                      <label>Target Keywords</label>
                      <input 
                        type="text" 
                        placeholder="e.g., nodejs, rest api, backend development"
                        value={aiForm.keywords}
                        onChange={e => setAiForm({...aiForm, keywords: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="login-input-group">
                        <label>Tone</label>
                        <select value={aiForm.tone} onChange={e => setAiForm({...aiForm, tone: e.target.value})}>
                          <option>Professional</option>
                          <option>Conversational</option>
                          <option>Technical</option>
                        </select>
                      </div>
                      <div className="login-input-group">
                        <label>Word Count</label>
                        <select value={aiForm.wordCount} onChange={e => setAiForm({...aiForm, wordCount: e.target.value})}>
                          <option>~1500 words</option>
                          <option>~1000 words</option>
                          <option>~500 words</option>
                        </select>
                      </div>
                    </div>
                    <div className="login-input-group">
                      <label>Category</label>
                      <select value={aiForm.category} onChange={e => setAiForm({...aiForm, category: e.target.value})}>
                        <option>Technology</option>
                        <option>Design</option>
                        <option>Business</option>
                        <option>AI</option>
                      </select>
                    </div>

                    <div className="ai-switch-row">
                      <div>
                        <div style={{ fontWeight: '700' }}>Auto Publish</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{aiForm.autoPublish ? 'Post will be live immediately' : 'Post will be saved as draft'}</div>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked={aiForm.autoPublish} onChange={e => setAiForm({...aiForm, autoPublish: e.target.checked})} />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <button 
                      className="generate-btn-ai" 
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <div className="loader-ai"></div>
                      ) : (
                        <><Sparkles size={18} /> Generate & Save Blog Post</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="white-card ai-preview-card">
                  {isGenerating ? (
                    <div className="ai-preview-empty">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                        <Sparkles size={48} color="#b35a00" opacity={0.5} />
                      </motion.div>
                      <h3>AI is writing your article...</h3>
                      <p>This usually takes 10-20 seconds. We are researching the topic and optimizing for SEO.</p>
                    </div>
                  ) : generatedPreview ? (
                    <div className="ai-preview-result">
                      <div className="preview-badge">Preview Generated</div>
                      <h2>{generatedPreview.title}</h2>
                      <div className="preview-meta">
                        <span><Globe size={14} /> {generatedPreview.slug}</span>
                        <span><Tag size={14} /> {generatedPreview.category}</span>
                      </div>
                      <div 
                        className="preview-content-ai" 
                        dangerouslySetInnerHTML={{ __html: generatedPreview.content.substring(0, 500) + '...' }}
                      />
                      <div className="preview-seo-box">
                        <h4>SEO Data</h4>
                        <div className="seo-preview-grid">
                          <div><strong>Title:</strong> {generatedPreview.seo.metaTitle}</div>
                          <div><strong>Keywords:</strong> {generatedPreview.seo.keywords.join(', ')}</div>
                        </div>
                      </div>
                      <div className="card-title" style={{ fontSize: '0.85rem' }}>Cover Image</div>
                      <div 
                        onClick={() => {
                          const callback = (url) => setGeneratedPreview(prev => ({ ...prev, image: url }));
                          setMediaPickerCallback(() => callback);
                          setShowMediaPicker(true);
                        }}
                        style={{ cursor: 'pointer', position: 'relative', height: '150px', background: '#f9f9f9', borderRadius: '15px', overflow: 'hidden', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}
                      >
                        {generatedPreview.image ? (
                          <img src={generatedPreview.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#888' }}><Upload size={24} /> <div>Add Cover Image</div></div>
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }} className="hover-overlay">Change Image</div>
                      </div>

                      <button className="preview-save-btn" onClick={handleSaveGeneratedBlog}>
                        <Check size={18} /> Approve & Save to Database
                      </button>
                    </div>
                  ) : (
                    <div className="ai-preview-empty">
                      <Sparkles size={48} color="#ddd" />
                      <h3>Enter a topic and click generate to create a complete blog post automatically</h3>
                      <p>AI will generate content, find images, set tags & SEO</p>
                    </div>
                  )}
                </div>
                </div>
              )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'Projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnimatePresence>
                {showAddProject ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                    <div className="white-card" style={{ padding: '30px' }}>
                      <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                        <Zap size={20} color="#b35a00" />
                        <div>
                          <h3>{projectForm._id ? 'Edit Project' : 'Add New Project'}</h3>
                          <p>Design and showcase your work in the portfolio</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div className="login-input-group"><label>Project Title</label><input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} /></div>
                          <div className="login-input-group"><label>Category</label><select className="admin-input" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})}><option>Web App</option><option>Mobile App</option><option>AI/ML</option><option>Design</option></select></div>
                          <div className="login-input-group">
                            <label>Live Preview Link</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                type="text" 
                                value={projectForm.liveLink} 
                                onChange={e => setProjectForm({...projectForm, liveLink: e.target.value})} 
                                style={{ flexGrow: 1 }}
                                placeholder="https://... or select local"
                              />
                              <button 
                                type="button" 
                                onClick={() => setShowTemplatePicker(true)} 
                                className="admin-btn-secondary"
                                style={{ padding: '0 15px', height: '45px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                              >
                                <FolderTree size={16} /> Select Template
                              </button>
                            </div>
                          </div>
                          <div className="login-input-group"><label>Github Link</label><input type="text" value={projectForm.githubLink} onChange={e => setProjectForm({...projectForm, githubLink: e.target.value})} /></div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
                            <div>
                              <div style={{ fontWeight: '700' }}>For Sale?</div>
                              <div style={{ fontSize: '0.75rem', color: '#888' }}>Allow users to buy this project</div>
                            </div>
                            <label className="switch">
                              <input type="checkbox" checked={projectForm.isForSale} onChange={e => setProjectForm({...projectForm, isForSale: e.target.checked})} />
                              <span className="slider round"></span>
                            </label>
                          </div>
                          {projectForm.isForSale && (
                            <div className="login-input-group"><label>Price ($)</label><input type="number" min="0" value={projectForm.price} onChange={e => setProjectForm({...projectForm, price: Number(e.target.value)})} /></div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div className="login-input-group"><label>Description</label><textarea rows="4" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                          <div className="login-input-group"><label>Technologies (comma separated)</label><input type="text" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} placeholder="React, Node.js, etc." /></div>
                          <div className="card-title" style={{ fontSize: '0.85rem' }}>Project Image</div>
                          <div style={{ position: 'relative', height: '120px', background: '#f9f9f9', borderRadius: '15px', border: '2px dashed #e8e0d5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {projectForm.image ? (<><img src={projectForm.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /><button onClick={() => setProjectForm({...projectForm, image: ''})} style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', padding: '3px' }}><X size={12} /></button></>) : (<label style={{ cursor: 'pointer', textAlign: 'center', color: '#888' }}><Upload size={24} /> <div>Upload</div><input type="file" hidden onChange={e => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onloadend = () => setProjectForm({...projectForm, image: r.result}); r.readAsDataURL(f); } }} /></label>)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                        <button onClick={() => setShowAddProject(false)} className="btn-secondary" style={{ background: '#eee', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                        <button onClick={handleSaveProject} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '15px' }}>{projectForm._id ? 'Update Project' : 'Save Project'}</button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontWeight: '800' }}>Manage Projects</h2>
                      <button onClick={() => { setProjectForm({ title: '', category: 'Web App', description: '', image: '', liveLink: '', githubLink: '', technologies: '', isFeatured: false, isForSale: false, price: 0 }); setShowAddProject(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Project</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                      {(Array.isArray(projects) ? projects : []).map(p => (
                        <div key={p._id} className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
                          <img src={p.image || 'https://via.placeholder.com/400x200'} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                          <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#b35a00', fontWeight: '800', textTransform: 'uppercase', marginBottom: '5px' }}>{p.category}</div>
                            <h3 style={{ fontWeight: '800', marginBottom: '10px' }}>{p.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5', marginBottom: '15px', height: '40px', overflow: 'hidden' }}>{p.description}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px' }}>
                              {(Array.isArray(p.technologies) ? p.technologies : (typeof p.technologies === 'string' ? p.technologies.split(',') : [])).filter(t => t && String(t).trim()).map((t, i) => <span key={i} style={{ padding: '4px 10px', background: '#f5f5f5', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>{String(t).trim()}</span>)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                              <button onClick={() => handleEditProject(p)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteProject(p._id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'Categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontWeight: '800' }}>Manage Categories</h2>
                <button onClick={() => { setCategoryForm({ name: '', slug: '', description: '' }); setShowAddCategory(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Category</button>
              </div>
              
              {showAddCategory ? (
                <div className="white-card" style={{ padding: '30px', marginBottom: '25px' }}>
                  <div className="card-title">{categoryForm._id ? 'Edit Category' : 'Add New Category'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div className="login-input-group"><label>Name</label><input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} /></div>
                    <div className="login-input-group"><label>Slug</label><input type="text" value={categoryForm.slug} onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})} /></div>
                    <div className="login-input-group" style={{ gridColumn: 'span 2' }}><label>Description</label><textarea rows="3" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => setShowAddCategory(false)} className="btn-secondary" style={{ padding: '10px 25px', borderRadius: '12px' }}>Cancel</button>
                    <button onClick={async () => {
                      try {
                        if (categoryForm._id) await axios.put(`/api/categories/${categoryForm._id}`, categoryForm);
                        else await axios.post('/api/categories', categoryForm);
                        showAlert('Category Saved!'); setShowAddCategory(false); fetchData();
                      } catch (err) { showAlert('Failed to save!', 'error'); }
                    }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 30px', borderRadius: '12px' }}>Save Category</button>
                  </div>
                </div>
              ) : null}

              <div className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Posts</th><th>Action</th></tr></thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td><code>{c.slug}</code></td>
                        <td>{c.description || '-'}</td>
                        <td>{c.count || 0}</td>
                        <td style={{ display: 'flex', gap: '10px' }}>
                          <button onClick={() => { setCategoryForm(c); setShowAddCategory(true); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}><Edit2 size={14} /></button>
                          <button onClick={() => showConfirm('Delete this category?', async () => { try { await axios.delete(`/api/categories/${c._id}`); showAlert('Deleted!'); fetchData(); } catch (err) { showAlert('Failed!', 'error'); } })} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'Tags' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontWeight: '800' }}>Manage Tags</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setTagForm({ name: '', slug: '' }); setShowAddTag(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Tag</button>
                </div>
              </div>

              {showAddTag ? (
                <div className="white-card" style={{ padding: '30px', marginBottom: '25px' }}>
                  <div className="card-title">Add New Tag</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div className="login-input-group"><label>Tag Name</label><input type="text" value={tagForm.name} onChange={e => setTagForm({...tagForm, name: e.target.value})} /></div>
                    <div className="login-input-group"><label>Slug</label><input type="text" value={tagForm.slug} onChange={e => setTagForm({...tagForm, slug: e.target.value})} /></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={() => setShowAddTag(false)} className="btn-secondary" style={{ padding: '10px 25px', borderRadius: '12px' }}>Cancel</button>
                    <button onClick={async () => {
                      try {
                        await axios.post('/api/tags', tagForm);
                        showAlert('Tag Saved!'); setShowAddTag(false); fetchData();
                      } catch (err) { showAlert('Failed!', 'error'); }
                    }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 30px', borderRadius: '12px' }}>Save Tag</button>
                  </div>
                </div>
              ) : null}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {tags.map(t => (
                  <div key={t._id} className="white-card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '50px' }}>
                    <span style={{ fontWeight: '700' }}>#{t.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>{t.count || 0}</span>
                    <button onClick={() => showConfirm('Delete tag?', async () => { try { await axios.delete(`/api/tags/${t._id}`); showAlert('Deleted!'); fetchData(); } catch (err) { showAlert('Failed!', 'error'); } })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'SEO' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="ai-header" style={{ marginBottom: '30px' }}>
                <h1>SEO Management</h1>
                <p>Optimize your website for search engines and social media</p>
              </div>

              <div className="ai-tabs" style={{ marginBottom: '25px' }}>
                {['Global Settings', 'Post Analysis', 'Tools'].map(tab => (
                  <button key={tab} className={`ai-tab-btn ${seoTab === tab ? 'active' : ''}`} onClick={() => setSeoTab(tab)}>{tab}</button>
                ))}
              </div>

              {seoTab === 'Global Settings' && (
                <div className="white-card" style={{ padding: '35px' }}>
                  <div className="ai-form" style={{ maxWidth: '700px' }}>
                    <div className="login-input-group"><label>Site Title</label><input type="text" value={seoSettings.siteTitle} onChange={e => setSeoSettings({...seoSettings, siteTitle: e.target.value})} /></div>
                    <div className="login-input-group"><label>Meta Description</label><textarea rows="3" value={seoSettings.metaDescription} onChange={e => setSeoSettings({...seoSettings, metaDescription: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                    <div className="login-input-group"><label>Keywords (comma separated)</label><input type="text" value={seoSettings.keywords} onChange={e => setSeoSettings({...seoSettings, keywords: e.target.value})} /></div>
                    <div className="login-input-group"><label>Google Search Console ID</label><input type="text" value={seoSettings.googleConsoleId} onChange={e => setSeoSettings({...seoSettings, googleConsoleId: e.target.value})} /></div>
                    <button onClick={async () => {
                      try { await axios.post('/api/seo/settings', { value: seoSettings }); showAlert('SEO Settings Saved!'); }
                      catch (err) { showAlert('Failed!', 'error'); }
                    }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '12px', marginTop: '10px' }}><Save size={18} /> Save Settings</button>
                  </div>
                </div>
              )}

              {seoTab === 'Post Analysis' && (
                <div className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead><tr><th>Post Title</th><th>Status</th><th>SEO Score</th><th>Action</th></tr></thead>
                    <tbody>
                      {seoAnalysis.map(b => (
                        <tr key={b._id}>
                          <td>{b.title}</td>
                          <td><span className={`status-pill ${b.status === 'published' ? 'status-published' : 'status-draft'}`}>{b.status}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${b.seo?.seoScore || 0}%`, height: '100%', background: (b.seo?.seoScore || 0) > 80 ? '#16a34a' : (b.seo?.seoScore || 0) > 50 ? '#b35a00' : '#ef4444' }}></div>
                              </div>
                              <span style={{ fontWeight: '800', color: (b.seo?.seoScore || 0) > 80 ? '#16a34a' : (b.seo?.seoScore || 0) > 50 ? '#b35a00' : '#ef4444' }}>{b.seo?.seoScore || 0}%</span>
                            </div>
                          </td>
                          <td><button onClick={() => { setBlogForm(b); setActiveTab('Blogs'); setShowAddBlog(true); setEditorTab('SEO'); }} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', fontSize: '0.8rem', fontWeight: '700' }}>Optimize</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {seoTab === 'Tools' && (
                <div className="white-card" style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: '#fcf8f4', borderRadius: '20px', border: '1px solid #e8e0d5' }}>
                    <Globe size={40} color="#b35a00" />
                    <div>
                      <h3 style={{ margin: '0 0 5px 0' }}>XML Sitemap Generator</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Generate a sitemap to help search engines crawl your blog posts.</p>
                    </div>
                    <button onClick={() => window.open('/api/seo/sitemap', '_blank')} className="btn-primary" style={{ marginLeft: 'auto', background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '12px' }}>Generate & View</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'Web Content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="ai-tabs" style={{ marginBottom: '10px' }}>
                {['Stats', 'Testimonials', 'Skills', 'Services', 'Packages', 'Companies', 'General', 'Media'].map(tab => (
                  <button 
                    key={tab} 
                    className={`ai-tab-btn ${webContentTab === tab ? 'active' : ''}`}
                    onClick={() => setWebContentTab(tab)}
                  >
                    {tab === 'Stats' && <Activity size={16} />}
                    {tab === 'Testimonials' && <MessageSquare size={16} />}
                    {tab === 'Skills' && <Code size={16} />}
                    {tab === 'Services' && <LayoutGrid size={16} />}
                    {tab === 'Packages' && <CreditCard size={16} />}
                    {tab === 'Companies' && <Building2 size={16} />}
                    {tab === 'General' && <Settings size={16} />}
                    {tab === 'Media' && <Image size={16} />}
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {webContentTab === 'General' && (
                  <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="white-card" style={{ padding: '30px' }}>
                      <div className="card-header-ai" style={{ marginBottom: '25px' }}>
                        <Settings size={20} color="#b35a00" />
                        <div>
                          <h3>General Settings</h3>
                          <p>Manage global website assets and information</p>
                        </div>
                      </div>
                      
                      <div style={{ padding: '25px', background: '#fcf8f4', borderRadius: '20px', border: '1px solid #e8e0d5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <h4 style={{ fontWeight: '800', margin: 0 }}>Professional CV / Resume</h4>
                              {settings.cvUrl ? (
                                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: '800', padding: '3px 10px', borderRadius: '20px' }}>
                                  ✓ Uploaded: {settings.cvName || 'Resume.pdf'}
                                </span>
                              ) : (
                                <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>
                                  No CV Uploaded
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#666', margin: '6px 0 0 0' }}>Upload your latest PDF CV for the "Download CV" button on the portfolio.</p>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {settings.cvUrl && (
                              <>
                                <a 
                                  href="/api/cv/view" 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '12px', color: '#334155', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Eye size={15} /> View
                                </a>
                                <a 
                                  href="/api/cv/download" 
                                  style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '12px', color: '#334155', fontSize: '0.85rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                  Download
                                </a>
                                <button onClick={() => showConfirm('Delete current CV?', () => { handleUpdateSetting('cvUrl', ''); handleUpdateSetting('cvName', ''); })} style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </>
                            )}
                            <button 
                              onClick={() => docInputRef.current.click()} 
                              className="btn-primary" 
                              disabled={isUploading}
                              style={{ background: '#b35a00', color: 'white', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: isUploading ? 0.7 : 1 }}
                            >
                              {isUploading ? <div className="loader-ai" style={{ width: '16px', height: '16px' }}></div> : <Upload size={16} />}
                              {isUploading ? 'Uploading...' : settings.cvUrl ? 'Replace CV' : 'Upload CV'}
                            </button>
                            <input type="file" ref={docInputRef} hidden accept=".pdf,.doc,.docx" onChange={handleCvUpload} />
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontWeight: '800', marginBottom: '2px' }}>CV Visibility</h4>
                            <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>Show or hide the Download CV button on the public portfolio.</p>
                          </div>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={settings.isCvActive !== false} 
                              onChange={(e) => handleUpdateSetting('isCvActive', e.target.checked)} 
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {webContentTab === 'Stats' && (
                  <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddStat ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                          <Activity size={20} color="#b35a00" />
                          <div><h3>{statForm._id ? 'Edit Stat' : 'Add New Stat'}</h3><p>Manage your professional metrics</p></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                          <div className="login-input-group"><label>Label</label><input type="text" value={statForm.label} onChange={e => setStatForm({...statForm, label: e.target.value})} /></div>
                          <div className="login-input-group"><label>Value</label><input type="text" value={statForm.value} onChange={e => setStatForm({...statForm, value: e.target.value})} /></div>
                          <div className="login-input-group" style={{ gridColumn: 'span 2' }}>
                            <label>Choose Icon</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                              {[
                                { id: 'Activity', icon: Activity },
                                { id: 'Briefcase', icon: Briefcase },
                                { id: 'Code', icon: Code },
                                { id: 'Users', icon: Users },
                                { id: 'Award', icon: Award },
                                { id: 'Coffee', icon: Coffee },
                                { id: 'Globe', icon: Globe },
                                { id: 'Star', icon: Star },
                                { id: 'Heart', icon: Heart },
                                { id: 'Cpu', icon: Cpu },
                                { id: 'Zap', icon: Zap },
                                { id: 'Rocket', icon: Rocket }
                              ].map(item => (
                                <button
                                  key={item.id}
                                  onClick={() => setStatForm({...statForm, icon: item.id})}
                                  style={{
                                    width: '45px',
                                    height: '45px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '12px',
                                    border: statForm.icon === item.id ? '2px solid #b35a00' : '1px solid #e8e0d5',
                                    background: statForm.icon === item.id ? '#fcf8f4' : 'white',
                                    color: statForm.icon === item.id ? '#b35a00' : '#666',
                                    cursor: 'pointer'
                                  }}
                                  title={item.id}
                                >
                                  <item.icon size={20} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="login-input-group"><label>Color</label><input type="color" value={statForm.color} onChange={e => setStatForm({...statForm, color: e.target.value})} style={{ height: '45px', padding: '5px' }} /></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                          <button onClick={() => setShowAddStat(false)} className="btn-secondary" style={{ padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                          <button onClick={handleSaveStat} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '15px' }}>Save Stat</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontWeight: '800' }}>Manage Portfolio Stats</h2>
                          <button onClick={() => { setStatForm({ label: '', value: '', icon: 'Briefcase', color: '#b35a00', order: 0 }); setShowAddStat(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Stat</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                          {stats.map(s => (
                            <div key={s._id} className="white-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ padding: '10px', background: `${s.color}15`, color: s.color, borderRadius: '10px' }}>
                              {(() => {
                                const icons = { Activity, Briefcase, Code, Users, Award, Coffee, Globe, Star, Heart, Cpu, Zap, Rocket };
                                const IconComp = icons[s.icon] || Activity;
                                return <IconComp size={20} />;
                              })()}
                            </div>
                            <div><div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{s.value}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>{s.label}</div></div>
                          </div>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => { setStatForm(s); setShowAddStat(true); }} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #eee' }}><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteStat(s._id)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Testimonials' && (
                  <motion.div key="testimonials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddTestimonial ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                          <MessageSquare size={20} color="#b35a00" />
                          <div><h3>{testimonialForm._id ? 'Edit Testimonial' : 'Add New Testimonial'}</h3><p>Manage client reviews</p></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="login-input-group"><label>Client Name</label><input type="text" value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})} /></div>
                            <div className="login-input-group"><label>Role</label><input type="text" value={testimonialForm.role} onChange={e => setTestimonialForm({...testimonialForm, role: e.target.value})} /></div>
                            <div className="login-input-group">
                              <label>Avatar URL</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" value={testimonialForm.avatar} onChange={e => setTestimonialForm({...testimonialForm, avatar: e.target.value})} style={{ flexGrow: 1 }} />
                                <button onClick={() => { setMediaPickerCallback(() => (url) => setTestimonialForm(prev => ({...prev, avatar: url}))); setShowMediaPicker(true); }} className="admin-btn-secondary" style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}><Image size={16} /> Choose</button>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="login-input-group"><label>Content</label><textarea rows="3" value={testimonialForm.content} onChange={e => setTestimonialForm({...testimonialForm, content: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5' }}></textarea></div>
                            <div className="login-input-group"><label>Rating</label><input type="number" min="1" max="5" value={testimonialForm.rating} onChange={e => setTestimonialForm({...testimonialForm, rating: parseInt(e.target.value)})} /></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                          <button onClick={() => setShowAddTestimonial(false)} className="btn-secondary" style={{ padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                          <button onClick={handleSaveTestimonial} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '15px' }}>Save Review</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h2 style={{ fontWeight: '800' }}>Manage Reviews</h2>
                          <button onClick={() => { setTestimonialForm({ name: '', role: '', content: '', avatar: '', rating: 5 }); setShowAddTestimonial(true); }} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 25px', borderRadius: '15px' }}><Plus size={18} /> New Review</button>
                        </div>
                        <div className="white-card" style={{ padding: '0', overflow: 'hidden' }}>
                          <table className="admin-table">
                            <thead><tr><th>Avatar</th><th>Client</th><th>Role</th><th>Rating</th><th>Action</th></tr></thead>
                            <tbody>
                              {testimonials.map(t => (
                                <tr key={t._id}>
                                  <td>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#f5f5f5' }}>
                                      {t.avatar ? <img src={t.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="#ccc" style={{ margin: '10px' }} />}
                                    </div>
                                  </td>
                                  <td>{t.name}</td>
                                  <td>{t.role}</td>
                                  <td>{t.rating} ⭐</td>
                                  <td style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => { setTestimonialForm(t); setShowAddTestimonial(true); }} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}><Edit2 size={14} /></button>
                                    <button onClick={() => handleDeleteTestimonial(t._id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444' }}><Trash2 size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Skills' && (
                  <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddSkill ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '25px' }}>
                          <Code size={20} color="#b35a00" />
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>{skillForm._id ? 'Edit Skill' : 'Add New Skill'}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Add a new technical skill.</p>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="login-input-group">
                            <label>Skill Name</label>
                            <input type="text" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} placeholder="e.g. React.js" />
                          </div>
                          <div className="login-input-group">
                            <label>Proficiency Level (%)</label>
                            <input type="number" min="0" max="100" value={skillForm.level} onChange={e => setSkillForm({...skillForm, level: Number(e.target.value)})} placeholder="e.g. 90" />
                          </div>
                          <div className="login-input-group">
                            <label>Category</label>
                            <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5', outline: 'none' }}>
                              <option value="Frontend Development">Frontend Development</option>
                              <option value="Backend Development">Backend Development</option>
                              <option value="Database & DevOps">Database & DevOps</option>
                            </select>
                          </div>
                          <div className="login-input-group">
                            <label>Order (optional)</label>
                            <input type="number" value={skillForm.order} onChange={e => setSkillForm({...skillForm, order: Number(e.target.value)})} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button onClick={handleSaveSkill} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '15px' }}>Save Skill</button>
                          <button onClick={() => setShowAddSkill(false)} className="btn-secondary" style={{ background: '#f5f5f5', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#333' }}>Manage Skills</h3>
                          <button onClick={() => { setSkillForm({ name: '', level: 0, category: 'Frontend Development', order: 0 }); setShowAddSkill(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px', fontSize: '0.9rem' }}>
                            <Plus size={16} /> Add Skill
                          </button>
                        </div>
                        <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                          {skills.map(skill => (
                            <div key={skill._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fcf8f4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b35a00' }}>
                                    <Code size={20} />
                                  </div>
                                  <div>
                                    <h4 style={{ margin: 0, fontWeight: '700', color: '#333' }}>{skill.name}</h4>
                                    <span style={{ fontSize: '0.8rem', color: '#b35a00', background: '#fcf8f4', padding: '2px 8px', borderRadius: '10px' }}>{skill.category}</span>
                                  </div>
                                </div>
                                <div style={{ fontWeight: '800', color: '#b35a00' }}>{skill.level}%</div>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#f5f5f5', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${skill.level}%`, height: '100%', background: '#b35a00' }}></div>
                              </div>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => { setSkillForm(skill); setShowAddSkill(true); }} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fcf8f4', color: '#b35a00', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                <button onClick={() => handleDeleteSkill(skill._id)} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                              </div>
                            </div>
                          ))}
                          {skills.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed #ccc', gridColumn: '1 / -1' }}>
                              <p style={{ color: '#888' }}>No skills added yet.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Services' && (
                  <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddService ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '25px' }}>
                          <LayoutGrid size={20} color="#8b5cf6" />
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#333' }}>{serviceForm._id ? 'Edit Service' : 'Add New Service'}</h3>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Add a new service offering.</p>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="login-input-group">
                            <label>Service Title</label>
                            <input type="text" value={serviceForm.title} onChange={e => setServiceForm({...serviceForm, title: e.target.value})} placeholder="e.g. Frontend Development" />
                          </div>
                          <div className="login-input-group">
                            <label>Icon</label>
                            <select value={serviceForm.icon} onChange={e => setServiceForm({...serviceForm, icon: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5', outline: 'none' }}>
                              <option value="Layout">Layout (Frontend)</option>
                              <option value="Server">Server (Backend)</option>
                              <option value="Database">Database</option>
                              <option value="Sparkles">Sparkles (AI/Special)</option>
                              <option value="Smartphone">Smartphone (Mobile)</option>
                              <option value="Code">Code</option>
                              <option value="PenTool">PenTool (Design)</option>
                              <option value="Globe">Globe (Web)</option>
                            </select>
                          </div>
                          <div className="login-input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Short Description (Card)</label>
                            <textarea value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} placeholder="Brief 1-2 sentence description" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5', outline: 'none', height: '80px', resize: 'vertical' }}></textarea>
                          </div>
                          <div className="login-input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Detailed Introduction (Modal)</label>
                            <textarea value={serviceForm.details} onChange={e => setServiceForm({...serviceForm, details: e.target.value})} placeholder="Full details about the service" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e8e0d5', outline: 'none', height: '120px', resize: 'vertical' }}></textarea>
                          </div>
                          <div className="login-input-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Learning Concepts (Comma separated)</label>
                            <input type="text" value={typeof serviceForm.learning === 'string' ? serviceForm.learning : (serviceForm.learning?.join(', ') || '')} onChange={e => setServiceForm({...serviceForm, learning: e.target.value})} placeholder="e.g. React, Node.js, SQL" />
                          </div>
                          <div className="login-input-group">
                            <label>Color Hex (e.g. #8b5cf6)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input type="color" value={serviceForm.color} onChange={e => setServiceForm({...serviceForm, color: e.target.value})} style={{ width: '50px', height: '45px', padding: '0', border: 'none', borderRadius: '8px' }} />
                              <input type="text" value={serviceForm.color} onChange={e => setServiceForm({...serviceForm, color: e.target.value})} style={{ flex: 1 }} />
                            </div>
                          </div>
                          <div className="login-input-group">
                            <label>Order (optional)</label>
                            <input type="number" value={serviceForm.order} onChange={e => setServiceForm({...serviceForm, order: Number(e.target.value)})} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                          <button onClick={handleSaveService} className="btn-primary" style={{ padding: '12px 25px', borderRadius: '15px' }}>Save Service</button>
                          <button onClick={() => setShowAddService(false)} className="btn-secondary" style={{ background: '#f5f5f5', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#333' }}>Manage Services</h3>
                          <button onClick={() => { setServiceForm({ title: '', description: '', details: '', learning: '', color: '#8b5cf6', icon: 'Layout', order: 0 }); setShowAddService(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px', fontSize: '0.9rem' }}>
                            <Plus size={16} /> Add Service
                          </button>
                        </div>
                        <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                          {services.map(service => (
                            <div key={service._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', borderTop: `4px solid ${service.color}` }}>
                              <h4 style={{ margin: 0, fontWeight: '700', color: '#333', fontSize: '1.1rem' }}>{service.title}</h4>
                              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', flex: 1 }}>{service.description}</p>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={() => { setServiceForm({...service, learning: service.learning?.join(', ') || ''}); setShowAddService(true); }} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                                <button onClick={() => handleDeleteService(service._id)} style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                              </div>
                            </div>
                          ))}
                          {services.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed #ccc', gridColumn: '1 / -1' }}>
                              <p style={{ color: '#888' }}>No services added yet.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Companies' && (
                  <motion.div key="companies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddCompany ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                          <Building2 size={20} color="#b35a00" />
                          <div>
                            <h3>{companyForm._id ? 'Edit Company / Partner' : 'Add New Company / Partner'}</h3>
                            <p>Add companies and clients you have worked with to showcase on your homepage</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="login-input-group">
                              <label>Company / Client Name *</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Google, Meta, Microsoft"
                                value={companyForm.name} 
                                onChange={e => setCompanyForm({...companyForm, name: e.target.value})} 
                              />
                            </div>

                            <div className="login-input-group">
                              <label>Website URL (Optional)</label>
                              <input 
                                type="text" 
                                placeholder="https://example.com"
                                value={companyForm.website} 
                                onChange={e => setCompanyForm({...companyForm, website: e.target.value})} 
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <div className="login-input-group">
                                <label>Display Order</label>
                                <input 
                                  type="number" 
                                  value={companyForm.order} 
                                  onChange={e => setCompanyForm({...companyForm, order: Number(e.target.value)})} 
                                />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px', color: '#555' }}>Active Status</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={companyForm.isActive !== false} 
                                    onChange={e => setCompanyForm({...companyForm, isActive: e.target.checked})} 
                                    style={{ width: '18px', height: '18px', accentColor: '#b35a00' }}
                                  />
                                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Show on Website</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555' }}>Company Logo *</label>
                            
                            {/* Direct Upload Box */}
                            <div style={{ 
                              position: 'relative', 
                              height: '140px', 
                              background: '#fcf8f4', 
                              borderRadius: '15px', 
                              border: '2px dashed #e8e0d5', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              overflow: 'hidden' 
                            }}>
                              {companyForm.logo ? (
                                <>
                                  <img 
                                    src={companyForm.logo} 
                                    alt="Logo preview" 
                                    style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} 
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setCompanyForm({...companyForm, logo: ''})} 
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '4px', cursor: 'pointer' }}
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <label style={{ cursor: 'pointer', textAlign: 'center', color: '#888', padding: '15px' }}>
                                  <Upload size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#b35a00' }} />
                                  <div style={{ fontWeight: '700', color: '#b35a00', fontSize: '0.9rem' }}>Upload Logo from Device</div>
                                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>PNG, SVG, JPG, WebP</div>
                                  <input type="file" hidden accept="image/*" onChange={handleCompanyLogoUpload} />
                                </label>
                              )}
                            </div>

                            <div className="login-input-group" style={{ marginBottom: 0 }}>
                              <label style={{ fontSize: '0.8rem' }}>Or Paste Logo Image URL</label>
                              <input 
                                type="text" 
                                placeholder="https://.../logo.png"
                                value={companyForm.logo} 
                                onChange={e => setCompanyForm({...companyForm, logo: e.target.value})} 
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                          <button onClick={handleSaveCompany} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '15px' }}>
                            {companyForm._id ? 'Update Company' : 'Save Company'}
                          </button>
                          <button onClick={() => setShowAddCompany(false)} className="btn-secondary" style={{ background: '#f5f5f5', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#333', margin: '0 0 4px 0' }}>Companies & Associated Brands</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>These logos scroll smoothly in the infinite marquee slider on your homepage.</p>
                          </div>
                          <button 
                            onClick={() => { 
                              setCompanyForm({ name: '', logo: '', website: '', order: companies.length, isActive: true }); 
                              setShowAddCompany(true); 
                            }} 
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px', fontSize: '0.9rem', background: '#b35a00', color: 'white' }}
                          >
                            <Plus size={16} /> Add Company
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                          {(Array.isArray(companies) ? companies : []).map(company => (
                            <div key={company._id} className="white-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '55px', height: '55px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                                  <img 
                                    src={company.logo} 
                                    alt={company.name} 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=b35a00&color=fff`;
                                    }}
                                  />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {company.name}
                                  </h4>
                                  {company.website ? (
                                    <a href={company.website} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#b35a00', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', marginTop: '2px' }}>
                                      Visit website <ExternalLink size={10} />
                                    </a>
                                  ) : (
                                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No link</span>
                                  )}
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{ 
                                      display: 'inline-block', 
                                      padding: '2px 8px', 
                                      borderRadius: '6px', 
                                      fontSize: '0.7rem', 
                                      fontWeight: '700',
                                      background: company.isActive ? '#ecfdf5' : '#f1f5f9',
                                      color: company.isActive ? '#059669' : '#64748b'
                                    }}>
                                      {company.isActive ? '● Active' : 'Hidden'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                <button 
                                  onClick={() => handleEditCompany(company)} 
                                  style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#f1f5f9', color: '#334155', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteCompany(company._id)} 
                                  style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          {(!companies || companies.length === 0) && (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed #ccc', gridColumn: '1 / -1' }}>
                              <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                              <p style={{ color: '#475569', fontWeight: '700', margin: '0 0 5px 0' }}>No companies added yet</p>
                              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>The public website is currently showing standard tech company logos. Click "Add Company" above to show your own!</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Packages' && (
                  <motion.div key="packages" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    {showAddPackage ? (
                      <div className="white-card" style={{ padding: '30px' }}>
                        <div className="card-header-ai" style={{ marginBottom: '20px' }}>
                          <CreditCard size={22} color="#b35a00" />
                          <div>
                            <h3>{packageForm._id ? 'Edit Package' : 'Create New Package'}</h3>
                            <p>Configure pricing, features, and delivery timeline for your website services</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                          {/* Left Column: Details */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="login-input-group">
                              <label>Package Title *</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Starter Website, Business Pro, Custom Web App"
                                value={packageForm.title} 
                                onChange={e => setPackageForm({...packageForm, title: e.target.value})} 
                              />
                            </div>

                            <div className="login-input-group">
                              <label>Subtitle / Description</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Perfect for personal branding or small business portfolios"
                                value={packageForm.subtitle} 
                                onChange={e => setPackageForm({...packageForm, subtitle: e.target.value})} 
                              />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '12px' }}>
                              <div className="login-input-group">
                                <label>Currency</label>
                                <input 
                                  type="text" 
                                  value={packageForm.currency} 
                                  onChange={e => setPackageForm({...packageForm, currency: e.target.value})} 
                                />
                              </div>
                              <div className="login-input-group">
                                <label>Price *</label>
                                <input 
                                  type="number" 
                                  value={packageForm.price} 
                                  onChange={e => setPackageForm({...packageForm, price: Number(e.target.value)})} 
                                />
                              </div>
                              <div className="login-input-group">
                                <label>Billing Period</label>
                                <input 
                                  type="text" 
                                  placeholder="One-time or /month"
                                  value={packageForm.billingPeriod} 
                                  onChange={e => setPackageForm({...packageForm, billingPeriod: e.target.value})} 
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div className="login-input-group">
                                <label>Delivery Time</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. 3-5 Days, 1-2 Weeks"
                                  value={packageForm.deliveryTime} 
                                  onChange={e => setPackageForm({...packageForm, deliveryTime: e.target.value})} 
                                />
                              </div>
                              <div className="login-input-group">
                                <label>Accent Color</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input 
                                    type="color" 
                                    value={packageForm.color || '#b35a00'} 
                                    onChange={e => setPackageForm({...packageForm, color: e.target.value})} 
                                    style={{ width: '42px', height: '42px', padding: '2px', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer' }}
                                  />
                                  <input 
                                    type="text" 
                                    value={packageForm.color || '#b35a00'} 
                                    onChange={e => setPackageForm({...packageForm, color: e.target.value})} 
                                    style={{ flex: 1 }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                              <div className="login-input-group">
                                <label>Badge Text (Optional)</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Most Popular, Best Value"
                                  value={packageForm.badge} 
                                  onChange={e => setPackageForm({...packageForm, badge: e.target.value})} 
                                />
                              </div>
                              <div className="login-input-group">
                                <label>Display Order</label>
                                <input 
                                  type="number" 
                                  value={packageForm.order} 
                                  onChange={e => setPackageForm({...packageForm, order: Number(e.target.value)})} 
                                />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', padding: '12px 15px', background: '#fcf8f4', borderRadius: '12px', border: '1px solid #faeade' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                                <input 
                                  type="checkbox" 
                                  checked={packageForm.isPopular} 
                                  onChange={e => setPackageForm({...packageForm, isPopular: e.target.checked})} 
                                  style={{ width: '18px', height: '18px', accentColor: '#b35a00' }}
                                />
                                Highlight as Popular
                              </label>

                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                                <input 
                                  type="checkbox" 
                                  checked={packageForm.isActive !== false} 
                                  onChange={e => setPackageForm({...packageForm, isActive: e.target.checked})} 
                                  style={{ width: '18px', height: '18px', accentColor: '#b35a00' }}
                                />
                                Show on Website
                              </label>
                            </div>
                          </div>

                          {/* Right Column: Features List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="login-input-group" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <label>Package Features & Deliverables * (One per line)</label>
                              <textarea 
                                placeholder={"3-5 Custom Designed Pages\nResponsive Mobile-first Design\nContact Form & WhatsApp Integration\nSpeed & SEO Optimization\n1 Month Free Support"}
                                value={packageForm.features} 
                                onChange={e => setPackageForm({...packageForm, features: e.target.value})} 
                                style={{ 
                                  flex: 1, 
                                  minHeight: '260px', 
                                  padding: '15px', 
                                  borderRadius: '12px', 
                                  border: '1px solid #ddd', 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.88rem', 
                                  lineHeight: '1.6', 
                                  resize: 'vertical' 
                                }}
                              />
                              <span style={{ fontSize: '0.78rem', color: '#888', marginTop: '6px' }}>
                                💡 Tip: Type each included feature on a new line. They will show with checkmarks on the client website.
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                          <button onClick={handleSavePackage} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '12px 30px', borderRadius: '15px' }}>
                            {packageForm._id ? 'Update Package' : 'Save Package'}
                          </button>
                          <button onClick={() => setShowAddPackage(false)} className="btn-secondary" style={{ background: '#f5f5f5', color: '#555', padding: '12px 25px', borderRadius: '15px' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#333', margin: '0 0 4px 0' }}>Website Packages & Pricing Plans</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Packages are displayed on the public /packages page and the homepage pricing section.</p>
                          </div>
                          <button 
                            onClick={() => { 
                              setPackageForm({ 
                                title: '', subtitle: '', price: 150, currency: '$', billingPeriod: 'One-time',
                                deliveryTime: '3-5 Days', features: '', isPopular: false, badge: '', color: '#b35a00', order: packages.length, isActive: true 
                              }); 
                              setShowAddPackage(true); 
                            }} 
                            className="btn-primary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px', fontSize: '0.9rem', background: '#b35a00', color: 'white' }}
                          >
                            <Plus size={16} /> Add Package
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                          {(Array.isArray(packages) ? packages : []).map(pkg => (
                            <div 
                              key={pkg._id} 
                              className="white-card" 
                              style={{ 
                                padding: '22px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '16px',
                                borderTop: `4px solid ${pkg.color || '#b35a00'}`,
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '1.15rem' }}>{pkg.title}</h4>
                                    {pkg.isPopular && (
                                      <span style={{ background: 'linear-gradient(135deg, #b35a00, #ff8c00)', color: 'white', fontSize: '0.68rem', fontWeight: '800', padding: '2px 7px', borderRadius: '20px', textTransform: 'uppercase' }}>
                                        {pkg.badge || 'Popular'}
                                      </span>
                                    )}
                                  </div>
                                  {pkg.subtitle && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>{pkg.subtitle}</p>
                                  )}
                                </div>
                                <span style={{ 
                                  padding: '3px 8px', 
                                  borderRadius: '6px', 
                                  fontSize: '0.72rem', 
                                  fontWeight: '700',
                                  background: pkg.isActive !== false ? '#ecfdf5' : '#f1f5f9',
                                  color: pkg.isActive !== false ? '#059669' : '#64748b'
                                }}>
                                  {pkg.isActive !== false ? '● Active' : 'Hidden'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>
                                  {pkg.currency || '$'}{pkg.price}
                                </span>
                                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{pkg.billingPeriod || 'One-time'}</span>
                                {pkg.deliveryTime && (
                                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '10px', color: '#475569', fontWeight: '600' }}>
                                    ⚡ {pkg.deliveryTime}
                                  </span>
                                )}
                              </div>

                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                                  Features ({(pkg.features || []).length})
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {(pkg.features || []).slice(0, 4).map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                  {(pkg.features || []).length > 4 && (
                                    <li style={{ color: '#b35a00', fontStyle: 'italic' }}>+ {pkg.features.length - 4} more features</li>
                                  )}
                                </ul>
                              </div>

                              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                                <button 
                                  onClick={() => handleEditPackage(pkg)} 
                                  style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#f1f5f9', color: '#334155', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeletePackage(pkg._id)} 
                                  style={{ flex: 1, padding: '8px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          {(!packages || packages.length === 0) && (
                            <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px dashed #ccc', gridColumn: '1 / -1' }}>
                              <CreditCard size={36} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                              <p style={{ color: '#475569', fontWeight: '700', margin: '0 0 5px 0' }}>No packages added yet</p>
                              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                                The public website will show default packages until you create custom packages here. Click "Add Package" above!
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {webContentTab === 'Media' && (
                  <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="white-card" style={{ padding: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div className="card-header-ai" style={{ marginBottom: 0 }}>
                          <Image size={20} color="#b35a00" />
                          <div><h3>Media Library</h3><p>Manage all your uploaded assets</p></div>
                        </div>
                        <button onClick={() => fileInputRef.current.click()} className="btn-primary" style={{ background: '#b35a00', color: 'white', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Upload size={16} /> Upload Media
                        </button>
                        <input type="file" ref={fileInputRef} hidden onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              try {
                                await axios.post('/api/media', { name: file.name, url: reader.result, type: file.type.startsWith('image') ? 'image' : 'document', size: file.size });
                                showAlert('Media uploaded!');
                                fetchMedia();
                              } catch (err) { showAlert('Upload failed!', 'error'); }
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </div>

                      {media.length === 0 ? (
                        <div className="ai-preview-empty" style={{ padding: '60px' }}>
                          <Image size={48} color="#ddd" />
                          <h3>Your library is empty</h3>
                          <p>Upload images to see them here.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                          {media.map(m => (
                            <div key={m._id} className="media-item-card" style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', aspectRatio: '1' }}>
                              {m.type === 'image' ? (
                                <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={m.name} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', gap: '10px' }}>
                                  <File size={40} color="#888" />
                                  <span style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center', padding: '0 10px' }}>{m.name}</span>
                                </div>
                              )}
                              <div className="media-item-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: 0, transition: '0.2s', cursor: 'pointer' }}>
                                <button onClick={() => { navigator.clipboard.writeText(m.url); showAlert('URL copied to clipboard!'); }} style={{ padding: '8px', borderRadius: '8px', background: 'white', border: 'none' }} title="Copy URL"><LinkIcon size={16} /></button>
                                <button onClick={() => showConfirm('Delete this media permanently?', async () => { try { await axios.delete(`/api/media/${m._id}`); showAlert('Media deleted!'); fetchMedia(); } catch (err) { showAlert('Delete failed!', 'error'); } })} style={{ padding: '8px', borderRadius: '8px', background: '#fee2e2', border: 'none', color: '#ef4444' }} title="Delete"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
      
      {/* Media Picker Modal */}
      <AnimatePresence>
        {showMediaPicker && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="white-card" style={{ width: '80%', maxWidth: '900px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '25px' }}>
              <div style={{ padding: '25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: '800' }}>Select Media</h3>
                <button onClick={() => setShowMediaPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <div style={{ flexGrow: 1, overflowY: 'auto', padding: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                  {media.map(m => (
                    <div 
                      key={m._id} 
                      onClick={() => { mediaPickerCallback(m.url); setShowMediaPicker(false); }}
                      style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', aspectRatio: '1', position: 'relative' }}
                    >
                      {m.type === 'image' ? <img src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ background: '#f9f9f9', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><File size={32} /></div>}
                      <div className="hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(179, 90, 0, 0.2)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>Select</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Picker Modal */}
      <AnimatePresence>
        {showTemplatePicker && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="white-card" style={{ width: '500px', borderRadius: '25px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: '800' }}>Select Local Template</h3>
                <button onClick={() => setShowTemplatePicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <div style={{ padding: '25px', maxHeight: '400px', overflowY: 'auto' }}>
                {availableTemplates.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {availableTemplates.map(tpl => (
                      <button 
                        key={tpl} 
                        onClick={() => { setProjectForm({...projectForm, liveLink: `/templates/${tpl}/index.html`}); setShowTemplatePicker(false); }}
                        style={{ width: '100%', textAlign: 'left', padding: '15px 20px', borderRadius: '15px', border: '1px solid #eee', background: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s' }}
                        className="template-item-hover"
                      >
                        <div style={{ width: '40px', height: '40px', background: '#f5f0e9', color: '#b35a00', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Globe size={20} />
                        </div>
                        <div style={{ fontWeight: '700' }}>{tpl}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <FolderTree size={40} style={{ marginBottom: '15px', opacity: 0.3 }} />
                    <p>No local templates found in public/templates folder.</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '20px', background: '#f9f9f9', fontSize: '0.8rem', color: '#666', textAlign: 'center' }}>
                Templates should be placed in <code>public/templates/</code>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ImgToolBtn = ({ icon: Icon, onClick, label, color = "white" }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', border: 'none', background: 'transparent', color: color, fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }} className="img-tool-hover"><Icon size={14} /> {label}</button>
);

const CustomToast = ({ visible, message, type }) => (
  <AnimatePresence>{visible && (<motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} style={{ position: 'fixed', top: '0', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 30px', background: type === 'error' ? '#fef2f2' : '#f0fdf4', color: type === 'error' ? '#ef4444' : '#16a34a', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: `1px solid ${type === 'error' ? '#fee2e2' : '#dcfce7'}`, fontWeight: '700' }}>{type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}{message}</motion.div>)}</AnimatePresence>
);

const CustomPrompt = ({ visible, title, placeholder, onConfirm, onCancel }) => {
  const [val, setVal] = useState('');
  
  useEffect(() => {
    if (visible) setVal(placeholder || '');
  }, [visible, placeholder]);

  return (
    <AnimatePresence>
      {visible && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="white-card" style={{ width: '500px', padding: '35px', textAlign: 'center', borderRadius: '25px' }}>
            <h3 style={{ marginBottom: '20px', fontWeight: '800', fontSize: '1.4rem' }}>{title}</h3>
            <textarea 
              className="admin-input" 
              placeholder="Content..." 
              autoFocus 
              value={val} 
              onChange={e => setVal(e.target.value)}
              style={{ minHeight: '150px', maxHeight: '400px', width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e8e0d5', outline: 'none', fontSize: '1rem', lineHeight: '1.6', resize: 'vertical' }}
            ></textarea>
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <button onClick={onCancel} style={{ flexGrow: 1, padding: '14px', borderRadius: '15px', border: 'none', background: '#f5f5f5', color: '#555', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => onConfirm(val)} style={{ flexGrow: 1, padding: '14px', borderRadius: '15px', border: 'none', background: '#b35a00', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CustomConfirm = ({ visible, message, onConfirm, onCancel }) => (
  <AnimatePresence>
    {visible && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="white-card" style={{ width: '400px', padding: '35px', textAlign: 'center', borderRadius: '25px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ width: '60px', height: '60px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Trash2 size={30} />
          </div>
          <h3 style={{ marginBottom: '15px', fontWeight: '800', fontSize: '1.4rem' }}>Are you sure?</h3>
          <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={onCancel} style={{ flexGrow: 1, padding: '14px', borderRadius: '15px', border: 'none', background: '#f5f5f5', color: '#555', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>Cancel</button>
            <button onClick={onConfirm} style={{ flexGrow: 1, padding: '14px', borderRadius: '15px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)', transition: '0.2s' }}>Yes, Delete</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ToolbarBtn = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} type="button" style={{ padding: '6px 10px', border: 'none', background: 'transparent', color: '#555', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} className="toolbar-btn-hover"><Icon size={17} strokeWidth={2.5} /> {label && <span style={{ fontSize: '0.75rem', fontWeight: '900' }}>{label}</span>}</button>
);

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className="stat-card"><div className="stat-card-header"><div className="stat-icon-box" style={{ background: bg, color }}><Icon size={20} /></div></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
);

export default AdminPage;
