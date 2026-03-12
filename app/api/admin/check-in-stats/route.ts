import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select('customer_name, phone, company, job_title, industry, profile_image_url, checked_in_at')
            .not('checked_in_at', 'is', null)
            .order('checked_in_at', { ascending: false });

        if (error) throw error;

        const { count: totalBookings } = await supabaseAdmin
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('payment_status', 'paid');

        return NextResponse.json({
            checkedIn: data || [],
            checkedInCount: data?.length || 0,
            totalBookings: totalBookings || 0,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
