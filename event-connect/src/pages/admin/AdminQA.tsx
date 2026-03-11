import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Maximize, Minimize, Mic } from 'lucide-react';
import SponsorsMarquee from '../../components/SponsorsMarquee';

export default function AdminQA() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then(d => setQuestions([...d].reverse()));
    const socket = io();
    socket.on('new_question', (q: any) => {
      setQuestions(prev => [...prev, q]);
      setNewCount(c => c + 1);
      setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 4000);
    });
    socket.on('delete_question', (id: string) => setQuestions(prev => prev.filter(q => q.id !== id)));
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => { socket.disconnect(); document.removeEventListener('fullscreenchange', onFs); };
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [questions]);

  return (
    <div className="h-screen text-white flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #064e3b 0%, #022c22 50%, #0a1628 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, backgroundColor: i % 3 === 0 ? '#fbbf24' : '#fff' }}
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
        ))}
      </div>

      {/* Fullscreen */}
      <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
        className="fixed top-5 right-5 p-2.5 bg-white/10 hover:bg-white/20 rounded-full z-50 transition-colors">
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 text-center pt-6 pb-4 border-b border-emerald-500/20 bg-[#022c22]/60 backdrop-blur-md">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-3">
          <Mic className="w-3 h-3 text-amber-400" />
          Ramadan Majlis 2026
        </div>
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Q&A</span>
          </h1>
          <AnimatePresence>
            {questions.length > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-sm font-bold">{questions.length}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-emerald-200/40 text-sm mt-1">Ask your questions — we're listening</p>
      </header>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto relative z-10 px-6 md:px-12 py-6">
        {questions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-9 h-9 text-emerald-400/40" />
            </div>
            <p className="text-emerald-200/30 text-2xl font-light">Waiting for questions...</p>
            <p className="text-emerald-200/20 text-sm">Open the app and ask away!</p>
          </motion.div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {questions.map((q, i) => {
                const isLatest = i === questions.length - 1;
                return (
                  <motion.div key={q.id} layout
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -80, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    className={`relative flex items-start gap-5 p-5 md:p-6 rounded-2xl border backdrop-blur-sm transition-all ${
                      isLatest
                        ? 'border-amber-400/40 bg-amber-400/5 shadow-[0_0_30px_rgba(251,191,36,0.08)]'
                        : 'border-emerald-500/20 bg-white/5'
                    }`}>

                    {isLatest && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-bold">
                        NEW
                      </motion.div>
                    )}

                    {/* Avatar */}
                    {q.user_photo ? (
                      <img src={q.user_photo} alt={q.user_name}
                        className={`rounded-full object-cover flex-shrink-0 border-2 ${isLatest ? 'w-14 h-14 border-amber-400/60' : 'w-12 h-12 border-emerald-500/30'}`} />
                    ) : (
                      <div className={`rounded-full flex-shrink-0 bg-emerald-900/50 border flex items-center justify-center font-bold text-emerald-300 ${isLatest ? 'w-14 h-14 border-amber-400/40 text-lg' : 'w-12 h-12 border-emerald-500/20 text-base'}`}>
                        {q.user_name?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className={`font-bold ${isLatest ? 'text-amber-400 text-lg' : 'text-emerald-300 text-base'}`}>
                          {q.user_name}
                        </span>
                        <span className="text-emerald-200/25 text-xs">
                          {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`leading-relaxed text-white ${isLatest ? 'text-2xl md:text-3xl font-medium' : 'text-lg md:text-xl'}`}>
                        "{q.text}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Sponsors */}
      <SponsorsMarquee />

      {/* Footer bar */}
      <div className="relative z-10 flex-shrink-0 border-t border-emerald-500/20 bg-[#022c22]/80 backdrop-blur-md px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-300/60 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live · Questions update in real-time
        </div>
        <p className="text-emerald-200/30 text-xs">Ramadan Majlis 2026</p>
      </div>
    </div>
  );
}
