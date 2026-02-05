import { Resend } from 'resend';

// Initialize Resend lazily to prevent build errors if env var is missing
const getResendClient = () => {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
};

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

// 1. WELCOME EMAIL (Immediate - No QR, Social Share focus)
export async function sendWelcomeEmail(booking: BookingData) {
    const resend = getResendClient();
    if (!resend) return null;

    const nightsList = booking.selected_nights
        .map((n: string) => `• ${n}`)
        .join('\n');

    const { data, error } = await resend.emails.send({
        from: 'Tha Majlis <noreply@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: `🎉 Welcome to Tha Majlis - Booking Confirmed!`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(90deg, #d4af37, #f4d03f); padding: 30px; text-align: center; }
        .header h1 { color: #000; margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .details { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .detail-label { color: #888; }
        .detail-value { color: #d4af37; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .social-share { background: rgba(212,175,55,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .share-btn { background: #d4af37; color: #000; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 Tha Majlis - Ramadan Nights</h1>
            <p style="color: #333; margin: 10px 0 0;">Booking Confirmed!</p>
        </div>
        
        <div class="content">
            <p>Assalamu Alaikum <strong>${booking.customer_name}</strong>,</p>
            <p>We are thrilled to have you join us at <strong>Tha Majlis - Ramadan Nights 2026</strong>!</p>
            <p>Your spot is secured. You will receive separate emails shortly containing your entry tickets (QR Codes) for each night you booked.</p>
            
            <div class="details">
                <h3 style="color: #d4af37; margin-top: 0;">📋 Booking Summary</h3>
                <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${booking.customer_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nights Booked</span>
                    <span class="detail-value" style="white-space: pre-line;">${nightsList}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Paid</span>
                    <span class="detail-value">${booking.total_amount} EGP</span>
                </div>
            </div>

            <div class="social-share">
                <h3 style="color: #d4af37; margin: 0 0 10px;">📣 Share the News!</h3>
                <p style="margin: 0; font-size: 14px; color: #ccc;">Let your network know you are attending Tha Majlis.</p>
                <div style="margin: 20px 0;">
                    <img src="https://nextacademy.edu.eg/og-ramadan.png" alt="I'm Attending Tha Majlis" width="100%" style="border-radius: 10px;" />
                </div>
                <p style="font-style: italic; color: #888; font-size: 12px;">"I'm excited to attend Tha Majlis - Ramadan Nights 2026! Join me accurately exploring the future of tech and business."</p>
                <a href="https://linkedin.com" class="share-btn">Share on LinkedIn</a>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                Look out for your ticket emails next! 🎟️
            </p>
        </div>
        
        <div class="footer">
            <p>© 2026 Next Academy | Tha Majlis - Ramadan Nights</p>
        </div>
    </div>
</body>
</html>
        `,
    });

    if (error) console.error('❌ Welcome email error:', error);
    return { data, error };
}

// 2. TICKET EMAIL (Delayed/Separate - Specific Night QR)
export async function sendTicketEmail(booking: BookingData, ticket: TicketData) {
    const resend = getResendClient();
    if (!resend) return null;

    // Generate QR code URL
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`;

    const { data, error } = await resend.emails.send({
        from: 'Tha Majlis <tickets@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: `🎟️ Your Ticket: ${ticket.night_date}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(90deg, #d4af37, #f4d03f); padding: 30px; text-align: center; }
        .header h1 { color: #000; margin: 0; font-size: 24px; }
        .content { padding: 30px; text-align: center; }
        .qr-section { background: #fff; padding: 20px; border-radius: 15px; display: inline-block; margin: 20px 0; }
        .qr-section img { display: block; }
        .night-badge { background: #d4af37; color: #000; padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 20px; }
        .agenda { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; text-align: left; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌙 Entry Ticket</h1>
            <p style="color: #333; margin: 5px 0 0;">${booking.customer_name}</p>
        </div>
        
        <div class="content">
            <div class="night-badge">📅 ${ticket.night_date}</div>
            
            <p>This is your official entry ticket for <strong>${ticket.night_date}</strong>.</p>
            <p>Please show this QR code at the gate.</p>
            
            <div class="qr-section">
                <img src="${qrCodeImageUrl}" alt="QR Code" width="250" height="250" />
            </div>

            <div class="agenda">
                <h3 style="color: #d4af37; margin-top: 0;">📋 Night Agenda</h3>
                <p>• 9:00 PM - Doors Open & Networking</p>
                <p>• 9:30 PM - Keynote Speaker</p>
                <p>• 10:30 PM - Panel Discussion</p>
                <p>• 11:30 PM - Suhoor & Networking</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Ticket ID: ${ticket.qr_code}</p>
            <p>© 2026 Next Academy</p>
        </div>
    </div>
</body>
</html>
        `,
    });

    if (error) console.error('❌ Ticket email error:', error);
    return { data, error };
}
