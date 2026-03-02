"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, AlertCircle, CheckCircle2, Users, Calendar, MapPin, Ticket } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { INDUSTRIES } from '@/types';

const TICKET_PRICES: Record<number, number> = { 1: 2000, 2: 3500, 3: 4500 };

const attendeeSchema = z.object({
    fullName: z.string().min(2, "Name is too short").regex(/^[a-zA-Z\s]*$/, "English only"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone"),
    jobTitle: z.string().min(2, "Required").regex(/^[a-zA-Z\s]*$/, "English only"),
    company: z.string().min(2, "Required").regex(/^[a-zA-Z\s]*$/, "English only"),
    linkedin: z.string().url("Must be a valid URL").refine(v => v.includes("linkedin.com"), "Must be LinkedIn URL"),
    industry: z.string().min(1, "Required"),
});

type AttendeeData = z.infer<typeof attendeeSchema> & { photoUrl: string };

interface BookingFormProps {
    nights?: any[];
    packagePrice?: number;
    industries?: string[];
    initialPromoCode?: string;
}

export default function BookingForm({ industries = [], initialPromoCode = '' }: BookingFormProps) {
    const [step, setStep] = useState(1);
    const [ticketCount, setTicketCount] = useState(1);
    const [currentAttendee, setCurrentAttendee] = useState(0);
    const [attendees, setAttendees] = useState<AttendeeData[]>([]);
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState(initialPromoCode);
    const [promoApplied, setPromoApplied] = useState<{ id: string, type: string, value: number, code: string } | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors }, trigger, reset } = useForm<z.infer<typeof attendeeSchema>>({
        resolver: zodResolver(attendeeSchema),
    });

    const baseAmount = TICKET_PRICES[ticketCount] || 2000;
    let discountAmount = 0;
    if (promoApplied) {
        discountAmount = promoApplied.type === 'percentage'
            ? baseAmount * (promoApplied.value / 100)
            : promoApplied.value;
    }
    const totalAmount = Math.max(0, baseAmount - discountAmount);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { setError("File too large (max 20MB)"); return; }
        setUploading(true);
        setError(null);
        try {
            setPhotoUrl(URL.createObjectURL(file));
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('event-uploads').upload(`profile-photos/${fileName}`, file, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('event-uploads').getPublicUrl(`profile-photos/${fileName}`);
            setPhotoUrl(publicUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            setPhotoUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError(null);
        try {
            const res = await fetch('/api/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, selectedNights: [], isPackage: true })
            });
            const data = await res.json();
            if (data.valid) {
                setPromoApplied({ id: data.id, type: data.discount_type, value: data.discount_value, code: data.code });
            } else {
                setPromoError(data.message || "Invalid Code");
                setPromoApplied(null);
            }
        } catch {
            setPromoError("Failed to validate code");
        } finally {
            setPromoLoading(false);
        }
    };

    const saveCurrentAttendee = async () => {
        const valid = await trigger();
        if (!valid) return false;
        if (!photoUrl) { setError("Profile photo required"); return false; }
        const data = watch();
        const newAttendees = [...attendees];
        newAttendees[currentAttendee] = { ...data, photoUrl };
        setAttendees(newAttendees);
        return true;
    };

    const nextAttendee = async () => {
        const saved = await saveCurrentAttendee();
        if (!saved) return;
        setError(null);
        reset();
        setPhotoUrl(null);
        setCurrentAttendee(i => i + 1);
    };

    const goToPayment = async () => {
        const saved = await saveCurrentAttendee();
        if (!saved) return;
        setError(null);
        setStep(3);
    };

    const onSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const nightDate = '2026-03-12';
            const allBookingIds: string[] = [];

            for (const attendee of attendees) {
                const { data: booking, error: dbError } = await supabase
                    .from('bookings')
                    .insert({
                        customer_name: attendee.fullName,
                        email: attendee.email,
                        phone: attendee.phone,
                        job_title: attendee.jobTitle,
                        company: attendee.company,
                        linkedin_url: attendee.linkedin,
                        industry: attendee.industry,
                        selected_nights: [nightDate],
                        ticket_count: 1,
                        total_amount: attendee === attendees[0] ? totalAmount : 0,
                        payment_provider: 'easykash', // ALWAYS set to easykash to pass DB check "bookings_payment_provider_check"
                        payment_status: 'pending',
                        profile_image_url: attendee.photoUrl,
                        promo_code_id: attendee === attendees[0] ? promoApplied?.id || null : null,
                        discount_applied: attendee === attendees[0] ? discountAmount : 0,
                        group_booking_ref: null,
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;
                allBookingIds.push(booking.id);
            }

            // Save localStorage for success page
            const primary = attendees[0];
            localStorage.setItem('booking_name', primary.fullName);
            localStorage.setItem('booking_title', primary.jobTitle);
            localStorage.setItem('booking_company', primary.company);
            localStorage.setItem('booking_date', '12 Mar 2026');
            localStorage.setItem('booking_night_title', 'Grand Summit');
            localStorage.setItem('booking_location', 'Pyramisa Suites Hotel, Dokki');
            if (primary.photoUrl) localStorage.setItem('booking_photo', primary.photoUrl);

            // Link group bookings BEFORE confirming (vital for group free bookings)
            if (allBookingIds.length > 1) {
                await supabase.from('bookings').update({ group_booking_ref: allBookingIds[0] }).in('id', allBookingIds);
            }

            // Free booking
            if (totalAmount === 0) {
                // Confirming just the primary ID will confirm all group members automatically based on our group-booking logic
                const confirmResponse = await fetch('/api/confirm-free-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: allBookingIds[0] })
                });

                if (!confirmResponse.ok) {
                    console.error("Free booking confirm failed:", await confirmResponse.text());
                }

                window.location.href = `${window.location.origin}/success`;
                return;
            }

            const response = await fetch('/api/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: allBookingIds.join(','),
                    amount: totalAmount,
                    customer: {
                        first_name: primary.fullName.split(' ')[0],
                        last_name: primary.fullName.split(' ').slice(1).join(' ') || 'Customer',
                        email: primary.email,
                        phone: primary.phone
                    },
                    provider: 'easykash'
                })
            });

            const { paymentUrl, error: apiError } = await response.json();
            if (apiError) throw new Error(apiError);
            window.location.href = paymentUrl;

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const ticketOptions = [
        { count: 1, label: '1 Ticket' },
        { count: 2, label: '2 Tickets', discount: '12% OFF' },
        { count: 3, label: '3 Tickets', discount: '25% OFF' },
    ];

    return (
        <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Reserve Your Spot</CardTitle>
                <CardDescription>
                    {step === 1 && 'Select number of tickets'}
                    {step === 2 && `Attendee ${currentAttendee + 1} of ${ticketCount} details`}
                    {step === 3 && 'Review & Payment'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">

                    {/* STEP 1: TICKET COUNT */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                {ticketOptions.map(opt => (
                                    <div
                                        key={opt.count}
                                        onClick={() => setTicketCount(opt.count)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border p-4 text-center transition-all relative",
                                            opt.count === 2 && "ring-2 ring-emerald-500/60 scale-[1.04] z-10",
                                            ticketCount === opt.count
                                                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                        )}
                                    >
                                        {opt.count === 2 && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                Most Popular
                                            </div>
                                        )}
                                        {opt.discount && opt.count !== 2 && (
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {opt.discount}
                                            </div>
                                        )}
                                        {ticketCount === opt.count && <CheckCircle2 className="w-4 h-4 text-primary mx-auto mb-1" />}
                                        <div className="font-bold text-white">{opt.label}</div>
                                        {opt.discount && <div className="text-emerald-400 text-[10px] mt-0.5">{opt.discount}</div>}
                                    </div>
                                ))}
                            </div>

                            <div
                                onClick={() => window.open('https://wa.me/201505822735?text=' + encodeURIComponent('Hello, I need tickets for Ramadan Majlis Grand Summit (more than 3 tickets).'), '_blank')}
                                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 text-center hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center justify-center gap-2 text-white font-medium">
                                    <Users className="w-4 h-4 text-emerald-400" />
                                    <span>Group (4+ tickets)</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Contact us for special pricing</div>
                            </div>

                            <div className="bg-black/20 rounded-lg p-4 text-sm border border-white/5 space-y-1">
                                <div className="flex justify-between text-gray-300">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-amber-400" /> Date</span>
                                    <span className="text-white">12 Mar 2026</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Venue</span>
                                    <span className="text-white">Pyramisa Suites Hotel, Dokki</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-purple-400" /> Night</span>
                                    <span className="text-white">Grand Summit</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => { setCurrentAttendee(0); setAttendees([]); reset(); setPhotoUrl(null); setStep(2); }}>
                                    Next: Your Details
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: ATTENDEE DETAILS */}
                    {step === 2 && (
                        <motion.div key={`step2-${currentAttendee}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                            {ticketCount > 1 && (
                                <div className="flex gap-2 mb-2">
                                    {Array.from({ length: ticketCount }).map((_, i) => (
                                        <div key={i} className={cn("flex-1 h-1.5 rounded-full", i <= currentAttendee ? "bg-primary" : "bg-white/10")} />
                                    ))}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input {...register('fullName')} placeholder="John Doe" error={!!errors.fullName} />
                                    {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input {...register('email')} placeholder="john@example.com" error={!!errors.email} />
                                    {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input {...register('phone')} placeholder="+20 1xxxxxxxxx" error={!!errors.phone} />
                                    {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>LinkedIn URL</Label>
                                    <Input {...register('linkedin')} placeholder="https://linkedin.com/in/..." error={!!errors.linkedin} />
                                    {errors.linkedin && <p className="text-red-400 text-xs">{errors.linkedin.message}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Job Title</Label>
                                    <Input {...register('jobTitle')} placeholder="e.g. Senior Manager" error={!!errors.jobTitle} />
                                    {errors.jobTitle && <p className="text-red-400 text-xs">{errors.jobTitle.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input {...register('company')} placeholder="Company Name" error={!!errors.company} />
                                    {errors.company && <p className="text-red-400 text-xs">{errors.company.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Select value={watch('industry')} onValueChange={(val: string) => setValue('industry', val, { shouldValidate: true })}>
                                    <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {(industries.length > 0 ? industries : INDUSTRIES).map(ind => (
                                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.industry && <p className="text-red-400 text-xs">{errors.industry.message}</p>}
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Profile Photo <span className="text-xs text-muted-foreground">(Required for Networking)</span></Label>
                                <div className="flex items-center gap-4">
                                    {photoUrl ? (
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
                                            <Image src={photoUrl} alt="Profile" fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                                            <Upload className="w-6 h-6 opacity-50" />
                                        </div>
                                    )}
                                    <Input type="file" accept="image/*" onChange={handleFileUpload} className="w-auto cursor-pointer file:cursor-pointer" />
                                </div>
                                {uploading && <p className="text-xs text-primary animate-pulse">Uploading...</p>}
                            </div>

                            {error && (
                                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />{error}
                                </div>
                            )}

                            <div className="pt-4 flex justify-between">
                                <Button type="button" variant="ghost" onClick={() => {
                                    if (currentAttendee === 0) { setStep(1); } else { setCurrentAttendee(i => i - 1); reset(attendees[currentAttendee - 1]); setPhotoUrl(attendees[currentAttendee - 1]?.photoUrl || null); }
                                }}>Back</Button>
                                {currentAttendee < ticketCount - 1 ? (
                                    <Button type="button" onClick={nextAttendee} disabled={uploading}>
                                        Next Attendee →
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={goToPayment} disabled={uploading}>
                                        Next: Payment
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            <div className="glass p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Tickets</span>
                                    <span className="text-white">{ticketCount} ticket{ticketCount > 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">{baseAmount.toLocaleString()} EGP</span>
                                </div>
                                {promoApplied && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount ({promoApplied.code})</span>
                                        <span>- {discountAmount.toLocaleString()} EGP</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-bold text-primary">
                                    <span>Total</span>
                                    <span>{totalAmount.toLocaleString()} EGP</span>
                                </div>
                            </div>

                            {/* Attendees summary */}
                            <div className="space-y-2">
                                {attendees.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                        {a.photoUrl && <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50"><Image src={a.photoUrl} alt={a.fullName} fill className="object-cover" /></div>}
                                        <div>
                                            <div className="text-white text-sm font-medium">{a.fullName}</div>
                                            <div className="text-gray-400 text-xs">{a.jobTitle} · {a.company}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code */}
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <Label className="text-base font-semibold text-primary">Have a Promo Code? <span className="text-xs text-muted-foreground">(Optional)</span></Label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Input
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="ENTER CODE"
                                            disabled={!!promoApplied || promoLoading}
                                            className={cn("uppercase tracking-widest font-mono h-12", promoApplied ? "border-green-500 text-green-500 bg-green-500/10" : "")}
                                        />
                                        {promoApplied && <CheckCircle2 className="absolute right-3 top-3.5 text-green-500 w-5 h-5" />}
                                    </div>
                                    <Button type="button" onClick={handleApplyPromo} disabled={!promoCode || !!promoApplied || promoLoading} className="h-12 px-6 font-bold">
                                        {promoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : promoApplied ? "APPLIED" : "APPLY"}
                                    </Button>
                                </div>
                                {promoError && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{promoError}</p>}
                            </div>

                            {error && (
                                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />{error}
                                </div>
                            )}

                            <div className="pt-4 flex justify-between">
                                <Button type="button" variant="ghost" onClick={() => { setStep(2); setCurrentAttendee(ticketCount - 1); reset(attendees[ticketCount - 1]); setPhotoUrl(attendees[ticketCount - 1]?.photoUrl || null); }}>Back</Button>
                                <Button
                                    onClick={onSubmit}
                                    disabled={loading}
                                    className="w-[200px] h-12 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Booking"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
