import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import {
  ArrowLeftIcon,
  CalendarIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  TrophyIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  CheckCircleIcon,
  XCircleIcon,
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

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Helpers                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Detail Page                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

export default function ScholarshipDetail({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setLoadError(false);
    scholarshipApi
      .get(id)
      .then((res) => {
        const d = res.data as Record<string, unknown>;
        const s = (d?.scholarship ?? res.data) as Scholarship;
        setScholarship(s);
        setIsSaved(!!s.isSaved);
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!scholarship) return;
    const was = isSaved;
    setIsSaved(!was);
    try {
      if (was) await scholarshipApi.unsave(scholarship.id);
      else await scholarshipApi.save(scholarship.id);
    } catch {
      setIsSaved(was);
    }
  };

  const days = scholarship ? daysUntil(scholarship.deadline) : null;
  const deadlineUrgency =
    days !== null && days <= 7 ? 'urgent' : days !== null && days <= 30 ? 'soon' : 'normal';

  return (
    <DashboardLayout
      currentScreen={Screen.SCHOLARSHIPS}
      navigateTo={navigateTo}
      headerContent={
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationDropdown />
        </div>
      }
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate('/app/scholarships')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t('Scholarship.back_to_finder')}
        </button>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {loadError && !isLoading && (
          <div className="text-center py-20 bg-white dark:bg-[#141722] rounded-2xl border border-gray-200 dark:border-gray-800">
            <XCircleIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-5 text-[14px]">
              {t('Scholarship.not_found_error')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/app/scholarships')}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[13px] font-semibold transition-colors"
            >
              {t('Scholarship.back_to_search')}
            </button>
          </div>
        )}

        {/* Detail card */}
        {scholarship && !isLoading && (
          <div className="bg-white dark:bg-[#141722] rounded-2xl border border-gray-200 dark:border-gray-800 border-l-[3px] border-l-primary shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 text-[12px] font-medium rounded-md">
                      <GlobeAltIcon className="w-3.5 h-3.5" />
                      {scholarship.country}
                    </span>
                    {scholarship.awardType && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 text-[12px] font-medium rounded-md capitalize">
                        <TrophyIcon className="w-3.5 h-3.5" />
                        {scholarship.awardType.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    )}
                    {scholarship.isTrending && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded-md text-[12px] font-semibold">
                        <FireIcon className="w-3.5 h-3.5" /> {t('Scholarship.trending')}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold ${
                        scholarship.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {scholarship.isActive ? (
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                      ) : (
                        <XCircleIcon className="w-3.5 h-3.5" />
                      )}
                      {scholarship.isActive
                        ? t('Scholarship.status_active')
                        : t('Scholarship.status_closed')}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
                    {scholarship.title}
                  </h1>
                  <p className="text-[14px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <AcademicCapIcon className="w-4 h-4 flex-shrink-0" />
                    {titleCase(scholarship.institution)}
                  </p>
                </div>

                {/* Save button */}
                <button
                  type="button"
                  onClick={toggleSave}
                  aria-label={isSaved ? 'Unsave scholarship' : 'Save scholarship'}
                  className="flex-shrink-0 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                >
                  {isSaved ? (
                    <BookmarkIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <BookmarkOutlineIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* ── Key stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 border-b border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800">
              {/* Amount */}
              <div className="p-4 sm:p-5">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">
                  {t('Scholarship.award_amount')}
                </p>
                <p className="text-[18px] font-bold text-primary dark:text-blue-400 leading-tight">
                  {scholarship.awardAmount || '—'}
                </p>
              </div>

              {/* Study Level */}
              <div className="p-4 sm:p-5">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">
                  {t('Scholarship.study_level_caption')}
                </p>
                <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 capitalize">
                  {scholarship.studyLevel?.toLowerCase().replace(/_/g, ' ') || '—'}
                </p>
              </div>

              {/* Deadline */}
              <div className="p-4 sm:p-5 col-span-2 sm:col-span-1 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1.5">
                  {t('Scholarship.application_deadline')}
                </p>
                {scholarship.deadline ? (
                  <div>
                    <p
                      className={`text-[14px] font-semibold leading-tight ${
                        deadlineUrgency === 'urgent'
                          ? 'text-red-500'
                          : deadlineUrgency === 'soon'
                            ? 'text-amber-500'
                            : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {fmtDate(scholarship.deadline)}
                    </p>
                    {days !== null && days > 0 && days <= 60 && (
                      <p
                        className={`text-[11px] mt-0.5 font-medium ${
                          deadlineUrgency === 'urgent' ? 'text-red-400' : 'text-amber-400'
                        }`}
                      >
                        {t('Scholarship.days_remaining', { count: days })}
                      </p>
                    )}
                    {days !== null && days <= 0 && (
                      <p className="text-[11px] mt-0.5 text-gray-400">
                        {t('Scholarship.deadline_passed')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[14px] font-semibold text-gray-400">
                    {t('Scholarship.not_specified')}
                  </p>
                )}
              </div>
            </div>

            {/* ── Description ── */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                {t('Scholarship.about_scholarship')}
              </h2>
              <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                {scholarship.description && scholarship.description.length > 3
                  ? scholarship.description
                  : t('Scholarship.no_description_long')}
              </p>
            </div>

            {/* ── Apply / No link ── */}
            <div className="p-6 flex items-center gap-3 flex-wrap">
              {scholarship.applicationUrl ? (
                <>
                  <a
                    href={scholarship.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-[14px] rounded-xl transition-colors"
                  >
                    {t('Scholarship.apply_now_plain')}{' '}
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                  <p className="text-[12px] text-gray-400">{t('Scholarship.opens_official')}</p>
                </>
              ) : (
                <p className="text-[13px] text-gray-400 dark:text-gray-500">
                  {t('Scholarship.no_link_long')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
