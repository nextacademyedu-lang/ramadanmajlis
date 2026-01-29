"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, MapPin, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScannerPage() {
    const [scanInput, setScanInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        } catch (err) {
            setError("Network Error");
        } finally {
            setLoading(false);
            setScanInput(''); // Clear for next scan
        }
    };

    const handleCheckIn = async () => {
        if (!result) return;
        // Call API to update status to 'checked_in' (To be implemented if needed)
        alert("Check-in Logged! (Future Feature)");
        setResult(null); // Reset for next person
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
                                style={{ backgroundColor: result.industry?.color_code || '#333' }}
                            />

                            <CardContent className="relative z-10 p-0">
                                {/* Header: Industry & Zone (The most important part for Ushering) */}
                                <div
                                    className="p-8 text-center text-black"
                                    style={{ backgroundColor: result.industry?.color_code || '#fff' }}
                                >
                                    <h2 className="text-4xl font-black uppercase tracking-wider mb-2">
                                        {result.industry?.name || result.booking.industry || "General"}
                                    </h2>
                                    <div className="inline-flex items-center gap-2 bg-black/20 text-black px-4 py-1 rounded-full font-bold text-lg">
                                        <MapPin size={20} />
                                        {result.industry?.zone_name || "General Area"}
                                    </div>
                                </div>

                                {/* Attendee Details */}
                                <div className="p-8 bg-black/90 backdrop-blur-xl border-t border-white/10">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="shrink-0">
                                            {result.booking.profile_image_url ? (
                                                <img
                                                    src={result.booking.profile_image_url}
                                                    alt="Profile"
                                                    className="w-32 h-32 rounded-full border-4 border-white/10 object-cover"
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                                                    <User size={48} className="opacity-50" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <h3 className="text-3xl font-bold text-white">{result.booking.customer_name}</h3>
                                            <div className="text-xl text-primary font-medium">{result.booking.job_title}</div>
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                                                <Building2 size={16} />
                                                {result.booking.company}
                                            </div>

                                            <div className="pt-4 flex items-center justify-center md:justify-start gap-3">
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${result.booking.payment_status === 'paid'
                                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                    }`}>
                                                    {result.booking.payment_status?.toUpperCase()}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Ticket: {result.booking.ticket_count} | Total: {result.booking.total_amount} EGP
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                        <Button
                                            onClick={handleCheckIn}
                                            className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-bold text-lg py-6"
                                        >
                                            <CheckCircle2 className="mr-2" />
                                            Confirm Check-in
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
