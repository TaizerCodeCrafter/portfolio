import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Blog from '../components/Blog';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Skills from '../components/Skills';
import AIChatbot from '../components/AIChatbot';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <main>
      <Hero />
      <Stats />
      <Skills />
      <Services />
      <Testimonials />
      <Blog isHomePage={true} />
      <Contact />
      <AIChatbot />
    </main>
  );
};

export default Home;
