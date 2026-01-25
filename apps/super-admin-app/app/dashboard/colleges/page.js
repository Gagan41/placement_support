'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollegeName, setNewCollegeName] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const data = await apiFetch('/colleges');
      setColleges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/colleges', {
        method: 'POST',
        body: JSON.stringify({ name: newCollegeName }),
      });
      setNewCollegeName('');
      fetchColleges();
    } catch (err) {
      alert('Failed to add college');
    }
  };

  return (
    <div className="p-12 text-white">
      <h2 className="text-3xl font-black mb-10 text-red-600">COLLEGE ONBOARDING</h2>

      <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg mb-12">
        <h3 className="text-xl font-bold mb-6">Register New Institution</h3>
        <form onSubmit={handleAddCollege} className="flex gap-4">
          <input 
            type="text" required
            className="flex-1 bg-black border border-gray-700 rounded-md px-4 py-2 text-white focus:border-red-600"
            placeholder="Official College Name"
            value={newCollegeName}
            onChange={e => setNewCollegeName(e.target.value)}
          />
          <button type="submit" className="bg-red-600 text-white px-8 py-2 rounded font-bold hover:bg-red-700">
            PROVISION
          </button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-800 bg-black text-gray-500 text-xs uppercase font-black">
            <tr>
              <th className="px-6 py-4">College ID</th>
              <th className="px-6 py-4">Institution Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center animate-pulse">Scanning system registry...</td></tr>
            ) : colleges.map(c => (
              <tr key={c.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 font-mono text-xs text-blue-400">{c.id}</td>
                <td className="px-6 py-4 font-bold">{c.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-black ${c.status === 'active' ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
