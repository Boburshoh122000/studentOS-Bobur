import { X, Coins, Sparkles, Users } from 'lucide-react';
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
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1e2330] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Icon + Title */}
        <div className="text-center px-6 pb-2">
          <div className="size-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
            <Coins size={24} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Not Enough Credits
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{toolName}</span>{' '}
            requires more credits than you have
          </p>
        </div>

        {/* Credit Breakdown */}
        <div className="mx-6 my-5 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Required</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{required} credits</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Your Balance</span>
            <span className="text-sm font-bold text-red-500">{available} credits</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <div className="flex items-center justify-between px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Need</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">+{shortfall} credits</span>
          </div>
        </div>

        {/* Referral hint */}
        <div className="mx-6 mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100/80 dark:border-indigo-800/30">
          <Users size={15} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
            Invite friends to earn free credits. Each referral earns you bonus credits instantly.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Future: Navigate to credits purchase page
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles size={15} />
            Get Credits
          </button>
        </div>
      </div>
    </div>
  );
}
