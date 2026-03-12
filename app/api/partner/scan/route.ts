import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

        const cookieStore = await cookies();
        const partnerSession = cookieStore.get('partner_session');
        if (!partnerSession) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const supabase = supabaseAdmin;

        const query = id.trim();

        // Try by UUID
        let booking = null;
        const { data: byId } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', query)
            .single();

        if (byId) {
            booking = byId;
        } else {
            // Try by QR code
            const { data: byQr } = await supabase
                .from('bookings')
                .select('*')
                .eq('qr_code', query)
                .single();

            if (byQr) {
                booking = byQr;
            } else {
                // Try by ticket QR
                const { data: ticket } = await supabase
                    .from('tickets')
                    .select('booking_id')
                    .eq('qr_code', query)
                    .single();

                if (ticket) {
                    const { data: bookingFromTicket } = await supabase
                        .from('bookings')
                        .select('*')
                        .eq('id', ticket.booking_id)
                        .single();
                    if (bookingFromTicket) booking = bookingFromTicket;
                }
            }
        }

        if (!booking) {
            return NextResponse.json({ message: 'Booking Not Found' }, { status: 404 });
        }

        // Fetch industry
        const { data: industry } = await supabase
            .from('industries')
            .select('*')
            .eq('name', booking.industry)
            .single();

        return NextResponse.json({
            booking,
            industry: industry || {
                name: booking.industry,
                color_code: '#666',
                zone_name: 'Unassigned Area'
            }
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ message }, { status: 500 });
    }
}
