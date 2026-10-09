import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Stethoscope, CheckCircle } from 'lucide-react';
import { authService } from '../../api/authService';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }
    setError('');
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent.');
    } catch (err) {
      toast.error('Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#0f766e] rounded-xl flex items-center justify-center shadow-md">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-[#12352b]">Medi<span className="text-[#059669]">Find</span></span>
        </div>
        
        <div className="card p-8 bg-white border border-[#d1e7dd]">
          {!sent ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#12352b]">Forgot Password?</h1>
                <p className="text-[#64748b] text-sm mt-1">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  error={error}
                  icon={Mail}
                  required
                />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Check Your Email</h2>
              <p className="text-neutral-500 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-neutral-400 mb-4">Didn't receive it? Check spam or{' '}
                <button onClick={() => setSent(false)} className="text-primary-600 font-semibold">try again</button>
              </p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
