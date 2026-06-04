import { useState, useEffect, useRef } from 'react';
import { NavigationProps } from '../types';
import { scholarshipApi } from '../src/services/api';
import toast from 'react-hot-toast';
import { GlobalLoader } from './ui/GlobalLoader';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';

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
  eligibility: string | null;
  benefits: string | null;
  applicationUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isTrending: boolean;
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
  studyLevel: 'Bachelor',
  awardType: 'Full Scholarship',
  awardAmount: '',
  deadline: '',
  description: '',
  eligibility: '',
  benefits: '',
  applicationUrl: '',
  isTrending: false,
  status: 'DRAFT' as Scholarship['status'],
};

interface CInfo {
  name: string;
  iso: string;
}
const COUNTRIES: CInfo[] = [
  { name: 'Afghanistan', iso: 'af' },
  { name: 'Albania', iso: 'al' },
  { name: 'Algeria', iso: 'dz' },
  { name: 'Andorra', iso: 'ad' },
  { name: 'Angola', iso: 'ao' },
  { name: 'Argentina', iso: 'ar' },
  { name: 'Armenia', iso: 'am' },
  { name: 'Australia', iso: 'au' },
  { name: 'Austria', iso: 'at' },
  { name: 'Azerbaijan', iso: 'az' },
  { name: 'Bahrain', iso: 'bh' },
  { name: 'Bangladesh', iso: 'bd' },
  { name: 'Belarus', iso: 'by' },
  { name: 'Belgium', iso: 'be' },
  { name: 'Bolivia', iso: 'bo' },
  { name: 'Bosnia and Herzegovina', iso: 'ba' },
  { name: 'Brazil', iso: 'br' },
  { name: 'Brunei', iso: 'bn' },
  { name: 'Bulgaria', iso: 'bg' },
  { name: 'Cambodia', iso: 'kh' },
  { name: 'Cameroon', iso: 'cm' },
  { name: 'Canada', iso: 'ca' },
  { name: 'Chile', iso: 'cl' },
  { name: 'China', iso: 'cn' },
  { name: 'Colombia', iso: 'co' },
  { name: 'Costa Rica', iso: 'cr' },
  { name: 'Croatia', iso: 'hr' },
  { name: 'Cuba', iso: 'cu' },
  { name: 'Cyprus', iso: 'cy' },
  { name: 'Czech Republic', iso: 'cz' },
  { name: 'Denmark', iso: 'dk' },
  { name: 'Ecuador', iso: 'ec' },
  { name: 'Egypt', iso: 'eg' },
  { name: 'Estonia', iso: 'ee' },
  { name: 'Ethiopia', iso: 'et' },
  { name: 'Finland', iso: 'fi' },
  { name: 'France', iso: 'fr' },
  { name: 'Georgia', iso: 'ge' },
  { name: 'Germany', iso: 'de' },
  { name: 'Ghana', iso: 'gh' },
  { name: 'Greece', iso: 'gr' },
  { name: 'Guatemala', iso: 'gt' },
  { name: 'Hungary', iso: 'hu' },
  { name: 'Iceland', iso: 'is' },
  { name: 'India', iso: 'in' },
  { name: 'Indonesia', iso: 'id' },
  { name: 'Iran', iso: 'ir' },
  { name: 'Iraq', iso: 'iq' },
  { name: 'Ireland', iso: 'ie' },
  { name: 'Israel', iso: 'il' },
  { name: 'Italy', iso: 'it' },
  { name: 'Jamaica', iso: 'jm' },
  { name: 'Japan', iso: 'jp' },
  { name: 'Jordan', iso: 'jo' },
  { name: 'Kazakhstan', iso: 'kz' },
  { name: 'Kenya', iso: 'ke' },
  { name: 'Kuwait', iso: 'kw' },
  { name: 'Latvia', iso: 'lv' },
  { name: 'Lebanon', iso: 'lb' },
  { name: 'Libya', iso: 'ly' },
  { name: 'Lithuania', iso: 'lt' },
  { name: 'Luxembourg', iso: 'lu' },
  { name: 'Malaysia', iso: 'my' },
  { name: 'Maldives', iso: 'mv' },
  { name: 'Malta', iso: 'mt' },
  { name: 'Mexico', iso: 'mx' },
  { name: 'Moldova', iso: 'md' },
  { name: 'Mongolia', iso: 'mn' },
  { name: 'Montenegro', iso: 'me' },
  { name: 'Morocco', iso: 'ma' },
  { name: 'Myanmar', iso: 'mm' },
  { name: 'Nepal', iso: 'np' },
  { name: 'Netherlands', iso: 'nl' },
  { name: 'New Zealand', iso: 'nz' },
  { name: 'Nigeria', iso: 'ng' },
  { name: 'North Macedonia', iso: 'mk' },
  { name: 'Norway', iso: 'no' },
  { name: 'Oman', iso: 'om' },
  { name: 'Pakistan', iso: 'pk' },
  { name: 'Palestine', iso: 'ps' },
  { name: 'Panama', iso: 'pa' },
  { name: 'Peru', iso: 'pe' },
  { name: 'Philippines', iso: 'ph' },
  { name: 'Poland', iso: 'pl' },
  { name: 'Portugal', iso: 'pt' },
  { name: 'Qatar', iso: 'qa' },
  { name: 'Romania', iso: 'ro' },
  { name: 'Russia', iso: 'ru' },
  { name: 'Saudi Arabia', iso: 'sa' },
  { name: 'Serbia', iso: 'rs' },
  { name: 'Singapore', iso: 'sg' },
  { name: 'Slovakia', iso: 'sk' },
  { name: 'Slovenia', iso: 'si' },
  { name: 'South Africa', iso: 'za' },
  { name: 'South Korea', iso: 'kr' },
  { name: 'Spain', iso: 'es' },
  { name: 'Sri Lanka', iso: 'lk' },
  { name: 'Sweden', iso: 'se' },
  { name: 'Switzerland', iso: 'ch' },
  { name: 'Syria', iso: 'sy' },
  { name: 'Taiwan', iso: 'tw' },
  { name: 'Tanzania', iso: 'tz' },
  { name: 'Thailand', iso: 'th' },
  { name: 'Tunisia', iso: 'tn' },
  { name: 'Turkey', iso: 'tr' },
  { name: 'UAE', iso: 'ae' },
  { name: 'Uganda', iso: 'ug' },
  { name: 'Ukraine', iso: 'ua' },
  { name: 'United Kingdom', iso: 'gb' },
  { name: 'USA', iso: 'us' },
  { name: 'Uzbekistan', iso: 'uz' },
  { name: 'Venezuela', iso: 've' },
  { name: 'Vietnam', iso: 'vn' },
  { name: 'Zimbabwe', iso: 'zw' },
  { name: 'Other', iso: '' },
];
const ISO_MAP: Record<string, string> = {};
COUNTRIES.forEach((c) => {
  ISO_MAP[c.name.toLowerCase()] = c.iso;
});
ISO_MAP['uk'] = 'gb';
ISO_MAP['united states'] = 'us';
ISO_MAP['korea'] = 'kr';

