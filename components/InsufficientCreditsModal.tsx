import { Info, PlusCircle, Wallet } from 'lucide-react';
import React from 'react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  required: number;
  available: number;
  shortfall: number;
}

export default function InsufficientCreditsModal({
  isOpen,
  onClose,
  toolName,
  required,
  available,
  shortfall,
}: InsufficientCreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Insufficient Credits</h3>
              <p className="text-white/80 text-sm">You need more credits to use this tool</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <div className="text-center mb-6">
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              You're trying to use{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{toolName}</span>
            </p>
          </div>

          {/* Credit breakdown */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Required</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{required}</span>
                <span className="text-lg">💎</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Your Balance</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-red-500">{available}</span>
                <span className="text-lg">💎</span>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Shortfall
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-amber-600">{shortfall}</span>
                  <span className="text-lg">💎</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex gap-2">
              <Info size={18} className="text-blue-500" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Invite friends to earn credits! Every referral gives you bonus credits.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Future: Navigate to credits purchase page
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} />
            Get Credits
          </button>
        </div>
      </div>
    </div>
  );
}
