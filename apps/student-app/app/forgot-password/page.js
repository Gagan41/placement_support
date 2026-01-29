'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Mail,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

/* ===========================
   OTP LOCK HELPERS (SAME AS LOGIN)
=========================== */
const LOCK_KEY = 'otp_lock_until';

function setOtpLock(seconds) {
  const until = Date.now() + seconds * 1000;
  localStorage.setItem(LOCK_KEY, until.toString());
}

function getOtpLockRemaining() {
  const until = localStorage.getItem(LOCK_KEY);
  if (!until) return null;

  const remaining = Math.ceil((+until - Date.now()) / 1000);
  return remaining > 0 ? remaining : null;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔒 OTP lock timer (seconds)
  const [lockSeconds, setLockSeconds] = useState(null);

  /* ===========================
     RESTORE LOCK ON LOAD
  =========================== */
  useEffect(() => {
    const remaining = getOtpLockRemaining();
    if (remaining) {
      setLockSeconds(remaining);
    }
  }, []);

  /* ===========================
     LIVE COUNTDOWN (REAL)
  =========================== */
  useEffect(() => {
    if (lockSeconds === null) return;

    if (lockSeconds <= 0) {
      setLockSeconds(null);
      localStorage.removeItem(LOCK_KEY);
      setError('');
      return;
    }

    setError(
      `Too many attempts. Please wait ${Math.floor(lockSeconds / 60)}:${String(
        lockSeconds % 60
      ).padStart(2, '0')}`
    );

    const timer = setInterval(() => {
      setLockSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockSeconds]);

  /* ===========================
     STEP 1: REQUEST OTP
  =========================== */
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (lockSeconds !== null) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() })
      });

      if (res.otpId === 'simulation') {
        setMessage('If an account exists, an OTP has been sent.');
      } else {
        setOtpId(res.otpId);
        setStep(2);
        setMessage('OTP sent successfully. Please check your email.');
      }
    } catch (err) {
      if (err?.retry_after_seconds) {
        setOtpLock(err.retry_after_seconds);
        setLockSeconds(err.retry_after_seconds);
      } else {
        setError(err?.error || 'Failed to request OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     STEP 2: VERIFY OTP
  =========================== */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (lockSeconds !== null) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await apiFetch('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ otpId, otp })
      });

      setResetToken(res.resetToken);
      setStep(3);
      setMessage('OTP verified. Please enter your new password.');
    } catch (err) {
      if (err?.retry_after_seconds) {
        setOtpLock(err.retry_after_seconds);
        setLockSeconds(err.retry_after_seconds);
      } else {
        setError(err?.error || 'Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     STEP 3: RESET PASSWORD
  =========================== */
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword })
      });

      setMessage('Password reset successfully! Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     UI (UNCHANGED)
  =========================== */
  return (
    <div className="flex w-screen h-screen bg-white overflow-hidden fixed inset-0">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <img
            src="https://lh3.googleusercontent.com/u/0/d/1ysdqL_ctFSrS1X_J6WonTvcHa5hBipE3"
            alt="Reset Illustration"
            className="max-w-md w-full max-h-[65vh] object-contain drop-shadow-2xl rounded-3xl"
          />
          <div className="mt-8 text-center max-w-sm">
            <h1 className="text-2xl xl:text-3xl font-black text-blue-900 leading-tight">
              Secure Your Account
            </h1>
            <p className="mt-2 text-blue-600 font-medium text-sm xl:text-base">
              Follow the steps to regain access to your placement dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 bg-white overflow-hidden">
        <div className="w-full max-w-md flex flex-col">

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-gray-900">
              {step === 1 && 'Forgot Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'New Password'}
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-xs text-green-700">
              {message}
            </div>
          )}

          <div className="flex-1">

            {/* STEP 1 */}
            {step === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-base text-gray-900 font-bold outline-none transition-all shadow-sm"
                    placeholder="student@kit.edu"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Send Reset Code'}
                </button>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={lockSeconds !== null}
                  className="block w-full text-center text-4xl tracking-[0.5em] font-mono py-6 border-2 rounded-3xl"
                  placeholder="000000"
                />
                <button
                  type="submit"
                  disabled={lockSeconds !== null}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold"
                >
                  Verify Code
                </button>
              </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full py-3 px-4 rounded-2xl border"
                  placeholder="New Password"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 px-4 rounded-2xl border"
                  placeholder="Confirm Password"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-green-600 text-white font-bold"
                >
                  Update Password
                </button>
              </form>
            )}

          </div>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs font-bold text-blue-600">
              Back to Student Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
