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
        <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_circle</span>
          My Portfolio
        </h2>
        <p className="text-sm text-text-sub">
          Your professional profile visible to employers and recruiters.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            <span className="text-text-sub text-sm">Loading portfolio...</span>
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
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12 pt-6 bg-[#fafafa] dark:bg-background-dark">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ─── Profile Header Card ─────────────────────────────────────── */}
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-blue-500 to-indigo-600" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col md:flex-row md:items-end gap-5">
                <div
                  className="size-24 rounded-2xl bg-gray-200 bg-cover bg-center border-4 border-white dark:border-gray-900 shadow-lg shrink-0"
                  style={{
                    backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=random&size=200')`,
                  }}
                />
                <div className="flex-1 space-y-3 pt-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="text-2xl font-bold text-text-main dark:text-white bg-transparent border-none outline-none w-full placeholder-gray-300 dark:placeholder-gray-600"
                  />
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Junior Frontend Developer • UX Enthusiast"
                    className="text-sm text-text-sub dark:text-gray-400 bg-transparent border-none outline-none w-full placeholder-gray-300 dark:placeholder-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── About Me ────────────────────────────────────────────────── */}
          <SectionCard title="About Me" icon="person">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short professional summary about yourself..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-text-main dark:text-white resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </SectionCard>

          {/* ─── Education ───────────────────────────────────────────────── */}
          <SectionCard title="Education" icon="school">
            <div className="space-y-4">
              {educationHistory.map((edu, i) => (
                <div
                  key={i}
                  className="relative p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-3 group"
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
              <AddButton label="Add Education" onClick={addEducation} />
            </div>
          </SectionCard>

          {/* ─── Work Experience ──────────────────────────────────────────── */}
          <SectionCard title="Work Experience" icon="work">
            <div className="space-y-4">
              {workExperience.map((work, i) => (
                <div
                  key={i}
                  className="relative p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-3 group"
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
              <AddButton label="Add Experience" onClick={addWork} />
            </div>
          </SectionCard>

          {/* ─── Skills & Interests ───────────────────────────────────────── */}
          <SectionCard title="Skills & Interests" icon="psychology">
            <div className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-text-sub uppercase mb-2 tracking-wider">
                  Professional Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg outline-none focus:border-primary text-text-main dark:text-white"
                      placeholder="Add skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="text-primary text-sm font-bold hover:text-primary-dark transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Interests / Goals */}
              <div>
                <label className="block text-xs font-bold text-text-sub uppercase mb-2 tracking-wider">
                  Interests & Goals
                </label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 group cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                    >
                      {goal}
                      <button
                        onClick={() => handleRemoveGoal(goal)}
                        className="text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg outline-none focus:border-primary text-text-main dark:text-white"
                      placeholder="Add interest..."
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                    />
                    <button
                      onClick={handleAddGoal}
                      className="text-purple-600 text-sm font-bold hover:text-purple-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Reusable Sub-components ─────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

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
      <label className="block text-xs font-medium text-text-sub dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-sm text-text-main dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
      />
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm font-medium hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined text-[18px]">add</span>
      {label}
    </button>
  );
}
