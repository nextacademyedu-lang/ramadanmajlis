const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-8da6.up.railway.app';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'RamadanEvent confirm';

interface BookingData {
    id: string;
    customer_name: string;
    email: string;
    phone: string;
    job_title: string;
    company?: string;
    industry: string;
    selected_nights: string[];
    total_amount: number;
    profile_image_url?: string;
}

interface TicketData {
    night_date: string;
    qr_code: string;
}

function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 20 (Egypt country code)
    if (cleaned.startsWith('0')) {
        cleaned = '20' + cleaned.substring(1);
    }
    
    // If doesn't start with country code, add Egypt's
    if (!cleaned.startsWith('20') && cleaned.length === 10) {
        cleaned = '20' + cleaned;
    }
    
    return cleaned;
}

export async function sendWhatsAppMessage(booking: BookingData) {
    if (!EVOLUTION_API_KEY) {
        console.warn('⚠️ EVOLUTION_API_KEY not configured, skipping WhatsApp');
        return null;
    }

    const formattedPhone = formatPhoneNumber(booking.phone);
    
    // Construct OG Image URL (dynamically generated personalized poster)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ramadanmajlis.nextacademyedu.com';
    const params = new URLSearchParams({
        name: booking.customer_name,
        title: booking.job_title,
        company: booking.company || '',
        industry: booking.industry,
        photo: booking.profile_image_url || ''
    });
    
    const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

    const caption = `Hello ${booking.customer_name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

Three transformative Thursday nights with 12 world-class experts, strategic networking over premium Suhoor, and hands-on learning circles.

📍 Night 1: Tolip Hotel, New Cairo | 🗓 Feb 28 – The Compass
📍 Night 2: Hyatt Regency, 6th October | 🗓 Mar 5 – The Resilience
📍 Night 3: Pyramisa Hotel, Dokki | 🗓 Mar 12 – The Legacy

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #TheMajlis #NextAcademy`;

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: formattedPhone,
                mediatype: 'image',
                media: imageUrl,
                caption: caption
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WhatsApp send error:', data);
            return null;
        }

        console.log(`✅ WhatsApp sent to ${formattedPhone}`, data);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp error:', error);
        return null;
    }
}

import { AgendaItem } from './email';

// ... (existing code)

// Function to send image (QR Code) via WhatsApp
export async function sendWhatsAppTicket(booking: BookingData, ticket: TicketData, nightTitle?: string, agenda: AgendaItem[] = [], locationUrl?: string) {
    if (!EVOLUTION_API_KEY) {
        return null;
    }

    const formattedPhone = formatPhoneNumber(booking.phone);
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`;

    const titlePart = nightTitle ? `\n🌟 *${nightTitle}*` : '';
    
    let agendaText = '';
    if (agenda && agenda.length > 0) {
        agendaText = '\n\n📋 *Night Agenda:*\n' + agenda.map(item => 
            `▫️ ${item.time} - *${item.title}*${item.speaker ? `\n   (ft. ${item.speaker})` : ''}`
        ).join('\n');
    }

    const locationPart = locationUrl ? `\n\n📍 *Location:* ${locationUrl}` : '';

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: formattedPhone,
                mediatype: 'image',
                media: qrCodeImageUrl,
                caption: `🎟️ *Your Ticket for ${ticket.night_date}*${titlePart}${agendaText}${locationPart}\n\nShow this QR code at the entrance!`
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ WhatsApp Ticket send error:', data);
            return null;
        }

        console.log(`✅ WhatsApp Ticket sent to ${formattedPhone}`, data);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp Ticket error:', error);
        return null;
    }
}
