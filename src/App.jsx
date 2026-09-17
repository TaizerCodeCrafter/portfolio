import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
  const isCeo = location.pathname === '/ceo';

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
      
      {!isCeo && <Navbar />}
      {!isCeo && <FloatingSideTag />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/ceo" element={<AdminPage />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isCeo && <Footer />}
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
