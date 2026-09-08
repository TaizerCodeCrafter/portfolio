import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, Award, Code, Activity, Coffee, Globe, Star, Heart, Cpu, Zap, Rocket } from 'lucide-react';
import axios from 'axios';
import './Stats.css';

const iconMap = {
  Briefcase: Briefcase,
  Users: Users,
  Award: Award,
  Code: Code,
  Activity: Activity,
  Coffee: Coffee,
  Globe: Globe,
  Star: Star,
  Heart: Heart,
  Cpu: Cpu,
  Zap: Zap,
  Rocket: Rocket
};

const Stats = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats');
        if (Array.isArray(res.data)) setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  if (stats.length === 0) return null;
  return (
    <section className="stats-section section">
      <div className="stats-grid container">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="stat-card glass"
          >
            <div className="stat-icon-wrapper" style={{ '--icon-color': stat.color }}>
              {(() => {
                const Icon = iconMap[stat.icon] || Activity;
                return <Icon size={24} />;
              })()}
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
