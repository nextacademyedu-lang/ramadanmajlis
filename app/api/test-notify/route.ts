
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { confirmBooking } from '@/lib/booking-service';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Scenarios:
// 1 = Night 1 only (Feb 28)
// 2 = Night 2 only (Mar 5)
// 3 = Night 3 only (Mar 12)
// 12 = Night 1 + Night 2
// 23 = Night 2 + Night 3
// 13 = Night 1 + Night 3
// all = Full Package (ALL)

const SCENARIO_MAP: Record<string, string[]> = {
    '1': ['2026-02-28'],
    '2': ['2026-03-05'],
    '3': ['2026-03-12'],
    '12': ['2026-02-28', '2026-03-05'],
    '23': ['2026-03-05', '2026-03-12'],
    '13': ['2026-02-28', '2026-03-12'],
    'all': ['ALL'],
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email') || 'muhammedmekky4@gmail.com';
        const phone = searchParams.get('phone') || '201098620547';
        const scenario = searchParams.get('scenario') || 'all';

        const selectedNights = SCENARIO_MAP[scenario];
        if (!selectedNights) {
            return NextResponse.json({ 
                error: `Invalid scenario "${scenario}". Valid: ${Object.keys(SCENARIO_MAP).join(', ')}` 
            }, { status: 400 });
        }

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
                selected_nights: selectedNights,
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
            scenario: scenario,
            selectedNights: selectedNights,
            bookingId: booking.id,
            result
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
