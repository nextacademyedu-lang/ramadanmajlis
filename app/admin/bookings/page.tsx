"use client";

import { useState, useEffect } from 'react';
import {
    Search,
    MoreHorizontal,
    Loader2,
    Eye,
    ExternalLink,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, paid, pending
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [editAmountId, setEditAmountId] = useState<string | null>(null);
    const [editAmountValue, setEditAmountValue] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch {
            console.error("Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    const toggleContacted = async (bookingId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;

            // Optimistic update
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, is_contacted: newStatus } : b
            ));

            const res = await fetch('/api/admin/bookings/contacted', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, contacted: newStatus })
            });

            if (!res.ok) {
                // Revert on failure
                alert("Failed to update contact status");
                setBookings(bookings.map(b =>
                    b.id === bookingId ? { ...b, is_contacted: currentStatus } : b
                ));
            }
        } catch (err) {
            console.error("Error updating contact status:", err);
            // Revert on failure
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, is_contacted: currentStatus } : b
            ));
        }
    };

    const deleteBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to DELETE this booking? This cannot be undone.')) return;
        const res = await fetch('/api/admin/bookings/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId })
        });
        if (res.ok) setBookings(bookings.filter(b => b.id !== bookingId));
        else alert('Failed to delete booking');
    };

    const updateAmount = async (bookingId: string) => {
        const amount = parseFloat(editAmountValue);
        if (isNaN(amount) || amount < 0) return;
        const res = await fetch('/api/admin/bookings/update-amount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, amount })
        });
        if (res.ok) {
            setBookings(bookings.map(b => b.id === bookingId ? { ...b, total_amount: amount } : b));
            setEditAmountId(null);
        } else alert('Failed to update amount');
    };

    const updateBookingStatus = async (bookingId: string, status: 'paid' | 'pending') => {
        if (!confirm(`Are you sure you want to mark this booking as ${status.toUpperCase()}?`)) return;

        try {
            const res = await fetch('/api/admin/bookings/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status })
            });

            if (res.ok) {
                // Optimistic update
                setBookings(bookings.map(b =>
                    b.id === bookingId
                        ? { ...b, payment_status: status, status: status === 'paid' ? 'confirmed' : 'pending' }
                        : b
                ));
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status");
        }
    };

    // Client-side filtering for simplicity (or move to DB if large dataset)
    const filteredBookings = bookings.filter(b => {
        const matchesSearch =
            b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            b.email?.toLowerCase().includes(search.toLowerCase()) ||
            b.phone?.includes(search) ||
            b.company?.toLowerCase().includes(search.toLowerCase()) ||
            b.id?.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === 'all' ? true :
                filter === 'paid' ? b.payment_status === 'paid' :
                    b.payment_status !== 'paid';

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Bookings Management</h1>
                <div className="flex gap-2">
                    <Link href="/admin/bookings/new">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="w-4 h-4 mr-2" /> Add Booking
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={fetchBookings}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                    <Input
                        placeholder="Search name, email, phone, company, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-black/50 border-white/10"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'paid', 'pending'].map(f => (
                        <Button
                            key={f}
                            variant={filter === f ? 'default' : 'ghost'}
                            onClick={() => setFilter(f)}
                            className="capitalize"
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
                                <TableHead className="text-gray-300">Company / Job</TableHead>
                                <TableHead className="text-gray-300">Contact</TableHead>
                                <TableHead className="text-gray-300">Ticket</TableHead>
                                <TableHead className="text-gray-300">Amount</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                                <TableHead className="text-right text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                        Loading bookings...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                        No bookings found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {booking.profile_image_url ? (
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative">
                                                        <Image src={booking.profile_image_url} alt={booking.customer_name} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50">
                                                        {booking.customer_name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-white">{booking.customer_name}</div>
                                                    <div className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-white">{booking.company}</div>
                                            <div className="text-xs text-gray-400">{booking.job_title}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-white">{booking.phone}</div>
                                            <div className="text-xs text-gray-400">{booking.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-white/5 text-white border-white/20 mb-1">
                                                {booking.ticket_count > 1 || (booking.total_amount > 2000 && booking.selected_nights?.length !== 1) ? 'Package' : 'Single'}
                                            </Badge>
                                            {booking.promo_codes?.code && (
                                                <div className="text-[10px] text-purple-400">Code: {booking.promo_codes.code}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-white font-mono">
                                            {editAmountId === booking.id ? (
                                                <div className="flex gap-1 items-center">
                                                    <Input
                                                        className="w-24 h-7 text-xs bg-black/50 border-white/20"
                                                        value={editAmountValue}
                                                        onChange={e => setEditAmountValue(e.target.value)}
                                                        onKeyDown={e => { if (e.key === 'Enter') updateAmount(booking.id); if (e.key === 'Escape') setEditAmountId(null); }}
                                                        autoFocus
                                                    />
                                                    <Button size="sm" className="h-7 text-xs px-2" onClick={() => updateAmount(booking.id)}>✓</Button>
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditAmountId(null)}>✕</Button>
                                                </div>
                                            ) : (
                                                <span className="cursor-pointer hover:text-emerald-400" onClick={() => { setEditAmountId(booking.id); setEditAmountValue(String(booking.total_amount)); }}>
                                                    {booking.total_amount.toLocaleString()} EGP
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 items-start">
                                                <Badge
                                                    className={
                                                        booking.payment_status === 'paid'
                                                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                    }
                                                >
                                                    {booking.payment_status.toUpperCase()}
                                                </Badge>
                                                {booking.payment_status === 'pending' && (
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Checkbox
                                                            id={`contacted-${booking.id}`}
                                                            checked={!!booking.is_contacted}
                                                            onCheckedChange={() => toggleContacted(booking.id, !!booking.is_contacted)}
                                                            className="border-white/50 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                        />
                                                        <label
                                                            htmlFor={`contacted-${booking.id}`}
                                                            className="text-xs font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            Contacted
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white/10 hover:text-white"
                                                    onClick={() => setSelectedBooking(booking)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-black border-white/20 text-white">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="hover:bg-white/10 cursor-pointer"
                                                            onClick={() => updateBookingStatus(booking.id, 'paid')}
                                                        >
                                                            Mark as Paid
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="hover:bg-white/10 cursor-pointer"
                                                            onClick={() => { setEditAmountId(booking.id); setEditAmountValue(String(booking.total_amount)); }}
                                                        >
                                                            Edit Amount
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="hover:bg-white/10 cursor-pointer"
                                                            onClick={() => navigator.clipboard.writeText(booking.id)}
                                                        >
                                                            Copy ID
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="hover:bg-red-500/20 text-red-400 cursor-pointer"
                                                            onClick={() => deleteBooking(booking.id)}
                                                        >
                                                            Delete Booking
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Details Modal */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="bg-[#0a201b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            Booking Details
                            <Badge variant="outline" className="text-xs font-normal border-white/20 text-white/60">
                                {selectedBooking?.id}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedBooking && (
                        <div className="grid gap-6 py-4">
                            {/* Header Section with Photo */}
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                {selectedBooking.profile_image_url ? (
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30">
                                        <Image src={selectedBooking.profile_image_url} alt="Profile" fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-emerald-900/40 flex items-center justify-center text-2xl font-bold text-emerald-400 border-2 border-emerald-500/30">
                                        {selectedBooking.customer_name?.charAt(0)}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white">{selectedBooking.customer_name}</h3>
                                    <div className="flex items-center gap-2 text-emerald-200/70">
                                        <span className="font-medium">{selectedBooking.job_title}</span>
                                        <span>at</span>
                                        <span className="font-medium">{selectedBooking.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30">
                                            {selectedBooking.industry}
                                        </Badge>
                                        {selectedBooking.linkedin_url && (
                                            <a
                                                href={selectedBooking.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                LinkedIn Profile
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Contact Info */}
                                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Email:</span>
                                            <span className="text-white select-all">{selectedBooking.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phone:</span>
                                            <span className="text-white select-all">{selectedBooking.phone}</span>
                                        </div>
                                        {selectedBooking.payment_provider && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Provider:</span>
                                                <span className="text-white capitalize">{selectedBooking.payment_provider.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Booking Info */}
                                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Booking Status</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Payment:</span>
                                            <Badge
                                                className={
                                                    selectedBooking.payment_status === 'paid'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                }
                                            >
                                                {selectedBooking.payment_status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Date:</span>
                                            <span className="text-white">{new Date(selectedBooking.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="text-white font-medium">
                                                {selectedBooking.ticket_count > 1 || (selectedBooking.total_amount > 2000 && selectedBooking.selected_nights?.length !== 1) ? 'Full Package' : 'Single Night'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Financial Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ticket Count:</span>
                                        <span className="text-white">{selectedBooking.ticket_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nights Selected:</span>
                                        <div className="flex gap-1 flex-wrap justify-end">
                                            {selectedBooking.selected_nights && selectedBooking.selected_nights.map((night: string) => (
                                                <Badge key={night} variant="outline" className="bg-white/5 text-xs">
                                                    {night === 'ALL' ? 'All Nights' : new Date(night).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </Badge>
                                            ))}
                                            {(!selectedBooking.selected_nights || selectedBooking.selected_nights.length === 0) && <span className="text-gray-500">-</span>}
                                        </div>
                                    </div>
                                    {selectedBooking.discount_applied > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>
                                                Discount
                                                {selectedBooking.promo_codes?.code && <span className="text-xs ml-1">({selectedBooking.promo_codes.code})</span>}
                                            </span>
                                            <span>- {selectedBooking.discount_applied.toLocaleString()} EGP</span>
                                        </div>
                                    )}
                                    <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-bold text-white">
                                        <span>Total Amount</span>
                                        <span>{selectedBooking.total_amount.toLocaleString()} EGP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
