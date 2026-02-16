import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
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
  displayOrder: number;
}

const emptyForm: MemberForm = {
  fullName: '',
  role: '',
  avatarUrl: '',
  socialLinkedin: '',
  socialTwitter: '',
  socialWebsite: '',
  displayOrder: 0,
};

export default function AdminTeam({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

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
      displayOrder: member.displayOrder,
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarToStorage = async (file: File): Promise<string | null> => {
    const { data, error } = await adminApi.uploadTeamAvatar(file);

    if (error || !data?.url) {
      console.error('Upload error:', error);
      toast.error(error || 'Failed to upload image');
      return null;
    }

    return data.url;
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.role.trim()) {
      toast.error('Name and Role are required');
      return;
    }
    setIsSaving(true);
    try {
      let avatarUrl = form.avatarUrl || undefined;

      // Upload avatar file if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatarToStorage(avatarFile);
        if (!uploadedUrl) {
          setIsSaving(false);
          return;
        }
        avatarUrl = uploadedUrl;
      }

      const payload = {
        fullName: form.fullName,
        role: form.role,
        avatarUrl,
        socialLinkedin: form.socialLinkedin || undefined,
        socialTwitter: form.socialTwitter || undefined,
        socialWebsite: form.socialWebsite || undefined,
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

  // ─── Sidebar (same pattern as AdminBlog) ─────────────────────────────────

  const sidebarBtn = (screen: Screen, icon: string, label: string, isActive = false) => (
    <button
      onClick={() => navigateTo(screen)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'} ${
        isActive
          ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
      title={!isSidebarExpanded ? label : ''}
    >
      <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{icon}</span>
      {isSidebarExpanded && (
        <span className={`text-sm whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
          {label}
        </span>
      )}
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 relative z-20`}
      >
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div
              className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
              onClick={() => navigateTo(Screen.LANDING)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">
                  StudentOS
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Admin Console
                </p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {sidebarBtn(Screen.ADMIN_DASHBOARD, 'dashboard', 'Dashboard')}
              {sidebarBtn(Screen.ADMIN_EMPLOYERS, 'work', 'Employers')}
              {sidebarBtn(Screen.ADMIN_PRICING, 'payments', 'Pricing')}
              {sidebarBtn(Screen.ADMIN_USERS, 'group', 'Users')}
              {sidebarBtn(Screen.ADMIN_SCHOLARSHIPS, 'school', 'Scholarships')}
              {sidebarBtn(Screen.ADMIN_BLOG, 'article', 'Blog Management')}
              {sidebarBtn(Screen.ADMIN_TEAM, 'groups', 'Team', true)}
              {sidebarBtn(Screen.ADMIN_ROLES, 'admin_panel_settings', 'Roles & Permissions')}
              {sidebarBtn(Screen.ADMIN_NOTIFICATIONS, 'notifications', 'Notifications')}
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              onClick={() => navigateTo(Screen.ADMIN_SETTINGS)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                AD
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 text-left ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  Admin
                </p>
                <p className="text-xs text-primary dark:text-primary-light whitespace-nowrap">
                  Profile Settings
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors justify-center ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined text-lg">
                {isLoggingOut ? 'hourglass_empty' : 'logout'}
              </span>
              {isSidebarExpanded && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
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
              <span className="material-symbols-outlined text-lg">person_add</span>
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
                <span className="material-symbols-outlined text-primary/60 text-xl">groups</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {members.length}
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  With Avatar
                </p>
                <span className="material-symbols-outlined text-emerald-500/80 text-xl">
                  photo_camera
                </span>
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
                <span className="material-symbols-outlined text-blue-500/80 text-xl">link</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {
                  members.filter((m) => m.socialLinkedin || m.socialTwitter || m.socialWebsite)
                    .length
                }
              </p>
            </div>
          </section>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <span className="material-symbols-outlined text-5xl mb-3">group_add</span>
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
                            {member.socialLinkedin && (
                              <a
                                href={member.socialLinkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="LinkedIn"
                              >
                                <span className="material-symbols-outlined text-[18px]">link</span>
                              </a>
                            )}
                            {member.socialTwitter && (
                              <a
                                href={member.socialTwitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-sky-500 transition-colors"
                                title="Twitter"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  public
                                </span>
                              </a>
                            )}
                            {member.socialWebsite && (
                              <a
                                href={member.socialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-emerald-500 transition-colors"
                                title="Website"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  language
                                </span>
                              </a>
                            )}
                            {!member.socialLinkedin &&
                              !member.socialTwitter &&
                              !member.socialWebsite && (
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
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
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
      </main>

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
                <span className="material-symbols-outlined">close</span>
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
                      <span className="material-symbols-outlined text-3xl">person</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white text-xl">
                      photo_camera
                    </span>
                  </div>
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
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">link</span>
                  <input
                    type="text"
                    value={form.socialLinkedin}
                    onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    public
                  </span>
                  <input
                    type="text"
                    value={form.socialTwitter}
                    onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    language
                  </span>
                  <input
                    type="text"
                    value={form.socialWebsite}
                    onChange={(e) => setForm({ ...form, socialWebsite: e.target.value })}
                    placeholder="https://example.com"
                    className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
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
    </div>
  );
}
