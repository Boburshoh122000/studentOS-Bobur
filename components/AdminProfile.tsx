import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { authApi, userApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';
import { AcademicCapIcon, BellIcon, BriefcaseIcon, CheckIcon, CreditCardIcon, DocumentTextIcon, EnvelopeIcon, InformationCircleIcon, LockClosedIcon, ShieldCheckIcon, Squares2X2Icon, UserIcon, UsersIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ProfileData {
  id: string;
  email: string;
  role: string;
  profile: {
    fullName?: string;
    avatarUrl?: string;
    companyName?: string;
    logoUrl?: string;
  } | null;
}

export default function AdminProfile({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Email form state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fetch current user data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.me();
        if (response.data) {
          const data = response.data as ProfileData;
          setProfileData(data);
          setFullName(data.profile?.fullName || data.profile?.companyName || '');
          setAvatarUrl(data.profile?.avatarUrl || data.profile?.logoUrl || '');
          setNewEmail(data.email);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);

    // For now, convert to base64 data URL (in production, upload to storage)
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setIsUploadingAvatar(false);
      toast.success('Avatar updated! Click "Save Changes" to apply.');
    };
    reader.onerror = () => {
      toast.error('Failed to process image');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await userApi.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl || null,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Update email
  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!emailPassword) {
      toast.error('Password is required to confirm email change');
      return;
    }

    if (newEmail === profileData?.email) {
      toast.error('New email is the same as current email');
      return;
    }

    setIsSavingEmail(true);
    try {
      const response = await authApi.updateEmail({
        newEmail: newEmail.trim(),
        password: emailPassword,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Email updated successfully');
        setEmailPassword('');
        setProfileData((prev) => (prev ? { ...prev, email: newEmail.trim() } : null));
      }
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    if (newPassword.length < 10) {
      toast.error('Password must be at least 10 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Password updated successfully. Please log in again.');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Redirect to login after a short delay
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigateTo(Screen.SIGN_IN);
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 relative z-20`}
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
          aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div
              className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
              onClick={() => navigateTo(Screen.LANDING)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">
                  StudentOS
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Admin Console
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => navigateTo(Screen.ADMIN_DASHBOARD)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Dashboard' : ''}
              >
                <Squares2X2Icon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Employers' : ''}
              >
                <BriefcaseIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Employers</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_PRICING)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Pricing' : ''}
              >
                <CreditCardIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Pricing</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_USERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Users' : ''}
              >
                <UsersIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Users</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Scholarships' : ''}
              >
                <AcademicCapIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_BLOG)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Blog Management' : ''}
              >
                <DocumentTextIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Blog Management</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_ROLES)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Roles & Permissions' : ''}
              >
                <ShieldCheckIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_NOTIFICATIONS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Notifications' : ''}
              >
                <BellIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Notifications</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_TEAM)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Team Management' : ''}
              >
                <UsersIcon className="w-5 h-5" />
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Team Management</span>
                )}
              </button>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            {/* Profile section - now clickable and highlighted */}
            <button
              onClick={() => navigateTo(Screen.ADMIN_SETTINGS)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg bg-primary/10 dark:bg-primary/20 transition-colors cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
            >
              {avatarUrl ? (
                <div
                  className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center border-2 border-primary"
                  style={{ backgroundImage: `url('${avatarUrl}')` }}
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                  {fullName ? getInitials(fullName) : 'AD'}
                </div>
              )}
              <div
                className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap text-left">
                  {fullName || 'Admin'}
                </p>
                <p className="text-xs text-primary dark:text-primary-light whitespace-nowrap text-left">
                  Profile Settings
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${!isSidebarExpanded ? 'justify-center' : 'justify-center'} ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!isSidebarExpanded ? 'Logout' : ''}
            >
              <span className="material-symbols-outlined text-lg">
                {isLoggingOut ? 'hourglass_empty' : 'logout'}
              </span>
              {isSidebarExpanded && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-4xl px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Profile Settings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your account settings and security preferences.
            </p>
          </header>

          {isLoading ? (
            <div className="space-y-6">
              {/* Loading skeleton */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm animate-pulse">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="space-y-4">
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Public Profile Section */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Public Profile
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        {avatarUrl ? (
                          <div
                            className="h-24 w-24 rounded-full bg-cover bg-center border-4 border-slate-200 dark:border-slate-700"
                            style={{ backgroundImage: `url('${avatarUrl}')` }}
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-200 dark:border-slate-700">
                            {fullName ? getInitials(fullName) : 'AD'}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary-dark text-white p-1.5 rounded-full shadow-lg transition-colors disabled:opacity-50"
                          aria-label="Change photo"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isUploadingAvatar ? 'sync' : 'photo_camera'}
                          </span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          aria-label="Upload avatar"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        JPG, PNG or GIF
                        <br />
                        Max 2MB
                      </p>
                    </div>

                    {/* Name Field */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111421] py-2.5 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSavingProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <>
                              <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckIcon className="w-[18px] h-[18px]" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Settings Section */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-primary" />
                    Security Settings
                  </h3>
                </div>
                <div className="p-6 space-y-8">
                  {/* Email Update */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Email Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          New Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111421] py-2.5 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="emailPassword"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Confirm Password
                        </label>
                        <input
                          id="emailPassword"
                          type="password"
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111421] py-2.5 px-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleUpdateEmail}
                        disabled={isSavingEmail || newEmail === profileData?.email}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSavingEmail ? (
                          <>
                            <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <EnvelopeIcon className="w-[18px] h-[18px]" />
                            Update Email
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-200 dark:border-slate-700" />

                  {/* Password Change */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Change Password
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111421] py-2.5 pl-4 pr-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {showCurrentPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              id="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Min 10 characters"
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111421] py-2.5 pl-4 pr-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {showNewPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Confirm New Password
                          </label>
                          <input
                            id="confirmPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`w-full rounded-lg border ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-primary/50 focus:border-primary'} bg-white dark:bg-[#111421] py-2.5 px-4 text-sm text-slate-900 dark:text-white outline-none transition-colors`}
                          />
                          {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <InformationCircleIcon className="w-[18px] h-[18px] text-amber-600 dark:text-amber-400" />
                          <div className="text-xs text-amber-800 dark:text-amber-300">
                            <p className="font-medium mb-1">Password Requirements:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              <li>At least 10 characters</li>
                              <li>At least one uppercase letter</li>
                              <li>At least one number</li>
                              <li>At least one special character</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={
                          isSavingPassword ||
                          !currentPassword ||
                          !newPassword ||
                          newPassword !== confirmPassword
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isSavingPassword ? (
                          <>
                            <ArrowPathIcon className="w-[18px] h-[18px] animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="w-[18px] h-[18px]" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
