// Campaign 2: CREDENTIALS — Send login details (user + password)
// بيانات الدخول — موزعة على 4 instances
// Usage: node scripts/campaign-2-credentials.mjs

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const INSTANCES = ["RamadanMajlis1", "Basmla1", "gehad1", "dr2"];

const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

const APP_URL = "https://app.nextacademyedu.com";

// ⛔ استثناء — متبعتش لده
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
    // Fetch event_users (non-speakers only)
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/event_users?password=neq.majlis2026&select=name,phone,password`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const users = await usersRes.json();

    // Fetch bookings to get real phone numbers
    const bookingsRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?payment_status=eq.paid&select=customer_name,phone`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    const bookings = await bookingsRes.json();

    // Map: normalized phone → booking real phone
    const userPhoneToBookingPhone = {};
    for (const b of bookings) {
        const phones = extractPhones(b.phone);
        for (const p of phones) {
            userPhoneToBookingPhone[p] = b.phone;
        }
        // Also map by name
        userPhoneToBookingPhone[b.customer_name.trim().toLowerCase()] = b.phone;
    }

    // Build send list: match event_user → booking phone
    const sendList = [];
    for (const u of users) {
        const loginId = u.phone; // what they login with
        const normalizedLogin = formatPhone(loginId);

        // Skip excluded phones
        if (SKIP_PHONES.has(normalizedLogin) || SKIP_PHONES.has(loginId)) continue;

        // Find real phone from bookings (match by phone or name)
        let realPhone = userPhoneToBookingPhone[normalizedLogin]
            || userPhoneToBookingPhone[u.name.trim().toLowerCase()];

        if (!realPhone) continue; // no matching booking

        sendList.push({
            name: u.name,
            loginId,
            password: u.password,
            realPhones: extractPhones(realPhone).filter(p => !SKIP_PHONES.has(p)),
        });
    }

    console.log(`\n🔑 Campaign 2: CREDENTIALS — ${sendList.length} users across ${INSTANCES.length} instances\n`);

    let success = 0, fail = 0;

    for (let i = 0; i < sendList.length; i++) {
        const u = sendList[i];
        const instance = INSTANCES[i % INSTANCES.length];

        const message = `أهلاً ${u.name} 👋

بيانات الدخول بتاعتك لأبليكيشن *Ramadan Majlis 2026* 🌙

📲 رابط الأبليكيشن: ${APP_URL}

👤 *Username:* ${u.loginId}
🔑 *Password:* ${u.password}

ادخل دلوقتي واتعرف على الأبليكيشن!
الأبليكيشن هيكون معاك طول الليلة — tasks، networking، leaderboard، و live Q&A 🔥

نشوفك النهاردة إن شاء الله! 🤩`;

        for (const phone of u.realPhones) {
            const result = await sendText(instance, phone, message);
            if (result.success) {
                console.log(`✅ [${instance}] ${u.name} → ${phone} (login: ${u.loginId})`);
                success++;
            } else {
                console.log(`❌ [${instance}] ${u.name} → ${phone}`, JSON.stringify(result.data).slice(0, 100));
                fail++;
            }
            // Random delay 5-12 seconds
            await new Promise(r => setTimeout(r, (Math.random() * 7 + 5) * 1000));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
