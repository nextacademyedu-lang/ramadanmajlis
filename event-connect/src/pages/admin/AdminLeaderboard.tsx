import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence, useSpring, useTransform } from 'motion/react';
import { Trophy, Medal, Star, Maximize, Minimize, Flame, Zap, Users, Target, Heart } from 'lucide-react';
import SponsorsMarquee from '../../components/SponsorsMarquee';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { bounce: 0, duration: 1200 });
  const display = useTransform(spring, (c) => Math.round(c));
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

const CAROUSEL_SLIDES = [
  {
    icon: Flame,
    color: 'text-amber-400',
    bg: 'from-amber-500/10 to-transparent',
    title: '🔥 Who will be tonight\'s top networker?',
    sub: 'Complete tasks · Earn points · Climb the board',
  },
  {
    icon: Users,
    color: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-transparent',
    title: '🤝 Every connection counts',
    sub: 'Meet someone new · Exchange contacts · Score points',
  },
  {
    icon: Target,
    color: 'text-sky-400',
    bg: 'from-sky-500/10 to-transparent',
    title: '🎯 Tasks are live — go complete them!',
    sub: 'Open the app · Pick a task · Make it happen',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'from-yellow-500/10 to-transparent',
    title: '⚡ Leaderboard updates in real-time',
    sub: 'Your score changes the moment you submit',
  },
  {
    icon: Heart,
    color: 'text-rose-400',
    bg: 'from-rose-500/10 to-transparent',
    title: '🌙 Ramadan Mubarak to all attendees',
    sub: 'Ramadan Majlis 2026 · Connect · Collaborate · Grow',
  },
];

// Podium layout: 4th, 2nd, 1st, 3rd, 5th
const PODIUM_ORDER = [3, 1, 0, 2, 4];
const PODIUM_HEIGHTS = ['h-14', 'h-28', 'h-44', 'h-20', 'h-10'];
const RANK_CONFIG = [
  { color: 'text-amber-400',  border: 'border-amber-400',    glow: 'shadow-[0_0_35px_rgba(251,191,36,0.6)]',  size: 'w-24 h-24', labelSize: 'text-lg',  scoreSize: 'text-3xl' },
  { color: 'text-slate-300',  border: 'border-slate-300',    glow: 'shadow-[0_0_20px_rgba(203,213,225,0.35)]', size: 'w-18 h-18', labelSize: 'text-base', scoreSize: 'text-xl'  },
  { color: 'text-amber-600',  border: 'border-amber-600',    glow: 'shadow-[0_0_20px_rgba(217,119,6,0.35)]',  size: 'w-16 h-16', labelSize: 'text-base', scoreSize: 'text-lg'  },
  { color: 'text-sky-400',    border: 'border-sky-500/60',   glow: '',                                         size: 'w-13 h-13', labelSize: 'text-sm',  scoreSize: 'text-base'},
  { color: 'text-purple-400', border: 'border-purple-500/60', glow: '',                                        size: 'w-12 h-12', labelSize: 'text-sm',  scoreSize: 'text-sm'  },
];
const RANK_ICONS = [
  <Trophy size={20} className="text-amber-400" />,
  <Medal  size={18} className="text-slate-300" />,
  <Medal  size={16} className="text-amber-600" />,
  <Star   size={14} className="text-sky-400"   />,
  <Star   size={14} className="text-purple-400"/>,
];

