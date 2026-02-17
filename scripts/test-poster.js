// Test script to send poster via WhatsApp
const EVOLUTION_API_URL = "https://evolution-api-production-da45.up.railway.app";
const EVOLUTION_API_KEY = "108200@@aA";
const EVOLUTION_INSTANCE_NAME = "RamadanEvent confirm";

const name = "Muhammed Mekky";
const title = "CEO";
const company = "Next academy";
const phone = "201098620547";
const night = "The Compass (Vision, Values & Brand)";
const location = "Tolip Hotel – New Cairo";

const baseUrl = "https://ramadanmajlis.nextacademyedu.com";
const params = new URLSearchParams({
    name,
    title,
    company,
    night,
    location,
    photo: ""
});

const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

const caption = `Hello ${name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

Three transformative Thursday nights with 12 world-class experts, strategic networking over premium Suhoor, and hands-on learning circles.

📍 Night 1: Tolip Hotel, New Cairo | 🗓 Feb 28 – The Compass
📍 Night 2: Hyatt Regency, 6th October | 🗓 Mar 5 – The Resilience
📍 Night 3: Pyramisa Hotel, Dokki | 🗓 Mar 12 – The Legacy

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #TheMajlis #NextAcademy`;

async function sendPoster() {
    console.log("📨 Sending poster to:", name);
    console.log("📱 Phone:", phone);
    console.log("🖼️ Image URL:", imageUrl);
    console.log("");

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${encodeURIComponent(EVOLUTION_INSTANCE_NAME)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: phone,
                mediatype: 'image',
                media: imageUrl,
                caption: caption
            })
        });

        const data = await response.json();
        console.log("✅ Response status:", response.status);
        console.log("📋 Response data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

sendPoster();
