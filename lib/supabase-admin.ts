import { createClient } from '@supabase/supabase-js';

// Server-side only — never import this in client components!
const adminUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(adminUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
