import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { communityApi } from '../src/services/api';

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
}

export default function CommunityFeed({ navigateTo }: NavigationProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityApi.list(1);
      setPosts((response.data as { posts: any[] }).posts || []);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load community posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await communityApi.create({ content: newPostContent });
      setNewPostContent('');
      fetchPosts(); // Refresh posts
    } catch (err: any) {
      console.error('Failed to create post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await communityApi.unlike(postId);
      } else {
        await communityApi.like(postId);
      }
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !isLiked, likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      ));
    } catch (err: any) {
      console.error('Failed to toggle like:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="font-display bg-[#F3F4F6] dark:bg-[#111827] text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-200">
      <nav className="bg-white dark:bg-[#1F2937] border-b border-[#E5E7EB] dark:border-[#374151] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo(Screen.LANDING)}>
                <div className="text-primary text-3xl">
                  <i className="ph-fill ph-asterisk-simple"></i>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">StudentOS</span>
              </div>
              <div className="hidden md:block relative w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <i className="ph ph-magnifying-glass text-lg"></i>
                </span>
                <input className="block w-full pl-10 pr-3 py-2 border border-transparent bg-gray-100 dark:bg-gray-800 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary transition-colors dark:text-gray-200" placeholder="Search topics..." type="text" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigateTo(Screen.LANDING)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">Home</button>
              <button className="text-gray-900 dark:text-white font-semibold border-b-2 border-gray-900 dark:border-white py-5">Community</button>
              <button onClick={() => navigateTo(Screen.JOBS)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">Jobs</button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">Messaging</button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Notifications">
                <i className="ph-fill ph-bell text-xl"></i>
              </button>
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Messages">
                <i className="ph-fill ph-chat-text text-xl"></i>
              </button>
              <div className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">U</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-[#1F2937] rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-[#374151] text-center">
              <div className="flex justify-center mb-3">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">U</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Welcome!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Join the community discussion</p>
            </div>
            <div className="space-y-1">
              <a className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-primary font-medium rounded-lg" href="#">
                <i className="ph-fill ph-house text-xl"></i>
                My Feed
              </a>
              <a className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors" href="#">
                <i className="ph-fill ph-fire text-xl"></i>
                Popular
              </a>
              <a className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors" href="#">
                <i className="ph-fill ph-bookmark-simple text-xl"></i>
                Bookmarks
              </a>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-4">
            {/* Create Post */}
            <div className="bg-white dark:bg-[#1F2937] rounded-xl p-4 shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex gap-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">U</span>
                </div>
                <input 
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-4 focus:ring-1 focus:ring-primary dark:text-white placeholder-gray-500" 
                  placeholder="Start a post or discussion..." 
                  type="text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePost()}
                />
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <i className="ph-fill ph-image text-blue-500"></i> Media
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <i className="ph-fill ph-link text-gray-500"></i> Link
                  </button>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={isSubmitting || !newPostContent.trim()}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-1.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white dark:bg-[#1F2937] rounded-xl p-8 shadow-sm border border-[#E5E7EB] dark:border-[#374151] text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading community posts...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-800 text-center">
                <i className="ph-fill ph-warning text-3xl text-red-500 mb-2"></i>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button 
                  onClick={fetchPosts}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && posts.length === 0 && (
              <div className="bg-white dark:bg-[#1F2937] rounded-xl p-8 shadow-sm border border-[#E5E7EB] dark:border-[#374151] text-center">
                <i className="ph-fill ph-chats-circle text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to start a discussion!</p>
              </div>
            )}

            {/* Posts List */}
            {!loading && !error && posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    {post.author.avatar ? (
                      <img alt={post.author.name} className="h-10 w-10 rounded-full object-cover" src={post.author.avatar} />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{post.author.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{post.author.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="More options">
                    <i className="ph-bold ph-dots-three text-2xl"></i>
                  </button>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <img src={post.imageUrl} alt="Post attachment" className="w-full object-cover max-h-96" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="flex gap-6">
                    <button 
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        post.isLiked 
                          ? 'text-primary' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-primary'
                      }`}
                    >
                      <i className={`ph-fill ph-heart text-lg`}></i> {post.likeCount}
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
                      <i className="ph-fill ph-chat-circle text-lg"></i> {post.commentCount}
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium">
                    <i className="ph-fill ph-share-network text-lg"></i> Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#1F2937] rounded-xl p-5 shadow-sm border border-[#E5E7EB] dark:border-[#374151]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Trending Today</h3>
                <a className="text-primary text-xs font-bold hover:underline" href="#">View all</a>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1 mb-0.5">
                    <span>Technology</span>
                    <span>•</span>
                    <span>Trending</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white hover:text-primary cursor-pointer transition-colors">#SummerInternships</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">12.5k posts</p>
                </div>
                <div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1 mb-0.5">
                    <span>Academic</span>
                    <span>•</span>
                    <span>Trending</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white hover:text-primary cursor-pointer transition-colors">#CS101</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">4.2k posts</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2 mb-3 text-primary dark:text-blue-400">
                <i className="ph-fill ph-shield-check text-xl"></i>
                <h3 className="font-bold text-sm">Community Rules</h3>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="text-blue-400">•</span>
                  Be respectful and constructive.
                </li>
                <li className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="text-blue-400">•</span>
                  No spam or self-promotion.
                </li>
                <li className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span className="text-blue-400">•</span>
                  Keep it professional.
                </li>
              </ul>
              <a className="text-primary text-xs font-bold hover:underline" href="#">Read full guidelines</a>
            </div>
            <div className="px-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                <button onClick={() => navigateTo(Screen.ABOUT)} className="hover:underline">About</button>
                <a className="hover:underline" href="#">Help Center</a>
                <a className="hover:underline" href="/privacy">Privacy & Terms</a>
                <span>StudentOS © 2024</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}