'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function GlobalLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/integrity-logs')
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-12 text-white">
      <h2 className="text-3xl font-black mb-10 text-red-600 italic underline decoration-gray-800 underline-offset-8">SYSTEM AUDIT LOGS</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-800 bg-black text-gray-500 text-xs uppercase font-black">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Exam</th>
              <th className="px-6 py-4">Incident Type</th>
              <th className="px-6 py-4">Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center animate-pulse font-mono text-read-400">Intercepting data streams...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-red-950/20 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-bold">{log.student_name}</td>
                <td className="px-6 py-4 text-gray-300">{log.exam_title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-500/30 text-[10px] uppercase font-black">
                    {log.type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-xs truncate">
                  {JSON.stringify(log.metadata)}
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr><td colSpan="5" className="p-20 text-center text-gray-600 italic">No integrity incidents flagged in current epoch.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
