import React, { useEffect } from 'react';
import Projects from '../components/Projects';

const ProjectsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Featured Projects | TaizerCodeCrafter';
  }, []);

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <Projects isPage={true} />
    </main>
  );
};

export default ProjectsPage;
