import React, { useState } from 'react';
import { jobApi } from '../src/services/api';
import { toast } from 'react-hot-toast';
import { BriefcaseIcon, InformationCircleIcon, MapPinIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  locationType: string;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSuccess: () => void;
}

export default function ApplyJobModal({ isOpen, onClose, job, onSuccess }: ApplyJobModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const { error } = await jobApi.apply(job.id, {
        coverLetter: coverLetter.trim() || undefined,
      });

      if (error) {
        if (error.includes('Already applied')) {
          toast.error('You have already applied to this job');
        } else {
          toast.error(error);
        }
        return;
      }

      toast.success('Application submitted successfully!');
      setCoverLetter('');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PaperAirplaneIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply for Job</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Submit your application</p>
            </div>
          </div>

          {/* Job Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{job.company}</p>
            <div className="flex items-center gap-3 mt-2">
              {job.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {job.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <BriefcaseIcon className="w-3.5 h-3.5" />
                {job.locationType}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cover Letter <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the employer why you're a great fit for this role..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                A good cover letter can make your application stand out!
              </p>
            </div>

            {/* CV Notice */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-[18px] h-[18px] text-blue-600 text-blue-400 dark:text-blue-400" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your profile CV will be shared with the employer. Make sure your profile is up to
                  date!
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-[18px] h-[18px]" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
