import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import BlogPage from './pages/BlogPage';
import AdminPage from './pages/AdminPage';

import BlogDetailPage from './pages/BlogDetailPage';
import PackagesPage from './pages/PackagesPage';
import ContactPage from './pages/ContactPage';
import FloatingSideTag from './components/FloatingSideTag';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
      
      {!isAdmin && <Navbar />}
      {!isAdmin && <FloatingSideTag />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