const studyLevels = ['Bachelor', "Master's", 'PhD', 'High School', 'Other'];
const awardTypes = [
  'Full Scholarship',
  'Partial Scholarship',
  'Tuition Only',
  'Living Expenses',
  'Research Grant',
];

export default function AdminScholarships({ navigateTo }: NavigationProps) {
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchScholarships();
    fetchStats();
    setSelectedIds(new Set());
  }, [statusFilter, currentPage]);

  const fetchScholarships = async () => {
    try {
      setIsLoading(true);
      const response = await scholarshipApi.adminList({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
      });
      if (response.data) {
        const data = response.data as any;
        setScholarships(data.scholarships || []);
        setPagination(data.pagination || { total: 0, pages: 1 });
      }
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
      if (response.data) setStats(response.data as Stats);
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
      eligibility: scholarship.eligibility || '',
      benefits: scholarship.benefits || '',
      applicationUrl: scholarship.applicationUrl || '',
      isTrending: scholarship.isTrending ?? false,
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
      eligibility: scholarship.eligibility || '',
      benefits: scholarship.benefits || '',
      applicationUrl: scholarship.applicationUrl || '',
      isTrending: scholarship.isTrending ?? false,
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(scholarships.map((s) => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    try {
      const response = await scholarshipApi.bulkDelete(Array.from(selectedIds));
      if (response.error) throw new Error(response.error);
      const count = (response.data as any)?.deleted_count ?? selectedIds.size;
      toast.success(`${count} scholarship${count !== 1 ? 's' : ''} deleted`);
      setShowBulkDeleteModal(false);
      setSelectedIds(new Set());
      if (selectedId && selectedIds.has(selectedId)) setSelectedId(null);
      fetchScholarships();
      fetchStats();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Failed to delete scholarships');
    } finally {
      setIsBulkDeleting(false);
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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Published
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
            Draft
          </span>
        );
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      USA: '🇺🇸',
      UK: '🇬🇧',
      Canada: '🇨🇦',
      Germany: '🇩🇪',
      Australia: '🇦🇺',
      France: '🇫🇷',
      Netherlands: '🇳🇱',
      Japan: '🇯🇵',
      'South Korea': '🇰🇷',
    };
    return flags[country] || '🌍';
  };

  const selectedScholarship = scholarships.find((s) => s.id === selectedId);

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Scholarship Management
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Create, edit, and manage scholarship opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 group"
            >
              <PlusIcon className="w-[18px] h-[18px]" />
              <span>Add Scholarship</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Scholarships
              </p>
              <CheckCircleIcon className="w-5 h-5 text-primary/60 dark:text-primary-dark/60" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.published || 0}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Pending Review
              </p>
              <ClockIcon className="w-5 h-5 text-orange-500/80" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.pending || 0}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Funding
              </p>
              <CurrencyDollarIcon className="w-5 h-5 text-emerald-600/80" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {formatFunding(stats?.totalFunding || 0)}
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 mb-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none"
              placeholder="Search scholarship, university..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="PENDING">Pending</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all scholarships"
                      checked={scholarships.length > 0 && selectedIds.size === scholarships.length}
                      ref={(el) => {
                        if (el)
                          el.indeterminate =
                            selectedIds.size > 0 && selectedIds.size < scholarships.length;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Scholarship Name / University
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Country
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <GlobalLoader fullScreen={false} />
                    </td>
                  </tr>
                ) : scholarships.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <AcademicCapIcon className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm text-slate-500">No scholarships found</p>
                    </td>
                  </tr>
                ) : (
                  scholarships.map((scholarship) => (
                    <tr
                      key={scholarship.id}
                      onClick={() => handleQuickEdit(scholarship)}
                      className={`group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                        selectedIds.has(scholarship.id)
                          ? 'bg-blue-500/5 dark:bg-blue-500/10'
                          : selectedId === scholarship.id
                            ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary'
                            : ''
                      }`}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${scholarship.title}`}
                          checked={selectedIds.has(scholarship.id)}
                          onChange={(e) => handleSelectOne(scholarship.id, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold">
                            <AcademicCapIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {scholarship.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {scholarship.institution}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(scholarship.deadline)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(scholarship.country)}</span>{' '}
                          {scholarship.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {scholarship.awardAmount || 'TBD'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(scholarship.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(scholarship);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                            title={scholarship.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {scholarship.status === 'PUBLISHED' ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(scholarship);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                          >
                            <PencilIcon className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(scholarship.id);
                            }}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <TrashIcon className="w-[18px] h-[18px]" />
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
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
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
                    onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
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
                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorData.isTrending}
                      onChange={(e) =>
                        setEditorData({ ...editorData, isTrending: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    ⭐ Mark as Trending
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
                  <div ref={countryRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setCountryOpen(!countryOpen);
                        setCountrySearch('');
                      }}
                      title="Select country"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm text-left outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center gap-2"
                    >
                      {ISO_MAP[editorData.country.toLowerCase()] && (
                        <img
                          src={`https://flagcdn.com/w40/${ISO_MAP[editorData.country.toLowerCase()]}.png`}
                          alt=""
                          className="w-5 h-4 object-cover rounded-sm"
                        />
                      )}
                      <span>{editorData.country}</span>
                      <svg
                        className="w-4 h-4 ml-auto text-gray-400"
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
                    </button>
                    {countryOpen && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {COUNTRIES.filter((c) =>
                            c.name.toLowerCase().includes(countrySearch.toLowerCase())
                          ).map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              title={c.name}
                              onClick={() => {
                                setEditorData({ ...editorData, country: c.name });
                                setCountryOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 text-sm text-left flex items-center gap-2.5 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors ${
                                editorData.country === c.name
                                  ? 'bg-indigo-50 dark:bg-slate-700 font-semibold text-indigo-700 dark:text-indigo-400'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {c.iso ? (
                                <img
                                  src={`https://flagcdn.com/w40/${c.iso}.png`}
                                  alt=""
                                  className="w-5 h-4 object-cover rounded-sm flex-shrink-0"
                                />
                              ) : (
                                <span className="w-5 h-4 bg-gray-200 rounded-sm flex-shrink-0" />
                              )}
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                  rows={3}
                  value={editorData.description}
                  onChange={(e) => setEditorData({ ...editorData, description: e.target.value })}
                  placeholder="Brief overview of the scholarship..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Eligibility Criteria
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={3}
                  value={editorData.eligibility || ''}
                  onChange={(e) => setEditorData({ ...editorData, eligibility: e.target.value })}
                  placeholder="Who can apply? Nationality, GPA, age requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Benefits
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  rows={3}
                  value={editorData.benefits || ''}
                  onChange={(e) => setEditorData({ ...editorData, benefits: e.target.value })}
                  placeholder="Tuition, stipend, accommodation, travel costs..."
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
              <div className="flex items-center gap-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editorData.isTrending}
                    onChange={(e) => setEditorData({ ...editorData, isTrending: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  ⭐ Mark as Trending
                </span>
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

      {/* ── Floating Bulk Action Bar ─────────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-slate-800 px-5 py-3 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-medium text-white">
            {selectedIds.size} scholarship{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-slate-600" />
          <button
            type="button"
            onClick={() => setShowBulkDeleteModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-500 hover:bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* ── Bulk Delete Confirmation Modal ───────────────────────────────────── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Delete {selectedIds.size} Scholarship{selectedIds.size !== 1 ? 's' : ''}?
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 p-3 mb-5 space-y-1">
                {scholarships
                  .filter((s) => selectedIds.has(s.id))
                  .map((s) => (
                    <div key={s.id} className="flex items-center gap-2 py-1">
                      <AcademicCapIcon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                        {s.title}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-5 py-2 text-sm font-bold text-white transition-colors disabled:opacity-50"
                >
                  {isBulkDeleting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">
                        progress_activity
                      </span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      Delete {selectedIds.size} Scholarship{selectedIds.size !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
