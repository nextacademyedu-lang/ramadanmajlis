
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateEventName() {
  console.log('Updating event name to "Ramadan Majlis"...');
  
  const { data, error } = await supabase
    .from('events')
    .update({ name: 'Ramadan Majlis' })
    .eq('slug', 'Ramadan Majlis Package')
    .select();

  if (error) {
      console.error('Error updating event:', error);
  } else {
      console.log('Successfully updated event:', JSON.stringify(data, null, 2));
  }
}

updateEventName();
