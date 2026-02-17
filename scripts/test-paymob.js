const https = require('https');

// HARDCODED VALUES FROM USER - NEW API KEY
const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFeU1UZzJOQ3dpYm1GdFpTSTZJakUzTnpBNU5EQTRPVGN1TlRjMU5UVXpJbjAucnd1eE5BbERrR0tpc0tCdkcyRXdzekx5N1NIVzh4T19PTmlGQjRKV2pTNUt6c3hmS2RfelRpWVJYaFRaT1NrY2kxdURMWGdhR1Jjc0tIV1lkSnp4cWc=";

const INTEGRATION_IDS = [
    { id: 5485315, name: "Online Card" },
    { id: 5485316, name: "Tap on Phone" },
    { id: 5485317, name: "Wallet" },
    { id: 995832, name: "Possible Iframe?" } // Check if this is accidentally treated as integration
];

function request(url, method, formattedBody) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': formattedBody.length
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
        req.write(formattedBody);
        req.end();
    });
}

async function testAllIntegrations() {
    console.log("🚀 Starting Paymob Comprehensive Diagnostic...");

    try {
        // 1. Auth & Merchant Info
        console.log("\n1️⃣  Authenticating...");
        const authData = await request('https://accept.paymob.com/api/auth/tokens', 'POST', JSON.stringify({ api_key: API_KEY }));

        if (!authData.token) {
            console.error("❌ Auth Failed:", authData);
            return;
        }
        const token = authData.token;
        const profile = authData.profile;
        console.log("✅ Auth Success!");
        if (profile) {
            console.log(`👤 User: ${profile.user?.first_name} ${profile.user?.last_name} (${profile.user?.email})`);
            console.log(`🏢 Merchant ID: ${profile.merchant_id}`);
            if (profile.merchant) {
                console.log(`🏢 Merchant Name: ${profile.merchant.company_name} (Active: ${profile.merchant.is_active})`);
            } else {
                console.log("⚠️ Profile found but 'merchant' object is missing.");
            }
        } else {
             console.log("⚠️ Could not retrieve profile info (Check API Key type). Full Auth Response:", JSON.stringify(authData));
        }

        // 2. Register Order
        console.log("\n2️⃣  Registering Test Order...");
        const orderData = await request('https://accept.paymob.com/api/ecommerce/orders', 'POST', JSON.stringify({
            auth_token: token,
            delivery_needed: "false",
            amount_cents: "100",
            currency: "EGP",
            items: [],
        }));

        if (!orderData.id) {
            console.error("❌ Order Failed:", orderData);
            return;
        }
        const orderId = orderData.id;
        console.log(`✅ Order Created: ${orderId}`);

        // 3. Test Integrations Loop
        console.log("\n3️⃣  Testing Integration IDs...");
        
        for (const integration of INTEGRATION_IDS) {
            process.stdout.write(`   👉 Testing ID: ${integration.id} (${integration.name})... `);
            
            const keyData = await request('https://accept.paymob.com/api/acceptance/payment_keys', 'POST', JSON.stringify({
                auth_token: token,
                amount_cents: "100",
                expiration: 3600,
                order_id: orderId,
                billing_data: {
                    apartment: "1", email: "test@example.com", floor: "1", first_name: "Test", street: "Street",
                    building: "1", phone_number: "+201000000000", shipping_method: "NA", postal_code: "12345", 
                    city: "Cairo", country: "EG", last_name: "User", state: "Cairo"
                },
                currency: "EGP",
                integration_id: integration.id
            }));

            if (keyData.token) {
                console.log("✅ SUCCESS!");
            } else {
                console.log("❌ FAILED!");
                // console.log("      Reason:", JSON.stringify(keyData));
            }
        }

    } catch (error) {
        console.error("❌ Unexpected Error:", error);
    }
}

testAllIntegrations();
