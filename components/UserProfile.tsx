import React, { useState, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi, authApi } from '../src/services/api';
import { GlobalLoader } from './ui/GlobalLoader';
import DashboardLayout from './DashboardLayout';
import toast from 'react-hot-toast';
import {
  Briefcase,
  GraduationCap,
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
  Check,
  Download,
  Eye,
  Share2,
  Zap,
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

/* ─── Constants ──────────────────────────────────────────── */
const emptyEdu: EducationEntry = { school: '', degree: '', year: '', description: '' };
const emptyWork: WorkEntry = { company: '', role: '', duration: '', description: '' };

const companyColors = [
  'bg-red-50 text-red-500 dark:bg-red-500/10',
  'bg-blue-50 text-blue-500 dark:bg-blue-500/10',
  'bg-green-50 text-green-500 dark:bg-green-500/10',
  'bg-purple-50 text-purple-500 dark:bg-purple-500/10',
  'bg-amber-50 text-amber-500 dark:bg-amber-500/10',
  'bg-pink-50 text-pink-500 dark:bg-pink-500/10',
];
const getColor = (i: number) => companyColors[i % companyColors.length];
const MAX_FILE = 5 * 1024 * 1024;

/* ─── Reusable styling ───────────────────────────────────── */
const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition';
const textareaCls = `${inputCls} resize-none`;
const cardCls =
  'bg-white dark:bg-[#1a1f2e] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm';
const actionBtnCls =
  'p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition';
const saveBtnCls =
  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50';
const cancelBtnCls =
  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition';

/* ═══════════════════════════════════════════════════════════ */
export default function UserProfile({ navigateTo }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  /* ── Per-section edit states ───────────────────────────── */
  const [editingBio, setEditingBio] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [addingWork, setAddingWork] = useState(false);
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [addingCert, setAddingCert] = useState(false);
  const [viewingCert, setViewingCert] = useState<CertificateEntry | null>(null);

  /* ── Profile data ──────────────────────────────────────── */
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);

  /* ── Draft states for new items ────────────────────────── */
  const [draftWork, setDraftWork] = useState<WorkEntry>({ ...emptyWork });
  const [draftEdu, setDraftEdu] = useState<EducationEntry>({ ...emptyEdu });
  const [draftCert, setDraftCert] = useState<CertificateEntry>({
    id: '',
    name: '',
    issuer: '',
    date: '',
    fileUrl: '',
    fileName: '',
  });

  /* ── Fetch ─────────────────────────────────────────────── */
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
      if (a && a.profile) {
        const prof = a.profile as Record<string, string>;
        if (!fullName) setFullName(prof.fullName || '');
        setAvatarUrl(prof.avatarUrl || '');
      }
    } catch {
      /* silent */
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

  /* ── Persist helper ────────────────────────────────────── */
  const persist = async (section: string, data: Record<string, unknown>) => {
    try {
      setSaving(section);
      await userApi.updateProfile(data);
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(null);
    }
  };

  /* ── Section saves ─────────────────────────────────────── */
  const saveHeader = () => {
    persist('header', { fullName, headline });
    setEditingHeader(false);
  };
  const saveBio = () => {
    persist('bio', { bio });
    setEditingBio(false);
  };
  const saveSkills = () => {
    persist('skills', { skills });
    setEditingSkills(false);
  };

  // Work
  const confirmAddWork = () => {
    const updated = [...workExperience, draftWork];
    setWorkExperience(updated);
    persist('work', { workExperience: updated });
    setDraftWork({ ...emptyWork });
    setAddingWork(false);
  };
  const saveEditWork = (i: number) => {
    persist('work', { workExperience });
    setEditingWorkIdx(null);
  };
  const updateWork = (i: number, field: keyof WorkEntry, val: string) => {
    const copy = [...workExperience];
    copy[i] = { ...copy[i], [field]: val };
    setWorkExperience(copy);
  };
  const deleteWork = (i: number) => {
    const updated = workExperience.filter((_, idx) => idx !== i);
    setWorkExperience(updated);
    persist('work', { workExperience: updated });
  };

  // Education
  const confirmAddEdu = () => {
    const updated = [...educationHistory, draftEdu];
    setEducationHistory(updated);
    persist('edu', { educationHistory: updated });
    setDraftEdu({ ...emptyEdu });
    setAddingEdu(false);
  };
  const saveEditEdu = (i: number) => {
    persist('edu', { educationHistory });
    setEditingEduIdx(null);
  };
  const updateEdu = (i: number, field: keyof EducationEntry, val: string) => {
    const copy = [...educationHistory];
    copy[i] = { ...copy[i], [field]: val };
    setEducationHistory(copy);
  };
  const deleteEdu = (i: number) => {
    const updated = educationHistory.filter((_, idx) => idx !== i);
    setEducationHistory(updated);
    persist('edu', { educationHistory: updated });
  };

  // Certificates
  const confirmAddCert = () => {
    const entry = { ...draftCert, id: crypto.randomUUID() };
    const updated = [...certificates, entry];
    setCertificates(updated);
    persist('cert', { certificates: updated });
    setDraftCert({ id: '', name: '', issuer: '', date: '', fileUrl: '', fileName: '' });
    setAddingCert(false);
  };
  const deleteCert = (i: number) => {
    const updated = certificates.filter((_, idx) => idx !== i);
    setCertificates(updated);
    persist('cert', { certificates: updated });
  };
  const handleCertFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE) {
      toast.error('File must be under 5 MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, or PDF');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraftCert((prev) => ({ ...prev, fileUrl: reader.result as string, fileName: file.name }));
      toast.success(`"${file.name}" attached`);
    };
    reader.readAsDataURL(file);
  };

  // Skills
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
        <GlobalLoader fullScreen={false} />
      </DashboardLayout>
    );
  }

  /* ══════════════════════════════════════════════════════════
     R E N D E R
     ══════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout currentScreen={Screen.PROFILE} navigateTo={navigateTo}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ LEFT COLUMN — Main Content ═══ */}
          <div className="lg:col-span-2 space-y-5">
            {/* ═══ HEADER CARD ═══ */}
            <div className={cardCls}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-gray-100 dark:ring-gray-700">
                      {getInitials(fullName)}
                    </div>
                  )}
                  {editingHeader ? (
                    <div className="space-y-2 flex-1">
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className={`${inputCls} font-bold`}
                      />
                      <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Headline"
                        className={inputCls}
                      />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {fullName || 'Your Name'}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Briefcase size={13} className="text-gray-400" />
                        {headline || 'Add a headline'}
                      </p>
                    </div>
                  )}
                </div>
                {editingHeader ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingHeader(false);
                        fetchProfile();
                      }}
                      className={cancelBtnCls}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveHeader} disabled={saving === 'header'} className={saveBtnCls}>
                      <Save size={14} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingHeader(true)} className={actionBtnCls} title="Edit">
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ═══ ABOUT ME ═══ */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">About Me</h2>
                {editingBio ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBio(false);
                        fetchProfile();
                      }}
                      className={cancelBtnCls}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveBio} disabled={saving === 'bio'} className={saveBtnCls}>
                      <Save size={14} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingBio(true)} className={actionBtnCls}>
                    <Pencil size={16} />
                  </button>
                )}
              </div>
              {editingBio ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short professional summary..."
                  className={textareaCls}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {bio || (
                    <span className="italic text-gray-400">
                      No bio yet — click the pencil to add one.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* ═══ SKILLS ═══ */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Skills</h2>
                {editingSkills ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSkills(false);
                        fetchProfile();
                      }}
                      className={cancelBtnCls}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={saveSkills} disabled={saving === 'skills'} className={saveBtnCls}>
                      <Save size={14} /> Save
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingSkills(true)} className={actionBtnCls}>
                    <Pencil size={16} />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    {s}
                    {editingSkills && (
                      <button
                        onClick={() => removeSkill(s)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {skills.length === 0 && !editingSkills && (
                  <p className="text-sm text-gray-400 italic">No skills added yet.</p>
                )}
              </div>
              {editingSkills && (
                <div className="flex gap-2 mt-3">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter..."
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
            </div>

            {/* ═══ WORK EXPERIENCE ═══ */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Work Experience</h2>
                {!addingWork && editingWorkIdx === null && (
                  <button
                    onClick={() => {
                      setAddingWork(true);
                      setDraftWork({ ...emptyWork });
                    }}
                    className={actionBtnCls}
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              {/* Existing items */}
              <div className="space-y-4">
                {workExperience.map((w, i) =>
                  editingWorkIdx === i ? (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={w.role}
                          onChange={(e) => updateWork(i, 'role', e.target.value)}
                          placeholder="Role"
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
                        placeholder="Duration"
                        className={inputCls}
                      />
                      <textarea
                        value={w.description}
                        onChange={(e) => updateWork(i, 'description', e.target.value)}
                        placeholder="Description"
                        className={textareaCls}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingWorkIdx(null)} className={cancelBtnCls}>
                          <X size={14} /> Cancel
                        </button>
                        <button
                          onClick={() => saveEditWork(i)}
                          disabled={saving === 'work'}
                          className={saveBtnCls}
                        >
                          <Check size={14} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-4 group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(i)}`}
                      >
                        <Building2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {w.role || 'Untitled'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{w.company}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 font-medium mr-2">{w.duration}</span>
                            <button
                              onClick={() => setEditingWorkIdx(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 rounded transition"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteWork(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {w.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                            {w.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
                {workExperience.length === 0 && !addingWork && (
                  <p className="text-sm text-gray-400 italic">No work experience yet.</p>
                )}
              </div>

              {/* Add new form */}
              {addingWork && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={draftWork.role}
                      onChange={(e) => setDraftWork({ ...draftWork, role: e.target.value })}
                      placeholder="Role / Title"
                      className={inputCls}
                    />
                    <input
                      value={draftWork.company}
                      onChange={(e) => setDraftWork({ ...draftWork, company: e.target.value })}
                      placeholder="Company"
                      className={inputCls}
                    />
                  </div>
                  <input
                    value={draftWork.duration}
                    onChange={(e) => setDraftWork({ ...draftWork, duration: e.target.value })}
                    placeholder="Duration (e.g. 2022 – Present)"
                    className={inputCls}
                  />
                  <textarea
                    value={draftWork.description}
                    onChange={(e) => setDraftWork({ ...draftWork, description: e.target.value })}
                    placeholder="Description..."
                    className={textareaCls}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingWork(false)} className={cancelBtnCls}>
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={confirmAddWork}
                      disabled={saving === 'work'}
                      className={saveBtnCls}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ EDUCATION ═══ */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Education</h2>
                {!addingEdu && editingEduIdx === null && (
                  <button
                    onClick={() => {
                      setAddingEdu(true);
                      setDraftEdu({ ...emptyEdu });
                    }}
                    className={actionBtnCls}
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {educationHistory.map((ed, i) =>
                  editingEduIdx === i ? (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={ed.school}
                          onChange={(e) => updateEdu(i, 'school', e.target.value)}
                          placeholder="School"
                          className={inputCls}
                        />
                        <input
                          value={ed.degree}
                          onChange={(e) => updateEdu(i, 'degree', e.target.value)}
                          placeholder="Degree"
                          className={inputCls}
                        />
                      </div>
                      <input
                        value={ed.year}
                        onChange={(e) => updateEdu(i, 'year', e.target.value)}
                        placeholder="Year"
                        className={inputCls}
                      />
                      <textarea
                        value={ed.description}
                        onChange={(e) => updateEdu(i, 'description', e.target.value)}
                        placeholder="Description"
                        className={textareaCls}
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingEduIdx(null)} className={cancelBtnCls}>
                          <X size={14} /> Cancel
                        </button>
                        <button
                          onClick={() => saveEditEdu(i)}
                          disabled={saving === 'edu'}
                          className={saveBtnCls}
                        >
                          <Check size={14} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <GraduationCap size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                              {ed.school || 'University'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{ed.degree}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 font-medium mr-2">{ed.year}</span>
                            <button
                              onClick={() => setEditingEduIdx(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600 rounded transition"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => deleteEdu(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {ed.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
                            {ed.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
                {educationHistory.length === 0 && !addingEdu && (
                  <p className="text-sm text-gray-400 italic">No education added yet.</p>
                )}
              </div>

              {addingEdu && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={draftEdu.school}
                      onChange={(e) => setDraftEdu({ ...draftEdu, school: e.target.value })}
                      placeholder="School / University"
                      className={inputCls}
                    />
                    <input
                      value={draftEdu.degree}
                      onChange={(e) => setDraftEdu({ ...draftEdu, degree: e.target.value })}
                      placeholder="Degree"
                      className={inputCls}
                    />
                  </div>
                  <input
                    value={draftEdu.year}
                    onChange={(e) => setDraftEdu({ ...draftEdu, year: e.target.value })}
                    placeholder="Year (e.g. 2020 – 2024)"
                    className={inputCls}
                  />
                  <textarea
                    value={draftEdu.description}
                    onChange={(e) => setDraftEdu({ ...draftEdu, description: e.target.value })}
                    placeholder="Description..."
                    className={textareaCls}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingEdu(false)} className={cancelBtnCls}>
                      <X size={14} /> Cancel
                    </button>
                    <button onClick={confirmAddEdu} disabled={saving === 'edu'} className={saveBtnCls}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ CERTIFICATES ═══ */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Certificates</h2>
                {!addingCert && (
                  <button
                    onClick={() => {
                      setAddingCert(true);
                      setDraftCert({
                        id: '',
                        name: '',
                        issuer: '',
                        date: '',
                        fileUrl: '',
                        fileName: '',
                      });
                    }}
                    className={actionBtnCls}
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>

              {certificates.length === 0 && !addingCert && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                    <Award size={24} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400 italic">No certificates uploaded yet.</p>
                </div>
              )}

              <div className="space-y-3">
                {certificates.map((cert, i) => (
                  <div
                    key={cert.id || i}
                    className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      {cert.fileName?.endsWith('.pdf') ? (
                        <FileText size={18} />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {cert.name || 'Certificate'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {cert.issuer}
                        {cert.issuer && cert.date ? ' · ' : ''}
                        {cert.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {cert.fileUrl && (
                        <button
                          onClick={() => setViewingCert(cert)}
                          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline mr-2 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Eye size={13} /> View
                        </button>
                      )}
                      <button
                        onClick={() => deleteCert(i)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {addingCert && (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={draftCert.name}
                      onChange={(e) => setDraftCert({ ...draftCert, name: e.target.value })}
                      placeholder="Certificate Name"
                      className={inputCls}
                    />
                    <input
                      value={draftCert.issuer}
                      onChange={(e) => setDraftCert({ ...draftCert, issuer: e.target.value })}
                      placeholder="Issuing Organization"
                      className={inputCls}
                    />
                  </div>
                  <input
                    value={draftCert.date}
                    onChange={(e) => setDraftCert({ ...draftCert, date: e.target.value })}
                    placeholder="Date (e.g. March 2024)"
                    className={inputCls}
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleCertFile}
                      className="hidden"
                      id="cert-upload"
                    />
                    <label
                      htmlFor="cert-upload"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-primary hover:text-primary cursor-pointer transition"
                    >
                      <Upload size={16} />
                      {draftCert.fileName || 'Upload file (JPG, PNG, PDF · max 5 MB)'}
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingCert(false)} className={cancelBtnCls}>
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={confirmAddCert}
                      disabled={saving === 'cert' || !draftCert.name}
                      className={saveBtnCls}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT COLUMN — Side Panel ═══ */}
          <div className="space-y-5">
            {/* Profile Strength */}
            <div className={cardCls}>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Profile Strength</h3>
              {(() => {
                const sections = [
                  { label: 'Name & Headline', done: !!(fullName && headline) },
                  { label: 'About Me', done: !!bio },
                  { label: 'Skills', done: skills.length > 0 },
                  { label: 'Work Experience', done: workExperience.length > 0 },
                  { label: 'Education', done: educationHistory.length > 0 },
                  { label: 'Certificates', done: certificates.length > 0 },
                ];
                const completed = sections.filter(s => s.done).length;
                const pct = Math.round((completed / sections.length) * 100);
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (pct / 100) * circumference;
                return (
                  <>
                    <div className="flex justify-center mb-5">
                      <div className="relative size-28">
                        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-100 dark:text-gray-800" />
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="text-primary transition-all duration-700" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{pct}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {sections.map((s) => (
                        <div key={s.label} className="flex items-center gap-2.5">
                          <div className={`size-5 rounded-full flex items-center justify-center text-white text-[10px] ${s.done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            {s.done && <Check size={12} />}
                          </div>
                          <span className={`text-sm ${s.done ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Quick Actions */}
            <div className={cardCls}>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Profile link copied!');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Share2 size={16} className="text-primary" />
                  Share Profile
                </button>
                <button
                  onClick={() => navigateTo(Screen.CV_BUILDER)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <FileText size={16} className="text-primary" />
                  Build CV from Profile
                </button>
                <button
                  onClick={() => navigateTo(Screen.SETTINGS)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <Zap size={16} className="text-primary" />
                  Account Settings
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10 p-5">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={14} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Pro Tip</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Complete all profile sections to stand out to employers. Profiles with 100% completion get 3× more visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ MEDIA VIEWER MODAL ═══ */}
      {viewingCert && (
        <div className="fixed inset-0 z-[100] flex" onClick={() => setViewingCert(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative flex w-full h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setViewingCert(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
            >
              <X size={20} />
            </button>

            {/* Left — Media Preview */}
            <div className="flex-1 flex items-center justify-center p-6 bg-black/40">
              {viewingCert.fileName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewingCert.fileUrl}
                  className="w-full max-w-2xl h-[80vh] rounded-lg border-0"
                  title={viewingCert.name}
                />
              ) : (
                <img
                  src={viewingCert.fileUrl}
                  alt={viewingCert.name}
                  className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
                />
              )}
            </div>

            {/* Right — Details Panel */}
            <div className="w-80 bg-white dark:bg-[#1a1f2e] border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Media</h2>
                <button
                  onClick={() => setViewingCert(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Details */}
              <div className="px-5 py-5 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {viewingCert.name || 'Certificate'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{viewingCert.issuer}</p>
                  </div>
                </div>

                {viewingCert.date && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Date
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{viewingCert.date}</p>
                  </div>
                )}

                {viewingCert.fileName && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      File
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {viewingCert.fileName}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <a
                  href={viewingCert.fileUrl}
                  download={viewingCert.fileName || 'certificate'}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
