import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { X } from 'lucide-react';

const DURATION = 6000;

const ANIM_STYLE = `
  @keyframes notif-in {
    from { opacity: 0; transform: translateY(-28px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes notif-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-16px) scale(0.95); }
  }
  @keyframes timer-shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }
`;

function NotificationToast({ t, title, message }: { t: any; title: string; message: string }) {
  return (
    <div style={{ animation: t.visible ? 'notif-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'notif-out 0.3s ease-in forwards' }}
      className="w-[340px] max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
    >
      <style>{ANIM_STYLE}</style>

      {/* Timer bar */}
      <div className="h-1 bg-white/10 overflow-hidden">
        <div className="h-full origin-left bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"
          style={{ animation: `timer-shrink ${DURATION}ms linear forwards` }} />
      </div>

      <div className="flex items-start gap-3 p-4"
        style={{ background: 'linear-gradient(135deg,#064e3b 0%,#022c22 100%)', border: '1px solid rgba(16,185,129,0.2)', borderTop: 'none' }}>

        {/* Logo */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
          <img src="/majlis_logo.png" alt="" className="w-9 h-9 object-contain"
            onError={e => { (e.currentTarget as HTMLImageElement).replaceWith(Object.assign(document.createElement('span'), { textContent: '🌙', style: 'font-size:20px' })); }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-widest mb-0.5">Ramadan Majlis</p>
          <p className="text-sm font-bold text-white leading-snug">{title}</p>
          <p className="text-xs text-emerald-200/55 mt-1 leading-relaxed">{message}</p>
        </div>

        {/* Dismiss */}
        <button onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = io();
    socket.on('notification', (data: { title: string; message: string }) => {
      toast.custom(t => <NotificationToast t={t} title={data.title} message={data.message} />, { duration: DURATION });
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      {children}
    </>
  );
}
