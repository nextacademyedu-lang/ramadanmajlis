import { createClient } from '@supabase/supabase-js';

const OLD = createClient(
  'https://afokabguqrexeqkfretn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2thYmd1cXJleGVxa2ZyZXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjI1MDI3MiwiZXhwIjoyMDgxODI2MjcyfQ.s3cHqxtDVnMGWiFeJDjbXtSLs0h4HjC1bbJNwKNGiZg'
);
const NEW = createClient(
  'https://dqduxsimueexppfiinpw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw'
);

const { data, error } = await OLD.from('event_users').select('*');
if (error) { console.error('READ:', error.message); process.exit(1); }
const { error: e } = await NEW.from('event_users').upsert(data, { onConflict: 'id' });
if (e) console.error('WRITE:', e.message);
else console.log(`✓ event_users: ${data.length} rows`);
