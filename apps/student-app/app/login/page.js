'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      if (res.status === 'OTP_REQUIRED') {
        setOtpId(res.otpId);
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ otpId, otp }),
      });

      if (res.user.role !== 'student') throw new Error('Access denied');

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Lax`;

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* --- LEFT SIDE: CENTRALIZED ILLUSTRATION --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements to reduce "empty" space */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
            <img 
              src="https://takafulcc.synergix.co.id/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogin.8b7a872f.jpg&w=640&q=75" 
              alt="Login Illustration" 
              className="max-w-md w-full drop-shadow-2xl rounded-3xl animate-in fade-in zoom-in duration-700"
            />
            <div className="mt-12 text-center max-w-sm">
              <h1 className="text-3xl font-black text-blue-900 leading-tight">
                Placement Guidance Platform
              </h1>
              <p className="mt-4 text-blue-600 font-medium leading-relaxed">
                Empowering students to reach their career goals with ease.
              </p>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM AREA --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Student Login</h2>
            <p className="mt-3 text-gray-500 font-medium">Access your dashboard and placement resources.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-pulse"></div>
              {error}
            </div>
          )}

          {!otpId ? (
            /* PHASE 1: EMAIL & PASSWORD */
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none transition-all shadow-sm text-gray-700"
                    placeholder="student@kit.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none transition-all shadow-sm text-gray-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all duration-300"
              >
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
                  <>Sign In <ArrowRight size={20} /></>
                )}
              </button>
            </form>
          ) : (
            /* PHASE 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-50 rounded-3xl p-6 text-center border border-blue-100">
                <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-blue-900">Check your email</h3>
                <p className="text-sm text-blue-700 mt-2 font-medium italic">Sent to {email}</p>
              </div>

              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full text-center text-4xl tracking-[0.4em] font-mono py-6 border-2 border-gray-100 rounded-3xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all bg-white shadow-inner text-gray-700"
                placeholder="000000"
              />
              <button
                type="submit"
                className="w-full py-4 text-base font-black rounded-2xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] text-gray-700"
              >
                Confirm Code
              </button>

              <button 
                type="button" 
                onClick={() => setOtpId(null)} 
                className="w-full text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center justify-center gap-2 uppercase tracking-widest transition-colors"
              >
                <RefreshCw size={14} /> Back to Sign In
              </button>
            </form>
          )}

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-gray-100 pt-8">
            <Link href="/signup" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4 decoration-2">
              New student? Register account
            </Link>
            <Link href="/forgot-password" className="text-sm font-bold text-blue-600 hover:underline underline-offset-4 decoration-2">
                Forgot password?
            </Link>

          </div>
          
        </div>
      </div>
    </div>
  );
}