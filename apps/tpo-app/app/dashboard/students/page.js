'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/analytics/tpo/students')
      .then((data) => {
        setStudents(data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Enrolled Students</h2>

      {loading ? (
        <p className="text-gray-500">Loading student directory...</p>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Violations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.violations > 0 ? (
                      <div className="group relative inline-block">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide cursor-help">
                          {student.violations} Detected
                        </span>
                        {/* Tooltip for details */}
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 hidden group-hover:block z-10 shadow-lg">
                          <div className="font-bold mb-1 border-b border-slate-600 pb-1">Activity Log</div>
                          <div className="flex justify-between"><span>Tab Switch:</span> <span>{student.violationDetails?.tab_switches}</span></div>
                          <div className="flex justify-between"><span>Window Blur:</span> <span>{student.violationDetails?.window_blur}</span></div>
                          <div className="flex justify-between"><span>Fast Ans:</span> <span>{student.violationDetails?.fast_answering}</span></div>
                        </div>
                      </div>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wide">
                        Clean
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No students enrolled yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
