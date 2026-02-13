
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { confirmBooking } from '@/lib/booking-service';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email') || 'muhammedmekky4@gmail.com';
        const phone = searchParams.get('phone') || '201098620547';
        
        // 1. Create a Test Booking
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .insert({
                customer_name: "Test User (Mekky)",
                email: email,
                phone: phone,
                job_title: "Test Engineer",
                company: "Next Academy",
                industry: "Technology",
                selected_nights: ["2026-02-28", "2026-03-05", "2026-03-12"], // All 3 nights
                total_amount: 0,
                status: "pending",
                payment_status: "pending"
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 2. Confirm it (Triggers Emails & WhatsApp)
        const result = await confirmBooking(booking.id);

        return NextResponse.json({
            success: true,
            bookingId: booking.id,
            result
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
