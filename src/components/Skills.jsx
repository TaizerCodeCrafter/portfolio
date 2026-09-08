import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Database, Globe, Layout, Server, Smartphone } from 'lucide-react';
import axios from 'axios';
import './Skills.css';

const defaultSkillCategories = [
  {
    title: 'Frontend Development',
    icon: <Layout size={24} />,
    skills: [
      { name: 'React.js', level: 95 },
      { name: 'Next.js', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'Tailwind CSS', level: 98 }
    ]
  },
  {
    title: 'Backend Development',
    icon: <Server size={24} />,
    skills: [
      { name: 'Node.js / Express', level: 92 },
      { name: 'Python / Django', level: 80 },
      { name: 'REST APIs', level: 95 },
      { name: 'GraphQL', level: 75 }
    ]
  },
  {
    title: 'Database & DevOps',
    icon: <Database size={24} />,
    skills: [
      { name: 'MongoDB', level: 90 },
      { name: 'PostgreSQL', level: 85 },
      { name: 'AWS / Cloud', level: 70 },
      { name: 'Docker', level: 75 }
    ]
  }
];

const getCategoryIcon = (categoryName) => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('frontend')) return <Layout size={24} />;
  if (lower.includes('backend')) return <Server size={24} />;
  if (lower.includes('database') || lower.includes('devops')) return <Database size={24} />;
  if (lower.includes('mobile') || lower.includes('app')) return <Smartphone size={24} />;
  if (lower.includes('web')) return <Globe size={24} />;
  return <Code2 size={24} />;
};

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState(defaultSkillCategories);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('/api/skills');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const grouped = res.data.reduce((acc, skill) => {
            if (!acc[skill.category]) {
              acc[skill.category] = {
                title: skill.category,
                icon: getCategoryIcon(skill.category),
                skills: []
              };
            }
            acc[skill.category].skills.push(skill);
            return acc;
          }, {});
          
          setSkillCategories(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    };
    fetchSkills();
  }, []);

  return (
    <section id="skills" className="section skills-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container"
      >
        <h2 className="section-title">Technical <span className="text-gradient">Proficiency</span></h2>
        <p className="section-subtitle">My core technology stack and specialized development expertise.</p>

        <div className="skills-grid">
          {skillCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="skill-category-card glass"
            >
              <div className="category-header">
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
              </div>
              
              <div className="skills-list">
                {category.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="skill-item">
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar-bg">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + (sIdx * 0.1) }}
                        className="skill-bar-fill"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Skills;
