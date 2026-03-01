require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('event_nights').select('title, agenda').eq('title', 'Grand Summit').single();
  if (error) console.error(error);
  else {
      console.log('Type of agenda:', typeof data.agenda);
      console.log('Value:', data.agenda);
  }
}
run();
