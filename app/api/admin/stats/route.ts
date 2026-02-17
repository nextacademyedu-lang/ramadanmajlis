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
        const supabase = getServiceSupabase();
        const { data, error, count } = await supabase
            .from("bookings")
            .select("total_amount", { count: "exact" })
            .eq("payment_status", "paid");

        if (error) throw error;

        const totalRevenue = (data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const totalBookings = count ?? (data || []).length;
        const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

        return NextResponse.json({
            totalRevenue,
            totalBookings,
            totalCheckins: 0,
            avgOrderValue
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Admin stats error:", message);
        return NextResponse.json({ message }, { status: message === "Unauthorized" ? 401 : 500 });
    }
}
