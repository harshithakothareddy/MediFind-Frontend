import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search, Bell, Heart, User, Menu, X, ChevronDown,
  LogOut, Settings, LayoutDashboard, Store, ShieldCheck,
  Pill, MapPin, Info, HelpCircle, Stethoscope, Clock, Scale, Package, FileText, Camera
} from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: null },
  { label: 'Find Medicine', path: '/medicines', icon: Pill },
  { label: 'Scan Rx', path: '/scan-prescription', icon: Camera },
  { label: 'Pharmacies', path: '/pharmacies', icon: Store },
  { label: 'Compare', path: '/compare', icon: Scale },
  { label: 'Nearby', path: '/nearby', icon: MapPin },
  { label: 'About', path: '/about', icon: Info },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('You have been logged out.');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'PHARMACY') return '/pharmacy/dashboard';
    return '/user/dashboard';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-glass border-b border-neutral-200/80 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-sm">
                <Stethoscope className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-[#12352b]">
                Medi<span className="text-[#059669]">Find</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#064e3b] bg-[#d1fae5] font-semibold shadow-xs'
                      : 'text-[#12352b] hover:text-[#064e3b] hover:bg-[#d1fae5]/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Search icon */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-card-xl border border-neutral-200 p-3 animate-slide-down">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input pl-9 pr-4"
                          placeholder="Search medicines, pharmacies..."
                        />
                      </div>
                    </form>
                    <p className="text-xs text-neutral-400 mt-2 px-1">Press Enter to search</p>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin/notifications' : user?.role === 'PHARMACY' ? '/pharmacy/notifications' : '/user/alerts'}
                    className="relative p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Favorites (user only) */}
                  {user?.role === 'USER' && (
                    <Link
                      to="/user/saved-medicines"
                      className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                      aria-label="Saved Medicines"
                    >
                      <Heart className="w-5 h-5" />
                    </Link>
                  )}
                  {user?.role === 'USER' && (
                    <Link to="/user/prescriptions" className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors" aria-label="Prescriptions">
                      <FileText className="w-5 h-5" />
                    </Link>
                  )}

                  {/* Profile */}
                  <div ref={profileRef} className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-[#12352b] max-w-24 truncate">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-xl border border-[#d1e7dd] py-2 animate-slide-down">
                        <div className="px-4 py-2 border-b border-[#d1e7dd]/60 mb-1">
                          <p className="text-sm font-semibold text-[#12352b] truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-[#64748b] truncate">{user?.email}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#d1fae5] text-[#064e3b] mt-1 inline-block">
                            {user?.role}
                          </span>
                        </div>
                        
                        <Link to={getDashboardPath()} className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        
                        {user?.role === 'USER' && (
                          <>
                            <Link to="/user/reservations" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <Clock className="w-4 h-4" />
                              My Reservations
                            </Link>
                            <Link to="/user/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                          </>
                        )}
                        {user?.role === 'PHARMACY' && (
                          <>
                            <Link to="/pharmacy/inventory" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <Package className="w-4 h-4" />
                              Inventory
                            </Link>
                            <Link to="/pharmacy/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <Settings className="w-4 h-4" />
                              Pharmacy Profile
                            </Link>
                          </>
                        )}
                        {user?.role === 'ADMIN' && (
                          <>
                            <Link to="/admin/pharmacies" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <Store className="w-4 h-4" />
                              Pharmacies
                            </Link>
                            <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-[#12352b] hover:bg-[#f0fdf4] hover:text-[#064e3b]">
                              <ShieldCheck className="w-4 h-4" />
                              Admin Settings
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-[#d1e7dd]/60 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#d1fae5] text-[#064e3b] border border-[#a7f3d0] hover:bg-[#a7f3d0]/60 transition-colors"
                    title="Explore preloaded demo dashboards"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    <span>Demo</span>
                  </Link>
                  <Link to="/login" className="hidden sm:block px-3 py-2 text-sm font-medium text-[#12352b] hover:text-[#064e3b] transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm px-4 py-2">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors ml-1"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bottom-0 bg-white overflow-y-auto animate-slide-down">
            <div className="p-4 space-y-1">
              {/* User info if logged in */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-neutral-500">{user?.email}</p>
                  </div>
                </div>
              )}

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-primary-700 bg-primary-50' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-neutral-100 mt-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardPath()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                      Login
                    </Link>
                    <Link to="/register" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50">
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
