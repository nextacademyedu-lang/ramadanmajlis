"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Upload, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { INDUSTRIES } from '@/types';

// Validation Schema
// Validation Schema
const formSchema = z.object({
    ticketType: z.enum(['single', 'package']),
    fullName: z.string()
        .min(2, "Name is too short")
        .regex(/^[a-zA-Z\s]*$/, "English characters only"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone number"),
    jobTitle: z.string()
        .min(2, "Required")
        .regex(/^[a-zA-Z\s]*$/, "English characters only"),
    company: z.string()
        .min(2, "Required")
        .regex(/^[a-zA-Z\s]*$/, "English characters only"),
    linkedin: z.string().url("Must be a valid URL").refine(
        (val) => val.includes("linkedin.com"),
        "Must be a LinkedIn URL"
    ),
    industry: z.string().min(1, "Please select an industry"),
    selectedNights: z.array(z.string()).optional(),
    paymentProvider: z.enum(['paymob_card', 'paymob_wallet']),
    walletPhone: z.string().optional(),
}).refine(data => {
    if (data.ticketType === 'single' && (!data.selectedNights || data.selectedNights.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Select at least one night",
    path: ["selectedNights"]
}).refine(data => {
    // Wallet phone is required when payment provider is wallet
    if (data.paymentProvider === 'paymob_wallet' && (!data.walletPhone || data.walletPhone.length < 10)) {
        return false;
    }
    return true;
}, {
    message: "Wallet phone number is required (min 10 digits)",
    path: ["walletPhone"]
});

type FormData = z.infer<typeof formSchema>;

interface Night {
    date: string;
    label?: string;
    title?: string;
    sub?: string;
    subtitle?: string;
    price?: number;
    id?: string;
    location?: string;
}

const NIGHTS: Night[] = [
    { date: "2026-03-20", label: "Night 1", sub: "Mar 20" },
    { date: "2026-03-21", label: "Night 2", sub: "Mar 21" },
    { date: "2026-03-22", label: "Night 3", sub: "Mar 22" },
];

interface BookingFormProps {
    nights?: Night[];
    packagePrice?: number;
    industries?: string[];
}

export default function BookingForm({ nights = [], packagePrice = 4999, industries = [] }: BookingFormProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Promo Code States
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState<{ id: string, type: string, value: number, code: string } | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        trigger
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ticketType: 'single',
            selectedNights: [],
            paymentProvider: 'paymob_card'
        }
    });

    const ticketType = watch('ticketType');
    const selectedNights = watch('selectedNights') || [];
    const paymentProvider = watch('paymentProvider');

    // Pricing
    // Determine base price from the first night or default to 1999
    const SINGLE_NIGHT_PRICE = nights.length > 0 ? Number(nights[0].price) : 1999;
    const FULL_PACKAGE_PRICE = Number(packagePrice);

    const baseAmount = ticketType === 'package' || (selectedNights.length === 3) // Use package price if 3 nights selected
        ? FULL_PACKAGE_PRICE
        : (selectedNights.length * SINGLE_NIGHT_PRICE);

    // Calculate Discount
    let discountAmount = 0;
    if (promoApplied) {
        if (promoApplied.type === 'percentage') {
            discountAmount = baseAmount * (promoApplied.value / 100);
        } else {
            discountAmount = promoApplied.value;
        }
    }

    // Ensure total doesn't go below 0
    const totalAmount = Math.max(0, baseAmount - discountAmount);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError(null);
        try {
            // Map Dates to IDs for verification
            let nightIds: string[] = [];
            const activeNights = nights.length > 0 ? nights : [];

            if (ticketType === 'package') {
                nightIds = activeNights.map((n: Night) => n.id).filter((id): id is string => !!id);
            } else {
                nightIds = selectedNights.map((date: string) => {
                    const n = activeNights.find((night: Night) => night.date === date);
                    return n && n.id ? n.id : date;
                }).filter(Boolean);
            }

            const res = await fetch('/api/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code: promoCode,
                    selectedNights: nightIds,
                    isPackage: ticketType === 'package'
                })
            });
            const data = await res.json();

            if (data.valid) {
                setPromoApplied({
                    id: data.id,
                    type: data.discount_type,
                    value: data.discount_value,
                    code: data.code
                });
                setPromoError(null);
            } else {
                setPromoError(data.message || "Invalid Code");
                setPromoApplied(null);
            }
        } catch (err) {
            console.error(err); // Log error to use the variable
            setPromoError("Failed to validate code");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            setError(null);
            const file = e.target.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) throw new Error("File too large (max 5MB)");

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `profile-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('event-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('event-uploads')
                .getPublicUrl(filePath);

            setPhotoUrl(publicUrl);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Upload failed";
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (!photoUrl) {
            setError("Please upload a profile photo");
            return;
        }
        setLoading(true);
        try {
            // 0. Re-validate Promo Code (if applied)
            if (promoApplied) {
                 // Re-calculate night IDs if needed (same logic as handleApplyPromo)
               let nightIds: string[] = [];
                if (data.ticketType === 'single') {
                    const activeNights = nights.length > 0 ? nights : NIGHTS;
                    nightIds = (data.selectedNights || []).map((date: string) => {
                        const n = activeNights.find((night: Night) => night.date === date);
                        return n && n.id ? n.id : date;
                    }).filter(Boolean);
                }

                const res = await fetch('/api/validate-promo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        code: promoApplied.code,
                        selectedNights: nightIds,
                        isPackage: data.ticketType === 'package'
                    })
                });
                const validationData = await res.json();

                if (!validationData.valid) {
                    throw new Error(validationData.message || "Promo code is no longer valid");
                }
            }

            // 1. Insert Booking
            const { data: booking, error: dbError } = await supabase
                .from('bookings')
                .insert({
                    customer_name: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    job_title: data.jobTitle,
                    company: data.company,
                    linkedin_url: data.linkedin,
                    industry: data.industry,
                    selected_nights: data.ticketType === 'package' ? ['ALL'] : data.selectedNights,
                    ticket_count: 1,
                    total_amount: totalAmount,
                    payment_provider: totalAmount === 0 ? 'paymob_card' : data.paymentProvider, // 'free_tier' is NOT in DB constraint, use valid value
                    payment_status: totalAmount === 0 ? 'paid' : 'pending',
                    profile_image_url: photoUrl,
                    // Add Promo Info
                    promo_code_id: promoApplied?.id || null,
                    discount_applied: discountAmount
                })
                .select()
                .single();

            if (dbError) throw dbError;

            // 2. Redirect to Payment
            // Save data for Ticket generation on Success page
            let dateStr = 'Ramadan 2026';
            let nightTitle = 'All Nights Access';
            let location = 'Creativa Innovation Hub'; // Default

            if (data.ticketType === 'single' && data.selectedNights && data.selectedNights.length > 0) {
                const selectedDate = data.selectedNights[0];
                const firstNight = new Date(selectedDate);
                dateStr = format(firstNight, 'd MMM yyyy');

                // Find the night object from props
                const nightObj = nights.find((n: Night) => n.date === selectedDate);
                if (nightObj) {
                    nightTitle = nightObj.title || nightTitle;
                    location = nightObj.location || location; // Use DB location, fall back to default if null
                }
            } else {
                dateStr = 'Full Package';
                location = 'Creativa Hub, Giza'; // Or some generic location for the package
                // Check if we have specific locations for package? for now default is fine.
            }

            localStorage.setItem('booking_name', data.fullName);
            localStorage.setItem('booking_title', data.jobTitle);
            localStorage.setItem('booking_company', data.company);
            localStorage.setItem('booking_date', dateStr);
            localStorage.setItem('booking_night_title', nightTitle);
            localStorage.setItem('booking_location', location);

            if (photoUrl) {
                localStorage.setItem('booking_photo', photoUrl);
            }

            // -- FREE BOOKING BYPASS --
            if (totalAmount === 0) {
                // Confirm free booking and send notifications
                try {
                    await fetch('/api/confirm-free-booking', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: booking.id })
                    });
                } catch (err) {
                    console.error('Failed to confirm free booking:', err);
                }
                window.location.href = `${window.location.origin}/success`;
                return;
            }

            const response = await fetch('/api/create-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: booking.id,
                    amount: totalAmount,
                    customer: {
                        first_name: data.fullName.split(' ')[0],
                        last_name: data.fullName.split(' ').slice(1).join(' ') || 'Customer',
                        email: data.email,
                        phone: data.paymentProvider === 'paymob_wallet' ? data.walletPhone! : data.phone
                    },
                    provider: data.paymentProvider
                })
            });

            const { paymentUrl, error: apiError } = await response.json();
            if (apiError) throw new Error(apiError);

            // Redirect
            window.location.href = paymentUrl;

        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            valid = await trigger(['selectedNights']);
        } else if (step === 2) {
            valid = await trigger(['fullName', 'email', 'phone', 'jobTitle', 'company', 'linkedin', 'industry']);
            if (!photoUrl) { setError("Profile photo required"); valid = false; }
        }

        if (valid) {
            setError(null);
            setStep(s => s + 1);
        }
    };

    return (
        <Card className="border-primary/20 bg-black/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">Reserve Your Spot</CardTitle>
                <CardDescription>Step {step} of 3</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: NIGHT SELECTION */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                {/* Ticket Type Toggle */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setValue('ticketType', 'single')}
                                        className={cn(
                                            "py-2 rounded-md text-sm font-medium transition-all",
                                            ticketType === 'single' ? "bg-primary text-black shadow-lg" : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        Single Night
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setValue('ticketType', 'package');
                                            setValue('selectedNights', []);
                                        }}
                                        className={cn(
                                            "py-2 rounded-md text-sm font-medium transition-all",
                                            ticketType === 'package' ? "bg-amber-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        Full Package (Save 20%)
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {ticketType === 'single' ? (
                                        <>
                                            <Label className="flex justify-between items-center">
                                                <span>Select Nights ({SINGLE_NIGHT_PRICE.toLocaleString()} EGP / Night)</span>
                                                <span className="text-xs text-primary font-normal">(Select one or more)</span>
                                            </Label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {(nights.length > 0 ? nights : NIGHTS).map((night: Night) => (
                                                    <div
                                                        key={night.date}
                                                        onClick={() => {
                                                            const current = selectedNights || [];
                                                            const newSelection = current.includes(night.date)
                                                                ? current.filter((d: string) => d !== night.date)
                                                                : [...current, night.date];
                                                            setValue('selectedNights', newSelection);
                                                        }}
                                                        className={cn(
                                                            "relative cursor-pointer rounded-lg border p-4 text-center transition-all hover:bg-primary/5",
                                                            selectedNights?.includes(night.date)
                                                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                                                                : "border-white/10 bg-white/5 text-gray-400"
                                                        )}
                                                    >
                                                        {selectedNights?.includes(night.date) && (
                                                            <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-200">
                                                                <CheckCircle2 size={16} />
                                                            </div>
                                                        )}
                                                        <div className="font-bold text-lg">{night.title || night.label}</div>
                                                        <div className="text-sm text-emerald-400 font-medium mb-1">
                                                            {format(new Date(night.date), 'd MMM yyyy')}
                                                        </div>
                                                        <div className="text-xs opacity-70">{night.subtitle}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.selectedNights && <p className="text-red-400 text-sm">{errors.selectedNights.message}</p>}
                                        </>
                                    ) : (
                                        <div className="p-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 text-center space-y-2">
                                            <div className="text-amber-400 font-bold text-xl">VIP Full Access</div>
                                            <p className="text-sm text-gray-300">Access to all 3 nights + Exclusive Networking + Priority Seating</p>
                                            <div className="text-2xl font-bold text-white pt-2">{FULL_PACKAGE_PRICE.toLocaleString()} EGP <span className="text-sm text-gray-500 line-through">{(SINGLE_NIGHT_PRICE * 3).toLocaleString()} EGP</span></div>
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Location Preview */}
                                <div className="bg-black/20 rounded-lg p-4 text-sm space-y-2 border border-white/5">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-bold">Locations & Dates</span>
                                    </div>
                                    {ticketType === 'package' ? (
                                        (nights.length > 0 ? nights : NIGHTS).map((night: Night) => (
                                            <div key={night.date} className="flex justify-between items-center text-gray-300">
                                                <span>{format(new Date(night.date), 'd MMM')}: {night.title}</span>
                                                <span className="text-white opacity-80">{night.location || 'Creativa Hub'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        selectedNights.length > 0 ? (
                                            selectedNights.sort().map((date: string) => {
                                                const n = (nights.length > 0 ? nights : NIGHTS).find((night: Night) => night.date === date);
                                                return (
                                                    <div key={date} className="flex justify-between items-center text-gray-300">
                                                        <span>{format(new Date(date), 'd MMM')}: {n?.title}</span>
                                                        <span className="text-white opacity-80">{n?.location || 'Creativa Hub'}</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-gray-500 italic">Select a night to see location details</div>
                                        )
                                    )}
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button type="button" onClick={nextStep} disabled={ticketType === 'single' && !selectedNights?.length}>
                                        Next: Your Details
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: DETAILS & PHOTO */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            {...register('fullName')}
                                            englishOnly={true}
                                            placeholder="John Doe"
                                        />
                                        {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input {...register('email')} englishOnly={true} placeholder="john@example.com" />
                                        {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input {...register('phone')} placeholder="+20 1xxxxxxxxx" />
                                        {errors.phone && <p className="text-red-400 text-xs">{errors.phone.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>LinkedIn URL</Label>
                                        <Input {...register('linkedin')} englishOnly={true} placeholder="https://linkedin.com/in/..." />
                                        {errors.linkedin && <p className="text-red-400 text-xs">{errors.linkedin.message}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Job Title</Label>
                                        <Input
                                            {...register('jobTitle')}
                                            englishOnly={true}
                                            placeholder="e.g. Senior Manager"
                                        />
                                        {errors.jobTitle && <p className="text-red-400 text-xs">{errors.jobTitle.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company</Label>
                                        <Input
                                            {...register('company')}
                                            englishOnly={true}
                                            placeholder="Company Name"
                                        />
                                        {errors.company && <p className="text-red-400 text-xs">{errors.company.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Select 
                                        value={watch('industry')} 
                                        onValueChange={(val: string) => {
                                            setValue('industry', val, { shouldValidate: true });
                                        }}
                                    >
                                        <SelectTrigger>
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
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="w-auto flex-1 cursor-pointer file:cursor-pointer"
                                        />
                                    </div>
                                    {uploading && <p className="text-xs text-primary animate-pulse">Uploading...</p>}
                                </div>

                                <div className="pt-4 flex justify-between">
                                    <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                    <Button type="button" onClick={nextStep} disabled={uploading}>Next: Payment</Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PAYMENT & CONFIRM */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="glass p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Package</span>
                                        <span className="text-white capitalize">{ticketType === 'package' ? 'Full Access' : `${selectedNights.length} Night(s)`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span className="text-white">{baseAmount.toLocaleString()} EGP</span>
                                    </div>

                                    {/* Discount Row */}
                                    {promoApplied && (
                                        <div className="flex justify-between text-sm text-green-400 animate-pulse">
                                            <span>Discount ({promoApplied.code})</span>
                                            <span>- {discountAmount.toLocaleString()} EGP</span>
                                        </div>
                                    )}

                                    <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-lg font-bold text-primary">
                                        <span>Total</span>
                                        <span>{totalAmount.toLocaleString()} EGP</span>
                                    </div>
                                </div>

                                {/* Promo Code Input */}
                                <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                                    <Label className="text-base font-semibold text-primary flex items-center gap-2">
                                        Have a Promo Code?
                                        <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                                    </Label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Input
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                                englishOnly={true}
                                                placeholder="ENTER CODE"
                                                disabled={!!promoApplied || promoLoading}
                                                className={cn(
                                                    "uppercase text-lg h-12 tracking-widest font-mono transition-all",
                                                    promoApplied ? "border-green-500 text-green-500 bg-green-500/10" : "bg-black/40 focus:ring-primary/50"
                                                )}
                                            />
                                            {promoApplied && <CheckCircle2 className="absolute right-3 top-3.5 text-green-500 w-5 h-5" />}
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleApplyPromo}
                                            disabled={!promoCode || !!promoApplied || promoLoading}
                                            variant={promoApplied ? "outline" : "default"}
                                            className={cn(
                                                "h-12 px-8 font-bold text-lg min-w-[120px] transition-all duration-300",
                                                promoApplied 
                                                    ? "border-green-500 text-green-500 hover:text-green-400 hover:bg-green-500/10" 
                                                    : "bg-primary text-black hover:bg-amber-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                                            )}
                                        >
                                            {promoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (promoApplied ? "APPLIED" : "APPLY")}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5 px-1">
                                        <span className="text-amber-400 text-sm">💡</span> 
                                        <span>Hint: Check our social media for exclusive codes!</span>
                                    </p>
                                    {promoError && (
                                        <motion.p 
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm font-medium bg-red-500/10 p-2 rounded border border-red-500/20 flex items-center gap-2"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {promoError}
                                        </motion.p>
                                    )}
                                </div>


                                <div className="space-y-3">
                                    <Label>Payment Method</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setValue('paymentProvider', 'paymob_card')}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-4 text-center transition-all",
                                                paymentProvider === 'paymob_card'
                                                    ? "border-primary bg-primary/20 text-white"
                                                    : "border-white/10 bg-white/5 opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <div className="font-bold">Card</div>
                                            <div className="text-xs">Paymob</div>
                                        </div>
                                        <div
                                            onClick={() => setValue('paymentProvider', 'paymob_wallet')}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-4 text-center transition-all",
                                                paymentProvider === 'paymob_wallet'
                                                    ? "border-primary bg-primary/20 text-white"
                                                    : "border-white/10 bg-white/5 opacity-50 hover:opacity-100"
                                            )}
                                        >
                                            <div className="font-bold">Wallet</div>
                                            <div className="text-xs">Vodafone/Etisalat</div>
                                        </div>
                                    </div>

                                    {/* Wallet Phone Input - Only shown when wallet is selected */}
                                    {paymentProvider === 'paymob_wallet' && (
                                        <div className="mt-4 space-y-2 p-4 rounded-lg border border-primary/30 bg-primary/5">
                                            <Label className="flex items-center gap-2">
                                                <span>رقم المحفظة</span>
                                                <span className="text-xs text-primary">(Wallet Number)</span>
                                            </Label>
                                            <Input
                                                {...register('walletPhone')}
                                                placeholder="01xxxxxxxxx"
                                                className="text-lg tracking-wider"
                                            />
                                            <p className="text-xs text-gray-400">
                                                أدخل رقم التليفون المسجل عليه المحفظة (فودافون كاش / اتصالات كاش / اورانج كاش)
                                            </p>
                                            {errors.walletPhone && <p className="text-red-400 text-xs">{errors.walletPhone.message}</p>}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-between">
                                    <Button type="button" variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                    <Button type="submit" disabled={loading} className="w-1/2 bg-gradient-to-r from-primary to-amber-500 text-black font-bold">
                                        {loading ? <Loader2 className="animate-spin" /> : "Complete Booking"}
                                    </Button>
                                </div>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </form>
            </CardContent>
        </Card>
    );
}
