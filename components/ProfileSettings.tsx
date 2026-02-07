import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';

export default function ProfileSettings({ navigateTo }: NavigationProps) {
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    educationLevel: '',
    university: '',
    major: '',
    graduationYear: '',
    skills: [] as string[],
    goals: [] as string[],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: authData } = await authApi.me();
      const { data: profileData } = await userApi.getProfile();

      if (authData && profileData) {
        setFormData({
          fullName: profileData.fullName || authData.profile?.fullName || '',
          email: authData.email || '',
          educationLevel: profileData.educationLevel || '',
          university: profileData.university || '',
          major: profileData.major || '',
          graduationYear: profileData.graduationYear?.toString() || '',
          skills: profileData.skills || [],
          goals: profileData.goals || [],
        });
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }));
  };

  const handleAddInterest = () => {
    if (newInterest && !formData.goals.includes(newInterest)) {
      setFormData((prev) => ({ ...prev, goals: [...prev.goals, newInterest] }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setFormData((prev) => ({ ...prev, goals: prev.goals.filter((i) => i !== interestToRemove) }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile({
        fullName: formData.fullName,
        educationLevel: formData.educationLevel,
        university: formData.university,
        major: formData.major,
        graduationYear: parseInt(formData.graduationYear) || undefined,
        skills: formData.skills,
        goals: formData.goals,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const headerContent = (
    <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Profile Settings</h2>
        <p className="text-sm text-text-sub">
          Manage your personal information and account preferences.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary transition-colors shadow-sm">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">Loading profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentScreen={Screen.PROFILE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-y-auto px-8 pb-12 pt-6 bg-[#fafafa] dark:bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-8 lg:col-span-1">
              {/* Account Basics */}
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">
                  Account Basics
                </h3>
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group cursor-pointer">
                    <div
                      className="size-28 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-md transition-transform group-hover:scale-105"
                      style={{
                        backgroundImage:
                          "url('https://ui-avatars.com/api/?name=" +
                          (formData.fullName || 'User') +
                          "&background=random')",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        person
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                        mail
                      </span>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                        type="email"
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security - Placeholder for now */}
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Security</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      Current Password
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                      placeholder="••••••••"
                      type="password"
                    />
                  </div>
                  <button className="w-full mt-2 py-3 rounded-lg bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                    Update Password (Coming Soon)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column (Wider) */}
            <div className="space-y-8 lg:col-span-2">
              {/* Education */}
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-text-main dark:text-white">Education</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      School / University
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={formData.university}
                      onChange={(e) => handleChange('university', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      Major / Degree
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={formData.major}
                      onChange={(e) => handleChange('major', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">
                      Graduation Year
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none"
                      type="number"
                      placeholder="2025"
                      value={formData.graduationYear}
                      onChange={(e) => handleChange('graduationYear', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Interests & Skills */}
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">
                  Interests & Skills
                </h3>
                <div className="mb-8">
                  <label className="block text-xs font-bold text-text-sub uppercase mb-3 tracking-wider">
                    Professional Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="Add skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <button onClick={handleAddSkill} className="text-primary text-sm font-bold">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-sub uppercase mb-3 tracking-wider">
                    Interests (Goals)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.goals.map((interest) => (
                      <div
                        key={interest}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 group cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                      >
                        {interest}
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="px-2 py-1 text-sm border rounded"
                        placeholder="Add interest..."
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                      />
                      <button
                        onClick={handleAddInterest}
                        className="text-purple-600 text-sm font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {saving ? 'sync' : 'save'}
                  </span>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
