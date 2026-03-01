import {
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  GiftIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

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

  const pct = required > 0 ? Math.round((available / required) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored top band */}
        <div className="relative h-36 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-14 -left-8 w-44 h-44 bg-white/5 rounded-full" />

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <XMarkIcon className="w-[18px] h-[18px]" />
          </button>

          {/* Big credit coin */}
          <div className="relative flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-white/90 text-sm font-medium mt-1">{toolName}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-7 -mt-4 bg-white dark:bg-gray-900 rounded-t-3xl relative z-10">
          {/* Progress bar section */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Credits needed
              </span>
              <span className="text-xs text-gray-400">
                {available} / {required}
              </span>
            </div>

            {/* Bar */}
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              You're <strong className="text-gray-600 dark:text-gray-300">{shortfall}</strong>{' '}
              credits short to use this tool.
            </p>
          </div>

          {/* Two action cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => {
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/30 hover:shadow-md hover:scale-[1.02] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-800/40 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-700/40 transition">
                <BoltIcon className="w-[18px] h-[18px] text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                Buy Credits
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md hover:scale-[1.02] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-700/40 transition">
                <GiftIcon className="w-[18px] h-[18px] text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Invite & Earn
              </span>
            </button>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => {
              onClose();
            }}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
          >
            Top Up {shortfall} Credits
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 text-center text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition py-1"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