export default function AdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setLeaderboard);
    const socket = io();
    socket.on('leaderboard_update', (data: any[]) => {
      setLeaderboard(prev => {
        const changed = new Set<string>();
        data.forEach(u => {
          const old = prev.find(p => p.id === u.id);
          if (old && old.score !== u.score) changed.add(u.id);
        });
        if (changed.size > 0) {
          setChangedIds(changed);
          setTimeout(() => setChangedIds(new Set()), 2500);
        }
        return data;
      });
    });
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => { socket.disconnect(); document.removeEventListener('fullscreenchange', onFs); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % CAROUSEL_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const top5 = leaderboard.slice(0, 5);
  const rest = leaderboard.slice(5);
  const photoOf = (u: any) => u.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`;

  return (
    <div className="h-screen text-white flex flex-col relative overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #064e3b 0%, #022c22 45%, #0a1628 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 60 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1 + Math.random() * 2.5, height: 1 + Math.random() * 2.5, backgroundColor: i % 4 === 0 ? '#fbbf24' : '#fff' }}
            animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.5, 1] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }} />
        ))}
      </div>

      {/* Fullscreen btn */}
      <button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
        className="fixed top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full z-50 transition-colors">
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Header */}
      <header className="text-center pt-4 pb-1 relative z-10 flex-shrink-0">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-2">
          <Flame className="w-3 h-3 text-amber-400" />
          Ramadan Majlis 2026
        </motion.div>
        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
          Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Leaderboard</span>
        </motion.h1>
      </header>

      {/* Top 5 Podium */}
      <div className="relative z-10 flex-shrink-0 px-4 pt-3 pb-0">
        <div className="flex items-end justify-center gap-1 md:gap-2 max-w-4xl mx-auto">
          {PODIUM_ORDER.map((rankIdx, colIdx) => {
            const user = top5[rankIdx];
            if (!user) return <div key={colIdx} className="flex-1 max-w-[140px]" />;
            const cfg = RANK_CONFIG[rankIdx];
            const isChanged = changedIds.has(user.id);
            const podiumH = PODIUM_HEIGHTS[colIdx];

            return (
              <motion.div key={user.id} layout
                initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.12, type: 'spring', stiffness: 180, damping: 18 }}
                className="flex flex-col items-center flex-1 max-w-[160px]">

                {/* Rank icon */}
                <motion.div animate={isChanged ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}}
                  transition={{ duration: 0.7 }} className="mb-1">
                  {RANK_ICONS[rankIdx]}
                </motion.div>

                {/* Photo */}
                <motion.div
                  animate={isChanged ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative mb-1">
                  {isChanged && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 2, 2.5], opacity: [0.8, 0.4, 0] }}
                      transition={{ duration: 0.8 }}
                      className={`absolute inset-0 rounded-full border-4 ${cfg.border}`}
                    />
                  )}
                  <img src={photoOf(user)} alt={user.name}
                    className={`${cfg.size} rounded-full object-cover border-4 ${cfg.border} ${cfg.glow}`} />
                </motion.div>

                {/* Name */}
                <p className={`font-bold text-center text-white truncate w-full px-1 ${cfg.labelSize}`}>
                  {user.name.split(' ')[0]}
                </p>

                {/* Score */}
                <motion.p
                  animate={isChanged ? { color: ['#fff', '#fbbf24', '#fff'] } : {}}
                  className={`font-black ${cfg.scoreSize} ${cfg.color} leading-none mb-1`}>
                  <AnimatedNumber value={user.score} />
                  <span className="text-xs opacity-40 ml-0.5">pts</span>
                </motion.p>

                {/* Podium block */}
                <div className={`w-full ${podiumH} rounded-t-xl bg-gradient-to-b ${
                  rankIdx === 0 ? 'from-amber-500/30 to-amber-400/5 border-amber-400/30' :
                  rankIdx === 1 ? 'from-slate-400/20 to-slate-300/5 border-slate-400/20' :
                  rankIdx === 2 ? 'from-amber-700/20 to-amber-600/5 border-amber-700/20' :
                  'from-white/10 to-white/5 border-white/10'
                } border flex items-center justify-center`}>
                  <span className={`text-xl font-black ${cfg.color} opacity-20`}>{rankIdx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rest list */}
      {rest.length > 0 && (
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 mt-3 flex-shrink-0">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <AnimatePresence>
              {rest.map((user, i) => (
                <motion.div key={user.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <span className="text-xs font-black text-white/25 w-5 flex-shrink-0 text-center">#{i + 6}</span>
                  <img src={photoOf(user)} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-xs text-amber-400 font-bold leading-none"><AnimatedNumber value={user.score} /> <span className="text-white/20">pts</span></p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Sponsors */}
      <SponsorsMarquee />

      {/* Carousel */}
      <div className="relative z-10 flex-shrink-0 border-t border-emerald-500/20 bg-[#022c22]/90 backdrop-blur-md overflow-hidden">
        <AnimatePresence mode="wait">
          {(() => {
            const slide = CAROUSEL_SLIDES[slideIdx];
            const Icon = slide.icon;
            return (
              <motion.div key={slideIdx}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`flex items-center justify-center gap-5 px-10 py-4 bg-gradient-to-r ${slide.bg}`}>
                <motion.div
                  initial={{ rotate: -20, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}>
                  <Icon size={32} className={slide.color} />
                </motion.div>
                <div className="text-center">
                  <motion.p
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="text-white font-bold text-lg md:text-xl leading-tight">{slide.title}</motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="text-emerald-200/50 text-sm mt-0.5">{slide.sub}</motion.p>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 pb-2.5">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === slideIdx ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
