import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationProps } from '../types';
import { jobApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import ApplyJobModal from './ApplyJobModal';
import { toast } from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BookmarkIcon,
  ArrowsUpDownIcon,
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
  description?: string;
  postedAt: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  employer?: {
    companyName: string;
    logoUrl?: string;
    verificationStatus?: string;
  };
  // New internship-specific fields
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
  salaryRange: string;
  paidOnly: boolean;
  remoteOnly: boolean;
  sort: string;
}

export default function CareerTracker({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    locationTypes: [],
    jobTypes: [],
    salaryRange: '',
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
  }, [debouncedSearch, filters.locationTypes, filters.jobTypes, filters.salaryRange, filters.paidOnly, filters.remoteOnly, filters.sort]);

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

      if (filters.salaryRange === '0-30000') {
        params.maxSalary = '30000';
      } else if (filters.salaryRange === '30000-60000') {
        params.minSalary = '30000';
        params.maxSalary = '60000';
      } else if (filters.salaryRange === '60000-100000') {
        params.minSalary = '60000';
        params.maxSalary = '100000';
      } else if (filters.salaryRange === '100000+') {
        params.minSalary = '100000';
      }

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
      salaryRange: '',
      paidOnly: false,
      remoteOnly: false,
      sort: 'newest',
    });
  };

  // Helpers
  const formatCompensation = (job: Job) => {
    if (job.compensationType === 'UNPAID') return 'Unpaid';
    if (!job.salaryMin && !job.salaryMax) return 'Competitive';
    const period = job.salaryPeriod === 'HOURLY' ? '/hr' : job.salaryPeriod === 'MONTHLY' ? '/mo' : '/yr';
    const currency = job.currency || '$';
    const symbol = currency === 'USD' ? '$' : currency;
    if (job.salaryMin && job.salaryMax) {
      if (job.salaryPeriod === 'YEARLY') return `${symbol}${(job.salaryMin / 1000).toFixed(0)}k - ${symbol}${(job.salaryMax / 1000).toFixed(0)}k${period}`;
      return `${symbol}${job.salaryMin} - ${symbol}${job.salaryMax}${period}`;
    }
    if (job.salaryMin) return `${symbol}${job.salaryPeriod === 'YEARLY' ? (job.salaryMin / 1000).toFixed(0) + 'k' : job.salaryMin}+${period}`;
    return `Up to ${symbol}${job.salaryPeriod === 'YEARLY' ? (job.salaryMax! / 1000).toFixed(0) + 'k' : job.salaryMax}${period}`;
  };

  const formatDuration = (job: Job) => {
    if (!job.durationWeeks) return null;
    const months = Math.round(job.durationWeeks / 4);
    return months <= 1 ? '1 month' : `${months} months`;
  };

  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays <= 7) return `${diffDays}d left`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const timeAgo = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const formatJobType = (type?: string) => {
    if (!type) return 'Full-time';
    return type.replace('_', '-').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const hasActiveFilters =
    filters.search || filters.locationTypes.length > 0 || filters.jobTypes.length > 0 || filters.salaryRange || filters.paidOnly || filters.remoteOnly;

  const filterContent = (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-primary" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-2">Search</label>
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Job title or company..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-text-main dark:text-white">💰 Paid only</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, paidOnly: !prev.paidOnly }))}
            className={`w-10 h-6 rounded-full transition-colors ${filters.paidOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.paidOnly ? 'left-5' : 'left-1'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-text-main dark:text-white">🏠 Remote only</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, remoteOnly: !prev.remoteOnly }))}
            className={`w-10 h-6 rounded-full transition-colors ${filters.remoteOnly ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.remoteOnly ? 'left-5' : 'left-1'}`} />
          </button>
        </label>
      </div>

      {/* Work Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">Work Type</label>
        <div className="space-y-2">
          {['REMOTE', 'ONSITE', 'HYBRID'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={filters.locationTypes.includes(type)} onChange={() => toggleFilter('locationTypes', type)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors capitalize">{type.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">Category</label>
        <div className="space-y-2">
          {[
            { value: 'INTERNSHIP', label: '🎓 Internship' },
            { value: 'GRADUATE', label: '🎯 Graduate' },
            { value: 'PART_TIME', label: '⏰ Part-time' },
            { value: 'FULL_TIME', label: '💼 Full-time' },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={filters.jobTypes.includes(type.value)} onChange={() => toggleFilter('jobTypes', type.value)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">Salary Range</label>
        <select
          value={filters.salaryRange}
          onChange={(e) => setFilters((prev) => ({ ...prev, salaryRange: e.target.value }))}
          aria-label="Salary range filter"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Any Salary</option>
          <option value="0-30000">$0 - $30k</option>
          <option value="30000-60000">$30k - $60k</option>
          <option value="60000-100000">$60k - $100k</option>
          <option value="100000+">$100k+</option>
        </select>
      </div>

      {/* Active Tags */}
      {(filters.locationTypes.length > 0 || filters.jobTypes.length > 0 || filters.paidOnly || filters.remoteOnly) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-text-sub mb-2">Active:</p>
          <div className="flex flex-wrap gap-1.5">
            {filters.paidOnly && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Paid</span>}
            {filters.remoteOnly && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Remote</span>}
            {filters.locationTypes.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{t.toLowerCase()}</span>)}
            {filters.jobTypes.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">{formatJobType(t)}</span>)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-card-light dark:bg-card-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-main dark:text-white flex items-center gap-3">
                <BriefcaseIcon className="w-7 h-7 text-primary" />
                Career Tracker
              </h1>
              <p className="text-sm text-text-sub mt-1">
                Explore internships, graduate roles, and full-time opportunities
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
                {hasActiveFilters && <span className="size-2 rounded-full bg-primary" />}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signin?redirect_to=/career-tracker')}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Sign in to Apply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="w-72 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-2xl flex-shrink-0 hidden lg:block h-fit sticky top-6">
            {filterContent}
          </aside>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-card-light dark:bg-card-dark shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold">Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-main dark:text-white">Latest Opportunities</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="newest">Newest</option>
                  <option value="stipend">Highest Stipend</option>
                  <option value="deadline">Deadline Soon</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <GlobalLoader fullScreen={false} />
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <BriefcaseIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
                <p className="mt-4 text-gray-500 dark:text-gray-400">No jobs found matching your criteria</p>
                <button onClick={clearFilters} className="mt-4 text-primary hover:text-primary-dark font-medium">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => {
                  const isInternship = job.jobType === 'INTERNSHIP' || job.jobType === 'GRADUATE';
                  const deadline = formatDeadline(job.applicationDeadline);
                  const duration = formatDuration(job);
                  const isDeadlineSoon = deadline && (deadline.includes('d left') || deadline === 'Today');

                  return (
                    <div
                      key={job.id}
                      className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary/30 transition-all group relative"
                    >
                      {/* Top Row: Logo + Save */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {job.employer?.logoUrl ? (
                              <img src={job.employer.logoUrl} alt={job.company} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              job.company?.[0]?.toUpperCase() || 'C'
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors truncate text-[15px]" title={job.title}>
                              {job.title}
                            </h4>
                            <p className="text-xs text-text-sub truncate flex items-center gap-1">
                              {job.company}
                              {job.employer?.verificationStatus === 'verified' && (
                                <span className="text-blue-500" title="Verified">✓</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleSave(job)}
                          className={`p-1.5 rounded-lg transition-colors ${job.isSaved ? 'text-primary bg-primary/10' : 'text-gray-300 hover:text-primary hover:bg-primary/5'}`}
                        >
                          <BookmarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* ── 5 Decision Factors Grid ── */}
                      <div className="space-y-2 mb-4">
                        {/* Compensation */}
                        <div className="flex items-center gap-2 text-xs">
                          <CurrencyDollarIcon className={`w-4 h-4 flex-shrink-0 ${job.compensationType === 'UNPAID' ? 'text-gray-400' : 'text-green-500'}`} />
                          <span className={`font-semibold ${job.compensationType === 'UNPAID' ? 'text-gray-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCompensation(job)}
                          </span>
                          {isInternship && job.compensationType && job.compensationType !== 'UNPAID' && (
                            <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase">
                              {job.compensationType}
                            </span>
                          )}
                        </div>

                        {/* Duration + Start (internships) */}
                        {isInternship && (duration || job.startDate) && (
                          <div className="flex items-center gap-2 text-xs text-text-sub">
                            <ClockIcon className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                            {duration && <span>{duration}</span>}
                            {duration && job.startDate && <span>·</span>}
                            {job.startDate && (
                              <span>
                                Starts {new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            )}
                            {job.hoursPerWeek && <span>· {job.hoursPerWeek} hrs/wk</span>}
                          </div>
                        )}

                        {/* Location */}
                        <div className="flex items-center gap-2 text-xs text-text-sub">
                          <MapPinIcon className="w-4 h-4 flex-shrink-0 text-blue-400" />
                          <span>{job.location || 'Remote'}</span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase text-text-sub">
                            {job.locationType}
                          </span>
                        </div>

                        {/* Deadline (internships) */}
                        {deadline && (
                          <div className="flex items-center gap-2 text-xs">
                            <CalendarIcon className={`w-4 h-4 flex-shrink-0 ${isDeadlineSoon ? 'text-red-500' : 'text-orange-400'}`} />
                            <span className={isDeadlineSoon ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-text-sub'}>
                              Deadline: {deadline}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${job.jobType === 'INTERNSHIP' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                            job.jobType === 'GRADUATE' ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' :
                              'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          }`}>
                          {formatJobType(job.jobType)}
                        </span>
                        {job.skills?.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-text-sub">
                            {skill}
                          </span>
                        ))}
                        {(job.skills?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-text-sub">
                            +{(job.skills?.length || 0) - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        {job.hasApplied ? (
                          <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(job)}
                            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                          >
                            Apply Now →
                          </button>
                        )}
                        <span className="text-xs text-gray-400">{timeAgo(job.postedAt || new Date().toISOString())}</span>
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
          onClose={() => { setShowApplyModal(false); setSelectedJob(null); }}
          job={selectedJob}
          onSuccess={() => { if (selectedJob) handleApplySuccess(selectedJob.id); }}
        />
      )}
    </div>
  );
}
