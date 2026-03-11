// Script to send poster messages to bookings that missed their WhatsApp messages
const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis1";

const SUPABASE_URL = "https://afokabguqrexeqkfretn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2thYmd1cXJleGVxa2ZyZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTAyNzIsImV4cCI6MjA4MTgyNjI3Mn0.LwRJNBpH8hNt6GSOma4WzTrSoeM2tKz_KkTVSNI9ZHM";

const MISSED_BOOKING_IDS = [
    "91d67b20-a02e-423d-97ef-2cd22ac53d06",
    "c0ff4a4c-76f5-4be1-ae72-4a52246ff061",
    "3c08d2b6-0229-49b4-bb4e-1cd1bd98b45a",
    "cdd1bd01-0c7a-45e7-873a-cf0834ca76d0",
    "00f5496a-41ff-401a-b4f1-d5746955d625",
    "f14d7f52-72ab-439e-9a6a-f3e339dbb2ce",
    "9182b826-4ec8-46c8-ae7c-a726e18c88af",
    "4c2371d4-6518-4232-adf7-3cb002bbed13"
];

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1);
    if (!cleaned.startsWith('20') && cleaned.length === 10) cleaned = '20' + cleaned;
    return cleaned;
}

async function fetchBooking(id) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}&select=*`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data[0] || null;
}

async function sendPoster(booking) {
    const formattedPhone = formatPhoneNumber(booking.phone);
    const baseUrl = "https://ramadanmajlis.nextacademyedu.com";
    const params = new URLSearchParams({
        name: (booking.customer_name || '').trim(),
        title: (booking.job_title || '').trim(),
        company: (booking.company || '').trim(),
        industry: (booking.industry || '').trim(),
        photo: (booking.profile_image_url || '').trim()
    });

    const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

    const caption = `Hello ${booking.customer_name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

One epic night combining strategic vision, financial resilience, AI operations, and legacy building — with panels, networking, learning circles, and Suhoor.

📍 Night 2: Hyatt Regency, 6th October | 🗓 5 Mar 2026 – The Resilience
📍 Night 3: Pyramisa Suites Hotel, Dokki | 🗓 12 Mar 2026 – The Legacy

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #GrandSummit #NextAcademy`;

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${encodeURIComponent(EVOLUTION_INSTANCE_NAME)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: formattedPhone,
                mediatype: 'image',
                media: imageUrl,
                caption: caption
            })
        });

        const data = await response.json();
        return { success: response.ok, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function main() {
    console.log(`\n📨 Sending poster messages to ${MISSED_BOOKING_IDS.length} missed bookings...\n`);
    
    let successCount = 0;
    let failCount = 0;

    for (const id of MISSED_BOOKING_IDS) {
        const booking = await fetchBooking(id);
        
        if (!booking) {
            console.log(`❌ Booking ${id} NOT FOUND`);
            failCount++;
            continue;
        }

        console.log(`📤 Sending to: ${booking.customer_name} (${booking.phone})`);
        const result = await sendPoster(booking);
        
        if (result.success) {
            console.log(`   ✅ Sent successfully!`);
            successCount++;
        } else {
            console.log(`   ❌ Failed:`, result.error || JSON.stringify(result.data));
            failCount++;
        }

        // Wait 2 seconds between sends to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n📊 Done! ✅ ${successCount} sent, ❌ ${failCount} failed\n`);
}

main();
