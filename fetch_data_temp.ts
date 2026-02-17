
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
  const { data: speakers, error: speakersError } = await supabase
    .from('speakers')
    .select('id, name, night_id');

  if (speakersError) {
    console.error('Error fetching speakers:', speakersError);
    return;
  }

  const { data: nights, error: nightsError } = await supabase
    .from('event_nights')
    .select('id, title, date');

  if (nightsError) {
    console.error('Error fetching nights:', nightsError);
    return;
  }

  console.log(JSON.stringify({ speakers, nights }, null, 2));
}

fetchData();
