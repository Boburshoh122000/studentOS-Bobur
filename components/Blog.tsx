import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { blogApi } from '../src/services/api';
import MinimalHeader from './MinimalHeader';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  publishedAt: string;
  views?: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function Blog({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // `id` is the value sent to the backend tag filter; label is i18n-resolved.
  const categories = [
    { id: 'All', labelKey: 'Blog.cat_all' },
    { id: 'Career Advice', labelKey: 'Blog.cat_career' },
    { id: 'Study Tips', labelKey: 'Blog.cat_study' },
    { id: 'Productivity', labelKey: 'Blog.cat_productivity' },
    { id: 'Success Stories', labelKey: 'Blog.cat_success' },
    { id: 'Tools', labelKey: 'Blog.cat_tools' },
    { id: 'Student Life', labelKey: 'Blog.cat_student_life' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { tag?: string; page?: number } = { page: 1 };
      if (activeCategory !== 'All') {
        params.tag = activeCategory;
      }
      const response = await blogApi.list(params);
      const data = response.data as any;
      setPosts(data?.posts || []);
    } catch (err: any) {
      console.error('Failed to fetch blog posts:', err);
      setError(t('Blog.load_error'));
    } finally {
      setLoading(false);
    }
  };

  // Featured post = most viewed
  const sortedByViews = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0));
  const featuredPost = sortedByViews[0] || null;

  const filteredPosts = posts
    .filter((post) => (featuredPost ? post.id !== featuredPost.id : true))
    .filter((post) => {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

  const estimateReadTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 pt-28">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        {/* Global Header */}
        <MinimalHeader />

        <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
          <div className="w-full max-w-[1024px] flex flex-col gap-10">
            {/* Hero Section - Most Viewed */}
            {featuredPost && (
              <section
                className="@container cursor-pointer"
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
              >
                <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-1 md:flex-row md:items-stretch group">
                  <div className="w-full md:w-1/2 overflow-hidden rounded-xl relative min-h-[300px] md:min-h-auto">
                    {featuredPost.coverImageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${featuredPost.coverImageUrl}')` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <DocumentTextIcon className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                  </div>
                  <div className="flex flex-col justify-center gap-4 p-5 md:w-1/2 md:p-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      {featuredPost.tags.slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-slate-400 font-medium">
                        {t('Blog.min_read', { count: estimateReadTime(featuredPost.content) })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {t('Blog.views', { count: featuredPost.views || 0 })}
                      </span>
                    </div>
                    <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h1>
                    {featuredPost.excerpt && (
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    )}
                    <div className="pt-2">
                      <span className="flex items-center gap-2 text-sm font-bold text-primary group-hover:text-blue-600 transition-colors">
                        {t('Blog.read_article')} <ArrowRightIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Search and Filters */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-24 z-40 bg-background-light/95 dark:bg-background-dark/95 py-3 backdrop-blur-sm">
              {/* Categories - Scrollable */}
              <div className="flex-1 w-full overflow-hidden">
                <div className="flex overflow-x-auto whitespace-nowrap items-center gap-2 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors border ${
                        activeCategory === category.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t(category.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative w-full md:w-72 shrink-0">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  className="h-10 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
                  placeholder={t('Blog.search_ph')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Blog Grid */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {t('Blog.latest')}
                </h2>
              </div>

              {/* Loading State */}
              {loading && <GlobalLoader fullScreen={false} />}

              {/* Error State */}
              {error && !loading && (
                <div className="py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {t('Blog.load_fail_title')}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                    {error}
                  </p>
                  <button
                    onClick={fetchPosts}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('Blog.try_again')}
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredPosts.length === 0 && (
                <div className="py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {t('Blog.none_title')}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {posts.length === 0 ? t('Blog.none_empty') : t('Blog.none_search')}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setSearchQuery('');
                      }}
                      className="mt-6 text-primary font-bold hover:underline"
                    >
                      {t('Blog.clear_filters')}
                    </button>
                  )}
                </div>
              )}

              {/* Posts Grid */}
              {!loading && !error && filteredPosts.length > 0 && (
                <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="group flex flex-col gap-3 cursor-pointer"
                    >
                      <div className="overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 aspect-[16/10] relative">
                        {post.coverImageUrl ? (
                          <div
                            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url('${post.coverImageUrl}')` }}
                          ></div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <DocumentTextIcon className="w-9 h-9 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {post.tags.slice(0, 1).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-bold uppercase tracking-wider text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-slate-400">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>{t('Blog.by_author', { name: post.author.name })}</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-3.5 h-3.5" />
                            {post.views || 0}
                          </span>
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Newsletter Section */}
            <section className="rounded-2xl bg-slate-900 dark:bg-primary/20 overflow-hidden relative isolate">
              <div
                className="absolute inset-0 -z-10 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(#2b7cee 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              ></div>
              <div className="px-6 py-12 md:px-12 md:py-16 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex flex-col gap-3 max-w-lg text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {t('Blog.news_title')}
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base">{t('Blog.news_sub')}</p>
                </div>
                <div className="w-full max-w-md">
                  <form className="flex flex-col sm:flex-row gap-3">
                    <input
                      className="flex-1 rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary backdrop-blur-sm"
                      placeholder={t('Blog.news_ph')}
                      type="email"
                    />
                    <button
                      className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors whitespace-nowrap"
                      type="button"
                    >
                      {t('Blog.subscribe')}
                    </button>
                  </form>
                  <p className="mt-3 text-xs text-slate-500 text-center md:text-left">
                    {t('Blog.no_spam')}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-16 pb-8">
          <div className="max-w-[1024px] mx-auto px-4 md:px-10 flex flex-col gap-10">
            <div className="flex flex-col md:flex-row justify-between gap-10">
              <div className="flex flex-col gap-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
                    <AcademicCapIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">StudentOS</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{t('Blog.footer_tagline')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('Blog.footer_platform')}
                  </h4>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                  >
                    {t('Blog.footer_features')}
                  </a>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                  >
                    {t('Blog.footer_pricing')}
                  </a>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('Blog.footer_resources')}
                  </h4>
                  <button
                    onClick={() => navigateTo(Screen.BLOG)}
                    className="text-sm text-slate-500 hover:text-primary transition-colors text-left"
                  >
                    {t('Blog.footer_blog')}
                  </button>
                  <button
                    onClick={() => navigateTo(Screen.COMMUNITY)}
                    className="text-sm text-slate-500 hover:text-primary transition-colors text-left"
                  >
                    {t('Blog.footer_community')}
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {t('Blog.footer_company')}
                  </h4>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                  >
                    {t('Blog.footer_about')}
                  </a>
                  <button
                    onClick={() => navigateTo(Screen.CONTACT)}
                    className="text-sm text-slate-500 hover:text-primary transition-colors text-left"
                  >
                    {t('Blog.footer_contact')}
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">{t('Blog.footer_rights')}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
