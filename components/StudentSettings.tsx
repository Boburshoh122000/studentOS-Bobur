import React, { useState, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { useCredits } from '../src/contexts/CreditContext';
import { userApi, authApi, creditsApi, notificationApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Copy,
  CreditCard,
  Gift,
  Loader2,
  MapPin,
  Pencil,
  Send,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'billing' | 'earn' | 'delete';

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
const TABS: { id: SettingsTab; label: string; icon: React.ElementType; danger?: boolean }[] = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'security', label: 'Password & Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'earn', label: 'Earn Credits', icon: Gift },
  { id: 'delete', label: 'Delete Account', icon: Trash2, danger: true },
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
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
      {loading ? 'Saving...' : 'Edit'}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function StudentSettings({ navigateTo }: NavigationProps) {
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
    if ((activeTab === 'billing' || activeTab === 'earn') && creditHistory.length === 0) fetchCreditData();
  }, [activeTab, notifications.length, creditHistory.length, fetchNotifications, fetchCreditData]);

  const initials = (profile.fullName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Profile Save ──
  const handleSaveProfile = async () => {
    const name = `${firstName} ${lastName}`.trim();
    if (!name) { toast.error('Name cannot be empty'); return; }
    setIsSavingProfile(true);
    try {
      const { error } = await userApi.updateProfile({
        fullName: name,
        bio: bio.trim() || undefined,
        country: country.trim() || undefined,
      });
      if (error) throw new Error(error);
      toast.success('Profile updated successfully!');
      setEditingSection(null);
      await Promise.all([fetchProfile(), refreshUser()]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password Change ──
  const handleChangePassword = async () => {
    if (!currentPassword) { toast.error('Please enter your current password'); return; }
    if (!newPassword || !confirmPassword) { toast.error('Please fill in both password fields'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsSavingPassword(true);
    try {
      const { error } = await authApi.changePassword({ currentPassword, newPassword });
      if (error) throw new Error(error);
      toast.success('Password updated successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
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
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  // ── Copy Referral Link ──
  const referralLink = `studentos.uz/ref/${referralCode || user?.email?.split('@')[0] || 'invite'}`;
  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralLink}`);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch { toast.error('Failed to copy link'); }
  };

  // ── Telegram Credits ──
  const handleClaimTelegram = async () => {
    setIsClaiming(true);
    try {
      window.open('https://t.me/studentos_channel', '_blank');
      const { data, error } = await userApi.claimTelegramCredits();
      if (error) { toast.error(error); return; }
      if (data) {
        toast.success('🎉 +50 Credits added!');
        setTelegramClaimed(true);
        await Promise.all([refreshUser(), refreshBalance()]);
      }
    } catch { toast.error('Failed to claim credits'); }
    finally { setIsClaiming(false); }
  };

  // ── Delete Account ──
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const { error } = await authApi.deleteAccount();
      if (error) throw new Error(error);
      toast.success('Account deleted. Goodbye!');
      await logout();
      navigateTo(Screen.LANDING);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Time helpers ──
  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ─── Header ────────────────────────────────────────────────────────
  const headerContent = (
    <header className="h-auto min-h-[4.5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-[#1e2330] border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, security, and preferences</p>
      </div>
    </header>
  );

  // Loading state
  if (isLoadingProfile) {
    return (
      <DashboardLayout currentScreen={Screen.SETTINGS} navigateTo={navigateTo} headerContent={headerContent}>
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
      <SettingsCard title="My Profile" action={<EditButton onClick={() => setEditingSection('personal')} />}>
        <div className="flex items-center gap-5">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.fullName || ''} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
              {initials}
            </div>
          )}
          <div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{profile.fullName || email}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.headline || (user?.role === 'STUDENT' ? 'Student' : user?.role || 'Member')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {profile.country || 'Not set'}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Personal Info */}
      <SettingsCard
        title="Personal Information"
        action={
          editingSection === 'personal' ? (
            <div className="flex gap-2">
              <button onClick={() => setEditingSection(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"><X size={16} /></button>
              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="flex items-center gap-1.5 text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
                {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save
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
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email Address</label>
              <input type="email" value={email} disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998-XX-XXX-XX-XX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <InfoField label="First Name" value={firstName} />
            <InfoField label="Last Name" value={lastName} />
            <InfoField label="Email Address" value={email} />
            <InfoField label="Phone" value={phone || '—'} />
            <div className="sm:col-span-2">
              <InfoField label="Bio" value={bio || '—'} />
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Address */}
      <SettingsCard title="Address" action={<EditButton onClick={() => setEditingSection(editingSection === 'address' ? null : 'address' as 'address')} />}>
        {editingSection === 'address' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">City/State</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Postal Code</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
                {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <InfoField label="Country" value={country || '—'} />
            <InfoField label="City/State" value={city || '—'} />
            <InfoField label="Postal Code" value={postalCode || '—'} />
          </div>
        )}
      </SettingsCard>
    </>
  );

  const renderSecurity = () => (
    <SettingsCard title="Change Password">
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
          <div className="relative">
            <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
          <div className="relative">
            <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
            <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
        </div>
        <div className="flex justify-end pt-3">
          <button onClick={handleChangePassword} disabled={isSavingPassword}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm">
            {isSavingPassword && <Loader2 size={16} className="animate-spin" />}
            {isSavingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </SettingsCard>
  );

  const renderNotifications = () => (
    <SettingsCard
      title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      action={unreadCount > 0 ? (
        <button onClick={handleMarkAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Mark all as read
        </button>
      ) : undefined}
    >
      {isLoadingNotifications ? (
        <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`flex items-start gap-3.5 px-1 py-4 first:pt-0 last:pb-0 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 -mx-2 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/15' : 'hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg'}`}
            >
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                {n.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">{timeAgo(n.createdAt)}</span>
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
        <p className="text-sm font-medium text-blue-100 mb-1">Available Balance</p>
        <p className="text-4xl font-bold tracking-tight">{balance} <span className="text-lg font-medium text-blue-200">Credits</span></p>
      </div>

      {/* Transaction History */}
      <SettingsCard title="Credit Usage History">
        {isLoadingHistory ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
        ) : creditHistory.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-1">
            {creditHistory.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <TrendingDown size={16} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.tool.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(t.usedAt)}</p>
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
    <SettingsCard title="Earn Free Credits">
      <div className="space-y-5">
        {/* Task 1: Invite Friends */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/15 dark:to-indigo-900/15 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center gap-2 mb-1.5">
            <Gift size={18} className="text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Invite Friends</h4>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">+50 Credits</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3.5">
            Invite a friend and get <strong>50 credits</strong> when they sign up.
          </p>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={referralLink} aria-label="Referral link"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 text-xs font-mono focus:outline-none truncate" />
            <button onClick={handleCopyReferral}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Task 2: Telegram */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/15 dark:to-cyan-900/15 rounded-xl p-5 border border-sky-100 dark:border-sky-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <svg className="w-[18px] h-[18px] text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Join Our Telegram</h4>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full">+20 Credits</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Join our official Telegram channel for <strong>20 free credits</strong>.</p>
            </div>
            <button onClick={handleClaimTelegram} disabled={isClaiming || telegramClaimed}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${telegramClaimed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-default' : 'bg-[#229ED9] text-white hover:bg-[#1e8ec5] disabled:opacity-50'}`}>
              {isClaiming ? (<><Loader2 size={16} className="animate-spin" /> Joining...</>) : telegramClaimed ? (<><CheckCircle size={16} /> Claimed!</>) : (<><Send size={16} /> Join Channel</>)}
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
          <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Delete Account</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">This action is irreversible</p>
        </div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 mb-5 border border-red-100 dark:border-red-900/30">
        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
          Once you delete your account, there is no going back. All of your data, credits, and progress will be permanently removed.
        </p>
      </div>
      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Type <strong className="text-red-600">DELETE</strong> to confirm
        </label>
        <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE"'
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all mb-4" />
        <button disabled={deleteConfirm !== 'DELETE' || isDeleting} onClick={handleDeleteAccount}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2">
          {isDeleting && <Loader2 size={16} className="animate-spin" />}
          {isDeleting ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  );

  const tabContent: Record<SettingsTab, () => React.ReactNode> = {
    profile: renderProfile,
    security: renderSecurity,
    notifications: renderNotifications,
    billing: renderBilling,
    earn: renderEarnCredits,
    delete: renderDelete,
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <DashboardLayout currentScreen={Screen.SETTINGS} navigateTo={navigateTo} headerContent={headerContent}>
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
                    <li key={tab.id} className={tab.danger ? 'md:mt-3 md:pt-3 md:border-t md:border-gray-100 md:dark:border-gray-800' : ''}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${isActive && !tab.danger
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : tab.danger
                              ? `text-red-500 dark:text-red-400 ${isActive ? 'bg-red-50 dark:bg-red-900/15' : 'hover:bg-red-50 dark:hover:bg-red-900/10'}`
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`}
                      >
                        <Icon size={18} className={isActive && !tab.danger ? 'text-blue-600 dark:text-blue-400' : tab.danger ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'} />
                        <span className="hidden md:inline">{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto hidden md:inline-flex w-5 h-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">{unreadCount}</span>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{TABS.find((t) => t.id === activeTab)?.label}</h2>
            </div>
            {tabContent[activeTab]()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
