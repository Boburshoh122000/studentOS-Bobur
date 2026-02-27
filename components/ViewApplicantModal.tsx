import React, { useState } from 'react';
import { employerApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import { AcademicCapIcon, ArrowTopRightOnSquareIcon, BookOpenIcon, BriefcaseIcon, CalendarDaysIcon, ChartBarIcon, CodeBracketIcon, DocumentTextIcon, EnvelopeIcon, MapPinIcon, StarIcon, UserIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface Applicant {
  id: string;
  status: string;
  coverLetter?: string;
  cvUrl?: string;
  matchScore?: number;
  notes?: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
  };
  user: {
    email: string;
    studentProfile?: {
      fullName?: string;
      avatarUrl?: string;
      university?: string;
      major?: string;
      educationLevel?: string;
      country?: string;
      graduationYear?: number;
      skills?: string[];
      cvUrl?: string;
    };
  };
}

interface ViewApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
  onStatusUpdate: () => void;
}

export default function ViewApplicantModal({
  isOpen,
  onClose,
  applicant,
  onStatusUpdate,
}: ViewApplicantModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!isOpen || !applicant) return null;

  const profile = applicant.user.studentProfile;
  const fullName = profile?.fullName || 'Unknown Candidate';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    setActiveAction(newStatus);
    try {
      const { error } = await employerApi.updateApplicationStatus(applicant.id, {
        status: newStatus,
      });
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(
        `Application ${newStatus === 'INTERVIEW' ? 'moved to interview' : newStatus === 'REJECTED' ? 'rejected' : 'updated'}`
      );
      onStatusUpdate();
      onClose();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
      setActiveAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      SCREENING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      OFFER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      WITHDRAWN: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-slate-100 dark:ring-slate-700">
                {getInitials(fullName)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{applicant.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(applicant.status)}`}
            >
              {applicant.status}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Applied For */}
          <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BriefcaseIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Applied for
                </p>
                <p className="font-bold text-slate-900 dark:text-white">{applicant.job.title}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Applied</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {new Date(applicant.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Profile Information
              </h3>
              <div className="space-y-3">
                {profile?.university && (
                  <div className="flex items-center gap-3 text-sm">
                    <AcademicCapIcon className="w-[18px] h-[18px] text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{profile.university}</span>
                  </div>
                )}
                {profile?.major && (
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpenIcon className="w-[18px] h-[18px] text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{profile.major}</span>
                  </div>
                )}
                {profile?.graduationYear && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDaysIcon className="w-[18px] h-[18px] text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Class of {profile.graduationYear}
                    </span>
                  </div>
                )}
                {profile?.country && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPinIcon className="w-[18px] h-[18px] text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{profile.country}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CodeBracketIcon className="w-5 h-5 text-primary" />
                Skills
              </h3>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No skills listed</p>
              )}
            </div>
          </div>

          {/* CV Link */}
          {(applicant.cvUrl || profile?.cvUrl) && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <DocumentTextIcon className="w-5 h-5 text-primary" />
                Resume / CV
              </h3>
              <a
                href={applicant.cvUrl || profile?.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
              >
                <ArrowTopRightOnSquareIcon className="w-[18px] h-[18px]" />
                View Resume
              </a>
            </div>
          )}

          {/* Cover Letter */}
          {applicant.coverLetter && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <EnvelopeIcon className="w-5 h-5 text-primary" />
                Cover Letter
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {applicant.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* Match Score */}
          {applicant.matchScore !== undefined && applicant.matchScore !== null && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <ChartBarIcon className="w-5 h-5 text-emerald-600 text-emerald-400 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      AI Match Score
                    </p>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300">
                      Profile matches job requirements
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {applicant.matchScore}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={isUpdating || applicant.status === 'REJECTED'}
            className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUpdating && activeAction === 'REJECTED' ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <XMarkIcon className="w-[18px] h-[18px]" />
            )}
            Reject
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => handleStatusUpdate('SCREENING')}
              disabled={isUpdating || applicant.status === 'SCREENING'}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating && activeAction === 'SCREENING' ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              ) : (
                <StarIcon className="w-[18px] h-[18px]" />
              )}
              Shortlist
            </button>
            <button
              onClick={() => handleStatusUpdate('INTERVIEW')}
              disabled={isUpdating || applicant.status === 'INTERVIEW'}
              className="px-4 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating && activeAction === 'INTERVIEW' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <VideoCameraIcon className="w-[18px] h-[18px]" />
              )}
              Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
