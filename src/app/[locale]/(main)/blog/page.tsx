'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, FileText, Tag } from 'lucide-react';
import { blogsData, blogCategories } from '@/lib/blogs-data';
import { useLanguageStore } from '@/store/language-store';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  const filteredPosts =
    activeCategory === 'all'
      ? blogsData
      : blogsData.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03]">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#14b8a6]/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2580eb]/10 border border-[#2580eb]/20 text-[#2580eb] text-sm font-medium mb-6">
              <FileText size={16} />
              {isAr ? 'مدونة المنجز' : 'Al-Munjiz Blog'}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4">
              {isAr ? 'المدونة' : 'Blog'}
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {isAr ? 'اقرأ أحدث المقالات والنصائح المتعلقة بالخدمات الإلكترونية والسياحة' : 'Read the latest articles and tips about electronic services and travel'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2 justify-center"
        >
          {blogCategories.map((cat) => (
            <motion.button
              key={cat.id}
              variants={itemVariants}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2580eb]/30 hover:text-[#2580eb]'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAr ? cat.label : cat.labelEn}
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={48} className="text-white/30" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                      <Tag size={12} />
                      {blogCategories.find((c) => c.id === post.category)?.[isAr ? 'label' : 'labelEn'] || post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#2580eb] transition-colors">
                    {isAr ? post.title : post.titleEn}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {isAr ? post.excerpt : post.excerptEn}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <User size={12} />
                      {isAr ? post.author : post.authorEn}
                    </span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2580eb] hover:text-[#2580eb]/80 transition-colors"
                    >
                      {isAr ? 'اقرأ المزيد' : 'Read More'}
                      <ArrowLeft size={14} className="rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">{isAr ? 'لا توجد مقالات في هذا التصنيف' : 'No articles in this category'}</p>
          </div>
        )}
      </section>
    </div>
  );
}
