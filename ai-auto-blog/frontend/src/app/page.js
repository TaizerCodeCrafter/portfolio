'use client';
import { useState, useEffect } from 'react';
import { getBlogs } from '@/lib/api';
import Link from 'next/link';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

    const [visibleCount, setVisibleCount] = useState(6);
  
    useEffect(() => {
      getBlogs().then(data => {
        setBlogs(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }, []);
  
    const loadMore = () => {
      setVisibleCount(prev => prev + 6);
    };
  
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        {/* Hero Section */}
        <section className="py-20 px-6 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium flex items-center gap-2">
                <Sparkles size={14} /> AI Powered Insights
              </span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500"
            >
              The Future of <span className="text-indigo-500">Tech</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto"
            >
              Automatically generated, AI-curated technology news and analysis. Updated every minute.
            </motion.p>
          </div>
        </section>
  
        {/* Blog Grid */}
        <main className="py-20 px-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Latest Articles</h2>
            <div className="h-[1px] flex-grow mx-8 bg-slate-900 hidden md:block"></div>
          </div>
  
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[400px] rounded-2xl bg-slate-900 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.slice(0, visibleCount).map((blog, index) => (
                  <motion.article
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300"
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 mb-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                        <span className="text-indigo-400">{blog.category || 'Tech'}</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-4 group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">
                        {blog.excerpt}
                      </p>
                      <Link 
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-2 text-sm font-semibold text-white group-hover:gap-3 transition-all"
                      >
                        Read Article <ArrowRight size={16} className="text-indigo-500" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
  
              {!loading && visibleCount < blogs.length && (
                <div className="mt-16 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMore}
                    className="px-8 py-3 rounded-full bg-white text-slate-950 font-bold text-sm hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-indigo-500/10"
                  >
                    Show More Articles
                  </motion.button>
                </div>
              )}
            </>
          )}

        {!loading && blogs.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500">No blogs generated yet. The AI is working on it!</p>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        &copy; 2026 AI Auto Blogging System. Powered by GPT-4.
      </footer>
    </div>
  );
}
