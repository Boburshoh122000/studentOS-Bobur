import React, { useState, useEffect } from 'react';
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

const emptyEducation: EducationEntry = { school: '', degree: '', year: '', description: '' };
const emptyWork: WorkEntry = { company: '', role: '', duration: '', description: '' };

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function ProfileSettings({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Editing states: index being edited, null = not editing
  const [editingEdu, setEditingEdu] = useState<number | null>(null);
  const [editingWork, setEditingWork] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

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
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Helpers ─────────────────────────────────────────────────────────────── */
  const initials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  /* Education */
  const addEducation = () => {
    setEducationHistory((prev) => [...prev, { ...emptyEducation }]);
    setEditingEdu(educationHistory.length);
  };
  const updateEducation = (i: number, f: keyof EducationEntry, v: string) =>
    setEducationHistory((prev) => prev.map((e, idx) => (idx === i ? { ...e, [f]: v } : e)));
  const removeEducation = (i: number) => {
    setEducationHistory((prev) => prev.filter((_, idx) => idx !== i));
    setEditingEdu(null);
  };

  /* Work */
  const addWork = () => {
    setWorkExperience((prev) => [...prev, { ...emptyWork }]);
    setEditingWork(workExperience.length);
  };
  const updateWork = (i: number, f: keyof WorkEntry, v: string) =>
    setWorkExperience((prev) => prev.map((e, idx) => (idx === i ? { ...e, [f]: v } : e)));
  const removeWork = (i: number) => {
    setWorkExperience((prev) => prev.filter((_, idx) => idx !== i));
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

  /* ─── Header Bar ─────────────────────────────────────────────────────────── */
  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolio</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your professional profile visible to employers and recruiters.
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </header>
  );

  /* ─── Loading ────────────────────────────────────────────────────────────── */
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

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <DashboardLayout
      currentScreen={Screen.PROFILE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* ═════════════════════════════════════════════════════════════════
                1.  PROFILE HEADER — Banner + Avatar + Name + Headline
            ═════════════════════════════════════════════════════════════════ */}
            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Banner */}
              <div className="h-36 md:h-44 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-500 to-indigo-600" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
                {/* Faint decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
              </div>

              <div className="px-6 md:px-8 pb-6 md:pb-8">
                <div className="flex flex-col md:flex-row items-start gap-5 md:gap-6">
                  {/* Avatar */}
                  <div className="-mt-14 md:-mt-16 relative z-10 shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-300 border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center text-2xl md:text-3xl font-bold text-amber-800 select-none">
                      {initials(fullName)}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 w-full mt-2 md:mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Full Name"
                        value={fullName}
                        onChange={setFullName}
                        placeholder="e.g. John Doe"
                        bold
                      />
                      <InputField
                        label="Headline"
                        value={headline}
                        onChange={setHeadline}
                        placeholder="e.g. Junior Frontend Developer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
                2.  ABOUT ME
            ═════════════════════════════════════════════════════════════════ */}
            <SectionCard icon="person" title="About Me">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Write a short professional summary about yourself, your ambitions, and what you bring to the table..."
                rows={5}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 resize-none text-sm text-gray-800 dark:text-gray-200 leading-relaxed placeholder-gray-400"
              />
              <div className="flex justify-end mt-1.5">
                <span className="text-xs text-gray-400 tabular-nums">{bio.length} / 500</span>
              </div>
            </SectionCard>

            {/* ═════════════════════════════════════════════════════════════════
                3.  EDUCATION
            ═════════════════════════════════════════════════════════════════ */}
            <SectionCard icon="school" title="Education">
              <div className="space-y-3">
                {educationHistory.map((edu, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:border-primary/30 transition-all duration-200"
                  >
                    {/* Collapsed view */}
                    {editingEdu !== i ? (
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() => setEditingEdu(i)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">
                            school
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {edu.degree || edu.school || 'Untitled Education'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {[edu.school, edu.year].filter(Boolean).join(' · ') || 'Click to edit'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEdu(i);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeEducation(i);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Expanded edit */
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Edit Education
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingEdu(null)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button
                              onClick={() => removeEducation(i)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InputField
                            label="School / University"
                            value={edu.school}
                            onChange={(v) => updateEducation(i, 'school', v)}
                            placeholder="e.g. Stanford University"
                          />
                          <InputField
                            label="Degree / Major"
                            value={edu.degree}
                            onChange={(v) => updateEducation(i, 'degree', v)}
                            placeholder="e.g. B.S. Computer Science"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InputField
                            label="Year"
                            value={edu.year}
                            onChange={(v) => updateEducation(i, 'year', v)}
                            placeholder="e.g. 2020 – 2024"
                          />
                          <InputField
                            label="Description"
                            value={edu.description}
                            onChange={(v) => updateEducation(i, 'description', v)}
                            placeholder="GPA, honors, relevant coursework..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add button */}
                <button
                  type="button"
                  onClick={addEducation}
                  className="w-full group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 hover:bg-primary/[0.03] dark:hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[20px] transition-colors">
                      add
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      Add Education
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      University, Bootcamp, or Online Course
                    </span>
                  </div>
                </button>
              </div>
            </SectionCard>

            {/* ═════════════════════════════════════════════════════════════════
                4.  EXPERIENCE & PROJECTS
            ═════════════════════════════════════════════════════════════════ */}
            <SectionCard icon="work" title="Experience & Projects">
              <div className="space-y-3">
                {workExperience.map((work, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 hover:border-primary/30 transition-all duration-200"
                  >
                    {editingWork !== i ? (
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer"
                        onClick={() => setEditingWork(i)}
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px]">
                            work
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {work.role || work.company || 'Untitled Experience'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {[work.company, work.duration].filter(Boolean).join(' · ') ||
                              'Click to edit'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingWork(i);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWork(i);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Edit Experience
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingWork(null)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button
                              onClick={() => removeWork(i)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InputField
                            label="Company"
                            value={work.company}
                            onChange={(v) => updateWork(i, 'company', v)}
                            placeholder="e.g. Google"
                          />
                          <InputField
                            label="Role / Position"
                            value={work.role}
                            onChange={(v) => updateWork(i, 'role', v)}
                            placeholder="e.g. Software Engineer Intern"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <InputField
                            label="Duration"
                            value={work.duration}
                            onChange={(v) => updateWork(i, 'duration', v)}
                            placeholder="e.g. Jun 2023 – Sep 2023"
                          />
                          <InputField
                            label="Description"
                            value={work.description}
                            onChange={(v) => updateWork(i, 'description', v)}
                            placeholder="Key achievements and responsibilities..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addWork}
                  className="w-full group border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-2.5 hover:border-primary/50 hover:bg-primary/[0.03] dark:hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-[20px] transition-colors">
                      add
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                    Add Experience
                  </span>
                </button>
              </div>
            </SectionCard>

            {/* ═════════════════════════════════════════════════════════════════
                5.  SKILLS
            ═════════════════════════════════════════════════════════════════ */}
            <SectionCard icon="code" title="Skills">
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                  >
                    {s}
                    <button
                      onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                      className="rounded p-0.5 hover:bg-blue-200/50 dark:hover:bg-blue-700/30 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] text-blue-500">
                        close
                      </span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-900 dark:text-white"
                  placeholder="Type a skill and press Enter..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </SectionCard>

            {/* ═════════════════════════════════════════════════════════════════
                6.  INTERESTS & GOALS
            ═════════════════════════════════════════════════════════════════ */}
            <SectionCard icon="interests" title="Interests & Goals">
              <div className="flex flex-wrap gap-2 mb-3">
                {goals.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors duration-150"
                  >
                    {g}
                    <button
                      onClick={() => setGoals((p) => p.filter((x) => x !== g))}
                      className="rounded p-0.5 hover:bg-purple-200/50 dark:hover:bg-purple-700/30 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] text-purple-500">
                        close
                      </span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-900 dark:text-white"
                  placeholder="Type an interest and press Enter..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                />
                <button
                  onClick={addGoal}
                  className="px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-7">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  bold,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  bold?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 text-sm text-gray-900 dark:text-white placeholder-gray-400 ${bold ? 'font-semibold' : ''}`}
      />
    </div>
  );
}
