import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: 'Env Error' }, { status: 500 });

        const cookieStore = await cookies();
        if (!cookieStore.get('admin_session')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { bookingId, contacted } = await request.json();

        if (!bookingId || typeof contacted !== 'boolean') {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey
        );

        const { error } = await supabase
            .from('bookings')
            .update({ is_contacted: contacted })
            .eq('id', bookingId);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Error updating contacted status:", err);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
