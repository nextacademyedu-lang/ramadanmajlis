import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase Admin Client (needed to update bookings secureley)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Fallback for now, essentially needs Service Key for full update rights if RLS restricts
);

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { type, obj, success, paid, transaction } = data; // Payload structure varies by provider

        let bookingId = '';
        let isSuccess = false;
        let provider = '';

        // --- PAYMOB WEBHOOK LOGIC ---
        if (obj && obj.order) {
            provider = 'paymob';
            bookingId = obj.merchant_order_id; // We sent bookingId here
            isSuccess = obj.success === true;
        }

        // --- EASYKASH WEBHOOK LOGIC (Example structure) ---
        // (Adjust based on actual EasyKash validation docs)
        else if (transaction && transaction.customerReference) {
            provider = 'easykash';
            bookingId = transaction.customerReference;
            isSuccess = transaction.status === 'SUCCESS' || data.status === 'success';
        }

        if (bookingId && isSuccess) {
            console.log(`✅ Payment Success for Booking: ${bookingId}, Provider: ${provider}`);

            // Update Booking Status
            const { error: updateError } = await supabaseAdmin
                .from('bookings')
                .update({
                    payment_status: 'paid',
                    status: 'confirmed',
                    paid_at: new Date().toISOString()
                })
                .eq('id', bookingId);

            if (updateError) {
                console.error('❌ Failed to update booking:', updateError);
            } else {
                console.log(`✅ Booking ${bookingId} marked as PAID and CONFIRMED`);
            }

            return NextResponse.json({ received: true, status: 'success' });
        }

        return NextResponse.json({ received: true, ignored: true });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    return NextResponse.json({ message: "Webhook endpoint active" });
}
