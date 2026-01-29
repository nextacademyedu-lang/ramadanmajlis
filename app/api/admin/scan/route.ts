import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

        // Auth Check
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session');
        if (!adminSession) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Service Client
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: 'Server Config Error' }, { status: 500 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey,
            { auth: { persistSession: false } }
        );

        // Fetch Booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (bookingError || !booking) {
            return NextResponse.json({ message: 'Booking Not Found' }, { status: 404 });
        }

        // Fetch Industry Details
        // Try to match by name if industry_id is null (fallback)
        let industry = null;

        // If we had industry_id in booking, we'd use that. 
        // But for now we might rely on the text match or if we migrated data.
        // Let's try text match first since user might edit industries.
        const { data: indData } = await supabase
            .from('industries')
            .select('*')
            .eq('name', booking.industry)
            .single();

        industry = indData;

        // Note: In a real scenario, we should have linked them by ID during booking.
        // But for existing bookings or text-based flow, matching by name is a safe fallback.

        return NextResponse.json({
            booking,
            industry: industry || {
                name: booking.industry,
                color_code: '#666',
                zone_name: 'Unassigned Area'
            }
        });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
