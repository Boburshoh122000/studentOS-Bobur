import React, { useState, useEffect, useRef } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  CameraIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
  socialInstagram: string | null;
  socialTelegram: string | null;
  socialGithub: string | null;
  displayOrder: number;
  createdAt: string;
}

interface MemberForm {
  fullName: string;
  role: string;
  avatarUrl: string;
  socialLinkedin: string;
  socialTwitter: string;
  socialWebsite: string;
  socialInstagram: string;
  socialTelegram: string;
  socialGithub: string;
  displayOrder: number;
}

const emptyForm: MemberForm = {
  fullName: '',
  role: '',
  avatarUrl: '',
  socialLinkedin: '',
  socialTwitter: '',
  socialWebsite: '',
  socialInstagram: '',
  socialTelegram: '',
  socialGithub: '',
  displayOrder: 0,
};

/* ── Social platform definitions with brand SVG icons ── */
const SOCIAL_PLATFORMS = [
  {
    key: 'socialLinkedin' as const,
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    color: 'text-[#0A66C2]',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: 'socialInstagram' as const,
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    color: 'text-[#E4405F]',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
      </svg>
    ),
  },
  {
    key: 'socialTelegram' as const,
    label: 'Telegram',
    placeholder: 'https://t.me/username',
    color: 'text-[#26A5E4]',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: 'socialTwitter' as const,
    label: 'Twitter / X',
    placeholder: 'https://x.com/username',
    color: 'text-[#000000] dark:text-white',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    key: 'socialGithub' as const,
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    color: 'text-[#181717] dark:text-white',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    key: 'socialWebsite' as const,
    label: 'Website',
    placeholder: 'https://example.com',
    color: 'text-emerald-600',
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

export default function AdminTeam({ navigateTo }: NavigationProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminApi.getTeamMembers();
      if (error) {
        toast.error('Failed to load team');
      } else if (data) {
        setMembers(data as TeamMember[]);
      }
    } catch {
      toast.error('Network error');
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, displayOrder: members.length });
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      fullName: member.fullName,
      role: member.role,
      avatarUrl: member.avatarUrl || '',
      socialLinkedin: member.socialLinkedin || '',
      socialTwitter: member.socialTwitter || '',
      socialWebsite: member.socialWebsite || '',
      socialInstagram: member.socialInstagram || '',
      socialTelegram: member.socialTelegram || '',
      socialGithub: member.socialGithub || '',
      displayOrder: member.displayOrder,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowModal(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setAvatarFile(file);

    // Upload full-quality image to R2
    setIsUploading(true);
    try {
      const { data, error } = await adminApi.uploadTeamAvatar(file);
      if (error || !data?.url) {
        toast.error(error || 'Upload failed');
        setAvatarPreview(null);
        setAvatarFile(null);
      } else {
        // Store the CDN URL
        setForm((prev) => ({ ...prev, avatarUrl: data.url }));
        setAvatarPreview(data.url);
        toast.success('Image uploaded');
      }
    } catch {
      toast.error('Failed to upload image');
      setAvatarPreview(null);
      setAvatarFile(null);
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.role.trim()) {
      toast.error('Name and Role are required');
      return;
    }
    setIsSaving(true);
    try {
      // Use R2 URL if a new file was uploaded, otherwise keep existing URL
      const avatarUrl = avatarPreview || form.avatarUrl || undefined;

      const payload = {
        fullName: form.fullName,
        role: form.role,
        avatarUrl,
        socialLinkedin: form.socialLinkedin || undefined,
        socialTwitter: form.socialTwitter || undefined,
        socialWebsite: form.socialWebsite || undefined,
        socialInstagram: form.socialInstagram || undefined,
        socialTelegram: form.socialTelegram || undefined,
        socialGithub: form.socialGithub || undefined,
        displayOrder: form.displayOrder,
      };

      if (editingId) {
        const { error } = await adminApi.updateTeamMember(editingId, payload);
        if (error) {
          toast.error('Failed to update');
          return;
        }
        toast.success('Member updated');
      } else {
        const { error } = await adminApi.createTeamMember(payload);
        if (error) {
          toast.error('Failed to create');
          return;
        }
        toast.success('Member added');
      }
      setShowModal(false);
      await fetchMembers();
    } catch {
      toast.error('Save failed');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    try {
      const { error } = await adminApi.deleteTeamMember(id);
      if (error) {
        toast.error('Failed to delete');
        return;
      }
      toast.success('Member deleted');
      await fetchMembers();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Team Management
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Manage the team members displayed on your About page.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
          >
            <UserPlusIcon className="w-[18px] h-[18px]" />
            <span>Add Member</span>
          </button>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Members
              </p>
              <UsersIcon className="w-5 h-5 text-primary/60" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {members.length}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">With Avatar</p>
              <CameraIcon className="w-5 h-5 text-emerald-500/80" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {members.filter((m) => m.avatarUrl).length}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                With Social Links
              </p>
              <svg
                className="w-5 h-5 text-blue-500/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {members.filter((m) => SOCIAL_PLATFORMS.some((p) => m[p.key])).length}
            </p>
          </div>
        </section>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <GlobalLoader fullScreen={false} />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <UserPlusIcon className="w-10 h-10" />
              <p className="font-medium">No team members yet</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-primary hover:underline text-sm font-medium"
              >
                Add your first member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Order
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Member
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Social
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-500">
                          {member.displayOrder}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.fullName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {member.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {member.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-primary font-medium">{member.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {SOCIAL_PLATFORMS.map((p) => {
                            const val = member[p.key];
                            if (!val) return null;
                            return (
                              <a
                                key={p.key}
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${p.color} hover:opacity-70 transition-opacity`}
                                title={p.label}
                              >
                                {p.icon}
                              </a>
                            );
                          })}
                          {!SOCIAL_PLATFORMS.some((p) => member[p.key]) && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {members.length} members
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Member' : 'Add Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Upload avatar image"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="relative group h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                  title="Upload avatar"
                >
                  {avatarPreview || form.avatarUrl ? (
                    <img
                      src={avatarPreview || form.avatarUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CameraIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {avatarFile ? avatarFile.name : 'Click to upload photo'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Sarah Jenkins"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="CEO & Founder"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <p className="text-xs font-medium text-slate-500 uppercase">
                Social Links (optional)
              </p>
              <div className="space-y-3">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key} className="flex items-center gap-2">
                    <span className={`${platform.color} flex-shrink-0`} title={platform.label}>
                      {platform.icon}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                      {platform.label}
                    </span>
                    <input
                      type="url"
                      value={form[platform.key]}
                      onChange={(e) => setForm({ ...form, [platform.key]: e.target.value })}
                      placeholder={platform.placeholder}
                      className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-primary text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
