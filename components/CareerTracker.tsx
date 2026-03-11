import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationProps } from '../types';
import { jobApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import ApplyJobModal from './ApplyJobModal';
import JobDetailModal from './JobDetailModal';
import { toast } from 'react-hot-toast';
import { formatSalary } from '../src/utils/formatSalary';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ArrowTrendingUpIcon,
  ArrowsUpDownIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  locationType: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  department?: string;
  postedAt: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  employer?: {
    companyName: string;
    logoUrl?: string;
    verificationStatus?: string;
    description?: string;
  };
  // Internship-specific fields
  applicationDeadline?: string;
  startDate?: string;
  endDate?: string;
  durationWeeks?: number;
  hoursPerWeek?: string;
  compensationType?: string;
  salaryPeriod?: string;
  currency?: string;
  skills?: string[];
}

interface Filters {
  search: string;
  locationTypes: string[];
  jobTypes: string[];
  paidOnly: boolean;
  remoteOnly: boolean;
  sort: string;
}

export default function CareerTracker({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    locationTypes: [],
    jobTypes: [],
    paidOnly: false,
    remoteOnly: false,
    sort: 'newest',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    filters.locationTypes,
    filters.jobTypes,
    filters.paidOnly,
    filters.remoteOnly,
    filters.sort,
  ]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.locationTypes.length === 1) params.locationType = filters.locationTypes[0];
      if (filters.jobTypes.length === 1) params.jobType = filters.jobTypes[0];
      if (filters.paidOnly) params.paidOnly = 'true';
      if (filters.remoteOnly) params.remoteOnly = 'true';
      if (filters.sort) params.sort = filters.sort;

      const response = await jobApi.list(params);
      const jobsList =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (response.data as any)?.jobs || (Array.isArray(response.data) ? response.data : []);
      setJobs(jobsList as Job[]);
    } catch (error) {
      console.error('Failed to load jobs', error);
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (job: Job) => {
    if (!isAuthenticated) {
      navigate(`/signin?redirect_to=${encodeURIComponent('/career-tracker')}`);
      return;
    }
    try {
      if (job.isSaved) {
        await jobApi.unsave(job.id);
        toast.success('Removed from saved');
      } else {
        await jobApi.save(job.id);
        toast.success('Saved!');
      }
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j)));
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      navigate(`/signin?redirect_to=${encodeURIComponent('/career-tracker')}`);
      return;
    }
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleCardClick = async (job: Job) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await jobApi.get(job.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const full = res.data as any;
      setDetailJob({
        ...job,
        ...full,
        isSaved: full.isSaved ?? job.isSaved,
        hasApplied: !!full.application || job.hasApplied,
      });
    } catch {
      setDetailJob(job);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailApply = (job: Job) => {
    setShowDetailModal(false);
    handleApplyClick(job);
  };

  const handleDetailSave = async (job: Job) => {
    await handleToggleSave(job);
    setDetailJob((prev) => (prev ? { ...prev, isSaved: !prev.isSaved } : prev));
  };

  const handleApplySuccess = (jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, hasApplied: true } : j)));
  };

  const toggleFilter = (type: 'locationTypes' | 'jobTypes', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      locationTypes: [],
      jobTypes: [],
      paidOnly: false,
      remoteOnly: false,
      sort: 'newest',
    });
    setDebouncedSearch('');
  };

  // Helpers
  const formatCompensation = (job: Job) => {
    if (job.compensationType === 'UNPAID') return t('CareerTracker.unpaid');
    return formatSalary(
      job.salaryMin,
      job.salaryMax,
      job.currency,
      job.salaryPeriod || job.salaryType || 'YEARLY'
    );
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return t('CareerTracker.expired');
    if (diffDays === 0) return t('CareerTracker.today');
    if (diffDays <= 7) return t('CareerTracker.days_left_count', { count: diffDays });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const timeAgo = (dateStr: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
    );
    if (days === 0) return t('CareerTracker.today');
    if (days === 1) return t('Common.yesterday');
    return t('CareerTracker.days_ago_count', { count: days });
  };

  const JOB_TYPE_KEYS: Record<string, string> = {
    INTERNSHIP: 'CareerTracker.internship',
    GRADUATE: 'CareerTracker.graduate',
    PART_TIME: 'CareerTracker.part_time',
    FULL_TIME: 'CareerTracker.full_time',
  };

  const formatJobType = (type?: string) => {
    if (!type) return t('CareerTracker.full_time');
    return t(JOB_TYPE_KEYS[type] || 'CareerTracker.full_time');
  };

  const hasActiveFilters =
    filters.search ||
    filters.locationTypes.length > 0 ||
    filters.jobTypes.length > 0 ||
    filters.paidOnly ||
    filters.remoteOnly;

  /* ── Coming Soon gate for students ── */
  const isStudent = !user || user.role === 'STUDENT' || user.role === 'EDUCATOR';
  if (isStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-[#0a0c14] dark:via-[#0f1120] dark:to-[#12132a] flex flex-col items-center justify-center px-6 text-center font-display">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06]"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('Common.back')}
        </button>
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/25">
          <BriefcaseIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          {t('CareerTracker.title')}
        </h1>
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-sm font-bold mb-6">
          🚧 Coming Soon
        </span>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-base leading-relaxed mb-10">
          We're building a powerful career tracking experience for you. Discover internships,
          graduate roles, and full-time positions — all in one place. Stay tuned!
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all active:scale-[0.97]"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const filterContent = (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-primary" />
          {t('CareerTracker.filters')}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {t('CareerTracker.clear_all')}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-2">{t('Common.search')}</label>
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('CareerTracker.search')}
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-text-main dark:text-white flex items-center gap-2">
            <CurrencyDollarIcon className="w-4 h-4 text-green-500" /> {t('CareerTracker.paid_only')}
          </span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, paidOnly: !prev.paidOnly }))}
            className={`w-10 h-6 rounded-full transition-colors ${filters.paidOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative`}
            title="Show paid only"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.paidOnly ? 'left-5' : 'left-1'}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-text-main dark:text-white flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-blue-500" /> {t('CareerTracker.remote_only')}
          </span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }))}
            className={`w-10 h-6 rounded-full transition-colors ${filters.remoteOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative`}
            title="Show remote only"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.remoteOnly ? 'left-5' : 'left-1'}`}
            />
          </button>
        </label>
      </div>

      {/* Work Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">
          {t('CareerTracker.work_type')}
        </label>
        <div className="space-y-2">
          {(
            [
              ['REMOTE', 'CareerTracker.remote'],
              ['ONSITE', 'CareerTracker.onsite'],
              ['HYBRID', 'CareerTracker.hybrid'],
            ] as const
          ).map(([type, key]) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.locationTypes.includes(type)}
                onChange={() => toggleFilter('locationTypes', type)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">
                {t(key)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">
          {t('CareerTracker.category')}
        </label>
        <div className="space-y-2">
          {[
            {
              value: 'INTERNSHIP',
              labelKey: 'CareerTracker.internship',
              icon: <AcademicCapIcon className="w-4 h-4 text-purple-500" />,
            },
            {
              value: 'GRADUATE',
              labelKey: 'CareerTracker.graduate',
              icon: <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-500" />,
            },
            {
              value: 'PART_TIME',
              labelKey: 'CareerTracker.part_time',
              icon: <ClockIcon className="w-4 h-4 text-orange-500" />,
            },
            {
              value: 'FULL_TIME',
              labelKey: 'CareerTracker.full_time',
              icon: <BriefcaseIcon className="w-4 h-4 text-emerald-500" />,
            },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.jobTypes.includes(type.value)}
                onChange={() => toggleFilter('jobTypes', type.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors flex items-center gap-2">
                {type.icon} {t(type.labelKey)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Tags */}
      {(filters.locationTypes.length > 0 ||
        filters.jobTypes.length > 0 ||
        filters.paidOnly ||
        filters.remoteOnly) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-text-sub mb-2">
            {t('CareerTracker.active_filters')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {filters.paidOnly && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                {t('CareerTracker.paid_only')}
              </span>
            )}
            {filters.remoteOnly && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                {t('CareerTracker.remote')}
              </span>
            )}
            {filters.locationTypes.map((locType) => (
              <span
                key={locType}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
              >
                {t(JOB_TYPE_KEYS[locType] || `CareerTracker.${locType.toLowerCase()}`)}
              </span>
            ))}
            {filters.jobTypes.map((jobType) => (
              <span
                key={jobType}
                className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
              >
                {formatJobType(jobType)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-card-light dark:bg-card-dark">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-text-sub hover:text-text-main dark:hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              {t('Common.back')}
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                {t('CareerTracker.filters')}
                {hasActiveFilters && <span className="size-2 rounded-full bg-primary" />}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signin?redirect_to=/career-tracker')}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  {t('Auth.sign_in_to_apply')}
                </button>
              )}
            </div>
          </div>
          <div className="text-center pb-1">
            <h1 className="text-2xl font-bold text-text-main dark:text-white flex items-center justify-center gap-2">
              <BriefcaseIcon className="w-6 h-6 text-primary" />
              {t('CareerTracker.title')}
            </h1>
            <p className="text-sm text-text-sub mt-0.5">{t('CareerTracker.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="w-[280px] bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-2xl flex-shrink-0 hidden lg:block h-fit sticky top-6">
            {filterContent}
          </aside>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-card-light dark:bg-card-dark shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold">{t('CareerTracker.filters')}</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Close filters"
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {filterContent}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-main dark:text-white whitespace-nowrap">
                  {t('CareerTracker.latest_opportunities')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold whitespace-nowrap">
                  {jobs.length} {t('CareerTracker.jobs')}
                </span>
              </div>
              {/* Sort */}
              <div className="relative flex items-center gap-2 flex-shrink-0">
                <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  title="Sort jobs"
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl pl-3 pr-8 py-2 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 appearance-none min-w-[160px] cursor-pointer"
                >
                  <option value="newest">{t('CareerTracker.newest')}</option>
                  <option value="stipend">{t('CareerTracker.highest_salary')}</option>
                  <option value="deadline">{t('CareerTracker.deadline_soon')}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <GlobalLoader fullScreen={false} />
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <BriefcaseIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  {t('CareerTracker.no_jobs_found')}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary hover:text-primary-dark font-medium"
                >
                  {t('CareerTracker.clear_filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {jobs.map((job) => {
                  const isInternship = job.jobType === 'INTERNSHIP' || job.jobType === 'GRADUATE';
                  const deadline = formatDeadline(job.applicationDeadline);
                  const isDeadlineSoon =
                    deadline && (deadline.includes('d left') || deadline === 'Today');

                  return (
                    <div
                      key={job.id}
                      onClick={() => handleCardClick(job)}
                      className="bg-card-light dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group cursor-pointer flex flex-col overflow-hidden"
                    >
                      {/* Top Row: Logo + Save */}
                      <div className="flex justify-between items-start gap-2 mb-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="size-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {job.employer?.logoUrl ? (
                              <img
                                src={job.employer.logoUrl}
                                alt={job.company}
                                className="w-full h-full rounded-xl object-cover"
                              />
                            ) : (
                              job.company?.[0]?.toUpperCase() || 'C'
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4
                              className="font-semibold text-text-main dark:text-white group-hover:text-primary transition-colors truncate text-[15px] leading-tight"
                              title={job.title}
                            >
                              {job.title}
                            </h4>
                            <p className="text-xs text-text-sub truncate flex items-center gap-1">
                              {job.company}
                              {job.employer?.verificationStatus === 'verified' && (
                                <span className="text-blue-500 flex-shrink-0" title="Verified">
                                  ✓
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(job);
                          }}
                          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${job.isSaved ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'}`}
                          title="Save job"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Decision Factors */}
                      <div className="space-y-1.5 mb-3">
                        {/* Compensation */}
                        <div className="flex items-center gap-2 text-xs min-w-0">
                          <CurrencyDollarIcon
                            className={`w-4 h-4 flex-shrink-0 ${job.compensationType === 'UNPAID' ? 'text-gray-400' : 'text-green-500'}`}
                          />
                          <span
                            className={`font-semibold truncate ${job.compensationType === 'UNPAID' ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`}
                          >
                            {formatCompensation(job)}
                          </span>
                          {isInternship &&
                            job.compensationType &&
                            job.compensationType !== 'UNPAID' && (
                              <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase flex-shrink-0">
                                {job.compensationType}
                              </span>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-xs text-text-sub min-w-0">
                          <MapPinIcon className="w-4 h-4 flex-shrink-0 text-blue-400" />
                          <span className="truncate">
                            {job.location || t('CareerTracker.remote_location')}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase text-text-sub flex-shrink-0">
                            {job.locationType}
                          </span>
                        </div>

                        {/* Deadline — only show if ≤ 3 days */}
                        {isDeadlineSoon && deadline && (
                          <div className="flex items-center gap-2 text-xs">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              {t('CareerTracker.deadline_label', { deadline })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase whitespace-nowrap ${
                            job.jobType === 'INTERNSHIP'
                              ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                              : job.jobType === 'GRADUATE'
                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {formatJobType(job.jobType)}
                        </span>
                      </div>

                      {/* Footer — pinned to bottom */}
                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-200 dark:border-gray-700">
                        {job.hasApplied ? (
                          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            {t('CareerTracker.applied')}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyClick(job);
                            }}
                            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            {t('CareerTracker.apply_now')}
                          </button>
                        )}
                        <span className="text-xs text-gray-400">
                          {timeAgo(job.postedAt || new Date().toISOString())}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={() => {
            if (selectedJob) handleApplySuccess(selectedJob.id);
          }}
        />
      )}

      {showDetailModal &&
        (detailLoading ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <JobDetailModal
            job={detailJob}
            onClose={() => {
              setShowDetailModal(false);
              setDetailJob(null);
            }}
            onApply={handleDetailApply}
            onToggleSave={handleDetailSave}
          />
        ))}
    </div>
  );
}
