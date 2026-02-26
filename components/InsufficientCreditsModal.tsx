import { X, Lock, Zap, ArrowRight, Sparkles } from 'lucide-react';
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0f111a] rounded-[24px] shadow-2xl w-full max-w-[400px] relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top gradient glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/20 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all z-10"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="px-8 pt-8 pb-6 text-center relative z-10">
          {/* Icon */}
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-2xl blur-xl" />
            <div className="relative w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
              <Lock size={28} className="text-white" strokeWidth={2} />
            </div>
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Unlock {toolName}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            You need <strong className="text-slate-700 dark:text-slate-300 font-semibold">{shortfall} more credits</strong> to access this feature. Top up your balance to continue.
          </p>

          {/* Clean minimal breakdown */}
          <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-4 mb-8 border border-slate-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Required</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {required} <Zap size={14} className="text-amber-500" fill="currentColor" />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Balance</span>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                {available} <Zap size={14} className="text-slate-400" />
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                // Future: Navigate to credits page
                onClose();
              }}
              className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <Sparkles size={16} className="text-indigo-400 dark:text-indigo-600" />
              Get More Credits
              <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
            <button
              onClick={onClose}
              className="w-full h-12 rounded-xl bg-transparent text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
