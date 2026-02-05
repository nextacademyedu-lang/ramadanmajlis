
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://afokabguqrexeqkfretn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2thYmd1cXJleGVxa2ZyZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTAyNzIsImV4cCI6MjA4MTgyNjI3Mn0.LwRJNBpH8hNt6GSOma4WzTrSoeM2tKz_KkTVSNI9ZHM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- Events Table ---');
  const { data: events, error: eventsError } = await supabase.from('events').select('*').limit(1);
  if (eventsError) console.error(eventsError);
  else {
      console.log('Columns:', Object.keys(events[0] || {}));
      console.log('Example Row:', events[0]);
  }
}

inspect();
