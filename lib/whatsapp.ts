// Read env vars at call time, not module load time, to avoid stale/missing values
function getEvolutionConfig() {
    return {
        url: process.env.EVOLUTION_API_URL || 'https://evolution-api-production-da45.up.railway.app',
        key: process.env.EVOLUTION_API_KEY,
        instance: process.env.EVOLUTION_INSTANCE_NAME || 'RamadanEvent confirm',
    };
}

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
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1);
    if (!cleaned.startsWith('20') && cleaned.length === 10) cleaned = '20' + cleaned;
    return cleaned;
}

export async function sendWhatsAppMessage(
    booking: BookingData,
    nightTitle: string,
    nightDate: string,
    nightLocation: string,
    locationUrl: string
) {
    const config = getEvolutionConfig();
    console.log('📱 WhatsApp config:', { url: config.url, hasKey: !!config.key, instance: config.instance });
    if (!config.key) {
        console.error('🚨🚨🚨 EVOLUTION_API_KEY is MISSING! WhatsApp will NOT send. Add it to Vercel env vars!');
        return null;
    }

    const formattedPhone = formatPhoneNumber(booking.phone);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ramadanmajlis.nextacademyedu.com';
    const params = new URLSearchParams({
        name: booking.customer_name,
        title: booking.job_title,
        company: booking.company || '',
        industry: booking.industry,
        photo: booking.profile_image_url || ''
    });

    const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;
    const formattedDate = new Date(nightDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const caption = `Hello ${booking.customer_name},

🌟 Share this poster with the caption below on social media to unlock *10% OFF* your next booking!

Officially registered for Ramadan Majlis 2026! 🌙

One epic night combining strategic vision, financial resilience, AI operations, and legacy building — with panels, networking, learning circles, and Suhoor.

📍 ${nightTitle}: ${nightLocation} | 🗓 ${formattedDate}
🗺 Location: ${locationUrl}

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1


#RamadanMajlis2026 #GrandSummit #NextAcademy`;

    try {
        const response = await fetch(`${config.url}/message/sendMedia/${config.instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': config.key },
            body: JSON.stringify({ number: formattedPhone, mediatype: 'image', media: imageUrl, caption })
        });
        const data = await response.json();
        if (!response.ok) { console.error('❌ WhatsApp send error:', data); return null; }
        console.log(`✅ WhatsApp sent to ${formattedPhone}`);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp error:', error);
        return null;
    }
}

import { AgendaItem } from './email';

export async function sendWhatsAppTicket(
    booking: BookingData,
    ticket: TicketData,
    nightTitle?: string,
    agenda: AgendaItem[] = [],
    locationUrl?: string
) {
    const config = getEvolutionConfig();
    if (!config.key) {
        console.error('🚨🚨🚨 EVOLUTION_API_KEY is MISSING! WhatsApp Ticket will NOT send. Add it to Vercel env vars!');
        return null;
    }

    const formattedPhone = formatPhoneNumber(booking.phone);
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`;
    const titlePart = nightTitle ? `\n🌟 *${nightTitle}*` : '';

    let agendaText = '';
    if (agenda.length > 0) {
        agendaText = '\n\n📋 *Night Agenda:*\n' + agenda.map(item =>
            `▫️ ${item.time} - *${item.title}*${item.speaker ? `\n   (ft. ${item.speaker})` : ''}`
        ).join('\n');
    }

    const locationPart = locationUrl ? `\n\n📍 *Location:* ${locationUrl}` : '';

    try {
        const response = await fetch(`${config.url}/message/sendMedia/${config.instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': config.key },
            body: JSON.stringify({
                number: formattedPhone,
                mediatype: 'image',
                media: qrCodeImageUrl,
                caption: `🎟️ *Your Ticket - ${nightTitle || ticket.night_date}*${titlePart}${agendaText}${locationPart}\n\nShow this QR code at the entrance!`
            })
        });
        const data = await response.json();
        if (!response.ok) { console.error('❌ WhatsApp Ticket error:', data); return null; }
        console.log(`✅ WhatsApp Ticket sent to ${formattedPhone}`);
        return data;
    } catch (error) {
        console.error('❌ WhatsApp Ticket error:', error);
        return null;
    }
}
