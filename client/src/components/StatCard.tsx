import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  color = 'blue'
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-lg bg-${color}-50 dark:bg-${color}-950/50 text-${color}-600 dark:text-${color}-400`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
