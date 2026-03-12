"use client";

import { useState, useEffect } from 'react';
import {
    Search,
    Loader2,
    ScanLine
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from 'next/link';

export default function PartnerDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, paid, pending

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/partner/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering
    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.email?.toLowerCase().includes(search.toLowerCase()) ||
            b.id?.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === 'all' ? true :
                filter === 'paid' ? b.payment_status === 'paid' :
                    b.payment_status !== 'paid';

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 container mx-auto py-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Partner Dashboard</h1>
                <div className="flex gap-2">
                    <Link href="/partner/scan">
                        <Button className="bg-primary text-black font-bold">
                            <ScanLine className="w-4 h-4 mr-2" /> Scan QR
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={fetchBookings}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                    <Input
                        placeholder="Search name, email, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-black/50 border-white/10 text-white"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'paid', 'pending'].map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'ghost'}
                            onClick={() => setFilter(f)}
                            className={`capitalize ${filter === f ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-400 hover:text-white'}`}
                        >
                            {f}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-300">Customer</TableHead>
                                <TableHead className="text-gray-300">Ticket</TableHead>
                                <TableHead className="text-gray-300">Promo</TableHead>
                                <TableHead className="text-gray-300">Amount</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                                <TableHead className="text-gray-300">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Loading bookings...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell>
                                            <div className="font-medium text-white">{booking.customer_name}</div>
                                            <div className="text-xs text-gray-400">{booking.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white/5 text-white border-white/20">
                                                {booking.ticket_count} x {booking.ticket_count > 1 || booking.total_amount > 2000 ? 'Package' : 'Single'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {booking.promo_codes?.code ? (
                                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                    {booking.promo_codes.code}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-white font-mono">
                                            {booking.total_amount.toLocaleString()} EGP
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    booking.payment_status === 'paid'
                                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                }
                                            >
                                                {booking.payment_status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
