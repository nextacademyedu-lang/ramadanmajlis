const urls = [
    "https://www.ramadanmajlis.nextacademyedu.com/api/og/social-share?name=Test&title=Developer&company=NEXT&night=Test+Night&location=Cairo",
    "https://www.ramadanmajlis.nextacademyedu.com/api/og/social-share?name=Test&title=Developer&company=NEXT&night=Test+Night&location=Cairo&photo=https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/event-uploads/profile-photos/0.017150378992593862.jpg"
];

async function checkUrl(url, label) {
    console.log(`\n--- Testing ${label} ---`);
    console.log(`URL: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (!res.ok) {
            const text = await res.text();
            console.log(`Error Body: ${text.substring(0, 500)}`); // Print first 500 chars
        } else {
            console.log("✅ Success! Image generated.");
            const blob = await res.blob();
            console.log(`Image Size: ${blob.size} bytes`);
        }
    } catch (e) {
        console.error(`❌ Request Failed: ${e.message}`);
    }
}

async function run() {
    await checkUrl(urls[0], "Test 1: Without Photo");
    await checkUrl(urls[1], "Test 2: With Photo");
}

run();
