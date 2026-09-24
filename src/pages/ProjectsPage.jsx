import React from 'react';
import Projects from '../components/Projects';

const ProjectsPage = () => {
  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <Projects isPage={true} />
    </main>
  );
};

export default ProjectsPage;
