import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import PackagesPage from './pages/PackagesPage';
import ContactPage from './pages/ContactPage';
import ArticlesPage from './pages/ArticlesPage';
import FloatingSideTag from './components/FloatingSideTag';
import ScrollToTop from './components/ScrollToTop';
import PwaInstallPrompt from './components/PwaInstallPrompt';

// Code-split heavy & secondary routes for maximum loading speed
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,157,66,0.2)', borderTopColor: '#ff9d42', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function AppContent() {
  const location = useLocation();
  const isCeo = location.pathname === '/ceo';

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
      
      <ScrollToTop />
      {!isCeo && <Navbar />}
      {!isCeo && <FloatingSideTag />}
      {!isCeo && <PwaInstallPrompt />}
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<Navigate to="/articles" replace />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/ceo" element={<AdminPage />} />
          <Route path="/admin" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
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
