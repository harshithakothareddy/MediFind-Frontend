import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  onClick,
  loading = false,
}) => {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined;
  
  return (
    <div
      className={`stat-card ${onClick ? 'cursor-pointer hover:shadow-card-md hover:-translate-y-0.5' : ''} transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded w-24 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-32" />
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-neutral-900 mb-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {(trendLabel || subtitle) && (
                <div className="flex items-center gap-1.5 text-xs">
                  {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 font-medium ${
                      trendNeutral ? 'text-neutral-400' : trendPositive ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {trendNeutral ? <Minus className="w-3 h-3" /> : trendPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(trend)}%
                    </span>
                  )}
                  {trendLabel && <span className="text-neutral-400">{trendLabel}</span>}
                  {subtitle && <span className="text-neutral-500">{subtitle}</span>}
                </div>
              )}
            </>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
