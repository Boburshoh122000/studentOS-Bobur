import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Screen, NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import toast from 'react-hot-toast';

// User type from backend
interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  studentProfile?: { fullName: string; avatarUrl?: string } | null;
  employerProfile?: { companyName: string; logoUrl?: string } | null;
}

interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper to get user display name
const getUserName = (user: User) => {
  if (user.studentProfile?.fullName) return user.studentProfile.fullName;
  if (user.employerProfile?.companyName) return user.employerProfile.companyName;
  return user.email.split('@')[0];
};

// Helper to get user status display
const getUserStatus = (user: User): 'active' | 'inactive' | 'banned' => {
  // For now, inactive means not active.
  // A "banned" status could be implemented with a separate field in the future
  return user.isActive ? 'active' : 'inactive';
};

// Role badge styling
const getRoleBadgeClasses = (role: string) => {
  switch (role) {
    case 'STUDENT':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'EMPLOYER':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'ADMIN':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    default:
      return 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

// Status badge styling
const getStatusBadge = (status: 'active' | 'inactive' | 'banned') => {
  switch (status) {
    case 'active':
      return {
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dotClass: 'bg-emerald-500',
        label: 'Active',
      };
    case 'inactive':
      return {
        className: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
        dotClass: 'bg-gray-400',
        label: 'Inactive',
      };
    case 'banned':
      return {
        className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        dotClass: 'bg-red-500',
        label: 'Banned',
      };
  }
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Export to CSV
const exportToCSV = (users: User[]) => {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Registration Date'];
  const rows = users.map((user) => [
    getUserName(user),
    user.email,
    user.role,
    getUserStatus(user),
    formatDate(user.createdAt),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export default function AdminUsers({ navigateTo }: NavigationProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UsersPagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState<User | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      // Note: status filter is handled client-side since backend currently uses isActive boolean

      const response = await adminApi.getUsers(params);
      if (response.data) {
        const data = response.data as { users: User[]; pagination: UsersPagination };
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, pagination.page]);

  // Close action menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered users (client-side status filter)
  const filteredUsers = useMemo(() => {
    if (!statusFilter) return users;
    return users.filter((user) => {
      const status = getUserStatus(user);
      return status === statusFilter.toLowerCase();
    });
  }, [users, statusFilter]);

  // Stats calculations
  const stats = useMemo(() => {
    const total = pagination.total;
    const activeStudents = users.filter((u) => u.role === 'STUDENT' && u.isActive).length;
    const educators = users.filter((u) => u.role === 'ADMIN').length; // Using ADMIN as educator for now
    const employers = users.filter((u) => u.role === 'EMPLOYER').length;
    const activeEmployers = users.filter((u) => u.role === 'EMPLOYER' && u.isActive).length;

    return {
      total,
      activeStudents,
      educators,
      employers,
      activeEmployers,
    };
  }, [users, pagination.total]);

  // Ban user
  const handleBanUser = async (userId: string) => {
    try {
      await adminApi.updateUser(userId, { isActive: false });
      toast.success('User has been banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to ban user');
    }
    setActionMenuOpen(null);
  };

  // Activate user
  const handleActivateUser = async (userId: string) => {
    try {
      await adminApi.updateUser(userId, { isActive: true });
      toast.success('User has been activated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    }
    setActionMenuOpen(null);
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  // Toggle single selection
  const handleSelectUser = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  // Skeleton loader row
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
      </td>
    </tr>
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
          aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
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
              <button
                onClick={() => navigateTo(Screen.ADMIN_DASHBOARD)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Dashboard' : ''}
              >
                <span className="material-symbols-outlined">dashboard</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Employers' : ''}
              >
                <span className="material-symbols-outlined">work</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Employers</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_PRICING)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Pricing' : ''}
              >
                <span className="material-symbols-outlined">payments</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Pricing</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_USERS)}
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Users' : ''}
              >
                <span className="material-symbols-outlined fill-1">group</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-semibold whitespace-nowrap">Users</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Scholarships' : ''}
              >
                <span className="material-symbols-outlined">school</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_BLOG)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Blog Management' : ''}
              >
                <span className="material-symbols-outlined">article</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Blog Management</span>
                )}
              </button>
              <button
                onClick={() => navigateTo(Screen.ADMIN_ROLES)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? 'Roles & Permissions' : ''}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                {isSidebarExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>
                )}
              </button>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div
              className={`flex items-center gap-3 px-2 ${!isSidebarExpanded && 'justify-center px-0'}`}
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                AD
              </div>
              <div
                className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  Admin
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Super Admin
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo(Screen.SIGN_IN)}
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${!isSidebarExpanded ? 'justify-center' : 'justify-center'}`}
              title={!isSidebarExpanded ? 'Logout' : ''}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                User Management
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage all registered accounts, roles, and access status.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[300px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xl">
                  search
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-white"
                  placeholder="Search users by name, email..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search users"
                />
              </div>
              {/* Filters */}
              <div className="flex gap-2">
                <select
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  aria-label="Filter by role"
                >
                  <option value="">All Roles</option>
                  <option value="STUDENT">Student</option>
                  <option value="EMPLOYER">Employer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <select
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {/* Export */}
              <button
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
                onClick={() => exportToCSV(filteredUsers)}
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export Users
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Users
                </p>
                <span className="material-symbols-outlined text-primary/80 text-xl bg-primary/10 p-1.5 rounded-lg">
                  groups
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Students
                </p>
                <span className="material-symbols-outlined text-emerald-500/80 text-xl bg-emerald-500/10 p-1.5 rounded-lg">
                  person
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats.activeStudents.toLocaleString()}
                </p>
                {!isLoading && stats.total > 0 && (
                  <span className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                    {Math.round((stats.activeStudents / users.length) * 100)}% of page
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Admins</p>
                <span className="material-symbols-outlined text-orange-500/80 text-xl bg-orange-500/10 p-1.5 rounded-lg">
                  admin_panel_settings
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats.educators.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Employers</p>
                <span className="material-symbols-outlined text-purple-500/80 text-xl bg-purple-500/10 p-1.5 rounded-lg">
                  corporate_fare
                </span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? '...' : stats.employers.toLocaleString()}
                </p>
                {!isLoading && stats.employers > 0 && (
                  <span className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                    {stats.activeEmployers} Active
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Users Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input
                        className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10"
                        type="checkbox"
                        checked={
                          filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length
                        }
                        onChange={handleSelectAll}
                        aria-label="Select all users"
                      />
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Avatar & Name
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email Address
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Registration
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
                            person_off
                          </span>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            No users found
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const name = getUserName(user);
                      const status = getUserStatus(user);
                      const statusBadge = getStatusBadge(status);
                      const avatarUrl =
                        user.studentProfile?.avatarUrl || user.employerProfile?.logoUrl;

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <input
                              className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10"
                              type="checkbox"
                              checked={selectedUsers.has(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              aria-label={`Select ${name}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {avatarUrl ? (
                                <div
                                  className="h-9 w-9 flex-shrink-0 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700"
                                  style={{ backgroundImage: `url('${avatarUrl}')` }}
                                />
                              ) : (
                                <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                  {getInitials(name)}
                                </div>
                              )}
                              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                                {name}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getRoleBadgeClasses(user.role)}`}
                            >
                              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`}
                              ></span>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                              onClick={() =>
                                setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)
                              }
                              aria-label="More actions"
                            >
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                            {/* Action dropdown */}
                            {actionMenuOpen === user.id && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-lg z-50"
                              >
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                  onClick={() => {
                                    setShowUserDetails(user);
                                    setActionMenuOpen(null);
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    visibility
                                  </span>
                                  View Details
                                </button>
                                {user.isActive ? (
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => handleBanUser(user.id)}
                                  >
                                    <span className="material-symbols-outlined text-lg">block</span>
                                    Ban User
                                  </button>
                                ) : (
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => handleActivateUser(user.id)}
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      check_circle
                                    </span>
                                    Activate User
                                  </button>
                                )}
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                  onClick={() => {
                                    setShowDeleteConfirm(user.id);
                                    setActionMenuOpen(null);
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                  Delete User
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{' '}
                <span className="font-semibold">
                  {filteredUsers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold">{pagination.total.toLocaleString()}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`h-8 w-8 rounded-lg text-xs font-bold ${pagination.page === pageNum ? 'bg-primary text-white' : 'text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-slate-400'}`}
                        onClick={() => setPagination((p) => ({ ...p, page: pageNum }))}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                    <>
                      <span className="px-1 text-slate-500 dark:text-slate-400">...</span>
                      <button
                        className="h-8 w-8 rounded-lg text-xs font-bold text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 dark:text-slate-400"
                        onClick={() => setPagination((p) => ({ ...p, page: p.pages }))}
                      >
                        {pagination.pages}
                      </button>
                    </>
                  )}
                </div>
                <button
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">
                  warning
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will
              permanently remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                onClick={() => handleDeleteUser(showDeleteConfirm)}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Details</h3>
              <button
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                onClick={() => setShowUserDetails(null)}
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              {showUserDetails.studentProfile?.avatarUrl ||
              showUserDetails.employerProfile?.logoUrl ? (
                <div
                  className="h-16 w-16 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-slate-700"
                  style={{
                    backgroundImage: `url('${showUserDetails.studentProfile?.avatarUrl || showUserDetails.employerProfile?.logoUrl}')`,
                  }}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(getUserName(showUserDetails))}
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {getUserName(showUserDetails)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {showUserDetails.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role</p>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getRoleBadgeClasses(showUserDetails.role)}`}
                >
                  {showUserDetails.role.charAt(0) + showUserDetails.role.slice(1).toLowerCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Status
                </p>
                {(() => {
                  const statusBadge = getStatusBadge(getUserStatus(showUserDetails));
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dotClass}`}></span>
                      {statusBadge.label}
                    </span>
                  );
                })()}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Registration Date
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {formatDate(showUserDetails.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Last Login
                </p>
                <p className="text-sm text-slate-900 dark:text-white">
                  {showUserDetails.lastLoginAt ? formatDate(showUserDetails.lastLoginAt) : 'Never'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  User ID
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                  {showUserDetails.id}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                onClick={() => setShowUserDetails(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
