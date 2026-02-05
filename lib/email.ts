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
    profile_image_url?: string;
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ramadanmajlis.nextacademyedu.com';

    const params = new URLSearchParams({
        name: booking.customer_name,
        title: booking.job_title,
        company: booking.company || '',
        industry: booking.industry,
        photo: booking.profile_image_url || ''
    });
    const socialImageUrl = `${appUrl}/api/og/social-share?${params.toString()}`;

    const shareCaption = `Officially registered for Ramadan Majlis 2026! 🌙 %0A%0AThree transformative Thursday nights with 12 world-class experts. %0A%0AJoin me: ${appUrl} %0A%0A#RamadanMajlis #RamadanNights2026`;
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${shareCaption}`;

    const { data, error } = await resend.emails.send({
        from: 'Ramadan Majlis <noreply@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: `🎉 Welcome to Ramadan Majlis - Booking Confirmed!`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; background: #022c22; color: #ecfdf5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #022c22; border: 1px solid #064e3b; border-radius: 20px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #064e3b; }
        .content { padding: 30px; }
        .details { background: rgba(6, 78, 59, 0.4); padding: 20px; border-radius: 15px; margin: 20px 0; border: 1px solid rgba(16, 185, 129, 0.2); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.1); }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #d1fae5; }
        .detail-value { color: #f59e0b; font-weight: bold; }
        .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 12px; border-top: 1px solid #064e3b; background: #012018; }
        .social-share { background: rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border: 1px solid rgba(245, 158, 11, 0.2); }
        .share-btn { background: #f59e0b; color: #022c22; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 15px; transition: opacity 0.2s; }
        .heading-text { color: #f59e0b; margin: 0; font-size: 24px; letter-spacing: -0.02em; }
        .text-muted { color: #d1fae5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${appUrl}/logo.svg" alt="Ramadan Majlis" width="180" style="display: block; margin: 0 auto 20px;" />
            <h1 class="heading-text">Booking Confirmed!</h1>
        </div>
        
        <div class="content">
            <p>Assalamu Alaikum <strong>${booking.customer_name}</strong>,</p>
            <p class="text-muted">We are thrilled to have you join us at <strong>Ramadan Majlis 2026</strong>!</p>
            <p class="text-muted">Your spot is secured. You will receive separate emails shortly containing your entry tickets (QR Codes) for each night you booked.</p>
            
            <div class="details">
                <h3 style="color: #f59e0b; margin-top: 0; font-size: 18px;">📋 Booking Summary</h3>
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
                <h3 style="color: #f59e0b; margin: 0 0 10px;">📣 Share the News!</h3>
                <p style="margin: 0; font-size: 14px; color: #d1fae5;">Let your network know you are attending Ramadan Majlis.</p>
                <div style="margin: 20px 0;">
                    <img src="${socialImageUrl}" alt="I'm Attending Ramadan Majlis" width="100%" style="border-radius: 10px; border: 1px solid rgba(245, 158, 11, 0.3);" />
                </div>
                <p style="font-style: italic; color: #9ca3af; font-size: 13px;">"I'm excited to attend Ramadan Majlis 2026! Join me accurately exploring the future of tech and business."</p>
                <a href="${linkedinUrl}" target="_blank" class="share-btn">Share on LinkedIn</a>
            </div>
            
            <p style="text-align: center; margin-top: 30px; color: #d1fae5;">
                Look out for your ticket emails next! 🎟️
            </p>
        </div>
        
        <div class="footer">
            <p style="color: #9ca3af; margin-bottom: 15px;">Powered by</p>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
                 <img src="${appUrl}/logo.svg" alt="Next Academy" height="30" />
                 <span style="color: #064e3b; font-size: 20px;">|</span>
                 <img src="${appUrl}/Eventocity.png" alt="Eventocity" height="30" />
            </div>
            <p style="margin-top: 20px; color: #4b5563;">© 2026 Next Academy | Ramadan Majlis</p>
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
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ramadanmajlis.nextacademyedu.com';

    // Generate QR code URL
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`;

    const { data, error } = await resend.emails.send({
        from: 'Ramadan Majlis <tickets@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: `🎟️ Your Ticket: ${ticket.night_date}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Arial', sans-serif; background: #022c22; color: #ecfdf5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #022c22; border: 1px solid #064e3b; border-radius: 20px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #064e3b; }
        .content { padding: 30px; text-align: center; }
        .qr-section { background: #ffffff; padding: 20px; border-radius: 15px; display: inline-block; margin: 20px 0; border: 4px solid #f59e0b; }
        .qr-section img { display: block; }
        .night-badge { background: #f59e0b; color: #022c22; padding: 8px 20px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 20px; font-size: 16px; }
        .agenda { background: rgba(6, 78, 59, 0.4); padding: 25px; border-radius: 15px; text-align: left; margin-top: 30px; border: 1px solid rgba(16, 185, 129, 0.2); }
        .agenda p { margin: 10px 0; color: #d1fae5; border-bottom: 1px dashed rgba(16, 185, 129, 0.2); padding-bottom: 10px; }
        .agenda p:last-child { border-bottom: none; }
        .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 12px; border-top: 1px solid #064e3b; background: #012018; }
        .heading-text { color: #f59e0b; margin: 0; font-size: 24px; letter-spacing: -0.02em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${appUrl}/logo.svg" alt="Ramadan Majlis" width="180" style="display: block; margin: 0 auto 20px;" />
            <h1 class="heading-text">Entry Ticket</h1>
            <p style="color: #10b981; margin: 10px 0 0; font-weight: bold;">${booking.customer_name}</p>
        </div>
        
        <div class="content">
            <div class="night-badge">📅 ${ticket.night_date}</div>
            
            <p style="color: #ecfdf5; font-size: 16px;">This is your official entry ticket.</p>
            <p style="color: #9ca3af; margin-top: 5px;">Please show this QR code at the gate.</p>
            
            <div class="qr-section">
                <img src="${qrCodeImageUrl}" alt="QR Code" width="250" height="250" />
            </div>

            <div class="agenda">
                <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 15px;">📋 Night Agenda</h3>
                <p>• 9:00 PM - Doors Open & Networking</p>
                <p>• 9:30 PM - Keynote Speaker</p>
                <p>• 10:30 PM - Panel Discussion</p>
                <p>• 11:30 PM - Suhoor & Networking</p>
            </div>
        </div>
        
        <div class="footer">
            <p style="color: #6b7280; font-family: monospace; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 5px; display: inline-block;">ID: ${ticket.qr_code}</p>
            <br/><br/>
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
                 <img src="${appUrl}/logo.svg" alt="Next Academy" height="25" />
                 <span style="color: #064e3b; font-size: 20px;">|</span>
                 <img src="${appUrl}/Eventocity.png" alt="Eventocity" height="25" />
            </div>
        </div>
    </div>
</body>
</html>
        `,
    });
    
    if (error) console.error('❌ Ticket email error:', error);
    return { data, error };
}
