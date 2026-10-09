import React from 'react';

// Skeleton line
export const SkeletonLine = ({ className = '' }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
);

// Skeleton card
export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="w-1/2 h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonLine />
      <SkeletonLine className="w-4/5" />
      <SkeletonLine className="w-3/5" />
    </div>
    <div className="flex gap-2">
      <div className="skeleton h-8 rounded-xl w-24" />
      <div className="skeleton h-8 rounded-xl w-20" />
    </div>
  </div>
);

// Skeleton stat card
export const SkeletonStatCard = ({ className = '' }) => (
  <div className={`card p-5 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <SkeletonLine className="w-1/2 h-3" />
        <SkeletonLine className="w-1/3 h-7" />
        <SkeletonLine className="w-2/3 h-3" />
      </div>
      <div className="skeleton w-12 h-12 rounded-xl" />
    </div>
  </div>
);

// Skeleton table row
export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonLine className={i === 0 ? 'w-32' : 'w-20'} />
      </td>
    ))}
  </tr>
);

// Skeleton dashboard
export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="card p-6">
      <SkeletonLine className="w-64 h-7 mb-2" />
      <SkeletonLine className="w-48 h-4" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  </div>
);

// Full page loading
export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-neutral-500 text-sm">{message}</p>
  </div>
);

export default { SkeletonCard, SkeletonStatCard, SkeletonTableRow, SkeletonDashboard, LoadingSpinner };
