'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, User, Tag, FileText, ChevronLeft } from 'lucide-react';
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

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const post = blogsData.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03] dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{isAr ? 'المقال غير موجود' : 'Article Not Found'}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{isAr ? 'عذراً، المقال الذي تبحث عنه غير موجود.' : 'Sorry, the article you are looking for does not exist.'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2580eb] to-[#14b8a6] text-white font-semibold hover:shadow-lg transition-all"
          >
            {isAr ? 'العودة للمدونة' : 'Back to Blog'}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const title = isAr ? post.title : post.titleEn;
  const content = isAr ? post.content : post.contentEn;
  const author = isAr ? post.author : post.authorEn;
  const categoryLabel =
    blogCategories.find((c) => c.id === post.category)?.[isAr ? 'label' : 'labelEn'] || post.category;

  const relatedPosts = blogsData
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#2580eb]/[0.03] dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br ${post.gradient} opacity-10 rounded-full blur-[120px]`} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.nav variants={itemVariants} aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-6">
              <Link href="/" className="hover:text-[#2580eb] transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
              <ChevronLeft size={14} className="text-slate-300 dark:text-slate-600 rtl:rotate-180" />
              <Link href="/blog" className="hover:text-[#2580eb] transition-colors">{isAr ? 'المدونة' : 'Blog'}</Link>
              <ChevronLeft size={14} className="text-slate-300 dark:text-slate-600 rtl:rotate-180" />
              <span className="text-slate-900 dark:text-white font-medium truncate">{title}</span>
            </motion.nav>

            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2580eb]/10 text-[#2580eb] text-xs font-medium">
                <Tag size={12} />
                {categoryLabel}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTime}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 md:p-12 shadow-sm"
        >
          <div
            className="prose prose-lg prose-slate max-w-none dark:prose-invert
              prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold
              prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-base
              prose-li:text-slate-600 dark:prose-li:text-slate-400
              prose-strong:text-slate-800 dark:prose-strong:text-slate-200
              prose-a:text-[#2580eb] prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </motion.div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{isAr ? 'مقالات ذات صلة' : 'Related Articles'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
                >
                  <div className={`h-36 bg-gradient-to-br ${related.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText size={36} className="text-white/30" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
                      <Calendar size={12} />
                      {new Date(related.date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#2580eb] transition-colors">
                      {isAr ? related.title : related.titleEn}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {isAr ? related.excerpt : related.excerptEn}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
