import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import toast from 'react-hot-toast';

interface Scholarship {
  id: string;
  title: string;
  institution: string;
  country: string;
  studyLevel: string;
  awardType: string;
  awardAmount: string | null;
  deadline: string | null;
  description: string | null;
  applicationUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  published: number;
  pending: number;
  draft: number;
  total: number;
  totalFunding: number;
}

const emptyScholarship = {
  title: '',
  institution: '',
  country: 'USA',
  studyLevel: 'UNDERGRADUATE',
  awardType: 'Full Scholarship',
  awardAmount: '',
  deadline: '',
  description: '',
  applicationUrl: '',
  status: 'DRAFT' as const,
};

const countries = [
  'USA',
  'UK',
  'Canada',
  'Germany',
  'Australia',
  'France',
  'Netherlands',
  'Japan',
  'South Korea',
  'Other',
];
const studyLevels = ['HIGHSCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE', 'PHD', 'ANY'];
const awardTypes = [
  'Full Scholarship',
  'Partial Scholarship',
  'Tuition Only',
  'Living Expenses',
  'Research Grant',
];

export default function AdminScholarships({ navigateTo }: NavigationProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editorData, setEditorData] = useState(emptyScholarship);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    fetchScholarships();
    fetchStats();
  }, [statusFilter, currentPage]);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      const response = await scholarshipApi.adminList({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
      });
      setScholarships(response.data.scholarships || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      console.error('Failed to fetch scholarships:', error);
      toast.error('Failed to load scholarships');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await scholarshipApi.adminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchScholarships();
  };

  const handleCreate = () => {
    setEditingId(null);
    setEditorData(emptyScholarship);
    setShowModal(true);
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingId(scholarship.id);
    setEditorData({
      title: scholarship.title,
      institution: scholarship.institution,
      country: scholarship.country,
      studyLevel: scholarship.studyLevel,
      awardType: scholarship.awardType,
      awardAmount: scholarship.awardAmount || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      description: scholarship.description || '',
      applicationUrl: scholarship.applicationUrl || '',
      status: scholarship.status,
    });
    setShowModal(true);
  };

  const handleQuickEdit = (scholarship: Scholarship) => {
    setSelectedId(scholarship.id);
    setEditorData({
      title: scholarship.title,
      institution: scholarship.institution,
      country: scholarship.country,
      studyLevel: scholarship.studyLevel,
      awardType: scholarship.awardType,
      awardAmount: scholarship.awardAmount || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      description: scholarship.description || '',
      applicationUrl: scholarship.applicationUrl || '',
      status: scholarship.status,
    });
  };

  const handleSave = async () => {
    if (!editorData.title || !editorData.institution) {
      toast.error('Title and Institution are required');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...editorData,
        deadline: editorData.deadline ? new Date(editorData.deadline).toISOString() : null,
      };

      if (editingId) {
        await scholarshipApi.update(editingId, data);
        toast.success('Scholarship updated successfully');
      } else {
        await scholarshipApi.create(data);
        toast.success('Scholarship created successfully');
      }

      setShowModal(false);
      setEditingId(null);
      setEditorData(emptyScholarship);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to save scholarship:', error);
      toast.error('Failed to save scholarship');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = async () => {
    if (!selectedId) return;

    setIsSaving(true);
    try {
      const data = {
        ...editorData,
        deadline: editorData.deadline ? new Date(editorData.deadline).toISOString() : null,
      };

      await scholarshipApi.update(selectedId, data);
      toast.success('Changes saved');
      setSelectedId(null);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      await scholarshipApi.delete(id);
      toast.success('Scholarship deleted');
      if (selectedId === id) setSelectedId(null);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete scholarship');
    }
  };

  const handleToggleStatus = async (scholarship: Scholarship) => {
    const newStatus = scholarship.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await scholarshipApi.update(scholarship.id, { status: newStatus });
      toast.success(`Scholarship ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Published
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
            Draft
          </span>
        );
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      USA: '🇺🇸',
      UK: '🇬🇧',
      Canada: '🇨🇦',
      Germany: '🇩🇪',
      Australia: '🇦🇺',
      France: '🇫🇷',
      Netherlands: '🇳🇱',
      Japan: '🇯🇵',
      'South Korea': '🇰🇷',
    };
    return flags[country] || '🌍';
  };

  const selectedScholarship = scholarships.find((s) => s.id === selectedId);

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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Pricing' : ''}
              >
                <span className="material-symbols-outlined">payments</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Pricing</span>
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
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Scholarships' : ''}
              >
                <span className="material-symbols-outlined fill-1">school</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">Scholarships</span>
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
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => navigateTo(Screen.SIGN_IN)}
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors justify-center`}
              title={!isSidebarExpanded ? 'Logout' : ''}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Scholarship Management
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Create, edit, and manage scholarship opportunities
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 group"
              >
                <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">
                  add
                </span>
                <span>Add Scholarship</span>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Scholarships
                </p>
                <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">
                  check_circle
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.published || 0}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Review
                </p>
                <span className="material-symbols-outlined text-orange-500/80 text-xl">
                  pending_actions
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.pending || 0}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Funding
                </p>
                <span className="material-symbols-outlined text-emerald-600/80 text-xl">
                  monetization_on
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatFunding(stats?.totalFunding || 0)}
              </p>
            </div>
          </section>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 mb-4">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                search
              </span>
              <input
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
                placeholder="Search scholarship, university..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Scholarship Name / University
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Deadline
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Country
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-2 text-sm text-slate-500">Loading scholarships...</p>
                      </td>
                    </tr>
                  ) : scholarships.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
                          school
                        </span>
                        <p className="text-sm text-slate-500">No scholarships found</p>
                      </td>
                    </tr>
                  ) : (
                    scholarships.map((scholarship) => (
                      <tr
                        key={scholarship.id}
                        onClick={() => handleQuickEdit(scholarship)}
                        className={`group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${selectedId === scholarship.id ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold">
                              <span className="material-symbols-outlined text-xl">school</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {scholarship.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {scholarship.institution}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-white">
                            {formatDate(scholarship.deadline)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCountryFlag(scholarship.country)}</span>{' '}
                            {scholarship.country}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                          {scholarship.awardAmount || 'TBD'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(scholarship.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(scholarship);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                              title={scholarship.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {scholarship.status === 'PUBLISHED'
                                  ? 'visibility_off'
                                  : 'visibility'}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(scholarship);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(scholarship.id);
                              }}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
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
                Showing {scholarships.length} of {pagination.total} scholarships
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage >= pagination.pages}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Quick Edit Panel */}
          {selectedScholarship && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quick Edit: {selectedScholarship.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickSave}
                    disabled={isSaving}
                    className="text-sm font-bold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Scholarship Title
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      type="text"
                      value={editorData.title}
                      onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        University
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="text"
                        value={editorData.institution}
                        onChange={(e) =>
                          setEditorData({ ...editorData, institution: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Country
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={editorData.country}
                        onChange={(e) => setEditorData({ ...editorData, country: e.target.value })}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      rows={3}
                      value={editorData.description}
                      onChange={(e) =>
                        setEditorData({ ...editorData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Funding Amount
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="text"
                        placeholder="$25,000 or Full Tuition"
                        value={editorData.awardAmount}
                        onChange={(e) =>
                          setEditorData({ ...editorData, awardAmount: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Deadline
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="date"
                        value={editorData.deadline}
                        onChange={(e) => setEditorData({ ...editorData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Official Link
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      type="url"
                      value={editorData.applicationUrl}
                      onChange={(e) =>
                        setEditorData({ ...editorData, applicationUrl: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      value={editorData.status}
                      onChange={(e) =>
                        setEditorData({ ...editorData, status: e.target.value as any })
                      }
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Scholarship' : 'Add New Scholarship'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Scholarship Title *
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  type="text"
                  value={editorData.title}
                  onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                  placeholder="e.g., Global Leaders Fellowship"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Institution *
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="text"
                    value={editorData.institution}
                    onChange={(e) => setEditorData({ ...editorData, institution: e.target.value })}
                    placeholder="e.g., Oxford University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Country
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.country}
                    onChange={(e) => setEditorData({ ...editorData, country: e.target.value })}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Study Level
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.studyLevel}
                    onChange={(e) => setEditorData({ ...editorData, studyLevel: e.target.value })}
                  >
                    {studyLevels.map((l) => (
                      <option key={l} value={l}>
                        {l.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Award Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.awardType}
                    onChange={(e) => setEditorData({ ...editorData, awardType: e.target.value })}
                  >
                    {awardTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Funding Amount
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="text"
                    value={editorData.awardAmount}
                    onChange={(e) => setEditorData({ ...editorData, awardAmount: e.target.value })}
                    placeholder="$25,000 or Full Tuition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Deadline
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="date"
                    value={editorData.deadline}
                    onChange={(e) => setEditorData({ ...editorData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={4}
                  value={editorData.description}
                  onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                  placeholder="Eligibility criteria, benefits, and requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Application URL
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  type="url"
                  value={editorData.applicationUrl}
                  onChange={(e) => setEditorData({ ...editorData, applicationUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={editorData.status}
                  onChange={(e) => setEditorData({ ...editorData, status: e.target.value as any })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Scholarship' : 'Create Scholarship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
