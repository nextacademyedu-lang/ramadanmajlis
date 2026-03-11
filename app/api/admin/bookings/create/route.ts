import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Mode 1: Confirm an existing booking (called from BookingForm isAdmin mode)
        if (body.confirmOnly && body.bookingIds) {
            const { confirmBooking } = await import('@/lib/booking-service');
            const results = [];

            for (const bookingId of body.bookingIds) {
                try {
                    // First mark as paid/confirmed
                    await supabaseAdmin
                        .from('bookings')
                        .update({ payment_status: 'paid', status: 'confirmed' })
                        .eq('id', bookingId);

                    const result = await confirmBooking(bookingId);
                    results.push({ bookingId, status: result.status });
                    console.log(`✅ Admin confirmed booking ${bookingId}`);
                } catch (err) {
                    console.error(`❌ Admin confirm failed for ${bookingId}:`, err);
                    results.push({ bookingId, status: 'error', error: (err as Error).message });
                }
            }

            return NextResponse.json({ success: true, results });
        }

        // Mode 2: Create a new booking from scratch (legacy simplified form)
        const { name, email, phone, job_title, company, industry, linkedin_url, amount } = body;

        if (!name || !email || !phone) {
            return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 });
        }

        const totalAmount = parseFloat(amount) || 0;

        const { data: booking, error: insertError } = await supabaseAdmin
            .from('bookings')
            .insert({
                customer_name: name,
                email,
                phone,
                job_title: job_title || '',
                company: company || '',
                linkedin_url: linkedin_url || '',
                industry: industry || '',
                selected_nights: ['2026-03-12'],
                ticket_count: 1,
                total_amount: totalAmount,
                payment_provider: 'easykash',
                payment_status: 'paid',
                status: 'confirmed',
                profile_image_url: null,
                promo_code_id: null,
                discount_applied: 0,
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Admin booking insert error:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        console.log(`✅ Admin created booking ${booking.id} for ${name}`);

        try {
            const { confirmBooking } = await import('@/lib/booking-service');
            await confirmBooking(booking.id);
        } catch (confirmErr) {
            console.error('⚠️ Booking created but confirm failed:', confirmErr);
        }

        return NextResponse.json({ success: true, booking });

    } catch (error: any) {
        console.error('❌ Admin create booking error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
