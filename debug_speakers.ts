
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function dumpSpeakers() {
  const { data: speakers, error } = await supabase
    .from('speakers')
    .select('id, name, role, speaker_topic, night_id')
    .order('night_id');

  if (error) {
    console.error(error);
    return;
  }
  
  console.log(JSON.stringify(speakers, null, 2));
}

dumpSpeakers();
