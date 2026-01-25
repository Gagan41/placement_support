'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user.role !== 'admin') {
        throw new Error('Access denied: You are not a Super Admin');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-gray-900 p-10 rounded-xl border border-gray-800">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Super Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400 font-mono">
            System Level Governance
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-950/30 border border-red-500/50 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="email"
              required
              className="block w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="block w-full bg-black border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Decrypting...' : 'Initialize Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
