import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Phone, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, user } = useUser();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (res.ok) { login(await res.json()); navigate('/'); }
      else setError('Invalid phone number or password');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom, #064e3b, #022c22)' }}>
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, backgroundColor: i % 3 === 0 ? '#fbbf24' : '#fff' }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
        ))}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <img src="/majlis_logo.png" alt="Ramadan Majlis" className="h-20 mx-auto mb-6 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <h2 className="text-3xl font-extrabold text-white">Ramadan Majlis</h2>
        <p className="mt-2 text-sm text-emerald-200/60">Event App — Sign in to continue</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-6 rounded-2xl border border-emerald-500/20 bg-white/5 backdrop-blur-sm">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  className="block w-full pl-10 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm"
                  placeholder="01012345678" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-200/80 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-emerald-400/60" />
                </div>
                <input type="text" required value={password} onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm"
                  placeholder="Your event password" />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black bg-amber-400 hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
