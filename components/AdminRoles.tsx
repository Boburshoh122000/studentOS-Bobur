import React, { useState, useEffect, useMemo } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';

// Types
interface Permission {
  id: string;
  slug: string;
  name: string;
  category: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: Permission[];
}

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  roles: { id: string; name: string }[];
}

// Role badge colors
const getRoleBadgeStyle = (roleName: string) => {
  const styles: Record<string, string> = {
    'Super Admin': 'bg-purple-100 text-purple-700',
    'Employer Admin': 'bg-blue-100 text-blue-700',
    'Content Editor': 'bg-green-100 text-green-700',
    'Support Lead': 'bg-orange-100 text-orange-700',
    Support: 'bg-orange-100 text-orange-700',
    Viewer: 'bg-gray-100 text-gray-600',
  };
  return styles[roleName] || 'bg-gray-100 text-gray-600';
};

// Avatar colors
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

function AdminRoles({ navigateTo }: NavigationProps) {
  // Data states
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0, limit: 5 });

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditRoleNameModal, setShowEditRoleNameModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');

  // Get selected role
  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId),
    [roles, selectedRoleId]
  );

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return adminUsers;
    const q = searchQuery.toLowerCase();
    return adminUsers.filter(
      (u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
    );
  }, [adminUsers, searchQuery]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Update selected permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      setSelectedPermissionIds(new Set(selectedRole.permissions.map((p) => p.id)));
      setEditRoleName(selectedRole.name);
      setEditRoleDescription(selectedRole.description || '');
    }
  }, [selectedRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, usersRes] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
        adminApi.getAdminUsers({ limit: 100 }),
      ]);

      if (rolesRes.data) {
        setRoles(rolesRes.data);
        if (rolesRes.data.length > 0 && !selectedRoleId) {
          setSelectedRoleId(rolesRes.data[0].id);
        }
      }
      if (permsRes.data) {
        setGroupedPermissions(permsRes.data.grouped);
      }
      if (usersRes.data) {
        setAdminUsers(usersRes.data.users);
        setPagination((prev) => ({ ...prev, total: usersRes.data.pagination.total }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const result = await adminApi.updateRolePermissions(
        selectedRoleId,
        Array.from(selectedPermissionIds)
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Permissions updated successfully');
        await fetchData();
      }
    } catch (error) {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = () => {
    if (selectedRole) {
      setSelectedPermissionIds(new Set(selectedRole.permissions.map((p) => p.id)));
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      const result = await adminApi.createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Role created successfully');
        setNewRoleName('');
        setNewRoleDescription('');
        setShowCreateRoleModal(false);
        await fetchData();
        if (result.data?.id) {
          setSelectedRoleId(result.data.id);
        }
      }
    } catch (error) {
      toast.error('Failed to create role');
    }
  };

  const handleUpdateRoleName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId || !editRoleName.trim()) return;
    try {
      const result = await adminApi.updateRole(selectedRoleId, {
        name: editRoleName.trim(),
        description: editRoleDescription.trim() || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Role updated successfully');
        setShowEditRoleNameModal(false);
        await fetchData();
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      const result = await adminApi.assignUserRole(userId, roleId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Role assigned successfully');
        setShowEditUserModal(false);
        setEditingUser(null);
        await fetchData();
      }
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  const formatTimeAgo = (date?: string) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredUsers.slice(start, start + pagination.limit);
  }, [filteredUsers, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(filteredUsers.length / pagination.limit);

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
            onClick={() => toast('Audit Log feature coming soon!', { icon: '📋' })}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <span className="text-lg">📋</span>
            <span>Audit Log</span>
          </button>
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <span className="text-lg">+</span>
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* ... Rest of the file remains same ... */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <GlobalLoader fullScreen={false} />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left Panel: Admin Users */}
          <div className="flex-1 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Admin Users</h2>
              <div className="relative w-64">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      Role
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
                      <td colSpan={4} className="px-5 py-8 text-center">
                        <p className="text-gray-500 text-sm">No admin users found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((adminUser) => (
                      <tr key={adminUser.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(adminUser.fullName || adminUser.email)}`}
                            >
                              {adminUser.fullName
                                ? adminUser.fullName.charAt(0).toUpperCase()
                                : adminUser.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                {adminUser.fullName || 'Unknown'}
                              </p>
                              <p className="text-[11px] text-gray-400 leading-none">
                                {adminUser.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {adminUser.roles.length > 0 ? (
                            <span
                              className={`inline-flex px-3 py-1 text-[11px] font-semibold rounded-full ${getRoleBadgeStyle(adminUser.roles[0].name)}`}
                            >
                              {adminUser.roles[0].name}
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500">
                              No role
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                          {formatTimeAgo(adminUser.lastLoginAt)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => {
                              setEditingUser(adminUser);
                              setShowEditUserModal(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                        </td>
                      </tr>
                    ))
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
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= totalPages}
                  className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Role Configuration */}
          <div className="w-[340px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-[calc(100vh-140px)] sticky top-8">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Role Configuration</h2>

              {/* Role Selector */}
              <div className="relative">
                <select
                  value={selectedRoleId || ''}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-800 text-sm font-medium focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] cursor-pointer outline-none transition-shadow"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {selectedRole && (
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Role Summary Box */}
                <div className="px-5 py-6 border-b border-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-lg">💼</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate pr-2">
                          {selectedRole.name}
                        </h3>
                        {!selectedRole.isSystem && (
                          <button
                            onClick={() => setShowEditRoleNameModal(true)}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap"
                          >
                            Edit Name
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {selectedRole.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="p-5 flex-1">
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                      <div key={category}>
                        <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                          {category}
                        </h4>
                        <div className="space-y-3">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-start gap-2.5 cursor-pointer group"
                            >
                              <div
                                className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                                  selectedPermissionIds.has(perm.id)
                                    ? 'bg-[#4361EE] border-[#4361EE]'
                                    : 'border-gray-300 bg-white group-hover:border-blue-400'
                                }`}
                              >
                                {selectedPermissionIds.has(perm.id) && (
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
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={selectedPermissionIds.has(perm.id)}
                                onChange={() => handleTogglePermission(perm.id)}
                              />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-800 mb-0.5">
                                  {perm.name}
                                </p>
                                {perm.description && (
                                  <p className="text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors">
                                    {perm.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-xl">
              <button
                onClick={handleResetPermissions}
                className="px-4 py-2 text-gray-500 hover:text-gray-900 text-xs font-semibold transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold shadow-sm transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modals - Clean White Theme */}
      {/* Create Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all scale-100 p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Create New Role</h3>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Content Manager"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all placeholder-gray-400 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="What can this role do?"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all placeholder-gray-400 text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRoleNameModal && selectedRole && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Edit Role</h3>
            </div>
            <form onSubmit={handleUpdateRoleName} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={editRoleName}
                  onChange={(e) => setEditRoleName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editRoleDescription}
                  onChange={(e) => setEditRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-1 focus:ring-[#4361EE] focus:border-[#4361EE] outline-none transition-all text-sm resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditRoleNameModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4361EE] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Change User Role</h3>
              <p className="text-xs text-gray-500 mt-0.5">{editingUser.fullName}</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-700 mb-3">Select a new role:</p>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAssignRole(editingUser.id, role.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-all duration-200 group flex items-center justify-between ${
                      editingUser.roles[0]?.id === role.id
                        ? 'border-[#4361EE] bg-blue-50/50'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-sm font-bold ${editingUser.roles[0]?.id === role.id ? 'text-[#4361EE]' : 'text-gray-900'}`}
                      >
                        {role.name}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {role.description || 'No description'}
                      </p>
                    </div>
                    {editingUser.roles[0]?.id === role.id && (
                      <svg
                        className="w-4 h-4 text-[#4361EE]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-2">
                <button
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-xs font-bold"
                >
                  Cancel
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
