import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import { Bell, Briefcase, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, DollarSign, Eye, EyeOff, FileText, GraduationCap, Hourglass, LayoutDashboard, LogOut, Pencil, Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react';

interface Scholarship {
  id: string;
  title: string;
  institution: string;
  country: string;
  studyLevel: string;
  awardType: string;
  awardAmount: string | null;
  deadline: string | null;
  description: string | null;
  applicationUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  published: number;
  pending: number;
  draft: number;
  total: number;
  totalFunding: number;
}

const emptyScholarship = {
  title: '',
  institution: '',
  country: 'USA',
  studyLevel: 'UNDERGRADUATE',
  awardType: 'Full Scholarship',
  awardAmount: '',
  deadline: '',
  description: '',
  applicationUrl: '',
  status: 'DRAFT' as const,
};

const countries = [
  'USA',
  'UK',
  'Canada',
  'Germany',
  'Australia',
  'France',
  'Netherlands',
  'Japan',
  'South Korea',
  'Other',
];
const studyLevels = ['HIGHSCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE', 'PHD', 'ANY'];
const awardTypes = [
  'Full Scholarship',
  'Partial Scholarship',
  'Tuition Only',
  'Living Expenses',
  'Research Grant',
];

export default function AdminScholarships({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editorData, setEditorData] = useState(emptyScholarship);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    fetchStats();
  }, [statusFilter, currentPage]);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      const response = await scholarshipApi.adminList({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
      });
      setScholarships(response.data.scholarships || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      console.error('Failed to fetch scholarships:', error);
      toast.error('Failed to load scholarships');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await scholarshipApi.adminStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchScholarships();
  };

  const handleCreate = () => {
    setEditingId(null);
    setEditorData(emptyScholarship);
    setShowModal(true);
  };

  const handleEdit = (scholarship: Scholarship) => {
    setEditingId(scholarship.id);
    setEditorData({
      title: scholarship.title,
      institution: scholarship.institution,
      country: scholarship.country,
      studyLevel: scholarship.studyLevel,
      awardType: scholarship.awardType,
      awardAmount: scholarship.awardAmount || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      description: scholarship.description || '',
      applicationUrl: scholarship.applicationUrl || '',
      status: scholarship.status,
    });
    setShowModal(true);
  };

  const handleQuickEdit = (scholarship: Scholarship) => {
    setSelectedId(scholarship.id);
    setEditorData({
      title: scholarship.title,
      institution: scholarship.institution,
      country: scholarship.country,
      studyLevel: scholarship.studyLevel,
      awardType: scholarship.awardType,
      awardAmount: scholarship.awardAmount || '',
      deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
      description: scholarship.description || '',
      applicationUrl: scholarship.applicationUrl || '',
      status: scholarship.status,
    });
  };

  const handleSave = async () => {
    if (!editorData.title || !editorData.institution) {
      toast.error('Title and Institution are required');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        ...editorData,
        deadline: editorData.deadline ? new Date(editorData.deadline).toISOString() : null,
      };

      if (editingId) {
        await scholarshipApi.update(editingId, data);
        toast.success('Scholarship updated successfully');
      } else {
        await scholarshipApi.create(data);
        toast.success('Scholarship created successfully');
      }

      setShowModal(false);
      setEditingId(null);
      setEditorData(emptyScholarship);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to save scholarship:', error);
      toast.error('Failed to save scholarship');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = async () => {
    if (!selectedId) return;

    setIsSaving(true);
    try {
      const data = {
        ...editorData,
        deadline: editorData.deadline ? new Date(editorData.deadline).toISOString() : null,
      };

      await scholarshipApi.update(selectedId, data);
      toast.success('Changes saved');
      setSelectedId(null);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;

    try {
      await scholarshipApi.delete(id);
      toast.success('Scholarship deleted');
      if (selectedId === id) setSelectedId(null);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete scholarship');
    }
  };

  const handleToggleStatus = async (scholarship: Scholarship) => {
    const newStatus = scholarship.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await scholarshipApi.update(scholarship.id, { status: newStatus });
      toast.success(`Scholarship ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'}`);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFunding = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div
              className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`}
              onClick={() => navigateTo(Screen.LANDING)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <GraduationCap size={24} />
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
                <LayoutDashboard size={20} />
                {isSidebarExpanded && (
                  {isLoggingOut ? <Hourglass size={20} /> : <LogOut size={20} />}
              {isSidebarExpanded && {true ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(scholarship);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(scholarship.id);
                              }}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {scholarships.length} of {pagination.total} scholarships
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage >= pagination.pages}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Quick Edit Panel */}
          {selectedScholarship && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quick Edit: {selectedScholarship.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQuickSave}
                    disabled={isSaving}
                    className="text-sm font-bold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Scholarship Title
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      type="text"
                      value={editorData.title}
                      onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        University
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="text"
                        value={editorData.institution}
                        onChange={(e) =>
                          setEditorData({ ...editorData, institution: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Country
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        value={editorData.country}
                        onChange={(e) => setEditorData({ ...editorData, country: e.target.value })}
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      rows={3}
                      value={editorData.description}
                      onChange={(e) =>
                        setEditorData({ ...editorData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Funding Amount
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="text"
                        placeholder="$25,000 or Full Tuition"
                        value={editorData.awardAmount}
                        onChange={(e) =>
                          setEditorData({ ...editorData, awardAmount: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                        Deadline
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        type="date"
                        value={editorData.deadline}
                        onChange={(e) => setEditorData({ ...editorData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Official Link
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      type="url"
                      value={editorData.applicationUrl}
                      onChange={(e) =>
                        setEditorData({ ...editorData, applicationUrl: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      value={editorData.status}
                      onChange={(e) =>
                        setEditorData({ ...editorData, status: e.target.value as any })
                      }
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Scholarship' : 'Add New Scholarship'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Scholarship Title *
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  type="text"
                  value={editorData.title}
                  onChange={(e) => setEditorData({ ...editorData, title: e.target.value })}
                  placeholder="e.g., Global Leaders Fellowship"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Institution *
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="text"
                    value={editorData.institution}
                    onChange={(e) => setEditorData({ ...editorData, institution: e.target.value })}
                    placeholder="e.g., Oxford University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Country
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.country}
                    onChange={(e) => setEditorData({ ...editorData, country: e.target.value })}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Study Level
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.studyLevel}
                    onChange={(e) => setEditorData({ ...editorData, studyLevel: e.target.value })}
                  >
                    {studyLevels.map((l) => (
                      <option key={l} value={l}>
                        {l.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Award Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    value={editorData.awardType}
                    onChange={(e) => setEditorData({ ...editorData, awardType: e.target.value })}
                  >
                    {awardTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Funding Amount
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="text"
                    value={editorData.awardAmount}
                    onChange={(e) => setEditorData({ ...editorData, awardAmount: e.target.value })}
                    placeholder="$25,000 or Full Tuition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                    Deadline
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    type="date"
                    value={editorData.deadline}
                    onChange={(e) => setEditorData({ ...editorData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Description
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={4}
                  value={editorData.description}
                  onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                  placeholder="Eligibility criteria, benefits, and requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Application URL
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  type="url"
                  value={editorData.applicationUrl}
                  onChange={(e) => setEditorData({ ...editorData, applicationUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  value={editorData.status}
                  onChange={(e) => setEditorData({ ...editorData, status: e.target.value as any })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : editingId ? 'Update Scholarship' : 'Create Scholarship'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
