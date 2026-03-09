import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
    const { bookingId } = await req.json();
    await supabaseAdmin.from('tickets').delete().eq('booking_id', bookingId);
    const { error } = await supabaseAdmin.from('bookings').delete().eq('id', bookingId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
