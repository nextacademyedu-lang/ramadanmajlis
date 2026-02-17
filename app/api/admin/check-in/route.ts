import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ message: 'Missing booking ID' }, { status: 400 });
        }

        // Auth Check
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session');
        if (!adminSession) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Service Client
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) {
            return NextResponse.json({ message: 'Server Config Error' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey,
            { auth: { persistSession: false } }
        );

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
            console.error('Check-in update error:', updateError);
            return NextResponse.json({ message: 'Failed to check in' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `${existing.customer_name} checked in successfully!`,
            checkedInAt: now
        });

    } catch (err: any) {
        console.error('Check-in error:', err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
