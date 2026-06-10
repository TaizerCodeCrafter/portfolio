import React, { useEffect } from 'react';
import Blog from '../components/Blog';
import { motion } from 'framer-motion';

const BlogPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="page-container"
      style={{ paddingTop: '100px' }}
    >
      <Blog isHomePage={false} />
    </motion.div>
  );
};

export default BlogPage;
