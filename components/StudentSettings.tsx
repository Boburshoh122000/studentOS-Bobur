import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { useCredits } from '../src/contexts/CreditContext';
import { userApi, authApi, creditsApi, notificationApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  ArrowTrendingDownIcon,
  BellIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  GiftIcon,
  LinkIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  PencilIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { EyeSlashIcon } from '@heroicons/react/24/solid';

type SettingsTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'billing'
  | 'earn'
  | 'integrations'
  | 'delete';

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface CreditHistoryItem {
  id: string;
  tool: { name: string; slug: string; icon: string; category: string };
  credits: number;
  usedAt: string;
}

interface ProfileData {
  fullName?: string;
  bio?: string;
  country?: string;
  avatarUrl?: string;
  university?: string;
  major?: string;
  headline?: string;
}

// ─── Tab Configuration ───────────────────────────────────────────────
const TABS: { id: SettingsTab; labelKey: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: 'profile', labelKey: 'Settings.tab_profile', icon: UserIcon },
  { id: 'security', labelKey: 'Settings.tab_security', icon: ShieldCheckIcon },
  { id: 'notifications', labelKey: 'Settings.notifications', icon: BellIcon },
  { id: 'billing', labelKey: 'Settings.tab_billing', icon: CreditCardIcon },
  { id: 'earn', labelKey: 'Settings.tab_earn', icon: GiftIcon },
  { id: 'integrations', labelKey: 'Settings.tab_integrations', icon: LinkIcon },
  { id: 'delete', labelKey: 'Settings.delete_account', icon: TrashIcon, danger: true },
];

// ─── Reusable Card ───────────────────────────────────────────────────
function SettingsCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

function EditButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium disabled:opacity-50"
    >
      {loading ? (
        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <PencilIcon className="w-3.5 h-3.5" />
      )}
      {loading ? t('Settings.saving') : t('Settings.edit')}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function StudentSettings({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const { user, refreshUser, logout } = useAuth();
  const { balance, refreshBalance } = useCredits();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // ── Loading States ──
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // ── Profile state ──
  const [profile, setProfile] = useState<ProfileData>({});
  const [editingSection, setEditingSection] = useState<'personal' | 'address' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ── Security state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── Notifications state ──
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Billing state ──
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // ── Earn Credits state ──
  const [isClaiming, setIsClaiming] = useState(false);
  const [telegramClaimed, setTelegramClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Telegram integration state ──
  const [tgConnected, setTgConnected] = useState(false);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [tgCode, setTgCode] = useState<string | null>(null);
  const [tgCodeExpiry, setTgCodeExpiry] = useState<Date | null>(null);
  const [tgSecondsLeft, setTgSecondsLeft] = useState(0);
  const [isLoadingTg, setIsLoadingTg] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // ── Delete state ──
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch Profile ──
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const { data, error } = await userApi.getProfile();
      if (error) throw new Error(error);
      if (data) {
        const p = data as ProfileData;
        setProfile(p);
        const nameParts = (p.fullName || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setBio(p.bio || '');
        setCountry(p.country || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  // ── Fetch Notifications ──
  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const { data, error } = await notificationApi.list();
      if (error) throw new Error(error);
      if (data) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // ── Fetch Credit History + Balance ──
  const fetchCreditData = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const [histRes, balRes] = await Promise.all([
        creditsApi.getHistory({ limit: 20 }),
        creditsApi.getBalance(),
      ]);
      if (histRes.data?.data) setCreditHistory(histRes.data.data.history);
      if (balRes.data?.data) setReferralCode(balRes.data.data.referralCode);
    } catch (err) {
      console.error('Failed to fetch credit data:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ── Fetch Telegram status ──
  const fetchTelegramStatus = useCallback(async () => {
    setIsLoadingTg(true);
    try {
      const { data } = await userApi.getTelegramStatus();
      if (data) {
        setTgConnected(data.connected);
        setTgUsername(data.username ?? null);
        if (data.pendingCode) {
          setTgCode(data.pendingCode.code);
          setTgCodeExpiry(new Date(data.pendingCode.expiresAt));
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoadingTg(false);
    }
  }, []);

  // ── Countdown for link code ──
  useEffect(() => {
    if (!tgCodeExpiry) return;
    const tick = () => {
      const left = Math.max(0, Math.round((tgCodeExpiry.getTime() - Date.now()) / 1000));
      setTgSecondsLeft(left);
      if (left === 0) {
        setTgCode(null);
        setTgCodeExpiry(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tgCodeExpiry]);

  // ── Initial fetch ──
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // ── Lazy fetch on tab change ──
  useEffect(() => {
    if (activeTab === 'notifications' && notifications.length === 0) fetchNotifications();
    if ((activeTab === 'billing' || activeTab === 'earn') && creditHistory.length === 0)
      fetchCreditData();
    if (activeTab === 'integrations') fetchTelegramStatus();
  }, [
    activeTab,
    notifications.length,
    creditHistory.length,
    fetchNotifications,
    fetchCreditData,
    fetchTelegramStatus,
  ]);

  const initials = (profile.fullName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Profile Save ──
  const handleSaveProfile = async () => {
    const name = `${firstName} ${lastName}`.trim();
    if (!name) {
      toast.error(t('Settings.name_empty'));
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error } = await userApi.updateProfile({
        fullName: name,
        bio: bio.trim() || undefined,
        country: country.trim() || undefined,
      });
      if (error) throw new Error(error);
      toast.success(t('Settings.profile_updated'));
      setEditingSection(null);
      await Promise.all([fetchProfile(), refreshUser()]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('Settings.profile_update_failed'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password Change ──
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(t('Settings.enter_current_pw'));
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error(t('Settings.fill_both_pw'));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t('Settings.pw_min'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('Settings.pw_mismatch'));
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await authApi.changePassword({ currentPassword, newPassword });
      if (error) throw new Error(error);
      toast.success(t('Settings.pw_updated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('Settings.pw_update_failed'));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Mark Notification Read ──
  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error(t('Settings.mark_read_failed'));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(t('Settings.all_marked_read'));
    } catch {
      toast.error(t('Settings.mark_all_failed'));
    }
  };

  // ── Copy Referral Link ──
  const referralLink = referralCode ? `https://studentos.uz/ref/${referralCode}` : null;
  const handleCopyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(t('Settings.referral_copied'));
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error(t('Settings.copy_failed'));
    }
  };

  // ── Telegram: generate pairing code ──
  const handleGenerateTgCode = async () => {
    setIsGeneratingCode(true);
    try {
      const { data, error } = await userApi.generateTelegramCode();
      if (error) {
        toast.error(error);
        return;
      }
      if (data) {
        setTgCode(data.code);
        setTgCodeExpiry(new Date(data.expiresAt));
      }
    } catch {
      toast.error(t('Settings.code_gen_failed'));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // ── Telegram: disconnect ──
  const handleDisconnectTg = async () => {
    if (!confirm(t('Settings.confirm_disconnect'))) return;
    setIsDisconnecting(true);
    try {
      const { error } = await userApi.disconnectTelegram();
      if (error) {
        toast.error(error);
        return;
      }
      setTgConnected(false);
      setTgUsername(null);
      toast.success(t('Settings.tg_disconnected'));
    } catch {
      toast.error(t('Settings.disconnect_failed'));
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ── Telegram Credits ──
  const handleClaimTelegram = async () => {
    // Must have Telegram linked
    if (!tgConnected) {
      toast.error(t('Settings.connect_tg_prompt'));
      setActiveTab('integrations');
      return;
    }

    setIsClaiming(true);
    try {
      const { data, error } = await userApi.claimTelegramCredits();
      if (error) {
        if (error.includes('Join @creo_life')) {
          // Open channel so user can join, then try again
          window.open('https://t.me/creo_life', '_blank');
          toast.error(t('Settings.join_then_verify'));
        } else {
          toast.error(error);
        }
        return;
      }
      if (data) {
        toast.success(t('Settings.credits_added'));
        setTelegramClaimed(true);
        await Promise.all([refreshUser(), refreshBalance()]);
      }
    } catch {
      toast.error(t('Settings.claim_failed'));
    } finally {
      setIsClaiming(false);
    }
  };

  // ── Delete Account ──
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (!confirm(t('Settings.confirm_delete'))) return;
    setIsDeleting(true);
    try {
      const { error } = await authApi.deleteAccount();
      if (error) throw new Error(error);
      toast.success(t('Settings.account_deleted'));
      await logout();
      navigateTo(Screen.LANDING);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('Settings.delete_failed'));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Time helpers ──
  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return t('Settings.time_just_now');
    if (seconds < 3600) return t('Settings.time_min', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('Settings.time_hour', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('Settings.time_day', { count: Math.floor(seconds / 86400) });
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  // ─── Header ────────────────────────────────────────────────────────
  const headerContent = (
    <header className="h-auto min-h-[4.5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-[#1e2330] border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('Settings.header_title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Settings.header_sub')}</p>
      </div>
    </header>
  );

  // Loading state
  if (isLoadingProfile) {
    return (
      <DashboardLayout
        currentScreen={Screen.SETTINGS}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex items-center justify-center h-full py-20">
          <GlobalLoader fullScreen={false} />
        </div>
      </DashboardLayout>
    );
  }

  // ─── Tab Panels ────────────────────────────────────────────────────
  const renderProfile = () => (
    <>
      {/* Avatar & Basic Info */}
      <SettingsCard
        title={t('Settings.my_profile')}
        action={<EditButton onClick={() => setEditingSection('personal')} />}
      >
        <div className="flex items-center gap-5">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName || ''}
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {initials}
            </div>
          )}
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
              {profile.fullName || email}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.headline ||
                (user?.role === 'STUDENT'
                  ? t('Settings.role_student')
                  : user?.role || t('Settings.role_member'))}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPinIcon className="w-3 h-3" /> {profile.country || t('Settings.not_set')}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Personal Info */}
      <SettingsCard
        title={t('Settings.personal_info')}
        action={
          editingSection === 'personal' ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingSection(null)}
                aria-label="Cancel editing"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-1.5 text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5" />
                )}
                {t('Settings.save')}
              </button>
            </div>
          ) : (
            <EditButton onClick={() => setEditingSection('personal')} />
          )
        }
      >
        {editingSection === 'personal' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.first_name')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('Settings.ph_first_name')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.last_name')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('Settings.ph_last_name')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.email_address')}
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('Settings.ph_phone')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.bio')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('Settings.ph_bio')}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <InfoField label={t('Settings.first_name')} value={firstName} />
            <InfoField label={t('Settings.last_name')} value={lastName} />
            <InfoField label={t('Settings.email_address')} value={email} />
            <InfoField label={t('Settings.phone')} value={phone || '—'} />
            <div className="sm:col-span-2">
              <InfoField label={t('Settings.bio')} value={bio || '—'} />
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Address */}
      <SettingsCard
        title={t('Settings.address')}
        action={
          <EditButton
            onClick={() =>
              setEditingSection(editingSection === 'address' ? null : ('address' as const))
            }
          />
        }
      >
        {editingSection === 'address' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.country')}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t('Settings.ph_country')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.city_state')}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('Settings.ph_city')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('Settings.postal_code')}
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder={t('Settings.ph_postal')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSavingProfile ? (
                  <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckIcon className="w-3.5 h-3.5" />
                )}{' '}
                {t('Settings.save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <InfoField label={t('Settings.country')} value={country || '—'} />
            <InfoField label={t('Settings.city_state')} value={city || '—'} />
            <InfoField label={t('Settings.postal_code')} value={postalCode || '—'} />
          </div>
        )}
      </SettingsCard>
    </>
  );

  const renderSecurity = () => (
    <SettingsCard title={t('Settings.change_password')}>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('Settings.current_password')}
          </label>
          <div className="relative">
            <input
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('Settings.ph_current_pw')}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPw ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('Settings.new_password')}
          </label>
          <div className="relative">
            <input
              type={showNewPw ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('Settings.ph_new_pw')}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('Settings.confirm_new_password')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('Settings.ph_confirm_pw')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex justify-end pt-3">
          <button
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isSavingPassword && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
            {isSavingPassword ? t('Settings.updating') : t('Settings.update_password')}
          </button>
        </div>
      </div>
    </SettingsCard>
  );

  const renderNotifications = () => (
    <SettingsCard
      title={`${t('Settings.notifications')} ${unreadCount > 0 ? t('Settings.unread_suffix', { count: unreadCount }) : ''}`}
      action={
        unreadCount > 0 ? (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {t('Settings.mark_all_read')}
          </button>
        ) : undefined
      }
    >
      {isLoadingNotifications ? (
        <div className="flex justify-center py-8">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('Settings.no_notifications')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`flex items-start gap-3.5 px-1 py-4 first:pt-0 last:pb-0 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 -mx-2 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/15' : 'hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg'}`}
            >
              <div
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {n.title}
                </p>
                {n.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                {timeAgo(n.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );

  const renderBilling = () => (
    <>
      {/* Balance Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <p className="text-sm font-medium text-blue-100 mb-1">{t('Settings.available_balance')}</p>
        <p className="text-4xl font-bold tracking-tight">
          {balance}{' '}
          <span className="text-lg font-medium text-blue-200">{t('Settings.credits_unit')}</span>
        </p>
      </div>

      {/* Transaction History */}
      <SettingsCard title={t('Settings.credit_history')}>
        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : creditHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCardIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Settings.no_transactions')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-1">
            {creditHistory.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 px-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ArrowTrendingDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t.tool.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(t.usedAt)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-gray-500 dark:text-gray-400">
                  −{t.credits}
                </span>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
    </>
  );

  const renderEarnCredits = () => (
    <SettingsCard title={t('Settings.earn_title')}>
      <div className="space-y-5">
        {/* Task 1: Invite Friends */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/15 dark:to-indigo-900/15 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-1.5">
            <GiftIcon className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {t('Settings.invite_friends')}
            </h4>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
              {t('Settings.badge_5credits')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3.5">
            {t('Settings.invite_desc_pre')} <strong>{t('Settings.invite_desc_bold')}</strong>{' '}
            {t('Settings.invite_desc_post')}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink ?? t('Settings.loading_link')}
              aria-label={t('Settings.referral_aria')}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs font-mono focus:outline-none truncate"
            />
            <button
              onClick={handleCopyReferral}
              disabled={!referralLink || copied}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm disabled:opacity-50 ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {copied ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ClipboardIcon className="w-5 h-5" />
              )}
              {copied ? t('Settings.copied') : t('Settings.copy')}
            </button>
          </div>
        </div>

        {/* Task 2: Telegram */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/15 dark:to-cyan-900/15 rounded-xl p-5 border border-sky-100 dark:border-sky-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <svg
                  className="w-[18px] h-[18px] text-blue-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Settings.join_tg_channel')}
                </h4>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">
                  {t('Settings.badge_5credits')}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('Settings.tg_desc_pre')}{' '}
                <a
                  href="https://t.me/creo_life"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-medium"
                >
                  @creo_life
                </a>{' '}
                {t('Settings.tg_desc_post')} <strong>{t('Settings.free_credits_bold')}</strong>.{' '}
                {!tgConnected && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {t('Settings.connect_tg_first')}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaimTelegram}
              disabled={isClaiming || telegramClaimed}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${telegramClaimed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-default' : !tgConnected ? 'bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50' : 'bg-[#229ED9] text-white hover:bg-[#1e8ec5] disabled:opacity-50'}`}
            >
              {isClaiming ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> {t('Settings.verifying')}
                </>
              ) : telegramClaimed ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" /> {t('Settings.claimed')}
                </>
              ) : !tgConnected ? (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" /> {t('Settings.connect_telegram')}
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4" /> {t('Settings.verify')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );

  const renderDelete = () => (
    <div className="bg-white dark:bg-[#1e2330] rounded-2xl border-2 border-red-200 dark:border-red-900/40 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            {t('Settings.delete_account')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('Settings.delete_irreversible')}
          </p>
        </div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-5 border border-red-100 dark:border-red-900/30">
        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
          {t('Settings.delete_long')}
        </p>
      </div>
      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('Settings.type_delete_pre')} <strong className="text-red-600">DELETE</strong>{' '}
          {t('Settings.type_delete_post')}
        </label>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={t('Settings.ph_type_delete')}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all mb-4"
        />
        <button
          disabled={deleteConfirm !== 'DELETE' || isDeleting}
          onClick={handleDeleteAccount}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
        >
          {isDeleting && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
          {isDeleting ? t('Settings.deleting') : t('Settings.delete_my_account')}
        </button>
      </div>
    </div>
  );

  const renderIntegrations = () => {
    const TgIcon = () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    );

    const fmtTime = (s: number) =>
      `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
      <div className="space-y-4">
        {/* Header card */}
        <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9]">
              <TgIcon />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('Settings.tg_integration')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('Settings.tg_integration_desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Connected state */}
        {isLoadingTg ? (
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex items-center gap-3">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">{t('Settings.checking_connection')}</span>
          </div>
        ) : tgConnected ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {tgUsername
                    ? t('Settings.connected_as', { name: tgUsername })
                    : t('Settings.connected')}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t('Settings.tg_linked_desc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDisconnectTg}
              disabled={isDisconnecting}
              className="shrink-0 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800/50 text-red-500 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isDisconnecting ? (
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XMarkIcon className="w-3.5 h-3.5" />
              )}
              {t('Settings.disconnect')}
            </button>
          </div>
        ) : (
          <>
            {/* How to connect */}
            <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9]">
                  <TgIcon />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Settings.how_to_connect')}
                </h4>
              </div>
              <ol className="space-y-2.5 mb-5">
                {(
                  [
                    [
                      `${t('Settings.conn_s1_pre')} `,
                      <strong key="b">{t('Settings.conn_open_quoted')}</strong>,
                      ` ${t('Settings.conn_s1_post')}`,
                    ],
                    [
                      `${t('Settings.conn_s2_pre')} `,
                      <strong key="b">{t('Settings.conn_generate_bold')}</strong>,
                      ` ${t('Settings.conn_s2_post')}`,
                    ],
                    [
                      `${t('Settings.conn_s3_pre')} `,
                      <code
                        key="c"
                        className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono"
                      >
                        /link 123456
                      </code>,
                      t('Settings.conn_s3_post'),
                    ],
                    [t('Settings.conn_s4')],
                  ] as React.ReactNode[][]
                ).map((parts, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#229ED9]/15 text-[#229ED9] text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{parts}</span>
                  </li>
                ))}
              </ol>
              <a
                href="https://t.me/Student_OS_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#229ED9] hover:bg-[#1e8ec5] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <TgIcon />
                {t('Settings.open_in_telegram')}
                <svg
                  className="w-3.5 h-3.5 opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>

            {/* Generate link code */}
            <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center">
              {tgCode && tgSecondsLeft > 0 ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    {t('Settings.your_link_code')}
                  </p>
                  <div className="inline-flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl px-6 py-3 mb-3">
                    <span className="text-3xl font-bold font-mono tracking-widest text-gray-900 dark:text-white">
                      {tgCode}
                    </span>
                    <button
                      type="button"
                      title="Copy code"
                      onClick={() => {
                        navigator.clipboard.writeText(`/link ${tgCode}`);
                        toast.success(t('Settings.copied_short'));
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                    {t('Settings.send_link_pre')} <code className="font-mono">/link {tgCode}</code>{' '}
                    {t('Settings.send_link_post')}
                  </p>
                  <p className="text-xs text-amber-500 font-medium">
                    {t('Settings.expires_in', { time: fmtTime(tgSecondsLeft) })}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateTgCode}
                    disabled={isGeneratingCode}
                    className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline transition-colors"
                  >
                    {t('Settings.generate_new_code')}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <ArrowPathIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                    {t('Settings.no_active_code')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                    {t('Settings.generate_code_desc')}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateTgCode}
                    disabled={isGeneratingCode}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {isGeneratingCode ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    {t('Settings.generate_link_code')}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const tabContent: Record<SettingsTab, () => React.ReactNode> = {
    profile: renderProfile,
    security: renderSecurity,
    notifications: renderNotifications,
    billing: renderBilling,
    earn: renderEarnCredits,
    integrations: renderIntegrations,
    delete: renderDelete,
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      currentScreen={Screen.SETTINGS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="px-4 md:px-8 pb-8 pt-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
          {/* ── Left Settings Nav ── */}
          <nav className="w-full md:w-[250px] shrink-0">
            <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-gray-100 dark:border-gray-800 p-3 shadow-sm md:sticky md:top-6">
              <ul className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible hide-scrollbar">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <li
                      key={tab.id}
                      className={
                        tab.danger
                          ? 'md:mt-3 md:pt-3 md:border-t md:border-gray-100 md:dark:border-gray-800'
                          : ''
                      }
                    >
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                          isActive && !tab.danger
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : tab.danger
                              ? `text-red-500 dark:text-red-400 ${isActive ? 'bg-red-50 dark:bg-red-900/15' : 'hover:bg-red-50 dark:hover:bg-red-900/10'}`
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive && !tab.danger ? 'text-blue-600 dark:text-blue-400' : tab.danger ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}
                        />
                        <span className="hidden md:inline">{t(tab.labelKey)}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto hidden md:inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* ── Right Content ── */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t(TABS.find((tab) => tab.id === activeTab)?.labelKey ?? '')}
              </h2>
            </div>
            {tabContent[activeTab]()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
