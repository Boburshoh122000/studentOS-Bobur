import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';
import {
  AcademicCapIcon,
  CalendarIcon,
  ChevronDownIcon,
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
  eligibility: string | null;
  benefits: string | null;
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
/*  Country → ISO                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

interface CInfo {
  name: string;
  iso: string;
}

const COUNTRIES: CInfo[] = [
  { name: 'Afghanistan', iso: 'af' },
  { name: 'Albania', iso: 'al' },
  { name: 'Algeria', iso: 'dz' },
  { name: 'Andorra', iso: 'ad' },
  { name: 'Angola', iso: 'ao' },
  { name: 'Argentina', iso: 'ar' },
  { name: 'Armenia', iso: 'am' },
  { name: 'Australia', iso: 'au' },
  { name: 'Austria', iso: 'at' },
  { name: 'Azerbaijan', iso: 'az' },
  { name: 'Bahrain', iso: 'bh' },
  { name: 'Bangladesh', iso: 'bd' },
  { name: 'Belarus', iso: 'by' },
  { name: 'Belgium', iso: 'be' },
  { name: 'Bolivia', iso: 'bo' },
  { name: 'Bosnia and Herzegovina', iso: 'ba' },
  { name: 'Brazil', iso: 'br' },
  { name: 'Brunei', iso: 'bn' },
  { name: 'Bulgaria', iso: 'bg' },
  { name: 'Cambodia', iso: 'kh' },
  { name: 'Cameroon', iso: 'cm' },
  { name: 'Canada', iso: 'ca' },
  { name: 'Chile', iso: 'cl' },
  { name: 'China', iso: 'cn' },
  { name: 'Colombia', iso: 'co' },
  { name: 'Costa Rica', iso: 'cr' },
  { name: 'Croatia', iso: 'hr' },
  { name: 'Cuba', iso: 'cu' },
  { name: 'Cyprus', iso: 'cy' },
  { name: 'Czech Republic', iso: 'cz' },
  { name: 'Denmark', iso: 'dk' },
  { name: 'Ecuador', iso: 'ec' },
  { name: 'Egypt', iso: 'eg' },
  { name: 'Estonia', iso: 'ee' },
  { name: 'Ethiopia', iso: 'et' },
  { name: 'Finland', iso: 'fi' },
  { name: 'France', iso: 'fr' },
  { name: 'Georgia', iso: 'ge' },
  { name: 'Germany', iso: 'de' },
  { name: 'Ghana', iso: 'gh' },
  { name: 'Greece', iso: 'gr' },
  { name: 'Guatemala', iso: 'gt' },
  { name: 'Hungary', iso: 'hu' },
  { name: 'Iceland', iso: 'is' },
  { name: 'India', iso: 'in' },
  { name: 'Indonesia', iso: 'id' },
  { name: 'Iran', iso: 'ir' },
  { name: 'Iraq', iso: 'iq' },
  { name: 'Ireland', iso: 'ie' },
  { name: 'Israel', iso: 'il' },
  { name: 'Italy', iso: 'it' },
  { name: 'Jamaica', iso: 'jm' },
  { name: 'Japan', iso: 'jp' },
  { name: 'Jordan', iso: 'jo' },
  { name: 'Kazakhstan', iso: 'kz' },
  { name: 'Kenya', iso: 'ke' },
  { name: 'Kuwait', iso: 'kw' },
  { name: 'Latvia', iso: 'lv' },
  { name: 'Lebanon', iso: 'lb' },
  { name: 'Libya', iso: 'ly' },
  { name: 'Lithuania', iso: 'lt' },
  { name: 'Luxembourg', iso: 'lu' },
  { name: 'Malaysia', iso: 'my' },
  { name: 'Maldives', iso: 'mv' },
  { name: 'Malta', iso: 'mt' },
  { name: 'Mexico', iso: 'mx' },
  { name: 'Moldova', iso: 'md' },
  { name: 'Mongolia', iso: 'mn' },
  { name: 'Montenegro', iso: 'me' },
  { name: 'Morocco', iso: 'ma' },
  { name: 'Myanmar', iso: 'mm' },
  { name: 'Nepal', iso: 'np' },
  { name: 'Netherlands', iso: 'nl' },
  { name: 'New Zealand', iso: 'nz' },
  { name: 'Nigeria', iso: 'ng' },
  { name: 'North Macedonia', iso: 'mk' },
  { name: 'Norway', iso: 'no' },
  { name: 'Oman', iso: 'om' },
  { name: 'Pakistan', iso: 'pk' },
  { name: 'Palestine', iso: 'ps' },
  { name: 'Panama', iso: 'pa' },
  { name: 'Peru', iso: 'pe' },
  { name: 'Philippines', iso: 'ph' },
  { name: 'Poland', iso: 'pl' },
  { name: 'Portugal', iso: 'pt' },
  { name: 'Qatar', iso: 'qa' },
  { name: 'Romania', iso: 'ro' },
  { name: 'Russia', iso: 'ru' },
  { name: 'Saudi Arabia', iso: 'sa' },
  { name: 'Serbia', iso: 'rs' },
  { name: 'Singapore', iso: 'sg' },
  { name: 'Slovakia', iso: 'sk' },
  { name: 'Slovenia', iso: 'si' },
  { name: 'South Africa', iso: 'za' },
  { name: 'South Korea', iso: 'kr' },
  { name: 'Spain', iso: 'es' },
  { name: 'Sri Lanka', iso: 'lk' },
  { name: 'Sweden', iso: 'se' },
  { name: 'Switzerland', iso: 'ch' },
  { name: 'Syria', iso: 'sy' },
  { name: 'Taiwan', iso: 'tw' },
  { name: 'Tanzania', iso: 'tz' },
  { name: 'Thailand', iso: 'th' },
  { name: 'Tunisia', iso: 'tn' },
  { name: 'Turkey', iso: 'tr' },
  { name: 'UAE', iso: 'ae' },
  { name: 'Uganda', iso: 'ug' },
  { name: 'Ukraine', iso: 'ua' },
  { name: 'United Kingdom', iso: 'gb' },
  { name: 'USA', iso: 'us' },
  { name: 'Uzbekistan', iso: 'uz' },
  { name: 'Venezuela', iso: 've' },
  { name: 'Vietnam', iso: 'vn' },
  { name: 'Zimbabwe', iso: 'zw' },
];

const ISO_MAP: Record<string, string> = {};
COUNTRIES.forEach((c) => {
  ISO_MAP[c.name.toLowerCase()] = c.iso;
});
ISO_MAP['uk'] = 'gb';
ISO_MAP['united states'] = 'us';
ISO_MAP['korea'] = 'kr';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Constants                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

const STUDY_LEVELS = [
  { value: '', labelKey: 'Scholarship.all_levels' },
  { value: 'UNDERGRADUATE', labelKey: 'Scholarship.undergraduate' },
  { value: 'POSTGRADUATE', labelKey: 'Scholarship.postgraduate' },
  { value: 'PHD', labelKey: 'Scholarship.phd' },
  { value: 'POSTDOCTORAL', labelKey: 'Scholarship.postgraduate' },
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

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: 'relevance', labelKey: 'Scholarship.relevance' },
  { value: 'deadline', labelKey: 'Scholarship.deadline_label' },
  { value: 'amount', labelKey: 'Scholarship.sort_amount' },
  { value: 'recent', labelKey: 'Scholarship.sort_recent' },
];

const DEFAULT_FILTERS: Filters = {
  countries: [],
  studyLevel: '',
  fields: [],
  scholarshipTypes: [],
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CountryFlag                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function CountryFlag({ country, size = 20 }: { country: string; size?: number }) {
  const iso = ISO_MAP[country.toLowerCase()];
  if (!iso) return <GlobeAltIcon className="w-4 h-4 text-gray-400 inline-block" />;
  const h = Math.round(size * 0.75);
  return (
    <img
      src={`https://flagcdn.com/${size <= 20 ? 'w40' : 'w80'}/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      width={size}
      height={h}
      alt={country}
      className="rounded-[2px] inline-block object-cover"
      loading="lazy"
      style={{ minWidth: size, minHeight: h }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

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
/*  FilterSection                                                            */
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
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300">
          {icon}
          {title}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CountrySelect                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

function CountrySelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (c: string[]) => void;
}) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');

  const list = useMemo(
    () =>
      q.trim()
        ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
        : COUNTRIES,
    [q]
  );

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((x) => x !== name) : [...selected, name]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Scholarship.search_countries')}
          aria-label="Search countries"
          className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {selected.map((cn) => (
            <span
              key={cn}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 text-[10px] font-medium rounded"
            >
              <CountryFlag country={cn} size={14} /> {cn}
              <button
                type="button"
                onClick={() => toggle(cn)}
                className="hover:text-red-500 ml-0.5"
                title={`Remove ${cn}`}
              >
                <XMarkIcon className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {list.length === 0 && (
          <p className="text-[11px] text-gray-400 py-4 text-center">
            {t('Scholarship.no_country_results')}
          </p>
        )}
        {list.map((c) => (
          <label
            key={c.name}
            className="flex items-center gap-2.5 py-1.5 px-1.5 cursor-pointer rounded-md hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(c.name)}
              onChange={() => toggle(c.name)}
              className="rounded border-gray-300 dark:border-gray-600 text-gray-900 focus:ring-gray-300 w-3.5 h-3.5"
            />
            <CountryFlag country={c.name} size={16} />
            <span className="text-[12px] text-gray-600 dark:text-gray-400">{c.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Main Component                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [all, setAll] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [applied, setApplied] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showSort, setShowSort] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

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

  const active = useMemo(() => all.filter((s) => !isExpired(s.deadline)), [all]);

  const display = useMemo(() => {
    let list = [...active];
    if (search.trim()) {
      const lq = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(lq) ||
          s.institution.toLowerCase().includes(lq) ||
          s.country.toLowerCase().includes(lq) ||
          (s.description || '').toLowerCase().includes(lq)
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

  /* ── Filter sidebar content (shared desktop + mobile) ── */
  const filterUI = (
    <>
      <FilterSection
        title={t('Scholarship.country')}
        icon={<GlobeAltIcon className="w-4 h-4 text-gray-400" />}
      >
        <CountrySelect
          selected={filters.countries}
          onChange={(c) => setFilters((p) => ({ ...p, countries: c }))}
        />
      </FilterSection>

      <FilterSection
        title={t('Scholarship.study_level')}
        icon={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
      >
        <select
          value={filters.studyLevel}
          onChange={(e) => setFilters((p) => ({ ...p, studyLevel: e.target.value }))}
          aria-label="Study Level"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.03] px-3 py-2 text-[13px] text-gray-600 dark:text-gray-400 outline-none focus:ring-1 focus:ring-gray-300"
        >
          {STUDY_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {t(l.labelKey)}
            </option>
          ))}
        </select>
      </FilterSection>

      <FilterSection
        title={t('Scholarship.field_of_study')}
        icon={<BookmarkIcon className="w-4 h-4 text-gray-400" />}
      >
        <div className="max-h-40 overflow-y-auto space-y-0.5">
          {FIELDS.map((f) => (
            <label key={f} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.fields.includes(f)}
                onChange={() => toggleArr('fields', f)}
                className="rounded border-gray-300 text-gray-800 focus:ring-gray-300 w-3.5 h-3.5"
              />
              <span className="text-[12px] text-gray-500 dark:text-gray-400">{f}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title={t('Scholarship.scholarship_type')}
        icon={<BuildingLibraryIcon className="w-4 h-4 text-gray-400" />}
      >
        <div className="space-y-0.5">
          {SCHOLARSHIP_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.scholarshipTypes.includes(t)}
                onChange={() => toggleArr('scholarshipTypes', t)}
                className="rounded border-gray-300 text-gray-800 focus:ring-gray-300 w-3.5 h-3.5"
              />
              <span className="text-[12px] text-gray-500 dark:text-gray-400">{t}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </>
  );

  const headerContent = (
    <header className="h-14 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-[#0f111a] border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileFilters(!mobileFilters)}
          aria-label="Toggle filters"
          className="lg:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-700"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <div className="size-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
          <TrophyIcon className="w-3.5 h-3.5 text-white dark:text-gray-900" />
        </div>
        <span className="font-semibold text-[15px] text-gray-900 dark:text-white">
          {t('Scholarship.title')}
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
      <div className="flex-1 flex overflow-hidden h-full bg-gray-50 dark:bg-background-dark">
        {/* Mobile filters overlay */}
        {mobileFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileFilters(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#141722] flex flex-col z-50">
              <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('Scholarship.filters')}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileFilters(false)}
                  aria-label="Close filters"
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">{filterUI}</div>
              <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {t('Scholarship.reset')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg text-[13px] transition-colors"
                >
                  {t('Scholarship.apply_button')}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Desktop Filter Sidebar ── */}
        <div className="hidden lg:block flex-shrink-0 w-64 xl:w-72 p-4 pr-0">
          <aside className="flex flex-col h-full bg-white dark:bg-[#141722] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-900 dark:text-white">
                <FunnelIcon className="w-3.5 h-3.5 text-gray-500" />
                {t('Scholarship.filters')}
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-white font-medium transition-colors"
                >
                  {t('Scholarship.reset_all')}
                </button>
              )}
            </div>

            {/* Filter sections */}
            <div className="flex-1 overflow-y-auto px-5">{filterUI}</div>

            {/* Apply button */}
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={applyFilters}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                {t('Scholarship.apply_filters')}
              </button>
            </div>
          </aside>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1080px] mx-auto px-5 sm:px-8 py-7">
            {/* Search + Sort row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-7">
              <button
                type="button"
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-white dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent"
              >
                <FunnelIcon className="w-3.5 h-3.5" /> {t('Scholarship.filters')}
                {hasFilters && (
                  <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {filters.countries.length +
                      (filters.studyLevel ? 1 : 0) +
                      filters.fields.length +
                      filters.scholarshipTypes.length}
                  </span>
                )}
              </button>

              <div className="relative flex-1 max-w-lg w-full">
                <input
                  className="w-full h-9 pl-4 pr-9 text-[13px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141722] text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all"
                  placeholder={t('Scholarship.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-3 h-9 text-[13px] font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#141722] border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                  {t(SORT_OPTIONS.find((o) => o.value === sortBy)?.labelKey ?? '')}
                  <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#141722] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md z-20 min-w-[140px] py-1">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        type="button"
                        key={o.value}
                        onClick={() => {
                          setSortBy(o.value);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                          sortBy === o.value
                            ? 'text-gray-900 dark:text-white font-semibold'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        {t(o.labelKey)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading skeleton */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#141722] rounded-xl p-6 animate-pulse border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-7 h-5 rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
                    </div>
                    <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-4/5 mb-3" />
                    <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-2/3 mb-6" />
                    <div className="h-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-24" />
                  </div>
                ))}
              </div>
            ) : applied || search ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[13px] text-gray-500 dark:text-gray-400">
                    {t('Scholarship.scholarships_found', { count: display.length })}
                  </p>
                  {applied && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[12px] text-gray-400 hover:text-gray-700 dark:hover:text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" /> {t('Scholarship.clear_filters')}
                    </button>
                  )}
                </div>
                {display.length === 0 ? (
                  <div className="text-center py-20">
                    <TrophyIcon className="w-9 h-9 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">
                      {t('Scholarship.no_matches')}
                    </p>
                    <p className="text-[13px] text-gray-400 mb-5">
                      {t('Scholarship.widen_filters')}
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[13px] text-gray-900 dark:text-white font-medium hover:underline"
                    >
                      {t('Scholarship.reset_filters')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {display.map((s) => (
                      <Card
                        key={s.id}
                        s={s}
                        isSaved={saved.has(s.id)}
                        onSave={() => toggleSave(s.id)}
                        onSelect={() => setSelectedScholarship(s)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-9">
                {trending.length > 0 && (
                  <section>
                    <SectionHead
                      icon={<FireIcon className="w-4 h-4 text-orange-400" />}
                      title={t('Scholarship.trending_scholarships')}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trending.map((s) => (
                        <Card
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                          onSelect={() => setSelectedScholarship(s)}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {upcoming.length > 0 && (
                  <section>
                    <SectionHead
                      icon={<ClockIcon className="w-4 h-4 text-red-400" />}
                      title={t('Scholarship.upcoming_deadlines')}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {upcoming.map((s) => (
                        <Card
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                          onSelect={() => setSelectedScholarship(s)}
                          showDeadline
                        />
                      ))}
                    </div>
                  </section>
                )}
                {active.length > 0 && (
                  <section>
                    <SectionHead
                      icon={<AcademicCapIcon className="w-4 h-4 text-gray-400" />}
                      title={t('Scholarship.all_scholarships')}
                      count={active.length}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {active.slice(0, 12).map((s) => (
                        <Card
                          key={s.id}
                          s={s}
                          isSaved={saved.has(s.id)}
                          onSave={() => toggleSave(s.id)}
                          onSelect={() => setSelectedScholarship(s)}
                        />
                      ))}
                    </div>
                  </section>
                )}
                {active.length === 0 && !isLoading && (
                  <div className="text-center py-20">
                    <TrophyIcon className="w-9 h-9 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-white mb-1">
                      {t('Scholarship.no_scholarships_yet')}
                    </p>
                    <p className="text-[13px] text-gray-400">
                      {t('Scholarship.scholarships_coming_soon')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedScholarship && (
        <ScholarshipModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
        />
      )}
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SectionHead                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SectionHead({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h2 className="text-[14px] font-semibold text-gray-900 dark:text-white">{title}</h2>
      {count !== undefined && (
        <span className="text-[11px] text-gray-400 font-medium">({count})</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Card                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

function Card({
  s,
  isSaved,
  onSave,
  onSelect,
  showDeadline = false,
}: {
  s: Scholarship;
  isSaved: boolean;
  onSave: () => void;
  onSelect: () => void;
  showDeadline?: boolean;
}) {
  const { t } = useTranslation();
  const days = daysUntil(s.deadline);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className="relative bg-white dark:bg-[#141722] rounded-xl p-5 border border-gray-200 dark:border-gray-700 border-l-[3px] border-l-primary shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 flex flex-col h-full group cursor-pointer"
    >
      {/* Top: flag + trending + bookmark */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 text-[11px] font-medium rounded-md border border-gray-100 dark:border-gray-800">
          <CountryFlag country={s.country} size={16} /> {s.country}
        </span>
        <div className="flex items-center gap-2">
          {s.isTrending && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 rounded-md text-[10px] font-semibold">
              <FireIcon className="w-3 h-3" /> {t('Scholarship.trending_badge')}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            aria-label={isSaved ? 'Unsave scholarship' : 'Save scholarship'}
            className="text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            {isSaved ? (
              <BookmarkIcon className="w-4 h-4 text-gray-800 dark:text-white" />
            ) : (
              <BookmarkOutlineIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Title + Institution */}
      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1 leading-snug line-clamp-2 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
        {s.title}
      </h3>
      <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-2.5">
        {titleCase(s.institution)}
      </p>

      {/* Description */}
      <p className="text-[12px] text-gray-400 leading-relaxed mb-4 line-clamp-2 min-h-[2.5em]">
        {s.description && s.description.length > 3
          ? s.description
          : t('Scholarship.no_description')}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {s.awardAmount && (
          <span className="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 border border-primary/20 dark:border-primary/30 text-[12px] font-bold rounded-md">
            {s.awardAmount}
          </span>
        )}
        {(showDeadline || (days !== null && days > 0 && days <= 30)) && s.deadline && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
              days !== null && days <= 7
                ? 'text-red-500 bg-red-50 border-red-100'
                : days !== null && days <= 30
                  ? 'text-amber-600 bg-amber-50 border-amber-100'
                  : 'text-gray-500 bg-gray-50 border-gray-100'
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
      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 rounded capitalize">
          {s.studyLevel?.toLowerCase().replace('_', ' ')}
        </span>
        {s.applicationUrl ? (
          <a
            href={s.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-200"
          >
            {t('Scholarship.apply_link')} <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-gray-300 dark:text-gray-600">
            {t('Scholarship.no_link')}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Scholarship Detail Modal                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

function ScholarshipModal({
  scholarship: s,
  onClose,
}: {
  scholarship: Scholarship;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const days = daysUntil(s.deadline);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-white dark:bg-[#141722] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#141722] border-b border-gray-100 dark:border-gray-800 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <CountryFlag country={s.country} size={28} />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {s.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {s.institution} · {s.country}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Details (2/3) */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {s.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BookmarkIcon className="w-4 h-4 text-primary" /> {t('Scholarship.description')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {s.description}
                </p>
              </div>
            )}

            {/* Eligibility */}
            {s.eligibility && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-indigo-500" />{' '}
                  {t('Scholarship.eligibility_criteria')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {s.eligibility}
                </p>
              </div>
            )}

            {/* Benefits */}
            {s.benefits && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <FireIcon className="w-4 h-4 text-amber-500" /> {t('Scholarship.benefits')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {s.benefits}
                </p>
              </div>
            )}

            {/* Fallback if no content */}
            {!s.description && !s.eligibility && !s.benefits && (
              <p className="text-sm text-gray-400 italic">{t('Scholarship.no_details')}</p>
            )}
          </div>

          {/* Right: Sticky Summary (1/3) */}
          <div className="md:col-span-1">
            <div className="sticky top-24 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              {/* Amount */}
              {s.awardAmount && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                    {t('Scholarship.award_label')}
                  </p>
                  <p className="text-lg font-bold text-primary">{s.awardAmount}</p>
                </div>
              )}

              {/* Deadline */}
              {s.deadline && (
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                    {t('Scholarship.deadline_label')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmtDate(s.deadline)}
                    {days !== null && days > 0 && (
                      <span
                        className={`ml-2 text-xs font-bold ${
                          days <= 7
                            ? 'text-red-500'
                            : days <= 30
                              ? 'text-amber-500'
                              : 'text-gray-400'
                        }`}
                      >
                        {t('Scholarship.days_left_modal', { count: days })}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Study Level */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                  {t('Scholarship.study_level_label')}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {s.studyLevel?.toLowerCase().replace('_', ' ')}
                </p>
              </div>

              {/* Award Type */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                  {t('Scholarship.award_type')}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {s.awardType}
                </p>
              </div>

              {/* Trending */}
              {s.isTrending && (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <FireIcon className="w-4 h-4" />
                  <span className="text-xs font-bold">{t('Scholarship.trending_scholarship')}</span>
                </div>
              )}

              {/* Apply Button */}
              {s.applicationUrl ? (
                <a
                  href={s.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3.5 bg-primary hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-primary/20 mt-4"
                >
                  {t('Scholarship.apply_now')}
                </a>
              ) : (
                <p className="text-xs text-gray-400 text-center mt-4">
                  {t('Scholarship.no_apply_link')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
