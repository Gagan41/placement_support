'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ExamAttemptPage() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answerTimestamps, setAnswerTimestamps] = useState([]); // [ { id, time } ]
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Logging utility
  const logEvent = useCallback((type, metadata = {}) => {
    if (!attemptId) return;
    apiFetch('/integrity/log', {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId, type, metadata }),
    }).catch(console.error);
  }, [attemptId]);

  // Initialize Attempt & Fetch Data
  useEffect(() => {
    const initExam = async () => {
      try {
        // 1. Start Attempt
        const attemptRes = await apiFetch('/attempts/start', {
          method: 'POST',
          body: JSON.stringify({ exam_id: examId }),
        });
        setAttemptId(attemptRes.attempt_id);

        // 2. Fetch Exam Details
        const exams = await apiFetch('/exams');
        const currentExam = exams.find(e => e.id === examId);
        if (!currentExam) throw new Error('Exam not found');
        
        const questionsData = await apiFetch(`/exams/${examId}/questions`).catch(() => []);
        
        setExam(currentExam);
        setQuestions(questionsData);
        
        // Calculate remaining time based on server start time to persist across reloads
        const startTime = new Date(attemptRes.started_at).getTime();
        const durationMs = currentExam.duration * 60 * 1000;
        const endTime = startTime + durationMs;
        const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        setTimeLeft(remainingSeconds);
      } catch (err) {
        alert(err.message || 'Failed to start exam');
        router.push('/dashboard/exams');
      } finally {
        setLoading(false);
      }
    };
    initExam();
  }, [examId, router]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit(true);
      return;
    }
    if (timeLeft === null) return;

    const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Answer Pattern Monitoring
  const handleAnswer = (questionId, option) => {
    const now = Date.now();
    setAnswers(prev => ({ ...prev, [questionId]: option }));

    // Update timestamps
    setAnswerTimestamps(prev => {
        const newTimestamps = [...prev, { time: now }];
        // Keep only last 10 seconds
        const recent = newTimestamps.filter(t => now - t.time < 10000);
        
        if (recent.length >= 3) {
            logEvent('suspicious_answer_pattern', {
                detail: '3+ answers in 10s',
                count: recent.length,
                timestamp: new Date().toISOString()
            });
            // Clear to avoid spamming logs for the same burst
            return [];
        }
        return recent;
    });
  };

  // Integrity Controls (Listeners)
  useEffect(() => {
    if (!attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('tab_hidden', { timestamp: new Date().toISOString() });
      }
    };

    const handleBlur = () => logEvent('window_blur', { timestamp: new Date().toISOString() });
    
    const handleContextMenu = (e) => {
      e.preventDefault();
      logEvent('right_click_attempt', { timestamp: new Date().toISOString() });
    };

    const handleCopy = () => logEvent('copy_attempt', { timestamp: new Date().toISOString() });
    const handlePaste = () => logEvent('paste_attempt', { timestamp: new Date().toISOString() });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 'r')) || e.key === 'F5') {
        e.preventDefault();
        logEvent('forbidden_key_press', { key: e.key, timestamp: new Date().toISOString() });
        
        if (e.ctrlKey && e.key === 'p') {
             logEvent('print_attempt', { timestamp: new Date().toISOString() });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [attemptId, logEvent]);

  const handleSubmit = async (auto = false) => {
    if (!attemptId || isSubmitting) return;
    setIsSubmitting(true);
    
    if (auto) {
        // Optional: toast or minimal alert
        console.log("Auto-submitting due to timeout");
    }

    try {
      const result = await apiFetch(`/exams/${examId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ answers, attempt_id: attemptId }),
      });
      alert(auto ? `Time's Up! Exam Submitted. Score: ${result.score}` : `Exam Submitted! Your Score: ${result.score}`);
      router.push('/dashboard');
    } catch (err) {
      alert('Submission failed: ' + (err.message || 'Unknown error'));
      setIsSubmitting(false);
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
              <p className="text-lg font-medium mb-4 text-gray-900">{qIndex + 1}. {q.question}</p>
              <div className="space-y-3">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 text-gray-800">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      className="w-4 h-4 text-blue-600"
                      onChange={() => handleAnswer(q.id, opt)}
                      checked={answers[q.id] === opt}
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
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className={`px-12 py-3 rounded-lg font-bold text-lg shadow-lg ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
        </div>
      </div>
    </div>
  );
}
