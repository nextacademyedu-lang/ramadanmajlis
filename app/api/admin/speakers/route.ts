import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) {
            console.error("SUPABASE_SERVICE_ROLE_KEY missing");
            return NextResponse.json({ message: "Server Config Error" }, { status: 500 });
        }

        const supabase = createClient(sbUrl, sbKey, {
            auth: { persistSession: false }
        });

        const { data, error } = await supabase
            .from("speakers")
            .select("*")
            .order("display_order", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin speakers GET error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: "Server Config Error" }, { status: 500 });

        const supabase = createClient(sbUrl, sbKey, {
            auth: { persistSession: false }
        });

        const body = await request.json();

        if (!body.name) return NextResponse.json({ message: "Name required" }, { status: 400 });

        const { data, error } = await supabase
            .from("speakers")
            .insert({
                name: body.name,
                title: body.title || null,
                image_url: body.image_url || null,
                night_id: body.night_id || null,
                role: body.role || 'Keynote Speaker',
                display_order: body.display_order ?? 0
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin speakers POST error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: "Server Config Error" }, { status: 500 });

        const supabase = createClient(sbUrl, sbKey, {
            auth: { persistSession: false }
        });

        const body = await request.json();

        if (!body.id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { data, error } = await supabase
            .from("speakers")
            .update({
                name: body.name,
                title: body.title || null,
                image_url: body.image_url || null,
                night_id: body.night_id || null,
                role: body.role || 'Keynote Speaker',
                display_order: body.display_order ?? 0
            })
            .eq("id", body.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin speakers PUT error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!sbKey) return NextResponse.json({ message: "Server Config Error" }, { status: 500 });

        const supabase = createClient(sbUrl, sbKey, {
            auth: { persistSession: false }
        });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const { error } = await supabase
            .from("speakers")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Admin speakers DELETE error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}
