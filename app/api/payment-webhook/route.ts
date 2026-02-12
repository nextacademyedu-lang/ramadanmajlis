import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendTicketEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

// Initialize Supabase Admin Client (needed to update bookings secureley)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Fallback for now, essentially needs Service Key for full update rights if RLS restricts
);

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('🔔 Webhook Received:', JSON.stringify(data, null, 2));

        const { type, obj, success, paid, transaction } = data; // Payload structure varies by provider

        let bookingId = '';
        let isSuccess = false;
        let provider = '';
        let debugUpdateError: any = null;
        let debugUpdateData: any = null;
        let debugTicketError: any = null;

        // --- PAYMOB WEBHOOK LOGIC ---
        if (obj) {
            provider = 'paymob';
            // Check both locations for merchant_order_id to be safe
            bookingId = obj.merchant_order_id || (obj.order && obj.order.merchant_order_id);
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

            // Verify if booking exists and is already paid (Idempotency)
            const { data: existingBooking } = await supabaseAdmin
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (existingBooking && existingBooking.status === 'confirmed') {
                console.log(`⚠️ Booking ${bookingId} already confirmed, skipping webhook processing.`);
                return NextResponse.json({ 
                    received: true, 
                    status: 'already_processed',
                    message: 'Booking already confirmed' 
                });
            }

            // Use Shared Logic
            const { confirmBooking } = await import('@/lib/booking-service');
            const result = await confirmBooking(bookingId);

            return NextResponse.json({ 
                received: true, 
                status: 'success',
                debug_notifications: result.notifications
            });
        }

        return NextResponse.json({ 
            received: true, 
            ignored: true,
            debug_reason: "Payload validation failed or Update Failed",
            debug_info: {
                provider,
                bookingId,
                isSuccess,
                hasObj: !!obj,
                objSuccess: obj?.success,
                objOrderId: obj?.merchant_order_id,
                objNestedOrder: !!obj?.order,
                updateError: debugUpdateError,
                updateData: debugUpdateData,
                ticketError: debugTicketError,
                usingServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    return NextResponse.json({ message: "Webhook endpoint active" });
}
