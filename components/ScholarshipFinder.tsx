import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [scholarships, setScholarships] = useState<any[]>([]);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [studyLevelFilter, setStudyLevelFilter] = useState('');

  const countries = [
    'USA',
    'UK',
    'Japan',
    'Germany',
    'Australia',
    'Canada',
    'France',
    'Netherlands',
    'Switzerland',
    'United Kingdom',
  ];
  const studyLevels = ['HIGHSCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE', 'PHD', 'ANY'];

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (countryFilter) params.country = countryFilter;
      if (studyLevelFilter) params.studyLevel = studyLevelFilter;

      const scholarshipsRes = await scholarshipApi.list(params);
      const list =
        (scholarshipsRes.data as any)?.scholarships ||
        (Array.isArray(scholarshipsRes.data) ? scholarshipsRes.data : []);
      setScholarships(list);
    } catch (error) {
      console.error('Failed to load scholarships', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchScholarships();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCountryFilter('');
    setStudyLevelFilter('');
    setTimeout(() => fetchScholarships(), 0);
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const headerContent = (
    <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            school
          </span>
        </div>
        <span className="font-bold text-lg">StudentOS</span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.SCHOLARSHIPS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 flex overflow-hidden bg-[#fafafa] dark:bg-background-dark h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Scholarship Finder
                  </h1>
                  <p className="text-lg text-text-sub">
                    Unlock funding opportunities curated for your academic journey.
                  </p>
                </div>
                <div className="flex w-full md:w-auto">
                  <div className="flex shadow-sm rounded-lg overflow-hidden w-full md:w-[480px]">
                    <div className="relative flex-1 bg-white dark:bg-card-dark border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg hover:z-10 focus-within:z-10">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        search
                      </span>
                      <input
                        className="w-full h-11 pl-10 pr-4 text-sm border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500"
                        placeholder="Search by name, university..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-2.5 rounded-r-lg transition-colors flex items-center justify-center"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              <aside className="w-64 flex-shrink-0 hidden lg:block space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Reset all
                  </button>
                </div>

                {/* Country Filter */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">public</span>
                      Country
                    </span>
                  </label>
                  <select
                    value={countryFilter}
                    onChange={(e) => {
                      setCountryFilter(e.target.value);
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Countries</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Study Level Filter */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">school</span>
                      Study Level
                    </span>
                  </label>
                  <select
                    value={studyLevelFilter}
                    onChange={(e) => {
                      setStudyLevelFilter(e.target.value);
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Levels</option>
                    {studyLevels.map((l) => (
                      <option key={l} value={l}>
                        {l.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                  Apply Filters
                </button>

                {/* Active Filters Display */}
                {(countryFilter || studyLevelFilter) && (
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-2">
                      {countryFilter && (
                        <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded-full border border-primary/20">
                          {countryFilter}
                          <button
                            onClick={() => setCountryFilter('')}
                            className="text-gray-400 hover:text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      )}
                      {studyLevelFilter && (
                        <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 text-xs px-2 py-1 rounded-full border border-primary/20">
                          {studyLevelFilter}
                          <button
                            onClick={() => setStudyLevelFilter('')}
                            className="text-gray-400 hover:text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </aside>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-text-sub text-sm">
                    Showing{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {scholarships.length}
                    </span>{' '}
                    scholarships
                  </p>
                </div>

                {isLoading ? (
                  <div className="text-center py-20">Loading scholarships...</div>
                ) : scholarships.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No scholarships found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                    {scholarships.map((s: any) => (
                      <div
                        key={s.id}
                        className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative"
                      >
                        <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[24px]">
                            bookmark_border
                          </span>
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold flex-shrink-0">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '20px' }}
                            >
                              school
                            </span>
                          </div>
                          <div className="overflow-hidden">
                            <h3
                              className="text-sm font-semibold text-primary truncate"
                              title={s.institution}
                            >
                              {s.institution}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <span>{s.country}</span>
                            </div>
                          </div>
                        </div>
                        <h2
                          className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors truncate"
                          title={s.title}
                        >
                          {s.title}
                        </h2>
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30 truncate max-w-full">
                            <span className="material-symbols-outlined text-[14px] font-bold">
                              monetization_on
                            </span>
                            {s.awardAmount}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-8 content-start h-16">
                          <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">
                            {s.studyLevel}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">
                            {s.awardType}
                          </span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-gray-500">
                            <span className="material-symbols-outlined text-[16px]">
                              calendar_today
                            </span>
                            <span>Deadline: {formatDate(s.deadline)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
