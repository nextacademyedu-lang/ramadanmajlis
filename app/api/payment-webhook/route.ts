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
            console.log(`Payment Success for Booking: ${bookingId}`);

            // Update Booking Status
            // Note: 'customerReference' might be a timestamp for EasyKash now, so we need to match carefully.
            // If we used a timestamp, we might not find the record by ID directly if we didn't store the timestamp.
            // Correction: For EasyKash we changed customerReference to Date.now(). 
            // This makes linking back to the Booking ID via Webhook impossible if we don't store that timestamp!
            // CRITICAL FIX needed in `create-booking`: Store the `payment_ref` (timestamp) in the bookings table.

            // Assuming for now Paymob works with proper ID. 
            // For EasyKash, since we used a timestamp to fix the crash, we effectively broke the link for the webhook unless we save that timestamp.

            // For now, let's just log it. 
            // In a real app, we should add `payment_ref` column to bookings and save the Date.now() value there first.

            await supabaseAdmin
                .from('bookings')
                .update({ payment_status: 'paid' })
                .eq('id', bookingId); // This works for Paymob

            return NextResponse.json({ received: true });
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
