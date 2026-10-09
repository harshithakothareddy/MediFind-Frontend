import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layers, User, Store, ShieldCheck, LogOut, ChevronUp,
  Sparkles, Check, ExternalLink, X
} from 'lucide-react';
import { setUser, clearAuth, loginUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const DEMO_CREDENTIALS = {
  USER: { email: 'user@demo.medifind', password: 'user123' },
  PHARMACY: { email: 'pharmacy@demo.medifind', password: 'pharmacy123' },
  ADMIN: { email: 'admin@demo.medifind', password: 'admin123' },
};

const DemoPortalSwitcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const switchRole = async (role, name, path) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      const result = await dispatch(loginUser(creds));
      if (loginUser.fulfilled.match(result)) {
        toast.success(`Switched to ${role} Portal via Spring Boot!`);
        navigate(path);
        setIsOpen(false);
        return;
      }
    }
    // Fallback if backend unreachable
    dispatch(setUser({
      id: role === 'ADMIN' ? 1 : role === 'PHARMACY' ? 2 : 3,
      name,
      email: creds ? creds.email : `${role.toLowerCase()}@medifind.com`,
      role,
      phone: '+91 98000 00001',
    }));
    toast.success(`Switched active view to ${role} Portal!`);
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.info('Logged out to Public Guest View');
    navigate('/');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Popover */}
      {isOpen && (
        <div className="mb-3 w-80 bg-neutral-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-card-xl border border-neutral-700/80 animate-slide-up space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Interactive Portal Switcher
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Instantly preview MediFind from any stakeholder's perspective:
          </p>

          <div className="space-y-1.5 text-xs">
            {/* User Button */}
            <button
              onClick={() => switchRole('USER', 'Aryan Sharma (Patient)', '/user/dashboard')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'USER'
                  ? 'bg-primary-600/30 border-primary-500/60 text-white font-semibold'
                  : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Patient Portal</span>
                  <span className="text-[10px] text-neutral-400 block">Holds, Saved Meds, Health Alerts</span>
                </div>
              </div>
              {user?.role === 'USER' && <Check className="w-4 h-4 text-primary-400 shrink-0" />}
            </button>

            {/* Pharmacy Button */}
            <button
              onClick={() => switchRole('PHARMACY', 'Apollo Pharmacy (Manager)', '/pharmacy/dashboard')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'PHARMACY'
                  ? 'bg-teal-600/30 border-teal-500/60 text-white font-semibold'
                  : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Pharmacy Portal</span>
                  <span className="text-[10px] text-neutral-400 block">Stock POS, Pickup Queue, Demand Trends</span>
                </div>
              </div>
              {user?.role === 'PHARMACY' && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
            </button>

            {/* Admin Button */}
            <button
              onClick={() => switchRole('ADMIN', 'Super Administrator', '/admin/dashboard')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-600/30 border-purple-500/60 text-white font-semibold'
                  : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Super Admin Portal</span>
                  <span className="text-[10px] text-neutral-400 block">Licenses, Drug DB, Platform Telemetry</span>
                </div>
              </div>
              {user?.role === 'ADMIN' && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Switch to Guest Mode
              </button>
            ) : (
              <span className="text-[11px] text-neutral-400">Current: Public Guest View</span>
            )}

            <button
              onClick={() => {
                navigate('/search');
                setIsOpen(false);
              }}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              Live Search →
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-bold shadow-lg border border-neutral-700/80 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
      >
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
        <Layers className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
        <span>Role Portals</span>
        {user?.role && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-neutral-800 text-teal-300">
            {user.role}
          </span>
        )}
      </button>
    </div>
  );
};

export default DemoPortalSwitcher;
