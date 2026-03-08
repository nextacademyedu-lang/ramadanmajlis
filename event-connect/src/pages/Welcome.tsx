import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { Download, LogIn, Sparkles, Trophy, MessageSquare, Users, Share, Plus, CheckCircle2, Smartphone } from 'lucide-react';

export default function Welcome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [user, navigate]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom, #064e3b, #022c22)' }}>
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        {Array.from({ length: 40 }, (_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 1 + Math.random() * 2, height: 1 + Math.random() * 2, backgroundColor: i % 3 === 0 ? '#fbbf24' : '#fff' }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-16 pb-10 max-w-md mx-auto w-full">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <img src="/majlis_logo.png" alt="Ramadan Majlis" className="h-20 mx-auto mb-6 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Ramadan Majlis 2026
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Event App</span></h1>
          <p className="text-emerald-200/60 text-sm leading-relaxed">
            Connect with fellow attendees, complete networking tasks, earn points, and ask your questions live.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="w-full grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: Trophy, label: 'Leaderboard', desc: 'Earn points' },
            { icon: Users, label: 'Networking', desc: 'Meet people' },
            { icon: MessageSquare, label: 'Live Q&A', desc: 'Ask speakers' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-emerald-500/20 text-center">
              <Icon className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-emerald-200/40 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Install PWA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-full mb-4">
          <AnimatePresence mode="wait">
            {installed ? (
              <motion.div key="installed"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full p-4 rounded-2xl border border-emerald-500/30 bg-emerald-900/20 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold text-sm">App Installed! 🎉</p>
                  <p className="text-emerald-200/50 text-xs mt-0.5">Find it on your home screen</p>
                </div>
              </motion.div>
            ) : isIOS ? (
              <motion.div key="ios"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <p className="text-amber-300 text-xs font-semibold uppercase tracking-wider">Install on iPhone</p>
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { icon: Share, label: 'Tap Share', sub: 'bottom bar' },
                    { icon: Plus, label: 'Add to Home', sub: 'scroll down' },
                    { icon: CheckCircle2, label: 'Done!', sub: 'open app' },
                  ].map(({ icon: Icon, label, sub }, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-white text-xs font-medium text-center leading-tight">{label}</p>
                      <p className="text-white/30 text-[10px] text-center">{sub}</p>
                      {i < 2 && <div className="absolute" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : deferredPrompt ? (
              <motion.button key="android" onClick={handleInstall} whileTap={{ scale: 0.97 }}
                className="w-full p-4 rounded-2xl border border-emerald-500/30 bg-emerald-900/20 hover:bg-emerald-900/40 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <Download className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Install App</p>
                    <p className="text-emerald-200/50 text-xs mt-0.5">Add to home screen for quick access</p>
                  </div>
                  <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-auto text-emerald-400/50 text-lg">›</motion.div>
                </div>
              </motion.button>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Login CTA */}
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-xl font-bold text-black bg-amber-400 hover:bg-amber-500 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2">
          <LogIn size={20} />
          Sign In to the Event
        </motion.button>

      </div>
    </div>
  );
}
