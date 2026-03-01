import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';
import {
  AcademicCapIcon,
  BookmarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  BuildingLibraryIcon,
  LanguageIcon,
} from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon, FireIcon } from '@heroicons/react/24/outline';

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Types ────────────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
  isSaved?: boolean;
}

interface AIRecommendation {
  id: string;
  score: number;
  note: string;
  warnings: string[];
}

interface Filters {
  countries: string[];
  studyLevel: string;
  languages: string[];
  minGpa: number;
  fields: string[];
  fundingTypes: string[];
  deadlineRange: string;
  scholarshipTypes: string[];
}

type SortOption = 'relevance' | 'deadline' | 'amount' | 'recent';

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Constants ────────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

const COUNTRIES = [
  'USA',
  'UK',
  'Japan',
  'Germany',
  'Australia',
  'Canada',
  'France',
  'Netherlands',
  'Switzerland',
  'South Korea',
  'China',
  'Turkey',
  'Hungary',
  'Malaysia',
  'New Zealand',
  'Sweden',
  'Norway',
  'Italy',
];

const STUDY_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'UNDERGRADUATE', label: "Bachelor's" },
  { value: 'POSTGRADUATE', label: "Master's" },
  { value: 'PHD', label: 'PhD' },
  { value: 'POSTDOCTORAL', label: 'Postdoctoral' },
];

const LANGUAGES = [
  'English',
  'German',
  'French',
  'Japanese',
  'Korean',
  'Chinese',
  'Turkish',
  'No Requirement',
];

const FIELDS = [
  'Computer Science',
  'Engineering',
  'Medicine & Health',
  'Business & Management',
  'Law',
  'Arts & Humanities',
  'Natural Sciences',
  'Social Sciences',
  'Education',
  'Agriculture',
  'Architecture',
  'Any Field',
];

const FUNDING_TYPES = [
  'Full Scholarship',
  'Partial Scholarship',
  'Tuition Only',
  'Living Stipend',
  'Travel Grant',
];

const DEADLINE_OPTIONS = [
  { value: '', label: 'All Deadlines' },
  { value: 'open', label: 'Open Now' },
  { value: '30', label: 'Next 30 Days' },
  { value: '90', label: 'Next 3 Months' },
  { value: '180', label: 'Next 6 Months' },
];

const SCHOLARSHIP_TYPES = ['Government', 'University', 'Private/Foundation', 'Research Grant'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'deadline', label: 'Deadline (Soonest)' },
  { value: 'amount', label: 'Amount (Highest)' },
  { value: 'recent', label: 'Recently Added' },
];

const DEFAULT_FILTERS: Filters = {
  countries: [],
  studyLevel: '',
  languages: [],
  minGpa: 0,
  fields: [],
  fundingTypes: [],
  deadlineRange: '',
  scholarshipTypes: [],
};

const FLAG_MAP: Record<string, string> = {
  USA: '🇺🇸',
  UK: '🇬🇧',
  Japan: '🇯🇵',
  Germany: '🇩🇪',
  Australia: '🇦🇺',
  Canada: '🇨🇦',
  France: '🇫🇷',
  Netherlands: '🇳🇱',
  Switzerland: '🇨🇭',
  'South Korea': '🇰🇷',
  China: '🇨🇳',
  Turkey: '🇹🇷',
  Hungary: '🇭🇺',
  Malaysia: '🇲🇾',
  'New Zealand': '🇳🇿',
  Sweden: '🇸🇪',
  Norway: '🇳🇴',
  Italy: '🇮🇹',
  'United Kingdom': '🇬🇧',
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Helpers ──────────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  const diff = (new Date(d).getTime() - Date.now()) / 86_400_000;
  return Math.ceil(diff);
}

