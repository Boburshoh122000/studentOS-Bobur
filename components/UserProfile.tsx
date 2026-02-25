import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import { GlobalLoader } from './ui/GlobalLoader';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';
import {
  User,
  Briefcase,
  GraduationCap,
  Bookmark,
  Mail,
  Building2,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  Award,
  Upload,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

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

interface CertificateEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  fileUrl: string;
  fileName: string;
}

type Tab = 'about' | 'experience' | 'education' | 'certificates';

/* ─── Helpers ────────────────────────────────────────────── */
const emptyEdu: EducationEntry = { school: '', degree: '', year: '', description: '' };
const emptyWork: WorkEntry = { company: '', role: '', duration: '', description: '' };
const emptyCert: CertificateEntry = {
  id: '',
  name: '',
  issuer: '',
  date: '',
  fileUrl: '',
  fileName: '',
};

const companyColors: string[] = [
  'bg-red-50 text-red-500 dark:bg-red-500/10',
  'bg-blue-50 text-blue-500 dark:bg-blue-500/10',
  'bg-green-50 text-green-500 dark:bg-green-500/10',
  'bg-purple-50 text-purple-500 dark:bg-purple-500/10',
  'bg-amber-50 text-amber-500 dark:bg-amber-500/10',
  'bg-pink-50 text-pink-500 dark:bg-pink-500/10',
];

