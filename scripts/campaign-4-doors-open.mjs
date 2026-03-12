// Campaign 4: DOORS OPEN — Original message + QR ticket
// 4 instances — sends QR image with message as caption
// Usage: node scripts/campaign-4-doors-open.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const INSTANCES = ["RamadanMajlis1", "Basmla1", "gehad1", "dr2"];
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

const APP_URL = "https://app.nextacademyedu.com";
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

async function sendMedia(instance, phone, mediaUrl, caption) {
    try {
        const res = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${encodeURIComponent(instance)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY },
            body: JSON.stringify({ number: phone, mediatype: 'image', media: mediaUrl, caption }),
            signal: AbortSignal.timeout(20000)
        });
        return { success: res.ok };
    } catch (e) { return { success: false, err: e.message }; }
}

async function main() {
    // Fetch bookings with tickets
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bookings?payment_status=eq.paid&select=customer_name,phone,tickets(qr_code)`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const bookings = await res.json();

    const sendList = [];
    for (const b of bookings) {
        const qr = b.tickets?.[0]?.qr_code;
        if (!qr) continue;
        const phones = extractPhones(b.phone).filter(p => !SKIP_PHONES.has(p));
        if (phones.length === 0) continue;
        sendList.push({ name: b.customer_name, phones, qr });
    }

    console.log(`\n🚪 Campaign 4: DOORS OPEN + QR — ${sendList.length} bookings across ${INSTANCES.length} instances\n`);

    let success = 0, fail = 0, msgIdx = 0;

    for (const b of sendList) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(b.qr)}`;

        const caption = `يلا ${b.name}! 🚀🔥

*الأبواب فتحت!* 🚪

📍 *Pyramisa Suites Hotel*
🗺 https://maps.app.goo.gl/aU81FrqETdqqM7Mh8

⬆️ ده الـ QR Ticket بتاعك — وريه عند الباب!

📲 افتح الأبليكيشن: ${APP_URL}

مستنينك! 🤩`;

        for (const phone of b.phones) {
            const instance = INSTANCES[msgIdx % INSTANCES.length];
            msgIdx++;
            const result = await sendMedia(instance, phone, qrUrl, caption);
            console.log((result.success ? '✅' : '❌') + ` [${instance}] ${b.name} → ${phone}` + (result.err ? ' ' + result.err : ''));
            if (result.success) success++; else fail++;
            // Delay 8-15 seconds
            await new Promise(r => setTimeout(r, (Math.random() * 7 + 8) * 1000));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
