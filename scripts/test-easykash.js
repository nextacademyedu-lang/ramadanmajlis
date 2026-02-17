const https = require('https');

// Load from env or use placeholder
const EASYKASH_API_TOKEN = process.env.EASYKASH_API_TOKEN || "69ucvmpvrk4gsgqk";

async function request(url, method, body) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'authorization': `${EASYKASH_API_TOKEN}` // Header format based on docs
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        });

        req.on('error', (err) => reject(err));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testEasyKash() {
    console.log("🚀 Testing EasyKash Integration...");

    if (!EASYKASH_API_TOKEN || EASYKASH_API_TOKEN === "PASTE_YOUR_TOKEN_HERE") {
        console.error("❌ ERROR: Please set EASYKASH_TOKEN in your environment or paste it in the script.");
        return;
    }

    try {
        // 1. Initiate Payment
        console.log("\n1️⃣  Initiating Payment...");
        const payload = {
            amount: 100, // 100 EGP
            currency: "EGP",
            paymentOptions: [2, 3, 4, 5, 6], // Common options
            cashExpiry: 24,
            name: "Test User",
            email: "test@example.com",
            mobile: "01000000000",
            redirectUrl: "http://localhost:3000/payment-success",
            customerReference: `TEST-${Date.now()}`
        };

        const response = await request('https://back.easykash.net/api/directpayv1/pay', 'POST', payload);
        console.log("Response:", response);

        if (response.redirectUrl) {
            console.log(`✅ Success! Redirect URL: ${response.redirectUrl}`);
        } else {
            console.error("❌ Failed to get redirect URL", response);
        }

    } catch (error) {
        console.error("❌ Unexpected Error:", error);
    }
}

testEasyKash();
