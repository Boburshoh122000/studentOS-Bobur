import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import ToolCard from './ToolCard';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  CheckIcon,
  GlobeAltIcon,
  SwatchIcon,
} from '@heroicons/react/24/solid';
import UniversityAutocomplete, { UniversityValue } from './UniversityAutocomplete';

type Role = 'student' | 'educator' | 'organization' | null;

const ROLES = [
  {
    id: 'student' as const,
    titleKey: 'Signup.student',
    descKey: 'Signup.student_desc',
    Icon: AcademicCapIcon,
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-600',
  },
  {
    id: 'educator' as const,
    titleKey: 'Signup.educator',
    descKey: 'Signup.educator_desc',
    Icon: BookOpenIcon,
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    lightText: 'text-emerald-600',
  },
  {
    id: 'organization' as const,
    titleKey: 'Signup.organization',
    descKey: 'Signup.organization_desc',
    Icon: BuildingOffice2Icon,
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-600',
  },
];

export default function SignUpStep2() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student fields
  const [university, setUniversity] = useState<UniversityValue>({ id: null, name: '' });
  const [major, setMajor] = useState('');

  // Educator fields
  const [institution, setInstitution] = useState<UniversityValue>({ id: null, name: '' });
  const [department, setDepartment] = useState('');

  // Organization fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    if (selectedRole === 'organization' && !companyName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = { role: selectedRole };

      if (selectedRole === 'student') {
        if (university.name) payload.university = university.name;
        if (university.id) (payload as any).universityId = university.id;
        if (major) payload.major = major;
      } else if (selectedRole === 'educator') {
        if (institution.name) payload.institution = institution.name;
        if (institution.id) (payload as any).institutionId = institution.id;
        if (department) payload.department = department;
      } else {
        payload.companyName = companyName;
        if (industry) payload.industry = industry;
        if (website) payload.website = website;
      }

      const { data, error } = await authApi.onboarding(payload as any);
      if (error) {
        toast.error(error);
        return;
      }

      // Save fresh tokens (onboarding returns new tokens with updated role)
      if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

      // Mark authenticated for route guards
      localStorage.setItem('wasAuthenticated', '1');

      // Refresh user context
      await refreshUser();

      toast.success('Profile setup complete!');
      navigate(data?.redirectTo || '/app', { replace: true });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel – Form */}
      <div className="w-full lg:w-[45%] min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col justify-between relative z-20 bg-white border-r border-slate-100">
        {/* Logo */}
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              StudentOS
            </span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              {t('Signup.welcome')}
            </h1>
            <p className="text-slate-500 text-sm mb-8">{t('Signup.select_role')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Cards */}
              <div className="space-y-3">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${role.gradient} shadow-md`}
                      >
                        <role.Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">
                          {t(role.titleKey)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{t(role.descKey)}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ─── Conditional Fields ─────────────────────────────── */}
              {selectedRole && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                  <div className="h-px bg-slate-200" />

                  {selectedRole === 'student' && (
                    <>
                      <div>
                        <UniversityAutocomplete
                          label={t('Signup.university')}
                          value={university}
                          onChange={setUniversity}
                          placeholder={t('Signup.search_university')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {t('Signup.field_of_study')}
                        </label>
                        <div className="relative">
                          <BookOpenIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === 'educator' && (
                    <>
                      <div>
                        <UniversityAutocomplete
                          label="University / Institution"
                          value={institution}
                          onChange={setInstitution}
                          placeholder="Search your institution…"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Department
                        </label>
                        <div className="relative">
                          <BuildingOffice2Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === 'organization' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <BuildingOffice2Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="e.g. Acme Corp"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Industry
                        </label>
                        <div className="relative">
                          <SwatchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="e.g. Technology"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Website URL
                        </label>
                        <div className="relative">
                          <GlobeAltIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedRole || isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('Common.loading')}
                  </>
                ) : (
                  <>
                    {t('Signup.continue')}
                    <ArrowRightIcon className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-xs text-slate-400">Terms • Privacy Policy • © 2026 StudentOS</p>
        </div>
      </div>

      {/* Right Panel – Marquee (matches AuthLayout) */}
      <div className="hidden lg:flex lg:w-[55%] h-screen relative overflow-hidden items-center justify-center perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-indigo-100/80 via-transparent to-purple-100/80 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pink-100 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-100 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-6 transform -rotate-12 scale-110 h-[150%] -translate-y-[10%]"
          style={{ perspective: '1000px' }}
        >
          <div className="flex flex-col gap-6 animate-marquee-up-slow">
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
          </div>
          <div className="flex flex-col gap-6 animate-marquee-down-slow">
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-orange-500"
            />
            <ToolCard
              type="plagiarism"
              title="OriginalityCheck"
              subtitle="Fully Authentic"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="Cover Letter Pro"
              subtitle="Stand Out Fast"
              color="bg-teal-500"
            />
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-orange-500"
            />
            <ToolCard
              type="plagiarism"
              title="OriginalityCheck"
              subtitle="Fully Authentic"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="Cover Letter Pro"
              subtitle="Stand Out Fast"
              color="bg-teal-500"
            />
          </div>
          <div className="flex flex-col gap-6 animate-marquee-up-slow">
            <ToolCard
              type="scholarship"
              title="$5,000 Grant"
              subtitle="Applied Successfully"
              color="bg-purple-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized"
              color="bg-indigo-500"
            />
            <ToolCard type="job" title="Job Finder" subtitle="Smart Matching" color="bg-cyan-500" />
            <ToolCard
              type="scholarship"
              title="$5,000 Grant"
              subtitle="Applied Successfully"
              color="bg-purple-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized"
              color="bg-indigo-500"
            />
            <ToolCard type="job" title="Job Finder" subtitle="Smart Matching" color="bg-cyan-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
