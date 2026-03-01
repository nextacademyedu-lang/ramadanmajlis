const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
        customer_name: "Muhammed Mekky",
        email: "muhammedmekky4@gmail.com",
        phone: "+201098620547", 
        job_title: "Marketing manager",
        company: "Next",
        industry: "Marketing",
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
  
  console.log("Created Booking ID:", booking.id, "for Muhammed Mekky");

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
}

run();
