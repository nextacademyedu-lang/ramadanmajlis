// Campaign 3: PRE-MAGHREB REMINDER — Sent at 5:00 PM
// تذكير قبل المغرب — جهّز نفسك!
// موزعة على 4 instances
// Usage: node scripts/campaign-3-pre-maghreb.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const INSTANCES = ["RamadanMajlis1", "Basmla1", "gehad1", "dr2"];
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

const SKIP_PHONES = new Set(["201098620547", "01098620547"]);

function formatPhone(phone) {
    let c = phone.replace(/\D/g, '');
    if (c.startsWith('0')) c = '20' + c.substring(1);
    if (!c.startsWith('20') && c.length === 10) c = '20' + c;
    return c;
}

function extractPhones(phone) {
    return phone.split(/[\/,]/).map(p => formatPhone(p.trim())).filter(p => p.length >= 10);
}

async function sendText(instance, phone, text) {
    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(instance)}`, {
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

    console.log(`\n🌅 Campaign 3: PRE-MAGHREB — ${bookings.length} bookings across ${INSTANCES.length} instances\n`);

    let success = 0, fail = 0, msgIdx = 0;

    for (const b of bookings) {
        const phones = extractPhones(b.phone).filter(p => !SKIP_PHONES.has(p));
        if (phones.length === 0) continue;

        const message = `السلام عليكم ${b.customer_name} 🌙
صوماً مقبولاً وافطارً شهياً   
النهاردة الليلة الكبيرة! 🔥

*Ramadan Majlis 2026 — Grand Summit*

📍 *Pyramisa Suites Hotel*
🗺 https://maps.app.goo.gl/aU81FrqETdqqM7Mh8
⏰ *الأبواب بتفتح: 9:00 مساءً*

✅ جهّز الـ QR Ticket بتاعك
✅ ادخل الأبليكيشن واتأكد إنك جاهز
✅ اشحن موبايلك 🔋

نشوفك النهاردة إن شاء الله! 🤩`;

        for (const phone of phones) {
            const instance = INSTANCES[msgIdx % INSTANCES.length];
            msgIdx++;
            const result = await sendText(instance, phone, message);
            if (result.success) {
                console.log(`✅ [${instance}] ${b.customer_name} → ${phone}`);
                success++;
            } else {
                console.log(`❌ [${instance}] ${b.customer_name} → ${phone}`, JSON.stringify(result.data).slice(0, 100));
                fail++;
            }
            // Delay 8-15 seconds
            await new Promise(r => setTimeout(r, (Math.random() * 7 + 8) * 1000));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
