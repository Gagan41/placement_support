'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function StudentTintPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/tint').then(setMaterials).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Training & Interview Notes Toolkit (TINT)</h2>
      
      {loading ? <p>Loading toolkit...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {['aptitude', 'logical', 'verbal', 'interview'].map(cat => (
            <div key={cat} className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-blue-600 tracking-wider mb-4 border-l-4 border-blue-600 pl-3">{cat}</h3>
              {materials.filter(m => m.category === cat).map(m => (
                <div key={m.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{m.title}</div>
                  <a 
                    href={m.file_url} 
                    target="_blank" 
                    className="inline-block bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    View Resource
                  </a>
                </div>
              ))}
              {materials.filter(m => m.category === cat).length === 0 && (
                <div className="text-sm text-gray-400 bg-gray-50 p-4 rounded italic">No resources available yet.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
