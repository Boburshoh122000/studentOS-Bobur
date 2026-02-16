import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';

interface EducationEntry {
  school: string;
  degree: string;
  year: string;
  description: string;
}

interface WorkEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

const emptyEducation: EducationEntry = { school: '', degree: '', year: '', description: '' };
const emptyWork: WorkEntry = { company: '', role: '', duration: '', description: '' };

export default function ProfileSettings({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Portfolio data
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);

  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: authData } = await authApi.me();
      const { data: profileData } = await userApi.getProfile();
      const profile = profileData as any;

      if (profile) {
        setFullName(profile.fullName || (authData as any)?.profile?.fullName || '');
        setHeadline(profile.headline || '');
        setBio(profile.bio || '');
        setSkills(profile.skills || []);
        setGoals(profile.goals || []);
        setEducationHistory(
          Array.isArray(profile.educationHistory) ? profile.educationHistory : []
        );
        setWorkExperience(Array.isArray(profile.workExperience) ? profile.workExperience : []);
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Education handlers ────────────────────────────────────────────────────
  const addEducation = () => setEducationHistory((prev) => [...prev, { ...emptyEducation }]);
  const updateEducation = (index: number, field: keyof EducationEntry, value: string) =>
    setEducationHistory((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  const removeEducation = (index: number) =>
    setEducationHistory((prev) => prev.filter((_, i) => i !== index));

  // ─── Work Experience handlers ──────────────────────────────────────────────
  const addWork = () => setWorkExperience((prev) => [...prev, { ...emptyWork }]);
  const updateWork = (index: number, field: keyof WorkEntry, value: string) =>
    setWorkExperience((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)));
  const removeWork = (index: number) =>
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));

  // ─── Skills / Goals tag handlers ───────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkill('');
    }
  };
  const handleRemoveSkill = (s: string) => setSkills((prev) => prev.filter((x) => x !== s));

  const handleAddGoal = () => {
    const trimmed = newGoal.trim();
    if (trimmed && !goals.includes(trimmed)) {
      setGoals((prev) => [...prev, trimmed]);
      setNewGoal('');
    }
  };
  const handleRemoveGoal = (g: string) => setGoals((prev) => prev.filter((x) => x !== g));

  // ─── Initials ──────────────────────────────────────────────────────────────
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile({
        fullName,
        headline,
        bio,
        skills,
        goals,
        educationHistory,
        workExperience,
      });
      toast.success('Portfolio saved successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  // ─── Header ────────────────────────────────────────────────────────────────
  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_circle</span>
          My Portfolio
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Your professional profile visible to employers and recruiters.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-gray-500 text-sm">Loading portfolio...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentScreen={Screen.PROFILE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-background-dark">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ─── 1. Profile Header Card ──────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Banner */}
            <div className="h-40 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:20px_20px]" />
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="-mt-12 relative">
                  <div className="w-28 h-28 rounded-full bg-yellow-200 border-4 border-white dark:border-gray-900 flex items-center justify-center text-3xl font-bold text-yellow-800 shadow-md select-none">
                    {getInitials(fullName)}
                  </div>
                </div>

                {/* Name & Headline Inputs */}
                <div className="flex-1 mt-4 md:mt-2 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Junior Frontend Developer"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 2. About Me ─────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">About Me</h2>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Write a short professional summary about yourself..."
              rows={5}
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-700 dark:text-gray-200 leading-relaxed bg-white dark:bg-gray-800"
            />
            <p className="text-right text-xs text-gray-400 mt-2">{bio.length}/500 characters</p>
          </div>

          {/* ─── 3. Education ────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Education</h2>
            </div>

            <div className="space-y-4">
              {educationHistory.map((edu, i) => (
                <div
                  key={i}
                  className="relative p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 group"
                >
                  <button
                    onClick={() => removeEducation(i)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldInput
                      label="School / University"
                      value={edu.school}
                      onChange={(v) => updateEducation(i, 'school', v)}
                      placeholder="e.g. Stanford University"
                    />
                    <FieldInput
                      label="Degree / Major"
                      value={edu.degree}
                      onChange={(v) => updateEducation(i, 'degree', v)}
                      placeholder="e.g. B.S. Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldInput
                      label="Year"
                      value={edu.year}
                      onChange={(v) => updateEducation(i, 'year', v)}
                      placeholder="e.g. 2020 - 2024"
                    />
                    <FieldInput
                      label="Description (optional)"
                      value={edu.description}
                      onChange={(v) => updateEducation(i, 'description', v)}
                      placeholder="GPA, honors, etc."
                    />
                  </div>
                </div>
              ))}

              {/* Add Education Button */}
              <button
                type="button"
                onClick={addEducation}
                className="w-full group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-blue-600">
                    add
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    Add Education
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    University, Bootcamp, or Online Course
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* ─── 4. Experience & Projects ─────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">work</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Experience & Projects
              </h2>
            </div>

            <div className="space-y-4">
              {workExperience.map((work, i) => (
                <div
                  key={i}
                  className="relative p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 group"
                >
                  <button
                    onClick={() => removeWork(i)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldInput
                      label="Company"
                      value={work.company}
                      onChange={(v) => updateWork(i, 'company', v)}
                      placeholder="e.g. Google"
                    />
                    <FieldInput
                      label="Role / Position"
                      value={work.role}
                      onChange={(v) => updateWork(i, 'role', v)}
                      placeholder="e.g. Software Engineer Intern"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldInput
                      label="Duration"
                      value={work.duration}
                      onChange={(v) => updateWork(i, 'duration', v)}
                      placeholder="e.g. Jun 2023 - Sep 2023"
                    />
                    <FieldInput
                      label="Description"
                      value={work.description}
                      onChange={(v) => updateWork(i, 'description', v)}
                      placeholder="Key responsibilities..."
                    />
                  </div>
                </div>
              ))}

              {/* Add Experience Button */}
              <button
                type="button"
                onClick={addWork}
                className="w-full group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-gray-500 group-hover:text-blue-600">
                    add
                  </span>
                </div>
                <span className="block text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                  Add Experience
                </span>
              </button>
            </div>
          </div>

          {/* ─── 5. Skills & Interests ────────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Skills & Interests
              </h2>
            </div>

            <div className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Professional Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all"
                      placeholder="Add skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Interests / Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interests & Goals
                </label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      {goal}
                      <button
                        onClick={() => handleRemoveGoal(goal)}
                        className="text-purple-400 hover:text-purple-600"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all"
                      placeholder="Add interest..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                    />
                    <button
                      onClick={handleAddGoal}
                      className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Reusable Sub-components ─────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 text-gray-900 dark:text-white text-sm"
      />
    </div>
  );
}
