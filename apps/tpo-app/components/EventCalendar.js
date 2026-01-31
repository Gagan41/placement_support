"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function EventCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventType, setNewEventType] = useState("exam");
    const [newEventTime, setNewEventTime] = useState("09:00");
    const [notifiedEvents, setNotifiedEvents] = useState(new Set());
    const [notification, setNotification] = useState(null);
    const [mounted, setMounted] = useState(false);

    // Handle Hydration - Set initial data only on client
    useEffect(() => {
        setMounted(true);
        const todayStr = new Date().toISOString().split('T')[0];
        setEvents([
            { date: todayStr, title: "Placement Drive", type: "exam", time: "10:00" },
        ]);
        setCurrentDate(new Date());
    }, []);

    // Check for upcoming events every minute
    useEffect(() => {
        if (!mounted) return;

        const checkUpcomingEvents = () => {
            const now = new Date();
            events.forEach(event => {
                if (!event.time) return;

                // Construct date string safely
                const eventDateTime = new Date(`${event.date}T${event.time}`);

                if (isNaN(eventDateTime.getTime())) return; // invalid date check

                const timeDiff = eventDateTime - now;
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                // Notify if event is between 2 and 3 hours away (and not passed)
                const eventKey = `${event.date}-${event.title}`;

                if (hoursDiff > 2 && hoursDiff <= 3 && !notifiedEvents.has(eventKey)) {
                    showNotification(`Reminder: "${event.title}" is starting in ~2 hours!`);
                    setNotifiedEvents(prev => {
                        const newSet = new Set(prev);
                        newSet.add(eventKey);
                        return newSet;
                    });
                }
            });
        };

        const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
        checkUpcomingEvents(); // Initial check

        return () => clearInterval(interval);
    }, [events, notifiedEvents, mounted]);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const days = ["S", "M", "T", "W", "T", "F", "S"];

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const offset = clickedDate.getTimezoneOffset();
        const adjDate = new Date(clickedDate.getTime() - (offset * 60 * 1000));
        const dateStr = adjDate.toISOString().split('T')[0];

        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 5000);
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        setEvents([...events, {
            date: selectedDate,
            title: newEventTitle,
            type: newEventType,
            time: newEventTime
        }]);

        let timeStr = "";
        try {
            timeStr = new Date(`2000-01-01T${newEventTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        } catch (err) {
            timeStr = newEventTime;
        }

        showNotification(`New Event Added at ${timeStr}`);

        setNewEventTitle("");
        setNewEventTime("09:00");
        setIsModalOpen(false);
    };

    const getEventsForDate = (day) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const offset = targetDate.getTimezoneOffset();
        const adjDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
        const dateStr = adjDate.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };

    const renderCalendarDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const calendarDays = [];

        // Empty cells for days before the 1st
        for (let i = 0; i < startDay; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

        for (let i = 1; i <= totalDays; i++) {
            const isToday = isCurrentMonth && i === today.getDate();
            const dayEvents = getEventsForDate(i);
            const hasEvents = dayEvents.length > 0;
            const hasExam = dayEvents.some(e => e.type === 'exam');
            const hasInterview = dayEvents.some(e => e.type === 'interview');

            calendarDays.push(
                <div
                    key={i}
                    onClick={() => handleDateClick(i)}
                    className={`h-10 w-10 flex flex-col items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition-all relative group
            ${isToday ? "bg-blue-600 text-white shadow-md shadow-blue-200" : ""}
            ${hasEvents && !isToday ? "bg-blue-500 text-white shadow-md" : ""}
            ${!isToday && !hasEvents ? "text-slate-600 hover:bg-slate-100" : ""}
          `}
                >
                    {i}
                    <div className="flex gap-0.5 mt-0.5">
                        {hasExam && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-200'}`}></div>}
                        {hasInterview && <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-indigo-300' : 'bg-indigo-200'}`}></div>}
                    </div>
                </div>
            );
        }
        return calendarDays;
    };

    const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

    if (!mounted) {
        return <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex items-center justify-center text-slate-400">Loading Calendar...</div>;
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden h-full flex flex-col">
            {/* Notification Toast */}
            {notification && (
                <div className="absolute top-4 left-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl z-50 animate-in slide-in-from-top-4 fade-in duration-300 flex items-center justify-between">
                    <span className="text-sm font-medium">{notification}</span>
                    <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Manage Schedule</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                {days.map((day) => (
                    <div key={day} className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 place-items-center mb-4 flex-1">
                {renderCalendarDays()}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-xs font-bold text-slate-500">Event Scheduled</span>
                </div>
                <button
                    onClick={() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        setSelectedDate(todayStr);
                        setIsModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
                >
                    + Add Event
                </button>
            </div>

            {isModalOpen && (
                <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm flex flex-col p-6 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-bold text-slate-800">
                            Events for {selectedDate}
                        </h4>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 custom-scrollbar">
                        {selectedDateEvents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No events for this day.
                            </div>
                        ) : (
                            selectedDateEvents.map((ev, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{ev.title}</span>
                                            {ev.time && <span className="text-[10px] font-bold text-slate-400">
                                                {/* Safe Time Render */}
                                                {(() => {
                                                    try {
                                                        return new Date(`2000-01-01T${ev.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                                                    } catch (e) {
                                                        return ev.time;
                                                    }
                                                })()}
                                            </span>}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded self-start">{ev.type}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEvents(events.filter(e => e !== ev));
                                        }}
                                        className="text-xs text-red-400 hover:text-red-600 px-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddEvent} className="mt-auto pt-6 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Event</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Event Title..."
                                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    className="w-1/3 p-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                />
                                <select
                                    className="flex-1 p-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newEventType}
                                    onChange={(e) => setNewEventType(e.target.value)}
                                >
                                    <option value="exam">Exam</option>
                                    <option value="interview">Interview</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={!newEventTitle.trim()}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Event
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
