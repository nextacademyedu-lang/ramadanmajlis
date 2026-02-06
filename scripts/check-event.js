
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

async function checkEvent() {
  console.log('Checking event: Ramadan Majlis Package...');
  
  // Check exact match
  const { data: exactMatch, error: exactError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', 'Ramadan Majlis Package')
    .single();

  if (exactError) {
      console.error('Error fetching exact match:', exactError);
  } else {
      console.log('Found exact match:', JSON.stringify(exactMatch, null, 2));
  }

  // List all events to see if there's a typo
  console.log('\nListing all events:');
  const { data: allEvents, error: allError } = await supabase
    .from('events')
    .select('id, title, slug, start_date');
    
  if (allError) {
      console.error('Error listing events:', allError);
  } else {
      console.log('All events:', JSON.stringify(allEvents, null, 2));
  }
}

checkEvent();
