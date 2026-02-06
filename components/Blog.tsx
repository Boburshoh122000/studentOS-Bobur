import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { blogApi } from '../src/services/api';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  publishedAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function Blog({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Career Advice", "Study Tips", "Productivity", "Success Stories", "Tools", "Student Life"];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { tag?: string; page?: number } = { page: 1 };
      if (activeCategory !== "All") {
        params.tag = activeCategory;
      }
      const response = await blogApi.list(params);
      setPosts(response.data.posts || []);
    } catch (err: any) {
      console.error('Failed to fetch blog posts:', err);
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      (post.excerpt?.toLowerCase().includes(query)) ||
      post.author.name.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200 pt-20">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
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
              <button onClick={() => navigateTo(Screen.SIGN_IN)} className="hidden sm:flex text-sm font-medium hover:text-primary transition-colors text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary">Sign In</button>
              <button onClick={() => navigateTo(Screen.SIGNUP_STEP_1)} className="flex items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary dark:bg-primary hover:bg-blue-700 dark:hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95">
                <span className="truncate">Get Started</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
          <div className="w-full max-w-[1024px] flex flex-col gap-10">
            {/* Hero Section */}
            <section className="@container">
              <div className="flex flex-col gap-6 overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-1 md:flex-row md:items-stretch">
                <div className="w-full md:w-1/2 overflow-hidden rounded-xl relative group min-h-[300px] md:min-h-auto">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAav9q5LsRscRGC0ZO9SOj1e8zqUU1fK6gcRUH4eFEMzVS58hyWABU5NvCVCqPUSq9G56F5yCWkMVa1tqq4uM0CeaLcFV7GBzwTGYdMxkYlpburpgCydW0fwd-mjyJp524TXO3cJ8RXCJ7DppcZl_B7VBfZR2JZmefICcWF33X1UQESaInxPyw48CJyrtI5GDYwMB34siXC8yc4xYH2oovSyvvnGuClH1Y8bWuLe39mQXDub1P80PL7mdhPzVOF3nzqkfPyiCctHes')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                </div>
                <div className="flex flex-col justify-center gap-4 p-5 md:w-1/2 md:p-8">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wide">Study Tips</span>
                    <span className="text-xs text-slate-400 font-medium">5 min read</span>
                  </div>
                  <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white md:text-4xl">
                    Mastering the Art of Deep Work: A Student's Guide
                  </h1>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                    Unlock your full academic potential by learning how to focus without distraction in an increasingly noisy world.
                  </p>
                  <div className="pt-2">
                    <button onClick={() => navigate('/blog/mastering-deep-work')} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-600 transition-colors">
                      Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Search and Filters */}
            <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-24 z-40 bg-background-light/95 dark:bg-background-dark/95 py-2 backdrop-blur-sm">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
                {categories.map(category => (
                  <button 
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors border ${
                      activeCategory === category 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
                <input 
                  className="h-10 w-full rounded-full border-0 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary shadow-sm" 
                  placeholder="Search articles..." 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Blog Grid */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Latest Articles</h2>
              </div>
              
              {/* Loading State */}
              {loading && (
                <div className="py-20 text-center">
                  <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 dark:text-slate-400">Loading articles...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Failed to load articles</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">{error}</p>
                  <button 
                    onClick={fetchPosts}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredPosts.length === 0 && (
                <div className="py-20 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {posts.length === 0 
                      ? "No articles have been published yet. Check back soon!"
                      : "We couldn't find any articles matching your search. Try adjusting your filters."}
                  </p>
                  {searchQuery && (
                    <button 
                      onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                      className="mt-6 text-primary font-bold hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Posts Grid */}
              {!loading && !error && filteredPosts.length > 0 && (
                <div className="grid gap-x-6 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPosts.map(post => (
                    <article key={post.id} onClick={() => navigate(`/blog/${post.slug}`)} className="group flex flex-col gap-3 cursor-pointer">
                      <div className="overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 aspect-[16/10] relative">
                        {post.coverImageUrl ? (
                          <div 
                            className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                            style={{ backgroundImage: `url('${post.coverImageUrl}')` }}
                          ></div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-400">article</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {post.tags.slice(0, 1).map(tag => (
                              <span key={tag} className="text-xs font-bold uppercase tracking-wider text-primary">{tag}</span>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-slate-400">{formatDate(post.publishedAt)}</span>
                        </div>
                        <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">By {post.author.name}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Newsletter Section */}
            <section className="rounded-2xl bg-slate-900 dark:bg-primary/20 overflow-hidden relative isolate">
              <div className="absolute inset-0 -z-10 opacity-20" style={{ backgroundImage: "radial-gradient(#2b7cee 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
              <div className="px-6 py-12 md:px-12 md:py-16 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex flex-col gap-3 max-w-lg text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Join 50,000+ students leveling up their careers.
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base">
                    Get the latest study hacks, career advice, and StudentOS updates delivered straight to your inbox.
                  </p>
                </div>
                <div className="w-full max-w-md">
                  <form className="flex flex-col sm:flex-row gap-3">
                    <input className="flex-1 rounded-lg border-0 bg-white/10 px-4 py-3 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary backdrop-blur-sm" placeholder="Enter your email" type="email" />
                    <button className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 transition-colors whitespace-nowrap" type="button">
                      Subscribe
                    </button>
                  </form>
                  <p className="mt-3 text-xs text-slate-500 text-center md:text-left">No spam, unsubscribe anytime.</p>
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
                    <span className="material-symbols-outlined text-[16px]">school</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">StudentOS</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The all-in-one operating system for your academic life.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Platform</h4>
                  <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Features</a>
                  <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Pricing</a>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Resources</h4>
                  <button onClick={() => navigateTo(Screen.BLOG)} className="text-sm text-slate-500 hover:text-primary transition-colors text-left">Blog</button>
                  <button onClick={() => navigateTo(Screen.COMMUNITY)} className="text-sm text-slate-500 hover:text-primary transition-colors text-left">Community</button>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Company</h4>
                  <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">About Us</a>
                  <button onClick={() => navigateTo(Screen.CONTACT)} className="text-sm text-slate-500 hover:text-primary transition-colors text-left">Contact</button>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">© 2024 StudentOS Inc. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}