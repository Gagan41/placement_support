'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ upcoming_exams: 0, completed_attempts: 0 });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    apiFetch('/analytics/student/dashboard-stats')
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow h-16 flex items-center justify-between px-8">
        <h1 className="text-xl font-bold text-blue-600">Student Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-500">
            Logout
          </button>
        </div>
      </nav>
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Dashboard</h2>
          <div className="flex gap-4">
            <Link href="/dashboard/exams" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all font-bold">Find Exams</Link>
            <Link href="/dashboard/tint" className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-all font-bold">TINT Toolkit</Link>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between group hover:border-blue-200 transition-all">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest group-hover:text-blue-500 transition-colors">Upcoming Exams</h3>
            <p className="text-4xl font-black text-slate-900">{stats.upcoming_exams}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between group hover:border-green-200 transition-all">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest group-hover:text-green-500 transition-colors">Completed Attempts</h3>
            <p className="text-4xl font-black text-slate-900">{stats.completed_attempts}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
