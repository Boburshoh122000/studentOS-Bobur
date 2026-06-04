import { useEffect, useCallback } from 'react';
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

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function formatJobType(type?: string): string {
  if (!type) return 'Full-time';
  const map: Record<string, string> = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    INTERNSHIP: 'Internship',
    GRADUATE: 'Graduate',
  };
  return map[type] || type.replace('_', '-');
}

function formatLocationType(type?: string): string {
  if (!type) return 'Onsite';
  const map: Record<string, string> = {
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
    ONSITE: 'Onsite',
  };
  return map[type] || type;
}

function formatDuration(weeks?: number): string | null {
  if (!weeks) return null;
  const months = Math.round(weeks / 4);
  if (months <= 1) return '1 month';
  return `${months} months`;
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function JobDetailModal({
  job,
  onClose,
  onApply,
  onToggleSave,
}: JobDetailModalProps) {
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
  const duration = formatDuration(job.durationWeeks);

  /* ── Content sections (only if data exists) ── */
  const sections: { title: string; content: React.ReactNode }[] = [];

  if (job.description) {
    sections.push({
      title: 'Job Description',
      content: (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>
      ),
    });
  }

  if (job.responsibilities && job.responsibilities.length > 0) {
    sections.push({
      title: 'Responsibilities',
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
      title: 'Requirements',
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
      title: 'Benefits & Perks',
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
      title: 'About the Company',
      content: (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {job.employer.description}
        </p>
      ),
    });
  }

  if (job.skills && job.skills.length > 0) {
    sections.push({
      title: 'Skills & Tags',
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
          {/* ── Info grid ── */}
          <div className="px-6 pt-5 pb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCard label="Job Type" icon={<BriefcaseIcon className="w-3.5 h-3.5" />}>
                {formatJobType(job.jobType)}
              </InfoCard>

              <InfoCard label="Work Mode" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                {formatLocationType(job.locationType)}
              </InfoCard>

              <InfoCard
                label="Salary"
                icon={<CurrencyDollarIcon className="w-3.5 h-3.5" />}
                highlight={isPaid ? 'green' : undefined}
              >
                {isPaid ? salary : 'Unpaid'}
              </InfoCard>

              {job.location && (
                <InfoCard label="Location" icon={<MapPinIcon className="w-3.5 h-3.5" />}>
                  {job.location}
                </InfoCard>
              )}

              {duration && (
                <InfoCard label="Duration" icon={<ClockIcon className="w-3.5 h-3.5" />}>
                  {duration}
                </InfoCard>
              )}

              {job.hoursPerWeek && (
                <InfoCard label="Hours" icon={<ClockIcon className="w-3.5 h-3.5" />}>
                  {job.hoursPerWeek} hrs/week
                </InfoCard>
              )}

              {job.startDate && (
                <InfoCard label="Start Date" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                  {new Date(job.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </InfoCard>
              )}

              {deadline && (
                <InfoCard
                  label="Deadline"
                  icon={<CalendarIcon className="w-3.5 h-3.5" />}
                  highlight={isDeadlinePassed ? 'gray' : isDeadlineSoon ? 'red' : undefined}
                >
                  <span>
                    {fmtDate(deadline)}
                    {days !== null && days > 0 && (
                      <span className="block text-[11px] mt-0.5 font-normal opacity-70">
                        {days} day{days !== 1 ? 's' : ''} left
                      </span>
                    )}
                    {isDeadlinePassed && (
                      <span className="block text-[11px] mt-0.5 font-normal opacity-70">
                        Deadline passed
                      </span>
                    )}
                  </span>
                </InfoCard>
              )}

              <InfoCard label="Posted" icon={<CalendarIcon className="w-3.5 h-3.5" />}>
                {timeAgo(job.postedAt)}
              </InfoCard>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-3">
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                  job.jobType === 'INTERNSHIP'
                    ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : job.jobType === 'GRADUATE'
                      ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatJobType(job.jobType)}
              </span>
              <span
                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                  isPaid
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {isPaid ? 'Paid' : 'Unpaid'}
              </span>
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
              Applied
            </button>
          ) : isDeadlinePassed ? (
            <button
              type="button"
              disabled
              className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-sm flex items-center justify-center gap-2 cursor-default"
            >
              ⏰ Deadline Passed
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onApply(job)}
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30"
            >
              Apply Now <ArrowTopRightOnSquareIcon className="w-4 h-4" />
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
                <BookmarkIcon className="w-4 h-4" /> Saved
              </>
            ) : (
              <>
                <BookmarkOutlineIcon className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Info card sub-component ── */
function InfoCard({
  label,
  icon,
  children,
  highlight,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  highlight?: 'green' | 'red' | 'gray';
}) {
  const valueColor =
    highlight === 'green'
      ? 'text-green-600 dark:text-green-400'
      : highlight === 'red'
        ? 'text-red-600 dark:text-red-400'
        : highlight === 'gray'
          ? 'text-gray-400'
          : 'text-gray-800 dark:text-gray-200';

  return (
    <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3.5 border border-gray-100 dark:border-white/[0.06]">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className={`text-sm font-semibold leading-snug ${valueColor}`}>{children}</p>
    </div>
  );
}
