import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';

const SUPER_ADMIN_EMAIL = 'javohirturayev01@gmail.com';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  roles: { id: string; name: string }[];
  permissions: Permission[];
}

interface SearchUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  avatarUrl?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAvatarColor = (seed: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[seed.charCodeAt(0) % colors.length];
};

const formatTimeAgo = (date?: string) => {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Permission Checkboxes Panel ─────────────────────────────────────────────

interface PermPanelProps {
  groupedPermissions: Record<string, Permission[]>;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allPermissionIds: string[];
}

function PermissionsPanel({
  groupedPermissions,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  allPermissionIds,
}: PermPanelProps) {
  const allSelected =
    allPermissionIds.length > 0 && allPermissionIds.every((id) => selectedIds.has(id));

  return (
    <div>
      {/* Quick actions */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400 font-medium">
          {selectedIds.size} / {allPermissionIds.length} selected
        </span>
      </div>

      <div className="space-y-5">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category}>
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2.5">
              {category}
            </h4>
            <div className="space-y-2.5">
              {perms.map((perm) => (
                <label key={perm.id} className="flex items-start gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => onToggle(perm.id)}
                    className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 shrink-0 ${
                      selectedIds.has(perm.id)
                        ? 'bg-[#4361EE] border-[#4361EE]'
                        : 'border-gray-300 bg-white group-hover:border-blue-400'
                    }`}
                  >
                    {selectedIds.has(perm.id) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M4 12l4 4L20 6"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800 leading-none mb-0.5">
                      {perm.name}
                    </p>
                    {perm.description && (
                      <p className="text-[11px] text-gray-400">{perm.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function AdminRoles({ navigateTo: _navigateTo }: NavigationProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  // ── Data
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Right panel — admin permission editor
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminPermIds, setAdminPermIds] = useState<Set<string>>(new Set());
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  // ── Search / pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // ── Add Admin modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStep, setAddStep] = useState<'search' | 'permissions'>('search');
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingUser, setPendingUser] = useState<SearchUser | null>(null);
  const [addPermIds, setAddPermIds] = useState<Set<string>>(new Set());
  const [isAssigning, setIsAssigning] = useState(false);

  // ── Remove Admin modal
  const [removingAdmin, setRemovingAdmin] = useState<AdminUser | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── All permission IDs (flat)
  const allPermissionIds = useMemo(
    () => Object.values(groupedPermissions).flatMap((perms) => perms.map((p) => p.id)),
    [groupedPermissions]
  );

  // ── Filtered + paginated users
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return adminUsers;
    const q = searchQuery.toLowerCase();
    return adminUsers.filter(
      (u) => u.email.toLowerCase().includes(q) || (u.fullName || '').toLowerCase().includes(q)
    );
  }, [adminUsers, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredUsers, page]
  );

  // ── Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [permsRes, usersRes] = await Promise.all([
        adminApi.getPermissions(),
        adminApi.getAdminUsers({ limit: 100 }),
      ]);
      if (permsRes.data) setGroupedPermissions(permsRes.data.grouped);
      if (usersRes.data) setAdminUsers(usersRes.data.users ?? []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Sync right-panel permissions when admin is selected
  useEffect(() => {
    if (selectedAdmin) {
      setAdminPermIds(new Set(selectedAdmin.permissions.map((p) => p.id)));
    }
  }, [selectedAdmin]);

  // ── Debounced search in Add Admin modal
  useEffect(() => {
    if (!showAddModal || addStep !== 'search') return;
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (addQuery.trim().length < 2) {
      setAddResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await adminApi.searchNonAdminUsers(addQuery.trim());
        setAddResults(res.data?.users ?? []);
      } catch {
        setAddResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [addQuery, showAddModal, addStep]);

  // ── Handlers

  const handleSelectAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminPermIds(new Set(admin.permissions.map((p) => p.id)));
  };

  const handleSaveAdminPerms = async () => {
    if (!selectedAdmin) return;
    setIsSavingPerms(true);
    try {
      const res = await adminApi.updateAdminPermissions(selectedAdmin.id, Array.from(adminPermIds));
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Permissions updated');
        await fetchData();
        // re-sync right panel with fresh data
        const fresh = adminUsers.find((a) => a.id === selectedAdmin.id);
        if (fresh)
          setSelectedAdmin({
            ...fresh,
            permissions: Array.from(adminPermIds).map((id) => ({
              id,
              slug: '',
              name: '',
              category: '',
            })),
          });
      }
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setIsSavingPerms(false);
    }
  };

  const handleResetAdminPerms = () => {
    if (selectedAdmin) setAdminPermIds(new Set(selectedAdmin.permissions.map((p) => p.id)));
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddStep('search');
    setAddQuery('');
    setAddResults([]);
    setPendingUser(null);
    setAddPermIds(new Set(allPermissionIds)); // default: all selected
    setIsAssigning(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddStep('search');
    setAddQuery('');
    setAddResults([]);
    setPendingUser(null);
    setAddPermIds(new Set());
  };

  const handleSelectPendingUser = (u: SearchUser) => {
    setPendingUser(u);
    setAddStep('permissions');
    setAddPermIds(new Set(allPermissionIds)); // default: all checked
  };

  const handleAssignAdmin = async () => {
    if (!pendingUser) return;
    setIsAssigning(true);
    try {
      const res = await adminApi.assignAdmin(pendingUser.id, Array.from(addPermIds));
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${pendingUser.fullName || pendingUser.email} is now an admin`);
        closeAddModal();
        await fetchData();
      }
    } catch {
      toast.error('Failed to assign admin role');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removingAdmin) return;
    setIsRemoving(true);
    try {
      const res = await adminApi.removeAdmin(removingAdmin.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Admin access removed');
        setRemovingAdmin(null);
        if (selectedAdmin?.id === removingAdmin.id) setSelectedAdmin(null);
        await fetchData();
      }
    } catch {
      toast.error('Failed to remove admin access');
    } finally {
      setIsRemoving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421] p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-blue-600/80 text-sm mt-1">
            Manage team access and Role-Based Access Control (RBAC)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast('Audit Log coming soon!', { icon: '📋' })}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <span>📋</span>
            <span>Audit Log</span>
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Add Admin</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <GlobalLoader fullScreen={false} />
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* ── Left: Admin Users Table ── */}
          <div className="flex-1 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Admin Users</h2>
                <p className="text-xs text-gray-400 mt-0.5">{filteredUsers.length} total</p>
              </div>
              <div className="relative w-60">
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Search admins"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 text-sm focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="text-center px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <p className="text-gray-500 text-sm">No admin users found</p>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-3 text-xs text-blue-600 hover:underline font-medium"
                          >
                            Add your first admin →
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((admin) => {
                      const isSA = admin.email === SUPER_ADMIN_EMAIL;
                      const isSelected = selectedAdmin?.id === admin.id;
                      return (
                        <tr
                          key={admin.id}
                          onClick={() => handleSelectAdmin(admin)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50/60'
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(admin.fullName || admin.email)}`}
                              >
                                {(admin.fullName || admin.email).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-bold text-gray-900 leading-none">
                                    {admin.fullName || 'Unknown'}
                                  </p>
                                  {isSA && (
                                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                                      Super Admin
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400">{admin.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {isSA ? (
                              <span className="text-xs font-semibold text-amber-600">
                                All Access
                              </span>
                            ) : admin.permissions.length > 0 ? (
                              <span className="text-xs font-medium text-gray-600">
                                {admin.permissions.length} permission
                                {admin.permissions.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">None assigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                            {formatTimeAgo(admin.lastLoginAt)}
                          </td>
                          <td className="px-5 py-4">
                            <div
                              className="flex items-center justify-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {!isSA && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectAdmin(admin)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit permissions"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                              )}
                              {isSuperAdmin && !isSA && (
                                <button
                                  type="button"
                                  onClick={() => setRemovingAdmin(admin)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove admin access"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                                    />
                                  </svg>
                                </button>
                              )}
                              {isSA && (
                                <span className="text-xs text-gray-300 font-medium px-2">
                                  Protected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">
                Showing {paginatedUsers.length} of {filteredUsers.length} admins
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Permission Editor Panel ── */}
          <div className="w-[340px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-[calc(100vh-160px)] sticky top-8">
            {selectedAdmin ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-gray-900 truncate pr-2">
                      Permissions:{' '}
                      <span className="text-[#4361EE]">
                        {selectedAdmin.fullName || selectedAdmin.email}
                      </span>
                    </h2>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setSelectedAdmin(null)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded transition-colors shrink-0"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">{selectedAdmin.email}</p>
                </div>

                {/* Permissions list */}
                <div className="flex-1 overflow-y-auto p-5">
                  {selectedAdmin.email === SUPER_ADMIN_EMAIL ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="text-3xl mb-3">👑</span>
                      <p className="text-sm font-bold text-gray-700">Super Admin</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Has unrestricted access to all features
                      </p>
                    </div>
                  ) : (
                    <PermissionsPanel
                      groupedPermissions={groupedPermissions}
                      selectedIds={adminPermIds}
                      onToggle={(id) =>
                        setAdminPermIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(id)) {
                            next.delete(id);
                          } else {
                            next.add(id);
                          }
                          return next;
                        })
                      }
                      onSelectAll={() => setAdminPermIds(new Set(allPermissionIds))}
                      onDeselectAll={() => setAdminPermIds(new Set())}
                      allPermissionIds={allPermissionIds}
                    />
                  )}
                </div>

                {/* Footer */}
                {selectedAdmin.email !== SUPER_ADMIN_EMAIL && (
                  <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleResetAdminPerms}
                      className="px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-semibold transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAdminPerms}
                      disabled={isSavingPerms}
                      className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold shadow-sm transition-all"
                    >
                      {isSavingPerms ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#4361EE]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-700">Select an Admin</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Click on any admin in the list to view and edit their permissions
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* ADD ADMIN MODAL                               */}
      {/* ══════════════════════════════════════════════ */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add New Admin</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {addStep === 'search'
                    ? 'Search for a registered user'
                    : `Setting permissions for ${pendingUser?.fullName || pendingUser?.email}`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={closeAddModal}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-4 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    addStep === 'search' ? 'bg-[#4361EE] text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {addStep === 'search' ? '1' : '✓'}
                </div>
                <span
                  className={`text-xs font-semibold ${addStep === 'search' ? 'text-gray-900' : 'text-green-600'}`}
                >
                  Select User
                </span>
              </div>
              <div className="flex-1 h-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    addStep === 'permissions'
                      ? 'bg-[#4361EE] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${addStep === 'permissions' ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  Set Permissions
                </span>
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {addStep === 'search' ? (
                <div>
                  <div className="relative mb-4">
                    <svg
                      className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      autoFocus
                      aria-label="Search users"
                      placeholder="Search by name or email..."
                      value={addQuery}
                      onChange={(e) => setAddQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 text-sm focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all"
                    />
                  </div>

                  <div className="min-h-[160px]">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="w-5 h-5 border-2 border-[#4361EE] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : addQuery.trim().length < 2 ? (
                      <p className="text-center text-gray-400 text-sm py-10">
                        Type at least 2 characters to search
                      </p>
                    ) : addResults.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-10">No users found</p>
                    ) : (
                      <div className="space-y-2">
                        {addResults.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            onClick={() => handleSelectPendingUser(u)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left"
                          >
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(u.fullName || u.email)}`}
                            >
                              {(u.fullName || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {u.fullName}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium shrink-0">
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Selected user preview */}
                  {pendingUser && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-xl mb-5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(pendingUser.fullName || pendingUser.email)}`}
                      >
                        {(pendingUser.fullName || pendingUser.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {pendingUser.fullName}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{pendingUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddStep('search')}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  <PermissionsPanel
                    groupedPermissions={groupedPermissions}
                    selectedIds={addPermIds}
                    onToggle={(id) =>
                      setAddPermIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) {
                          next.delete(id);
                        } else {
                          next.add(id);
                        }
                        return next;
                      })
                    }
                    onSelectAll={() => setAddPermIds(new Set(allPermissionIds))}
                    onDeselectAll={() => setAddPermIds(new Set())}
                    allPermissionIds={allPermissionIds}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
              {addStep === 'permissions' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAddStep('search')}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignAdmin}
                    disabled={isAssigning}
                    className="px-5 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs font-bold shadow-sm transition-all"
                  >
                    {isAssigning ? 'Adding...' : `+ Add Admin (${addPermIds.size} perms)`}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="ml-auto px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* REMOVE ADMIN MODAL                            */}
      {/* ══════════════════════════════════════════════ */}

      {removingAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-red-50 bg-red-50/50">
              <h3 className="text-base font-bold text-gray-900">Remove Admin Access</h3>
              <p className="text-xs text-gray-500 mt-0.5">This will demote the user to Student</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(removingAdmin.fullName || removingAdmin.email)}`}
                >
                  {(removingAdmin.fullName || removingAdmin.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {removingAdmin.fullName || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{removingAdmin.email}</p>
                </div>
              </div>
              <p className="text-xs text-red-600 font-medium mb-5 leading-relaxed">
                Removing admin access will immediately revoke their ability to access the admin
                panel. Their admin roles will also be cleared.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRemovingAdmin(null)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAdmin}
                  disabled={isRemoving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-xs font-bold shadow-sm transition-all"
                >
                  {isRemoving ? 'Removing...' : 'Remove Admin Access'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminRoles;
