import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, Stethoscope, ArrowRight, CheckCircle } from 'lucide-react';
import { loginUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useSelector((state) => state.auth);
  
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const redirectPath = searchParams.get('redirect');
  const sessionExpired = searchParams.get('session') === 'expired';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    
    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! Logged in successfully.');
      const role = result.payload.user?.role;
      const redirect = redirectPath || (role === 'ADMIN' ? '/admin/dashboard' : role === 'PHARMACY' ? '/pharmacy/dashboard' : '/user/dashboard');
      navigate(redirect);
    } else {
      toast.error(result.payload || 'Invalid email or password. Please try again.');
    }
  };

  const handleDemoLogin = async (email, password) => {
    setForm({ email, password, rememberMe: true });
    setErrors({});
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Logged in as ${result.payload.user?.role || 'Demo User'}!`);
      const role = result.payload.user?.role;
      const redirect = redirectPath || (role === 'ADMIN' ? '/admin/dashboard' : role === 'PHARMACY' ? '/pharmacy/dashboard' : '/user/dashboard');
      navigate(redirect);
    } else {
      toast.error(result.payload || 'Demo login failed. Make sure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#047857] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-hero-pattern opacity-20" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="w-20 h-20 bg-[#022c22]/40 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#a7f3d0]/30 shadow-lg">
            <Stethoscope className="w-10 h-10 text-[#a7f3d0]" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Welcome Back to MediFind</h2>
          <p className="text-[#d1fae5] mb-8 leading-relaxed">Your trusted platform for medicine availability and pharmacy information.</p>
          <div className="space-y-3 text-left">
            {['Real-time medicine availability', 'Verified pharmacy network', 'Smart inventory management', 'Back-in-stock alerts'].map(item => (
              <div key={item} className="flex items-center gap-3 text-[#d1fae5]">
                <CheckCircle className="w-4 h-4 text-[#a7f3d0] flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decoration */}
        <div className="absolute bottom-10 left-10 right-10 text-center text-[#a7f3d0]/70 text-xs">
          MediFind · Healthcare Platform
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f0fdf4] overflow-y-auto">
        <div className="w-full max-w-md my-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-md">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-[#12352b]">Medi<span className="text-[#059669]">Find</span></span>
          </div>

          {/* Quick Demo Access Box */}
          <div className="mb-6 rounded-2xl bg-[#d1fae5]/50 border border-[#a7f3d0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#064e3b]">
                  ⚡ 1-Click Demo Login
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#064e3b] bg-white px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                Live Portfolio Demo
              </span>
            </div>

            <p className="text-xs text-neutral-600 mb-3">
              Click below to instantly access the pre-configured dashboards:
            </p>

            {/* Pharmacy Demo Button - Highlighted */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('pharmacy@demo.medifind', 'pharmacy123')}
                disabled={loading}
                className="w-full group text-left p-3 rounded-xl bg-white border-2 border-primary-500/30 hover:border-primary-500 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    🏥
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900">Pharmacy Dashboard</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        15 Medicines Seeded
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      pharmacy@demo.medifind (Pass: pharmacy123)
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Enter <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('user@demo.medifind', 'user123')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white/90 border border-neutral-200 hover:border-neutral-400 hover:bg-white text-left transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">👤</span>
                    <span className="text-xs font-bold text-neutral-800">Patient Demo</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate">user@demo.medifind</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@demo.medifind', 'admin123')}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white/90 border border-neutral-200 hover:border-neutral-400 hover:bg-white text-left transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">🛡️</span>
                    <span className="text-xs font-bold text-neutral-800">Admin Demo</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate">admin@demo.medifind</p>
                </button>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">Sign In</h1>
              <p className="text-neutral-500 mt-1 text-sm">Or sign in with custom credentials</p>
            </div>

            {sessionExpired && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-xs mt-0.5">⚠</span>
                  <p className="text-amber-700 text-xs">Your session expired. Please login again.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('session');
                    navigate({ search: newParams.toString() ? `?${newParams.toString()}` : '' }, { replace: true });
                  }}
                  className="text-amber-500 hover:text-amber-700 text-xs font-bold leading-none p-1"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                type="email"
                id="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                icon={Mail}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                icon={Lock}
                required
                autoComplete="current-password"
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                Sign In
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
