import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';
import { Save, Plus, GraduationCap, User, Briefcase } from 'lucide-react';

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

export default function ProfileSettings({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Data
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);

  // Initials helper
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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
        setEducationHistory(Array.isArray(p.educationHistory) ? p.educationHistory : []);
        setWorkExperience(Array.isArray(p.workExperience) ? p.workExperience : []);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile({
        fullName,
        headline,
        bio,
        educationHistory,
        workExperience,
      });
      toast.success('Portfolio saved successfully!');
    } catch {
      toast.error('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => setEducationHistory([...educationHistory, { ...emptyEdu }]);
  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEdu = [...educationHistory];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEducationHistory(newEdu);
  };
  const removeEducation = (index: number) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  // Work Helpers
  const addWork = () => setWorkExperience([...workExperience, { ...emptyWork }]);
  const updateWork = (index: number, field: keyof WorkEntry, value: string) => {
    const newWork = [...workExperience];
    newWork[index] = { ...newWork[index], [field]: value };
    setWorkExperience(newWork);
  };
  const removeWork = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  /* ─── Header Content for DashboardLayout ────────────────────────────────── */
  const headerContent = (
    <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-8 py-4 bg-white border-b border-gray-200">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Your professional profile visible to employers and recruiters.
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentScreen={Screen.PROFILE}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 1. Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Banner / Cover */}
            <div className="h-40 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 relative">
              <div className="absolute inset-0 opacity-20 pattern-grid-lg"></div>{' '}
              {/* Pattern effect if needed */}
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="-mt-12 relative">
                  <div className="w-28 h-28 rounded-full bg-yellow-200 border-4 border-white flex items-center justify-center text-3xl font-bold text-yellow-800 shadow-md">
                    {getInitials(fullName)}
                  </div>
                </div>

                {/* Basic Info Inputs */}
                <div className="flex-1 mt-4 md:mt-2 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Admin"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-semibold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Junior Frontend Developer"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. About Me Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <User size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">About Me</h2>
            </div>

            <textarea
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short professional summary about yourself..."
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-gray-700 leading-relaxed"
            ></textarea>
            <p className="text-right text-xs text-gray-400 mt-2">{bio.length}/500 characters</p>
          </div>

          {/* 3. Education Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <GraduationCap size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Education</h2>
            </div>

            <div className="space-y-4 mb-4">
              {educationHistory.map((edu, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group"
                >
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full font-medium"
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                    />
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    />
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Description (optional)"
                      value={edu.description}
                      onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <button
              onClick={addEducation}
              className="w-full group border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus size={20} className="text-gray-500 group-hover:text-blue-600" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  Add Education
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  University, Bootcamp, or Online Course
                </span>
              </div>
            </button>
          </div>

          {/* 4. Experience Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Briefcase size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Experience & Projects</h2>
            </div>

            <div className="space-y-4 mb-4">
              {workExperience.map((work, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group"
                >
                  <button
                    onClick={() => removeWork(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full font-medium"
                      placeholder="Company"
                      value={work.company}
                      onChange={(e) => updateWork(index, 'company', e.target.value)}
                    />
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Role"
                      value={work.role}
                      onChange={(e) => updateWork(index, 'role', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Duration"
                      value={work.duration}
                      onChange={(e) => updateWork(index, 'duration', e.target.value)}
                    />
                    <input
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-sm w-full"
                      placeholder="Description"
                      value={work.description}
                      onChange={(e) => updateWork(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addWork}
              className="w-full group border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Plus size={20} className="text-gray-500 group-hover:text-blue-600" />
              </div>
              <span className="block text-sm font-medium text-gray-900 group-hover:text-blue-700">
                Add Experience
              </span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
