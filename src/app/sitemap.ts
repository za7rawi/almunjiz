import { MetadataRoute } from 'next';
import { blogsData } from '@/lib/blogs-data';

const BASE_URL = 'https://munjiz.store';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ar', 'en'];
  const mainPages = [
    { path: '', priority: 1.0, frequency: 'weekly' as const },
    { path: 'services', priority: 0.9, frequency: 'weekly' as const },
    { path: 'track-order', priority: 0.8, frequency: 'always' as const },
    { path: 'about', priority: 0.7, frequency: 'monthly' as const },
    { path: 'contact', priority: 0.7, frequency: 'monthly' as const },
    { path: 'faq', priority: 0.6, frequency: 'monthly' as const },
    { path: 'blog', priority: 0.6, frequency: 'weekly' as const },
    { path: 'offers', priority: 0.7, frequency: 'weekly' as const },
    { path: 'terms', priority: 0.3, frequency: 'yearly' as const },
    { path: 'privacy', priority: 0.3, frequency: 'yearly' as const },
  ];

  const staticPages: MetadataRoute.Sitemap = mainPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path ? `/${page.path}` : ''}`,
      lastModified: new Date(),
      changeFrequency: page.frequency,
      priority: page.priority,
    }))
  );

  const blogPages: MetadataRoute.Sitemap = blogsData.flatMap((post) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  );

  return [...staticPages, ...blogPages];
}
