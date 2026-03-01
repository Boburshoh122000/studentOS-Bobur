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
} from '@heroicons/react/24/solid';
import {
  BookmarkIcon as BookmarkOutlineIcon,
  FireIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

/* ─── Types ────────────────────────────────────────────────────────────────── */

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

interface UserProfile {
  major: string;
  studyLevel: string;
  countries: string[];
  gpa: number;
  langTest: string;
  langScore: number;
  fundingTypes: string[];
}

interface ScoredScholarship extends Scholarship {
  matchScore: number;
  matchType: 'exact' | 'partial';
}

/* ─── Constants ────────────────────────────────────────────────────────────── */

const MAJORS = [
  'All Fields',
  'Computer Science',
  'Engineering',
  'Business & Management',
  'Medicine & Health',
  'Law',
  'Arts & Humanities',
  'Social Sciences',
  'Natural Sciences',
  'Education',
  'Architecture',
  'Agriculture',
  'Media & Journalism',
];

const COUNTRIES = [
  'USA',
  'UK',
  'United Kingdom',
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
  'Malaysia',
  'New Zealand',
];

const STUDY_LEVELS = ['UNDERGRADUATE', 'POSTGRADUATE', 'PHD', 'ANY'];

const FUNDING_TYPES = ['Fully Funded', 'Partial', 'Government', 'University'];

const LANG_TESTS = ['None', 'IELTS', 'TOEFL', 'Duolingo'];

/* ─── Match Score Calculator ───────────────────────────────────────────────── */

function calculateMatchScore(profile: UserProfile, s: Scholarship): number {
  let score = 0;

  // Country match (30 pts)
  if (profile.countries.length === 0) {
    score += 15; // no preference = partial credit
  } else if (profile.countries.some((c) => s.country.toLowerCase().includes(c.toLowerCase()))) {
    score += 30;
  }

  // Study level match (25 pts)
  if (!profile.studyLevel || profile.studyLevel === 'ANY') {
    score += 12;
  } else {
    const sLevel = s.studyLevel?.toUpperCase() || '';
    const pLevel = profile.studyLevel.toUpperCase();
    if (
      sLevel === pLevel ||
      sLevel === 'ANY' ||
      sLevel.includes(pLevel) ||
      pLevel.includes(sLevel.replace('POSTGRADUATE', 'MASTER'))
    ) {
      score += 25;
    } else if (
      (pLevel === 'POSTGRADUATE' && sLevel.includes('MASTER')) ||
      (pLevel === 'PHD' && sLevel.includes('DOCTOR'))
    ) {
      score += 25;
    }
  }

  // Funding type match (20 pts)
  if (profile.fundingTypes.length === 0) {
    score += 10;
  } else {
    const awardLower =
      (s.awardType || '').toLowerCase() + ' ' + (s.awardAmount || '').toLowerCase();
    if (
      profile.fundingTypes.some(
        (f) =>
          awardLower.includes(f.toLowerCase()) ||
          (f === 'Fully Funded' && (awardLower.includes('full') || awardLower.includes('tuition')))
      )
    ) {
      score += 20;
    }
  }

  // Deadline still open (10 pts)
  if (s.deadline) {
    const dl = new Date(s.deadline);
    if (dl > new Date()) score += 10;
  } else {
    score += 5; // no deadline = probably rolling
  }

  // GPA bonus (10 pts) — generous since we can't verify requirements
  if (profile.gpa >= 3.5) score += 10;
  else if (profile.gpa >= 3.0) score += 7;
  else if (profile.gpa >= 2.5) score += 4;
  else if (profile.gpa > 0) score += 2;

  // Language bonus (5 pts)
  if (profile.langTest !== 'None' && profile.langScore > 0) {
    if (profile.langTest === 'IELTS' && profile.langScore >= 6.5) score += 5;
    else if (profile.langTest === 'TOEFL' && profile.langScore >= 80) score += 5;
    else if (profile.langTest === 'Duolingo' && profile.langScore >= 105) score += 5;
    else score += 2;
  }

  return Math.min(100, score);
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Rolling';
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function daysUntil(dateString?: string | null): number | null {
  if (!dateString) return null;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getScoreBadge(score: number) {
  if (score >= 80)
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      label: 'Excellent Match',
    };
  if (score >= 60)
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/40',
      label: 'Good Match',
    };
  return {
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    label: 'Potential Match',
  };
}

/* ─── Collapsible Section ──────────────────────────────────────────────────── */

function FilterSection({
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
    <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* ─── Component ────────────────────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  /* ── Data ── */
  const [isLoading, setIsLoading] = useState(true);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  /* ── Profile / Filters ── */
  const [profile, setProfile] = useState<UserProfile>({
    major: 'All Fields',
    studyLevel: '',
    countries: [],
    gpa: 0,
    langTest: 'None',
    langScore: 0,
    fundingTypes: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  /* ── Saved state ── */
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  /* ── Fetch all scholarships on mount ── */
  const fetchScholarships = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await scholarshipApi.list({ limit: 50 } as any);
      const list = (res.data as any)?.scholarships || (Array.isArray(res.data) ? res.data : []);
      setAllScholarships(list);

      // Track saved
      const ids = new Set<string>();
      list.forEach((s: any) => {
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

  /* ── Profile helpers ── */
  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCountry = (country: string) => {
    setProfile((prev) => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter((c) => c !== country)
        : [...prev.countries, country],
    }));
  };

  const toggleFunding = (type: string) => {
    setProfile((prev) => ({
      ...prev,
      fundingTypes: prev.fundingTypes.includes(type)
        ? prev.fundingTypes.filter((t) => t !== type)
        : [...prev.fundingTypes, type],
    }));
  };

  const isAnyFilterActive =
    profile.studyLevel !== '' ||
    profile.countries.length > 0 ||
    profile.fundingTypes.length > 0 ||
    profile.major !== 'All Fields' ||
    profile.gpa > 0 ||
    profile.langTest !== 'None';

  const handleFindMatch = () => {
    setFiltersApplied(true);
  };

  const handleResetFilters = () => {
    setProfile({
      major: 'All Fields',
      studyLevel: '',
      countries: [],
      gpa: 0,
      langTest: 'None',
      langScore: 0,
      fundingTypes: [],
    });
    setSearchQuery('');
    setFiltersApplied(false);
  };

  /* ── Scoring & Filtering ── */
  const scoredScholarships: ScoredScholarship[] = useMemo(() => {
    let list = allScholarships;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q)
      );
    }

    return list
      .map((s) => ({
        ...s,
        matchScore: filtersApplied ? calculateMatchScore(profile, s) : 0,
        matchType: 'exact' as const,
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allScholarships, profile, filtersApplied, searchQuery]);

  // Determine exact vs partial
  const exactMatches = scoredScholarships.filter((s) => s.matchScore >= 50);
  const hasExactMatches = filtersApplied && exactMatches.length > 0;
  const hasNoExactButPartial =
    filtersApplied && exactMatches.length === 0 && scoredScholarships.length > 0;

  // Sorted display list
  const displayScholarships = filtersApplied
    ? hasExactMatches
      ? exactMatches
      : scoredScholarships.slice(0, 12)
    : [];

  /* ── Initial state sections (State C) ── */
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
          const days = daysUntil(s.deadline);
          return days !== null && days > 0 && days <= 90;
        })
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 6),
    [allScholarships]
  );

  const governmentScholarships = useMemo(
    () =>
      allScholarships
        .filter((s) => {
          const text = (s.awardType + ' ' + s.institution + ' ' + s.title).toLowerCase();
          return (
            text.includes('government') ||
            text.includes('fulbright') ||
            text.includes('chevening') ||
            text.includes('mext') ||
            text.includes('daad') ||
            text.includes('erasmus') ||
            text.includes('korea scholarship') ||
            text.includes('confederation')
          );
        })
        .slice(0, 6),
    [allScholarships]
  );

  /* ─── Header ─────────────────────────────────────────────────────────────── */

  const headerContent = (
    <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
          <TrophyIcon className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white">Scholarship Finder</span>
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
          AI Powered
        </span>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <DashboardLayout
      currentScreen={Screen.SCHOLARSHIPS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 flex overflow-hidden bg-slate-50/80 dark:bg-[#0f111a] h-full">
        {/* ═══════════ LEFT SIDEBAR — AI PROFILE BUILDER ═══════════ */}
        <aside className="w-[310px] flex-shrink-0 hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-card-dark/60 backdrop-blur-xl overflow-y-auto">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-blue-500" />
                AI Profile Builder
              </h3>
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tell us about yourself for better matches.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-0">
            {/* ── Field of Study ── */}
            <FilterSection
              title="Field of Study"
              icon={<AcademicCapIcon className="w-4 h-4 text-indigo-500" />}
            >
              <select
                value={profile.major}
                onChange={(e) => updateProfile('major', e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200"
              >
                {MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </FilterSection>

            {/* ── Study Level ── */}
            <FilterSection
              title="Study Level"
              icon={<StarIcon className="w-4 h-4 text-amber-500" />}
            >
              <div className="flex flex-wrap gap-2">
                {STUDY_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      updateProfile('studyLevel', profile.studyLevel === level ? '' : level)
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
                      profile.studyLevel === level
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {level === 'ANY'
                      ? 'All Levels'
                      : level === 'POSTGRADUATE'
                        ? "Master's"
                        : level.charAt(0) + level.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* ── Target Country ── */}
            <FilterSection
              title="Target Country"
              icon={<GlobeAltIcon className="w-4 h-4 text-emerald-500" />}
            >
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {COUNTRIES.map((country) => (
                  <label key={country} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={profile.countries.includes(country)}
                      onChange={() => toggleCountry(country)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* ── GPA Score ── */}
            <FilterSection
              title="GPA Score"
              icon={<TrophyIcon className="w-4 h-4 text-yellow-500" />}
              defaultOpen={false}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Your GPA</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {profile.gpa > 0 ? profile.gpa.toFixed(1) : 'Not set'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={profile.gpa}
                  onChange={(e) => updateProfile('gpa', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0.0</span>
                  <span>2.0</span>
                  <span>4.0</span>
                </div>
              </div>
            </FilterSection>

            {/* ── Language ── */}
            <FilterSection
              title="Language Requirements"
              icon={<GlobeAltIcon className="w-4 h-4 text-sky-500" />}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <select
                  value={profile.langTest}
                  onChange={(e) => updateProfile('langTest', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-800 dark:text-gray-200"
                >
                  {LANG_TESTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {profile.langTest !== 'None' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Score</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                        {profile.langScore > 0 ? profile.langScore : 'Not set'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={profile.langTest === 'IELTS' ? 0 : 0}
                      max={
                        profile.langTest === 'IELTS' ? 9 : profile.langTest === 'TOEFL' ? 120 : 160
                      }
                      step={profile.langTest === 'IELTS' ? 0.5 : 5}
                      value={profile.langScore}
                      onChange={(e) => updateProfile('langScore', parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                )}
              </div>
            </FilterSection>

            {/* ── Funding Type ── */}
            <FilterSection
              title="Funding Type"
              icon={<CurrencyDollarIcon className="w-4 h-4 text-green-500" />}
            >
              <div className="flex flex-wrap gap-2">
                {FUNDING_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleFunding(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      profile.fundingTypes.includes(type)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </FilterSection>
          </div>

          {/* ── Find My Match Button ── */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleFindMatch}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <SparklesIcon className="w-5 h-5" />
              Find My Match
            </button>
          </div>
        </aside>

        {/* ═══════════ RIGHT PANEL — RESULTS ═══════════ */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1300px] mx-auto p-6 md:p-8">
            {/* ── Search Bar ── */}
            <div className="mb-6">
              <div className="flex shadow-sm rounded-xl overflow-hidden max-w-2xl">
                <div className="relative flex-1 bg-white dark:bg-card-dark border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl">
                  <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    className="w-full h-11 pl-11 pr-4 text-sm border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Search scholarships by name, university, or country..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-gray-100 dark:bg-gray-800 px-3 border-y border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── Loading ── */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1">
                        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1.5" />
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-3" />
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full w-28 mb-4" />
                    <div className="h-8 bg-gray-50 dark:bg-gray-800/50 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filtersApplied || searchQuery ? (
              /* ═══ STATE A & B: Filtered Results ═══ */
              <>
                {/* Results count + partial match banner */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Showing{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {displayScholarships.length || scoredScholarships.length}
                      </span>{' '}
                      {filtersApplied ? 'matched scholarships' : 'results'}
                    </p>
                    {filtersApplied && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                        Clear filters
                      </button>
                    )}
                  </div>

                  {hasNoExactButPartial && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 flex items-start gap-3 mb-4">
                      <SparklesIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                          No exact matches found
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          We couldn&apos;t find exact matches for your criteria, but here are some
                          great alternatives close to your profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {(filtersApplied ? displayScholarships : scoredScholarships).map((s) => (
                    <ScholarshipCard
                      key={s.id}
                      scholarship={s}
                      showScore={filtersApplied}
                      isSaved={savedIds.has(s.id)}
                      onToggleSave={() => toggleSave(s.id)}
                    />
                  ))}
                </div>

                {scoredScholarships.length === 0 && (
                  <div className="text-center py-16">
                    <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No scholarships match your search.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ═══ STATE C: Initial / Zero Filters ═══ */
              <div className="space-y-10">
                {/* ── Featured Banner ── */}
                {featuredScholarships.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <SparklesIcon className="w-5 h-5 text-blue-500" />
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        Featured Scholarships
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuredScholarships.map((s) => (
                        <div
                          key={s.id}
                          className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
                          onClick={() =>
                            s.applicationUrl && window.open(s.applicationUrl, '_blank')
                          }
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                          <div className="relative z-10">
                            <p className="text-blue-200 text-xs font-semibold mb-1 uppercase tracking-wider">
                              {s.institution}
                            </p>
                            <h3 className="text-lg font-bold mb-2 leading-tight">{s.title}</h3>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium">
                                <MapPinIcon className="w-3.5 h-3.5" />
                                {s.country}
                              </span>
                              {s.awardAmount && (
                                <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  <CurrencyDollarIcon className="w-3.5 h-3.5" />
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

                {/* ── Upcoming Deadlines ── */}
                {upcomingDeadlines.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <FireIcon className="w-5 h-5 text-orange-500" />
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        Upcoming Deadlines
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {upcomingDeadlines.map((s) => (
                        <ScholarshipCard
                          key={s.id}
                          scholarship={{ ...s, matchScore: 0, matchType: 'exact' }}
                          showScore={false}
                          isSaved={savedIds.has(s.id)}
                          onToggleSave={() => toggleSave(s.id)}
                          showUrgency
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Government / Top Scholarships ── */}
                {governmentScholarships.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <TrophyIcon className="w-5 h-5 text-yellow-500" />
                      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                        Top Government Scholarships
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {governmentScholarships.map((s) => (
                        <ScholarshipCard
                          key={s.id}
                          scholarship={{ ...s, matchScore: 0, matchType: 'exact' }}
                          showScore={false}
                          isSaved={savedIds.has(s.id)}
                          onToggleSave={() => toggleSave(s.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* ── All Scholarships fallback ── */}
                {featuredScholarships.length === 0 &&
                  upcomingDeadlines.length === 0 &&
                  governmentScholarships.length === 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <AcademicCapIcon className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                          All Scholarships
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {allScholarships.slice(0, 12).map((s) => (
                          <ScholarshipCard
                            key={s.id}
                            scholarship={{ ...s, matchScore: 0, matchType: 'exact' }}
                            showScore={false}
                            isSaved={savedIds.has(s.id)}
                            onToggleSave={() => toggleSave(s.id)}
                          />
                        ))}
                      </div>
                    </section>
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
/* ─── ScholarshipCard Component ────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ScholarshipCard({
  scholarship: s,
  showScore,
  isSaved,
  onToggleSave,
  showUrgency = false,
}: {
  scholarship: ScoredScholarship;
  showScore: boolean;
  isSaved: boolean;
  onToggleSave: () => void;
  showUrgency?: boolean;
}) {
  const days = daysUntil(s.deadline);
  const badge = getScoreBadge(s.matchScore);
  const isUrgent = days !== null && days > 0 && days <= 15;

  return (
    <div className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative">
      {/* Save button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSave();
        }}
        className="absolute top-4 right-4 z-10 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        {isSaved ? (
          <BookmarkIcon className="w-5 h-5 text-blue-500" />
        ) : (
          <BookmarkOutlineIcon className="w-5 h-5" />
        )}
      </button>

      {/* Institution */}
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800/30">
          <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h4
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate"
            title={s.institution}
          >
            {s.institution}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPinIcon className="w-3 h-3" />
            <span>{s.country}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-base font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2"
        title={s.title}
      >
        {s.title}
      </h3>

      {/* Match Score Badge */}
      {showScore && s.matchScore > 0 && (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 border self-start ${badge.bg} ${badge.text} ${badge.border}`}
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          {s.matchScore}% — {badge.label}
        </div>
      )}

      {/* Award Amount */}
      {s.awardAmount && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
            <CurrencyDollarIcon className="w-3.5 h-3.5" />
            {s.awardAmount}
          </span>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize">
          {s.studyLevel?.toLowerCase().replace('_', ' ')}
        </span>
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-md">
          {s.awardType}
        </span>
      </div>

      {/* Footer — Deadline */}
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{formatDate(s.deadline)}</span>
        </div>
        {(showUrgency || isUrgent) && days !== null && days > 0 && (
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              days <= 7
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : days <= 30
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            }`}
          >
            <ClockIcon className="w-3 h-3" />
            {days}d left
          </span>
        )}
      </div>
    </div>
  );
}
