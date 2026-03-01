import { useEffect, useState } from 'react';
import { adminApi } from '../src/services/api';

interface RoleData {
  role: string;
  count: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
  STUDENT: { label: 'Students', color: '#3b82f6', bgClass: 'bg-blue-500' },
  EMPLOYER: { label: 'Employers', color: '#8b5cf6', bgClass: 'bg-violet-500' },
  EDUCATOR: { label: 'Educators', color: '#10b981', bgClass: 'bg-emerald-500' },
  ADMIN: { label: 'Admins', color: '#f59e0b', bgClass: 'bg-amber-500' },
};

export default function UserDemographics() {
  const [data, setData] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminApi.getAnalytics();
        const analytics = res.data as any;
        if (analytics?.usersByRole) {
          setData(analytics.usersByRole);
        }
      } catch (err) {
        console.error('Failed to fetch demographics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Build donut segments
  const segments: {
    role: string;
    count: number;
    percentage: number;
    startAngle: number;
    endAngle: number;
    color: string;
  }[] = [];
  let currentAngle = -90; // Start from top

  data
    .sort((a, b) => b.count - a.count)
    .forEach((d) => {
      const percentage = total > 0 ? (d.count / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      segments.push({
        role: d.role,
        count: d.count,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: ROLE_CONFIG[d.role]?.color || '#94a3b8',
      });
      currentAngle += angle;
    });

  // SVG arc path helper
  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const clampedEnd = Math.min(endAngle, startAngle + 359.99);
    const start = polarToCartesian(cx, cy, r, clampedEnd);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = clampedEnd - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
        <div className="flex justify-center mb-6">
          <div className="size-44 rounded-full border-[20px] border-slate-200 dark:border-slate-700" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Demographics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Distribution by role</p>
      </div>

      {/* Donut Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative size-44">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            {segments.length > 0 ? (
              segments.map((seg) => (
                <path
                  key={seg.role}
                  d={describeArc(60, 60, 42, seg.startAngle, seg.endAngle)}
                  stroke={seg.color}
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              ))
            ) : (
              <circle cx="60" cy="60" r="42" stroke="#e2e8f0" strokeWidth="16" fill="none" />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {segments.map((seg) => {
          const config = ROLE_CONFIG[seg.role] || { label: seg.role, bgClass: 'bg-slate-400' };
          return (
            <div key={seg.role} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`size-2.5 rounded-full ${config.bgClass}`} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {seg.count}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">
                  {seg.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
