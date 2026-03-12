// Campaign 1: TEASER — Download the app (Send NOW)
// تشويقية — نزّل الأبليكيشن
// Usage: node scripts/campaign-1-teaser.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis1";
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

// ⚠️ SET YOUR EVENT-CONNECT APP URL HERE
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
    // Fetch all confirmed bookings
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?payment_status=eq.paid&select=customer_name,phone`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const bookings = await res.json();

    console.log(`\n🚀 Campaign 1: TEASER — ${bookings.length} bookings\n`);

    let success = 0, fail = 0;

    for (const b of bookings) {
        const phones = extractPhones(b.phone);
        const message = `أهلاً ${b.customer_name} 👋

بكرة ليلة Grand Summit 🌙🔥

جهّزنالك حاجة مميزة جداً في الإيفنت جديدة كلياً هتنقل تجربتك لمستوى تاني خالص... 👀

عاوزك تنزّل الأبليكيشن من دلوقتي عشان تكون جاهز:
📲 ${APP_URL}

*مش هنقولك أكتر من كده…*
بس خلّيك جاهز! 🎯

#RamadanMajlis2026`;

        for (const phone of phones) {
            const result = await sendText(phone, message);
            if (result.success) {
                console.log(`✅ ${b.customer_name} → ${phone}`);
                success++;
            } else {
                console.log(`❌ ${b.customer_name} → ${phone}`, JSON.stringify(result.data));
                fail++;
            }
            await new Promise(r => setTimeout(r, (Math.random() * 7 + 3) * 1000)); // 3-10s random delay
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
