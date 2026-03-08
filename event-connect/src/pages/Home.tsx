import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { io } from 'socket.io-client';

interface Task { id: string; title: string; description: string; points: number; }
interface UserTask { task_id: string; }

export default function Home() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [tasksOpen, setTasksOpen] = useState(false);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks);
    fetch('/api/settings').then(r => r.json()).then(s => setTasksOpen(s.tasks_open === 'true'));
    if (user) fetch(`/api/user_tasks/${user.id}`).then(r => r.json()).then(setUserTasks);
    const socket = io();
    socket.on('settings_update', ({ key, value }: any) => { if (key === 'tasks_open') setTasksOpen(value === 'true'); });
    return () => { socket.disconnect(); };
  }, [user]);

  const isCompleted = (id: string) => userTasks.some(ut => ut.task_id === id);
  const completedCount = tasks.filter(t => isCompleted(t.id)).length;
  const progressPct = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="max-w-md mx-auto p-4 pt-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <img src="/majlis_logo.png" alt="" className="h-8 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-2xl font-bold text-white">Your Tasks</h1>
        </div>
        <p className="text-emerald-200/60 mt-1">Complete tasks to earn points!</p>
        <div className="mt-5">
          <div className="flex justify-between text-sm font-medium text-emerald-200/70 mb-2">
            <span>Progress</span>
            <span>{completedCount} / {tasks.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div className="bg-amber-400 h-2 rounded-full" initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </header>

      {!tasksOpen ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-emerald-400/50" />
          </div>
          <p className="text-white font-medium">Tasks are not open yet</p>
          <p className="text-emerald-200/40 text-sm mt-1">The host will unlock them soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const completed = isCompleted(task.id);
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Link to={completed ? '#' : `/task/${task.id}`}
                  className={`block p-4 rounded-xl border transition-all ${completed
                    ? 'bg-white/5 border-white/10 cursor-default'
                    : 'bg-white/5 border-emerald-500/20 hover:border-emerald-400/40 hover:bg-white/10'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <h3 className={`font-semibold ${completed ? 'text-white/40 line-through' : 'text-white'}`}>{task.title}</h3>
                      <p className={`text-sm mt-1 ${completed ? 'text-white/30' : 'text-emerald-200/60'}`}>{task.description}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 mt-3">
                        {task.points} pts
                      </span>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {completed
                        ? <CheckCircle2 className="text-emerald-400" size={22} />
                        : <Circle className="text-white/20" size={22} />}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
