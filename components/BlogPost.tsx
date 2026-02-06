import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { blogApi } from '../src/services/api';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags: string[];
  publishedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function BlogPost({ navigateTo }: NavigationProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogApi.get(postSlug);
      if (response.data) {
        setPost(response.data);
      } else {
        setError('Post not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch blog post:', err);
      setError('Failed to load the article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 pt-20 min-h-screen">
      <div className="relative flex flex-col overflow-x-hidden">
        {/* Navigation */}
        <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-[#111421]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-20 transition-all duration-200">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => navigateTo(Screen.LANDING)}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">StudentOS</h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigateTo(Screen.LANDING)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Home</button>
              <button onClick={() => navigateTo(Screen.COMMUNITY)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Community</button>
              <button onClick={() => navigateTo(Screen.BLOG)} className="text-sm font-bold text-primary">Blog</button>
              <button onClick={() => navigateTo(Screen.CONTACT)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">Contact</button>
            </nav>
            <div className="flex items-center justify-end gap-4">
              <button onClick={() => navigateTo(Screen.SIGN_IN)} className="hidden sm:flex text-sm font-medium hover:text-primary transition-colors text-slate-900 dark:text-white">Sign In</button>
              <button onClick={() => navigateTo(Screen.SIGNUP_STEP_1)} className="flex items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary dark:bg-primary hover:bg-blue-700 dark:hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95">
                <span className="truncate">Get Started</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
          <div className="w-full max-w-[800px] flex flex-col gap-8">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors self-start"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Blog
            </button>

            {/* Loading State */}
            {loading && (
              <div className="py-20 text-center">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading article...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Article not found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">{error}</p>
                <button 
                  onClick={() => navigate('/blog')}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse All Articles
                </button>
              </div>
            )}

            {/* Post Content */}
            {post && !loading && !error && (
              <article className="flex flex-col gap-8">
                {/* Header */}
                <header className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    {post.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                    <span className="text-sm text-slate-400">{estimateReadTime(post.content)} min read</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {post.author.avatar ? (
                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.author.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(post.publishedAt)}</p>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Cover Image */}
                {post.coverImageUrl && (
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-slate-200 dark:bg-slate-800">
                    <img 
                      src={post.coverImageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {post.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 dark:border-slate-700">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Share & Actions */}
                <div className="flex items-center justify-between py-6 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Blog
                  </button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-16 pb-8">
          <div className="max-w-[800px] mx-auto px-4 md:px-10 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-white">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">StudentOS</span>
              </div>
              <p className="text-sm text-slate-400">© 2024 StudentOS Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
