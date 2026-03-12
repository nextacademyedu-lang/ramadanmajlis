import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { BarChart3, Maximize, Minimize, Vote } from 'lucide-react';
import SponsorsMarquee from '../../components/SponsorsMarquee';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { bounce: 0, duration: 800 });
  const display = useTransform(spring, (c) => Math.round(c));
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

const OPTION_COLORS = [
  { bar: 'from-amber-500 to-amber-400', text: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]' },
  { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_30px_rgba(52,211,153,0.15)]' },
  { bar: 'from-sky-500 to-sky-400', text: 'text-sky-400', border: 'border-sky-400/40', bg: 'bg-sky-500/10', glow: 'shadow-[0_0_30px_rgba(56,189,248,0.15)]' },
  { bar: 'from-purple-500 to-purple-400', text: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-500/10', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]' },
  { bar: 'from-rose-500 to-rose-400', text: 'text-rose-400', border: 'border-rose-400/40', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_30px_rgba(251,113,133,0.15)]' },
  { bar: 'from-orange-500 to-orange-400', text: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-500/10', glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]' },
];

export default function AdminPoll() {
  const [activePoll, setActivePoll] = useState<any>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch active poll (latest poll task that's active)
  useEffect(() => {
    const fetchPoll = async () => {
      const res = await fetch('/api/tasks');
      const tasks = await res.json();
      const poll = tasks.find((t: any) => t.task_type === 'poll');
      if (poll) {
        setActivePoll(poll);
        // Fetch initial results
        const rRes = await fetch(`/api/poll/${poll.id}/results`);
        const rData = await rRes.json();
        setResults(rData);
      }
    };
    fetchPoll();
    // Re-fetch every 5s in case a new poll is activated
    const interval = setInterval(fetchPoll, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time updates
  useEffect(() => {
    const socket = io();
    socket.on('poll_update', (data: { taskId: string; results: Record<string, number> }) => {
      if (activePoll && data.taskId === activePoll.id) {
        setResults(data.results);
      }
    });
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => { socket.disconnect(); document.removeEventListener('fullscreenchange', onFs); };
  }, [activePoll, results]);

  // Timer
  useEffect(() => {
    if (!activePoll?.poll_duration_seconds) return;
    const duration = activePoll.poll_duration_seconds;
    const createdAt = activePoll.created_at ? new Date(activePoll.created_at).getTime() : Date.now();
    const endTime = createdAt + duration * 1000;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activePoll]);

  const options: string[] = activePoll
    ? (Array.isArray(activePoll.poll_options) ? activePoll.poll_options : JSON.parse(activePoll.poll_options || '[]'))
    : [];

  const totalVotes = (Object.values(results) as number[]).reduce((a, b) => a + b, 0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  const timerColor = timeLeft === null ? '#10b981'
    : timeLeft > 30 ? '#10b981'
    : timeLeft > 10 ? '#f59e0b'
    : '#ef4444';

  const timerExpired = timeLeft !== null && timeLeft === 0;

  return (
    <div className="h-screen text-white flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #064e3b 0%, #022c22 45%, #0a1628 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {useMemo(() => Array.from({ length: 50 }, (_, i) => {
          const left = `${(i * 17 + 7) % 100}%`;
          const top = `${(i * 31 + 13) % 100}%`;
          const size = 1 + (i % 3) * 0.8;
          const dur = 2 + (i % 5);
          const del = (i % 7) * 0.6;
          return (
            <motion.div key={i} className="absolute rounded-full"
              style={{ left, top, width: size, height: size, backgroundColor: i % 4 === 0 ? '#fbbf24' : '#fff' }}
              animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.5, 1] }}
              transition={{ duration: dur, repeat: Infinity, delay: del }} />
          );
        }), [])}
      </div>

      {/* Fullscreen btn */}
      <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
        className="fixed top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full z-50 transition-colors">
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 text-center pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
          <Vote className="w-3 h-3 text-amber-400" />
          Ramadan Majlis 2026
        </motion.div>
        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-4xl md:text-5xl font-black text-white tracking-tight">
          Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Poll</span>
        </motion.h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-8 overflow-hidden">
        {!activePoll ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-emerald-400/40" />
            </div>
            <p className="text-emerald-200/30 text-2xl font-light">Waiting for poll...</p>
            <p className="text-emerald-200/20 text-sm">Activate a poll from the admin dashboard</p>
          </motion.div>
        ) : (
          <div className="w-full max-w-4xl">
            {/* Poll Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{activePoll.title}</h2>
              <p className="text-emerald-200/50 text-base">{activePoll.description}</p>
            </motion.div>

            {/* Timer + Vote Count */}
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Timer */}
              {activePoll.poll_duration_seconds > 0 && timeLeft !== null && (
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                    <circle
                      cx="40" cy="40" r="35" fill="none"
                      stroke={timerColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 35}
                      strokeDashoffset={2 * Math.PI * 35 * (1 - (activePoll.poll_duration_seconds > 0 ? timeLeft / activePoll.poll_duration_seconds : 0))}
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
                    <span className="text-[10px] text-white/40">{timerExpired ? 'ENDED' : 'left'}</span>
                  </div>
                </div>
              )}

              {/* Vote count */}
              <motion.div
                animate={{ scale: totalVotes > 0 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center">
                <span className="text-5xl font-black text-amber-400 tabular-nums">
                  <AnimatedNumber value={totalVotes} />
                </span>
                <span className="text-sm text-white/40 mt-1">{totalVotes === 1 ? 'vote' : 'votes'}</span>
              </motion.div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <AnimatePresence>
                {options.map((opt, i) => {
                  const count = results[opt] || 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const c = OPTION_COLORS[i % OPTION_COLORS.length];
                  const isLeading = count === Math.max(...Object.values(results).map(Number), 0) && count > 0;

                  return (
                    <motion.div key={opt}
                      layout
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 200, damping: 25 }}>
                      <div className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                        isLeading ? `${c.border} ${c.bg} ${c.glow}` : 'border-white/10 bg-white/5'
                      }`}>
                        {/* Progress bar */}
                        <motion.div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${c.bar} opacity-15 rounded-2xl`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {isLeading && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="text-2xl">
                                👑
                              </motion.span>
                            )}
                            <span className="text-xl md:text-2xl font-bold text-white">{opt}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <motion.span
                              key={count}
                              initial={{ scale: 1.5, color: '#fbbf24' }}
                              animate={{ scale: 1, color: '#fff' }}
                              className="text-lg font-semibold text-white/70 tabular-nums">
                              {count} {count === 1 ? 'vote' : 'votes'}
                            </motion.span>
                            <motion.span
                              key={pct}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className={`text-3xl md:text-4xl font-black ${c.text} tabular-nums min-w-[80px] text-right`}>
                              {pct}%
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Sponsors */}
      <SponsorsMarquee />

      {/* Footer */}
      <div className="relative z-10 flex-shrink-0 border-t border-emerald-500/20 bg-[#022c22]/80 backdrop-blur-md px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-300/60 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live · Results update in real-time
        </div>
        <p className="text-emerald-200/30 text-xs">Ramadan Majlis 2026</p>
      </div>
    </div>
  );
}
