import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getBlogs = async () => {
  const res = await axios.get(`${API_URL}/blogs`);
  return res.data;
};

export const getBlogBySlug = async (slug) => {
  const res = await axios.get(`${API_URL}/blogs/${slug}`);
  return res.data;
};

export const adminGetBlogs = async () => {
  const res = await axios.get(`${API_URL}/blogs/admin/all`);
  return res.data;
};

export const updateBlog = async (id, data) => {
  const res = await axios.put(`${API_URL}/blogs/${id}`, data);
  return res.data;
};

export const login = async (email, password) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

// Categories
export const getCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`);
  return res.data;
};

export const createCategory = async (data) => {
  const res = await axios.post(`${API_URL}/categories`, data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axios.put(`${API_URL}/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_URL}/categories/${id}`);
  return res.data;
};

// Tags
export const getTags = async () => {
  const res = await axios.get(`${API_URL}/tags`);
  return res.data;
};

export const createTag = async (data) => {
  const res = await axios.post(`${API_URL}/tags`, data);
  return res.data;
};

export const updateTag = async (id, data) => {
  const res = await axios.put(`${API_URL}/tags/${id}`, data);
  return res.data;
};

export const deleteTag = async (id) => {
  const res = await axios.delete(`${API_URL}/tags/${id}`);
  return res.data;
};

export const generateTagsAI = async (content) => {
  const res = await axios.post(`${API_URL}/tags/generate-ai`, { content });
  return res.data;
};

// SEO
export const getSEOSettings = async () => {
  const res = await axios.get(`${API_URL}/seo/settings`);
  return res.data;
};

export const updateSEOSettings = async (data) => {
  const res = await axios.post(`${API_URL}/seo/settings`, { value: data });
  return res.data;
};

export const getSEOAnalysis = async () => {
  const res = await axios.get(`${API_URL}/seo/analysis`);
  return res.data;
};
