
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

async function updateThemes() {
  console.log('Update Night 1: The Compass...');
  const { error: error1 } = await supabase
    .from('event_nights')
    .update({
      title: 'The Compass (Vision, Values & Brand)',
      subtitle: 'Aligning professional success with spiritual purpose and personal identity.',
      description: 'Focus: Aligning professional success with spiritual purpose and personal identity. Key Activity: "The Identity Workshop" - A guided session where speakers help attendees refine their "Core Purpose Statement" to ensure their business reflects their values.',
      agenda: [
        {time: "09:00 PM", title: "Executive Coffee & Welcoming", description: "Networking and Welcome Drink"},
        {time: "09:30 PM", title: "The Power Session", description: "Panel & Hands-on Work: Strategic Visionary, Brand Architect, Purpose Coach, Spiritual Guide"},
        {time: "12:30 AM", title: "Strategic Networking & Suhoor", description: "The Opportunity Exchange"},
        {time: "02:00 AM", title: "Closing & Goodbyes", description: ""}
      ],
      color_theme: 'emerald'
    })
    .eq('date', '2026-02-26');

  if (error1) console.error('Error updating Night 1:', error1);
  else console.log('Night 1 Updated.');

  console.log('Update Night 2: The Resilience...');
  const { error: error2 } = await supabase
    .from('event_nights')
    .update({
      title: 'The Resilience (Growth, Finance & Well-being)',
      subtitle: 'Navigating market volatility and maintaining mental and financial health.',
      description: 'Focus: Navigating market volatility and maintaining mental and financial health. Key Activity: "The Business Clinic" - A live "Shark Tank" style feedback session where speakers diagnose real business problems submitted by the audience and provide immediate prescriptions.',
      agenda: [
        {time: "09:00 PM", title: "Executive Coffee & Welcoming", description: "Networking and Welcome Drink"},
        {time: "09:30 PM", title: "The Power Session", description: "Panel & Hands-on Work: Financial Consultant, Operations Expert, Executive Psychologist, Resilience Mentor"},
        {time: "12:30 AM", title: "Strategic Networking & Suhoor", description: "The Opportunity Exchange"},
        {time: "02:00 AM", title: "Closing & Goodbyes", description: ""}
      ],
      color_theme: 'amber'
    })
    .eq('date', '2026-03-05');

  if (error2) console.error('Error updating Night 2:', error2);
  else console.log('Night 2 Updated.');

  console.log('Update Night 3: The Legacy...');
  const { error: error3 } = await supabase
    .from('event_nights')
    .update({
      title: 'The Legacy (Impact, Networking & Partnerships)',
      subtitle: 'Moving from individual success to collective influence and long-term impact.',
      description: 'Focus: Moving from individual success to collective influence and long-term impact. Key Activity: "The Mastermind Roundtables" - Small group rotations where attendees sit with the speakers to discuss high-level collaboration and partnership opportunities.',
      agenda: [
        {time: "09:00 PM", title: "Executive Coffee & Welcoming", description: "Networking and Welcome Drink"},
        {time: "09:30 PM", title: "The Power Session", description: "Panel & Hands-on Work: Angel Investor, Partnership Expert, Sustainability/CSR Expert, Legacy Builder"},
        {time: "12:30 AM", title: "Strategic Networking & Suhoor", description: "The Opportunity Exchange"},
        {time: "02:00 AM", title: "Closing & Goodbyes", description: ""}
      ],
      color_theme: 'blue'
    })
    .eq('date', '2026-03-12');

  if (error3) console.error('Error updating Night 3:', error3);
  else console.log('Night 3 Updated.');
}

updateThemes();
