import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Settings, Maximize2, ToggleLeft, ToggleRight, Bell, Send, X, Pencil, Check } from 'lucide-react';

type FieldType = 'text' | 'number' | 'tel' | 'email' | 'date' | 'dropdown' | 'photo';
type CustomField = { name: string; type: FieldType; options?: string };
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [newTask, setNewTask] = useState({ title: '', description: '', points: 10, task_type: 'regular' as 'regular' | 'poll', poll_options: '', poll_duration_seconds: 60 });
  const [stdFields, setStdFields] = useState({ name: true, field: true, phone: true });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newField, setNewField] = useState<CustomField>({ name: '', type: 'text', options: '' });
  const [notif, setNotif] = useState({ title: '', message: '' });
  const [notifSent, setNotifSent] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', points: 0 });

  useEffect(() => {
    fetchData();
    const socket = io();
    socket.on('new_question', (q: any) => setQuestions(prev => [q, ...prev]));
    socket.on('delete_question', (id: string) => setQuestions(prev => prev.filter(q => q.id !== id)));
    return () => { socket.disconnect(); };
  }, []);

  const fetchData = async () => {
    const [tasksRes, qRes, settingsRes] = await Promise.all([
      fetch('/api/admin/tasks'),
      fetch('/api/questions'),
      fetch('/api/settings'),
    ]);
    setTasks(await tasksRes.json());
    setQuestions(await qRes.json());
    setSettings(await settingsRes.json());
  };

  const toggleSetting = async (key: string) => {
    const newVal = settings[key] === 'true' ? 'false' : 'true';
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: newVal }),
    });
    setSettings(prev => ({ ...prev, [key]: newVal }));
  };

  const addCustomField = () => {
    if (!newField.name.trim()) return;
    setCustomFields(prev => [...prev, { ...newField, name: newField.name.trim() }]);
    setNewField({ name: '', type: 'text', options: '' });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const required_fields: any[] = [
      ...(stdFields.name ? ['name'] : []),
      ...(stdFields.field ? ['field'] : []),
      ...(stdFields.phone ? ['phone'] : []),
      ...customFields.map(f => ({
        name: f.name,
        type: f.type,
        ...(f.type === 'dropdown' && f.options ? { options: f.options.split(',').map(o => o.trim()).filter(Boolean) } : {}),
      })),
    ];
    await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newTask,
        required_fields: newTask.task_type === 'poll' ? [] : required_fields,
        poll_options: newTask.task_type === 'poll'
          ? newTask.poll_options.split(',').map(o => o.trim()).filter(Boolean)
          : null,
        poll_duration_seconds: newTask.task_type === 'poll' ? newTask.poll_duration_seconds : null,
      }),
    });
    setNewTask({ title: '', description: '', points: 10, task_type: 'regular', poll_options: '', poll_duration_seconds: 60 });
    setStdFields({ name: true, field: true, phone: true });
    setCustomFields([]);
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleToggleTask = async (id: string, currentActive: boolean) => {
    await fetch(`/api/admin/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentActive }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentActive } : t));
  };

  const startEditTask = (task: { id: string; title: string; description: string; points: number }) => {
    setEditingTask(task.id);
    setEditForm({ title: task.title, description: task.description || '', points: task.points });
  };

  const saveEditTask = async (id: string) => {
    await fetch(`/api/admin/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...editForm } : t));
    setEditingTask(null);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    setNotifSent(true);
    setNotif({ title: '', message: '' });
    setTimeout(() => setNotifSent(false), 3000);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Delete this question?')) {
      await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    }
  };

  const Toggle = ({ settingKey, label }: { settingKey: string; label: string }) => {
    const isOn = settings[settingKey] === 'true';
    return (
      <button onClick={() => toggleSetting(settingKey)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isOn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-white/50 border border-white/10'}`}>
        {isOn ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        {label}: {isOn ? 'OPEN' : 'CLOSED'}
      </button>
    );
  };

  return (
    <div className="min-h-screen p-8 text-white" style={{ background: 'linear-gradient(160deg, #064e3b 0%, #022c22 45%, #0a1628 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
          <Settings className="mr-3 text-emerald-400" /> Admin Dashboard
        </h1>

        {/* Controls */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Event Controls</h2>
          <div className="flex flex-wrap gap-3">
            <Toggle settingKey="tasks_open" label="Tasks" />
            <Toggle settingKey="qa_open" label="Q&A" />
          </div>
        </div>

        {/* Push Notification */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell size={20} className="text-amber-400" /> Send Push Notification
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: '🔥 Tasks Open', title: '🔥 Tasks are now open!', message: 'Head to the app and start completing tasks to earn points!' },
              { label: '💬 Q&A Open', title: '💬 Live Q&A is now open!', message: 'Ask your questions to the speakers now!' },
              { label: '🏆 Leaderboard', title: '🏆 Leaderboard Update', message: "Check the live leaderboard — who's on top?" },
              { label: '🌙 Wrap Up', title: '🌙 Thank you!', message: 'Ramadan Majlis 2026 — thank you for being here tonight!' },
            ].map(t => (
              <button key={t.label} type="button"
                onClick={() => setNotif({ title: t.title, message: t.message })}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-500/30 transition-colors">
                {t.label}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendNotification} className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input type="text" placeholder="Title" required value={notif.title}
                onChange={e => setNotif(p => ({ ...p, title: e.target.value }))}
                className="flex-1 p-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              <button type="submit"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  notifSent ? 'bg-emerald-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}>
                <Send size={15} />{notifSent ? '✓ Sent!' : 'Send'}
              </button>
            </div>
            <input type="text" placeholder="Message body..." required value={notif.message}
              onChange={e => setNotif(p => ({ ...p, message: e.target.value }))}
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Manage Tasks</h2>
              <Link to="/manageappramadan/leaderboard" target="_blank"
                className="flex items-center text-sm text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-lg font-medium">
                <Maximize2 size={16} className="mr-2" /> Present Leaderboard
              </Link>
              <Link to="/manageappramadan/poll" target="_blank"
                className="flex items-center text-sm text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium">
                <Maximize2 size={16} className="mr-2" /> Present Poll
              </Link>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
              <h3 className="font-semibold text-emerald-300">Add New Task</h3>
              <input type="text" placeholder="Task Title" required value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              <textarea placeholder="Description" required value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
              <input type="number" placeholder="Points" required value={newTask.points}
                onChange={e => setNewTask({ ...newTask, points: Number(e.target.value) })}
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />

              {/* Task Type */}
              <div>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Task Type</p>
                <div className="flex gap-2">
                  {(['regular', 'poll'] as const).map(t => (
                    <button key={t} type="button"
                      onClick={() => setNewTask(p => ({ ...p, task_type: t }))}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                        newTask.task_type === t
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-white/30 border-white/10'
                      }`}>
                      {t === 'poll' ? '📊 Poll' : '✅ Regular'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Poll specific fields */}
              {newTask.task_type === 'poll' && (
                <div className="space-y-2 bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
                  <p className="text-xs text-purple-300/70 uppercase tracking-wider">Poll Settings</p>
                  <input type="text" placeholder="Options: Option A, Option B, Option C" value={newTask.poll_options}
                    onChange={e => setNewTask(p => ({ ...p, poll_options: e.target.value }))}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm" />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/40 whitespace-nowrap">Duration (seconds)</label>
                    <input type="number" min={10} value={newTask.poll_duration_seconds}
                      onChange={e => setNewTask(p => ({ ...p, poll_duration_seconds: Number(e.target.value) }))}
                      className="flex-1 p-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-sm" />
                  </div>
                </div>
              )}

              {/* Standard fields & Custom fields — only for regular tasks */}
              {newTask.task_type === 'regular' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Standard Fields</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['name', 'field', 'phone'] as const).map(f => (
                        <button key={f} type="button"
                          onClick={() => setStdFields(p => ({ ...p, [f]: !p[f] }))}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            stdFields[f] ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-white/30 border-white/10'
                          }`}>
                          {stdFields[f] ? '✓ ' : ''}{f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Custom Fields</p>
                    {customFields.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-white/70 text-sm flex-1">{f.name}</span>
                        <span className="text-white/30 text-xs">{f.type}</span>
                        <button type="button" onClick={() => setCustomFields(p => p.filter((_, j) => j !== i))}
                          className="text-red-400/60 hover:text-red-400">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <input type="text" placeholder="Field name" value={newField.name}
                        onChange={e => setNewField(p => ({ ...p, name: e.target.value }))}
                        className="flex-1 p-1.5 bg-white/5 border border-white/10 rounded-md text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                      <select value={newField.type}
                        onChange={e => setNewField(p => ({ ...p, type: e.target.value as FieldType }))}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-md text-white text-sm focus:outline-none">
                        {(['text','number','tel','email','date','dropdown','photo'] as FieldType[]).map(t => (
                          <option key={t} value={t} className="bg-[#022c22]">{t}</option>
                        ))}
                      </select>
                      <button type="button" onClick={addCustomField}
                        className="px-3 py-1.5 bg-emerald-600/50 hover:bg-emerald-600 text-white rounded-md text-sm">
                        <Plus size={14} />
                      </button>
                    </div>
                    {newField.type === 'dropdown' && (
                      <input type="text" placeholder="Options: A, B, C" value={newField.options}
                        onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                        className="w-full mt-1.5 p-1.5 bg-white/5 border border-white/10 rounded-md text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-md flex items-center justify-center">
                <Plus size={18} className="mr-2" /> Add Task
              </button>
            </form>

            <div className="space-y-3">
              {tasks.map(task => (
                <div key={task.id} className={`p-4 border rounded-xl transition-colors ${
                  task.is_active
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-white/10 bg-white/5 opacity-60'
                }`}>
                  {editingTask === task.id ? (
                    <div className="space-y-2">
                      <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="Title" />
                      <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        placeholder="Description" />
                      <div className="flex items-center gap-2">
                        <input type="number" value={editForm.points} onChange={e => setEditForm(p => ({ ...p, points: +e.target.value }))}
                          className="w-24 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                        <span className="text-white/40 text-xs">Points</span>
                        <div className="flex-1" />
                        <button onClick={() => saveEditTask(task.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white">
                          <Check size={14} /> Save
                        </button>
                        <button onClick={() => setEditingTask(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white">
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{task.title}</h4>
                        {task.description && <p className="text-xs text-white/40 mt-0.5">{task.description}</p>}
                        <p className="text-sm text-emerald-400">{task.points} Points</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTask(task.id, task.is_active)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            task.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 text-white/40 border-white/10'
                          }`}
                        >
                          {task.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {task.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => startEditTask(task)} className="text-amber-400 hover:bg-amber-500/10 p-2 rounded-full">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-full">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Live Q&A</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {questions.length}
                </span>
              </div>
              <Link to="/manageappramadan/qa" target="_blank"
                className="flex items-center text-sm text-emerald-300 bg-emerald-900/50 px-3 py-1.5 rounded-full border border-emerald-500/30 hover:bg-emerald-900/80">
                <Maximize2 size={16} className="mr-1.5" /> Full Screen
              </Link>
            </div>
            <div className="space-y-4">
              {questions.map(q => (
                <div key={q.id} className="p-4 border border-white/10 rounded-xl bg-white/5 flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <img src={q.user_photo} alt="" className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" />
                    <div>
                      <p className="font-semibold text-emerald-300">{q.user_name}</p>
                      <p className="text-white/80 mt-1">{q.text}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-full">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {questions.length === 0 && <p className="text-white/30 text-center">No questions yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
