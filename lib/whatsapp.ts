const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://evolution-api-production-8da6.up.railway.app';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'ramadan-majlis';

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
    // We use the production URL base if available, starting with nextacademyedu.com
    // Since we are server-side, we should use a public URL. 
    // If running locally, this might fail to render if standard localhost is used, but for prod implies public.
    // However, for the webhook to generate it, it needs to hit the API.
    // The safest way for Evolution API to fetch it is a public URL.
    // If not deployed yet, this image won't load for the user.
    // But assuming the user is verifying on production (or using ngrok/tunnel):
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ramadanmajlis.nextacademyedu.com';
    const params = new URLSearchParams({
        name: booking.customer_name,
        title: booking.job_title,
        company: booking.company || '',
        industry: booking.industry,
        // photo: booking.profile_image_url // If we had this. For now, let it fallback to icon.
    });
    
    // Using a reliable public example or the actual production one if available
    const imageUrl = `${baseUrl}/api/og/social-share?${params.toString()}`;

    const caption = `Officially registered for Ramadan Majlis 2026! 🌙

Three transformative Thursday nights with 12 world-class experts, strategic networking over premium Suhoor, and hands-on learning circles.

📍  Tolip Hotel, New Cairo | 📅 Feb 26 - The Compass

I'm excited to attend Tha Majlis - Ramadan Nights 2026! Join me accurately exploring the future of tech and business.

#ThaMajlis #RamadanNights2026 #NextAcademy`;

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

// Function to send image (QR Code) via WhatsApp
export async function sendWhatsAppTicket(booking: BookingData, ticket: TicketData) {
    if (!EVOLUTION_API_KEY) {
        return null;
    }

    const formattedPhone = formatPhoneNumber(booking.phone);
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`;

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
                caption: `🎟️ *Ticket for ${ticket.night_date}*\n\nShow this QR code at the entrance!`
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
