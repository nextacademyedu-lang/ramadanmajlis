import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Award } from 'lucide-react';
import SponsorsMarquee from '../components/SponsorsMarquee';

interface LeaderboardUser { id: string; name: string; photo_url: string; score: number; }

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setLeaderboard);
    const socket = io();
    socket.on('leaderboard_update', setLeaderboard);
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-24">
      <header className="mb-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-amber-400 mb-3" />
        <h1 className="text-2xl font-bold text-white">Live Leaderboard</h1>
        <p className="text-emerald-200/50 mt-1 text-sm">Top performers in the event</p>
      </header>

      <div className="rounded-2xl border border-emerald-500/20 overflow-hidden bg-white/5">
        <ul className="divide-y divide-white/5">
          <AnimatePresence>
            {leaderboard.map((user, index) => (
              <motion.li key={user.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center p-4 hover:bg-white/5 transition-colors">
                <div className="flex-shrink-0 w-8 text-center font-bold text-emerald-200/40">
                  {index === 0 ? <Trophy className="text-amber-400 mx-auto" size={20} /> :
                   index === 1 ? <Medal className="text-gray-400 mx-auto" size={20} /> :
                   index === 2 ? <Award className="text-amber-700 mx-auto" size={20} /> :
                   `#${index + 1}`}
                </div>
                <img className="h-11 w-11 rounded-full mx-4 border border-emerald-500/30 object-cover"
                  src={user.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                </div>
                <div className="text-base font-bold text-amber-400">{user.score} <span className="text-xs text-white/30">pts</span></div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div className="mt-6">
        <SponsorsMarquee />
      </div>
    </div>
  );
}
