import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  XMarkIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';
import { formatSalary } from '../src/utils/formatSalary';

/* ═══════════════════════════════════════════════════════════════════════ */

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  locationType: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  salaryType?: string;
  currency?: string;
  compensationType?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  skills?: string[];
  department?: string;
  hoursPerWeek?: string;
  durationWeeks?: number;
  startDate?: string;
  applicationDeadline?: string;
  postedAt: string;
  isSaved?: boolean;
  hasApplied?: boolean;
  employer?: {
    companyName: string;
    logoUrl?: string;
    verificationStatus?: string;
    description?: string;
  };
}

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  onApply: (job: Job) => void;
  onToggleSave: (job: Job) => void;
}

/* ═══════════════════════════════════════════════════════════════════════ */

function fmtDate(d?: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function daysUntil(d?: string): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function timeAgo(dateStr: string, t: TFunction): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
  if (days === 0) return t('Jobs.today');
  if (days === 1) return t('Jobs.yesterday');
  return t('Jobs.days_ago', { count: days });
}

function formatJobType(type: string | undefined, t: TFunction): string {
  const map: Record<string, string> = {
    FULL_TIME: t('Jobs.type_full'),
    PART_TIME: t('Jobs.type_part'),
    INTERNSHIP: t('Jobs.type_internship'),
    GRADUATE: t('Jobs.type_graduate'),
  };
  if (!type) return t('Jobs.type_full');
  return map[type] || type.replace('_', '-');
}

function formatLocationType(type: string | undefined, t: TFunction): string {
  const map: Record<string, string> = {
    REMOTE: t('Jobs.loc_remote'),
    HYBRID: t('Jobs.loc_hybrid'),
    ONSITE: t('Jobs.loc_onsite'),
  };
  if (!type) return t('Jobs.loc_onsite');
  return map[type] || type;
}

