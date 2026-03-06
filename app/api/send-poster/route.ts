
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-8da6.up.railway.app';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'RamadanMajlis';

function formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '20' + cleaned.substring(1);
    }
    if (!cleaned.startsWith('20') && cleaned.length === 10) {
        cleaned = '20' + cleaned;
    }
    return cleaned;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('id');

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing booking id' }, { status: 400 });
        }

        // Fetch booking
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const formattedPhone = formatPhoneNumber(booking.phone);

        // Always use production URL for poster
        const baseUrl = 'https://ramadanmajlis.nextacademyedu.com';
        const params = new URLSearchParams({
            name: (booking.customer_name || '').trim(),
            title: (booking.job_title || '').trim(),
            company: (booking.company || '').trim(),
            industry: (booking.industry || '').trim(),
            photo: (booking.profile_image_url || '').trim()
        });

        const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

        const caption = `Hello ${booking.customer_name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

Three transformative Thursday nights with 12 world-class experts, strategic networking over premium Suhoor, and hands-on learning circles.

📍 Night 1: Tolip Hotel, New Cairo | 🗓 Feb 28 – The Compass
📍 Night 2: Hyatt Regency, 6th October | 🗓 Mar 5 – The Resilience
📍 Night 3: Pyramisa Suites Hotel, Dokki | 🗓 Mar 12 – The Legacy

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #TheMajlis #NextAcademy`;

        const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY!
            },
            body: JSON.stringify({
                number: formattedPhone,
                mediatype: 'image',
                media: imageUrl,
                caption: caption
            })
        });

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            customer: booking.customer_name,
            phone: formattedPhone,
            imageUrl: imageUrl,
            apiResponse: data
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
