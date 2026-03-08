import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Trophy, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(to bottom, #064e3b, #022c22)' }}>
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 w-full flex justify-around items-center h-16 px-4 border-t border-emerald-500/20 bg-[#022c22]/90 backdrop-blur-md">
        <NavItem to="/" icon={<Home size={22} />} label="Tasks" />
        <NavItem to="/leaderboard" icon={<Trophy size={22} />} label="Leaderboard" />
        <NavItem to="/qna" icon={<MessageSquare size={22} />} label="Q&A" />
        <NavItem to="/profile" icon={<User size={22} />} label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      cn('flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors',
        isActive ? 'text-amber-400' : 'text-emerald-200/50 hover:text-emerald-200')}>
      {icon}
      <span className="mt-1">{label}</span>
    </NavLink>
  );
}
