import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ForbiddenState } from '../components/common/EmptyState';

// Protected route - requires authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkingSession } = useSelector((state) => state.auth);
  const location = useLocation();

  if (checkingSession) return null;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  return children;
};

// Role-based route
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, checkingSession } = useSelector((state) => state.auth);
  const location = useLocation();

  if (checkingSession) return null;
  
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

  if (checkingSession) return null;
  
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'PHARMACY') return <Navigate to="/pharmacy/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }
  
  return children;
};
