import React, { useState, useEffect, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';

/* ─── Types ───────────────────────────────────────────────────────────────── */
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

const emptyEdu: EducationEntry = { school: '', degree: '', year: '', description: '' };
const emptyWork: WorkEntry = { company: '', role: '', duration: '', description: '' };

/* ─── Component ───────────────────────────────────────────────────────────── */
export default function ProfileSettings({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'education' | 'experience' | 'skills'>(
    'about'
  );

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [editingEdu, setEditingEdu] = useState<number | null>(null);
  const [editingWork, setEditingWork] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: authData } = await authApi.me();
      const { data: profileData } = await userApi.getProfile();
      const p = profileData as any;
      if (p) {
        setFullName(p.fullName || (authData as any)?.profile?.fullName || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setSkills(p.skills || []);
        setGoals(p.goals || []);
        setEducationHistory(Array.isArray(p.educationHistory) ? p.educationHistory : []);
        setWorkExperience(Array.isArray(p.workExperience) ? p.workExperience : []);
      }
    } catch {
      console.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Helpers ─────────────────────────────────────────────────────── */
  const initials = (name: string) => {
    if (!name) return 'U';
    const p = name.trim().split(/\s+/);
    return p.length >= 2
      ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const profileCompletion = () => {
    let filled = 0;
    const total = 5;
    if (fullName) filled++;
    if (headline) filled++;
    if (bio) filled++;
    if (skills.length > 0) filled++;
    if (educationHistory.length > 0 || workExperience.length > 0) filled++;
    return Math.round((filled / total) * 100);
  };

  /* Education */
  const addEdu = () => {
    setEducationHistory((p) => [...p, { ...emptyEdu }]);
    setEditingEdu(educationHistory.length);
  };
  const updateEdu = (i: number, f: keyof EducationEntry, v: string) =>
    setEducationHistory((p) => p.map((e, idx) => (idx === i ? { ...e, [f]: v } : e)));
  const removeEdu = (i: number) => {
    setEducationHistory((p) => p.filter((_, idx) => idx !== i));
    setEditingEdu(null);
  };

  /* Work */
  const addWork = () => {
    setWorkExperience((p) => [...p, { ...emptyWork }]);
    setEditingWork(workExperience.length);
  };
  const updateWork = (i: number, f: keyof WorkEntry, v: string) =>
    setWorkExperience((p) => p.map((e, idx) => (idx === i ? { ...e, [f]: v } : e)));
  const removeWork = (i: number) => {
    setWorkExperience((p) => p.filter((_, idx) => idx !== i));
    setEditingWork(null);
  };

  /* Tags */
  const addSkill = () => {
    const t = newSkill.trim();
    if (t && !skills.includes(t)) setSkills((p) => [...p, t]);
    setNewSkill('');
  };
  const addGoal = () => {
    const t = newGoal.trim();
    if (t && !goals.includes(t)) setGoals((p) => [...p, t]);
    setNewGoal('');
  };

  /* Save */
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
      toast.success('Portfolio saved!');
    } catch {
      toast.error('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const pct = profileCompletion();

  /* ─── Tabs ─────────────────────────────────────────────────────── */
  const tabs = [
    { key: 'about' as const, label: 'About', icon: 'person' },
    { key: 'education' as const, label: 'Education', icon: 'school' },
    { key: 'experience' as const, label: 'Experience', icon: 'work' },
    { key: 'skills' as const, label: 'Skills', icon: 'psychology' },
  ];

  /* ─── Header ─────────────────────────────────────────────────────── */
  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolio</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your professional profile for employers and recruiters.
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </header>
  );

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading portfolio...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <DashboardLayout
      currentScreen={Screen.PROFILE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ══════════════════════════════════════════════════════════
                LEFT COLUMN — Profile Summary Card (sticky on desktop)
            ══════════════════════════════════════════════════════════ */}
            <div className="lg:w-80 lg:shrink-0 lg:sticky lg:top-0 lg:self-start space-y-4">
              {/* Profile Card */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Mini banner */}
                <div className="h-24 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-500 to-indigo-600" />
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                      <defs>
                        <pattern
                          id="dots"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <circle cx="2" cy="2" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                  </div>
                </div>

                <div className="px-5 pb-5 -mt-10">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-300 border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center text-xl font-bold text-amber-800 select-none mx-auto mb-3">
                    {initials(fullName)}
                  </div>

                  {/* Name — click to edit */}
                  <div className="text-center mb-4">
                    {editingName ? (
                      <input
                        ref={nameRef}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onBlur={() => setEditingName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                        className="text-lg font-bold text-center w-full border-b-2 border-primary bg-transparent outline-none text-gray-900 dark:text-white pb-0.5"
                      />
                    ) : (
                      <h3
                        onClick={() => setEditingName(true)}
                        className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary transition-colors"
                      >
                        {fullName || 'Your Name'}
                        <span className="material-symbols-outlined text-[14px] text-gray-400 ml-1 align-middle">
                          edit
                        </span>
                      </h3>
                    )}
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Add your headline..."
                      className="mt-1 text-sm text-center w-full bg-transparent outline-none text-gray-500 dark:text-gray-400 placeholder-gray-400 focus:text-gray-700 dark:focus:text-gray-300 border-b border-transparent focus:border-gray-300 dark:focus:border-gray-600 transition-all"
                    />
                  </div>

                  {/* Profile Completion Ring */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-200 dark:text-gray-700"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className={
                              pct >= 80
                                ? 'text-green-500'
                                : pct >= 50
                                  ? 'text-amber-500'
                                  : 'text-red-400'
                            }
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${pct}, 100`}
                            strokeLinecap="round"
                            strokeWidth="3"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Profile Strength
                        </p>
                        <p className="text-xs text-gray-500">
                          {pct < 100
                            ? 'Complete your profile to stand out'
                            : 'Your profile is complete!'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2.5">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {skills.length}
                      </p>
                      <p className="text-[10px] font-medium text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider">
                        Skills
                      </p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg py-2.5">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {educationHistory.length}
                      </p>
                      <p className="text-[10px] font-medium text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-wider">
                        Education
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg py-2.5">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {workExperience.length}
                      </p>
                      <p className="text-[10px] font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">
                        Experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Preview on Sidebar */}
              {skills.length > 0 && (
                <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">code</span>
                    Top Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 8).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {s}
                      </span>
                    ))}
                    {skills.length > 8 && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        +{skills.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT COLUMN — Tabbed Content
            ══════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0">
              {/* Tab Navigation */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4 p-1.5 flex gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-7">
                {/* ─── About ───────────────────────────────────────── */}
                {activeTab === 'about' && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          About Me
                        </h3>
                        <span className="text-xs text-gray-400 tabular-nums">
                          {bio.length} / 500
                        </span>
                      </div>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 500))}
                        placeholder="Tell employers about yourself — your background, goals, and what makes you unique..."
                        rows={7}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 resize-none text-sm text-gray-800 dark:text-gray-200 leading-relaxed placeholder-gray-400"
                      />
                    </div>

                    {/* Interests & Goals */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Interests & Goals
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {goals.map((g) => (
                          <span
                            key={g}
                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30"
                          >
                            {g}
                            <button
                              onClick={() => setGoals((p) => p.filter((x) => x !== g))}
                              className="rounded p-0.5 hover:bg-purple-200/50 dark:hover:bg-purple-700/30 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[12px]">close</span>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 dark:text-white"
                          placeholder="Add interest or goal..."
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                        />
                        <button
                          onClick={addGoal}
                          className="px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Education ────────────────────────────────────── */}
                {activeTab === 'education' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Education</h3>
                      <button
                        onClick={addEdu}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Add
                      </button>
                    </div>

                    {educationHistory.length === 0 ? (
                      <EmptyState
                        icon="school"
                        title="No education added yet"
                        description="Add your university, bootcamp, or courses"
                        onAdd={addEdu}
                      />
                    ) : (
                      educationHistory.map((edu, i) => (
                        <div
                          key={i}
                          className="group rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-all duration-200 overflow-hidden"
                        >
                          {editingEdu !== i ? (
                            <div
                              className="flex items-start gap-4 p-4 cursor-pointer"
                              onClick={() => setEditingEdu(i)}
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                                  school
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {edu.degree || 'Untitled'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {edu.school}
                                </p>
                                {edu.year && (
                                  <p className="text-xs text-gray-400 mt-0.5">{edu.year}</p>
                                )}
                                {edu.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <ActionBtn
                                  icon="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEdu(i);
                                  }}
                                />
                                <ActionBtn
                                  icon="delete"
                                  danger
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeEdu(i);
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <EditPanel
                              label="Edit Education"
                              onDone={() => setEditingEdu(null)}
                              onDelete={() => removeEdu(i)}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SmallInput
                                  label="School"
                                  value={edu.school}
                                  onChange={(v) => updateEdu(i, 'school', v)}
                                  placeholder="e.g. Stanford University"
                                />
                                <SmallInput
                                  label="Degree"
                                  value={edu.degree}
                                  onChange={(v) => updateEdu(i, 'degree', v)}
                                  placeholder="e.g. B.S. Computer Science"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <SmallInput
                                  label="Year"
                                  value={edu.year}
                                  onChange={(v) => updateEdu(i, 'year', v)}
                                  placeholder="e.g. 2020 – 2024"
                                />
                                <SmallInput
                                  label="Description"
                                  value={edu.description}
                                  onChange={(v) => updateEdu(i, 'description', v)}
                                  placeholder="GPA, honors..."
                                />
                              </div>
                            </EditPanel>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ─── Experience ───────────────────────────────────── */}
                {activeTab === 'experience' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Experience & Projects
                      </h3>
                      <button
                        onClick={addWork}
                        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Add
                      </button>
                    </div>

                    {workExperience.length === 0 ? (
                      <EmptyState
                        icon="work"
                        title="No experience added yet"
                        description="Add your work, internships, or projects"
                        onAdd={addWork}
                      />
                    ) : (
                      workExperience.map((w, i) => (
                        <div
                          key={i}
                          className="group rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-all duration-200 overflow-hidden"
                        >
                          {editingWork !== i ? (
                            <div
                              className="flex items-start gap-4 p-4 cursor-pointer"
                              onClick={() => setEditingWork(i)}
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px]">
                                  work
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {w.role || 'Untitled'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {w.company}
                                </p>
                                {w.duration && (
                                  <p className="text-xs text-gray-400 mt-0.5">{w.duration}</p>
                                )}
                                {w.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {w.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <ActionBtn
                                  icon="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingWork(i);
                                  }}
                                />
                                <ActionBtn
                                  icon="delete"
                                  danger
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeWork(i);
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <EditPanel
                              label="Edit Experience"
                              onDone={() => setEditingWork(null)}
                              onDelete={() => removeWork(i)}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SmallInput
                                  label="Company"
                                  value={w.company}
                                  onChange={(v) => updateWork(i, 'company', v)}
                                  placeholder="e.g. Google"
                                />
                                <SmallInput
                                  label="Role"
                                  value={w.role}
                                  onChange={(v) => updateWork(i, 'role', v)}
                                  placeholder="e.g. Software Engineer"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <SmallInput
                                  label="Duration"
                                  value={w.duration}
                                  onChange={(v) => updateWork(i, 'duration', v)}
                                  placeholder="e.g. Jun – Sep 2023"
                                />
                                <SmallInput
                                  label="Description"
                                  value={w.description}
                                  onChange={(v) => updateWork(i, 'description', v)}
                                  placeholder="Key achievements..."
                                />
                              </div>
                            </EditPanel>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ─── Skills ──────────────────────────────────────── */}
                {activeTab === 'skills' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Professional Skills
                      </h3>
                      <p className="text-xs text-gray-500 mb-4">
                        Add skills that describe your expertise. These are visible to recruiters.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            {s}
                            <button
                              onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                              className="rounded p-0.5 hover:bg-blue-200/50 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px] text-blue-400">
                                close
                              </span>
                            </button>
                          </span>
                        ))}
                        {skills.length === 0 && (
                          <p className="text-sm text-gray-400 italic">No skills added yet</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 dark:text-white"
                          placeholder="Type a skill and press Enter..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button
                          onClick={addSkill}
                          className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Suggested Skills */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Suggested Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'JavaScript',
                          'React',
                          'Python',
                          'TypeScript',
                          'Node.js',
                          'Figma',
                          'SQL',
                          'Git',
                        ]
                          .filter((s) => !skills.includes(s))
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => setSkills((p) => [...p, s])}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                            >
                              + {s}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function EmptyState({
  icon,
  title,
  description,
  onAdd,
}: {
  icon: string;
  title: string;
  description: string;
  onAdd: () => void;
}) {
  return (
    <button
      onClick={onAdd}
      className="w-full group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-200 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[24px] transition-colors">
          {icon}
        </span>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
    </button>
  );
}

function ActionBtn({
  icon,
  onClick,
  danger,
}: {
  icon: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
        danger
          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-400 hover:text-primary hover:bg-primary/10'
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
    </button>
  );
}

function EditPanel({
  label,
  onDone,
  onDelete,
  children,
}: {
  label: string;
  onDone: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 border-l-4 border-primary bg-primary/[0.02] dark:bg-primary/[0.04]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{label}</span>
        <div className="flex gap-1">
          <button
            onClick={onDone}
            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function SmallInput({
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
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-gray-900 dark:text-white placeholder-gray-400"
      />
    </div>
  );
}
