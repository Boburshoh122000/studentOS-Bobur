import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { userApi, authApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import DashboardLayout from './DashboardLayout';

export default function StudentSettings({ navigateTo }: NavigationProps) {
  const { user, refreshUser } = useAuth();

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Credits state
  const [isClaiming, setIsClaiming] = useState(false);
  const [telegramClaimed, setTelegramClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.profile?.fullName || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // ── Profile Save ──
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error } = await userApi.updateProfile({ fullName: fullName.trim() });
      if (error) throw new Error(error);

      // If email changed, update email separately
      if (email !== user?.email && email.trim()) {
        const emailRes = await authApi.updateEmail({ newEmail: email.trim(), password: '' });
        if (emailRes.error) {
          toast.error(`Profile saved, but email update failed: ${emailRes.error}`);
        } else {
          toast.success('Profile and email updated!');
        }
      } else {
        toast.success('Profile updated successfully!');
      }
      await refreshUser();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Password Change ──
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSavingPassword(true);
    try {
      const { error } = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) throw new Error(error);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Copy Referral Link ──
  const handleCopyReferral = async () => {
    const link = `${window.location.origin}/ref/${user?.id || ''}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // ── Telegram Credits ──
  const handleClaimTelegram = async () => {
    setIsClaiming(true);
    try {
      // Open Telegram in new tab
      window.open('https://t.me/studentos_channel', '_blank');

      const { data, error } = await userApi.claimTelegramCredits();
      if (error) {
        toast.error(error);
        return;
      }
      if (data) {
        toast.success('🎉 +50 Credits added to your account!');
        setTelegramClaimed(true);
        await refreshUser();
      }
    } catch {
      toast.error('Failed to claim credits');
    } finally {
      setIsClaiming(false);
    }
  };

  const referralLink = `${window.location.origin}/ref/${user?.id || ''}`;

  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">settings</span>
          Settings
        </h2>
        <p className="text-sm text-text-sub">Manage your account, security, and earn credits</p>
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.SETTINGS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="px-4 md:px-8 pb-8 pt-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ── A. Profile & Account ── */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                Profile & Account
              </h3>
              <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                >
                  {isSavingProfile && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* ── B. Security ── */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-xl">shield</span>
                Security
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Change your password to keep your account safe
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword}
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
                >
                  {isSavingPassword && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>

          {/* ── C. Earn Credits & Referrals ── */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-xl">
                  monetization_on
                </span>
                Earn Credits & Referrals
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Get free credits by inviting friends and completing tasks
              </p>
            </div>
            <div className="p-6 space-y-5">
              {/* Referral Link */}
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/10 rounded-xl p-5 border border-primary/10 dark:border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">share</span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Invite Friends
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Share your unique referral link. When a friend signs up, you both earn credits!
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    aria-label="Referral link"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-mono focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyReferral}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Telegram Task */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Join Our Telegram
                      </h4>
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                        +50 Credits
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Join our Telegram channel to get <strong>50 free credits</strong> instantly!
                    </p>
                  </div>
                  <button
                    onClick={handleClaimTelegram}
                    disabled={isClaiming || telegramClaimed}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${
                      telegramClaimed
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 cursor-default'
                        : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
                    }`}
                  >
                    {isClaiming ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                        Claiming...
                      </>
                    ) : telegramClaimed ? (
                      <>
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Claimed!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                        Join Telegram
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
