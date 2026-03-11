import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import SponsorsMarquee from '../components/SponsorsMarquee';

interface Question { id: string; text: string; created_at: string; user_name: string; user_photo: string; }

export default function QnA() {
  const { user } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [qaOpen, setQaOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then(d => setQuestions([...d].reverse()));
    fetch('/api/settings').then(r => r.json()).then(s => setQaOpen(s.qa_open === 'true'));
    const socket = io();
    socket.on('new_question', (q: Question) => setQuestions(prev => [...prev, q]));
    socket.on('delete_question', (id: string) => setQuestions(prev => prev.filter(q => q.id !== id)));
    socket.on('settings_update', ({ key, value }: any) => { if (key === 'qa_open') setQaOpen(value === 'true'); });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, text: newQuestion }),
    });
    setNewQuestion('');
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto pt-8">
      <header className="px-4 mb-4 text-center">
        <MessageSquare className="mx-auto h-9 w-9 text-emerald-400 mb-2" />
        <h1 className="text-2xl font-bold text-white">Live Q&A</h1>
        <p className="text-emerald-200/50 text-sm mt-1">Ask questions to the speakers</p>
      </header>
      <SponsorsMarquee />

      {!qaOpen ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-emerald-400/50" />
          </div>
          <p className="text-white font-medium">Q&A is not open yet</p>
          <p className="text-emerald-200/40 text-sm mt-1">The host will unlock it soon</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
            <AnimatePresence>
              {questions.map(q => (
                <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${q.user_name === user?.name ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${q.user_name === user?.name ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img src={q.user_photo} alt={q.user_name}
                      className={`h-9 w-9 rounded-full flex-shrink-0 object-cover border border-emerald-500/30 ${q.user_name === user?.name ? 'ml-2' : 'mr-2'}`} />
                    <div className={`flex flex-col ${q.user_name === user?.name ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-emerald-200/40 mb-1">
                        {q.user_name} · {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                      </span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${q.user_name === user?.name
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white/10 border border-white/10 text-white rounded-tl-none'}`}>
                        {q.text}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="fixed bottom-16 left-0 right-0 p-4 border-t border-emerald-500/20 bg-[#022c22]/90 backdrop-blur-md">
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-full border border-emerald-500/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 text-sm" />
                <button type="submit" disabled={!newQuestion.trim()}
                  className="bg-amber-400 hover:bg-amber-500 text-black rounded-full p-2.5 disabled:opacity-40 transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
