'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function StudentScoresPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/student/my-scores')
      .then(setScores)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">My Exam Performance</h2>
      
      {loading ? <p>Retrieving results...</p> : (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scores.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{s.exam_title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                      {s.score} Points
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-500 italic">No exam attempts recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
