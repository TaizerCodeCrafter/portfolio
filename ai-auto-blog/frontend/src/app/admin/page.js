'use client';
import { useState, useEffect } from 'react';
import { adminGetBlogs, updateBlog } from '@/lib/api';
import { 
  LayoutDashboard, FileText, FolderTree, Tag, Image, 
  Search, BarChart2, Sparkles, Settings, LogOut, 
  PlusCircle, Globe, ChevronRight, MoreHorizontal,
  FileStack, Eye, Users, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendelopeAdmin() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await adminGetBlogs();
      setBlogs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Posts', icon: FileText },
    { name: 'Categories', icon: FolderTree },
    { name: 'Tags', icon: Tag },
    { name: 'Media', icon: Image },
    { name: 'SEO', icon: Globe },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'AI Assistant', icon: Sparkles },
  ];

  const stats = [
    { label: 'Total Posts', value: blogs.length || 539, icon: FileStack, trend: null },
    { label: 'Page Views', value: '0', icon: Eye, trend: '+0.0% from last period' },
    { label: 'Unique Visitors', value: '0', icon: Users, trend: null },
    { label: 'Revenue', value: '$0.00', icon: DollarSign, trend: '+0.0% from last period' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5f0] text-[#4a4a4a] flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e8e0d5] flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#b35a00] rounded-lg"></div>
          <span className="font-bold text-xl tracking-tight uppercase text-[#222]">Trendelope</span>
        </div>

        <nav className="flex-grow px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.name 
                      ? 'bg-[#b35a00] text-white shadow-lg shadow-orange-900/20' 
                      : 'text-[#7a7a7a] hover:bg-[#f5eee6] hover:text-[#b35a00]'
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#f0e6da] space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#7a7a7a] text-sm font-medium hover:bg-[#f5eee6] rounded-lg">
            <Settings size={18} /> Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-[#7a7a7a] text-sm font-medium hover:bg-[#f5eee6] rounded-lg">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#e8e0d5] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-10 pr-4 py-2 bg-[#f5f0e9] border-none rounded-full text-sm focus:ring-1 focus:ring-[#b35a00]"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-[#222]">Admin Panel</div>
              <div className="text-[10px] text-[#a1a1a1] uppercase font-bold tracking-widest">DSJ Academy</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#e8e0d5] border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#222] mb-1">Dashboard</h1>
            <p className="text-sm text-[#8a8a8a]">Welcome to your blog admin panel</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-[#e8e0d5] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[#fcf8f4] rounded-lg text-[#b35a00]">
                    <stat.icon size={20} />
                  </div>
                  <MoreHorizontal size={16} className="text-[#a1a1a1]" />
                </div>
                <div className="text-xs font-bold text-[#8a8a8a] uppercase tracking-wider mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-[#222]">{stat.value}</div>
                {stat.trend && (
                  <div className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
                    {stat.trend}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8e0d5] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#222]">Recent Activity</h3>
                  <p className="text-xs text-[#8a8a8a]">Your latest blog activity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {blogs.length > 0 ? (
                  blogs.slice(0, 5).map((blog, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-[#fcf8f4] rounded-xl transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#b35a00]">
                        <FileText size={18} />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-bold text-[#222] line-clamp-1">{blog.title}</div>
                        <div className="text-[10px] text-[#a1a1a1] uppercase font-bold">{new Date(blog.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">Published</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-[#a1a1a1]">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-[#e8e0d5] p-6 shadow-sm h-full">
              <h3 className="font-bold text-[#222] mb-1">Quick Actions</h3>
              <p className="text-xs text-[#8a8a8a] mb-6">Common tasks</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-[#e8e0d5] rounded-xl hover:border-[#b35a00] hover:bg-[#fff9f2] transition-all group">
                  <PlusCircle size={20} className="mb-2 text-[#a1a1a1] group-hover:text-[#b35a00]" />
                  <span className="text-[11px] font-bold text-[#444]">New Post</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-[#e8e0d5] rounded-xl hover:border-[#b35a00] hover:bg-[#fff9f2] transition-all group">
                  <FolderTree size={20} className="mb-2 text-[#a1a1a1] group-hover:text-[#b35a00]" />
                  <span className="text-[11px] font-bold text-[#444]">Categories</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-[#e8e0d5] rounded-xl hover:border-[#b35a00] hover:bg-[#fff9f2] transition-all group">
                  <Image size={20} className="mb-2 text-[#a1a1a1] group-hover:text-[#b35a00]" />
                  <span className="text-[11px] font-bold text-[#444]">Media Library</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-white border border-[#e8e0d5] rounded-xl hover:border-[#b35a00] hover:bg-[#fff9f2] transition-all group">
                  <Settings size={20} className="mb-2 text-[#a1a1a1] group-hover:text-[#b35a00]" />
                  <span className="text-[11px] font-bold text-[#444]">SEO Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-[#e8e0d5] p-8 shadow-sm">
            <h3 className="font-bold text-[#222] mb-1">Traffic Overview</h3>
            <p className="text-xs text-[#8a8a8a] mb-10">Page views over the last 30 days</p>
            
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#f0e6da] rounded-2xl bg-[#fcfbf9]">
              <BarChart2 size={48} className="text-[#e8e0d5] mb-4" />
              <p className="text-sm text-[#a1a1a1] font-medium">Chart visualization will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
