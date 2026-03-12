// Campaign 1 RETRY — Only the failed bookings
// ابعت بس للناس اللي مابعتش ليهم
// Usage: node scripts/campaign-1-retry.mjs
// ⚠️ شغّل بعد ما الحظر يتشال من الواتس

const EVOLUTION_API_URL = "http://evo-sgwcco4kw80sckwg4c08sgk4.72.62.50.238.sslip.io";
const EVOLUTION_API_KEY = "xLksPzWYBxfxOXW29pY8LytHMAfxPaGg";
const EVOLUTION_INSTANCE_NAME = "RamadanMajlis1";
const SUPABASE_URL = "https://dqduxsimueexppfiinpw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZHV4c2ltdWVleHBwZmlpbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk2OTEzOSwiZXhwIjoyMDg4NTQ1MTM5fQ.MpTDqmopBMvJXXbICU_FsdqAP92dcwhRK6liRzEJMyw";

const APP_URL = "https://app.nextacademyedu.com";

// ❌ الأرقام اللي فشلت (79 booking)
const ALREADY_SENT_PHONES = new Set([
    "201024206756", // Sherihan Khairy
    "201019825113", // Mohamed Ragab Madkour
    "201098386243", // Hazem El Gebeily
    "201033117749", // Abdelrahman Rowezak
    "201017720274", // Monzer ahmed mohamed
    "201023107133", // Mariam Hesham Mostafa
    "201000131349", // Youssef Elnahas
    "201001102102", // Ahmed Elmahdi
    "201062088018", // Mohamed Emad Ibrahim
    "201158818187", // Mohamed Ibrahim Fadl
    "201011424218", // Adel Sedik
    "201114905434", // Adel Sedik (2nd)
    "201278899900", // Abdelmenaam Hanfy
    "201120051055", // Omar Moustafa
    "201120551011", // Ahmed Hashem
    "201025285300", // Mohamed Ghoniem
    "201273003503", // Marwan ElSagher
    "201015050558", // Mena Ragaee
    "966546697077", // Amro Omer
    "201003338070", // tamer Ali
    "201063666040", // Islam Ashour
    "201025429901", // Ahmed Elkholy
    "201115757773", // Marwan Hegab
    "201208840802", // Haitham Hendy
    "201012424442", // Hasan Eid
    "201096340506", // Mohamed Mahmoud
    "201020661893", // Ahmed Ayad
    "201005048820", // Bassem Mounir
    "201025010101", // Eslam Abdelgawad
    "201060101803", // Eslam Bassam
    "201093120601", // Mohamed Magdy
    "201001082580", // Ahmed Sayed
    "201154400039", // youssef hesham
    "201019903776", // Abanoub Samy
    "201003643939", // Ahmed Ayad (2nd)
]);

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

    // Filter: only bookings NOT already sent
    const pending = bookings.filter(b => {
        const phones = extractPhones(b.phone);
        return !phones.some(p => ALREADY_SENT_PHONES.has(p));
    });

    console.log(`\n🔄 Campaign 1 RETRY — ${pending.length} remaining (${bookings.length - pending.length} already sent)\n`);

    let success = 0, fail = 0;

    for (const b of pending) {
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
            // Longer delay: 5-15 seconds to avoid ban
            await new Promise(r => setTimeout(r, (Math.random() * 10 + 5) * 1000));
        }
    }

    console.log(`\n📊 Done! ✅ ${success} sent, ❌ ${fail} failed\n`);
}

main();
