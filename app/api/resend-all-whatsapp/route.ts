import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';
import { AgendaItem } from '@/lib/email';

export const maxDuration = 300; // 5 minutes max (Vercel Pro)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'ramadan2026resend') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pagination: offset and limit for batching
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    // Optional: test on specific phone
    const testPhone = searchParams.get('test');
    // Optional: skip poster
    const ticketsOnly = searchParams.get('tickets_only') === 'true';
    // Optional: poster only (no tickets)
    const posterOnly = searchParams.get('poster_only') === 'true';

    try {
        // Get confirmed bookings with tickets
        let query = supabaseAdmin
            .from('bookings')
            .select('*, tickets(*)')
            .eq('status', 'confirmed')
            .not('phone', 'is', null)
            .order('created_at', { ascending: true });

        if (testPhone) {
            query = query.ilike('phone', `%${testPhone}%`);
        } else {
            query = query.range(offset, offset + limit - 1);
        }

        const { data: bookings, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No more bookings to process', offset, done: true });
        }

        // Get total count for progress tracking
        const { count: totalCount } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'confirmed')
            .not('phone', 'is', null);

        // Fetch event nights + speakers
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
                // 1. Send poster
                if (!ticketsOnly) {
                    const posterResult = await sendWhatsAppMessage(
                        booking,
                        firstNight?.title || 'Grand Summit',
                        firstNight?.date || '2026-03-12',
                        'Pyramisa Suites Hotel, Dokki',
                        firstNight?.location_url || 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8'
                    );
                    if (posterResult) posterSuccess++;
                    await new Promise(r => setTimeout(r, 1500));
                }

                // 2. Send tickets
                if (!posterOnly) {
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

                        await new Promise(r => setTimeout(r, 1500));
                    }
                }

                results.push({
                    name: booking.customer_name,
                    phone: booking.phone,
                    status: 'sent'
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

        const nextOffset = offset + bookings.length;
        const hasMore = !testPhone && nextOffset < (totalCount || 0);

        return NextResponse.json({
            batch: { offset, limit, returned: bookings.length, totalBookings: totalCount },
            postersSent: posterSuccess,
            ticketsSent: ticketSuccess,
            failed: failCount,
            skipped: skippedCount,
            hasMore,
            nextUrl: hasMore
                ? `/api/resend-all-whatsapp?secret=ramadan2026resend&offset=${nextOffset}&limit=${limit}${ticketsOnly ? '&tickets_only=true' : ''}${posterOnly ? '&poster_only=true' : ''}`
                : null,
            results
        });

    } catch (error: any) {
        console.error('Resend all WhatsApp error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
