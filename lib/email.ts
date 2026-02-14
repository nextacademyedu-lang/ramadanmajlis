
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingData {
    customer_name: string;
    email: string;
    phone: string;
    selected_nights: string[];
    [key: string]: any;
}

interface TicketData {
    night_date: string;
    qr_code: string;
}

export interface AgendaItem {
    time: string;
    title: string;
    speaker?: string;
    isHeader?: boolean;
}

// 1. WELCOME EMAIL (Immediate - No QR)
export async function sendWelcomeEmail(booking: BookingData) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured, skipping email.');
        return null;
    }

    const { data, error } = await resend.emails.send({
        from: 'Ramadan Majlis <welcome@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: 'Welcome to Ramadan Majlis 2026! 🌙',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #022c22; color: #ecfdf5; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #064e3b; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; color: #10b981; font-size: 24px;">Ramadan Majlis 2026</h1>
                </div>
                
                <div style="padding: 30px; text-align: center;">
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${booking.customer_name}</strong>,</p>
                    <p style="color: #d1fae5; line-height: 1.6;">Thank you for registering! We are thrilled to have you join us for this transformative experience.</p>
                    
                    <div style="background-color: #064e3b; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: left;">
                        <p style="margin: 0 0 10px; color: #6ee7b7; font-weight: bold;">Your Selected Nights:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #ecfdf5;">
                            ${booking.selected_nights.map(night => `<li style="margin-bottom: 5px;">${night}</li>`).join('')}
                        </ul>
                    </div>

                    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                        <em>Your official tickets with QR codes will be sent separately for each night.</em>
                    </p>
                </div>

                <div style="background-color: #064e3b; padding: 15px; text-align: center; font-size: 12px; color: #6ee7b7;">
                    <p style="margin: 0;">&copy; 2026 Next Academy. All rights reserved.</p>
                </div>
            </div>
        `,
    });

    if (error) {
        console.error('Email sending failed:', error);
        return null;
    }

    console.log('Welcome Email sent successfully:', data);
    return data;
}

// 2. TICKET EMAIL (Delayed/Separate - Specific Night QR)
export async function sendTicketEmail(booking: BookingData, ticket: TicketData, agenda: AgendaItem[] = [], locationUrl?: string, locationUrls?: { label: string; url: string }[]) {
    if (!process.env.RESEND_API_KEY) {
        return null;
    }

    // Generate Agenda HTML
    const agendaHtml = agenda.length > 0 
        ? agenda.map(item => {
            if (item.isHeader) {
                return `
                <div style="background-color: #065f46; color: #fcd34d; padding: 10px; font-weight: bold; font-size: 15px; border-radius: 6px; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${item.title}
                </div>`;
            }
            return `
            <div style="margin-bottom: 12px; border-bottom: 1px dashed rgba(16, 185, 129, 0.2); padding-bottom: 8px;">
                <span style="color: #f59e0b; font-weight: bold; font-size: 14px;">${item.time}</span>
                <p style="margin: 4px 0 2px; color: #ecfdf5; font-weight: bold;">${item.title}</p>
                ${item.speaker ? `<p style="margin: 0; color: #9ca3af; font-size: 13px;">ft. ${item.speaker}</p>` : ''}
            </div>`;
        }).join('')
        : `<p style="color: #9ca3af; font-style: italic;">Agenda details coming soon...</p>`;

    // Build location buttons - supports single URL or multiple labeled URLs
    let locationButton = '';
    if (locationUrls && locationUrls.length > 0) {
        locationButton = locationUrls.map(loc => `<div style="margin-top: 10px; text-align: center;">
             <a href="${loc.url}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #10b981; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid #10b981;">📍 ${loc.label}</a>
           </div>`).join('');
    } else if (locationUrl) {
        locationButton = `<div style="margin-top: 20px; text-align: center;">
             <a href="${locationUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #10b981; text-decoration: none; border-radius: 6px; font-weight: bold; border: 1px solid #10b981;">📍 View Location on Google Maps</a>
           </div>`;
    }

    const { data, error } = await resend.emails.send({
        from: 'Ramadan Majlis <tickets@ramadanmajlis.nextacademyedu.com>',
        to: [booking.email],
        subject: `Your Ticket - ${ticket.night_date} 🌙`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #022c22; color: #ecfdf5; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #064e3b; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; color: #10b981; font-size: 24px;">Ramadan Majlis 2026</h1>
                </div>
                
                <div style="padding: 30px; text-align: center;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Hello <strong>${booking.customer_name}</strong>,</p>
                    <p style="color: #d1fae5; margin-bottom: 25px;">Here is your ticket for the night of <strong>${ticket.night_date}</strong>.</p>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block; margin-bottom: 25px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.qr_code)}" alt="Event QR Code" width="200" height="200" />
                    </div>
                    
                    <p style="font-size: 14px; color: #9ca3af; margin-bottom: 30px;">Show this QR code at the entrance for check-in.</p>

                    <!-- Dynamic Agenda Section -->
                    <div style="text-align: left; background-color: #064e3b; padding: 20px; border-radius: 8px; margin-top: 10px;">
                        <h3 style="color: #f59e0b; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(245, 158, 11, 0.3); padding-bottom: 8px;">📋 Night Agenda</h3>
                        ${agendaHtml}
                        ${locationButton}
                    </div>

                </div>

                <div style="background-color: #064e3b; padding: 15px; text-align: center; font-size: 12px; color: #6ee7b7;">
                    <p style="margin: 0;">&copy; 2026 Next Academy. All rights reserved.</p>
                </div>
            </div>
        `,
    });

    if (error) {
        console.error('Email sending failed:', error);
        return null;
    }

    console.log('Ticket Email sent successfully:', data);
    return data;
}
