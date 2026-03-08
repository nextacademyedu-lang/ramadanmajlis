import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { User, Briefcase, Phone, ArrowLeft, Camera, X } from 'lucide-react';
import { motion } from 'motion/react';
import CameraCapture from '../components/CameraCapture';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ metPersonName: '', metPersonField: '', metPersonPhone: '' });
  const [customData, setCustomData] = useState<Record<string, string>>({});
  const [activeCamera, setActiveCamera] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(data => setTask(data.find((t: any) => t.id === id)));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, taskId: id, ...formData, customData }),
      });
      if (res.ok) navigate('/');
      else alert('Failed to submit task');
    } finally { setLoading(false); }
  };

  if (!task) return <div className="p-8 text-center text-white/50">Loading task...</div>;

  const requiredFields: any[] = Array.isArray(task.required_fields) ? task.required_fields : JSON.parse(task.required_fields || '[]');
  const standardFields = ['name', 'field', 'phone'];
  const hasField = (f: string) => requiredFields.some((rf: any) => rf === f || rf?.name === f);
  const customFields = requiredFields.filter((f: any) => typeof f === 'object' && !standardFields.includes(f.name));

  const inputClass = "block w-full pl-10 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm";

  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center text-emerald-200/60 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">{task.title}</h1>
      <p className="text-emerald-200/60 mb-2">{task.description}</p>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-8">
        {task.points} pts
      </span>

      <form onSubmit={handleSubmit} className="space-y-5">
        {hasField('name') && (
          <div>
            <label className="block text-sm font-medium text-emerald-200/70 mb-1">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-emerald-400/50" /></div>
              <input type="text" required value={formData.metPersonName}
                onChange={e => setFormData({ ...formData, metPersonName: e.target.value })}
                className={inputClass} placeholder="John Doe" />
            </div>
          </div>
        )}
        {hasField('field') && (
          <div>
            <label className="block text-sm font-medium text-emerald-200/70 mb-1">Field / Industry</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-emerald-400/50" /></div>
              <input type="text" required value={formData.metPersonField}
                onChange={e => setFormData({ ...formData, metPersonField: e.target.value })}
                className={inputClass} placeholder="Software Engineering" />
            </div>
          </div>
        )}
        {hasField('phone') && (
          <div>
            <label className="block text-sm font-medium text-emerald-200/70 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-emerald-400/50" /></div>
              <input type="tel" required value={formData.metPersonPhone}
                onChange={e => setFormData({ ...formData, metPersonPhone: e.target.value })}
                className={inputClass} placeholder="01012345678" />
            </div>
          </div>
        )}
        {customFields.map((field: any, idx: number) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-emerald-200/70 mb-1 capitalize">{field.name}</label>
            {field.type === 'photo' ? (
              <div>
                {customData[field.name] ? (
                  <div className="relative w-32 h-32">
                    <img src={customData[field.name]} alt={field.name} className="w-32 h-32 rounded-xl object-cover border border-emerald-500/30" />
                    <button type="button" onClick={() => setCustomData(p => { const n = { ...p }; delete n[field.name]; return n; })}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setActiveCamera(field.name)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-emerald-300 hover:bg-white/15 transition-colors">
                    <Camera size={18} /> Take Photo
                  </button>
                )}
                <input type="hidden" required={!customData[field.name]} />
                {activeCamera === field.name && (
                  <CameraCapture
                    facingMode="environment"
                    onCapture={dataUrl => { setCustomData(p => ({ ...p, [field.name]: dataUrl })); setActiveCamera(null); }}
                    onClose={() => setActiveCamera(null)}
                  />
                )}
              </div>
            ) : field.type === 'dropdown' ? (
              <select required value={customData[field.name] || ''}
                onChange={e => setCustomData(p => ({ ...p, [field.name]: e.target.value }))}
                className="block w-full px-4 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-400 sm:text-sm">
                <option value="">Select {field.name}</option>
                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={field.type === 'date' ? 'date' : field.type} required
                value={customData[field.name] || ''}
                onChange={e => setCustomData(p => ({ ...p, [field.name]: e.target.value }))}
                className="block w-full px-4 py-3 rounded-xl bg-white/10 border border-emerald-500/20 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 sm:text-sm"
                placeholder={`Enter ${field.name}`} />
            )}
          </div>
        ))}

        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-black bg-amber-400 hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]">
          {loading ? 'Submitting...' : 'Complete Task ✓'}
        </motion.button>
      </form>
    </div>
  );
}
