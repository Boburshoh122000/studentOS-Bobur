import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { employerApi, jobApi, userApi } from '../src/services/api';
import { downloadCSV } from '../src/utils/csv';
import { toast } from 'react-hot-toast';
import { useAuth } from '../src/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import PostJobModal from './PostJobModal';
import ViewApplicantModal from './ViewApplicantModal';
import CandidatePortfolioModal from './CandidatePortfolioModal';
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  GlobeAltIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface EmployerStats {
  activeJobs: number;
  totalApplicants: number;
  newApplications: number;
  shortlisted: number;
  newThisWeek: number;
  closedJobs: number;
  interviewsScheduled: number;
}

export default function EmployerDashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'jobs' | 'students' | 'company' | 'profile'
  >('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [company, setCompany] = useState<any>({
    companyName: '',
    industry: 'Software Development',
    companySize: '11-50 employees',
    description: '',
    website: '',
    city: '',
    tagline: '',
    linkedIn: '',
    address: '',
    state: '',
    country: '',
    logoUrl: '',
    socialLinks: [] as { platform: string; url: string; label?: string }[],
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilter, setJobFilter] = useState<string | undefined>(undefined);
  const [appPage, setAppPage] = useState(1);
  const [appPagination, setAppPagination] = useState({ total: 0, pages: 0, page: 1, limit: 12 });
  const [isLoading, setIsLoading] = useState(true);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // My Jobs tab state
  const [jobStats, setJobStats] = useState<EmployerStats | null>(null);
  const [jobsTab, setJobsTab] = useState<'active' | 'closed'>('active');
  const [jobSearch, setJobSearch] = useState('');
  const [editingJob, setEditingJob] = useState<any>(null);
  const [actionMenuJobId, setActionMenuJobId] = useState<string | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);

  // Portfolio modal state
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioUserId, setPortfolioUserId] = useState<string | null>(null);
  const [portfolioCandidateName, setPortfolioCandidateName] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardData();
    if (activeTab === 'jobs') {
      fetchJobs();
      fetchJobStats();
    }
    if (activeTab === 'students') {
      fetchApplications();
      if (jobs.length === 0) fetchJobs(); // for dropdown
    }
    if (activeTab === 'company' || activeTab === 'profile') fetchCompanyProfile();
  }, [activeTab, statusFilter, jobFilter, appPage]);

  // Initialize fullName from auth user
  useEffect(() => {
    if (user?.profile?.fullName) setFullName(user.profile.fullName);
  }, [user]);

  // Debounced search for students tab
  useEffect(() => {
    if (activeTab !== 'students') return;
    const timer = setTimeout(() => fetchApplications(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        employerApi.getStats(),
        employerApi.getApplications({ limit: 5 }),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (appsRes.data) setRecentApps((appsRes.data as any).applications);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    const { data } = await jobApi.getEmployerJobs();
    if (data) setJobs(data);
    setJobsLoading(false);
  };

  const fetchJobStats = async () => {
    try {
      const { data } = await employerApi.getStats();
      if (data) setJobStats(data as EmployerStats);
    } catch (e) {
      console.error('Failed to fetch job stats', e);
    }
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    const filters: any = { page: appPage, limit: 12 };
    if (statusFilter) filters.status = statusFilter;
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (jobFilter) filters.jobId = jobFilter;

    try {
      const { data } = await employerApi.getApplications(filters);
      if (data) {
        setApplications((data as any).applications);
        if ((data as any).pagination) setAppPagination((data as any).pagination);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
      toast.error('Failed to load applications');
    }
    setIsLoading(false);
  };

  const handleExportApps = async () => {
    toast.loading('Exporting candidates...', { id: 'export-apps' });
    try {
      const { data } = await employerApi.getApplications({ limit: 1000, status: statusFilter });
      if (data && (data as any).applications) {
        const csvData = (data as any).applications.map((app: any) => ({
          Candidate: app.user?.studentProfile?.fullName || 'N/A',
          Email: app.user?.email || 'N/A',
          Job: app.job?.title || 'N/A',
          Status: app.status,
          Applied: new Date(app.appliedAt).toLocaleDateString(),
          University: app.user?.studentProfile?.university || '',
          Major: app.user?.studentProfile?.major || '',
        }));
        downloadCSV(csvData, 'candidates_export.csv');
        toast.success('Export completed', { id: 'export-apps' });
      }
    } catch (e) {
      toast.error('Export failed', { id: 'export-apps' });
    }
  };

  const fetchCompanyProfile = async () => {
    setIsLoading(true);
    const { data } = await employerApi.getProfile();
    if (data) setCompany((prev: any) => ({ ...prev, ...(data as any) }));
    setIsLoading(false);
  };

  const updateCompanyProfile = async () => {
    setIsLoading(true);
    try {
      const { error } = await employerApi.updateProfile(company);
      if (error) throw new Error(error);
      toast.success('Company profile saved');
    } catch (error: any) {
      console.error('Failed to update profile', error);
      toast.error(error?.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, SVG, or WebP image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be less than 2MB');
      return;
    }
    setLogoUploading(true);
    try {
      const { data, error } = await employerApi.uploadLogo(file);
      if (error) throw new Error(error);
      if (data) {
        setCompany((prev: any) => ({ ...prev, logoUrl: (data as any).logoUrl }));
        toast.success('Logo uploaded successfully');
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      toast.error(err?.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await employerApi.deleteLogo();
      setCompany((prev: any) => ({ ...prev, logoUrl: '' }));
      toast.success('Logo removed');
    } catch {
      toast.error('Failed to remove logo');
    }
  };

  const addSocialLink = (platform: string) => {
    setCompany((prev: any) => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform, url: '', label: platform === 'custom' ? '' : undefined },
      ],
    }));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    setCompany((prev: any) => {
      const links = [...(prev.socialLinks || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, socialLinks: links };
    });
  };

  const removeSocialLink = (index: number) => {
    setCompany((prev: any) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setCompany((prev: any) => ({ ...prev, [id]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getApplicationStatusFormat = (status: string) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'New',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };
      case 'SCREENING':
        return {
          label: 'Screening',
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        };
      case 'INTERVIEW':
        return {
          label: 'Interview',
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
      case 'OFFER':
        return {
          label: 'Offer Sent',
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'WITHDRAWN':
        return {
          label: 'Withdrawn',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
        };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen w-full bg-[#fafafa] dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark transition-colors duration-200 flex-shrink-0">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div
              className="flex items-center gap-3 px-2 cursor-pointer"
              onClick={() => navigateTo(Screen.LANDING)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/30">
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                  StudentOS
                </h1>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('Employer.console')}
                </p>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' ? 'fill-1' : ''}`}
                >
                  dashboard
                </span>
                <span
                  className={`text-sm ${activeTab === 'dashboard' ? 'font-semibold' : 'font-medium'}`}
                >
                  {t('Employer.dashboard')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'jobs' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeTab === 'jobs' ? 'fill-1' : ''}`}
                >
                  work_history
                </span>
                <span
                  className={`text-sm ${activeTab === 'jobs' ? 'font-semibold' : 'font-medium'}`}
                >
                  {t('Employer.my_jobs')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'students' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeTab === 'students' ? 'fill-1' : ''}`}
                >
                  person_search
                </span>
                <span
                  className={`text-sm ${activeTab === 'students' ? 'font-semibold' : 'font-medium'}`}
                >
                  {t('Employer.student_profiles')}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('company')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'company' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${activeTab === 'company' ? 'fill-1' : ''}`}
                >
                  business
                </span>
                <span
                  className={`text-sm ${activeTab === 'company' ? 'font-semibold' : 'font-medium'}`}
                >
                  {t('Employer.company_profile')}
                </span>
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <div
                className={`h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-2 ${activeTab === 'profile' ? 'border-primary' : 'border-white dark:border-slate-700'} shadow-sm`}
              >
                {getInitials(user?.profile?.fullName || company.companyName || 'E')}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <p
                  className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                >
                  {company.companyName || 'Your Company'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.profile?.fullName || 'Employer'}
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await logout();
                  localStorage.clear();
                  sessionStorage.clear();
                  toast.success('Logged out successfully');
                  window.location.href = '/signin';
                } catch (error) {
                  console.error('Logout failed:', error);
                  toast.error('Logout failed');
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${isLoggingOut ? 'animate-spin' : ''}`}
              >
                {isLoggingOut ? 'progress_activity' : 'logout'}
              </span>
              {isLoggingOut ? t('Common.logging_out') : t('Employer.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-card-dark flex flex-col shadow-2xl animate-slide-in-left">
            <div className="flex h-full flex-col justify-between p-4">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 px-2 cursor-pointer"
                    onClick={() => navigateTo(Screen.LANDING)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/30">
                      <AcademicCapIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                        StudentOS
                      </h1>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {t('Employer.console')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'dashboard' as const, icon: 'dashboard', label: t('Employer.dashboard') },
                    { id: 'jobs' as const, icon: 'work_history', label: t('Employer.my_jobs') },
                    {
                      id: 'students' as const,
                      icon: 'person_search',
                      label: t('Employer.student_profiles'),
                    },
                    {
                      id: 'company' as const,
                      icon: 'business',
                      label: t('Employer.company_profile'),
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'fill-1' : ''}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-sm ${activeTab === item.id ? 'font-semibold' : 'font-medium'}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800">
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div
                    className={`h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-2 ${activeTab === 'profile' ? 'border-primary' : 'border-white dark:border-slate-700'} shadow-sm`}
                  >
                    {getInitials(user?.profile?.fullName || company.companyName || 'E')}
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <p
                      className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                    >
                      {company.companyName || 'Your Company'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.profile?.fullName || 'Employer'}
                    </p>
                  </div>
                </button>
                <button
                  onClick={async () => {
                    setIsLoggingOut(true);
                    try {
                      await logout();
                      localStorage.clear();
                      sessionStorage.clear();
                      toast.success('Logged out successfully');
                      window.location.href = '/signin';
                    } catch (error) {
                      console.error('Logout failed:', error);
                      toast.error('Logout failed');
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${isLoggingOut ? 'animate-spin' : ''}`}
                  >
                    {isLoggingOut ? 'progress_activity' : 'logout'}
                  </span>
                  {isLoggingOut ? t('Common.logging_out') : t('Employer.logout')}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto bg-[#fafafa] dark:bg-background-dark">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <AcademicCapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Employer.console')}
            </span>
          </div>
          <div className="w-10" />
        </div>

        <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-8 md:py-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Header */}
              <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {t('Employer.dashboard')}
                  </h2>
                  <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
                    {t('Employer.manage_listings')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('company')}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <BuildingOffice2Icon className="w-5 h-5" />
                    <span>{t('Employer.view_profile')}</span>
                  </button>
                  <button
                    onClick={() => setShowPostJobModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('Employer.post_new_job')}</span>
                  </button>
                </div>
              </header>

              {/* Stats Cards */}
              <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* ... existing stats cards ... */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t('Employer.active_listings')}
                    </p>
                    <div className="p-2 rounded-lg bg-blue-50 text-primary dark:bg-primary/20 dark:text-primary-light">
                      <ClipboardDocumentListIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.activeJobs || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowTrendingUpIcon className="w-4 h-4" />2 New
                      </span>
                      <span className="text-slate-400 font-medium">
                        {t('Employer.new_this_week')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t('Employer.total_applicants')}
                    </p>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                      <UsersIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.totalApplicants || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        +45
                      </span>
                      <span className="text-slate-400 font-medium">
                        {t('Employer.since_last_login')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      {t('Employer.shortlisted')}
                    </p>
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                      <StarIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.shortlisted || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        +5
                      </span>
                      <span className="text-slate-400 font-medium">
                        {t('Employer.new_this_week')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t('Employer.in_review')}
                    </p>
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                      <UserPlusIcon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      +{stats?.newApplications || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {t('Employer.requires_review')}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Recent Applications List */}
                <section className="lg:col-span-2 flex flex-col h-full">
                  <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {t('Employer.recent_applications')}
                      </h3>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors hover:underline"
                      >
                        {t('Employer.view_all')}
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentApps.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">No applications yet.</div>
                        ) : (
                          recentApps.map((app, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedApplicant(app);
                                setShowApplicantModal(true);
                              }}
                              className="group flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary border border-white dark:border-slate-700 shadow-sm`}
                                >
                                  {getInitials(app.user.studentProfile?.fullName || app.user.email)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                    {app.user.studentProfile?.fullName || 'Unknown Candidate'}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                    {app.job.title} <span className="mx-1 text-slate-300">•</span>{' '}
                                    {app.user.studentProfile?.university || 'Unknown University'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span
                                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold bg-green-100 text-green-800`}
                                >
                                  Match {app.matchScore || 0}%
                                </span>
                                <span className="text-xs font-medium text-slate-400">
                                  {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Trends Chart */}
                <section className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {t('Employer.application_trends')}
                      </h3>
                      <button
                        aria-label="Application trends options"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      <div className="flex items-end justify-between gap-3 h-48 w-full px-2">
                        {[
                          { day: 'Mon', total: 65, new: 30 },
                          { day: 'Tue', total: 85, new: 45 },
                          { day: 'Wed', total: 55, new: 25 },
                          { day: 'Thu', total: 95, new: 60 },
                          { day: 'Fri', total: 75, new: 40 },
                        ].map((data, i) => (
                          <div key={i} className="flex flex-col items-center gap-3 group w-full">
                            <div className="w-full relative flex flex-col justify-end h-40 rounded-t-lg overflow-hidden cursor-pointer">
                              {/* Background Bar (Total) */}
                              <div
                                className="w-full bg-indigo-100 dark:bg-indigo-900/30 absolute bottom-0 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50"
                                style={{ height: `${data.total}%` }}
                              ></div>
                              {/* Foreground Bar (New) */}
                              <div
                                className="w-full bg-primary absolute bottom-0 rounded-t-sm transition-all duration-500 group-hover:bg-primary-dark"
                                style={{ height: `${data.new}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 group-hover:text-primary transition-colors">
                              {data.day}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('Employer.total_this_week_label')}
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        184{' '}
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                          {t('Employer.applicants_page')}
                        </span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'jobs' &&
            (() => {
              // Filter + search
              const filteredJobs = jobs.filter((job: any) => {
                const matchesTab =
                  jobsTab === 'active'
                    ? job.status === 'ACTIVE' || job.status === 'PAUSED'
                    : job.status === 'CLOSED';
                const matchesSearch =
                  !jobSearch ||
                  job.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
                  job.location?.toLowerCase().includes(jobSearch.toLowerCase());
                return matchesTab && matchesSearch;
              });
              const JOBS_PER_PAGE = 10;
              const totalFiltered = filteredJobs.length;
              const totalPages = Math.ceil(totalFiltered / JOBS_PER_PAGE) || 1;
              const currentJobPage = 1; // simplified — all shown for now
              const showFrom = totalFiltered > 0 ? 1 : 0;
              const showTo = Math.min(JOBS_PER_PAGE, totalFiltered);

              return (
                <div className="flex flex-col gap-6">
                  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('Employer.job_vacancies')}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('Employer.manage_listings')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTab('company')}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <EyeIcon className="w-[18px] h-[18px]" />
                        {t('Employer.view_profile')}
                      </button>
                      <button
                        onClick={() => {
                          setEditingJob(null);
                          setShowPostJobModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
                      >
                        <PlusIcon className="w-[18px] h-[18px]" />
                        {t('Employer.post_new_job')}
                      </button>
                    </div>
                  </header>

                  {/* ── Stat Cards — Real Data ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                          {t('Employer.active_listings')}
                        </h3>
                        <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {jobStats?.activeJobs ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        {(jobStats?.newThisWeek ?? 0) > 0 && (
                          <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        <span className="text-emerald-500 font-medium">
                          {jobStats?.newThisWeek ?? 0} New
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">
                          {t('Employer.new_this_week')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                          {t('Employer.total_applicants')}
                        </h3>
                        <UsersIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {jobStats?.totalApplicants ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {t('Employer.across_all_postings')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                          {t('Employer.in_review')}
                        </h3>
                        <ClockIcon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {jobStats?.newApplications ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <ClockIcon className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-500 font-medium">
                          {t('Employer.requires_review')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                          {t('Employer.interviews')}
                        </h3>
                        <VideoCameraIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {jobStats?.interviewsScheduled ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {t('Employer.scheduled_this_week')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Tabs — Real Counts ── */}
                  <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setJobsTab('active')}
                      className={`pb-3 border-b-2 text-sm font-bold transition-colors ${jobsTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      {t('Employer.active_jobs')} ({jobStats?.activeJobs ?? 0})
                    </button>
                    <button
                      onClick={() => setJobsTab('closed')}
                      className={`pb-3 border-b-2 text-sm font-bold transition-colors ${jobsTab === 'closed' ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      {t('Employer.closed')} ({jobStats?.closedJobs ?? 0})
                    </button>
                  </div>

                  {/* ── Search + Filters ── */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                      <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white transition-all shadow-sm"
                        placeholder={t('Employer.search_jobs')}
                        type="text"
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                        <FunnelIcon className="w-[18px] h-[18px]" />
                        {t('Common.filter')}
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                        <ArrowsUpDownIcon className="w-[18px] h-[18px]" />
                        {t('Common.sort')}
                      </button>
                    </div>
                  </div>

                  {/* ── Table ── */}
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-4">{t('Employer.job_title')}</th>
                            <th className="px-6 py-4">{t('Employer.department')}</th>
                            <th className="px-6 py-4">{t('Employer.posted_date')}</th>
                            <th className="px-6 py-4">{t('Employer.applicants')}</th>
                            <th className="px-6 py-4">{t('Employer.status')}</th>
                            <th className="px-6 py-4 text-right">{t('Employer.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {jobsLoading ? (
                            // Skeleton rows
                            [1, 2, 3].map((i) => (
                              <tr key={i}>
                                <td colSpan={6} className="px-6 py-5">
                                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-full"></div>
                                </td>
                              </tr>
                            ))
                          ) : filteredJobs.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-16">
                                <BriefcaseIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                  {jobSearch
                                    ? t('Employer.no_jobs_search')
                                    : t('Employer.no_jobs_yet')}
                                </p>
                                {!jobSearch && (
                                  <button
                                    onClick={() => {
                                      setEditingJob(null);
                                      setShowPostJobModal(true);
                                    }}
                                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark"
                                  >
                                    + {t('Employer.post_first_job_cta')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ) : (
                            filteredJobs.map((job: any) => (
                              <tr
                                key={job.id}
                                className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                      <BriefcaseIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                                        {job.title}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                        {job.locationType} •{' '}
                                        {job.jobType?.replace('_', '-') || job.type}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                                  {job.department || '—'}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {new Date(job.postedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {job.applicantCount || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(job.status)}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${job.status === 'ACTIVE' ? 'bg-emerald-500' : job.status === 'PAUSED' ? 'bg-amber-500' : 'bg-slate-500'}`}
                                    ></span>
                                    {job.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                  <button
                                    onClick={() =>
                                      setActionMenuJobId(actionMenuJobId === job.id ? null : job.id)
                                    }
                                    aria-label="Job actions"
                                    className="text-slate-400 hover:text-primary transition-colors"
                                  >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                  </button>
                                  {/* Actions Dropdown */}
                                  {actionMenuJobId === job.id && (
                                    <div className="absolute right-6 top-12 z-30 w-48 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-1">
                                      <button
                                        onClick={() => {
                                          setActionMenuJobId(null);
                                          setEditingJob(job);
                                          setShowPostJobModal(true);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"
                                      >
                                        ✏️ {t('Employer.edit_job')}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          setActionMenuJobId(null);
                                          const newStatus =
                                            job.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                                          try {
                                            await jobApi.updateJob(job.id, { status: newStatus });
                                            toast.success(
                                              newStatus === 'PAUSED'
                                                ? 'Job paused'
                                                : 'Job activated'
                                            );
                                            fetchJobs();
                                            fetchJobStats();
                                          } catch {
                                            toast.error('Failed to update status');
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2"
                                      >
                                        {job.status === 'ACTIVE'
                                          ? `⏸️ ${t('Employer.pause_listing')}`
                                          : `▶️ ${t('Employer.activate')}`}
                                      </button>
                                      <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                      <button
                                        onClick={async () => {
                                          setActionMenuJobId(null);
                                          if (
                                            !confirm(
                                              `Delete "${job.title}"? This cannot be undone.`
                                            )
                                          )
                                            return;
                                          try {
                                            await jobApi.deleteJob(job.id);
                                            toast.success('Job deleted');
                                            fetchJobs();
                                            fetchJobStats();
                                          } catch {
                                            toast.error('Failed to delete');
                                          }
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                      >
                                        🗑️ {t('Employer.delete_job')}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t('Common.showing')}{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {showFrom}-{showTo}
                        </span>{' '}
                        {t('Common.of')}{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {totalFiltered}
                        </span>{' '}
                        {jobsTab === 'active'
                          ? t('Employer.active_listings_count')
                          : t('Employer.closed_listings_count')}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={currentJobPage <= 1}
                        >
                          {t('Common.previous')}
                        </button>
                        <button
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={currentJobPage >= totalPages}
                        >
                          {t('Common.next')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-8">
              {/* ... (Student Profiles content remains unchanged) ... */}
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    {t('Employer.applicants_page')}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('Employer.manage_pipeline').replace('.', '')}
                    {jobFilter
                      ? ` for ${jobs.find((j: any) => j.id === jobFilter)?.title || 'selected job'}`
                      : ''}
                    .
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportApps}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark text-slate-700 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t('Employer.export_list')}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold text-sm shadow-sm shadow-primary/30">
                    <PlusIcon className="w-5 h-5" />
                    {t('Employer.add_candidate')}
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                {/* Row 1: Job dropdown + Status tabs */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-full sm:w-56 shrink-0">
                    <div className="relative">
                      <BriefcaseIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
                        aria-label="Select job position"
                        value={jobFilter || ''}
                        onChange={(e) => {
                          setJobFilter(e.target.value || undefined);
                          setAppPage(1);
                        }}
                      >
                        <option value="">{t('Employer.all_jobs')}</option>
                        {jobs.map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto gap-1 no-scrollbar w-full sm:w-auto border-b sm:border-none border-slate-200 dark:border-slate-800">
                    {[
                      { label: t('Employer.all_applicants'), value: undefined },
                      { label: t('Employer.new'), value: 'NEW' },
                      { label: t('Employer.screening'), value: 'SCREENING' },
                      { label: t('Employer.interview'), value: 'INTERVIEW' },
                      { label: t('Employer.rejected'), value: 'REJECTED' },
                    ].map((filter) => (
                      <button
                        key={filter.label}
                        onClick={() => {
                          setStatusFilter(filter.value);
                          setAppPage(1);
                        }}
                        className={`whitespace-nowrap px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                          statusFilter === filter.value
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Row 2: Search + Filter */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                      placeholder={t('Employer.search_applicants')}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setAppPage(1);
                      }}
                    />
                  </div>
                  <button
                    aria-label="Filter applications"
                    className="flex items-center justify-center w-10 h-10 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    <FunnelIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {applications.length === 0 ? (
                  <div className="col-span-full text-center p-12 text-slate-500 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800">
                    {t('Employer.no_applicants')}
                  </div>
                ) : (
                  applications.map((app, idx) => {
                    const statusInfo = getApplicationStatusFormat(app.status);
                    return (
                      <div
                        key={app.id || idx}
                        className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {app.user.studentProfile?.avatarUrl ? (
                                <img
                                  alt={app.user.studentProfile.fullName}
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                                  src={app.user.studentProfile.avatarUrl}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg ring-2 ring-slate-100 dark:ring-slate-700">
                                  {getInitials(app.user.studentProfile?.fullName || app.user.email)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                  {app.user.studentProfile?.fullName || 'Unknown'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`${statusInfo.color} text-xs px-2 py-1 rounded-full font-medium`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <BriefcaseIcon className="w-[18px] h-[18px]" />
                              <span>{app.job.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <AcademicCapIcon className="w-[18px] h-[18px]" />
                              <span>{app.user.studentProfile?.university || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <MapPinIcon className="w-[18px] h-[18px]" />
                              <span>{app.user.studentProfile?.country || 'Remote'}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {(app.user.studentProfile?.skills || [])
                              .slice(0, 3)
                              .map((skill: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-md font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedApplicant(app);
                                setShowApplicantModal(true);
                              }}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors bg-primary text-white hover:bg-primary-dark shadow-sm"
                            >
                              {t('Employer.review_application')}
                            </button>
                            <button
                              onClick={() => {
                                setPortfolioUserId(app.userId || app.user?.id || null);
                                setPortfolioCandidateName(
                                  app.user?.studentProfile?.fullName || undefined
                                );
                                setShowPortfolioModal(true);
                              }}
                              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm"
                            >
                              👤 {t('Employer.view_portfolio')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {t('Common.showing')}{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(appPagination.page - 1) * appPagination.limit + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Math.min(appPagination.page * appPagination.limit, appPagination.total)}
                  </span>{' '}
                  {t('Common.of')}{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {appPagination.total}
                  </span>{' '}
                  {t('Employer.applicants_page').toLowerCase()}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={appPage <= 1}
                    onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('Common.previous')}
                  </button>
                  <button
                    disabled={appPage >= appPagination.pages}
                    onClick={() => setAppPage((p) => p + 1)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('Common.next')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="max-w-5xl mx-auto">
              {/* ... (Company Profile content remains unchanged) ... */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t('Employer.company_profile_page')}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {t('Employer.manage_company_info')}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <EyeIcon className="w-[18px] h-[18px]" />
                    {t('Employer.view_public_profile')}
                  </button>
                  <button
                    onClick={updateCompanyProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50"
                  >
                    <CheckIcon className="w-[18px] h-[18px]" />
                    {isLoading ? t('Common.loading') : t('Employer.save_changes')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('Employer.general_info')}
                      </h3>
                      <BuildingOffice2Icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                            {t('Employer.company_logo')}
                          </label>
                          <div
                            className="group relative w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors flex flex-col items-center justify-center overflow-hidden"
                            onClick={() => document.getElementById('logo-upload-input')?.click()}
                          >
                            {logoUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-500">Uploading...</span>
                              </div>
                            ) : company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt="Company logo"
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <CloudArrowUpIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-primary" />
                                </div>
                                <span className="text-xs text-center text-slate-500 dark:text-slate-400 px-2 group-hover:text-primary">
                                  {t('Employer.click_to_upload')}
                                </span>
                              </>
                            )}
                            <input
                              id="logo-upload-input"
                              type="file"
                              accept="image/jpeg,image/png,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </div>
                          {company.logoUrl && (
                            <button
                              onClick={handleDeleteLogo}
                              className="flex items-center gap-1 mt-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                              title="Remove logo"
                            >
                              <TrashIcon className="w-3 h-3" /> Remove
                            </button>
                          )}
                        </div>
                        <div className="flex-grow space-y-4">
                          <div>
                            <label
                              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                              htmlFor="companyName"
                            >
                              {t('Employer.company_name')}
                            </label>
                            <input
                              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                              id="companyName"
                              type="text"
                              value={company.companyName || ''}
                              onChange={handleCompanyChange}
                              placeholder="TechFlow Inc."
                            />
                          </div>
                          <div>
                            <label
                              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                              htmlFor="tagline"
                            >
                              {t('Employer.tagline')}
                            </label>
                            <input
                              className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                              id="tagline"
                              type="text"
                              value={company.tagline || ''}
                              onChange={handleCompanyChange}
                              placeholder="e.g. Innovating the future of tech"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                            htmlFor="industry"
                          >
                            {t('Employer.industry')}
                          </label>
                          <select
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="industry"
                            value={company.industry || 'Software Development'}
                            onChange={handleCompanyChange}
                          >
                            <option>Software Development</option>
                            <option>Fintech</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                          </select>
                        </div>
                        <div>
                          <label
                            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                            htmlFor="companySize"
                          >
                            {t('Employer.company_size')}
                          </label>
                          <select
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="companySize"
                            value={company.companySize || '11-50 employees'}
                            onChange={handleCompanyChange}
                          >
                            <option>1-10 employees</option>
                            <option>11-50 employees</option>
                            <option>51-200 employees</option>
                            <option>201-500 employees</option>
                            <option>500+ employees</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('Employer.about_company')}
                      </h3>
                      <DocumentTextIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Write a compelling description of your company culture, mission, and what
                        makes it a great place to work. This helps attract the right candidates.
                      </p>
                      <div className="relative">
                        <textarea
                          className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-3 min-h-[160px]"
                          id="description"
                          value={company.description || ''}
                          onChange={handleCompanyChange}
                          placeholder="Tell us about your company..."
                        ></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                          0 / 2000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('Employer.headquarters')}
                      </h3>
                      <MapPinIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="address"
                        >
                          {t('Employer.address')}
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                          id="address"
                          placeholder="123 Innovation Dr"
                          type="text"
                          value={company.address || ''}
                          onChange={handleCompanyChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                            htmlFor="city"
                          >
                            {t('Employer.city')}
                          </label>
                          <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="city"
                            value={company.city || ''}
                            onChange={handleCompanyChange}
                            placeholder="San Francisco"
                            type="text"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                            htmlFor="state"
                          >
                            {t('Employer.state_region')}
                          </label>
                          <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="state"
                            placeholder="CA"
                            type="text"
                            value={company.state || ''}
                            onChange={handleCompanyChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="country"
                        >
                          {t('Employer.country_field')}
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                          id="country"
                          placeholder="Uzbekistan"
                          type="text"
                          value={company.country || ''}
                          onChange={handleCompanyChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {t('Employer.online_presence')}
                      </h3>
                      <GlobeAltIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="website"
                        >
                          {t('Employer.website_url')}
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <GlobeAltIcon className="w-[18px] h-[18px] text-slate-400" />
                          </div>
                          <input
                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="website"
                            value={company.website || ''}
                            onChange={handleCompanyChange}
                            type="text"
                            placeholder="https://www.company.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="linkedIn"
                        >
                          {t('Employer.linkedin_profile')}
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                              className="h-4 w-4 text-slate-400 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                            </svg>
                          </div>
                          <input
                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="linkedIn"
                            value={company.linkedIn || ''}
                            onChange={handleCompanyChange}
                            type="text"
                            placeholder="https://linkedin.com/company/..."
                          />
                        </div>
                      </div>

                      {/* Dynamic social links */}
                      {(company.socialLinks || []).map(
                        (link: { platform: string; url: string; label?: string }, idx: number) => (
                          <div key={idx} className="flex items-end gap-3">
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {link.platform === 'custom'
                                  ? link.label || 'Custom'
                                  : link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                              </label>
                              <input
                                className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                                value={link.url}
                                onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                type="text"
                                placeholder={`https://${link.platform === 'custom' ? 'example.com' : link.platform + '.com/...'}`}
                              />
                            </div>
                            {link.platform === 'custom' && (
                              <div className="w-32">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  Label
                                </label>
                                <input
                                  className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                                  value={link.label || ''}
                                  onChange={(e) => updateSocialLink(idx, 'label', e.target.value)}
                                  placeholder="Platform"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => removeSocialLink(idx)}
                              className="mb-0.5 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove link"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      )}

                      {/* Add social link picker */}
                      <div className="pt-2">
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm p-2.5"
                          value=""
                          title="Add a social link"
                          onChange={(e) => {
                            if (e.target.value) {
                              addSocialLink(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">{t('Employer.add_social_link')}...</option>
                          <option value="twitter">Twitter / X</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="telegram">Telegram</option>
                          <option value="youtube">YouTube</option>
                          <option value="tiktok">TikTok</option>
                          <option value="github">GitHub</option>
                          <option value="dribbble">Dribbble</option>
                          <option value="custom">Other (custom)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {t('Employer.profile_settings')}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    {t('Employer.profile_settings_subtitle')}
                  </p>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    {t('Employer.profile_information')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('Employer.update_profile_details')}
                  </p>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-3xl border-4 border-white dark:border-slate-700 shadow-lg">
                          {getInitials(company.companyName || 'HR')}
                        </div>
                        <button
                          aria-label="Change company photo"
                          className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <CameraIcon className="w-[18px] h-[18px] text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                      <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                        {t('Employer.change_photo')}
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('Employer.full_name')}
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('Employer.company_name')}
                        </label>
                        <input
                          type="text"
                          value={company.companyName || ''}
                          onChange={handleCompanyChange}
                          id="companyName"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          {t('Employer.job_title_field')}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hiring Manager, HR Director"
                          defaultValue=""
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          const tasks: Promise<any>[] = [employerApi.updateProfile(company)];
                          if (fullName !== (user?.profile?.fullName || '')) {
                            tasks.push(userApi.updateProfile({ fullName }));
                          }
                          const results = await Promise.all(tasks);
                          const anyError = results.find((r) => r?.error);
                          if (anyError) throw new Error(anyError.error);
                          toast.success('Profile saved');
                        } catch (e: any) {
                          toast.error(e?.message || 'Failed to save profile');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                      {t('Employer.save_profile')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings Card */}
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5 text-primary" />
                    {t('Employer.security_settings')}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('Employer.manage_password')}
                  </p>
                </div>
                <div className="p-6">
                  {/* Email Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('Employer.email_address')}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        aria-label="Email Address"
                        value={user?.email || ''}
                        disabled
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                        {t('Employer.verified')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      {t('Employer.contact_support_email')}
                    </p>
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                      {t('Employer.change_password')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('Employer.new_password')}
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          {t('Employer.confirm_password')}
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => toast.success('Password updated successfully!')}
                        className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {t('Employer.update_password')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-6 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 dark:text-red-300">
                      {t('Employer.danger_zone')}
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {t('Employer.danger_zone_desc')}
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    {t('Settings.delete_account')}
                  </button>
                </div>
              </div>

              <div className="text-center pt-8 pb-4">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Protected by StudentOS Security. Your data is encrypted and secure.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => {
          setShowPostJobModal(false);
          setEditingJob(null);
        }}
        onSuccess={() => {
          fetchDashboardData();
          fetchJobs();
          fetchJobStats();
        }}
        companyName={company.companyName}
        editJob={editingJob}
      />

      <ViewApplicantModal
        isOpen={showApplicantModal}
        onClose={() => {
          setShowApplicantModal(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedApplicant}
        onStatusUpdate={() => {
          fetchDashboardData();
          fetchApplications();
        }}
      />

      <CandidatePortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setPortfolioUserId(null);
          setPortfolioCandidateName(undefined);
        }}
        userId={portfolioUserId}
        candidateName={portfolioCandidateName}
      />
    </div>
  );
}
