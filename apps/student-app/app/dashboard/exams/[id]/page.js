'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ExamAttemptPage() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const router = useRouter();

  // Logging utility
  const logEvent = useCallback((type, metadata = {}) => {
    if (!attemptId) return;
    apiFetch('/logs', {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId, type, metadata }),
    }).catch(console.error);
  }, [attemptId]);

  // Fetch exam and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const exams = await apiFetch('/exams');
        const currentExam = exams.find(e => e.id === examId);
        if (!currentExam) throw new Error('Exam not found');
        
        // In a real app, there would be a dedicated GET /exams/:id/questions
        // For Phase 1, we assume questions are fetched with the attempt initialization or separately
        const questionsData = await apiFetch(`/exams/${examId}/questions`).catch(() => []); // Backend might need this route
        
        setExam(currentExam);
        setQuestions(questionsData);
        setTimeLeft(currentExam.duration * 60);
      } catch (err) {
        alert(err.message);
        router.push('/dashboard/exams');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId, router]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    if (timeLeft === null) return;

    const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Integrity Controls
  useEffect(() => {
    const handleBlur = () => logEvent('tab_switch_or_blur', { timestamp: new Date().toISOString() });
    const handleContextMenu = (e) => {
      e.preventDefault();
      logEvent('right_click_attempt', { timestamp: new Date().toISOString() });
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 'r')) || e.key === 'F5') {
        e.preventDefault();
        logEvent('forbidden_key_press', { key: e.key, timestamp: new Date().toISOString() });
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [logEvent]);

  const handleSubmit = async () => {
    try {
      const result = await apiFetch(`/exams/${examId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      alert(`Exam Submitted! Your Score: ${result.score}`);
      router.push('/dashboard');
    } catch (err) {
      alert('Submission failed');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-20 text-center">Loading exam...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 select-none">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white p-4 rounded-lg shadow-sm z-10">
          <h2 className="text-2xl font-bold">{exam?.title}</h2>
          <div className="text-xl font-mono font-bold text-red-600 bg-red-50 px-4 py-2 rounded">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-8 pb-20">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <p className="text-lg font-medium mb-4">{qIndex + 1}. {q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      className="w-4 h-4 text-blue-600"
                      onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
            <button 
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-12 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg"
            >
                Submit Exam
            </button>
        </div>
      </div>
    </div>
  );
}