function getCompanyColor(index: number) {
  return companyColors[index % companyColors.length];
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/* ═══════════════════════════════════════════════════════════ */
export default function UserProfile({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('about');

  // Profile data
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
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
        setSkills(Array.isArray(p.skills) ? p.skills : []);
        setEducationHistory(Array.isArray(p.educationHistory) ? p.educationHistory : []);
        setWorkExperience(Array.isArray(p.workExperience) ? p.workExperience : []);
        setCertificates(Array.isArray(p.certificates) ? p.certificates : []);
      }
      if (a && !fullName && a.profile) {
        const prof = a.profile as Record<string, string>;
        setFullName(prof.fullName || '');
        setAvatarUrl(prof.avatarUrl || '');
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  /* ─── Save ─────────────────────────────────────────────── */
  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateProfile({
        fullName,
        headline,
        bio,
        skills,
        educationHistory,
        workExperience,
        certificates,
      });
      toast.success('Profile saved!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Skill Helpers ────────────────────────────────────── */
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  /* ─── Education CRUD ─────────────────────────────────── */
  const addEducation = () => setEducationHistory([...educationHistory, { ...emptyEdu }]);
  const updateEducation = (i: number, field: keyof EducationEntry, val: string) => {
    const copy = [...educationHistory];
    copy[i] = { ...copy[i], [field]: val };
    setEducationHistory(copy);
  };
  const removeEducation = (i: number) =>
    setEducationHistory(educationHistory.filter((_, idx) => idx !== i));

  /* ─── Work CRUD ──────────────────────────────────────── */
  const addWork = () => setWorkExperience([...workExperience, { ...emptyWork }]);
  const updateWork = (i: number, field: keyof WorkEntry, val: string) => {
    const copy = [...workExperience];
    copy[i] = { ...copy[i], [field]: val };
    setWorkExperience(copy);
  };
  const removeWork = (i: number) => setWorkExperience(workExperience.filter((_, idx) => idx !== i));

  /* ─── Certificate CRUD ───────────────────────────────── */
  const addCertificate = () =>
    setCertificates([...certificates, { ...emptyCert, id: crypto.randomUUID() }]);
  const updateCertificate = (i: number, field: keyof CertificateEntry, val: string) => {
    const copy = [...certificates];
    copy[i] = { ...copy[i], [field]: val };
    setCertificates(copy);
  };
  const removeCertificate = (i: number) =>
    setCertificates(certificates.filter((_, idx) => idx !== i));

  const handleFileUpload = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be under 5MB');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, or PDF files are allowed');
      return;
    }

    // Convert to base64 data URI for storage
    const reader = new FileReader();
    reader.onload = () => {
      const copy = [...certificates];
      copy[i] = { ...copy[i], fileUrl: reader.result as string, fileName: file.name };
      setCertificates(copy);
      toast.success(`"${file.name}" attached`);
    };
    reader.readAsDataURL(file);
  };

  /* ─── Tab definitions ──────────────────────────────────── */
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <User size={14} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={14} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={14} /> },
    { id: 'certificates', label: 'Certificates', icon: <Award size={14} /> },
  ];

  /* ─── Input helper ─────────────────────────────────────── */
  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';
  const textareaCls = `${inputCls} resize-none`;

  /* ─── About tab ────────────────────────────────────────── */
  const renderAbout = () => (
    <div className="space-y-10">
      {/* Bio */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Short bio</h2>
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short professional summary..."
            className={textareaCls}
            rows={4}
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {bio || 'No bio added yet. Click Edit to add one.'}
          </p>
        )}
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
            >
              {skill}
              {isEditing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          {skills.length === 0 && !isEditing && (
            <p className="text-gray-400 text-sm">No skills added yet.</p>
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2 mt-3">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className={`${inputCls} flex-1`}
            />
            <button
              onClick={addSkill}
              className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition"
            >
              Add
            </button>
          </div>
        )}
      </section>
    </div>
  );

  /* ─── Experience tab ─────────────────────────────────── */
  const renderExperience = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
        {isEditing && (
          <button
            onClick={addWork}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {workExperience.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {isEditing ? 'Click "Add" to add your work experience.' : 'No experience added yet.'}
        </p>
      ) : (
        <div className="space-y-6">
          {workExperience.map((w, i) =>
            isEditing ? (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 relative"
              >
                <button
                  onClick={() => removeWork(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={w.role}
                    onChange={(e) => updateWork(i, 'role', e.target.value)}
                    placeholder="Role / Title"
                    className={inputCls}
                  />
                  <input
                    value={w.company}
                    onChange={(e) => updateWork(i, 'company', e.target.value)}
                    placeholder="Company"
                    className={inputCls}
                  />
                </div>
                <input
                  value={w.duration}
                  onChange={(e) => updateWork(i, 'duration', e.target.value)}
                  placeholder="Duration (e.g. 2022 – Present)"
                  className={inputCls}
                />
                <textarea
                  value={w.description}
                  onChange={(e) => updateWork(i, 'description', e.target.value)}
                  placeholder="Description..."
                  className={textareaCls}
                  rows={2}
                />
              </div>
            ) : (
              <div key={i} className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getCompanyColor(i)}`}
                >
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {w.role || 'Untitled Role'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {w.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {w.company || 'Company'}
                  </p>
                  {w.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  /* ─── Education tab ──────────────────────────────────── */
  const renderEducation = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
        {isEditing && (
          <button
            onClick={addEducation}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {educationHistory.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {isEditing ? 'Click "Add" to add your education.' : 'No education added yet.'}
        </p>
      ) : (
        <div className="space-y-6">
          {educationHistory.map((e, i) =>
            isEditing ? (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 relative"
              >
                <button
                  onClick={() => removeEducation(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={e.school}
                    onChange={(ev) => updateEducation(i, 'school', ev.target.value)}
                    placeholder="School / University"
                    className={inputCls}
                  />
                  <input
                    value={e.degree}
                    onChange={(ev) => updateEducation(i, 'degree', ev.target.value)}
                    placeholder="Degree"
                    className={inputCls}
                  />
                </div>
                <input
                  value={e.year}
                  onChange={(ev) => updateEducation(i, 'year', ev.target.value)}
                  placeholder="Year (e.g. 2020 – 2024)"
                  className={inputCls}
                />
                <textarea
                  value={e.description}
                  onChange={(ev) => updateEducation(i, 'description', ev.target.value)}
                  placeholder="Description..."
                  className={textareaCls}
                  rows={2}
                />
              </div>
            ) : (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <GraduationCap size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {e.school || 'University'}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-4 whitespace-nowrap">
                      {e.year}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {e.degree || 'Degree'}
                  </p>
                  {e.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {e.description}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  /* ─── Certificates tab ───────────────────────────────── */
  const renderCertificates = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certificates</h2>
        {isEditing && (
          <button
            onClick={addCertificate}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Award size={28} className="text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">
            {isEditing
              ? 'Click "Add" to upload your certificates.'
              : 'No certificates uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert, i) =>
            isEditing ? (
              <div
                key={cert.id || i}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3 relative"
              >
                <button
                  onClick={() => removeCertificate(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={cert.name}
                    onChange={(e) => updateCertificate(i, 'name', e.target.value)}
                    placeholder="Certificate Name"
                    className={inputCls}
                  />
                  <input
                    value={cert.issuer}
                    onChange={(e) => updateCertificate(i, 'issuer', e.target.value)}
                    placeholder="Issuing Organization"
                    className={inputCls}
                  />
                </div>
                <input
                  value={cert.date}
                  onChange={(e) => updateCertificate(i, 'date', e.target.value)}
                  placeholder="Date (e.g. March 2024)"
                  className={inputCls}
                />

                {/* File Upload */}
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileUpload(i, e)}
                    className="hidden"
                    id={`cert-file-${i}`}
                  />
                  <label
                    htmlFor={`cert-file-${i}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition"
                  >
                    <Upload size={16} />
                    {cert.fileName || 'Upload file (JPG, PNG, PDF · max 5MB)'}
                  </label>
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div
                key={cert.id || i}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  {cert.fileName?.endsWith('.pdf') ? (
                    <FileText size={18} />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {cert.name || 'Untitled Certificate'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {cert.issuer}
                    {cert.issuer && cert.date ? ' · ' : ''}
                    {cert.date}
                  </p>
                </div>
                {/* View link */}
                {cert.fileUrl && (
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary font-medium hover:underline opacity-0 group-hover:opacity-100 transition"
                  >
                    View
                  </a>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    about: renderAbout(),
    experience: renderExperience(),
    education: renderEducation(),
    certificates: renderCertificates(),
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
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className={`${inputCls} text-lg font-bold`}
                  />
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Headline (e.g. Frontend Developer)"
                    className={`${inputCls} text-sm`}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fullName || 'Student User'}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <Briefcase size={14} className="text-gray-400" />
                    {headline || 'Student'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right — Action Buttons */}
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <span className="animate-spin material-symbols-outlined text-[16px]">
                      progress_activity
                    </span>
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil size={15} /> Edit Profile
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Bookmark size={15} /> Save for later
                </button>
                <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  <Mail size={15} /> Contact
                </button>
              </>
            )}
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
