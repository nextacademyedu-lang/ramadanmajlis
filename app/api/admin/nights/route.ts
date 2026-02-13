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
            .from("event_nights")
            .select("*, speakers(*)")
            .order("date", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin nights GET error:", err);
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

        // Only allowing update of panel info for now, to keep it safe. 
        // Can expand if needed.
        if (body.agenda) {
            const speakerIds = new Set<string>();
            (body.agenda as any[]).forEach((item: any) => {
                if (item.speaker_ids && Array.isArray(item.speaker_ids)) {
                    item.speaker_ids.forEach((id: string) => speakerIds.add(id));
                }
                if (item.speaker_id) speakerIds.add(item.speaker_id);
                // Also check speaker_roles keys if available, though usually covered by speaker_ids
                if (item.speaker_roles) {
                    Object.keys(item.speaker_roles).forEach((id: string) => speakerIds.add(id));
                }
            });

            if (speakerIds.size > 0) {
                 await supabase
                    .from("speakers")
                    .update({ night_id: body.id })
                    .in("id", Array.from(speakerIds));
            }
        }

        const { data, error } = await supabase
            .from("event_nights")
            .update({
                panel_title: body.panel_title || null,
                panel_description: body.panel_description || null,
                agenda: body.agenda || null
            })
            .eq("id", body.id)
            .select("*, speakers(*)")
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin nights PUT error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}
