import React, { useEffect } from 'react';
import Packages from '../components/Packages';
import { motion } from 'framer-motion';

const PackagesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Pricing & Web Packages | TaizerCodeCrafter';
  }, []);

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh' }}
    >
      <Packages isPage={true} />
    </motion.main>
  );
};

export default PackagesPage;
