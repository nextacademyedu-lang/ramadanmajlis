import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendTicketEmail } from '@/lib/email';

const NIGHT_TITLE = 'Grand Summit';
const NIGHT_DATE = '2026-03-12';
const NIGHT_LOCATION = 'Pyramisa Suites Hotel, Dokki';
const NIGHT_LOCATION_URL = 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    // Simple protection so no one triggers it accidentally
    if (secret !== 'ramadan2026resend') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: only send to a specific email (for testing)
    const testEmail = searchParams.get('test');

    try {
        // Get all confirmed bookings with their tickets
        let query = supabaseAdmin
            .from('bookings')
            .select('*, tickets(*)')
            .eq('status', 'confirmed')
            .not('email', 'is', null);

        if (testEmail) {
            query = query.eq('email', testEmail);
        }

        const { data: bookings, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No confirmed bookings found' });
        }

        // Fetch agenda for ticket emails
        const { data: nightData } = await supabaseAdmin
            .from('event_nights')
            .select('agenda, location_url')
            .eq('id', '7f9f24d2-fb98-40d9-95e3-abfdaf1751d5')
            .single();

        const { data: allSpeakers } = await supabaseAdmin.from('speakers').select('id, name');
        const speakerMap = new Map(allSpeakers?.map((s: any) => [s.id, s.name]) || []);

        let agenda: any[] = [];
        if (nightData?.agenda) {
            const raw = Array.isArray(nightData.agenda) ? nightData.agenda : JSON.parse(nightData.agenda);
            agenda = raw.map((item: any) => ({
                time: item.time,
                title: item.title,
                speaker: item.speaker_id ? speakerMap.get(item.speaker_id) : undefined
            }));
        }

        const locationUrl = nightData?.location_url || NIGHT_LOCATION_URL;

        const results: any[] = [];
        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (const booking of bookings) {
            // Skip bookings with refunded status
            if (booking.payment_status === 'refunded' && booking.total_amount < 0) {
                skippedCount++;
                results.push({
                    name: booking.customer_name,
                    email: booking.email,
                    status: 'skipped',
                    reason: 'refunded'
                });
                continue;
            }

            const ticket = booking.tickets?.[0];
            
            try {
                // Send welcome email
                const welcomeResult = await sendWelcomeEmail(booking, NIGHT_TITLE, NIGHT_DATE, NIGHT_LOCATION);
                
                // Small delay to avoid rate limiting
                await new Promise(r => setTimeout(r, 500));
                
                // Send ticket email if ticket exists
                let ticketResult = null;
                if (ticket) {
                    ticketResult = await sendTicketEmail(booking, ticket, agenda, locationUrl);
                }

                successCount++;
                results.push({
                    name: booking.customer_name,
                    email: booking.email,
                    status: 'sent',
                    welcome: !!welcomeResult,
                    ticket: !!ticketResult,
                    hasTicket: !!ticket
                });

                // Delay between emails to avoid Resend rate limits
                await new Promise(r => setTimeout(r, 1000));
                
            } catch (err: any) {
                failCount++;
                results.push({
                    name: booking.customer_name,
                    email: booking.email,
                    status: 'failed',
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            total: bookings.length,
            sent: successCount,
            failed: failCount,
            skipped: skippedCount,
            results
        });

    } catch (error: any) {
        console.error('Resend all emails error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
