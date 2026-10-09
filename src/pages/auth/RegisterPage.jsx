import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, Stethoscope, CheckCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../api/authService';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { MEDICINE_CATEGORIES } from '../../constants/demoData';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('USER');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    // Pharmacy fields
    pharmacyName: '', ownerName: '', address: '', licenseNumber: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const err = (key, msg) => setErrors(e => ({ ...e, [key]: msg }));
  const clearErr = (key) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const validateStep1 = () => {
    const errs = {};
    const nameParts = form.name.trim().split(/\s+/);
    if (!form.name.trim()) errs.name = 'Full name is required';
    else if (nameParts.length < 2 || nameParts[0].length < 2 || nameParts.slice(1).join(' ').length < 2) {
      errs.name = 'Enter your first and last name';
    }
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit phone number';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[A-Z])/.test(form.password)) errs.password = 'Must contain at least one uppercase letter';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (role === 'PHARMACY') {
      if (!form.pharmacyName.trim()) errs.pharmacyName = 'Pharmacy name is required';
      if (!form.address.trim()) errs.address = 'Address is required';
      if (!form.licenseNumber.trim()) errs.licenseNumber = 'License number is required';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    
    try {
      setLoading(true);
      const nameParts = form.name.trim().split(/\s+/);
      const phoneDigits = form.phone.replace(/\D/g, '');
      const payload = {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        email: form.email,
        phone: phoneDigits.slice(-10),
        password: form.password,
        role,
        ...(role === 'PHARMACY' ? {
          pharmacyName: form.pharmacyName,
          ownerName: form.ownerName || form.name,
          address: form.address,
          licenseNumber: form.licenseNumber,
        } : {}),
      };
      
      if (role === 'PHARMACY') {
        await authService.registerPharmacy(payload);
      } else {
        await authService.register(payload);
      }
      
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(form.password);
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-md">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-[#12352b]">Medi<span className="text-[#059669]">Find</span></span>
        </div>

        <div className="card p-8 bg-white border border-[#d1e7dd]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#12352b]">Create Account</h1>
            <p className="text-[#64748b] mt-1 text-sm">Step {step} of 2 — {step === 1 ? 'Basic Information' : 'Account Setup'}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-neutral-200'}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-neutral-200'}`} />
          </div>

          {/* Role selector */}
          {step === 1 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-neutral-700 mb-2">I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                {['USER', 'PHARMACY'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                      role === r ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {r === 'USER' ? <User className={`w-5 h-5 ${role === r ? 'text-primary-600' : 'text-neutral-400'}`} /> : <Building2 className={`w-5 h-5 ${role === r ? 'text-primary-600' : 'text-neutral-400'}`} />}
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${role === r ? 'text-primary-700' : 'text-neutral-700'}`}>{r === 'USER' ? 'Patient / User' : 'Pharmacy'}</p>
                      <p className="text-xs text-neutral-400">{r === 'USER' ? 'Search medicines' : 'Manage inventory'}</p>
                    </div>
                    {role === r && <CheckCircle className="w-4 h-4 text-primary-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Input label="Full Name" id="name" placeholder="John Doe" value={form.name} onChange={e => { set('name', e.target.value); clearErr('name'); }} error={errors.name} icon={User} required />
              <Input label="Email Address" type="email" id="email" placeholder="you@example.com" value={form.email} onChange={e => { set('email', e.target.value); clearErr('email'); }} error={errors.email} icon={Mail} required />
              <Input label="Phone Number" type="tel" id="phone" placeholder="+91 98000 00000" value={form.phone} onChange={e => { set('phone', e.target.value); clearErr('phone'); }} error={errors.phone} icon={Phone} required />
              <Button type="button" variant="primary" size="lg" className="w-full mt-2" onClick={handleNext}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === 'PHARMACY' && (
                <>
                  <Input label="Pharmacy Name" id="pharmacyName" placeholder="City Care Pharmacy" value={form.pharmacyName} onChange={e => { set('pharmacyName', e.target.value); clearErr('pharmacyName'); }} error={errors.pharmacyName} icon={Building2} required />
                  <Input label="Pharmacy Address" id="address" placeholder="Full address with city" value={form.address} onChange={e => { set('address', e.target.value); clearErr('address'); }} error={errors.address} required />
                  <Input label="License / Registration Number" id="licenseNumber" placeholder="License number for verification" value={form.licenseNumber} onChange={e => { set('licenseNumber', e.target.value); clearErr('licenseNumber'); }} error={errors.licenseNumber} required hint="Required for pharmacy verification" />
                </>
              )}
              
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                id="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => { set('password', e.target.value); clearErr('password'); }}
                error={errors.password}
                icon={Lock}
                required
                rightElement={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-neutral-400 hover:text-neutral-600"><br/>
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              
              {/* Password strength */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? strengthColors[strength - 1] : 'bg-neutral-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : 'text-green-600'}`}>
                    Password strength: {strengthLabels[strength - 1] || 'Too weak'}
                  </p>
                </div>
              )}

              <Input
                label="Confirm Password"
                type={showConfirmPw ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={e => { set('confirmPassword', e.target.value); clearErr('confirmPassword'); }}
                error={errors.confirmPassword}
                icon={Lock}
                required
                rightElement={
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-neutral-400 hover:text-neutral-600">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {role === 'PHARMACY' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Verification Required:</strong> Pharmacy accounts require verification before being listed publicly. You can manage your inventory after registration.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
                  {role === 'PHARMACY' ? 'Register Pharmacy' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-5 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
