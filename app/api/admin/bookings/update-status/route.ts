import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { confirmBooking } from '@/lib/booking-service';

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session');
        if (!adminSession && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId, status } = await req.json();

        if (!bookingId || !status) {
            return NextResponse.json({ error: 'Missing bookingId or status' }, { status: 400 });
        }


        // 2. Update Booking
        if (status === 'paid') {
            // Use the central confirmBooking service to handle DB updates + Emails + WhatsApp
            const result = await confirmBooking(bookingId);
            if (result.status === 'already_processed') {
                return NextResponse.json({ success: true, message: 'Already marked as paid previously' });
            }
        } else {
            // For pending or other statuses, just update the DB
            const { error } = await supabaseAdmin
                .from('bookings')
                .update({
                    payment_status: 'pending',
                    status: 'pending'
                })
                .eq('id', bookingId);

            if (error) {
                console.error("Update Error:", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Mark Paid API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
