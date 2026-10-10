import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { ForbiddenState } from '../components/common/EmptyState';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-[#059669] animate-spin" />
      <p className="text-sm font-medium text-[#12352b]">Loading MediFind...</p>
    </div>
  </div>
);

// Protected route - requires authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkingSession } = useSelector((state) => state.auth);
  const location = useLocation();

  if (checkingSession) return <PageLoader />;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  return children;
};

// Role-based route
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, checkingSession } = useSelector((state) => state.auth);
  const location = useLocation();

  if (checkingSession) return <PageLoader />;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <ForbiddenState userRole={user?.role} />
      </div>
    );
  }
  
  return children;
};

// Public only route - redirect if authenticated
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, checkingSession } = useSelector((state) => state.auth);

  if (isAuthenticated && !checkingSession) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'PHARMACY') return <Navigate to="/pharmacy/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};
