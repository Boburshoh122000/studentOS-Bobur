import { useState, useEffect, useCallback } from 'react';
import { NavigationProps } from '../types';
import { demographicsApi, universityApi } from '../src/services/api';
import { downloadCSV } from '../src/utils/csv';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface UniRow {
  universityId: number | null;
  name: string;
  nameUz: string | null;
  region: string | null;
  count: number;
  isVerified: boolean;
}

interface FieldRow {
  name: string;
  count: number;
  percentage: number;
}

interface Summary {
  totalUsers: number;
  totalUniversitiesInDb: number;
  totalRepresented: number;
  newUsersThisMonth: number;
  topUniversity: { name: string; count: number } | null;
  topField: { name: string; count: number } | null;
}

/* ─── Donut chart (SVG) ─────────────────────────────────────────────────── */

const FIELD_COLORS = [
  '#2D4DE0',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#14b8a6',
];

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number): string {
  const clamped = Math.min(end, start + 359.99);
  const s = polarToCartesian(cx, cy, r, clamped);
  const e = polarToCartesian(cx, cy, r, start);
  const large = clamped - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function FieldDonut({ fields }: { fields: FieldRow[] }) {
  const total = fields.reduce((s, f) => s + f.count, 0);
  const segments: { start: number; end: number; color: string; name: string; count: number }[] = [];
  let angle = -90;
  fields.slice(0, 10).forEach((f, i) => {
    const sweep = total > 0 ? (f.count / total) * 360 : 0;
    segments.push({
      start: angle,
      end: angle + sweep,
      color: FIELD_COLORS[i % FIELD_COLORS.length],
      name: f.name,
      count: f.count,
    });
    angle += sweep;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0 size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          {segments.length > 0 ? (
            segments.map((s, i) => (
              <path
                key={i}
                d={describeArc(60, 60, 44, s.start, s.end)}
                stroke={s.color}
                strokeWidth="16"
                fill="none"
                strokeLinecap="round"
              />
            ))
          ) : (
            <circle cx="60" cy="60" r="44" stroke="#e2e8f0" strokeWidth="16" fill="none" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
          <span className="text-xs text-slate-500">total</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate capitalize">
                {s.name}
              </span>
            </div>
            <span className="text-[12px] font-bold text-slate-900 dark:text-white shrink-0">
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function AdminDemographicsPage({ navigateTo: _navigateTo }: NavigationProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [universities, setUniversities] = useState<UniRow[]>([]);
  const [fields, setFields] = useState<FieldRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uniSearch, setUniSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, uniRes, fldRes] = await Promise.all([
        demographicsApi.summary(),
        demographicsApi.universities(roleFilter ? { role: roleFilter } : undefined),
        demographicsApi.fields(roleFilter ? { role: roleFilter } : undefined),
      ]);
      if (sumRes.data) setSummary(sumRes.data as Summary);
      if (uniRes.data) setUniversities((uniRes.data as any).universities ?? []);
      if (fldRes.data) setFields((fldRes.data as any).fields ?? []);
    } catch {
      toast.error('Failed to load demographics data');
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const syncUniversities = async () => {
    setIsSyncing(true);
    try {
      const res = await universityApi.syncAdmin();
      const d = res.data as any;
      toast.success(`Sync complete — ${d?.created ?? 0} new, ${d?.skipped ?? 0} existing`);
      load();
    } catch {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const exportUniversities = () => {
    if (!universities.length) {
      toast.error('No data to export');
      return;
    }
    const csv = universities.map((u, i) => ({
      Rank: i + 1,
      University: u.name,
      'Uzbek Name': u.nameUz ?? '',
      Region: u.region ?? '',
      Users: u.count,
      'Matched in DB': u.isVerified ? 'Yes' : 'No',
    }));
    downloadCSV(csv, `university_demographics_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV downloaded');
  };

  const exportFields = () => {
    if (!fields.length) {
      toast.error('No data to export');
      return;
    }
    const csv = fields.map((f, i) => ({
      Rank: i + 1,
      'Field of Study': f.name,
      Users: f.count,
      '%': f.percentage,
    }));
    downloadCSV(csv, `field_demographics_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV downloaded');
  };

  const filteredUnis = universities.filter(
    (u) => !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase())
  );

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#1e2330] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">User Demographics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            University & field of study analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="text-[13px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-[#141722] text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="EDUCATOR">Educators</option>
            <option value="EMPLOYER">Employers</option>
          </select>
          <button
            type="button"
            onClick={syncUniversities}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#141722] text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Universities
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── Summary Cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse"
              >
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          summary && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <SummaryCard
                icon={UsersIcon}
                label="Total Users"
                value={summary.totalUsers}
                color="blue"
              />
              <SummaryCard
                icon={BuildingLibraryIcon}
                label="Universities in DB"
                value={summary.totalUniversitiesInDb}
                color="indigo"
              />
              <SummaryCard
                icon={ChartBarIcon}
                label="Represented"
                value={summary.totalRepresented}
                color="violet"
              />
              <SummaryCard
                icon={ArrowPathIcon}
                label="New This Month"
                value={summary.newUsersThisMonth}
                color="emerald"
              />
              <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800 p-4 col-span-2 lg:col-span-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Top University
                </p>
                {summary.topUniversity ? (
                  <>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {summary.topUniversity.name}
                    </p>
                    <p className="text-[11px] text-primary font-semibold mt-0.5">
                      {summary.topUniversity.count} users
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">—</p>
                )}
              </div>
            </div>
          )
        )}

        {/* ── Universities + Fields ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Universities Table (2/3) */}
          <div className="xl:col-span-2 bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Users by University
                </h2>
                <p className="text-[12px] text-slate-400">{filteredUnis.length} institutions</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={uniSearch}
                  onChange={(e) => setUniSearch(e.target.value)}
                  placeholder="Filter…"
                  aria-label="Filter universities"
                  className="text-[12px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-[#141722] w-36 outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={exportUniversities}
                  aria-label="Export universities CSV"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredUnis.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">No data yet</div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-10">
                        #
                      </th>
                      <th className="text-left px-2 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        University
                      </th>
                      <th className="text-left px-2 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Region
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Users
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnis.map((u, i) => {
                      const pct = summary?.totalUsers
                        ? ((u.count / summary.totalUsers) * 100).toFixed(1)
                        : '—';
                      return (
                        <tr
                          key={i}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-2.5 text-slate-400 font-medium">{i + 1}</td>
                          <td className="px-2 py-2.5">
                            <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                              {u.name}
                            </p>
                            {u.nameUz && u.nameUz !== u.name && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                                {u.nameUz}
                              </p>
                            )}
                            {!u.isVerified && (
                              <span className="text-[10px] text-amber-500 font-medium">
                                custom entry
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-slate-500">{u.region ?? '—'}</td>
                          <td className="px-5 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                            {u.count}
                          </td>
                          <td className="px-5 py-2.5 text-right text-slate-400">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Fields (1/3) */}
          <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                  Field of Study
                </h2>
                <p className="text-[12px] text-slate-400">Top majors</p>
              </div>
              <button
                type="button"
                onClick={exportFields}
                aria-label="Export fields CSV"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center h-44">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : fields.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No field data yet</div>
              ) : (
                <>
                  <FieldDonut fields={fields} />
                  <div className="mt-4 space-y-1.5">
                    {fields.slice(0, 15).map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px]">
                        <span className="text-slate-600 dark:text-slate-400 truncate capitalize">
                          {i + 1}. {f.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-800 dark:text-white">
                            {f.count}
                          </span>
                          <span className="text-slate-400 w-8 text-right">{f.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── SummaryCard helper ─────────────────────────────────────────────────── */

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: number;
  color: 'blue' | 'indigo' | 'violet' | 'emerald';
}) {
  const bg = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  }[color];

  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${bg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  );
}
