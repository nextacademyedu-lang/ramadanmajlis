import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Auth Config
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: 'Env Error' }, { status: 500 });

        const cookieStore = await cookies();
        if (!cookieStore.get('admin_session')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey
        );

        const { data, error } = await supabase
            .from('promo_codes')
            .insert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: 'Env Error' }, { status: 500 });

        const cookieStore = await cookies();
        if (!cookieStore.get('admin_session')) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            sbKey
        );

        const { error } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
