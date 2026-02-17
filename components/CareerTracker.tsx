import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationProps } from '../types';
import { jobApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import ApplyJobModal from './ApplyJobModal';
import { toast } from 'react-hot-toast';

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
  };
}

interface Filters {
  search: string;
  locationTypes: string[];
  jobTypes: string[];
  salaryRange: string;
}

export default function CareerTracker({ navigateTo: _navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Filter State
  const [filters, setFilters] = useState<Filters>({
    search: '',
    locationTypes: [],
    jobTypes: [],
    salaryRange: '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.locationTypes, filters.jobTypes, filters.salaryRange]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.locationTypes.length === 1) params.locationType = filters.locationTypes[0];
      if (filters.jobTypes.length === 1) params.jobType = filters.jobTypes[0];

      // Salary range
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
        toast.success('Job removed from saved');
      } else {
        await jobApi.save(job.id);
        toast.success('Job saved!');
      }
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, isSaved: !j.isSaved } : j)));
    } catch {
      toast.error('Failed to update saved status');
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
    });
  };

  // Helper to format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive';
    if (min && !max) return `$${(min / 1000).toFixed(0)}k+`;
    if (!min && max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return `$${(min! / 1000).toFixed(0)}k - $${(max! / 1000).toFixed(0)}k`;
  };

  // Helper for time ago
  const timeAgo = (dateStr: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // Format job type for display
  const formatJobType = (type?: string) => {
    if (!type) return 'Full-time';
    return type.replace('_', '-').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const hasActiveFilters =
    filters.search ||
    filters.locationTypes.length > 0 ||
    filters.jobTypes.length > 0 ||
    filters.salaryRange;

  /* ── Filter Sidebar Content ── */
  const filterContent = (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">filter_list</span>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-2">Search</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Job title or company..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Location Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">Work Type</label>
        <div className="space-y-2">
          {['REMOTE', 'ONSITE', 'HYBRID'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.locationTypes.includes(type)}
                onChange={() => toggleFilter('locationTypes', type)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors capitalize">
                {type.toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-sub mb-3">Category</label>
        <div className="space-y-2">
          {[
            { value: 'INTERNSHIP', label: 'Internship' },
            { value: 'PART_TIME', label: 'Part-time' },
            { value: 'FULL_TIME', label: 'Full-time' },
          ].map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.jobTypes.includes(type.value)}
                onChange={() => toggleFilter('jobTypes', type.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">
                {type.label}
              </span>
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
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">Any Salary</option>
          <option value="0-30000">$0 - $30k</option>
          <option value="30000-60000">$30k - $60k</option>
          <option value="60000-100000">$60k - $100k</option>
          <option value="100000+">$100k+</option>
        </select>
      </div>

      {/* Active Filters Summary */}
      {(filters.locationTypes.length > 0 || filters.jobTypes.length > 0) && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-text-sub mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.locationTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
              >
                {type.toLowerCase()}
                <button
                  onClick={() => toggleFilter('locationTypes', type)}
                  className="hover:text-primary-dark"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.jobTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-1"
              >
                {formatJobType(type)}
                <button
                  onClick={() => toggleFilter('jobTypes', type)}
                  className="hover:text-emerald-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display">
      {/* ── Page Header ── */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-card-light dark:bg-card-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-main dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">work</span>
                Career Tracker
              </h1>
              <p className="text-sm text-text-sub mt-1">
                Explore internships, graduate roles, and full-time opportunities
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters
                {hasActiveFilters && <span className="size-2 rounded-full bg-primary" />}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signin?redirect_to=/career-tracker')}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors shadow-sm"
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
          {/* ── Desktop Filter Sidebar ── */}
          <aside className="w-72 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-800 rounded-xl flex-shrink-0 hidden lg:block h-fit sticky top-6">
            {filterContent}
          </aside>

          {/* ── Mobile Filter Panel ── */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-card-light dark:bg-card-dark shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                {filterContent}
              </div>
            </div>
          )}

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-text-main dark:text-white">Latest Opportunities</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-gray-500">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700">
                  work_off
                </span>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  No jobs found matching your criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary hover:text-primary-dark font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300">
                        {job.employer?.logoUrl ? (
                          <img
                            src={job.employer.logoUrl}
                            alt={job.company}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          job.company?.[0]?.toUpperCase() || 'C'
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleSave(job)}
                        className={`transition-colors ${
                          job.isSaved ? 'text-primary' : 'text-gray-400 hover:text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {job.isSaved ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4
                        className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors truncate"
                        title={job.title}
                      >
                        {job.title}
                      </h4>
                      <p className="text-sm text-text-sub truncate" title={job.company}>
                        {job.company}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden content-start">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700 max-w-[100px] truncate">
                        {job.location || 'Remote'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">
                        {job.locationType}
                      </span>
                      {job.jobType && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                          {formatJobType(job.jobType)}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      {job.hasApplied ? (
                        <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            check_circle
                          </span>
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        {timeAgo(job.postedAt || new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal — only rendered for authenticated users */}
      {isAuthenticated && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={() => {
            if (selectedJob) {
              handleApplySuccess(selectedJob.id);
            }
          }}
        />
      )}
    </div>
  );
}
