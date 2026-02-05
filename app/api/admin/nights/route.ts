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
            .select("id, title, date")
            .order("date", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Admin nights GET error:", err);
        return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
    }
}
