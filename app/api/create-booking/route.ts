import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, amount, customer, provider } = body;

        // --- PAYMOB INTEGRATION ---
        // --- EASYKASH INTEGRATION ---
        if (provider.startsWith('paymob') || provider === 'easykash' || provider === 'card') {
            console.log('[EasyKash] Step 1: Initiating Payment...');

            // EasyKash API Token
            const easyKashToken = process.env.EASYKASH_API_TOKEN;
            if (!easyKashToken) {
                console.error('[EasyKash] Error: Missing API Token');
                throw new Error("Payment service configuration error");
            }

            const amountCents = Math.round(amount * 100);
            const redirectUrl = `https://ramadan-event.vercel.app/payment-success?bookingId=${bookingId}`; // Should match your domain
            // For local dev, use localhost if needed, but preferably use env var for base URL
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const finalRedirectUrl = `${baseUrl}/payment-success?bookingId=${bookingId}`;

            const payload = {
                amount: amount, // EasyKash takes amount in main unit (EGP), unlike Paymob (cents) ? Verify docs. 
                // Script says: "amount": 100. Docs say "amount (number)". Typically this means main unit. 
                // Paymob used cents. I will use main amount as per my script.
                currency: "EGP",
                paymentOptions: [2, 3, 4, 5, 6], // All options
                cashExpiry: 24,
                name: `${customer.first_name} ${customer.last_name}`,
                email: customer.email,
                mobile: customer.phone,
                redirectUrl: finalRedirectUrl,
                customerReference: bookingId
            };

            console.log('[EasyKash] Sending Payload:', JSON.stringify(payload));

            const response = await fetch('https://back.easykash.net/api/directpayv1/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': easyKashToken
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('[EasyKash] Response:', data);

            if (data.redirectUrl) {
                return NextResponse.json({ paymentUrl: data.redirectUrl });
            } else {
                console.error('[EasyKash] Payment Initiation Failed:', data);
                throw new Error(`Payment Failed: ${JSON.stringify(data)}`);
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
