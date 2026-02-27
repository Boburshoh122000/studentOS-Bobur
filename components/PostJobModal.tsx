import React, { useState } from 'react';
import { jobApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import {
  ArrowUpTrayIcon,
  BriefcaseIcon,
  XMarkIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyName?: string;
}

type JobType = 'INTERNSHIP' | 'GRADUATE' | 'PART_TIME' | 'FULL_TIME';
type LocationType = 'REMOTE' | 'HYBRID' | 'ONSITE';
type CompensationType = 'PAID' | 'UNPAID' | 'STIPEND';
type SalaryPeriod = 'HOURLY' | 'MONTHLY' | 'YEARLY';

const JOB_TYPE_OPTIONS: { value: JobType; label: string; icon: string }[] = [
  { value: 'INTERNSHIP', label: 'Internship', icon: '🎓' },
  { value: 'GRADUATE', label: 'Graduate', icon: '🎯' },
  { value: 'PART_TIME', label: 'Part-time', icon: '⏰' },
  { value: 'FULL_TIME', label: 'Full-time', icon: '💼' },
];

const HOURS_OPTIONS = ['10-20', '20-30', '30-40', '40+'];

export default function PostJobModal({
  isOpen,
  onClose,
  onSuccess,
  companyName,
}: PostJobModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    jobType: 'INTERNSHIP' as JobType,
    department: '',
    location: '',
    locationType: 'ONSITE' as LocationType,
    description: '',
    requirements: '',
    // Internship-specific
    applicationDeadline: '',
    startDate: '',
    endDate: '',
    durationWeeks: '',
    hoursPerWeek: '' as string,
    compensationType: 'PAID' as CompensationType,
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'MONTHLY' as SalaryPeriod,
    currency: 'USD',
    skills: '' as string,
    learningGoals: [''] as string[],
    mentorName: '',
    mentorTitle: '',
    eligibilityYear: '',
  });

  const isInternship = formData.jobType === 'INTERNSHIP' || formData.jobType === 'GRADUATE';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLearningGoal = () => {
    setFormData((prev) => ({ ...prev, learningGoals: [...prev.learningGoals, ''] }));
  };

  const updateLearningGoal = (index: number, value: string) => {
    setFormData((prev) => {
      const goals = [...prev.learningGoals];
      goals[index] = value;
      return { ...prev, learningGoals: goals };
    });
  };

  const removeLearningGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }

    if (isInternship && !formData.applicationDeadline) {
      toast.error('Application deadline is required for internships');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        jobType: formData.jobType,
        department: formData.department || undefined,
        location: formData.location || undefined,
        locationType: formData.locationType,
        description: formData.description || undefined,
        requirements: formData.requirements
          ? formData.requirements.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
        company: companyName,
        skills: formData.skills
          ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      // Salary / compensation
      if (formData.salaryMin) payload.salaryMin = parseInt(formData.salaryMin);
      if (formData.salaryMax) payload.salaryMax = parseInt(formData.salaryMax);

      // Internship-specific fields
      if (isInternship) {
        payload.compensationType = formData.compensationType;
        payload.salaryPeriod = formData.salaryPeriod;
        payload.currency = formData.currency;
        if (formData.applicationDeadline)
          payload.applicationDeadline = new Date(formData.applicationDeadline).toISOString();
        if (formData.startDate)
          payload.startDate = new Date(formData.startDate).toISOString();
        if (formData.endDate)
          payload.endDate = new Date(formData.endDate).toISOString();
        if (formData.durationWeeks)
          payload.durationWeeks = parseInt(formData.durationWeeks);
        if (formData.hoursPerWeek) payload.hoursPerWeek = formData.hoursPerWeek;
        payload.learningGoals = formData.learningGoals.filter(Boolean);
        if (formData.mentorName) payload.mentorName = formData.mentorName;
        if (formData.mentorTitle) payload.mentorTitle = formData.mentorTitle;
        if (formData.eligibilityYear) payload.eligibilityYear = formData.eligibilityYear;
      }

      const { error } = await jobApi.createJob(payload);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success('Job posted successfully!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm';
  const labelClass = 'block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BriefcaseIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Post New Listing</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {companyName || 'Your company'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* ── Job Type Selector ── */}
            <div>
              <label className={labelClass}>Listing Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, jobType: opt.value }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.jobType === opt.value
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                      }`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Title ── */}
            <div>
              <label className={labelClass}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={isInternship ? 'e.g. Marketing Intern' : 'e.g. Senior Frontend Developer'}
                className={inputClass}
              />
            </div>

            {/* ── Department & Location ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Engineering" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco, CA" className={inputClass} />
              </div>
            </div>

            {/* ── Work Type ── */}
            <div>
              <label className={labelClass}>Work Format</label>
              <div className="flex gap-2">
                {(['ONSITE', 'HYBRID', 'REMOTE'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, locationType: type }))}
                    className={`flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${formData.locationType === type
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                      }`}
                  >
                    {type === 'ONSITE' ? '🏢 Onsite' : type === 'HYBRID' ? '🔄 Hybrid' : '🏠 Remote'}
                  </button>
                ))}
              </div>
            </div>

            {/* ══════════ INTERNSHIP-SPECIFIC SECTION ══════════ */}
            {isInternship && (
              <div className="space-y-5 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <AcademicCapIcon className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                    Internship Details
                  </h3>
                </div>

                {/* Deadline + Start Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <CalendarIcon className="w-4 h-4 inline mr-1 text-red-500" />
                      Application Deadline <span className="text-red-500">*</span>
                    </label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <CalendarIcon className="w-4 h-4 inline mr-1 text-green-500" />
                      Start Date
                    </label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} />
                  </div>
                </div>

                {/* Duration + Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      Duration (weeks)
                    </label>
                    <input type="number" name="durationWeeks" value={formData.durationWeeks} onChange={handleChange} placeholder="e.g. 12" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Hours / week</label>
                    <select name="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleChange} className={inputClass}>
                      <option value="">Select</option>
                      {HOURS_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h} hrs/week</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compensation */}
                <div>
                  <label className={labelClass}>
                    <CurrencyDollarIcon className="w-4 h-4 inline mr-1 text-green-600" />
                    Compensation
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(['PAID', 'UNPAID', 'STIPEND'] as const).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, compensationType: ct }))}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${formData.compensationType === ct
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {ct === 'PAID' ? '💰 Paid' : ct === 'UNPAID' ? '🆓 Unpaid' : '🎁 Stipend'}
                      </button>
                    ))}
                  </div>
                  {formData.compensationType !== 'UNPAID' && (
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} placeholder="Min" className={inputClass} />
                      <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} placeholder="Max" className={inputClass} />
                      <select name="salaryPeriod" value={formData.salaryPeriod} onChange={handleChange} className={inputClass}>
                        <option value="HOURLY">/ hour</option>
                        <option value="MONTHLY">/ month</option>
                        <option value="YEARLY">/ year</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Learning Goals */}
                <div>
                  <label className={labelClass}>What will the intern learn?</label>
                  <div className="space-y-2">
                    {formData.learningGoals.map((goal, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => updateLearningGoal(i, e.target.value)}
                          placeholder={`Learning goal ${i + 1}`}
                          className={inputClass}
                        />
                        {formData.learningGoals.length > 1 && (
                          <button type="button" onClick={() => removeLearningGoal(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addLearningGoal} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
                      <PlusIcon className="w-4 h-4" /> Add goal
                    </button>
                  </div>
                </div>

                {/* Mentor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Mentor Name</label>
                    <input type="text" name="mentorName" value={formData.mentorName} onChange={handleChange} placeholder="e.g. Jane Smith" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Mentor Title</label>
                    <input type="text" name="mentorTitle" value={formData.mentorTitle} onChange={handleChange} placeholder="e.g. Senior Engineer" className={inputClass} />
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <label className={labelClass}>Eligibility Year</label>
                  <input type="text" name="eligibilityYear" value={formData.eligibilityYear} onChange={handleChange} placeholder="e.g. 2nd year+" className={inputClass} />
                </div>
              </div>
            )}

            {/* ══════════ COMMON FIELDS ══════════ */}

            {/* Skills */}
            <div>
              <label className={labelClass}>Required Skills</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Python, Data Analysis (comma-separated)" className={inputClass} />
              <p className="mt-1 text-xs text-slate-500">Separate each skill with a comma</p>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe what makes this opportunity exciting..." rows={4} className={`${inputClass} resize-none`} />
            </div>

            {/* Requirements */}
            <div>
              <label className={labelClass}>Requirements</label>
              <textarea name="requirements" value={formData.requirements} onChange={handleChange} placeholder="2+ years React, Strong English, Portfolio required (comma-separated)" rows={3} className={`${inputClass} resize-none`} />
            </div>

            {/* Non-internship salary */}
            {!isInternship && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Minimum Salary ($/year)</label>
                  <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} placeholder="e.g. 50000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Maximum Salary ($/year)</label>
                  <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} placeholder="e.g. 80000" className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-[18px] h-[18px]" />
                  Post {formData.jobType === 'INTERNSHIP' ? 'Internship' : 'Job'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
