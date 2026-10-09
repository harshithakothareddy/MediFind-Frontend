import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { LogOut, X, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';

const Sidebar = ({ navItems, title, collapsible = true }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Logged out successfully.');
    navigate('/');
  };

  /* ── inner content ───────────────────────────────────────────── */
  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${collapsed && !mobile ? 'items-center' : ''}`}>

      {/* Logo row */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-emerald-900/40 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && (
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-sm">
              <Stethoscope className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-base font-bold text-white">
                Medi<span className="text-[#a7f3d0]">Find</span>
              </span>
              {title && <p className="text-[10px] text-emerald-200/70 font-medium leading-tight">{title}</p>}
            </div>
          </Link>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-sm">
            <Stethoscope className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          if (item.divider) {
            return <div key={item.key} className="border-t border-emerald-900/40 my-2" />;
          }
          if (item.label === 'Logout') {
            return (
              <button
                key="logout"
                onClick={handleLogout}
                className={`sidebar-link w-full text-red-300 hover:bg-red-500/20 hover:text-red-200 ${
                  collapsed && !mobile ? 'justify-center px-2' : ''
                }`}
                title={collapsed && !mobile ? 'Logout' : undefined}
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {(!collapsed || mobile) && <span>Logout</span>}
              </button>
            );
          }
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={mobile ? () => setMobileOpen(false) : undefined}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''} ${
                collapsed && !mobile ? 'justify-center px-2' : ''
              }`}
              title={collapsed && !mobile ? item.label : undefined}
            >
              {item.icon && (
                <item.icon className="w-4 h-4 flex-shrink-0" />
              )}
              {(!collapsed || mobile) && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {(!collapsed || mobile) && item.badge != null && (
                <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {(!collapsed || mobile) && (
        <div className="px-3 pb-4 border-t border-emerald-900/40 pt-3">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#022c22]/50 border border-emerald-800/40">
            <div className="w-8 h-8 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-emerald-200/70 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      {collapsible && !mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center p-3 border-t border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />
          }
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar border-r border-white/10 shadow-lg
                    transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-4 top-20 z-30 p-2.5 bg-sidebar rounded-xl shadow-card-md border border-white/10 text-slate-300 hover:text-white"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar shadow-card-xl animate-slide-in-right">
            <SidebarContent mobile />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
