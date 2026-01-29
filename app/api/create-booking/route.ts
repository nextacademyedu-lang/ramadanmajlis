import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, amount, customer, provider } = body;

        // --- PAYMOB INTEGRATION ---
        if (provider.startsWith('paymob')) {
            // 1. Authenticate
            const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
            });
            const authData = await authResponse.json();
            const token = authData.token;

            // 2. Register Order
            const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: token,
                    delivery_needed: "false",
                    amount_cents: amount * 100,
                    currency: "EGP",
                    items: [],
                    merchant_order_id: bookingId
                })
            });
            const orderData = await orderResponse.json();
            const orderId = orderData.id;

            // 3. Request Payment Key & Determine Integration ID
            let integrationId = process.env.PAYMOB_INTEGRATION_ID_CARD; // Default to Card
            if (provider === 'paymob_wallet') {
                integrationId = process.env.PAYMOB_INTEGRATION_ID_WALLET;
            }

            const keyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auth_token: token,
                    amount_cents: amount * 100,
                    expiration: 3600,
                    order_id: orderId,
                    billing_data: {
                        apartment: "1",
                        email: customer.email,
                        floor: "1",
                        first_name: customer.first_name,
                        street: "Cairo St",
                        building: "1",
                        phone_number: customer.phone,
                        shipping_method: "NA",
                        postal_code: "12345",
                        city: "Cairo",
                        country: "EG",
                        last_name: customer.last_name,
                        state: "Cairo"
                    },
                    currency: "EGP",
                    integration_id: integrationId
                })
            });
            const keyData = await keyResponse.json();

            if (!keyData.token) throw new Error("Failed to get Paymob token: " + JSON.stringify(keyData));

            // 4. Handle Based on Type
            // A) WALLET: Must confirm payment server-side
            if (provider === 'paymob_wallet') {
                const payResponse = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: {
                            identifier: customer.phone, // Must be the wallet number
                            subtype: "WALLET"
                        },
                        payment_token: keyData.token
                    })
                });
                const payData = await payResponse.json();

                // Expecting { redirect_url: "..." } or similar
                if (payData.redirect_url) {
                    return NextResponse.json({ paymentUrl: payData.redirect_url });
                } else if (payData.iframe_url) {
                    return NextResponse.json({ paymentUrl: payData.iframe_url });
                } else {
                    // Fallback or error
                    console.error("Wallet Pay Error:", payData);
                    throw new Error("Wallet payment failed: " + (payData.detail || "Unknown error"));
                }
            }

            // B) CARD: Use Iframe
            const iframeId = process.env.PAYMOB_IFRAME_ID;
            const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`;
            return NextResponse.json({ paymentUrl });
        }

        // --- EASYKASH INTEGRATION ---
        else if (provider === 'easykash') {
            const payload = {
                amount: amount,
                currency: "EGP",
                name: customer.first_name + ' ' + customer.last_name,
                email: customer.email,
                mobile: customer.phone,
                redirectUrl: `${request.headers.get('origin')}/?status=success`,
                // EasyKash crashes if this is a UUID string. It expects a Number.
                // Using timestamp as a temporary unique number.
                customerReference: Date.now()
            };

            const res = await fetch("https://back.easykash.net/api/directpayv1/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": (process.env.EASYKASH_API_KEY || '').trim() // Trim to avoid spaces
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            // EasyKash might return just { redirectUrl: ... } without status 'success'
            if (data.url || data.redirectUrl) {
                return NextResponse.json({ paymentUrl: data.url || data.redirectUrl });
            } else {
                console.error("EasyKash Error:", data);
                return NextResponse.json({ error: JSON.stringify(data) }, { status: 400 });
            }
        }

        else {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
