import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  app.use(express.json({ limit: '10mb' }));

  // ── AUTH ──────────────────────────────────────────────────────────────────
  app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

    // Normalize: strip spaces, dashes, +20 prefix → 01xxxxxxxxx
    const normalize = (p: string) => {
      let n = p.replace(/[\s\-]/g, '');
      if (n.startsWith('+20')) n = '0' + n.slice(3);
      if (n.startsWith('20') && n.length === 12) n = '0' + n.slice(2);
      return n;
    };

    const normalizedInput = normalize(phone);

    const { data: users } = await supabase
      .from('event_users')
      .select('*')
      .eq('password', password);

    const user = (users || []).find((u: any) => normalize(u.phone) === normalizedInput);

    if (!user) return res.status(401).json({ error: 'Invalid phone or password' });
    res.json(user);
  });

  // ── TASKS ─────────────────────────────────────────────────────────────────
  app.get('/api/tasks', async (_req, res) => {
    const { data } = await supabase
      .from('event_tasks')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    res.json(data || []);
  });

  app.get('/api/user_tasks/:userId', async (req, res) => {
    const { data } = await supabase
      .from('event_user_tasks')
      .select('*')
      .eq('user_id', req.params.userId);
    res.json(data || []);
  });

  app.post('/api/tasks/submit', async (req, res) => {
    const { userId, taskId, metPersonName, metPersonField, metPersonPhone, customData } = req.body;

    const { data: existing } = await supabase
      .from('event_user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .single();

    if (existing) return res.status(400).json({ error: 'Task already completed' });

    const { data: task } = await supabase
      .from('event_tasks')
      .select('points')
      .eq('id', taskId)
      .single();

    const { error: insertError } = await supabase.from('event_user_tasks').insert({
      user_id: userId,
      task_id: taskId,
      met_person_name: metPersonName,
      met_person_field: metPersonField,
      met_person_phone: metPersonPhone,
      custom_data: customData || {},
    });

    if (insertError) return res.status(500).json({ error: 'Failed to save task: ' + insertError.message });

    const { error: rpcError } = await supabase.rpc('increment_user_score', { uid: userId, pts: task?.points || 10 });

    if (rpcError) return res.status(500).json({ error: 'Failed to update score: ' + rpcError.message });

    const { data: leaderboard } = await supabase
      .from('event_users')
      .select('id, name, photo_url, score')
      .order('score', { ascending: false })
      .limit(10);

    io.emit('leaderboard_update', leaderboard);

    const { data: user } = await supabase.from('event_users').select('name').eq('id', userId).single();
    io.emit('notification', {
      title: 'Task Completed!',
      message: `${user?.name} just completed a task and earned ${task?.points || 10} points!`,
    });

    res.json({ success: true });
  });

  // ── CONTACTS ──────────────────────────────────────────────────────────────
  app.get('/api/users/:userId/contacts', async (req, res) => {
    const { data } = await supabase
      .from('event_user_tasks')
      .select('id, met_person_name, met_person_field, met_person_phone')
      .eq('user_id', req.params.userId)
      .not('met_person_name', 'is', null);
    res.json(data || []);
  });

  // ── LEADERBOARD ───────────────────────────────────────────────────────────
  app.get('/api/leaderboard', async (_req, res) => {
    const { data } = await supabase
      .from('event_users')
      .select('id, name, photo_url, score')
      .order('score', { ascending: false })
      .limit(10);
    res.json(data || []);
  });

  // ── QUESTIONS ─────────────────────────────────────────────────────────────
  app.get('/api/questions', async (_req, res) => {
    const { data } = await supabase
      .from('event_questions')
      .select('id, text, created_at, user_id, event_users(name, photo_url)')
      .order('created_at', { ascending: false });

    const formatted = (data || []).map((q: any) => ({
      id: q.id,
      text: q.text,
      created_at: q.created_at,
      user_name: q.event_users?.name,
      user_photo: q.event_users?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${q.event_users?.name}`,
    }));
    res.json(formatted);
  });

  app.post('/api/questions', async (req, res) => {
    const { userId, text } = req.body;
    const { data: q } = await supabase
      .from('event_questions')
      .insert({ user_id: userId, text })
      .select('id, text, created_at, user_id, event_users(name, photo_url)')
      .single();

    if (!q) return res.status(500).json({ error: 'Failed to insert question' });

    const formatted = {
      id: q.id,
      text: q.text,
      created_at: q.created_at,
      user_name: (q as any).event_users?.name,
      user_photo: (q as any).event_users?.photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${(q as any).event_users?.name}`,
    };

    io.emit('new_question', formatted);
    res.json(formatted);
  });

  // ── SETTINGS ──────────────────────────────────────────────────────────────
  app.get('/api/settings', async (_req, res) => {
    const { data } = await supabase.from('event_settings').select('*');
    const settings: Record<string, string> = {};
    (data || []).forEach((s: any) => { settings[s.key] = s.value; });
    res.json(settings);
  });

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  app.post('/api/admin/tasks', async (req, res) => {
    const { title, description, points, required_fields, task_type, poll_options, poll_duration_seconds } = req.body;
    await supabase.from('event_tasks').insert({
      title, description, points, required_fields,
      task_type: task_type || 'regular',
      poll_options: poll_options || null,
      poll_duration_seconds: poll_duration_seconds || null,
    });
    res.json({ success: true });
  });

  // Admin: get ALL tasks (including inactive)
  app.get('/api/admin/tasks', async (_req, res) => {
    const { data } = await supabase
      .from('event_tasks')
      .select('*')
      .order('display_order');
    res.json(data || []);
  });

  // Admin: toggle task is_active
  app.patch('/api/admin/tasks/:id/toggle', async (req, res) => {
    const { is_active } = req.body;
    await supabase.from('event_tasks').update({ is_active }).eq('id', req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/tasks/:id', async (req, res) => {
    await supabase.from('event_tasks').delete().eq('id', req.params.id);
    res.json({ success: true });
  });

  // Admin: update task
  app.put('/api/admin/tasks/:id', async (req, res) => {
    const { title, description, points, poll_options, poll_duration_seconds } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (points !== undefined) update.points = points;
    if (poll_options !== undefined) update.poll_options = poll_options;
    if (poll_duration_seconds !== undefined) update.poll_duration_seconds = poll_duration_seconds;
    await supabase.from('event_tasks').update(update).eq('id', req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/questions/:id', async (req, res) => {
    await supabase.from('event_questions').delete().eq('id', req.params.id);
    io.emit('delete_question', req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/settings', async (req, res) => {
    const { key, value } = req.body;
    await supabase.from('event_settings').upsert({ key, value, updated_at: new Date().toISOString() });
    io.emit('settings_update', { key, value });
    res.json({ success: true });
  });

  app.post('/api/notifications', (req, res) => {
    io.emit('notification', req.body);
    res.json({ success: true });
  });

  // ── POLL ──────────────────────────────────────────────────────────────────
  app.post('/api/poll/vote', async (req, res) => {
    const { taskId, userId, option } = req.body;
    if (!taskId || !userId || !option) return res.status(400).json({ error: 'Missing fields' });

    const { error } = await supabase.from('event_poll_votes').insert({ task_id: taskId, user_id: userId, option });
    if (error) return res.status(400).json({ error: error.message });

    // جيب النتائج المحدثة وابعتها real-time
    const { data: votes } = await supabase
      .from('event_poll_votes')
      .select('option')
      .eq('task_id', taskId);

    const results: Record<string, number> = {};
    (votes || []).forEach((v: any) => { results[v.option] = (results[v.option] || 0) + 1; });
    io.emit('poll_update', { taskId, results });

    res.json({ success: true, results });
  });

  app.get('/api/poll/:taskId/results', async (req, res) => {
    const { data: votes } = await supabase
      .from('event_poll_votes')
      .select('option')
      .eq('task_id', req.params.taskId);

    const results: Record<string, number> = {};
    (votes || []).forEach((v: any) => { results[v.option] = (results[v.option] || 0) + 1; });
    res.json(results);
  });

  app.get('/api/poll/:taskId/user/:userId', async (req, res) => {
    const { data } = await supabase
      .from('event_poll_votes')
      .select('option')
      .eq('task_id', req.params.taskId)
      .eq('user_id', req.params.userId)
      .single();
    res.json({ voted: !!data, option: data?.option || null });
  });

  // ── USERS (admin) ─────────────────────────────────────────────────────────
  app.get('/api/users', async (_req, res) => {
    const { data } = await supabase
      .from('event_users')
      .select('id, name, phone, field, company, score, password')
      .order('name');
    res.json(data || []);
  });

  // ── SOCKET ────────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });

  // ── VITE ──────────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
