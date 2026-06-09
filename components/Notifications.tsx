import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { notificationApi } from '../src/services/api';

function timeAgo(dateStr: string, t: (k: string, o?: Record<string, unknown>) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('Notifications.just_now');
  if (m < 60) return t('Notifications.minutes_ago', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('Notifications.hours_ago', { h });
  const d = Math.floor(h / 24);
  if (d < 30) return t('Notifications.days_ago', { d });
  const mo = Math.floor(d / 30);
  return t('Notifications.months_ago', { mo });
}

interface Notification {
  id: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG = {
  INFO: {
    icon: InformationCircleIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-400',
  },
  SUCCESS: {
    icon: CheckCircleIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-400',
  },
  WARNING: {
    icon: ExclamationTriangleIcon,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-400',
  },
  ERROR: {
    icon: XCircleIcon,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-400',
  },
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#14161f] rounded-xl border border-gray-100 dark:border-white/[0.06] p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { data, error: err } = await notificationApi.list();
      if (err || !data) {
        setError(t('Notifications.load_error'));
      } else {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      setError(t('Notifications.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationApi.markRead(n.id).catch((err) => {
        console.warn('Failed to mark notification as read:', err);
      });
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent — UI already updated optimistically
    } finally {
      setMarkingAllRead(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="max-w-2xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('Notifications.title')}
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-indigo-600 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNotifications}
              title={t('Notifications.refresh')}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.06] transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                {t('Notifications.mark_all_read')}
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="bg-white dark:bg-[#14161f] rounded-xl border border-gray-100 dark:border-white/[0.06] p-8 text-center">
            <XCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchNotifications}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('Notifications.try_again')}
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="bg-white dark:bg-[#14161f] rounded-xl border border-gray-100 dark:border-white/[0.06] p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('Notifications.empty_title')}
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {t('Notifications.empty_desc')}
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && !error && notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.INFO;
              const Icon = cfg.icon;
              const isClickable = !n.isRead || !!n.link;

              return (
                <div
                  key={n.id}
                  onClick={() => isClickable && handleClick(n)}
                  className={[
                    'group relative bg-white dark:bg-[#14161f] rounded-xl border transition-all duration-150',
                    !n.isRead
                      ? `border-l-4 ${cfg.border} border-r-gray-100 border-t-gray-100 border-b-gray-100 dark:border-r-white/[0.06] dark:border-t-white/[0.06] dark:border-b-white/[0.06] ${cfg.bg}`
                      : 'border-gray-100 dark:border-white/[0.06]',
                    isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-[1px]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex gap-3 p-4">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? cfg.bg : 'bg-gray-100 dark:bg-white/[0.06]'}`}
                    >
                      <Icon className={`w-5 h-5 ${!n.isRead ? cfg.color : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-semibold leading-snug ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                          {n.title}
                        </p>
                        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                          {timeAgo(n.createdAt, t)}
                        </span>
                      </div>
                      {n.message && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      {n.link && (
                        <span className="inline-block mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                          {t('Notifications.view_details')} →
                        </span>
                      )}
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
