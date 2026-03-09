
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTicketEmail, AgendaItem } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('id');

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing booking id parameter' }, { status: 400 });
        }

        // 1. Fetch booking
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Fetch tickets
        const { data: tickets } = await supabaseAdmin
            .from('tickets')
            .select('*')
            .eq('booking_id', bookingId);

        if (!tickets || tickets.length === 0) {
            return NextResponse.json({ error: 'No tickets found for this booking' }, { status: 404 });
        }

        // 3. Fetch event nights + speakers
        const { data: eventNights } = await supabaseAdmin
            .from('event_nights')
            .select('date, title, panel_title, agenda, location_url')
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

        // 4. Send Emails
        const emailResults = await Promise.allSettled(tickets.map((ticket: any) => {
            if (ticket.night_date === 'ALL') {
                const combinedAgenda: AgendaItem[] = [];
                const emailLocationUrls: { label: string; url: string }[] = [];

                if (eventNights) {
                    eventNights.forEach((night: any) => {
                        const nightName = night.panel_title || night.title;
                        const nightDate = new Date(night.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        combinedAgenda.push({
                            time: "",
                            title: `${nightName} (${nightDate})`,
                            isHeader: true
                        });

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
                            emailLocationUrls.push({ label: `📍 ${nightName} Location`, url: night.location_url });
                        }
                    });
                }

                return sendTicketEmail(booking, ticket, combinedAgenda, undefined, emailLocationUrls);
            }

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
            return sendTicketEmail(booking, ticket, nightAgenda, nightDetails?.location_url);
        }));

        // 5. Send WhatsApp (Poster + Ticket)
        const firstNight = eventNights?.[0];
        const whatsappPoster = await sendWhatsAppMessage(
            booking,
            firstNight?.title || 'Grand Summit',
            firstNight?.date || '2026-03-12',
            'Pyramisa Suites Hotel, Dokki',
            firstNight?.location_url || 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8'
        );

        const whatsappTickets = await Promise.allSettled(tickets.map((ticket: any) => {
            if (ticket.night_date === 'ALL') {
                const combinedAgenda: AgendaItem[] = [];
                const locationUrls: string[] = [];

                if (eventNights) {
                    eventNights.forEach((night: any) => {
                        const nightName = night.panel_title || night.title;
                        const nightDate = new Date(night.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        combinedAgenda.push({
                            time: "",
                            title: `${nightName} (${nightDate})`,
                            isHeader: true
                        });

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

                const locationsString = locationUrls.join('\n');
                return sendWhatsAppTicket(booking, ticket, "Full Access Pass (All Nights)", combinedAgenda, locationsString);
            }

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
            return sendWhatsAppTicket(booking, ticket, nightDetails?.panel_title || nightDetails?.title, nightAgenda, nightDetails?.location_url);
        }));

        return NextResponse.json({
            success: true,
            customer: booking.customer_name,
            email: booking.email,
            phone: booking.phone,
            ticketCount: tickets.length,
            emailResults: emailResults.map(r => r.status),
            whatsappPoster: whatsappPoster ? 'sent' : 'skipped',
            whatsappTickets: whatsappTickets.map(r => r.status),
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
