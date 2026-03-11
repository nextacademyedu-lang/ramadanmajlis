import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';
import { AgendaItem } from '@/lib/email';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'ramadan2026resend') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: only send to a specific phone (for testing)
    const testPhone = searchParams.get('test');
    // Optional: skip poster, only send tickets
    const ticketsOnly = searchParams.get('tickets_only') === 'true';

    try {
        // Get all confirmed bookings with their tickets
        let query = supabaseAdmin
            .from('bookings')
            .select('*, tickets(*)')
            .eq('status', 'confirmed')
            .not('phone', 'is', null);

        if (testPhone) {
            query = query.ilike('phone', `%${testPhone}%`);
        }

        const { data: bookings, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No confirmed bookings found' });
        }

        // Fetch event nights + speakers for agenda
        const { data: eventNights } = await supabaseAdmin
            .from('event_nights')
            .select('id, date, title, panel_title, agenda, location_url')
            .order('date', { ascending: true });

        const { data: allSpeakers } = await supabaseAdmin
            .from('speakers')
            .select('id, name');

        const speakerMap = new Map(allSpeakers?.map((s: any) => [s.id, s.name]) || []);

        const getNightDetails = (ticketDate: string) => {
            if (!eventNights) return null;
            return eventNights.find((n: any) =>
                n.date === ticketDate ||
                new Date(n.date).toDateString() === new Date(ticketDate).toDateString()
            );
        };

        const firstNight = eventNights?.[0];
        const results: any[] = [];
        let posterSuccess = 0;
        let ticketSuccess = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (const booking of bookings) {
            if (booking.payment_status === 'refunded' && booking.total_amount < 0) {
                skippedCount++;
                results.push({ name: booking.customer_name, phone: booking.phone, status: 'skipped', reason: 'refunded' });
                continue;
            }

            try {
                // 1. Send poster (unless tickets_only)
                if (!ticketsOnly) {
                    const posterResult = await sendWhatsAppMessage(
                        booking,
                        firstNight?.title || 'Grand Summit',
                        firstNight?.date || '2026-03-12',
                        'Pyramisa Suites Hotel, Dokki',
                        firstNight?.location_url || 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8'
                    );
                    if (posterResult) posterSuccess++;
                    await new Promise(r => setTimeout(r, 2000));
                }

                // 2. Send tickets
                const tickets = booking.tickets || [];
                for (const ticket of tickets) {
                    if (ticket.night_date === 'ALL') {
                        const combinedAgenda: AgendaItem[] = [];
                        const locationUrls: string[] = [];

                        if (eventNights) {
                            eventNights.forEach((night: any) => {
                                const nightName = night.panel_title || night.title;
                                const nightDate = new Date(night.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                combinedAgenda.push({ time: "", title: `${nightName} (${nightDate})`, isHeader: true });

                                if (night.agenda) {
                                    const rawAgenda = Array.isArray(night.agenda) ? night.agenda : JSON.parse(night.agenda as string);
                                    rawAgenda.forEach((item: any) => {
                                        combinedAgenda.push({
                                            time: item.time,
                                            title: item.title,
                                            speaker: item.speaker_id ? speakerMap.get(item.speaker_id) : undefined
                                        });
                                    });
                                }
                                if (night.location_url) {
                                    locationUrls.push(`${nightDate}: ${night.location_url}`);
                                }
                            });
                        }

                        const ticketResult = await sendWhatsAppTicket(booking, ticket, "Full Access Pass (All Nights)", combinedAgenda, locationUrls.join('\n'));
                        if (ticketResult) ticketSuccess++;
                    } else {
                        const nightDetails = getNightDetails(ticket.night_date);
                        let nightAgenda: AgendaItem[] = [];

                        if (nightDetails?.agenda) {
                            const rawAgenda = Array.isArray(nightDetails.agenda) ? nightDetails.agenda : JSON.parse(nightDetails.agenda as string);
                            nightAgenda = rawAgenda.map((item: any) => ({
                                time: item.time,
                                title: item.title,
                                speaker: item.speaker_id ? speakerMap.get(item.speaker_id) : undefined
                            }));
                        }

                        const ticketResult = await sendWhatsAppTicket(booking, ticket, nightDetails?.panel_title || nightDetails?.title, nightAgenda, nightDetails?.location_url);
                        if (ticketResult) ticketSuccess++;
                    }

                    await new Promise(r => setTimeout(r, 2000));
                }

                results.push({
                    name: booking.customer_name,
                    phone: booking.phone,
                    status: 'sent',
                    ticketCount: tickets.length
                });

            } catch (err: any) {
                failCount++;
                results.push({
                    name: booking.customer_name,
                    phone: booking.phone,
                    status: 'failed',
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            total: bookings.length,
            postersSent: posterSuccess,
            ticketsSent: ticketSuccess,
            failed: failCount,
            skipped: skippedCount,
            results
        });

    } catch (error: any) {
        console.error('Resend all WhatsApp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
