"use client";

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Loader2, CheckCircle2, XCircle, MapPin, User, Building2, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Dynamic import for QR Scanner (client-side only)
const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

// Type definitions for scan result
interface ScanBooking {
    id: string;
    customer_name: string;
    email: string;
    phone: string;
    job_title: string;
    company?: string;
    industry: string;
    profile_image_url?: string;
    payment_status: string;
    ticket_count: number;
    total_amount: number;
    checked_in_at?: string;
}

interface ScanIndustry {
    name: string;
    color_code: string;
    zone_name: string;
}

interface ScanResult {
    booking: ScanBooking;
    industry: ScanIndustry;
}

export default function ScannerPage() {
    const [scanInput, setScanInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCamera, setShowCamera] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [checkedInList, setCheckedInList] = useState<{customer_name: string; company: string; checked_in_at: string}[]>([]);
    const [checkedInCount, setCheckedInCount] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);

    const fetchCheckInStats = async () => {
        try {
            const res = await fetch('/api/admin/check-in-stats');
            const data = await res.json();
            setCheckedInList(data.checkedIn || []);
            setCheckedInCount(data.checkedInCount || 0);
            setTotalBookings(data.totalBookings || 0);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        fetchCheckInStats();
        const interval = setInterval(fetchCheckInStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-focus the input for continuous scanning
    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [result, error]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Fetch Booking Details by ID (Simulating the QR content)
            // Ideally, QR contains the UUID.
            const query = scanInput.trim();

            const res = await fetch(`/api/admin/scan?id=${query}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Booking not found');
            } else {
                setResult(data);
                // Optional: Play a success sound
            }
        } catch {
            setError("Network Error");
        } finally {
            setLoading(false);
            setScanInput(''); // Clear for next scan
        }
    };

    // Handle QR code scan from camera
    const handleQRScan = (qrCode: string) => {
        if (loading) return; // Prevent multiple triggers
        
        // Vibration feedback
        if (navigator.vibrate) navigator.vibrate(200);
        
        setScanInput(qrCode);
        // Auto-submit
        lookupBooking(qrCode);
    };

    // Reusable lookup function
    const lookupBooking = async (query: string) => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const res = await fetch(`/api/admin/scan?id=${query.trim()}`);
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.message || 'Booking not found');
            } else {
                setResult(data);
                setShowCamera(false); // Close camera on success
            }
        } catch {
            setError("Network Error");
        } finally {
            setLoading(false);
            setScanInput('');
        }
    };

    const handleCheckIn = async () => {
        if (!result) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/admin/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: result.booking.id })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                if (data.alreadyCheckedIn) {
                    setError(data.message);
                } else {
                    setError(data.message || 'Check-in failed');
                }
            } else {
                // Update local result to show checked-in status
                setResult({
                    ...result,
                    booking: {
                        ...result.booking,
                        checked_in_at: data.checkedInAt
                    }
                });
                // Show success briefly then reset
                setTimeout(() => setResult(null), 3000);
            }
        } catch {
            setError('Network error during check-in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Smart Check-in</h1>
                <p className="text-gray-400">Scan QR Code or Enter Booking ID</p>
            </div>

            {/* Scanner Input */}
            <Card className="bg-white/5 border-primary/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <CardContent className="p-6">
                    <form onSubmit={handleScan} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-500" />
                            <Input
                                ref={inputRef}
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                placeholder="Waiting for scan..."
                                className="pl-10 h-12 text-lg bg-black/50 border-white/10"
                            />
                        </div>
                        <Button type="submit" size="lg" disabled={loading} className="bg-primary text-black font-bold">
                            {loading ? <Loader2 className="animate-spin" /> : "Lookup"}
                        </Button>
                    </form>
                    
                    {/* Camera Toggle */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setShowCamera(!showCamera)}
                        >
                            <Camera className="mr-2" size={18} />
                            {showCamera ? 'Hide Camera' : 'Show Camera'}
                        </Button>
                        
                        <div className="mt-4">
                            <QRScanner onScan={handleQRScan} isActive={showCamera} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-center flex flex-col items-center gap-2"
                >
                    <XCircle size={40} />
                    <span className="text-xl font-bold">{error}</span>
                </motion.div>
            )}

            {/* Result Card */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <Card className="overflow-hidden border-0 shadow-2xl relative">
                            {/* Industry Color Background */}
                            <div
                                className="absolute inset-0 opacity-20 z-0"
                                style={{ backgroundColor: (result.industry?.color_code as string) || '#333' }}
                            />

                            <CardContent className="relative z-10 p-0">
                                {/* Header: Industry & Zone (The most important part for Ushering) */}
                                <div
                                    className="p-4 md:p-8 text-center text-black"
                                    style={{ backgroundColor: (result.industry?.color_code as string) || '#fff' }}
                                >
                                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider mb-2">
                                        {result.industry?.name || result.booking.industry || "General"}
                                    </h2>
                                    <div className="inline-flex items-center gap-2 bg-black/20 text-black px-3 py-1 md:px-4 md:py-1 rounded-full font-bold text-sm md:text-lg">
                                        <MapPin size={16} className="md:w-5 md:h-5" />
                                        {result.industry?.zone_name || "General Area"}
                                    </div>
                                </div>

                                {/* Attendee Details */}
                                <div className="p-4 md:p-8 bg-black/90 backdrop-blur-xl border-t border-white/10">
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                                        <div className="shrink-0">
                                            {result.booking.profile_image_url ? (
                                                <Image
                                                    src={result.booking.profile_image_url as string}
                                                    alt="Profile"
                                                    width={128}
                                                    height={128}
                                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/10 object-cover"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 flex items-center justify-center">
                                                    <User size={40} className="md:w-12 md:h-12 opacity-50" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-1 md:space-y-2 w-full">
                                            <h3 className="text-2xl md:text-3xl font-bold text-white break-words leading-tight">{result.booking.customer_name}</h3>
                                            <div className="text-lg md:text-xl text-primary font-medium">{result.booking.job_title}</div>
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm md:text-base">
                                                <Building2 size={14} className="md:w-4 md:h-4" />
                                                {result.booking.company}
                                            </div>

                                            <div className="pt-3 md:pt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                                                <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold border ${result.booking.payment_status === 'paid'
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                    }`}>
                                                    {result.booking.payment_status?.toUpperCase()}
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-500">
                                                    Ticket: {result.booking.ticket_count} | Total: {result.booking.total_amount} EGP
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                        {/* Check-in Status */}
                                        {result.booking.checked_in_at ? (
                                            <div className="flex items-center gap-2 text-green-400">
                                                <CheckCircle2 size={24} />
                                                <span className="font-bold">Checked in at {new Date(result.booking.checked_in_at as string).toLocaleTimeString()}</span>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500">Not yet checked in</div>
                                        )}
                                        
                                        <Button
                                            onClick={handleCheckIn}
                                            disabled={!!result.booking.checked_in_at || loading}
                                            className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-bold text-lg py-6 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <Loader2 className="mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="mr-2" />
                                            )}
                                            {result.booking.checked_in_at ? 'Already Checked In' : 'Confirm Check-in'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Check-in Counter */}
            <Card className="bg-white/5 border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CheckCircle2 className="text-green-400" size={22} />
                            Checked In
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black text-green-400">{checkedInCount}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-lg text-gray-400">{totalBookings}</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${totalBookings > 0 ? (checkedInCount / totalBookings) * 100 : 0}%` }}
                        />
                    </div>

                    {/* List */}
                    {checkedInList.length > 0 && (
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {checkedInList.map((person, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                    <div>
                                        <span className="text-white font-medium text-sm">{person.customer_name}</span>
                                        {person.company && <span className="text-gray-500 text-xs ml-2">— {person.company}</span>}
                                    </div>
                                    <span className="text-green-400/60 text-xs">
                                        {new Date(person.checked_in_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
