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
    if (process.env.NODE_ENV !== "production") return;
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
            .from("event_nights")
            .select("id, title, date")
            .order("date", { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin nights error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}
