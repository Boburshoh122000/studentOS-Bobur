import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';

// Types
interface Tool {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  icon?: string;
  creditCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

interface AppSettings {
  referral_bonus?: string;
  early_bird_active?: string;
  default_welcome_credits?: string;
}

export default function AdminPricing({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Data states
  const [tools, setTools] = useState<Tool[]>([]);
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [referralBonus, setReferralBonus] = useState('100');
  const [earlyBirdActive, setEarlyBirdActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'premium' | 'free'>('all');

  // Modals
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showEditToolModal, setShowEditToolModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // New tool form
  const [newTool, setNewTool] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'Productivity',
    icon: 'extension',
    creditCost: 0,
  });

  // Edit tool form
  const [editToolData, setEditToolData] = useState({
    name: '',
    creditCost: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [toolsRes, settingsRes] = await Promise.all([
        adminApi.getTools(),
        adminApi.getSettings(),
      ]);

      if (toolsRes.data?.data) {
        setTools(toolsRes.data.data);
      }

      if (settingsRes.data?.data) {
        setSettings(settingsRes.data.data);
        setReferralBonus(settingsRes.data.data.referral_bonus || '100');
        setEarlyBirdActive(settingsRes.data.data.early_bird_active === 'true');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter tools by search and plan type
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlan =
        filterPlan === 'all' ||
        (filterPlan === 'premium' && tool.creditCost > 0) ||
        (filterPlan === 'free' && tool.creditCost === 0);

      return matchesSearch && matchesPlan;
    });
  }, [tools, searchQuery, filterPlan]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const result = await adminApi.updateSettings({
        referral_bonus: referralBonus,
        early_bird_active: String(earlyBirdActive),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTool = async (toolId: string) => {
    try {
      const result = await adminApi.toggleTool(toolId);
      if (result.error) {
        toast.error(result.error);
      } else {
        // Update local state
        setTools((prev) =>
          prev.map((t) => (t.id === toolId ? { ...t, isActive: !t.isActive } : t))
        );
        toast.success('Tool status updated');
      }
    } catch (error) {
      toast.error('Failed to toggle tool');
    }
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTool.name.trim() || !newTool.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      const result = await adminApi.createTool({
        name: newTool.name,
        slug: newTool.slug,
        description: newTool.description || undefined,
        category: newTool.category,
        icon: newTool.icon,
        creditCost: newTool.creditCost,
        isActive: true,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Tool created successfully!');
        setShowAddToolModal(false);
        setNewTool({
          name: '',
          slug: '',
          description: '',
          category: 'Productivity',
          icon: 'extension',
          creditCost: 0,
        });
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to create tool');
    }
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setEditToolData({
      name: tool.name,
      creditCost: tool.creditCost,
    });
    setShowEditToolModal(true);
  };

  const handleUpdateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    try {
      const result = await adminApi.updateTool(editingTool.id, {
        name: editToolData.name,
        creditCost: editToolData.creditCost,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Tool updated successfully!');
        setShowEditToolModal(false);
        setEditingTool(null);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update tool');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getIconColor = (category: string) => {
    const colors: Record<string, string> = {
      'Career Tools': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
      Recruitment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      Education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      Academic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      Productivity: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300';
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <aside
        className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 relative z-20`}
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div
              className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
              onClick={() => navigateTo(Screen.LANDING)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">
                  StudentOS
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Admin Console
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => navigateTo(Screen.ADMIN_DASHBOARD)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Dashboard' : ''}
              >
                <span className="material-symbols-outlined">dashboard</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Employers' : ''}
              >
                <span className="material-symbols-outlined">work</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Employers</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_PRICING)}
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Pricing' : ''}
              >
                <span className="material-symbols-outlined fill-1">payments</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">Pricing</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_USERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Users' : ''}
              >
                <span className="material-symbols-outlined">group</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Users</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Scholarships' : ''}
              >
                <span className="material-symbols-outlined">school</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_BLOG)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Blog Management' : ''}
              >
                <span className="material-symbols-outlined">article</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Blog Management</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_ROLES)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Roles & Permissions' : ''}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_NOTIFICATIONS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Notifications' : ''}
              >
                <span className="material-symbols-outlined">notifications</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_TEAM)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Team Management' : ''}
              >
                <span className="material-symbols-outlined">groups</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Team Management</span>
                )}
              </button>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => navigateTo(Screen.ADMIN_SETTINGS)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                AD
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 text-left ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  Admin
                </p>
                <p className="text-xs text-primary dark:text-primary-light whitespace-nowrap">
                  Profile Settings
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${!isSidebarExpanded ? 'justify-center' : 'justify-center'} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!isSidebarExpanded ? 'Logout' : ''}
            >
              <span className="material-symbols-outlined text-lg">
                {isLoggingOut ? 'hourglass_empty' : 'logout'}
              </span>
              {isSidebarExpanded && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Tool Pricing Management
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Configure credit costs and manage platform tools
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => toast('Audit Log feature coming soon!', { icon: '📋' })}
                className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-4 py-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">history</span>
                <span>View Audit Log</span>
              </button>
              <button
                onClick={() => setShowAddToolModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Add New Tool</span>
              </button>
            </div>
          </header>

          {/* Manual Credit Allocation */}
          <section className="mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  account_balance_wallet
                </span>
                Manual Credit Allocation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Grant credits to users manually — for rewards, refunds, or promotions
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  User Email
                </label>
                <input
                  type="email"
                  id="grant-email"
                  placeholder="user@example.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151827] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1 block">
                  Credits
                </label>
                <input
                  type="number"
                  id="grant-amount"
                  placeholder="100"
                  min="1"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151827] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <button
                  onClick={async () => {
                    const emailEl = document.getElementById('grant-email') as HTMLInputElement;
                    const amountEl = document.getElementById('grant-amount') as HTMLInputElement;
                    const email = emailEl?.value?.trim();
                    const amount = parseInt(amountEl?.value);
                    if (!email) {
                      toast.error('Enter a user email');
                      return;
                    }
                    if (!amount || amount <= 0) {
                      toast.error('Enter a valid amount');
                      return;
                    }
                    try {
                      const { data, error } = await adminApi.grantCredits({ email, amount });
                      if (error) {
                        toast.error(error);
                        return;
                      }
                      toast.success(
                        `Granted ${amount} credits to ${email}. New balance: ${(data as any)?.newBalance}`
                      );
                      emailEl.value = '';
                      amountEl.value = '';
                    } catch {
                      toast.error('Failed to grant credits');
                    }
                  }}
                  className="w-full px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">redeem</span>
                  Grant Credits
                </button>
              </div>
            </div>
          </section>

          {/* Global Configuration */}
          <section className="mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Global Configuration
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage credit rewards and promotional settings
                </p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* System Currency - Read Only */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  System Currency
                </label>
                <div className="flex items-center gap-2 rounded-lg border-slate-200 bg-[#f6f6f8] py-2.5 px-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-white/5 dark:text-white">
                  <span className="text-lg">💎</span>
                  <span>Credits</span>
                </div>
              </div>

              {/* Referral Reward */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Referral Reward (Credits)
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border-slate-200 bg-[#f6f6f8] py-2 pl-3 pr-10 text-sm font-medium text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-white/5 dark:text-white"
                    type="number"
                    value={referralBonus}
                    onChange={(e) => setReferralBonus(e.target.value)}
                    min="0"
                  />
                  <span className="absolute right-3 top-2 text-lg">💎</span>
                </div>
                <p className="text-xs text-slate-400">Credits given when a user invites a friend</p>
              </div>

              {/* Early Bird Access Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Early Bird Access
                </label>
                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      checked={earlyBirdActive}
                      onChange={(e) => setEarlyBirdActive(e.target.checked)}
                      className="peer sr-only"
                      type="checkbox"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                    <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">
                      {earlyBirdActive ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Tools Table */}
          <section className="flex flex-col gap-4">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-8">
                <button className="relative pb-4 text-sm font-bold text-primary dark:text-primary-dark">
                  Credit Pricing
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>
                </button>
                <button
                  onClick={() => toast('Discount Coupons coming soon!', { icon: '🎟️' })}
                  className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Discount Coupons
                </button>
                <button
                  onClick={() => toast('Bundles coming soon!', { icon: '📦' })}
                  className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Bundles
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                  search
                </span>
                <input
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
                  placeholder="Search tools..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as 'all' | 'premium' | 'free')}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">All Plans</option>
                  <option value="premium">Premium Only</option>
                  <option value="free">Free Only</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <GlobalLoader fullScreen={false} />
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                      <tr>
                        <th className="w-12 px-6 py-4">
                          <input
                            className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10"
                            type="checkbox"
                          />
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Tool Name
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Category
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Plan Type
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Credit Cost
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Last Updated
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredTools.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <p className="text-slate-500">No tools found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTools.map((tool) => (
                          <tr
                            key={tool.id}
                            className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <input
                                className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10"
                                type="checkbox"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${getIconColor(tool.category)}`}
                                >
                                  <span className="material-symbols-outlined">
                                    {tool.icon || 'extension'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {tool.name}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {tool.description || tool.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {tool.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {tool.creditCost > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                  Premium
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  Free
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                {tool.creditCost} <span className="text-lg">💎</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(tool.updatedAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditTool(tool)}
                                  className="rounded-lg p-1.5 text-primary hover:bg-indigo-50 dark:text-primary dark:hover:bg-indigo-900/20 transition-colors"
                                  title="Edit Credit Cost"
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <div className="flex items-center">
                                  <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                      checked={tool.isActive}
                                      onChange={() => handleToggleTool(tool.id)}
                                      className="peer sr-only"
                                      type="checkbox"
                                    />
                                    <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                                  </label>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {filteredTools.length} of {tools.length} tools
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add Tool Modal */}
      {showAddToolModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Tool</h3>
            </div>
            <form onSubmit={handleCreateTool} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                  placeholder="e.g., Grammar Checker"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={newTool.slug}
                  onChange={(e) => setNewTool({ ...newTool, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                  placeholder="e.g., grammar-checker"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newTool.category}
                  onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Career Tools">Career Tools</option>
                  <option value="Academic">Academic</option>
                  <option value="Education">Education</option>
                  <option value="Recruitment">Recruitment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Credit Cost
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newTool.creditCost}
                    onChange={(e) =>
                      setNewTool({ ...newTool, creditCost: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                    min="0"
                  />
                  <span className="absolute right-3 top-2 text-lg">💎</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Set to 0 for free tools</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddToolModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark"
                >
                  Create Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {showEditToolModal && editingTool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Tool</h3>
              <p className="text-sm text-slate-500">{editingTool.name}</p>
            </div>
            <form onSubmit={handleUpdateTool} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  value={editToolData.name}
                  onChange={(e) => setEditToolData({ ...editToolData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Credit Cost
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editToolData.creditCost}
                    onChange={(e) =>
                      setEditToolData({
                        ...editToolData,
                        creditCost: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                    min="0"
                  />
                  <span className="absolute right-3 top-2 text-lg">💎</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditToolModal(false);
                    setEditingTool(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
