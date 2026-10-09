import React from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export const AvailabilityBadge = ({ status, showDot = true, size = 'sm' }) => {
  const configs = {
    AVAILABLE: { label: 'Available', className: 'badge-available' },
    LOW_STOCK: { label: 'Low Stock', className: 'badge-lowstock' },
    OUT_OF_STOCK: { label: 'Out of Stock', className: 'badge-outofstock' },
    UNKNOWN: { label: 'Unknown', className: 'badge-unknown' },
  };
  const config = configs[status] || configs.UNKNOWN;
  
  return (
    <span className={config.className}>
      {showDot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {config.label}
    </span>
  );
};

export const VerifiedBadge = ({ size = 'sm', showLabel = true }) => (
  <span className="badge-verified inline-flex items-center gap-1">
    <ShieldCheck className="w-3 h-3" />
    {showLabel && 'Verified'}
  </span>
);

export const OpenBadge = ({ isOpen }) => {
  if (isOpen == null) {
    return (
      <span className="badge-unknown inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        Hours unknown
      </span>
    );
  }

  return (
    <span className={isOpen ? 'badge-open' : 'badge-closed'}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-neutral-400'}`} />
      {isOpen ? 'Open' : 'Closed'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const configs = {
    USER: 'bg-[#d1fae5] text-[#064e3b] ring-[#a7f3d0]',
    PHARMACY: 'bg-[#d1fae5] text-[#0f766e] ring-[#a7f3d0]',
    ADMIN: 'bg-[#064e3b] text-[#d1fae5] ring-[#064e3b]',
  };
  const labels = { USER: 'User', PHARMACY: 'Pharmacy', ADMIN: 'Admin' };
  return (
    <span className={`badge ${configs[role] || 'badge-unknown'}`}>
      {labels[role] || role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const configs = {
    ACTIVE: 'bg-[#d1fae5] text-[#059669] ring-[#a7f3d0]',
    INACTIVE: 'bg-neutral-100 text-[#64748b] ring-[#d1e7dd]',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
    APPROVED: 'bg-[#d1fae5] text-[#059669] ring-[#a7f3d0]',
    REJECTED: 'bg-red-50 text-red-700 ring-red-200',
    SUSPENDED: 'bg-orange-50 text-orange-700 ring-orange-200',
    RESOLVED: 'bg-[#d1fae5] text-[#059669] ring-[#a7f3d0]',
    INVESTIGATING: 'bg-amber-50 text-amber-700 ring-amber-200',
    OPEN: 'bg-amber-50 text-amber-700 ring-amber-200',
    CLOSED: 'bg-neutral-100 text-[#64748b] ring-[#d1e7dd]',
  };
  const labels = {
    ACTIVE: 'Active', INACTIVE: 'Inactive', PENDING: 'Pending',
    APPROVED: 'Approved', REJECTED: 'Rejected', SUSPENDED: 'Suspended',
    RESOLVED: 'Resolved', INVESTIGATING: 'Investigating', OPEN: 'Open', CLOSED: 'Closed',
  };
  return (
    <span className={`badge ring-1 ${configs[status] || 'badge-unknown'}`}>
      {labels[status] || status}
    </span>
  );
};
