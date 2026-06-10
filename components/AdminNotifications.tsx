import React, { useState, useEffect } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import { BellIcon, BellSlashIcon, ClockIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SentNotification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  user: { email: string; studentProfile?: { fullName?: string } };
}

export default function AdminNotifications({ navigateTo: _navigateTo }: NavigationProps) {
  // Form state
  const [targetMode, setTargetMode] = useState<'user' | 'broadcast'>('user');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [isSending, setIsSending] = useState(false);

  // History
  const [history, setHistory] = useState<SentNotification[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data } = await adminApi.getNotificationHistory({ limit: 30 });
      if (data?.notifications) setHistory(data.notifications);
    } catch {
      /* silent */
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (targetMode === 'user' && !email.trim()) {
      toast.error('Email is required');
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim() || undefined,
        type,
        ...(targetMode === 'broadcast' ? { broadcast: true } : { email: email.trim() }),
      };
      const { data, error } = await adminApi.sendNotification(payload);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(data?.message || 'Notification sent!');
      setTitle('');
      setMessage('');
      setEmail('');
      fetchHistory();
    } catch {
      toast.error('Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  const getTypeBadge = (t: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      INFO: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
      SUCCESS: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
      },
      WARNING: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
      },
      ERROR: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
      SYSTEM: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
      },
    };
    const badge = map[t] || map.INFO;
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
        {t}
      </span>
    );
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#181b2e]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <BellIcon className="w-5 h-5 text-primary" />
              Notifications
            </h2>
            <p className="text-sm text-slate-500 mt-1">Send announcements and messages to users</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* ── Send Notification Card ── */}
        <div className="bg-white dark:bg-[#1e2139] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
            <PaperAirplaneIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Send Notification</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTargetMode('user')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${targetMode === 'user' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  Specific User
                </button>
                <button
                  onClick={() => setTargetMode('broadcast')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${targetMode === 'broadcast' ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                >
                  All Users (Broadcast)
                </button>
              </div>
            </div>

            {targetMode === 'user' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  User Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                >
                  <option value="INFO">ℹ️ Info</option>
                  <option value="SUCCESS">✅ Success</option>
                  <option value="WARNING">⚠️ Warning</option>
                  <option value="ERROR">❌ Error</option>
                  <option value="SYSTEM">🔧 System</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message body..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {isSending && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                {isSending
                  ? 'Sending...'
                  : targetMode === 'broadcast'
                    ? 'Broadcast to All'
                    : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>

        {/* ── History Table ── */}
        <div className="bg-white dark:bg-[#1e2139] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-bold">Recently Sent</h3>
            </div>
            <button
              onClick={fetchHistory}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            {isLoadingHistory ? (
              <GlobalLoader fullScreen={false} />
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <BellSlashIcon className="w-9 h-9 text-slate-300" />
                <p className="text-sm">No notifications sent yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                            {n.user?.studentProfile?.fullName || n.user?.email}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">
                            {n.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3 max-w-[250px]">
                        <p className="font-medium truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">{n.message}</p>
                        )}
                      </td>
                      <td className="px-6 py-3">{getTypeBadge(n.type)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`text-xs font-medium ${n.isRead ? 'text-green-600' : 'text-slate-400'}`}
                        >
                          {n.isRead ? '✓ Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString()}{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
