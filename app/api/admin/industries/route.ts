import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Service Client
// We use a getter to ensure we pick up the env var at runtime
const getServiceSupabase = () => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
    }

    return createClient(sbUrl, sbKey, {
        auth: { persistSession: false }
    });
};

// Check Auth Helper
async function checkAuth() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession) throw new Error("Unauthorized");
}

export async function GET() {
    try {
        await checkAuth(); // Ensure admin

        // For GET, we can arguably use the Anon key if RLS allows public read,
        // but let's stick to Service Role for consistency in this Admin route
        // or fall back to Anon if Service Role is missing (for robust reading).

        let supabase;
        try {
            supabase = getServiceSupabase();
        } catch (e) {
            // Fallback for reading if key is missing (since RLS allows global read)
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
        }

        const { data, error } = await supabase
            .from('industries')
            .select('*')
            .order('name');

        if (error) throw error;
        return NextResponse.json(data);

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
    }
}

export async function POST(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase(); // Admin Write
        const body = await request.json();

        // Basic Validation
        if (!body.name || !body.color_code) return NextResponse.json({ message: "Name/Color required" }, { status: 400 });

        const { data, error } = await supabase
            .from('industries')
            .insert({
                name: body.name,
                color_code: body.color_code,
                zone_name: body.zone_name || 'General Area'
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase();
        const body = await request.json();

        if (!body.id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { data, error } = await supabase
            .from('industries')
            .update({
                name: body.name,
                color_code: body.color_code,
                zone_name: body.zone_name
            })
            .eq('id', body.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { error } = await supabase
            .from('industries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 });
    }
}
