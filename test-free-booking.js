require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Create a dummy free booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
        customer_name: "WhatsApp Test",
        email: "whatsapp@example.com",
        phone: "+201505822735", 
        job_title: "Tester",
        company: "Test Co",
        industry: "IT",
        selected_nights: ["2026-03-12"],
        ticket_count: 1,
        total_amount: 0,
        payment_provider: "easykash",
        payment_status: "pending"
    })
    .select()
    .single();

  if (error || !booking) {
      console.error("Setup Error:", error);
      return;
  }
  
  console.log("Created Booking ID:", booking.id);

  // 2. Call the confirm-free-booking API (simulating the client)
  try {
      const response = await fetch('http://localhost:3000/api/confirm-free-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id })
      });
      const result = await response.json();
      console.log("API Response:", result);
  } catch (err) {
      console.error("API Error:", err);
  }

  // 3. Cleanup
  await supabase.from('bookings').delete().eq('id', booking.id);
  console.log("Cleanup done.");
}

run();
