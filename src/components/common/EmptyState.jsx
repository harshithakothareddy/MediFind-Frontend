import React from 'react';
import { PackageSearch, Heart, Bell, FileText, Store, AlertTriangle, WifiOff, ServerCrash } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const icons = {
  medicines: PackageSearch,
  pharmacies: Store,
  favorites: Heart,
  alerts: Bell,
  reports: FileText,
  notifications: Bell,
  inventory: PackageSearch,
  default: PackageSearch,
};

export const EmptyState = ({
  type = 'default',
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  icon: CustomIcon,
}) => {
  const navigate = useNavigate();
  const Icon = CustomIcon || icons[type] || icons.default;
  
  const handleAction = () => {
    if (onAction) onAction();
    else if (actionPath) navigate(actionPath);
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">{title || 'Nothing here yet'}</h3>
      {description && (
        <p className="text-neutral-500 text-sm max-w-sm mb-6">{description}</p>
      )}
      {(actionLabel && (actionPath || onAction)) && (
        <Button variant="primary" size="md" onClick={handleAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We were unable to load the data. Please try again.',
  onRetry,
  showHome = true,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">{title}</h3>
      <p className="text-neutral-500 text-sm max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button variant="primary" size="md" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {showHome && (
          <Button variant="secondary" size="md" onClick={() => navigate('/')}>
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
};

export const NetworkErrorState = ({ onRetry }) => (
  <ErrorState
    title="Unable to Connect"
    description="Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

export const NotFoundState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-8xl font-black text-neutral-200 mb-4">404</div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Page Not Found</h2>
      <p className="text-neutral-500 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};

export const ForbiddenState = ({ userRole }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <ServerCrash className="w-10 h-10 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">Access Denied</h2>
      <p className="text-neutral-500 mb-2 max-w-sm">You don't have permission to access this page.</p>
      {userRole && <p className="text-sm text-neutral-400 mb-8">Your role: <span className="font-medium capitalize">{userRole.toLowerCase()}</span></p>}
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};

export default EmptyState;
