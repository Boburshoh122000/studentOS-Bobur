type ToolType = 'cv' | 'job' | 'scholarship' | 'presentation' | 'plagiarism';

interface ToolCardProps {
  type: ToolType;
  title: string;
  subtitle: string;
  color: string;
}

// iOS-style icon mapping with gradients
const iconConfig: Record<ToolType, { icon: string; gradient: string }> = {
  cv: { icon: '📄', gradient: 'bg-gradient-to-br from-emerald-400 to-green-600' },
  job: { icon: '💼', gradient: 'bg-gradient-to-br from-blue-400 to-indigo-600' },
  scholarship: { icon: '🎓', gradient: 'bg-gradient-to-br from-violet-400 to-purple-600' },
  presentation: { icon: '📊', gradient: 'bg-gradient-to-br from-orange-400 to-rose-500' },
  plagiarism: { icon: '🔍', gradient: 'bg-gradient-to-br from-cyan-400 to-teal-600' },
};

export default function ToolCard({ type, title, subtitle }: ToolCardProps) {
  const { icon, gradient } = iconConfig[type];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-5 w-64 h-auto transform transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm">
      {/* Header with iOS-style Icon */}
      <div className="flex items-center gap-4 mb-4">
        {/* 3D App Icon */}
        <div
          className={`w-12 h-12 ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
        >
          <span className="text-xl filter drop-shadow-sm">{icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm leading-tight">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Mock Content */}
      <div className="space-y-2">
        {type === 'cv' && (
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
            <div className="h-2 bg-slate-100 rounded-full w-full"></div>
            <div className="h-2 bg-slate-100 rounded-full w-5/6"></div>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold shadow-sm">
                ATS: 95%
              </span>
            </div>
          </div>
        )}

        {type === 'job' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full shadow-inner"></div>
              <div className="h-2 bg-slate-100 rounded-full w-20"></div>
            </div>
            <div className="h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-500">✨ 3 New Matches</span>
            </div>
          </div>
        )}

        {type === 'scholarship' && (
          <div className="text-center py-3 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-purple-100">
            <span className="text-2xl">🏆</span>
            <p className="text-sm font-bold text-purple-700 mt-1">$5,000 Grant</p>
            <p className="text-[10px] text-purple-500 font-medium">Applied Successfully</p>
          </div>
        )}

        {type === 'presentation' && (
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-video bg-gradient-to-br from-orange-50 to-rose-50 rounded-lg border border-orange-100 shadow-inner"></div>
            <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-100 shadow-inner"></div>
            <div className="col-span-2 h-2 bg-slate-100 rounded-full w-1/2 mx-auto mt-1"></div>
          </div>
        )}

        {type === 'plagiarism' && (
          <div className="flex flex-col items-center py-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 border-4 border-teal-400 flex items-center justify-center mb-1 shadow-inner">
              <span className="text-sm font-bold text-teal-600">100%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Original Content</span>
          </div>
        )}
      </div>
    </div>
  );
}
