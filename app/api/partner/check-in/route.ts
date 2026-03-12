import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
    try {
        const { bookingId } = await request.json();
        if (!bookingId) return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });

        const cookieStore = await cookies();
        const partnerSession = cookieStore.get('partner_session');
        if (!partnerSession) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const supabase = supabaseAdmin;

        // Check if already checked in
        const { data: existing, error: fetchError } = await supabase
            .from('bookings')
            .select('checked_in_at, customer_name')
            .eq('id', bookingId)
            .single();

        if (fetchError || !existing) {
            return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
        }

        if (existing.checked_in_at) {
            return NextResponse.json({
                message: `${existing.customer_name} already checked in at ${new Date(existing.checked_in_at).toLocaleTimeString()}`,
                alreadyCheckedIn: true,
                checkedInAt: existing.checked_in_at
            }, { status: 409 });
        }

        // Perform Check-in
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ checked_in_at: now })
            .eq('id', bookingId);

        if (updateError) {
            return NextResponse.json({ message: 'Failed to check in' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${existing.customer_name} checked in successfully!`,
            checkedInAt: now
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ message }, { status: 500 });
    }
}
