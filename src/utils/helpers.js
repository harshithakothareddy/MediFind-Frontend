// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

export const formatPrice = (price, currency = '₹') => {
  if (price === null || price === undefined) return 'N/A';
  return `${currency}${Number(price).toFixed(2)}`;
};

export const getStockStatus = (quantity, threshold) => {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= threshold) return 'LOW_STOCK';
  return 'AVAILABLE';
};

export const getStockStatusLabel = (status) => {
  const map = {
    AVAILABLE: 'Available',
    LOW_STOCK: 'Low Stock',
    OUT_OF_STOCK: 'Out of Stock',
    UNKNOWN: 'Unknown',
  };
  return map[status] || status;
};

export const getStatusConfig = (status) => {
  const configs = {
    AVAILABLE: {
      label: 'Available',
      className: 'badge-available',
      dotClass: 'bg-green-500',
      icon: '●',
    },
    LOW_STOCK: {
      label: 'Low Stock',
      className: 'badge-lowstock',
      dotClass: 'bg-amber-500',
      icon: '●',
    },
    OUT_OF_STOCK: {
      label: 'Out of Stock',
      className: 'badge-outofstock',
      dotClass: 'bg-red-500',
      icon: '●',
    },
    UNKNOWN: {
      label: 'Unknown',
      className: 'badge-unknown',
      dotClass: 'bg-neutral-400',
      icon: '●',
    },
  };
  return configs[status] || configs.UNKNOWN;
};

export const isPharmacyOpen = (opensAt, closesAt) => {
  const now = new Date();
  const [openH, openM] = opensAt.split(':').map(Number);
  const [closeH, closeM] = closesAt.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (openMinutes === 0 && closeMinutes === 1439) return true; // 24 hours
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

export const getPharmacyStatusText = (opensAt, closesAt) => {
  if (isPharmacyOpen(opensAt, closesAt)) {
    const [closeH, closeM] = closesAt.split(':').map(Number);
    const closeTime = new Date();
    closeTime.setHours(closeH, closeM);
    return `Closes at ${closeTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    const [openH, openM] = opensAt.split(':').map(Number);
    const openTime = new Date();
    openTime.setHours(openH, openM);
    return `Opens at ${openTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
};

export const truncate = (str, n = 50) => {
  if (!str) return '';
  return str.length > n ? str.substring(0, n) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const getRoleLabel = (role) => {
  const map = { USER: 'Patient / User', PHARMACY: 'Pharmacy', ADMIN: 'Administrator' };
  return map[role] || role;
};

export const getGreeting = (name = '') => {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';
  return name ? `${greeting}, ${name}` : greeting;
};

export const generateChartLabels = (days = 7) => {
  const labels = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
  }
  return labels;
};

export const generateDemoChartData = (days = 7, min = 10, max = 100) => {
  return Array.from({ length: days }, () => Math.floor(Math.random() * (max - min) + min));
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
