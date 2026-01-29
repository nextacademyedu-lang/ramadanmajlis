"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, QrCode, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Init Supabase (Client Side)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalCheckins: 0,
        avgOrderValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('total_amount, payment_status, ticket_count')
                .eq('payment_status', 'paid');

            if (error) throw error;

            const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
            const totalBookings = bookings.length;
            const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            setStats({
                totalRevenue,
                totalBookings,
                totalCheckins: 0, // Need to implement check-in flag later
                avgOrderValue
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <div className="text-sm text-gray-400">Live Updates</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`${stats.totalRevenue.toLocaleString()} EGP`}
                    icon={TrendingUp}
                    trend="+12% vs last week"
                />
                <StatsCard
                    title="Total Paid Bookings"
                    value={stats.totalBookings.toString()}
                    icon={Users}
                    trend="Active"
                />
                <StatsCard
                    title="Avg. Order Value"
                    value={`${Math.round(stats.avgOrderValue).toLocaleString()} EGP`}
                    icon={CreditCard}
                />
                <StatsCard
                    title="Checked In"
                    value={stats.totalCheckins.toString()}
                    icon={QrCode}
                    trend="Scanned"
                />
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-gray-500">
                        Activity Feed / Chart Coming Soon
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle>Tickets by Industry</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-gray-500">
                        Pie Chart Coming Soon
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, trend }: any) {
    return (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-400">{title}</p>
                        <div className="text-2xl font-bold mt-2 text-white">{value}</div>
                    </div>
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <Icon size={20} />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1">
                        {trend}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
