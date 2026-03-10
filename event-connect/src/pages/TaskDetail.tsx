import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Briefcase, Phone, ArrowLeft, Camera, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CameraCapture from '../components/CameraCapture';
import CustomSelect from '../components/CustomSelect';
import { io } from 'socket.io-client';

// ── Poll Component ─────────────────────────────────────────────────────────
function PollTask({ task, user }: { task: any; user: any }) {
  const [voted, setVoted] = useState(false);
  const [myOption, setMyOption] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const options: string[] = Array.isArray(task.poll_options)
    ? task.poll_options
    : JSON.parse(task.poll_options || '[]');

  const duration: number = task.poll_duration_seconds || 0;

  const totalVotes = (Object.values(results) as number[]).reduce((a, b) => a + b, 0);

  // جيب نتائج + حالة تصويت الـ user
  useEffect(() => {
    fetch(`/api/poll/${task.id}/results`).then(r => r.json()).then(setResults);
    if (user?.id) {
      fetch(`/api/poll/${task.id}/user/${user.id}`).then(r => r.json()).then(d => {
        if (d.voted) { setVoted(true); setMyOption(d.option); }
      });
    }
  }, [task.id, user?.id]);

  // Timer
  useEffect(() => {
    if (!duration) return;

    const createdAt = task.created_at ? new Date(task.created_at).getTime() : Date.now();
    const endTime = createdAt + duration * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [duration, task.created_at]);

  // Real-time poll updates
  useEffect(() => {
    const socket = io();
    socket.on('poll_update', (data: any) => {
      if (data.taskId === task.id) setResults(data.results);
    });
    return () => { socket.disconnect(); };
  }, [task.id]);

  const handleVote = async (option: string) => {
    if (voted || (timeLeft !== null && timeLeft === 0)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, userId: user?.id, option }),
      });
      const data = await res.json();
      if (res.ok) {
        setVoted(true);
        setMyOption(option);
        setResults(data.results);
      }
    } finally {
      setLoading(false);
    }
  };

  const timerExpired = timeLeft !== null && timeLeft === 0;
  const showResults = voted || timerExpired;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  // Timer ring color
  const timerColor = timeLeft === null ? '#10b981'
    : timeLeft > 30 ? '#10b981'
    : timeLeft > 10 ? '#f59e0b'
    : '#ef4444';

  return (
    <div className="space-y-4">
      {/* Timer */}
      {duration > 0 && timeLeft !== null && (
        <div className="flex justify-center mb-2">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="48" cy="48" r="42" fill="none"
                stroke={timerColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - (duration > 0 ? timeLeft / duration : 0))}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
              <span className="text-xs text-white/40">left</span>
            </div>
          </div>
        </div>
      )}

      {/* Vote count */}
      <p className="text-center text-sm text-emerald-300/60">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} so far
      </p>

      {/* Options */}
      <div className="space-y-3">
        {options.map((opt) => {
          const count = (results[opt] as number) || 0;
          const pct = totalVotes > 0 ? Math.round(((count as number) / (totalVotes as number)) * 100) : 0;
          const isMyVote = myOption === opt;

          return (
            <motion.div key={opt} layout>
              <button
                type="button"
                onClick={() => handleVote(opt)}
                disabled={voted || timerExpired || loading}
                className={`w-full relative overflow-hidden rounded-2xl border-2 transition-all text-left
                  ${isMyVote
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : voted || timerExpired
                    ? 'border-white/10 bg-white/5 opacity-70 cursor-default'
                    : 'border-white/20 bg-white/5 hover:border-emerald-400/60 hover:bg-white/10 cursor-pointer'
                  }`}
              >
                {/* Progress bar fill */}
                {showResults && (
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-2xl ${isMyVote ? 'bg-emerald-500/20' : 'bg-white/10'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                )}

                <div className="relative flex items-center justify-between px-5 py-4">
                  <span className="font-semibold text-white text-lg">{opt}</span>
                  <div className="flex items-center gap-2">
                    {showResults && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-sm font-bold ${isMyVote ? 'text-emerald-400' : 'text-white/50'}`}
                      >
                        {pct}%
                      </motion.span>
                    )}
                    {isMyVote && (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Voted message */}
      <AnimatePresence>
        {voted && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-emerald-400 text-sm font-medium"
          >
            ✅ صوتك اتسجّل!
          </motion.p>
        )}
        {timerExpired && !voted && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-red-400 text-sm font-medium"
          >
            ⏰ انتهى الوقت
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main TaskDetail ─────────────────────────────────────────────────────────
export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ metPersonName: '', metPersonField: '', metPersonPhone: '' });
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [activeCamera, setActiveCamera] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => setTask(data.find((t: any) => t.id === id)));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, taskId: id, ...formData, customData }),
      });
      if (res.ok) navigate('/');
      else alert('Failed to submit task');
    } finally { setLoading(false); }
  };

  if (!task) return <div className="p-8 text-center text-white/50">Loading task...</div>;

  const isPoll = task.task_type === 'poll';
  const requiredFields: any[] = Array.isArray(task.required_fields) ? task.required_fields : JSON.parse(task.required_fields || '[]');
  const standardFields = ['name', 'field', 'phone'];
  const hasField = (f: string) => requiredFields.some((rf: any) => rf === f || rf?.name === f);
  const customFields = requiredFields.filter((f: any) => typeof f === 'object' && !standardFields.includes(f.name));

  const inputClass = "block w-full pl-10 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm";

  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center text-emerald-200/60 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">{task.title}</h1>
      <p className="text-emerald-200/60 mb-2">{task.description}</p>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-8">
        {task.points} pts
      </span>

      {isPoll ? (
        <PollTask task={task} user={user} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {hasField('name') && (
            <div>
              <label className="block text-sm font-medium text-emerald-200/70 mb-1">Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-emerald-400/50" /></div>
                <input type="text" required value={formData.metPersonName}
                  onChange={e => setFormData({ ...formData, metPersonName: e.target.value })}
                  className={inputClass} placeholder="John Doe" />
              </div>
            </div>
          )}
          {hasField('field') && (
            <div>
              <label className="block text-sm font-medium text-emerald-200/70 mb-1">Field / Industry</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-emerald-400/50" /></div>
                <input type="text" required value={formData.metPersonField}
                  onChange={e => setFormData({ ...formData, metPersonField: e.target.value })}
                  className={inputClass} placeholder="Software Engineering" />
              </div>
            </div>
          )}
          {hasField('phone') && (
            <div>
              <label className="block text-sm font-medium text-emerald-200/70 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-emerald-400/50" /></div>
                <input type="tel" required value={formData.metPersonPhone}
                  onChange={e => setFormData({ ...formData, metPersonPhone: e.target.value })}
                  className={inputClass} placeholder="01012345678" />
              </div>
            </div>
          )}
          {customFields.map((field: any, idx: number) => (
            <div key={idx}>
              <label className="block text-sm font-medium text-emerald-200/70 mb-1 capitalize">{field.name}</label>
              {field.type === 'photo' ? (
                <div>
                  {customData[field.name] ? (
                    <div className="relative w-32 h-32">
                      <img src={customData[field.name]} alt={field.name} className="w-32 h-32 rounded-xl object-cover border border-emerald-500/30" />
                      <button type="button" onClick={() => setCustomData(p => { const n = { ...p }; delete n[field.name]; return n; })}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setActiveCamera(field.name)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-emerald-300 hover:bg-white/15 transition-colors">
                      <Camera size={18} /> Take Photo
                    </button>
                  )}
                  <input type="hidden" required={!customData[field.name]} />
                  {activeCamera === field.name && (
                    <CameraCapture
                      facingMode="environment"
                      onCapture={dataUrl => { setCustomData(p => ({ ...p, [field.name]: dataUrl })); setActiveCamera(null); }}
                      onClose={() => setActiveCamera(null)}
                    />
                  )}
                </div>
              ) : field.type === 'dropdown' ? (
                <CustomSelect
                  required
                  value={customData[field.name] || ''}
                  onChange={val => setCustomData(p => ({ ...p, [field.name]: val }))}
                  options={field.options || []}
                  placeholder={`Select ${field.name}`}
                />
              ) : (
                <input type={field.type === 'date' ? 'date' : field.type} required
                  value={customData[field.name] || ''}
                  onChange={e => setCustomData(p => ({ ...p, [field.name]: e.target.value }))}
                  className="block w-full px-4 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm"
                  placeholder={`Enter ${field.name}`} />
              )}
            </div>
          ))}

          <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-black bg-amber-400 hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            {loading ? 'Submitting...' : 'Complete Task ✓'}
          </motion.button>
        </form>
      )}
    </div>
  );
}
