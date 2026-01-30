import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: 'Env Error' }, { status: 500 });

        const cookieStore = await cookies();
        if (!cookieStore.get('admin_session')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey
        );

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
