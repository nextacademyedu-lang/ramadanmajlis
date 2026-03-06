// Script to send CORRECTED poster + QR tickets to missed bookings
const EVOLUTION_API_URL = "https://evolution-api-production-da45.up.railway.app";
const EVOLUTION_API_KEY = "108200@@aA";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis";

const SUPABASE_URL = "https://afokabguqrexeqkfretn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmb2thYmd1cXJleGVxa2ZyZXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTAyNzIsImV4cCI6MjA4MTgyNjI3Mn0.LwRJNBpH8hNt6GSOma4WzTrSoeM2tKz_KkTVSNI9ZHM";

// Booking ID -> QR code mapping from database
const BOOKING_TICKETS = {
    "91d67b20-a02e-423d-97ef-2cd22ac53d06": "4c4d7b12-e1ee-4e88-9295-0fcb7e58622e",
    "c0ff4a4c-76f5-4be1-ae72-4a52246ff061": "3d348f15-3698-47cc-8304-1c0eea27acfb",
    "3c08d2b6-0229-49b4-bb4e-1cd1bd98b45a": "1b9609cc-db36-463d-8d0a-8be5441abfcf",
    "cdd1bd01-0c7a-45e7-873a-cf0834ca76d0": "cbfd63a3-a27b-4b75-9376-085f3b4cf264",
    "00f5496a-41ff-401a-b4f1-d5746955d625": "7d912dfb-8cd5-4d39-89e1-18db34b98a9a",
    "f14d7f52-72ab-439e-9a6a-f3e339dbb2ce": "55ace3a1-88dc-4a33-8e41-5fa8762c4647",
    "9182b826-4ec8-46c8-ae7c-a726e18c88af": "7a338f7b-70f0-4949-8283-9145b236a78e",
    "4c2371d4-6518-4232-adf7-3cb002bbed13": "b327aa42-d2de-466b-8c66-cf4a6f4e402d"
};

const MISSED_BOOKING_IDS = Object.keys(BOOKING_TICKETS);

function formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1);
    if (!cleaned.startsWith('20') && cleaned.length === 10) cleaned = '20' + cleaned;
    return cleaned;
}

// Extract ALL phone numbers from a phone field (handles "num1 / num2" format)
function extractPhoneNumbers(phone) {
    const parts = phone.split(/[\/,]/);
    return parts.map(p => formatPhoneNumber(p.trim())).filter(p => p.length >= 10);
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

async function sendMedia(phone, mediaUrl, caption) {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${encodeURIComponent(EVOLUTION_INSTANCE_NAME)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
            number: phone,
            mediatype: 'image',
            media: mediaUrl,
            caption: caption
        })
    });
    const data = await response.json();
    return { success: response.ok, data };
}

async function main() {
    console.log(`\n📨 Sending CORRECTED poster + QR tickets to ${MISSED_BOOKING_IDS.length} bookings...\n`);
    
    let successCount = 0;
    let failCount = 0;

    for (const id of MISSED_BOOKING_IDS) {
        const booking = await fetchBooking(id);
        
        if (!booking) {
            console.log(`❌ Booking ${id} NOT FOUND`);
            failCount++;
            continue;
        }

        const phoneNumbers = extractPhoneNumbers(booking.phone);
        console.log(`\n👤 ${booking.customer_name} | Phones: ${phoneNumbers.join(', ')}`);

        // --- 1) Send corrected POSTER ---
        const baseUrl = "https://ramadanmajlis.nextacademyedu.com";
        const params = new URLSearchParams({
            name: (booking.customer_name || '').trim(),
            title: (booking.job_title || '').trim(),
            company: (booking.company || '').trim(),
            industry: (booking.industry || '').trim(),
            photo: (booking.profile_image_url || '').trim()
        });
        const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

        const posterCaption = `Hello ${booking.customer_name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

One epic night combining strategic vision, financial resilience, AI operations, and legacy building — with panels, networking, learning circles, and Suhoor.

📍 Grand Summit: Pyramisa Suites Hotel | 🗓 12 Mar 2026
🗺 Location: https://maps.app.goo.gl/aU81FrqETdqqM7Mh8

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #GrandSummit #NextAcademy`;

        for (const phone of phoneNumbers) {
            console.log(`   📤 Sending poster to ${phone}...`);
            const posterResult = await sendMedia(phone, imageUrl, posterCaption);
            if (posterResult.success) {
                console.log(`   ✅ Poster sent!`);
                successCount++;
            } else {
                console.log(`   ❌ Poster failed:`, JSON.stringify(posterResult.data));
                failCount++;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        // --- 2) Send QR TICKET ---
        const qrCode = BOOKING_TICKETS[id];
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`;
        
        const ticketCaption = `🎟️ *Your Ticket - Grand Summit*

🌟 *Grand Summit*
📍 Pyramisa Suites Hotel
🗓 12 Mar 2026
🗺 Location: https://maps.app.goo.gl/aU81FrqETdqqM7Mh8

Show this QR code at the entrance!`;

        for (const phone of phoneNumbers) {
            console.log(`   📤 Sending QR ticket to ${phone}...`);
            const ticketResult = await sendMedia(phone, qrImageUrl, ticketCaption);
            if (ticketResult.success) {
                console.log(`   ✅ QR ticket sent!`);
                successCount++;
            } else {
                console.log(`   ❌ QR ticket failed:`, JSON.stringify(ticketResult.data));
                failCount++;
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    console.log(`\n📊 Done! ✅ ${successCount} messages sent, ❌ ${failCount} failed\n`);
}

main();
