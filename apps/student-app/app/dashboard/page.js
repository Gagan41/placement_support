'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Home,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Award,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import TextType from '@/components/TextType';
import ParticleCard from '@/components/ParticleCard';



const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function StudentDashboard() {
  const router = useRouter();
  const [user] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    availableTests: 0,
    averageScore: 0,
  });

  const [testScores, setTestScores] = useState([]);
  const [courseActivity, setCourseActivity] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, date: 15, month: new Date().getMonth(), year: new Date().getFullYear(), title: 'Java Exam' },
    { id: 2, date: 18, month: new Date().getMonth(), year: new Date().getFullYear(), title: 'DSA Test' },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('studentEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    apiFetch('/analytics/student/dashboard-stats')
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadScores() {
      try {
        const statsData = await apiFetch('/analytics/student/dashboard-stats');
        const scores = await apiFetch('/analytics/student/my-scores');

        if (!mounted) return;

        const upcoming = statsData?.upcoming_exams ?? 0;
        const completed = statsData?.completed_attempts ?? 0;
        const total = upcoming + completed;

        // compute average score
        const avg = scores && scores.length
          ? Math.round((scores.reduce((s, a) => s + (a.score || 0), 0) / scores.length) * 100) / 100
          : 0;

        setStats({
          totalTests: total,
          completedTests: completed,
          availableTests: upcoming,
          averageScore: avg,
        });

        setTestScores(scores || []);

        const colors = ['bg-blue-600','bg-indigo-600','bg-cyan-600','bg-teal-600','bg-purple-600','bg-pink-600'];
        const activity = (scores || []).map((s, i) => ({
          course: s.exam_title || `Test ${i + 1}`,
          score: s.score ?? 0,
          color: colors[i % colors.length],
        }));

        setCourseActivity(activity);
      } catch (err) {
        console.error('Failed to load scores', err);
      }
    }

    loadScores();
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#e8edff] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg rounded-r-3xl p-6">
        <div className="text-xl font-black text-blue-700 mb-10">
          🎓 LOGO
        </div>

        <nav className="space-y-4 text-slate-600">
          <SidebarItem icon={<Home size={18} />} label="Home" active />
          <SidebarItem icon={<ClipboardList size={18} />} label="Exams" />
          <SidebarItem icon={<BookOpen size={18} />} label="Materials" />
        </nav>

        <button
          onClick={handleLogout}
          className="mt-12 flex items-center gap-2 text-red-500 font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">
            <TextType
              text={`Hello, ${user?.name || 'Student'}`}
              typingSpeed={60}
              pauseDuration={1200}
              cursorCharacter="_"
              className="inline"
              showCursor
              textColors={["#7C3AED"]}
            />
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow">
              <Search size={16} className="text-slate-400" />
              <input
                placeholder="Search your course"
                className="ml-2 outline-none text-sm"
              />
            </div>

            <button className="relative p-2 text-slate-600 hover:text-blue-600 transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700">
              {user?.name?.charAt(0) || 'U'}
            </div>
              <span className="text-sm font-semibold">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Test" value={stats.totalTests} />
          <StatCard title="Completed Test" value={stats.completedTests} />
          <StatCard title="Available Tests" value={stats.availableTests} />
          <StatCard title="Average Score" value={stats.averageScore ? `${stats.averageScore}%` : '0%'} />
        </div>

        {/* Courses and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="font-bold mb-6 text-blue-700">Test Performance</h2>
            
            {/* Chart Container */}
            <div className="flex gap-4">
              {/* Y-axis (left) */}
              <div className="flex flex-col justify-between items-end pr-2 h-64 text-xs font-semibold text-slate-600">
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>
              </div>

              {/* Chart Area */}
              <div className="flex-1 flex flex-col">
                {/* Chart Bars */}
                <div className="flex items-end gap-2 h-64 border-l-2 border-slate-400 border-b-2 px-2 mb-2">
                  {courseActivity.map((test, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div
                        className="w-full max-w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-500"
                        style={{ height: `${test.score}%` }}
                        title={`${test.course}: ${test.score}%`}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* X-axis Labels (Test Numbers) */}
                <div className="flex gap-2 px-2">
                  {courseActivity.map((test, idx) => (
                    <div key={idx} className="flex-1 text-center text-xs font-semibold text-slate-600">
                      Test {idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            
          </div>

          {/* Calendar */}
          <ParticleCard glowColor="29, 78, 216" particleCount={20}>
  <EventCalendar
    currentDate={currentDate}
    setCurrentDate={setCurrentDate}
    events={events}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    setShowAddForm={setShowAddForm}
  />
</ParticleCard>

        </div>

        {/* Event Modal */}
        {showAddForm && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-slate-900">
                {months[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </h3>

              {/* Existing Events */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Events</h4>
                {events.filter(e => e.date === selectedDate && e.month === currentDate.getMonth()).length === 0 ? (
                  <p className="text-slate-400 text-sm mb-4">No events added yet</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {events
                      .filter(e => e.date === selectedDate && e.month === currentDate.getMonth())
                      .map((event) => (
                        <div key={event.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                          <span className="text-sm font-semibold text-slate-900">{event.title}</span>
                          <button
                            onClick={() => {
                              setEvents(events.filter(e => e.id !== event.id));
                            }}
                            className="text-red-500 hover:text-red-700 text-lg font-bold transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Add Event Section */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Add New Event</h4>
                <input
                  type="text"
                  placeholder="Event title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (eventTitle.trim()) {
                        setEvents([...events, {
                          id: Date.now(),
                          date: selectedDate,
                          month: currentDate.getMonth(),
                          year: currentDate.getFullYear(),
                          title: eventTitle
                        }]);
                        setEventTitle('');
                      }
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEventTitle('');
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Components */

function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer font-semibold
      ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <ParticleCard glowColor="59, 130, 246" particleCount={8}>
      <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
        <p className="text-xs font-bold text-slate-400 uppercase mb-2">
          {title}
        </p>
        <p className="text-3xl font-black text-slate-900">
          {value}
        </p>
      </div>
    </ParticleCard>
  );
}


function CourseCard({ title }) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-xl shadow">
      <h3 className="font-bold">{title}</h3>
      <p className="text-xs opacity-80 mt-1">Total Students: 25</p>
      <button className="mt-4 bg-white text-blue-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-blue-50">
        Enroll Now
      </button>
    </div>
  );
}

function EventCalendar({ currentDate, setCurrentDate, events, selectedDate, setSelectedDate, setShowAddForm }) {
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isEventDay = (day) => events.some(e => e.date === day && e.month === currentDate.getMonth());
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setShowAddForm(true);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition duration-200"
            title="Previous month"
          >
            ←
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition duration-200"
            title="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-bold text-blue-600 py-2 uppercase tracking-wider">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => day && handleDateClick(day)}
            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition duration-200 transform hover:scale-105 ${
              day === null
                ? 'text-transparent'
                : isEventDay(day)
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
