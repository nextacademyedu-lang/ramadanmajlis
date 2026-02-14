
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail, sendTicketEmail, AgendaItem } from '@/lib/email';
import { sendWhatsAppMessage, sendWhatsAppTicket } from '@/lib/whatsapp';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function confirmBooking(bookingId: string) {
    console.log(`🔄 Processing confirmation for booking: ${bookingId}`);

    // 1. Verify if booking exists and is already paid (Idempotency)
    const { data: existingBooking } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

    if (!existingBooking) {
        throw new Error(`Booking ${bookingId} not found`);
    }

    if (existingBooking.status === 'confirmed') {
        console.log(`⚠️ Booking ${bookingId} already confirmed.`);
        return { 
            status: 'already_processed', 
            booking: existingBooking 
        };
    }

    // 2. Generate unique QR code for this booking
    const qrCode = crypto.randomUUID();

    // 3. Update Booking Status with QR Code
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({
            payment_status: 'paid',
            status: 'confirmed',
            paid_at: new Date().toISOString(),
            qr_code: qrCode
        })
        .eq('id', bookingId)
        .select('*')
        .single();

    if (updateError) {
        console.error('❌ Failed to update booking:', updateError);
        throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log(`✅ Booking ${bookingId} marked as PAID.`);

    // 4. Increment Promo Code Usage
    if (updatedBooking.promo_code_id) {
        const { error: promoError } = await supabaseAdmin.rpc('increment_promo_usage', { 
            row_id: updatedBooking.promo_code_id 
        });
        
        // Fallback if RPC doesn't exist
        if (promoError) {
            console.warn('⚠️ RPC increment failed, trying direct update...', promoError);
            const { data: currentPromo } = await supabaseAdmin
                .from('promo_codes')
                .select('usage_count')
                .eq('id', updatedBooking.promo_code_id)
                .single();
            
            if (currentPromo) {
                await supabaseAdmin
                .from('promo_codes')
                .update({ usage_count: (currentPromo.usage_count || 0) + 1 })
                .eq('id', updatedBooking.promo_code_id);
            }
        } else {
             console.log(`✅ Promo code usage incremented for booking ${bookingId}`);
        }
    }

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
    const notificationResults: PromiseSettledResult<unknown>[] = [];
    if (finalTickets && finalTickets.length > 0) {
        console.log(`✅ Using ${finalTickets.length} tickets for booking ${bookingId}`);

        // Fetch necessary data for emails/whatsapp (Nights & Speakers)
        const { data: eventNights } = await supabaseAdmin
            .from('event_nights')
            .select('date, title, panel_title, agenda, location_url')
            .order('date', { ascending: true });
            
        const { data: allSpeakers } = await supabaseAdmin
            .from('speakers')
            .select('id, name');

        const speakerMap = new Map(allSpeakers?.map((s: any) => [s.id, s.name]) || []);
        
        // Helper to find matching night (fuzzy match for varying date formats)
        const getNightDetails = (ticketDate: string) => {
            if (!eventNights) return null;
            return eventNights.find((n: any) => 
                n.date === ticketDate || 
                new Date(n.date).toDateString() === new Date(ticketDate).toDateString()
            );
        };

         const emailPromises = finalTickets.map((ticket: any) => {
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
                
                return sendTicketEmail(updatedBooking, ticket, combinedAgenda, undefined, emailLocationUrls);
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
            return sendTicketEmail(updatedBooking, ticket, nightAgenda, nightDetails?.location_url);
        });

        const whatsappPromises = finalTickets.map((ticket: any) => {
             if (ticket.night_date === 'ALL') {
                 const combinedAgenda: AgendaItem[] = [];
                 const locationUrls: string[] = [];

                 if (eventNights) {
                    eventNights.forEach((night: any) => {
                        const nightDate = new Date(night.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        combinedAgenda.push({
                            time: "",
                            title: `${night.panel_title || night.title} (${nightDate})`,
                            isHeader: true // WhatsApp logic needs to handle this or ignore it
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
                 
                 // Pass combined locations as a multi-line string if possible, or just first one? 
                 // Whatsapp URL field is just appended.
                 const locationsString = locationUrls.join('\n');
                 
                 return sendWhatsAppTicket(updatedBooking, ticket, "Full Access Pass (All Nights)", combinedAgenda, locationsString);
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
             return sendWhatsAppTicket(updatedBooking, ticket, nightDetails?.panel_title || nightDetails?.title, nightAgenda, nightDetails?.location_url);
        });

        // A. Send WhatsApp Poster FIRST (needs time for OG image generation)
        try {
            console.log(`🖼️ Sending WhatsApp poster for booking ${bookingId}...`);
            const posterResult = await sendWhatsAppMessage(updatedBooking);
            notificationResults.push({ status: 'fulfilled', value: posterResult } as PromiseSettledResult<unknown>);
        } catch (posterError) {
            console.error('❌ Poster send failed:', posterError);
            notificationResults.push({ status: 'rejected', reason: posterError } as PromiseSettledResult<unknown>);
        }

        // B. Send WhatsApp Tickets one by one with delay
        for (const whatsappPromise of whatsappPromises) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay
            try {
                const ticketResult = await whatsappPromise;
                notificationResults.push({ status: 'fulfilled', value: ticketResult } as PromiseSettledResult<unknown>);
            } catch (ticketError) {
                console.error('❌ WhatsApp ticket send failed:', ticketError);
                notificationResults.push({ status: 'rejected', reason: ticketError } as PromiseSettledResult<unknown>);
            }
        }

        // C. Send Emails in parallel (no rate limiting on Resend)
        const emailResults = await Promise.allSettled([
            sendWelcomeEmail(updatedBooking),
            ...emailPromises,
        ]);
        notificationResults.push(...emailResults);

        console.log(`📧📱 Notifications processed for booking ${bookingId}`);
    }

    return {
        status: 'success',
        booking: updatedBooking,
        tickets: finalTickets,
        notifications: notificationResults
    };
}
