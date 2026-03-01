import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  StarIcon,
  TrashIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

// ─── Types ───────────────────────────────────────────────────────────
interface Employer {
  id: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  verificationStatus: string;
  isFeatured: boolean;
  createdAt: string;
  user: {
    email: string;
    isActive: boolean;
    createdAt: string;
    studentProfile?: { fullName: string | null } | null;
  };
  _count: { jobs: number };
}

interface Stats {
  totalEmployers: number;
  pendingApprovals: number;
  activeVacancies: number;
  featuredPartners: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Color helper for company avatars ────────────────────────────────
const AVATAR_COLORS = [
  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-700 dark:text-cyan-300' },
  { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Status badge component ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  const dotStyles: Record<string, string> = {
    verified: 'bg-emerald-500',
    pending: 'bg-orange-500',
    rejected: 'bg-red-500',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.pending}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || dotStyles.pending}`}></span>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
export default function AdminEmployers({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Data state
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEmployers: 0,
    pendingApprovals: 0,
    activeVacancies: 0,
    featuredPartners: 0,
  });
  const [industries, setIndustries] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    industry: '',
    website: '',
    repName: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch employers whenever filters change
  useEffect(() => {
    fetchEmployers();
  }, [debouncedSearch, statusFilter, industryFilter, pagination.page]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // ─── API calls ─────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await adminApi.getEmployerStats();
      if (res.data) setStats(res.data as Stats);
    } catch {
      console.error('Failed to fetch employer stats');
    }
  };

  const fetchEmployers = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (industryFilter) params.industry = industryFilter;

      const res = await adminApi.getEmployers(params);
      const data = res.data as any;
      if (data) {
        setEmployers(data.employers || []);
        if (data.industries) setIndustries(data.industries);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch {
      toast.error('Failed to load employers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.companyName) {
      toast.error('Email and company name are required');
      return;
    }
    try {
      setIsSaving(true);
      await adminApi.createEmployer(formData);
      toast.success('Employer created successfully');
      setShowAddModal(false);
      setFormData({ companyName: '', email: '', industry: '', website: '', repName: '' });
      fetchEmployers();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create employer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingEmployer) return;
    try {
      setIsSaving(true);
      await adminApi.updateEmployer(editingEmployer.id, {
        companyName: formData.companyName,
        industry: formData.industry || null,
        website: formData.website || null,
      });
      toast.success('Employer updated');
      setShowEditModal(false);
      setEditingEmployer(null);
      fetchEmployers();
    } catch {
      toast.error('Failed to update employer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await adminApi.updateEmployer(id, { verificationStatus: 'verified' });
      toast.success('Employer verified');
      fetchEmployers();
      fetchStats();
    } catch {
      toast.error('Failed to verify employer');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteEmployer(id);
      toast.success('Employer deleted');
      setShowDeleteConfirm(null);
      fetchEmployers();
      fetchStats();
    } catch {
      toast.error('Failed to delete employer');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Company', 'Industry', 'Representative', 'Email', 'Status', 'Jobs', 'Created'];
    const rows = employers.map((e) => [
      e.companyName,
      e.industry || '',
      e.user.studentProfile?.fullName || '',
      e.user.email,
      e.verificationStatus,
      e._count.jobs,
      new Date(e.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employers_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const openEditModal = (emp: Employer) => {
    setEditingEmployer(emp);
    setFormData({
      companyName: emp.companyName,
      email: emp.user.email,
      industry: emp.industry || '',
      website: emp.website || '',
      repName: emp.user.studentProfile?.fullName || '',
    });
    setShowEditModal(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // JSX
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      {/* ─── Sidebar (unchanged) ─────────────────────────────────── */}
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
                <AcademicCapIcon className="w-6 h-6" />
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
                <Squares2X2Icon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Employers' : ''}
              >
                <BriefcaseIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">Employers</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_PRICING)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Pricing' : ''}
              >
                <CreditCardIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Pricing</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_USERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Users' : ''}
              >
                <UsersIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Users</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Scholarships' : ''}
              >
                <AcademicCapIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_BLOG)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Blog Management' : ''}
              >
                <DocumentTextIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Blog Management</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_ROLES)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Roles & Permissions' : ''}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_NOTIFICATIONS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Notifications' : ''}
              >
                <BellIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_TEAM)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Team Management' : ''}
              >
                <UsersIcon className="w-5 h-5" />
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
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors justify-center ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Employers
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400">
                Manage partner accounts and recruitment activity
              </p>
            </div>
            <div className="flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                  placeholder="Search employers, industries, or contact persons..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({
                    companyName: '',
                    email: '',
                    industry: '',
                    website: '',
                    repName: '',
                  });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                <PlusIcon className="w-[18px] h-[18px]" />
                <span>Add Employer</span>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Employers
                </p>
                <BuildingOffice2Icon className="w-5 h-5 text-primary/60 dark:text-primary-dark/60" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalEmployers.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span>Active</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Approvals
                </p>
                <ClockIcon className="w-5 h-5 text-orange-500/80" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.pendingApprovals}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                <span>Requires action</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Vacancies
                </p>
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-500/80" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.activeVacancies.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                <span>Open positions</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Featured Partners
                </p>
                <StarIcon className="w-5 h-5 text-purple-500/80" />
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.featuredPartners}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                <span>High-tier accounts</span>
              </div>
            </div>
          </section>

          {/* Filters & Table */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Industry:
                  </span>
                  <select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    aria-label="Filter by industry"
                    className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] text-sm py-1.5 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                  >
                    <option value="">All Industries</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Status:
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                    className="rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] text-sm py-1.5 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Company
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Industry
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Representative
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Verification Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <GlobalLoader fullScreen={false} />
                        </td>
                      </tr>
                    ) : employers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <BuildingOffice2Icon className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                          <p className="mt-3 text-sm text-slate-500">No employers found</p>
                        </td>
                      </tr>
                    ) : (
                      employers.map((emp) => {
                        const color = getAvatarColor(emp.companyName);
                        return (
                          <tr
                            key={emp.id}
                            className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {emp.logoUrl ? (
                                  <div
                                    className="h-10 w-10 rounded-lg bg-cover bg-center"
                                    style={{ backgroundImage: `url('${emp.logoUrl}')` }}
                                  />
                                ) : (
                                  <div
                                    className={`h-10 w-10 rounded-lg ${color.bg} flex items-center justify-center font-bold ${color.text}`}
                                  >
                                    {getInitials(emp.companyName)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {emp.companyName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {emp.website || emp.user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900 dark:text-white">
                                {emp.industry || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {emp.user.studentProfile?.fullName || '—'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {emp.user.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={emp.verificationStatus} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {emp.verificationStatus === 'pending' ? (
                                  <button
                                    onClick={() => handleVerify(emp.id)}
                                    className="rounded-lg px-3 py-1.5 text-sm font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 transition-colors"
                                  >
                                    Verify
                                  </button>
                                ) : emp.verificationStatus === 'rejected' ? (
                                  <button
                                    onClick={() => handleVerify(emp.id)}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                                  >
                                    Appeal
                                  </button>
                                ) : (
                                  <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                                    View
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditModal(emp)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                                >
                                  <PencilIcon className="w-[18px] h-[18px]" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(emp.id)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                >
                                  <TrashIcon className="w-[18px] h-[18px]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{' '}
                  {employers.length > 0
                    ? `${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)}`
                    : '0'}{' '}
                  of {pagination.total.toLocaleString()} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))
                    }
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ─── Add Employer Modal ──────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Employer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  placeholder="employer@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                    placeholder="e.g. Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Representative Name
                </label>
                <input
                  type="text"
                  value={formData.repName}
                  onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSaving ? 'Creating…' : 'Create Employer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Employer Modal ─────────────────────────────────── */}
      {showEditModal && editingEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Employer</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployer(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployer(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Delete Employer?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This will permanently delete the employer account and all associated data. This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
