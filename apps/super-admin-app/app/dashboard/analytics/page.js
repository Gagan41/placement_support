'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await apiFetch('/admin/analytics');
      
      // Process dates for charts
      const processedRegistrations = result.registrations.map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
      
      const processedAttempts = result.attempts.map(a => ({
        ...a,
        date: new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));

      setData({
        ...result,
        registrations: processedRegistrations,
        attempts: processedAttempts
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-red-500 animate-pulse font-mono flex flex-col items-center justify-center min-h-[50vh]">
         <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin mb-4"></div>
         INITIALIZING DEEP SYSTEM SCAN...
      </div>
    );
  }

  return (
    <div className="p-12 text-white pb-24">
      <h2 className="text-3xl font-black mb-10 italic underline decoration-red-600">SYSTEM ANALYTICS & MONITORING</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Registration Trend */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-6 tracking-widest">User Accretion (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.registrations}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Area type="monotone" dataKey="count" stroke="#ef4444" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Participation Trend */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-6 tracking-widest">Exam Engagement Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.attempts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-6 tracking-widest">User Node Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.roles}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="role"
                >
                  {data?.roles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Integrity Logs Breakdown */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-xs font-bold uppercase mb-6 tracking-widest">Security Integrity Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.integrityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="type"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data?.integrityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                <Legend iconType="rect" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
