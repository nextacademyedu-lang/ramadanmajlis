import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendTicketEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        // 1. Fetch the booking
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            console.error('❌ Booking not found:', fetchError);
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Verify this is a free booking (total_amount = 0)
        if (booking.total_amount > 0) {
            // Only parent bookings are checked, but group members also have 0
            return NextResponse.json({ error: 'Not a free booking' }, { status: 400 });
        }

        // 3. Confirm the booking using shared service
        // We verified it's free above, so we can proceed to confirm.
        const { confirmBooking } = await import('@/lib/booking-service');

        console.log('--- START FREE CONFIRM LOGS ---');
        console.log('EVOLUTION URL:', process.env.EVOLUTION_API_URL);
        console.log('EVOLUTION KEY EXISTS:', !!process.env.EVOLUTION_API_KEY);
        console.log('-------------------------------');

        const result = await confirmBooking(bookingId);

        console.log('CONFIRM RESULT:', JSON.stringify(result, null, 2));

        if (result.status === 'already_processed') {
            return NextResponse.json({ success: true, message: 'Already confirmed' });
        }

        return NextResponse.json({
            success: true,
            message: 'Booking confirmed and notifications sent',
            notifications: (result as any).notifications?.map((r: any) => r.status)
        });

    } catch (error: any) {
        console.error('❌ Free Booking Confirmation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
