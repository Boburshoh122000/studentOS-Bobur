
import React, { useState, useEffect, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { blogApi } from '../src/services/api';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  author?: {
    studentProfile?: {
      fullName?: string;
    };
  };
}

interface EditorData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  slug: string;
  coverImageUrl: string;
  coverImagePreview: string;
}

const CATEGORIES = ['Career Advice', 'Study Tips', 'Productivity', 'Student Life', 'Tools', 'Financial Aid', 'Events'];

export default function AdminBlog({ navigateTo }: NavigationProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor state
  const [editorData, setEditorData] = useState<EditorData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'Career Advice',
    slug: '',
    coverImageUrl: '',
    coverImagePreview: ''
  });

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (editorData.title && !editorData.id) {
      const generatedSlug = editorData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setEditorData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [editorData.title]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await blogApi.adminList();
      if (error) {
        toast.error('Failed to load posts');
        console.error(error);
      } else if (data) {
        setPosts(data);
      }
    } catch (err) {
      toast.error('Network error loading posts');
    }
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    setEditorData({
      title: '',
      content: '',
      excerpt: '',
      category: 'Career Advice',
      slug: '',
      coverImageUrl: '',
      coverImagePreview: ''
    });
    setView('editor');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditorData({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.tags[0] || 'Career Advice',
      slug: post.slug,
      coverImageUrl: post.coverImageUrl || '',
      coverImagePreview: post.coverImageUrl || ''
    });
    setView('editor');
  };

  const handleSaveDraft = async () => {
    if (!editorData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: editorData.title,
        content: editorData.content,
        excerpt: editorData.excerpt || editorData.content.substring(0, 150),
        coverImageUrl: editorData.coverImageUrl || undefined,
        tags: [editorData.category],
        status: 'DRAFT' as const
      };

      let result;
      if (editorData.id) {
        result = await blogApi.update(editorData.id, postData);
      } else {
        result = await blogApi.create(postData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Draft saved successfully!');
        await fetchPosts();
        setView('list');
      }
    } catch (err) {
      toast.error('Failed to save draft');
    }
    setIsSaving(false);
  };

  const handlePublish = async () => {
    if (!editorData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!editorData.content.trim()) {
      toast.error('Please enter content');
      return;
    }

    setIsSaving(true);
    try {
      const postData = {
        title: editorData.title,
        content: editorData.content,
        excerpt: editorData.excerpt || editorData.content.substring(0, 150),
        coverImageUrl: editorData.coverImageUrl || undefined,
        tags: [editorData.category],
        status: 'PUBLISHED' as const
      };

      let result;
      if (editorData.id) {
        result = await blogApi.update(editorData.id, postData);
      } else {
        result = await blogApi.create(postData);
      }

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Post published successfully!');
        await fetchPosts();
        setView('list');
      }
    } catch (err) {
      toast.error('Failed to publish post');
    }
    setIsSaving(false);
  };

  const handleDeletePost = async (id?: string) => {
    const postId = id || editorData.id;
    if (!postId) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await blogApi.delete(postId);
      if (error) {
        toast.error('Failed to delete post');
      } else {
        toast.success('Post deleted successfully');
        await fetchPosts();
        if (view === 'editor') setView('list');
      }
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const { error } = await blogApi.update(post.id, { status: newStatus });
      if (error) {
        toast.error('Failed to update post');
      } else {
        toast.success(newStatus === 'PUBLISHED' ? 'Post published!' : 'Post unpublished');
        await fetchPosts();
      }
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditorData(prev => ({
        ...prev,
        coverImageUrl: base64,
        coverImagePreview: base64
      }));
      toast.success('Image uploaded!');
    };
    reader.readAsDataURL(file);
  };

  // Filter posts based on active tab and search
  const filteredPosts = posts.filter(post => {
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'published' && post.status === 'PUBLISHED') ||
      (activeTab === 'drafts' && post.status === 'DRAFT');
    
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAuthorName = (post: BlogPost) => {
    return post.author?.studentProfile?.fullName || 'Admin';
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <aside className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 relative z-20`}>
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
        >
          <span className="material-symbols-outlined text-[14px]">{isSidebarExpanded ? 'chevron_left' : 'chevron_right'}</span>
        </button>

        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`} onClick={() => navigateTo(Screen.LANDING)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">StudentOS</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Admin Console</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => navigateTo(Screen.ADMIN_DASHBOARD)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Dashboard" : ""}
              >
                <span className="material-symbols-outlined">dashboard</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Employers" : ""}
              >
                <span className="material-symbols-outlined">work</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Employers</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_PRICING)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Pricing" : ""}
              >
                <span className="material-symbols-outlined">payments</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Pricing</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_USERS)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Users" : ""}
              >
                <span className="material-symbols-outlined">group</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Users</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Scholarships" : ""}
              >
                <span className="material-symbols-outlined">school</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_BLOG)}
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Blog Management" : ""}
              >
                <span className="material-symbols-outlined fill-1">article</span>
                {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Blog Management</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_ROLES)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Roles & Permissions" : ""}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>}
              </button>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className={`flex items-center gap-3 px-2 ${!isSidebarExpanded && 'justify-center px-0'}`}>
              <div className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuz7qhWBsQWRjQG1k4CGzFYXhvsFourXvcGFagkS8Ygc6l63kf_qKcXMNXo-XVoFmsea9D7RojO2v9OQMLgttwk1_1u0Sefnl9iGveWDk1yjDa_QNz60aKEgmugT98Txyt38TOYyQMofKNHNsNclFGBFIyOx-Pp3k9dCugBZvO2F-jiAog2elvqhTUfgxkZ76fxUGvaAwgKP6ELOG_Pjri33lWH4w8m1KEmJ6TIWTLY4NQXPNvKCff1WFCaRn_73oR3o1z2hQVLt4')" }}></div>
              <div className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">Jane Doe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Super Admin</p>
              </div>
            </div>
            <button 
              onClick={() => navigateTo(Screen.SIGN_IN)} 
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${!isSidebarExpanded ? 'justify-center' : 'justify-center'}`}
              title={!isSidebarExpanded ? "Logout" : ""}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          
          {view === 'list' && (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Blog Management</h2>
                  <p className="text-base text-slate-500 dark:text-slate-400">Manage posts, track performance, and organize content.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Create New Post</span>
                  </button>
                </div>
              </header>
              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Posts</p>
                    <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">description</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{posts.length}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                    <span>+{posts.filter(p => new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</span>
                    <span className="font-normal text-slate-500 dark:text-slate-400 ml-1">this month</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Published</p>
                    <span className="material-symbols-outlined text-emerald-500/80 text-xl">check_circle</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{posts.filter(p => p.status === 'PUBLISHED').length}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Live posts</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Drafts</p>
                    <span className="material-symbols-outlined text-orange-500/80 text-xl">edit_note</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{posts.filter(p => p.status === 'DRAFT').length}</p>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span>Pending review</span>
                  </div>
                </div>
              </section>
              <section className="flex flex-col gap-4">
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-8">
                    <button 
                      onClick={() => setActiveTab('all')}
                      className={`relative pb-4 text-sm font-${activeTab === 'all' ? 'bold text-primary dark:text-primary-dark' : 'medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} transition-colors`}
                    >
                      All Posts
                      {activeTab === 'all' && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>}
                    </button>
                    <button 
                      onClick={() => setActiveTab('published')}
                      className={`relative pb-4 text-sm font-${activeTab === 'published' ? 'bold text-primary dark:text-primary-dark' : 'medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} transition-colors`}
                    >
                      Published
                      {activeTab === 'published' && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>}
                    </button>
                    <button 
                      onClick={() => setActiveTab('drafts')}
                      className={`relative pb-4 text-sm font-${activeTab === 'drafts' ? 'bold text-primary dark:text-primary-dark' : 'medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'} transition-colors`}
                    >
                      Drafts
                      {activeTab === 'drafts' && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                  <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
                    <input 
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none" 
                      placeholder="Search posts..." 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <span className="material-symbols-outlined text-4xl mb-2">article</span>
                      <p>No posts found</p>
                      <button 
                        onClick={handleCreateNew}
                        className="mt-4 text-primary hover:underline text-sm font-medium"
                      >
                        Create your first post
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                            <tr>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Author</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredPosts.map((post) => (
                              <tr key={post.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{post.excerpt || post.content.substring(0, 50)}...</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-white/5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {post.tags[0] || 'Uncategorized'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                                      {getAuthorInitials(getAuthorName(post))}
                                    </div>
                                    <span className="text-sm text-slate-900 dark:text-white">{getAuthorName(post)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {formatDate(post.status === 'PUBLISHED' ? post.publishedAt : post.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                  {post.status === 'PUBLISHED' ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                      Published
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                      <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                                      Draft
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleEditPost(post)}
                                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" 
                                      title="Edit"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </button>
                                    <button 
                                      onClick={() => handleToggleStatus(post)}
                                      className={`rounded-lg p-1.5 ${post.status === 'PUBLISHED' ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'} transition-colors`}
                                      title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                    >
                                      <span className="material-symbols-outlined text-[20px]">
                                        {post.status === 'PUBLISHED' ? 'unpublished' : 'publish'}
                                      </span>
                                    </button>
                                    <button 
                                      onClick={() => handleDeletePost(post.id)}
                                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                      title="Delete"
                                    >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredPosts.length} of {posts.length} posts</p>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </>
          )}

          {view === 'editor' && (
            <div className="h-full flex flex-col">
              <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('list')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {editorData.id ? 'Edit Post' : 'Create New Post'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {editorData.id ? 'Editing existing post' : 'Drafting a new blog entry'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-primary text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSaving ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </header>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Editor */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Title</label>
                        <input 
                          type="text" 
                          placeholder="Enter post title..." 
                          className="w-full text-2xl font-bold bg-transparent border-0 border-b-2 border-slate-100 dark:border-slate-700 focus:border-primary focus:ring-0 px-0 py-2 placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
                          value={editorData.title}
                          onChange={(e) => setEditorData({...editorData, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Excerpt (optional)</label>
                        <input 
                          type="text" 
                          placeholder="Brief summary of your post..." 
                          className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-primary px-3 py-2 placeholder-slate-400 dark:placeholder-slate-600 transition-colors"
                          value={editorData.excerpt}
                          onChange={(e) => setEditorData({...editorData, excerpt: e.target.value})}
                        />
                      </div>
                      <div className="min-h-[400px] mt-4">
                        <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Content</label>
                        <textarea 
                          className="w-full h-full min-h-[400px] resize-none bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-primary p-4 text-slate-600 dark:text-slate-300 leading-relaxed"
                          placeholder="Start writing your amazing content here..."
                          value={editorData.content}
                          onChange={(e) => setEditorData({...editorData, content: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Settings */}
                <div className="w-full lg:w-80 flex flex-col gap-6">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Post Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Category</label>
                        <select 
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 py-2 px-3 text-sm focus:border-primary focus:ring-primary"
                          value={editorData.category}
                          onChange={(e) => setEditorData({...editorData, category: e.target.value})}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Slug</label>
                        <input 
                          type="text" 
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 py-2 px-3 text-sm text-slate-500" 
                          value={editorData.slug}
                          onChange={(e) => setEditorData({...editorData, slug: e.target.value})}
                          placeholder="auto-generated-from-title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Cover Image</label>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors overflow-hidden"
                        >
                          {editorData.coverImagePreview ? (
                            <div className="relative w-full">
                              <img 
                                src={editorData.coverImagePreview} 
                                alt="Cover preview" 
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditorData(prev => ({...prev, coverImageUrl: '', coverImagePreview: ''}));
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">image</span>
                              <span className="text-xs text-slate-500">Click to upload cover image</span>
                              <span className="text-xs text-slate-400 mt-1">Max 2MB</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {editorData.id && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Danger Zone</h3>
                      <button 
                        onClick={() => handleDeletePost()}
                        className="w-full py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
