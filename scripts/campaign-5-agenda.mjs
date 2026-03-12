// Campaign 5: AGENDA — Sent at 9:00 PM (when doors open)
// الأجندة الكاملة لليلة
// Usage: node scripts/campaign-5-agenda.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis1";
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?payment_status=eq.paid&select=customer_name,phone`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const bookings = await res.json();

    console.log(`\n📋 Campaign 5: AGENDA — ${bookings.length} bookings\n`);

    let success = 0, fail = 0;

    for (const b of bookings) {
        const phones = extractPhones(b.phone);

        const message = `📋 *أجندة الليلة — Ramadan Majlis 2026*

يا ${b.customer_name} دي أجندة الليلة 🔥

⏰ *9:00 PM* — Executive Coffee & Welcoming ☕
⏰ *10:00 PM* — The Compass: Strategic Vision & Purpose-Driven Leadership 🧭
⏰ *10:20 PM* — From Manual to Magical: AI in Operation 🤖
⏰ *11:00 PM* — The Resilience: Financial Health & Mental Well-being 💪
⏰ *11:20 PM* — The Legacy: Scaling Through Strategic Partnerships 🤝
⏰ *12:30 AM* — Mega Panel 🎤
⏰ *1:30 AM* — Closing & Suhoor 🍽

ليلة مليانة insights وفرص networking 🚀

📍 *Pyramisa Suites Hotel*
🗺 https://maps.app.goo.gl/aU81FrqETdqqM7Mh8

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
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
