import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import { GlobalLoader } from './ui/GlobalLoader';
import DashboardLayout from './DashboardLayout';
import { User, Briefcase, GraduationCap, Bookmark, Mail, Building2 } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
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

type Tab = 'about' | 'work' | 'experience' | 'education';

/* ─── Icon helpers for Work Experience ────────────────── */
const companyColors: string[] = [
  'bg-red-50 text-red-500',
  'bg-blue-50 text-blue-500',
  'bg-green-50 text-green-500',
  'bg-purple-50 text-purple-500',
  'bg-amber-50 text-amber-500',
  'bg-pink-50 text-pink-500',
];

function getCompanyColor(index: number) {
  return companyColors[index % companyColors.length];
}

/* ═══════════════════════════════════════════════════════════ */
export default function UserProfile({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('about');

  // Profile data
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');

  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);

  const skills = [
    'Business',
    'Marketing',
    'Development',
    'Founder',
    'Mind',
    'Interface Design',
    'University',
    'Entrepreneur',
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: authData } = await authApi.me();
      const { data: profileData } = await userApi.getProfile();
      const p = profileData as Record<string, unknown>;
      const a = authData as Record<string, unknown>;

      if (p) {
        setFullName((p.fullName as string) || '');
        setHeadline((p.headline as string) || '');
        setBio((p.bio as string) || '');
        setEducationHistory(Array.isArray(p.educationHistory) ? p.educationHistory : []);
        setWorkExperience(Array.isArray(p.workExperience) ? p.workExperience : []);
      }
      if (a) {
        if (!fullName && a.profile) {
          const prof = a.profile as Record<string, string>;
          setFullName(prof.fullName || '');
          setAvatarUrl(prof.avatarUrl || '');
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  /* ─── Tab definitions ──────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <User size={14} /> },
    { id: 'work', label: 'Work', icon: <Briefcase size={14} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={14} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={14} /> },
  ];

  /* ─── Tab content renderers ───────────────────────────── */
  const renderAbout = () => (
    <div className="space-y-10">
      {/* Short Bio */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Short bio</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
          {bio ||
            'Once your resume is on Indeed, you can choose to make it "Public" or "Private." There are benefits to both options. When you make your resume public, it is visible to anyone.'}
        </p>

        {/* Skills pills */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Work Experience */}
      {workExperience.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Work experience</h2>
          <div className="space-y-8">
            {workExperience.map((w, i) => (
              <div key={i} className="flex gap-4">
                {/* Company icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getCompanyColor(i)}`}
                >
                  <Building2 size={18} />
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {w.role || 'Untitled Role'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {w.duration || ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {w.company || 'Company'}
                  </p>
                  {w.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {educationHistory.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
          <div className="space-y-8">
            {educationHistory.map((e, i) => (
              <div key={i} className="flex gap-4">
                {/* Edu icon */}
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {e.school || 'University'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {e.year || ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {e.degree || 'Degree'}
                  </p>
                  {e.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderWork = () => (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Work</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Portfolio and work samples will appear here.
      </p>
    </div>
  );

  const renderExperience = () => (
    <div>
      {workExperience.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Full Work Experience
          </h2>
          <div className="space-y-8">
            {workExperience.map((w, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getCompanyColor(i)}`}
                >
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {w.role || 'Untitled Role'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {w.duration || ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {w.company || 'Company'}
                  </p>
                  {w.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No experience entries yet.</p>
      )}
    </div>
  );

  const renderEducation = () => (
    <div>
      {educationHistory.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Education</h2>
          <div className="space-y-8">
            {educationHistory.map((e, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {e.school || 'University'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {e.year || ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {e.degree || 'Degree'}
                  </p>
                  {e.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No education entries yet.</p>
      )}
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    about: renderAbout(),
    work: renderWork(),
    experience: renderExperience(),
    education: renderEducation(),
  };

  /* ─── Loading ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <GlobalLoader fullScreen={false} />
      </DashboardLayout>
    );
  }

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {/* ═══ PROFILE HEADER ═══ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left — Avatar + Info */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-gray-100 dark:ring-gray-700">
                {getInitials(fullName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {fullName || 'Student User'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Briefcase size={14} className="text-gray-400" />
                {headline || 'Student'}
              </p>
            </div>
          </div>

          {/* Right — Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Bookmark size={15} />
              Save for later
            </button>
            <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              <Mail size={15} />
              Contact
            </button>
          </div>
        </div>

        {/* ═══ NAVIGATION TABS ═══ */}
        <div className="border-b border-gray-100 dark:border-gray-800 mt-8 mb-8">
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ TAB CONTENT ═══ */}
        {tabContent[activeTab]}
      </div>
    </DashboardLayout>
  );
}
