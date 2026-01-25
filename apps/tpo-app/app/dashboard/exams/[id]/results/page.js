'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ExamResultsPage() {
  const { id: examId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      apiFetch(`/analytics/tpo/exam-stats/${examId}`)
        .then(setData)
        .finally(() => setLoading(false));
  }, [examId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Exam Participation & Results</h2>

      {loading ? <p>Calculating statistics...</p> : (
        <div className="space-y-8">
            <div className="bg-blue-900 p-8 rounded-xl text-white flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="text-blue-200 uppercase text-xs font-bold tracking-widest mb-1">Total Participation</h3>
                    <div className="text-5xl font-black">{data.total_attempts}</div>
                </div>
                <div className="text-right">
                    <div className="text-blue-200 uppercase text-xs font-bold tracking-widest mb-1">Audit Status</div>
                    <div className="text-xl font-bold">Secure</div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Final Score</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Integrity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.results.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{r.student_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{r.student_email}</td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-green-600">{r.score}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors">
                                        View Logs
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}
