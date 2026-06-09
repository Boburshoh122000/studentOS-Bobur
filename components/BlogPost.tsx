import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { NavigationProps } from '../types';
import { blogApi } from '../src/services/api';
import { GlobalLoader } from './ui/GlobalLoader';
import MinimalHeader from './MinimalHeader';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  EyeIcon,
  ShareIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
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
        setPost(response.data as BlogPostData);
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

  // Increment view count on mount
  useEffect(() => {
    if (post?.id) {
      blogApi.incrementView(post.id).catch((err) => {
        console.warn('Failed to increment view count:', err);
      });
    }
  }, [post?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 pt-28 min-h-screen">
      <div className="relative flex flex-col overflow-x-hidden">
        {/* Global Header */}
        <MinimalHeader />

        <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
          <div className="w-full max-w-[800px] flex flex-col gap-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors self-start"
            >
              <ArrowLeftIcon className="w-[18px] h-[18px]" />
              Back to Blog
            </button>

            {/* Loading State */}
            {loading && <GlobalLoader fullScreen={false} />}

            {/* Error State */}
            {error && !loading && (
              <div className="py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Article not found
                </h3>
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
                    {post.tags.slice(0, 1).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-sm text-slate-400">
                      {estimateReadTime(post.content)} min read
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-400">
                      <EyeIcon className="w-4 h-4" />
                      {post.views || 0} views
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <UserCircleIcon className="w-11 h-11 text-slate-400 dark:text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {post.author.name}
                        </p>
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
                <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 mt-10">
                  <div
                    className="text-[1.1rem] md:text-lg text-gray-800 dark:text-slate-200 leading-8 md:leading-9 break-words [&>p]:mb-6 [&>ul]:list-none [&>ul]:pl-0 [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:mb-4 [&>ul>li::before]:content-['◆'] [&>ul>li::before]:absolute [&>ul>li::before]:left-0 [&>ul>li::before]:text-indigo-500 [&>ul>li::before]:font-bold [&>ol]:list-decimal [&>ol]:pl-8 [&>ol>li]:mb-4 [&>ol>li]:pl-1 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>img]:rounded-xl [&>img]:w-full [&>img]:my-6 [&>strong]:font-bold"
                    dangerouslySetInnerHTML={{
                      // Defense in depth: content is sanitized server-side on save,
                      // but re-sanitize at render so a compromised row can't run scripts
                      __html: DOMPurify.sanitize(post.content),
                    }}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 dark:border-slate-700">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Share & Actions */}
                <div className="flex items-center justify-end py-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        navigator.share?.({ title: post.title, url: window.location.href })
                      }
                      className="flex items-center gap-2 p-2 text-sm font-medium text-slate-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                      title="Share article"
                    >
                      <ShareIcon className="w-5 h-5" />
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
              <span className="font-bold text-slate-900 dark:text-white">StudentOS</span>
              <p className="text-sm text-slate-400">© 2024 StudentOS Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
