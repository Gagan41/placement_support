'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default function TPODashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    college_name: 'Loading...',
    exam_count: 0,
    student_count: 0,
    participation_rate: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    apiFetch('/analytics/tpo/dashboard-stats')
      .then(setStats)
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-gray-800">TPO App</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 bg-gray-800 rounded">Dashboard</Link>
          <Link href="/dashboard/exams" className="block px-4 py-2 hover:bg-gray-800 rounded">Manage Exams</Link>
          <Link href="/dashboard/tint" className="block px-4 py-2 hover:bg-gray-800 rounded">TINT toolkit</Link>
          <Link href="/dashboard/students" className="block px-4 py-2 hover:bg-gray-800 rounded">Students</Link>
        </nav>
        <button onClick={handleLogout} className="p-6 text-left hover:bg-red-900 transition-colors">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">TPO Dashboard</h2>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold border border-blue-100 flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-blue-400">College:</span>
            {stats.college_name}
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:border-blue-200 transition-all group">
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 group-hover:text-blue-500 transition-colors">Total Placement Exams</div>
            <div className="text-5xl font-black">{stats.exam_count}</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:border-green-200 transition-all group">
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 group-hover:text-green-500 transition-colors">Active Registered Students</div>
            <div className="text-5xl font-black">{stats.student_count}</div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:border-purple-200 transition-all group">
            <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 group-hover:text-purple-500 transition-colors">Exam Participation Rate</div>
            <div className="text-5xl font-black">{stats.participation_rate}%</div>
          </div>
        </div>
      </main>
    </div>
  );
}
