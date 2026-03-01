import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';
import {
  AcademicCapIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  GlobeAltIcon,
  TrophyIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  BuildingLibraryIcon,
  Bars3Icon,
  BookmarkIcon,
} from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon, FireIcon } from '@heroicons/react/24/outline';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                    */
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
  isTrending?: boolean;
  isSaved?: boolean;
}

interface Filters {
  countries: string[];
  studyLevel: string;
  fields: string[];
  scholarshipTypes: string[];
}

type SortOption = 'relevance' | 'deadline' | 'amount' | 'recent';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Constants                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

const ALL_COUNTRIES = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Belarus',
  'Belgium',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Ecuador',
  'Egypt',
  'Estonia',
  'Ethiopia',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Guatemala',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Latvia',
  'Lebanon',
  'Libya',
  'Lithuania',
  'Luxembourg',
  'Malaysia',
  'Maldives',
  'Malta',
  'Mexico',
  'Moldova',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Myanmar',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Palestine',
  'Panama',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'Serbia',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tanzania',
  'Thailand',
  'Tunisia',
  'Turkey',
  'UAE',
  'Uganda',
  'Ukraine',
  'United Kingdom',
  'USA',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Zimbabwe',
];

const STUDY_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'UNDERGRADUATE', label: "Bachelor's" },
  { value: 'POSTGRADUATE', label: "Master's" },
  { value: 'PHD', label: 'PhD' },
  { value: 'POSTDOCTORAL', label: 'Postdoctoral' },
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

const SCHOLARSHIP_TYPES = ['Government', 'University', 'Private/Foundation', 'Research Grant'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'amount', label: 'Amount' },
  { value: 'recent', label: 'Recent' },
];

const DEFAULT_FILTERS: Filters = {
  countries: [],
  studyLevel: '',
  fields: [],
  scholarshipTypes: [],
};

