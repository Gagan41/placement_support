'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Data
  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState(null);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // STEP 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.otpId === 'simulation') {
        // If user not found, we still show success but don't proceed to OTP step implicitly?
        // OR we just simulate it. Ideally we guide them to OTP.
        // For security, 'simulation' means we didn't actually send it because user doesn't exist,
        // but we pretend we did.
        // If it's a real user, we get a real otpId.
        setMessage('If an account exists with this email, an OTP has been sent.');
      } else {
        setOtpId(res.otpId);
        setStep(2);
        setMessage('OTP sent successfully. Please check your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await apiFetch('/auth/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ otpId, otp }),
      });

      setResetToken(res.resetToken);
      setStep(3);
      setMessage('OTP verified. Please enter your new password.');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
        await apiFetch('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, newPassword }),
        });
        
        // Success
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } catch (err) {
        setError(err.message || 'Failed to reset password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 shadow rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step {step} of 3
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {message && (
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-700">
            {message}
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={handleRequestOtp}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 text-gray-700"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
             <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                placeholder="Enter the 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-green-600 py-2 text-white font-semibold hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-2"
            >
                Back to Email
            </button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="newPass" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPass"
                type="password"
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Set New Password'}
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
