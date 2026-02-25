import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { employerApi, jobApi } from '../src/services/api';
import { downloadCSV } from '../src/utils/csv';
import { toast } from 'react-hot-toast';
import { useAuth } from '../src/contexts/AuthContext';
import PostJobModal from './PostJobModal';
import ViewApplicantModal from './ViewApplicantModal';

interface EmployerStats {
  activeJobs: number;
  totalApplicants: number;
  newApplications: number;
  shortlisted: number;
}

export default function EmployerDashboard({ navigateTo }: NavigationProps) {
  const { logout } = useAuth();
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
    location: '',
    tagline: '',
  });
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

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardData();
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'students') {
      fetchApplications();
      if (jobs.length === 0) fetchJobs(); // for dropdown
    }
    if (activeTab === 'company') fetchCompanyProfile();
  }, [activeTab, statusFilter, jobFilter, appPage]);

  // Debounced search
  useEffect(() => {
    if (activeTab !== 'students') return;
    const timer = setTimeout(() => fetchApplications(), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const [statsRes, appsRes] = await Promise.all([
      employerApi.getStats(),
      employerApi.getApplications({ limit: 5 }),
    ]);

    if (statsRes.data) setStats(statsRes.data);
    if (appsRes.data) setRecentApps((appsRes.data as any).applications);

    setIsLoading(false);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    const { data } = await jobApi.getEmployerJobs();
    if (data) setJobs(data);
    setIsLoading(false);
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
      await employerApi.updateProfile(company);
      // alert('Profile updated successfully'); // Temporary feedback
    } catch (error) {
      console.error('Failed to update profile', error);
    }
    setIsLoading(false);
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
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                  StudentOS
                </h1>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Employer Console
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
                  Dashboard
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
                  My Jobs
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
                  Student Profiles
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
                  Company Profile
                </span>
              </button>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <div
                className={`h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-2 ${activeTab === 'profile' ? 'border-primary' : 'border-white dark:border-slate-700'} shadow-sm`}
              >
                {getInitials(company.companyName || 'HR')}
              </div>
              <div className="flex flex-col overflow-hidden text-left">
                <p
                  className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                >
                  {company.companyName || 'TechFlow HR'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Hiring Manager
                </p>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400 ml-auto">
                chevron_right
              </span>
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
              {isLoggingOut ? 'Logging out...' : 'Logout'}
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
                      <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                        StudentOS
                      </h1>
                      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Employer Console
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-500">close</span>
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {[
                    { id: 'dashboard' as const, icon: 'dashboard', label: 'Dashboard' },
                    { id: 'jobs' as const, icon: 'work_history', label: 'My Jobs' },
                    { id: 'students' as const, icon: 'person_search', label: 'Student Profiles' },
                    { id: 'company' as const, icon: 'business', label: 'Company Profile' },
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
                    {getInitials(company.companyName || 'HR')}
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <p
                      className={`text-sm font-bold truncate ${activeTab === 'profile' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}
                    >
                      {company.companyName || 'TechFlow HR'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Hiring Manager
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
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
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
            <span className="material-symbols-outlined text-slate-900 dark:text-white">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[16px]">school</span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Employer Console
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
                    Employer Dashboard
                  </h2>
                  <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
                    Overview of your hiring activity
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('company')}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => setShowPostJobModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Post New Job</span>
                  </button>
                </div>
              </header>

              {/* Stats Cards */}
              <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* ... existing stats cards ... */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Active Vacancies
                    </p>
                    <div className="p-2 rounded-lg bg-blue-50 text-primary dark:bg-primary/20 dark:text-primary-light">
                      <span className="material-symbols-outlined text-[20px]">list_alt</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.activeJobs || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">
                          trending_up
                        </span>
                        2 New
                      </span>
                      <span className="text-slate-400 font-medium">this week</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Total Applicants
                    </p>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.totalApplicants || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">
                          trending_up
                        </span>
                        +45
                      </span>
                      <span className="text-slate-400 font-medium">since last login</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                      Shortlisted Candidates
                    </p>
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                      <span className="material-symbols-outlined text-[20px] icon-filled">
                        star
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {stats?.shortlisted || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">
                          trending_up
                        </span>
                        +5
                      </span>
                      <span className="text-slate-400 font-medium">this week</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      New Applications
                    </p>
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      +{stats?.newApplications || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Requires review
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
                        Recent Applications
                      </h3>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors hover:underline"
                      >
                        View All
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
                        Application Trends
                      </h3>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
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
                        Total this week
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        184{' '}
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">
                          Applicants
                        </span>
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'jobs' && (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Job Vacancies
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your active listings and candidate applications
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('company')}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View Profile
                  </button>
                  <button
                    onClick={() => setShowPostJobModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Post New Job
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Active Listings
                    </h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">
                      list_alt
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">12</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">
                      trending_up
                    </span>
                    <span className="text-emerald-500 font-medium">2 New</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">
                      this week
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Total Applicants
                    </h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">
                      groups
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">1,208</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">
                      trending_up
                    </span>
                    <span className="text-emerald-500 font-medium">+45</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">
                      since last login
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      In Review
                    </h3>
                    <span className="material-symbols-outlined text-orange-500 text-xl bg-orange-50 dark:bg-orange-900/20 p-1 rounded-lg">
                      pending_actions
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">3</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-orange-500 text-sm">
                      schedule
                    </span>
                    <span className="text-orange-500 font-medium">Pending Approval</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Interviews
                    </h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">
                      videocam
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">8</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      Scheduled this week
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm">
                  Active Jobs (12)
                </button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                  Pending Review (3)
                </button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">
                  Closed (45)
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white transition-all shadow-sm"
                    placeholder="Search job titles or locations..."
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                    <span className="material-symbols-outlined text-[18px]">sort</span>
                    Sort
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4">Job Title</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Posted Date</th>
                        <th className="px-6 py-4">Applicants</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-8 text-slate-500">
                            No jobs posted yet.
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => (
                          <tr
                            key={job.id}
                            className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0`}
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    work
                                  </span>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                                    {job.title}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                    {job.locationType} • {job.type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                              {job.department}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                              {new Date(job.postedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {[1, 2, 3]
                                    .slice(0, Math.min(3, job.applicantCount || 0))
                                    .map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-6 h-6 rounded-full border-2 border-white dark:border-card-dark bg-slate-200 flex items-center justify-center text-[10px]`}
                                      >
                                        {i + 1}
                                      </div>
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                  {job.applicantCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getStatusColor(job.status)}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${job.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                                ></span>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold text-slate-900 dark:text-white">1-4</span> of{' '}
                    <span className="font-bold text-slate-900 dark:text-white">12</span> active
                    listings
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled
                    >
                      Previous
                    </button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-8">
              {/* ... (Student Profiles content remains unchanged) ... */}
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    Applicants
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    Manage your active candidate pipeline
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
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export List
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold text-sm shadow-sm shadow-primary/30">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Candidate
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                  <div className="w-full lg:w-64">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 material-symbols-outlined text-[20px]">
                        work
                      </span>
                      <select
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary cursor-pointer"
                        aria-label="Select job position"
                        value={jobFilter || ''}
                        onChange={(e) => {
                          setJobFilter(e.target.value || undefined);
                          setAppPage(1);
                        }}
                      >
                        <option value="">All Jobs</option>
                        {jobs.map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-1 no-scrollbar w-full lg:w-auto border-b lg:border-none border-slate-200 dark:border-slate-800">
                    {[
                      { label: 'All Applicants', value: undefined },
                      { label: 'New', value: 'NEW' },
                      { label: 'Screening', value: 'SCREENING' },
                      { label: 'Interview', value: 'INTERVIEW' },
                      { label: 'Rejected', value: 'REJECTED' },
                    ].map((filter) => (
                      <button
                        key={filter.label}
                        onClick={() => {
                          setStatusFilter(filter.value);
                          setAppPage(1);
                        }}
                        className={`whitespace-nowrap px-4 py-2 font-medium text-sm transition-colors ${
                          statusFilter === filter.value
                            ? 'text-primary border-b-2 border-primary font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                      <input
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder-slate-500 dark:placeholder-slate-400 font-medium"
                        placeholder="Search by name, university..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setAppPage(1);
                        }}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                        search
                      </span>
                    </div>
                    <button className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors border border-transparent dark:border-slate-700">
                      <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {applications.length === 0 ? (
                  <div className="col-span-full text-center p-12 text-slate-500 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800">
                    No applications received yet.
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
                              <span className="material-symbols-outlined text-[18px]">work</span>
                              <span>{app.job.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <span className="material-symbols-outlined text-[18px]">school</span>
                              <span>{app.user.studentProfile?.university || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <span className="material-symbols-outlined text-[18px]">
                                location_on
                              </span>
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
                              Review Application
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
                  Showing{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {(appPagination.page - 1) * appPagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Math.min(appPagination.page * appPagination.limit, appPagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {appPagination.total}
                  </span>{' '}
                  applicants
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={appPage <= 1}
                    onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={appPage >= appPagination.pages}
                    onClick={() => setAppPage((p) => p + 1)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
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
                    Company Profile
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your company information visible to candidates.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View Public Profile
                  </button>
                  <button
                    onClick={updateCompanyProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        General Information
                      </h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        business
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                            Company Logo
                          </label>
                          <div className="group relative w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[24px] text-slate-500 dark:text-slate-400 group-hover:text-primary">
                                cloud_upload
                              </span>
                            </div>
                            <span className="text-xs text-center text-slate-500 dark:text-slate-400 px-2 group-hover:text-primary">
                              Click to upload
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow space-y-4">
                          <div>
                            <label
                              className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                              htmlFor="companyName"
                            >
                              Company Name
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
                              Tagline
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
                            Industry
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
                            Company Size
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
                      <h3 className="font-bold text-slate-900 dark:text-white">About Company</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        description
                      </span>
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
                      <h3 className="font-bold text-slate-900 dark:text-white">Headquarters</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        place
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="address"
                        >
                          Address
                        </label>
                        <input
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                          id="address"
                          placeholder="123 Innovation Dr"
                          type="text"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                            htmlFor="location"
                          >
                            City / Location
                          </label>
                          <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="location"
                            value={company.location || ''}
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
                            State/Region
                          </label>
                          <input
                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="state"
                            placeholder="CA"
                            type="text"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="country"
                        >
                          Country
                        </label>
                        <select
                          className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                          id="country"
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Germany</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">Online Presence</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        public
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="website"
                        >
                          Website URL
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">
                              language
                            </span>
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
                          htmlFor="linkedin"
                        >
                          LinkedIn Profile
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
                            id="linkedin"
                            placeholder="https://linkedin.com/company/..."
                            type="text"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                          htmlFor="twitter"
                        >
                          Twitter / X
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                              className="h-4 w-4 text-slate-400 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                          </div>
                          <input
                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5"
                            id="twitter"
                            placeholder="@companyhandle"
                            type="text"
                          />
                        </div>
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
                    Profile Settings
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage your account and security preferences
                  </p>
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Profile Information
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Update your profile details visible to applicants
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
                        <button className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <span className="material-symbols-outlined text-[18px] text-slate-600 dark:text-slate-300">
                            photo_camera
                          </span>
                        </button>
                      </div>
                      <button className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                        Change Photo
                      </button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Your full name"
                          defaultValue="John Smith"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Company Name
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
                          Job Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Hiring Manager, HR Director"
                          defaultValue="Hiring Manager"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        updateCompanyProfile();
                        toast.success('Profile updated successfully!');
                      }}
                      className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings Card */}
              <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">lock</span>
                    Security Settings
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Manage your password and account security
                  </p>
                </div>
                <div className="p-6">
                  {/* Email Display */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        value="hr@techflow.com"
                        disabled
                        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      />
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      Contact support to change your email address
                    </p>
                  </div>

                  {/* Password Change */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                      Change Password
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter new password"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          Confirm New Password
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
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-6 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                      warning
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800 dark:text-red-300">Danger Zone</h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    Delete Account
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
        onClose={() => setShowPostJobModal(false)}
        onSuccess={() => {
          fetchDashboardData();
          fetchJobs();
        }}
        companyName={company.companyName}
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
    </div>
  );
}