function formatDate(d: string | null | undefined): string {
  if (!d) return 'No deadline';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseAmount(amt: string | null): number {
  if (!amt) return 0;
  const match = amt.replace(/,/g, '').match(/[\d]+/);
  return match ? parseInt(match[0]) : 0;
}

function getFlag(country: string): string {
  return FLAG_MAP[country] || '🌍';
}

function deadlineBadge(days: number | null): { color: string; label: string } | null {
  if (days === null || days <= 0) return null;
  if (days <= 7)
    return {
      color:
        'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/30',
      label: `${days}d left`,
    };
  if (days <= 30)
    return {
      color:
        'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/30',
      label: `${days}d left`,
    };
  if (days <= 90)
    return {
      color:
        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30',
      label: `${days}d left`,
    };
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Filter Section UI ───────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FilterGroup({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left group"
        type="button"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUpIcon className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Main Component ──────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  /* ── State ── */
  const [isLoading, setIsLoading] = useState(true);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /* ── Fetch scholarships ── */
  const fetchScholarships = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await scholarshipApi.list({ page: 1 });
      const list =
        (res.data as Record<string, unknown>)?.scholarships ||
        (Array.isArray(res.data) ? res.data : []);
      setAllScholarships(list as Scholarship[]);

      const ids = new Set<string>();
      (list as Scholarship[]).forEach((s) => {
        if (s.isSaved) ids.add(s.id);
      });
      setSavedIds(ids);
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  /* ── Save / Unsave ── */
  const toggleSave = async (id: string) => {
    const isSaved = savedIds.has(id);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(id);
      setSavedIds(next);
      try {
        await scholarshipApi.unsave(id);
      } catch {
        next.add(id);
        setSavedIds(new Set(next));
      }
    } else {
      next.add(id);
      setSavedIds(next);
      try {
        await scholarshipApi.save(id);
      } catch {
        next.delete(id);
        setSavedIds(new Set(next));
      }
    }
  };

  /* ── Filter helpers ── */
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (
    key: 'countries' | 'languages' | 'fields' | 'fundingTypes' | 'scholarshipTypes',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const isAnyFilterActive =
    filters.countries.length > 0 ||
    filters.studyLevel !== '' ||
    filters.languages.length > 0 ||
    filters.minGpa > 0 ||
    filters.fields.length > 0 ||
    filters.fundingTypes.length > 0 ||
    filters.deadlineRange !== '' ||
    filters.scholarshipTypes.length > 0;

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchQuery('');
    setFiltersApplied(false);
    setAiRecommendations([]);
    setSortBy('relevance');
  };

  /* ── Apply Filters (AI auto-match) ── */
  const handleApplyFilters = async () => {
    setFiltersApplied(true);
    setIsAiSearching(true);
    setAiRecommendations([]);
    try {
      const res = await scholarshipApi.autoMatch({
        studyLevel: filters.studyLevel,
        countries: filters.countries,
        major: filters.fields.length > 0 ? filters.fields[0] : 'Any Field',
        gpa: filters.minGpa,
        fundingTypes: filters.fundingTypes,
        languages: filters.languages,
        deadlineRange: filters.deadlineRange,
        scholarshipTypes: filters.scholarshipTypes,
      });
      const data = res.data as Record<string, unknown>;
      const aiResults = (data?.scholarships as Scholarship[]) || [];
      const recs = (data?.aiRecommendations as AIRecommendation[]) || [];

      if (aiResults.length > 0) {
        setAllScholarships((prev) => {
          const existingTitles = new Set(prev.map((s) => s.title.toLowerCase()));
          const newOnes = aiResults.filter((s) => !existingTitles.has(s.title.toLowerCase()));
          return [...prev, ...newOnes];
        });
      }
      setAiRecommendations(recs);
    } catch (err) {
      console.error('AI auto-match failed:', err);
    } finally {
      setIsAiSearching(false);
    }
  };

  /* ── Scoring & Sorting ── */
  const displayScholarships = useMemo(() => {
    let list = [...allScholarships];

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }

    // Apply hard filters
    if (filtersApplied) {
      if (filters.studyLevel) {
        list = list.filter((s) => s.studyLevel === filters.studyLevel || s.studyLevel === 'ANY');
      }
      if (filters.countries.length > 0) {
        list = list.filter((s) =>
          filters.countries.some((c) => s.country.toLowerCase().includes(c.toLowerCase()))
        );
      }
      if (filters.deadlineRange) {
        const maxDays = parseInt(filters.deadlineRange) || 365;
        list = list.filter((s) => {
          const d = daysUntil(s.deadline);
          return d !== null && d > 0 && d <= maxDays;
        });
      }
    }

    // Sort
    switch (sortBy) {
      case 'deadline':
        list.sort((a, b) => {
          const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return da - db;
        });
        break;
      case 'amount':
        list.sort((a, b) => parseAmount(b.awardAmount) - parseAmount(a.awardAmount));
        break;
      case 'recent':
        list.reverse();
        break;
      case 'relevance':
      default:
        if (aiRecommendations.length > 0) {
          const scoreMap = new Map(aiRecommendations.map((r) => [r.id, r.score]));
          list.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
        }
        break;
    }

    return list;
  }, [allScholarships, searchQuery, filters, filtersApplied, sortBy, aiRecommendations]);

  // Curated sections for initial state
  const featuredScholarships = useMemo(
    () =>
      allScholarships
        .filter((s) => {
          const amt = (s.awardAmount || '').toLowerCase();
          return (
            amt.includes('full') ||
            amt.includes('tuition') ||
            amt.includes('50,000') ||
            amt.includes('100')
          );
        })
        .slice(0, 4),
    [allScholarships]
  );

  const upcomingDeadlines = useMemo(
    () =>
      allScholarships
        .filter((s) => {
          const d = daysUntil(s.deadline);
          return d !== null && d > 0 && d <= 90;
        })
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 6),
    [allScholarships]
  );

  /* ─── Header ─── */
  const headerContent = (
    <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-lg bg-[#2D3A8C]/10 dark:bg-[#4F6EF7]/15 flex items-center justify-center">
          <TrophyIcon className="w-5 h-5 text-[#2D3A8C] dark:text-[#4F6EF7]" />
        </div>
        <span className="font-bold text-lg text-[#1A1A2E] dark:text-white tracking-tight">
          Scholarship Finder
        </span>
        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-[10px] font-bold uppercase tracking-widest">
          AI Powered
        </span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  /* ─── Render ─── */
  return (
    <DashboardLayout
      currentScreen={Screen.SCHOLARSHIPS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 flex overflow-hidden bg-[#F8F9FC] dark:bg-[#0f111a] h-full">
        {/* ═══════════ LEFT SIDEBAR — SMART FILTERS ═══════════ */}
        <aside className="w-[300px] flex-shrink-0 hidden lg:flex flex-col bg-white dark:bg-[#161b2e] border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1A1A2E] dark:text-white flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-[#4F6EF7]" />
                Filters
              </h3>
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#4F6EF7] hover:text-[#2D3A8C] font-medium transition-colors"
                >
                  Reset all
                </button>
              )}
            </div>
          </div>

          {/* Filter Groups */}
          <div className="flex-1 overflow-y-auto px-6">
            {/* Country */}
            <FilterGroup title="Country" icon={<GlobeAltIcon className="w-4 h-4 text-[#4F6EF7]" />}>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {COUNTRIES.map((c) => (
                  <label key={c} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.countries.includes(c)}
                      onChange={() => toggleArrayFilter('countries', c)}
                      className="rounded border-gray-300 dark:border-gray-600 text-[#4F6EF7] focus:ring-[#4F6EF7] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#1A1A2E] dark:group-hover:text-white transition-colors">
                      {getFlag(c)} {c}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Study Level */}
            <FilterGroup
              title="Study Level"
              icon={<AcademicCapIcon className="w-4 h-4 text-[#4F6EF7]" />}
            >
              <select
                value={filters.studyLevel}
                onChange={(e) => updateFilter('studyLevel', e.target.value)}
                aria-label="Study Level"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-[#F8F9FC] dark:bg-[#1a1f35] px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#4F6EF7]/30 focus:border-[#4F6EF7] outline-none transition-all"
              >
                {STUDY_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </FilterGroup>

            {/* Language */}
            <FilterGroup
              title="Language"
              icon={<LanguageIcon className="w-4 h-4 text-[#4F6EF7]" />}
              defaultOpen={false}
            >
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleArrayFilter('languages', lang)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filters.languages.includes(lang)
                        ? 'bg-[#4F6EF7] text-white shadow-sm'
                        : 'bg-[#F8F9FC] dark:bg-[#1a1f35] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* GPA */}
            <FilterGroup
              title="Minimum GPA"
              icon={<StarIcon className="w-4 h-4 text-[#F59E0B]" />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Your GPA</span>
                  <span className="text-sm font-bold text-[#4F6EF7] tabular-nums">
                    {filters.minGpa > 0 ? filters.minGpa.toFixed(1) : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={filters.minGpa}
                  onChange={(e) => updateFilter('minGpa', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#4F6EF7]"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0.0</span>
                  <span>2.0</span>
                  <span>4.0</span>
                </div>
              </div>
            </FilterGroup>

            {/* Field of Study */}
            <FilterGroup
              title="Field of Study"
              icon={<BookmarkIcon className="w-4 h-4 text-[#4F6EF7]" />}
              defaultOpen={false}
            >
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {FIELDS.map((f) => (
                  <label key={f} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.fields.includes(f)}
                      onChange={() => toggleArrayFilter('fields', f)}
                      className="rounded border-gray-300 dark:border-gray-600 text-[#4F6EF7] focus:ring-[#4F6EF7] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#1A1A2E] dark:group-hover:text-white transition-colors">
                      {f}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Funding Type */}
            <FilterGroup
              title="Funding Type"
              icon={<CurrencyDollarIcon className="w-4 h-4 text-[#10B981]" />}
            >
              <div className="space-y-1">
                {FUNDING_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.fundingTypes.includes(t)}
                      onChange={() => toggleArrayFilter('fundingTypes', t)}
                      className="rounded border-gray-300 dark:border-gray-600 text-[#10B981] focus:ring-[#10B981] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#1A1A2E] dark:group-hover:text-white transition-colors">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>

            {/* Deadline */}
            <FilterGroup
              title="Deadline"
              icon={<CalendarIcon className="w-4 h-4 text-[#F59E0B]" />}
              defaultOpen={false}
            >
              <div className="space-y-1">
                {DEADLINE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      updateFilter(
                        'deadlineRange',
                        filters.deadlineRange === opt.value ? '' : opt.value
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.deadlineRange === opt.value
                        ? 'bg-[#4F6EF7] text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-[#F8F9FC] dark:hover:bg-[#1a1f35]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            {/* Scholarship Type */}
            <FilterGroup
              title="Scholarship Type"
              icon={<BuildingLibraryIcon className="w-4 h-4 text-[#2D3A8C]" />}
              defaultOpen={false}
            >
              <div className="space-y-1">
                {SCHOLARSHIP_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2.5 py-1 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.scholarshipTypes.includes(t)}
                      onChange={() => toggleArrayFilter('scholarshipTypes', t)}
                      className="rounded border-gray-300 dark:border-gray-600 text-[#2D3A8C] focus:ring-[#2D3A8C] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-[#1A1A2E] dark:group-hover:text-white transition-colors">
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </FilterGroup>
          </div>

          {/* Apply Button */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleApplyFilters}
              disabled={isAiSearching}
              className="w-full bg-[#2D3A8C] hover:bg-[#222d6e] disabled:bg-[#2D3A8C]/50 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#2D3A8C]/20 hover:shadow-lg hover:shadow-[#2D3A8C]/30 flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              {isAiSearching ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI is searching…
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4.5 h-4.5" />
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ═══════════ RIGHT PANEL — RESULTS ═══════════ */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
            {/* ── Search + Sort Row ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-xl">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                <input
                  className="w-full h-11 pl-11 pr-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#161b2e] text-[#1A1A2E] dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#4F6EF7]/30 focus:border-[#4F6EF7] outline-none transition-all"
                  placeholder="Search by name, university, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#161b2e] border border-gray-200 dark:border-gray-700 rounded-xl hover:border-[#4F6EF7] transition-all"
                >
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#161b2e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 min-w-[180px] py-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value
                            ? 'text-[#4F6EF7] font-semibold bg-[#4F6EF7]/5'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1f35]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── AI Recommendation Banner ── */}
            {aiRecommendations.length > 0 && !isAiSearching && (
              <div className="mb-8 p-5 bg-gradient-to-r from-[#2D3A8C]/5 to-[#4F6EF7]/5 dark:from-[#2D3A8C]/10 dark:to-[#4F6EF7]/10 border border-[#4F6EF7]/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-5 h-5 text-[#4F6EF7]" />
                  <p className="text-sm font-bold text-[#2D3A8C] dark:text-[#4F6EF7]">
                    AI Recommendations for You
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiRecommendations.slice(0, 5).map((rec) => {
                    const s = allScholarships.find(
                      (sc) =>
                        sc.id === rec.id ||
                        sc.title.toLowerCase().includes((rec.id || '').toLowerCase())
                    );
                    return (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2 bg-white dark:bg-[#161b2e] px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 text-xs"
                      >
                        <span className="font-bold text-[#4F6EF7]">{rec.score}%</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {s?.title || rec.id}
                        </span>
                        {rec.note && (
                          <span className="text-gray-400 hidden sm:inline">— {rec.note}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Loading / AI Searching ── */}
            {isLoading || isAiSearching ? (
              <>
                {isAiSearching && (
                  <div className="flex items-center gap-3 mb-8 p-4 bg-[#4F6EF7]/5 dark:bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 rounded-xl">
                    <span className="inline-block w-5 h-5 border-2 border-[#4F6EF7]/30 border-t-[#4F6EF7] rounded-full animate-spin" />
                    <div>
                      <p className="text-sm font-semibold text-[#2D3A8C] dark:text-[#4F6EF7]">
                        AI is searching the web…
                      </p>
                      <p className="text-xs text-[#4F6EF7]/70 mt-0.5">
                        Scraping scholarshipscorner.website and ranking matches for your profile
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
                >
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#161b2e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="size-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-4" />
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full mb-3" />
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-20" />
                        <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-full w-24" />
                      </div>
                      <div className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-full" />
                    </div>
                  ))}
                </div>
              </>
            ) : filtersApplied || searchQuery ? (
              /* ═══ FILTERED RESULTS ═══ */
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-[#6B7280]">
                    Showing{' '}
                    <span className="font-bold text-[#1A1A2E] dark:text-white">
                      {displayScholarships.length}
                    </span>{' '}
                    {filtersApplied ? 'matched scholarships' : 'results'}
                  </p>
                  {filtersApplied && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-[#4F6EF7] hover:text-[#2D3A8C] font-medium flex items-center gap-1 transition-colors"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                      Clear filters
                    </button>
                  )}
                </div>

                {displayScholarships.length === 0 ? (
                  <div className="text-center py-20">
                    <MagnifyingGlassIcon className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-5" />
                    <p className="text-lg font-semibold text-[#1A1A2E] dark:text-white mb-2">
                      No scholarships match your criteria
                    </p>
                    <p className="text-sm text-[#6B7280] mb-6">
                      Try adjusting your filters or broadening your search.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="text-sm text-[#4F6EF7] hover:text-[#2D3A8C] font-semibold transition-colors"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
                  >
                    {displayScholarships.map((s) => (
                      <ScholarshipCard
                        key={s.id}
                        scholarship={s}
                        isSaved={savedIds.has(s.id)}
                        onToggleSave={() => toggleSave(s.id)}
                        aiRec={aiRecommendations.find((r) => r.id === s.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ═══ INITIAL STATE — TRENDING ═══ */
              <div className="space-y-12">
                {/* Featured */}
                {featuredScholarships.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-5">
                      <FireIcon className="w-5 h-5 text-[#F59E0B]" />
                      <h2 className="text-base font-bold text-[#1A1A2E] dark:text-white">
                        Trending Scholarships
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {featuredScholarships.map((s) => (
                        <div
                          key={s.id}
                          className="relative bg-gradient-to-br from-[#2D3A8C] to-[#4F6EF7] rounded-2xl p-6 text-white overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-[#2D3A8C]/20 transition-all duration-300"
                          onClick={() =>
                            s.applicationUrl && window.open(s.applicationUrl, '_blank')
                          }
                        >
                          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                          <div className="relative z-10">
                            <p className="text-blue-200 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                              {s.institution}
                            </p>
                            <h3 className="text-lg font-bold mb-3 leading-tight">{s.title}</h3>
                            <div className="flex items-center gap-2.5 text-sm flex-wrap">
                              <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium">
                                {getFlag(s.country)} {s.country}
                              </span>
                              {s.awardAmount && (
                                <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium">
                                  {s.awardAmount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming Deadlines */}
                {upcomingDeadlines.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-5">
                      <ClockIcon className="w-5 h-5 text-[#EF4444]" />
                      <h2 className="text-base font-bold text-[#1A1A2E] dark:text-white">
                        Upcoming Deadlines
                      </h2>
                    </div>
                    <div
                      className="grid gap-6"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
                    >
                      {upcomingDeadlines.map((s) => (
                        <ScholarshipCard
                          key={s.id}
                          scholarship={s}
                          isSaved={savedIds.has(s.id)}
                          onToggleSave={() => toggleSave(s.id)}
                          showUrgency
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* All */}
                {allScholarships.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2.5 mb-5">
                      <AcademicCapIcon className="w-5 h-5 text-[#4F6EF7]" />
                      <h2 className="text-base font-bold text-[#1A1A2E] dark:text-white">
                        All Scholarships
                      </h2>
                      <span className="text-xs text-[#6B7280] font-medium">
                        ({allScholarships.length})
                      </span>
                    </div>
                    <div
                      className="grid gap-6"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
                    >
                      {allScholarships.slice(0, 12).map((s) => (
                        <ScholarshipCard
                          key={s.id}
                          scholarship={s}
                          isSaved={savedIds.has(s.id)}
                          onToggleSave={() => toggleSave(s.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {allScholarships.length === 0 && !isLoading && (
                  <div className="text-center py-20">
                    <TrophyIcon className="w-14 h-14 text-gray-200 dark:text-gray-700 mx-auto mb-5" />
                    <p className="text-lg font-semibold text-[#1A1A2E] dark:text-white mb-2">
                      No scholarships yet
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      Scholarships will appear here once they are added to the database.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── ScholarshipCard ─────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ScholarshipCard({
  scholarship: s,
  isSaved,
  onToggleSave,
  showUrgency = false,
  aiRec,
}: {
  scholarship: Scholarship;
  isSaved: boolean;
  onToggleSave: () => void;
  showUrgency?: boolean;
  aiRec?: AIRecommendation;
}) {
  const days = daysUntil(s.deadline);
  const urgencyBadge = deadlineBadge(days);
  const isUrgent = days !== null && days > 0 && days <= 15;

  return (
    <div className="bg-white dark:bg-[#161b2e] rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 transition-all duration-300 flex flex-col h-full group relative">
      {/* Save */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave();
        }}
        className="absolute top-5 right-5 z-10 text-gray-300 dark:text-gray-600 hover:text-[#4F6EF7] transition-colors"
        title={isSaved ? 'Remove bookmark' : 'Save scholarship'}
      >
        {isSaved ? (
          <BookmarkIcon className="w-5 h-5 text-[#4F6EF7]" />
        ) : (
          <BookmarkOutlineIcon className="w-5 h-5" />
        )}
      </button>

      {/* Institution + Country */}
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-[#4F6EF7]/8 dark:bg-[#4F6EF7]/15 flex items-center justify-center flex-shrink-0">
          <AcademicCapIcon className="w-5 h-5 text-[#4F6EF7]" />
        </div>
        <div className="min-w-0 flex-1 pr-7">
          <h4 className="text-sm font-semibold text-[#4F6EF7] truncate" title={s.institution}>
            {s.institution}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <span>{getFlag(s.country)}</span>
            <span>{s.country}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-bold text-[#1A1A2E] dark:text-white mb-2 leading-snug group-hover:text-[#4F6EF7] transition-colors line-clamp-2"
        title={s.title}
      >
        {s.title}
      </h3>

      {/* Description */}
      {s.description && (
        <p className="text-xs text-[#6B7280] leading-relaxed mb-3 line-clamp-2">{s.description}</p>
      )}

      {/* AI Score */}
      {aiRec && aiRec.score > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-[#4F6EF7]/5 dark:bg-[#4F6EF7]/10 rounded-lg border border-[#4F6EF7]/10">
          <SparklesIcon className="w-3.5 h-3.5 text-[#4F6EF7] flex-shrink-0" />
          <span className="text-xs font-bold text-[#4F6EF7]">{aiRec.score}% match</span>
          {aiRec.note && <span className="text-xs text-[#6B7280] truncate">— {aiRec.note}</span>}
        </div>
      )}

      {/* Amount */}
      {s.awardAmount && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 bg-[#10B981]/8 dark:bg-[#10B981]/15 text-[#10B981] text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#10B981]/15">
            <CurrencyDollarIcon className="w-3.5 h-3.5" />
            {s.awardAmount}
          </span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="bg-[#F8F9FC] dark:bg-[#1a1f35] text-[#6B7280] text-[10px] font-semibold px-2 py-1 rounded-md capitalize border border-gray-100 dark:border-gray-700">
          {s.studyLevel?.toLowerCase().replace('_', ' ')}
        </span>
        <span className="bg-[#F8F9FC] dark:bg-[#1a1f35] text-[#6B7280] text-[10px] font-semibold px-2 py-1 rounded-md border border-gray-100 dark:border-gray-700">
          {s.awardType}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{formatDate(s.deadline)}</span>
          {(showUrgency || isUrgent) && urgencyBadge && (
            <span
              className={`ml-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${urgencyBadge.color}`}
            >
              <ClockIcon className="w-3 h-3" />
              {urgencyBadge.label}
            </span>
          )}
        </div>
        {s.applicationUrl && (
          <a
            href={s.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4F6EF7] hover:text-[#2D3A8C] transition-colors"
          >
            Apply Now
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* AI Warnings */}
      {aiRec && aiRec.warnings && aiRec.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {aiRec.warnings.map((w, i) => (
            <p key={i} className="text-[10px] text-[#F59E0B] font-medium flex items-center gap-1">
              <span>⚠️</span> {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