const FLAG: Record<string, string> = {
  USA: '🇺🇸',
  'United Kingdom': '🇬🇧',
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
  Spain: '🇪🇸',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Russia: '🇷🇺',
  Mexico: '🇲🇽',
  Singapore: '🇸🇬',
  'Saudi Arabia': '🇸🇦',
  UAE: '🇦🇪',
  Uzbekistan: '🇺🇿',
  Egypt: '🇪🇬',
  Poland: '🇵🇱',
  Austria: '🇦🇹',
  Belgium: '🇧🇪',
  Denmark: '🇩🇰',
  Finland: '🇫🇮',
  Greece: '🇬🇷',
  Ireland: '🇮🇪',
  Portugal: '🇵🇹',
  Romania: '🇷🇴',
  Thailand: '🇹🇭',
  Vietnam: '🇻🇳',
  Philippines: '🇵🇭',
  Indonesia: '🇮🇩',
  Pakistan: '🇵🇰',
  Bangladesh: '🇧🇩',
  Nigeria: '🇳🇬',
  Kenya: '🇰🇪',
  'South Africa': '🇿🇦',
  Argentina: '🇦🇷',
  Colombia: '🇨🇴',
  Chile: '🇨🇱',
  Peru: '🇵🇪',
  Ukraine: '🇺🇦',
  'Czech Republic': '🇨🇿',
  Israel: '🇮🇱',
  Qatar: '🇶🇦',
  Kuwait: '🇰🇼',
  Bahrain: '🇧🇭',
  Oman: '🇴🇲',
  Jordan: '🇯🇴',
  Lebanon: '🇱🇧',
  Morocco: '🇲🇦',
  Tunisia: '🇹🇳',
  Ghana: '🇬🇭',
  Ethiopia: '🇪🇹',
  Tanzania: '🇹🇿',
  Uganda: '🇺🇬',
  Cambodia: '🇰🇭',
  Myanmar: '🇲🇲',
  Nepal: '🇳🇵',
  'Sri Lanka': '🇱🇰',
  Kazakhstan: '🇰🇿',
  Mongolia: '🇲🇳',
  Iran: '🇮🇷',
  Iraq: '🇮🇶',
  Cuba: '🇨🇺',
  Iceland: '🇮🇸',
  Luxembourg: '🇱🇺',
  Malta: '🇲🇹',
  Croatia: '🇭🇷',
  Serbia: '🇷🇸',
  Bulgaria: '🇧🇬',
  Slovakia: '🇸🇰',
  Slovenia: '🇸🇮',
  Lithuania: '🇱🇹',
  Latvia: '🇱🇻',
  Estonia: '🇪🇪',
  Georgia: '🇬🇪',
  Armenia: '🇦🇲',
  Azerbaijan: '🇦🇿',
  Belarus: '🇧🇾',
  Moldova: '🇲🇩',
  Albania: '🇦🇱',
  'North Macedonia': '🇲🇰',
  Montenegro: '🇲🇪',
  'Bosnia and Herzegovina': '🇧🇦',
  Taiwan: '🇹🇼',
  Maldives: '🇲🇻',
  Brunei: '🇧🇳',
  Syria: '🇸🇾',
  Libya: '🇱🇾',
  Palestine: '🇵🇸',
  Panama: '🇵🇦',
  'Costa Rica': '🇨🇷',
  Bolivia: '🇧🇴',
  Ecuador: '🇪🇨',
  Guatemala: '🇬🇹',
  Jamaica: '🇯🇲',
  Venezuela: '🇻🇪',
  Zimbabwe: '🇿🇼',
  Cameroon: '🇨🇲',
  Algeria: '🇩🇿',
  Afghanistan: '🇦🇫',
  Andorra: '🇦🇩',
  Angola: '🇦🇴',
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

const getFlag = (c: string) => FLAG[c] || '🌍';
const titleCase = (s: string) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return 'Open';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseAmount(a: string | null): number {
  if (!a) return 0;
  const m = a.replace(/,/g, '').match(/[\d]+/);
  return m ? parseInt(m[0]) : 0;
}

function isExpired(d: string | null): boolean {
  return d ? new Date(d).getTime() < Date.now() : false;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Filter Section (text-driven, collapsed by default)                       */
/* ═══════════════════════════════════════════════════════════════════════════ */

function FilterSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-3 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group"
        type="button"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {icon}
          {title}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Searchable Country Select                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

function CountrySelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (c: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const list = useMemo(
    () =>
      q.trim()
        ? ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(q.toLowerCase()))
        : ALL_COUNTRIES,
    [q]
  );

  const toggle = (c: string) =>
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
      >
        <span className="truncate">
          {selected.length === 0 ? 'Any country' : `${selected.length} selected`}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 text-[10px] font-medium rounded-lg"
            >
              {getFlag(c)} {c}
              <button
                onClick={() => toggle(c)}
                className="hover:text-red-500 ml-0.5"
                title={`Remove ${c}`}
                type="button"
              >
                <XMarkIcon className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-lg shadow-black/[0.06] overflow-hidden">
          <div className="p-2.5">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              autoFocus
              aria-label="Search countries"
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.04] border-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto px-1.5 pb-1.5">
            {list.length === 0 && (
              <p className="text-[11px] text-gray-400 py-4 text-center">No results</p>
            )}
            {list.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2.5 py-1.5 px-2.5 cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c)}
                  onChange={() => toggle(c)}
                  className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-gray-300 w-3.5 h-3.5"
                />
                <span className="text-[12px] text-gray-600 dark:text-gray-400">
                  {getFlag(c)} {c}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Main Component                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [all, setAll] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [applied, setApplied] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showSort, setShowSort] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  /* ── Fetch ── */
  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await scholarshipApi.list({ page: 1 });
      const d = res.data as Record<string, unknown>;
      const list = (d?.scholarships || (Array.isArray(res.data) ? res.data : [])) as Scholarship[];
      setAll(list);
      const ids = new Set<string>();
      list.forEach((s) => {
        if (s.isSaved) ids.add(s.id);
      });
      setSaved(ids);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Save ── */
  const toggleSave = async (id: string) => {
    const was = saved.has(id);
    const next = new Set(saved);
    if (was) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSaved(next);
    try {
      if (was) {
        await scholarshipApi.unsave(id);
      } else {
        await scholarshipApi.save(id);
      }
    } catch {
      if (was) {
        next.add(id);
      } else {
        next.delete(id);
      }
      setSaved(new Set(next));
    }
  };

  /* ── Filter helpers ── */
  const toggleArr = (key: 'fields' | 'scholarshipTypes', val: string) => {
    setFilters((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((v) => v !== val) : [...p[key], val],
    }));
  };

  const hasFilters =
    filters.countries.length > 0 ||
    filters.studyLevel !== '' ||
    filters.fields.length > 0 ||
    filters.scholarshipTypes.length > 0;
  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearch('');
    setApplied(false);
    setSortBy('relevance');
  };
  const applyFilters = () => {
    setApplied(true);
    setMobileFilters(false);
  };

  /* ── Active items ── */
  const active = useMemo(() => all.filter((s) => !isExpired(s.deadline)), [all]);

  /* ── Display ── */
  const display = useMemo(() => {
    let list = [...active];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }
    if (applied) {
      if (filters.studyLevel)
        list = list.filter((s) => s.studyLevel === filters.studyLevel || s.studyLevel === 'ANY');
      if (filters.countries.length > 0)
        list = list.filter((s) =>
          filters.countries.some((c) => s.country.toLowerCase() === c.toLowerCase())
        );
    }
    switch (sortBy) {
      case 'deadline':
        list.sort(
          (a, b) =>
            (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
            (b.deadline ? new Date(b.deadline).getTime() : Infinity)
        );
        break;
      case 'amount':
        list.sort((a, b) => parseAmount(b.awardAmount) - parseAmount(a.awardAmount));
        break;
      case 'recent':
        list.reverse();
        break;
      default:
        break;
    }
    return list;
  }, [active, search, filters, applied, sortBy]);

  const trending = useMemo(() => active.filter((s) => s.isTrending), [active]);
  const upcoming = useMemo(
    () =>
      active
        .filter((s) => {
          const d = daysUntil(s.deadline);
          return d !== null && d > 0 && d <= 90;
        })
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
        .slice(0, 6),
    [active]
  );

  /* ── Shared filter UI ── */
  const filterUI = (
    <>
      <FilterSection title="Country" icon={<GlobeAltIcon className="w-4 h-4 text-gray-400" />}>
        <CountrySelect
          selected={filters.countries}
          onChange={(c) => setFilters((p) => ({ ...p, countries: c }))}
        />
      </FilterSection>

      <FilterSection
        title="Study Level"
        icon={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
      >
        <select
          value={filters.studyLevel}
          onChange={(e) => setFilters((p) => ({ ...p, studyLevel: e.target.value }))}
          aria-label="Study Level"
          className="w-full rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.03] px-3 py-2 text-[13px] text-gray-600 dark:text-gray-400 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
        >
          {STUDY_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection
        title="Field of Study"
        icon={<BookmarkIcon className="w-4 h-4 text-gray-400" />}
      >
        <div className="max-h-40 overflow-y-auto space-y-0.5">
          {FIELDS.map((f) => (
            <label key={f} className="flex items-center gap-2.5 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fields.includes(f)}
                onChange={() => toggleArr('fields', f)}
                className="rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-300 w-3.5 h-3.5"
              />
              <span className="text-[12px] text-gray-500 dark:text-gray-400">{f}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Scholarship Type"
        icon={<BuildingLibraryIcon className="w-4 h-4 text-gray-400" />}
      >
        <div className="space-y-0.5">
          {SCHOLARSHIP_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.scholarshipTypes.includes(t)}
                onChange={() => toggleArr('scholarshipTypes', t)}
                className="rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-300 w-3.5 h-3.5"
              />
              <span className="text-[12px] text-gray-500 dark:text-gray-400">{t}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  /* ── Header ── */
  const headerContent = (
    <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100/80 dark:border-gray-800/50">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileFilters(!mobileFilters)}
          className="lg:hidden p-1.5 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Toggle filters"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div className="size-8 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
          <TrophyIcon className="w-4 h-4 text-white dark:text-gray-900" />
        </div>
        <span className="font-semibold text-[15px] text-gray-900 dark:text-white tracking-tight">
          Scholarship Finder
        </span>
      </div>
      <div className="flex items-center gap-3">
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
      <div className="flex-1 flex overflow-hidden bg-[#FAFAFA] dark:bg-[#0c0e18] h-full relative">
        {/* ═══ Mobile filter overlay ═══ */}
        {mobileFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileFilters(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#141722] shadow-2xl flex flex-col z-50">
              <div className="p-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Filters</span>
                <button
                  onClick={() => setMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 divide-y divide-gray-100/80 dark:divide-gray-800/50">
                {filterUI}
              </div>
              <div className="p-6 flex gap-2">
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 border border-gray-100 dark:border-gray-800"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2.5 rounded-xl text-[13px] transition-all hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ═══ Desktop sidebar ═══ */}
        <aside className="w-[260px] flex-shrink-0 hidden lg:flex flex-col overflow-hidden">
          <div className="pt-8 pb-4 px-8">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FunnelIcon className="w-3.5 h-3.5 text-gray-400" /> Filters
              </span>
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 divide-y divide-gray-100/80 dark:divide-gray-800/50">
            {filterUI}
          </div>
          <div className="p-6 px-8">
            <button
              onClick={applyFilters}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-2.5 rounded-xl text-[13px] transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Apply Filters
            </button>
          </div>
        </aside>

        {/* ═══ Main Content ═══ */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-500 bg-white dark:bg-[#141722] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-200 transition-colors"
              >
                <FunnelIcon className="w-3.5 h-3.5" /> Filters
                {hasFilters && (
                  <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {filters.countries.length +
                      (filters.studyLevel ? 1 : 0) +
                      filters.fields.length +
                      filters.scholarshipTypes.length}
                  </span>
                )}
              </button>

              <div className="relative flex-1 max-w-lg w-full">
                <input
                  className="w-full h-10 pl-4 pr-9 text-[13px] border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-[#141722] text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none transition-all"
                  placeholder="Search by name, university, country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    title="Clear"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-500 bg-white dark:bg-[#141722] border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                >
                  <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-[#141722] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg shadow-black/[0.06] z-20 min-w-[160px] py-1">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => {
                          setSortBy(o.value);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${sortBy === o.value ? 'text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-white/[0.04]' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/[0.04]'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#141722] rounded-3xl p-8 animate-pulse border border-gray-100/50 dark:border-gray-800/30"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="size-5 rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                    </div>
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-4/5 mb-3" />
                    <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-2/3 mb-6" />
                    <div className="h-9 bg-gray-50 dark:bg-gray-800/50 rounded-xl w-28" />
                  </div>
                ))}
              </div>
            ) : applied || search ? (
              /* ═══ Filtered results ═══ */
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-[13px] text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {display.length}
                    </span>{' '}
                    scholarships
                  </p>
                  {applied && (
                    <button
                      onClick={resetFilters}
                      className="text-[12px] text-gray-400 hover:text-gray-600 font-medium flex items-center gap-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                {display.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <TrophyIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">
                      No matches
                    </p>
                    <p className="text-[13px] text-gray-400 mb-5">Try adjusting your filters.</p>
                    <button
                      onClick={resetFilters}
                      className="text-[13px] text-gray-900 dark:text-white font-medium hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {display.map((s) => (
                      <BentoCard
                        key={s.id}
                        s={s}
                        isSaved={saved.has(s.id)}
                        onSave={() => toggleSave(s.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* ═══ Initial state ═══ */
              <div className="space-y-10">
                {/* Trending */}
                {trending.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={<FireIcon className="w-4 h-4 text-orange-400" />}
                      title="Trending Scholarships"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {trending.map((s) => (
                        <BentoCard
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={<ClockIcon className="w-4 h-4 text-red-400" />}
                      title="Upcoming Deadlines"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {upcoming.map((s) => (
                        <BentoCard
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                          showDeadline
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* All */}
                {active.length > 0 && (
                  <section>
                    <SectionHeader
                      icon={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
                      title="All Scholarships"
                      count={active.length}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {active.slice(0, 12).map((s) => (
                        <BentoCard
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {active.length === 0 && !isLoading && (
                  <div className="text-center py-20">
                    <div className="size-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <TrophyIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">
                      No scholarships yet
                    </p>
                    <p className="text-[13px] text-gray-400">
                      They'll appear once added by an admin.
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
/*  Section Header                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {icon}
      <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {count !== undefined && (
        <span className="text-[11px] text-gray-400 font-medium ml-1">({count})</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Bento Card                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

function BentoCard({
  s,
  isSaved,
  onSave,
  showDeadline = false,
}: {
  s: Scholarship;
  isSaved: boolean;
  onSave: () => void;
  showDeadline?: boolean;
}) {
  const days = daysUntil(s.deadline);

  return (
    <div className="relative bg-white dark:bg-[#141722] rounded-3xl p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 group border border-gray-100/50 dark:border-gray-800/30 flex flex-col">
      {/* Top row: flag + trending + bookmark */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{getFlag(s.country)}</span>
          <span className="text-[11px] text-gray-400 font-medium">{s.country}</span>
        </div>
        <div className="flex items-center gap-2">
          {s.isTrending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50/80 dark:bg-orange-500/10 text-orange-500 border border-orange-100 dark:border-orange-500/20 rounded-full text-[10px] font-bold tracking-wide">
              <FireIcon className="w-3 h-3" /> Trending
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="text-gray-200 dark:text-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            {isSaved ? (
              <BookmarkIcon className="w-4 h-4 text-gray-900 dark:text-white" />
            ) : (
              <BookmarkOutlineIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Title + Institution */}
      <h3 className="text-[16px] font-bold text-[#111827] dark:text-white mb-1.5 leading-snug line-clamp-2 tracking-tight">
        {s.title}
      </h3>
      <p className="text-[13px] text-[#6b7280] dark:text-gray-500 mb-4">
        {titleCase(s.institution)}
      </p>

      {/* Description */}
      <p className="text-[12px] text-gray-400 leading-relaxed mb-5 line-clamp-2 min-h-[2.5em]">
        {s.description && s.description.length > 3 ? s.description : 'No description available.'}
      </p>

      {/* Award + Deadline */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {s.awardAmount && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-100/80 dark:border-emerald-500/20">
            {s.awardAmount}
          </span>
        )}
        {(showDeadline || (days !== null && days > 0 && days <= 30)) && s.deadline && (
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
              days !== null && days <= 7
                ? 'text-red-500 bg-red-50/80 dark:bg-red-500/10 border-red-100/80 dark:border-red-500/20'
                : days !== null && days <= 30
                  ? 'text-amber-500 bg-amber-50/80 dark:bg-amber-500/10 border-amber-100/80 dark:border-amber-500/20'
                  : 'text-gray-500 bg-gray-50 dark:bg-white/[0.04] border-gray-100 dark:border-gray-800'
            }`}
          >
            <CalendarIcon className="w-3 h-3 inline mr-1 -mt-0.5" />
            {fmtDate(s.deadline)}
            {days !== null && days > 0 && days <= 30 && (
              <span className="ml-1 opacity-70">· {days}d</span>
            )}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span className="text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 rounded-md capitalize">
            {s.studyLevel?.toLowerCase().replace('_', ' ')}
          </span>
        </div>
        {s.applicationUrl ? (
          <a
            href={s.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 hover:border-transparent transition-all duration-300"
          >
            View Details <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-gray-300 dark:text-gray-700">No link</span>
        )}
      </div>
    </div>
  );
}
