'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function TPOManagementPage() {
  const [tpos, setTpos] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', college_id: '' });

  useEffect(() => {
    Promise.all([
      apiFetch('/auth/users?role=tpo'), // Need to implement this backend filter
      apiFetch('/colleges')
    ]).then(([tposData, collegesData]) => {
      setTpos(tposData);
      setColleges(collegesData);
    }).finally(() => setLoading(false));
  }, []);

  const handleCreateTPO = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...formData, role: 'tpo' }),
      });
      alert('TPO Account Created');
      setFormData({ name: '', email: '', password: '', college_id: '' });
      // Refresh list
      apiFetch('/auth/users?role=tpo').then(setTpos);
    } catch (err) {
      alert(err.message || 'Failed to create TPO');
    }
  };

  return (
    <div className="p-12 text-white">
      <h2 className="text-3xl font-black mb-10 text-red-600">TPO MANAGEMENT</h2>

      <div className="bg-gray-900 border border-gray-800 p-8 rounded-lg mb-12">
        <h3 className="text-xl font-bold mb-6 italic">Provision TPO Access</h3>
        <form onSubmit={handleCreateTPO} className="grid grid-cols-2 gap-4">
          <input 
            type="text" required className="bg-black border border-gray-700 rounded px-4 py-2" placeholder="Full Name"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" required className="bg-black border border-gray-700 rounded px-4 py-2" placeholder="Email Address"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" required className="bg-black border border-gray-700 rounded px-4 py-2" placeholder="Temporary Password"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <select 
            required className="bg-black border border-gray-700 rounded px-4 py-2"
            value={formData.college_id} onChange={e => setFormData({...formData, college_id: e.target.value})}
          >
            <option value="">Select Target College</option>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="col-span-2 bg-red-600 font-bold py-2 rounded hover:bg-red-700 mt-2 transition-colors">
            GRANT PRIVILEGED ACCESS
          </button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-black text-gray-500 text-xs font-black uppercase">
            <tr>
              <th className="px-6 py-4 border-b border-gray-800">TPO Name</th>
              <th className="px-6 py-4 border-b border-gray-800">Email</th>
              <th className="px-6 py-4 border-b border-gray-800">Assigned Institutional ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {tpos.map(t => (
              <tr key={t.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 font-bold">{t.name}</td>
                <td className="px-6 py-4 text-gray-400">{t.email}</td>
                <td className="px-6 py-4 font-mono text-xs text-blue-500">{t.college_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
