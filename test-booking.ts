import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// Load env vars BEFORE importing booking service
import { confirmBooking } from './lib/booking-service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

async function run() {
  const { data: booking, error } = await supabase.from('bookings').insert({
      customer_name: 'WhatsApp Test', email: 'whatsapp@example.com', phone: '+201505822735', 
      job_title: 'Tester', company: 'Test Co', industry: 'IT', selected_nights: ['2026-03-12'],
      ticket_count: 1, total_amount: 0, payment_provider: 'easykash', payment_status: 'pending'
  }).select().single();

  if(!error && booking) {
     console.log('Created:', booking.id);
     try {
         const result = await confirmBooking(booking.id);
         console.log('Result:', JSON.stringify(result, null, 2));
     } catch (e) {
         console.error('Service error:', e);
     }
     await supabase.from('bookings').delete().eq('id', booking.id);
  } else {
    console.error('Insert error:', error);
  }
}
run();
