import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

async function checkAuth() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    if (!adminSession) throw new Error("Unauthorized");
}

export async function GET() {
    try {
        await checkAuth();
        let supabase;
        try {
            supabase = getServiceSupabase();
        } catch {
            supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
        }
        const { data, error } = await supabase
            .from("speakers")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin speakers error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}

export async function POST(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase();
        const body = await request.json();

        if (!body.name) return NextResponse.json({ message: "Name required" }, { status: 400 });

        const { data, error } = await supabase
            .from("speakers")
            .insert({
                name: body.name,
                title: body.title || null,
                image_url: body.image_url || null,
                night_id: body.night_id || null,
                display_order: body.display_order ?? 0
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin speakers create error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase();
        const body = await request.json();

        if (!body.id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { data, error } = await supabase
            .from("speakers")
            .update({
                name: body.name,
                title: body.title || null,
                image_url: body.image_url || null,
                night_id: body.night_id || null,
                display_order: body.display_order ?? 0
            })
            .eq("id", body.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin speakers update error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await checkAuth();
        const supabase = getServiceSupabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { error } = await supabase
            .from("speakers")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin speakers delete error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}
