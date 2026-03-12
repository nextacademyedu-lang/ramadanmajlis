// Campaign 2: CREDENTIALS — Send login details (Send TOMORROW morning)
// بيانات الدخول — الـ username والـ password
// Usage: node scripts/campaign-2-credentials.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis1";
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

const APP_URL = "https://app.nextacademyedu.com";

function formatPhone(phone) {
    let c = phone.replace(/\D/g, '');
    if (c.startsWith('0')) c = '20' + c.substring(1);
    if (!c.startsWith('20') && c.length === 10) c = '20' + c;
    return c;
}

function extractPhones(phone) {
    return phone.split(/[\/,]/).map(p => formatPhone(p.trim())).filter(p => p.length >= 10);
}

async function sendText(phone, text) {
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(EVOLUTION_INSTANCE_NAME)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
        body: JSON.stringify({ number: phone, text })
    });
    return { success: res.ok, data: await res.json() };
}

async function main() {
    // Fetch ALL event_users (regular + speakers)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/event_users?select=name,phone,password`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const users = await res.json();

    // Also fetch bookings to get the real phone numbers for messaging
    const bookingsRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?payment_status=eq.paid&select=customer_name,phone`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const bookings = await bookingsRes.json();

    // Map booking name → real phone
    const bookingPhoneMap = {};
    for (const b of bookings) {
        bookingPhoneMap[b.customer_name.trim()] = b.phone;
    }

    console.log(`\n🔑 Campaign 2: CREDENTIALS — ${users.length} users\n`);

    let success = 0, fail = 0, skipped = 0;

    for (const u of users) {
        // Get the real phone number for messaging
        const isSpeaker = u.password === 'majlis2026';
        const realPhone = bookingPhoneMap[u.name.trim()];

        // Speakers don't have bookings, skip them (they'll be sent manually or via a separate list)
        if (isSpeaker) {
            console.log(`⏭️  ${u.name} (speaker — no booking phone, skip)`);
            skipped++;
            continue;
        }

        if (!realPhone) {
            console.log(`⏭️  ${u.name} (no matching booking phone, skip)`);
            skipped++;
            continue;
        }

        const phones = extractPhones(realPhone);
        const loginId = u.phone; // This is what they login with (phone number or username)

        const message = `أهلاً ${u.name} 👋

بيانات الدخول بتاعتك لأبليكيشن *Ramadan Majlis 2026* 🌙

📲 رابط الأبليكيشن: ${APP_URL}

👤 *Username:* ${loginId}
🔑 *Password:* ${u.password}

ادخل دلوقتي وجهّز نفسك! 🎯
الأبليكيشن هيكون معاك طول الليلة — tasks، networking، leaderboard، و live Q&A 🔥

جاهز لليلة استثنائية؟ 🤩`;

        for (const phone of phones) {
            const result = await sendText(phone, message);
            if (result.success) {
                console.log(`✅ ${u.name} → ${phone} (login: ${loginId})`);
                success++;
            } else {
                console.log(`❌ ${u.name} → ${phone}`, JSON.stringify(result.data));
                fail++;
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed, ⏭️ ${skipped} skipped\n`);
}

main();
