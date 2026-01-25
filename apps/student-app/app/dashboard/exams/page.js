'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function StudentExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/exams')
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight italic">Available Placement Exams</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Scanning Portal...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-between hover:scale-[1.02] transition-transform group">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors uppercase italic">{exam.title}</h3>
                <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <span>Duration:</span>
                    <span className="text-slate-600">{exam.duration} minutes</span>
                </div>
              </div>
              <Link 
                href={`/dashboard/exams/${exam.id}`} 
                className="w-full text-center bg-blue-700 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-800 shadow-lg hover:shadow-blue-200 transition-all"
              >
                Launch Assessment
              </Link>
            </div>
          ))}
          {exams.length === 0 && (
            <div className="col-span-3 bg-white p-20 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No active assessments in your sector.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