function formatDuration(weeks: number | undefined, t: TFunction): string | null {
  if (!weeks) return null;
  const months = Math.round(weeks / 4);
  if (months <= 1) return t('Jobs.one_month');
  return t('Jobs.months', { count: months });
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function JobDetailModal({
  job,
  onClose,
  onApply,
  onToggleSave,
}: JobDetailModalProps) {
  const { t } = useTranslation();
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!job) return null;

  const deadline = job.applicationDeadline;
  const days = daysUntil(deadline);
  const isDeadlinePassed = days !== null && days <= 0;
  const isDeadlineSoon = days !== null && days > 0 && days <= 7;
  const isPaid = job.compensationType !== 'UNPAID';
  const salary = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.currency,
    job.salaryPeriod || job.salaryType || 'YEARLY'
  );
  const duration = formatDuration(job.durationWeeks, t);

  /* ── Content sections (only if data exists) ── */
  const sections: { title: string; content: React.ReactNode }[] = [];

  if (job.description) {
    sections.push({
      title: t('Jobs.sec_description'),
      content: (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>
      ),
    });
  }

  if (job.responsibilities && job.responsibilities.length > 0) {
    sections.push({
      title: t('Jobs.sec_responsibilities'),
      content: (
        <ul className="space-y-1.5">
          {job.responsibilities.map((r, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
              <span className="text-gray-400 flex-shrink-0">–</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (job.requirements && job.requirements.length > 0) {
    sections.push({
      title: t('Jobs.sec_requirements'),
      content: (
        <ul className="space-y-1.5">
          {job.requirements.map((r, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
              <span className="text-gray-400 flex-shrink-0">–</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (job.benefits && job.benefits.length > 0) {
    sections.push({
      title: t('Jobs.sec_benefits'),
      content: (
        <ul className="space-y-1.5">
          {job.benefits.map((b, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
              <span className="text-green-500 flex-shrink-0">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (job.employer?.description) {
    sections.push({
      title: t('Jobs.sec_about'),
      content: (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {job.employer.description}
        </p>
      ),
    });
  }

  if (job.skills && job.skills.length > 0) {
    sections.push({
      title: t('Jobs.sec_skills'),
      content: (
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#141722] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.employer?.logoUrl ? (
                <img
                  src={job.employer.logoUrl}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                  {job.company?.[0]?.toUpperCase() || 'C'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {job.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                {job.employer?.companyName || job.company}
                {job.employer?.verificationStatus === 'verified' && (
                  <span className="text-blue-500" title="Verified">
                    ✓
                  </span>
                )}
                {job.location && <span> · {job.location}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Job highlights ── */}
          <div className="px-6 pt-5 pb-5 border-b border-gray-100 dark:border-gray-800 space-y-4">
            {/* Chips row: type + mode + compensation */}
            <div className="flex flex-wrap gap-2">
              <JobChip
                color={
                  job.jobType === 'INTERNSHIP'
                    ? 'purple'
                    : job.jobType === 'GRADUATE'
                      ? 'indigo'
                      : 'emerald'
                }
              >
                <BriefcaseIcon className="w-3 h-3" />
                {formatJobType(job.jobType, t)}
              </JobChip>
              <JobChip color="blue">
                <MapPinIcon className="w-3 h-3" />
                {formatLocationType(job.locationType, t)}
              </JobChip>
              <JobChip color={isPaid ? 'green' : 'gray'}>
                <CurrencyDollarIcon className="w-3 h-3" />
                {isPaid ? t('Jobs.paid') : t('Jobs.unpaid')}
              </JobChip>
            </div>

            {/* Salary hero */}
            <div className="flex items-end gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">
                  {t('Jobs.salary')}
                </p>
                <p
                  className={`text-2xl font-extrabold leading-none ${
                    isPaid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isPaid ? salary : t('Jobs.unpaid')}
                </p>
              </div>
              {isPaid && (
                <div className="mb-0.5 size-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>

            {/* Details: clean 2-col list, no inner boxes */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-1">
              {job.location && (
                <DetailRow
                  icon={<MapPinIcon className="w-3.5 h-3.5" />}
                  label={t('Jobs.label_location')}
                >
                  {job.location}
                </DetailRow>
              )}
              {duration && (
                <DetailRow
                  icon={<ClockIcon className="w-3.5 h-3.5" />}
                  label={t('Jobs.label_duration')}
                >
                  {duration}
                </DetailRow>
              )}
              {job.hoursPerWeek && (
                <DetailRow
                  icon={<ClockIcon className="w-3.5 h-3.5" />}
                  label={t('Jobs.label_hours')}
                >
                  {t('Jobs.hrs_week', { hours: job.hoursPerWeek })}
                </DetailRow>
              )}
              {job.startDate && (
                <DetailRow
                  icon={<CalendarIcon className="w-3.5 h-3.5" />}
                  label={t('Jobs.label_start')}
                >
                  {new Date(job.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </DetailRow>
              )}
              {deadline && (
                <DetailRow
                  icon={<CalendarIcon className="w-3.5 h-3.5" />}
                  label={t('Jobs.label_deadline')}
                  accent={isDeadlinePassed ? 'muted' : isDeadlineSoon ? 'red' : undefined}
                >
                  {fmtDate(deadline)}
                  {days !== null && days > 0 && (
                    <span className="ml-1.5 text-[11px] font-semibold text-amber-500">
                      {t('Jobs.days_left', { count: days })}
                    </span>
                  )}
                  {isDeadlinePassed && (
                    <span className="ml-1.5 text-[11px] text-gray-400">{t('Jobs.passed')}</span>
                  )}
                </DetailRow>
              )}
              <DetailRow
                icon={<CalendarIcon className="w-3.5 h-3.5" />}
                label={t('Jobs.label_posted')}
              >
                {timeAgo(job.postedAt, t)}
              </DetailRow>
            </div>
          </div>

          {/* ── Content sections ── */}
          {sections.length > 0 && (
            <div className="px-6 py-6 space-y-6">
              {sections.map((sec) => (
                <div key={sec.title}>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    {sec.title}
                  </h3>
                  {sec.content}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sticky footer: action buttons ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#141722] flex-shrink-0">
          {job.hasApplied ? (
            <button
              type="button"
              disabled
              className="flex-1 py-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 cursor-default"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {t('Jobs.applied')}
            </button>
          ) : isDeadlinePassed ? (
            <button
              type="button"
              disabled
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 cursor-default"
            >
              {t('Jobs.deadline_passed')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30"
            >
              {t('Jobs.apply_now')} <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleSave(job)}
            className={`px-5 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              job.isSaved
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
            }`}
          >
            {job.isSaved ? (
              <>
                <BookmarkIcon className="w-4 h-4" /> {t('Jobs.saved')}
              </>
            ) : (
              <>
                <BookmarkOutlineIcon className="w-4 h-4" /> {t('Jobs.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Chip pill for job type / mode / compensation ── */
const CHIP_COLORS = {
  purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  gray: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
};

function JobChip({
  children,
  color,
}: {
  children: React.ReactNode;
  color: keyof typeof CHIP_COLORS;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${CHIP_COLORS[color]}`}
    >
      {children}
    </span>
  );
}

/* ── Clean label + value row (no box) ── */
function DetailRow({
  icon,
  label,
  children,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent?: 'red' | 'muted';
}) {
  const valueClass =
    accent === 'red'
      ? 'text-red-600 dark:text-red-400'
      : accent === 'muted'
        ? 'text-gray-400'
        : 'text-gray-800 dark:text-gray-200';

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1">
        <span className="text-gray-300 dark:text-gray-600">{icon}</span>
        {label}
      </p>
      <p className={`text-sm font-semibold ${valueClass}`}>{children}</p>
    </div>
  );
}
