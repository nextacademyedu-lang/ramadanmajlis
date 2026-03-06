
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendTicketEmail } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const NIGHT_DATE = '2026-03-12';
const NIGHT_TITLE = 'Grand Summit';
const NIGHT_LOCATION = 'Pyramisa Suites Hotel, Dokki';
const NIGHT_LOCATION_URL = 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8';

async function confirmSingleBooking(bookingId: string) {
    const { data: existingBooking } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

    if (!existingBooking) throw new Error(`Booking ${bookingId} not found`);

    if (existingBooking.status === 'confirmed') {
        return { status: 'already_processed', booking: existingBooking };
    }

    const qrCode = crypto.randomUUID();

    const { data: updatedBooking, error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed', paid_at: new Date().toISOString(), qr_code: qrCode })
        .eq('id', bookingId)
        .select('*')
        .single();

    if (updateError) throw new Error(`Failed to update booking: ${updateError.message}`);

    // Increment promo usage (primary booking only)
    if (updatedBooking.promo_code_id) {
        const { error: promoError } = await supabaseAdmin.rpc('increment_promo_usage', { row_id: updatedBooking.promo_code_id });
        if (promoError) {
            const { data: currentPromo } = await supabaseAdmin.from('promo_codes').select('usage_count').eq('id', updatedBooking.promo_code_id).single();
            if (currentPromo) {
                await supabaseAdmin.from('promo_codes').update({ usage_count: (currentPromo.usage_count || 0) + 1 }).eq('id', updatedBooking.promo_code_id);
            }
        }
    }

    // Create ticket
    const ticketQr = crypto.randomUUID();
    let ticket: any = null;

    const { data: createdTicket, error: ticketError } = await supabaseAdmin
        .from('tickets')
        .insert({ booking_id: bookingId, night_date: NIGHT_DATE, qr_code: ticketQr, status: 'pending' })
        .select()
        .single();

    if (ticketError?.code === '23505') {
        const { data: existing } = await supabaseAdmin.from('tickets').select('*').eq('booking_id', bookingId).single();
        ticket = existing;
    } else if (!ticketError) {
        ticket = createdTicket;
    }

    // Fetch agenda
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

    // Send notifications
    const notifications: PromiseSettledResult<unknown>[] = [];

    if (ticket) {
        // WhatsApp poster
        try {
            console.log('📱 Sending WhatsApp poster to:', updatedBooking.phone);
            console.log('   EVOLUTION_API_URL:', process.env.EVOLUTION_API_URL);
            console.log('   EVOLUTION_KEY exists:', !!process.env.EVOLUTION_API_KEY);
            console.log('   EVOLUTION_INSTANCE:', process.env.EVOLUTION_INSTANCE_NAME);
            const posterResult = await sendWhatsAppMessage(updatedBooking, NIGHT_TITLE, NIGHT_DATE, NIGHT_LOCATION, locationUrl);
            console.log('   WhatsApp poster result:', posterResult ? '✅ sent' : '❌ failed');
            notifications.push({ status: 'fulfilled', value: posterResult } as PromiseSettledResult<unknown>);
        } catch (e) {
            console.error('   WhatsApp poster exception:', e);
            notifications.push({ status: 'rejected', reason: e } as PromiseSettledResult<unknown>);
        }

        // WhatsApp ticket
        await new Promise(r => setTimeout(r, 2000));
        try {
            console.log('🎟️  Sending WhatsApp ticket to:', updatedBooking.phone);
            const ticketResult = await sendWhatsAppTicket(updatedBooking, ticket, NIGHT_TITLE, agenda, locationUrl);
            console.log('   WhatsApp ticket result:', ticketResult ? '✅ sent' : '❌ failed');
            notifications.push({ status: 'fulfilled', value: ticketResult } as PromiseSettledResult<unknown>);
        } catch (e) {
            console.error('   WhatsApp ticket exception:', e);
            notifications.push({ status: 'rejected', reason: e } as PromiseSettledResult<unknown>);
        }

        // Emails
        const emailResults = await Promise.allSettled([
            sendWelcomeEmail(updatedBooking, NIGHT_TITLE, NIGHT_DATE, NIGHT_LOCATION),
            sendTicketEmail(updatedBooking, ticket, agenda, locationUrl),
        ]);
        notifications.push(...emailResults);
    }

    return { status: 'success', booking: updatedBooking, ticket, notifications };
}

export async function confirmBooking(bookingId: string) {
    // Confirm primary booking
    const primaryResult = await confirmSingleBooking(bookingId);

    if (primaryResult.status === 'already_processed') {
        return { status: 'already_processed', booking: primaryResult.booking };
    }

    // Find and confirm group members
    const { data: groupMembers } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('group_booking_ref', bookingId)
        .neq('id', bookingId);

    const groupResults = [];
    if (groupMembers && groupMembers.length > 0) {
        for (const member of groupMembers) {
            await new Promise(r => setTimeout(r, 3000)); // delay between members
            try {
                const result = await confirmSingleBooking(member.id);
                groupResults.push(result);
            } catch (e) {
                console.error(`❌ Failed to confirm group member ${member.id}:`, e);
            }
        }
    }

    return {
        status: 'success',
        booking: primaryResult.booking,
        groupConfirmed: groupResults.length,
        notifications: primaryResult.notifications
    };
}
