import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendTicketEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
            return NextResponse.json({ error: 'Not a free booking' }, { status: 400 });
        }

        // 3. Check if already confirmed (idempotency)
        if (booking.status === 'confirmed') {
            console.log(`⚠️ Booking ${bookingId} already confirmed`);
            return NextResponse.json({ success: true, message: 'Already confirmed' });
        }

        // 4. Generate QR code and update booking
        const qrCode = crypto.randomUUID();
        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
                status: 'confirmed',
                paid_at: new Date().toISOString(),
                qr_code: qrCode
            })
            .eq('id', bookingId)
            .select('*')
            .single();

        if (updateError) {
            console.error('❌ Failed to update booking:', updateError);
            return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 });
        }

        console.log(`✅ Free Booking ${bookingId} confirmed!`);

        // 5. Create Tickets for each night
        const ticketsToCreate = [];
        const nights = Array.isArray(updatedBooking.selected_nights)
            ? updatedBooking.selected_nights
            : JSON.parse(updatedBooking.selected_nights || '[]');

        for (const night of nights) {
            ticketsToCreate.push({
                booking_id: bookingId,
                night_date: night,
                qr_code: crypto.randomUUID(),
                status: 'pending'
            });
        }

        // Insert tickets into DB
        const { data: createdTickets, error: ticketError } = await supabaseAdmin
            .from('tickets')
            .insert(ticketsToCreate)
            .select();

        let finalTickets = createdTickets;

        // Handle Duplicate Key Error (Idempotency)
        if (ticketError && ticketError.code === '23505') {
            console.log('⚠️ Tickets already exist, fetching existing tickets...');
            const { data: existingTickets } = await supabaseAdmin
                .from('tickets')
                .select('*')
                .eq('booking_id', bookingId);
            finalTickets = existingTickets;
        } else if (ticketError) {
            console.error('❌ Failed to create tickets:', ticketError);
        }

        // 6. Send Notifications
        if (finalTickets && finalTickets.length > 0) {
            console.log(`📧📱 Sending notifications for free booking ${bookingId}...`);

            const notificationResults = await Promise.allSettled([
                // A. Welcome Email
                sendWelcomeEmail(updatedBooking),

                // B. Ticket Emails (One per night)
                ...finalTickets.map(ticket => sendTicketEmail(updatedBooking, ticket)),

                // C. WhatsApp Welcome Message
                sendWhatsAppMessage(updatedBooking),

                // D. WhatsApp Tickets (One per night)
                ...finalTickets.map(ticket => sendWhatsAppTicket(updatedBooking, ticket))
            ]);

            console.log(`✅ Notifications processed for free booking ${bookingId}`);

            return NextResponse.json({
                success: true,
                message: 'Booking confirmed and notifications sent',
                ticketCount: finalTickets.length,
                notifications: notificationResults.map(r => r.status)
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Booking confirmed (no tickets created)'
        });

    } catch (error: any) {
        console.error('❌ Free Booking Confirmation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
