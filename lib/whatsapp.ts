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

    const nightsList = booking.selected_nights.join('\n• ');
    const formattedPhone = formatPhoneNumber(booking.phone);

    const message = `🌙 *Tha Majlis - Ramadan Nights 2026*

Assalamu Alaikum *${booking.customer_name}*! 🎉

Your booking has been confirmed! ✅

📋 *Booking Details:*
• Name: ${booking.customer_name}
• Industry: ${booking.industry}
• Total Paid: ${booking.total_amount} EGP

🌙 *Your Nights:*
• ${nightsList}

🎫 *Tickets:*
You will receive separate messages with your QR Code for each night shortly.

We can't wait to see you there! ✨

---
🎁 *SPECIAL OFFER: Get 10% OFF!*
Share your attendance on LinkedIn or Instagram using the image above and tag us @NextAcademy. 
Show the post at the gate to claim your discount coupon for future workshops! 🚀

#ThaMajlis #RamadanNights2026

_Questions? Just reply to this message._`;

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: formattedPhone,
                text: message
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
