"use client";

import BookingForm from '@/components/BookingForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminNewBookingPage() {
    const [industries, setIndustries] = useState<string[]>([]);

    useEffect(() => {
        const fetchIndustries = async () => {
            const { data } = await supabase.from('industries').select('name').order('name');
            if (data) setIndustries(data.map((i: { name: string }) => i.name));
        };
        fetchIndustries();
    }, []);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Add New Booking (Admin)</h1>
            </div>

            <BookingForm
                industries={industries}
                isAdmin={true}
            />
        </div>
    );
}
