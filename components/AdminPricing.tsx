import React, { useState, useEffect, useMemo } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ClockIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from '@heroicons/react/24/solid';

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

const AVAILABLE_TOOLS = [
  { name: 'Select a tool...', slug: '', category: '' },
  { name: 'ATS Checker', slug: 'ats-checker', category: 'Career' },
  { name: 'Learning Plan', slug: 'learning-plan', category: 'Education' },
  { name: 'Plagiarism Checker', slug: 'plagiarism-checker', category: 'Productivity' },
];

export default function AdminPricing({ navigateTo: _navigateTo }: NavigationProps) {
  // Data states
  const [tools, setTools] = useState<Tool[]>([]);
  const [_settings, setSettings] = useState<AppSettings>({});
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

  // Delete states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Usage stats states
  const [usagePeriod, setUsagePeriod] = useState('30d');
  const [usageStats, setUsageStats] = useState<any>(null);
  const [usageLoading, setUsageLoading] = useState(true);

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
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch usage stats
  const fetchUsageStats = async (period: string) => {
    setUsageLoading(true);
    try {
      const res = await adminApi.getToolUsageStats(period);
      if (res.data) {
        setUsageStats(res.data);
      }
    } catch {
      console.error('Failed to fetch usage stats');
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStats(usagePeriod);
  }, [usagePeriod]);

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      toast.error('Failed to update tool');
    }
  };

  // Delete tool
  const handleDeleteTool = async () => {
    if (!deletingTool || deleteConfirmName !== deletingTool.name) return;
    setDeleting(true);
    try {
      const result = await adminApi.deleteTool(deletingTool.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${deletingTool.name}" deleted successfully`);
        setShowDeleteModal(false);
        setDeletingTool(null);
        setDeleteConfirmName('');
        fetchData();
        fetchUsageStats(usagePeriod);
      }
    } catch {
      toast.error('Failed to delete tool');
    } finally {
      setDeleting(false);
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
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Tools Management
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Manage platform tools, monitor usage, and configure pricing
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => toast('Audit Log feature coming soon!', { icon: '📋' })}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-4 py-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <ClockIcon className="w-[18px] h-[18px]" />
              <span>View Audit Log</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddToolModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
            >
              <PlusIcon className="w-[18px] h-[18px]" />
              <span>Add New Tool</span>
            </button>
          </div>
        </header>

        {/* ─── Tool Usage Statistics ─── */}
        <section className="mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary" />
              Tool Usage Statistics
            </h3>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setUsagePeriod(p)}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                    usagePeriod === p
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-[#1e2330] text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {usageLoading ? (
            <div className="flex items-center justify-center py-12">
              <GlobalLoader fullScreen={false} />
            </div>
          ) : !usageStats || usageStats.total_usages === 0 ? (
            <div className="py-12 text-center">
              <ChartBarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No usage data recorded yet
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Statistics will appear as users start using tools.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Total Uses
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {usageStats.total_usages.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-bold ${usageStats.total_trend_direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {usageStats.total_trend_direction === 'up' ? '↑' : '↓'} {usageStats.total_trend}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Active Users
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {usageStats.total_active_users.toLocaleString()}
                  </p>
                  <span
                    className={`text-xs font-bold ${usageStats.users_trend_direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {usageStats.users_trend_direction === 'up' ? '↑' : '↓'} {usageStats.users_trend}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Most Used
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {usageStats.stats[0]?.tool_name || '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {usageStats.stats[0]?.total_uses || 0} uses
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Least Used
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {usageStats.stats[usageStats.stats.length - 1]?.tool_name || '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {usageStats.stats[usageStats.stats.length - 1]?.total_uses || 0} uses
                  </p>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="mb-6 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-4">
                <div className="space-y-3">
                  {usageStats.stats.map((s: any) => {
                    const barColors: Record<string, string> = {
                      Career: 'bg-indigo-500',
                      Education: 'bg-blue-500',
                      Academic: 'bg-purple-500',
                      Productivity: 'bg-orange-500',
                    };
                    return (
                      <div key={s.tool_id} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-40 truncate">
                          {s.tool_name}
                        </span>
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6 overflow-hidden relative">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColors[s.category] || 'bg-gray-500'}`}
                            style={{ width: `${Math.max(s.percentage, 3)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-24 text-right">
                          {s.total_uses} ({s.percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Table */}
              <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Tool
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">
                        Uses
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">
                        Unique Users
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">
                        % Share
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {usageStats.stats.map((s: any) => (
                      <tr
                        key={s.tool_id}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {s.tool_name}
                          </p>
                          <p className="text-xs text-slate-400">{s.category}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white text-right">
                          {s.total_uses.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {s.unique_users.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 text-right">
                          {s.percentage}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold ${s.trend_direction === 'up' ? 'text-emerald-600' : 'text-red-500'}`}
                          >
                            {s.trend_direction === 'up' ? (
                              <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-3.5 h-3.5" />
                            )}
                            {s.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Manual Credit Allocation */}
        <section className="mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" />
              Manual Credit Allocation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Grant credits to users manually — for rewards, refunds, or promotions
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-end">
            <div className="md:col-span-2">
              <label
                htmlFor="grant-email"
                className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1 block"
              >
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
              <label
                htmlFor="grant-amount"
                className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1 block"
              >
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
                type="button"
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
                <GiftIcon className="w-[18px] h-[18px]" />
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
              type="button"
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
              <label
                htmlFor="referral-bonus"
                className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
              >
                Referral Reward (Credits)
              </label>
              <div className="relative">
                <input
                  id="referral-bonus"
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
              <button
                type="button"
                className="relative pb-4 text-sm font-bold text-primary dark:text-primary-dark"
              >
                Credit Pricing
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>
              </button>
              <button
                type="button"
                onClick={() => toast('Discount Coupons coming soon!', { icon: '🎟️' })}
                className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Discount Coupons
              </button>
              <button
                type="button"
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
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
                aria-label="Search tools"
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
                aria-label="Filter by plan type"
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
                      <th className="w-12 px-6 py-4" scope="col" aria-label="Select">
                        <input
                          aria-label="Select all tools"
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
                              aria-label={`Select ${tool.name}`}
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
                                type="button"
                                aria-label={`Edit credit cost for ${tool.name}`}
                                className="rounded-lg p-1.5 text-primary hover:bg-indigo-50 dark:text-primary dark:hover:bg-indigo-900/20 transition-colors"
                                title="Edit Credit Cost"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingTool(tool);
                                  setDeleteConfirmName('');
                                  setShowDeleteModal(true);
                                }}
                                type="button"
                                aria-label={`Delete ${tool.name}`}
                                className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete Tool"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                              <div className="flex items-center">
                                <label className="relative inline-flex cursor-pointer items-center">
                                  <input
                                    checked={tool.isActive}
                                    onChange={() => handleToggleTool(tool.id)}
                                    aria-label={`Toggle ${tool.name} active`}
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

      {/* Add Tool Modal */}
      {showAddToolModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Tool</h3>
            </div>
            <form onSubmit={handleCreateTool} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="new-tool-name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tool Name
                </label>
                <select
                  id="new-tool-name"
                  value={newTool.name}
                  onChange={(e) => {
                    const selected = AVAILABLE_TOOLS.find((t) => t.name === e.target.value);
                    if (selected) {
                      setNewTool({
                        ...newTool,
                        name: selected.name,
                        slug: selected.slug,
                        category: selected.category || newTool.category,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                  required
                >
                  {AVAILABLE_TOOLS.map((t) => (
                    <option key={t.slug || '__placeholder'} value={t.name} disabled={!t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={newTool.slug}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  placeholder="Auto-generated from tool selection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newTool.category}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  placeholder="Auto-set from tool selection"
                />
              </div>
              <div>
                <label
                  htmlFor="new-tool-credit-cost"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Credit Cost
                </label>
                <div className="relative">
                  <input
                    id="new-tool-credit-cost"
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
                <label
                  htmlFor="edit-tool-name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Tool Name
                </label>
                <input
                  id="edit-tool-name"
                  type="text"
                  value={editToolData.name}
                  onChange={(e) => setEditToolData({ ...editToolData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-tool-credit-cost"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Credit Cost
                </label>
                <div className="relative">
                  <input
                    id="edit-tool-credit-cost"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTool && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <TrashIcon className="w-5 h-5" />
                Delete Tool
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                This action cannot be undone. All usage history for this tool will also be deleted.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  You are about to delete <strong>"{deletingTool.name}"</strong>. Type the tool name
                  below to confirm.
                </p>
              </div>
              <div>
                <label
                  htmlFor="delete-confirm"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Type <strong className="text-red-600">"{deletingTool.name}"</strong> to confirm
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={deletingTool.name}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingTool(null);
                    setDeleteConfirmName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteTool}
                  disabled={deleteConfirmName !== deletingTool.name || deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
