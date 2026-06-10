'use client';
import { useState, useEffect } from 'react';
import { getBlogBySlug } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getBlogBySlug(slug).then(data => {
        setBlog(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-slate-400 mb-8">Article not found.</p>
      <Link href="/" className="px-6 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
        Back to Home
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      {/* Header */}
      <nav className="p-6 border-b border-slate-900 sticky top-0 bg-slate-950/80 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back
          </Link>
          <div className="font-bold text-lg">AI <span className="text-indigo-500">Blog</span></div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-slate-500 text-sm font-medium">
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
            {blog.category || 'Technology'}
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={16} /> {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <User size={16} /> AI Writer
          </span>
          <span className="flex items-center gap-2">
             SEO Score: <span className="text-green-500">{blog.seo?.seoScore || 90}%</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-10 leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-slate-400 mb-12 italic border-l-4 border-indigo-500 pl-6 py-2">
          {blog.excerpt}
        </p>

        {/* Content */}
        <div 
          className="prose prose-invert prose-indigo max-w-none 
          prose-headings:font-bold prose-headings:text-white 
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-6
          prose-li:text-slate-300 prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-slate-900">
          <div className="flex flex-wrap gap-2">
            {blog.seo?.keywords?.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                <Tag size={12} /> {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
