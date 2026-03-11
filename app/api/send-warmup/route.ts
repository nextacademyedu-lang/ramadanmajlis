import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const NIGHT_TITLE = 'Grand Summit';
const NIGHT_DATE = '2026-03-12';
const NIGHT_LOCATION = 'Pyramisa Suites Hotel, Dokki';
const NIGHT_LOCATION_URL = 'https://maps.app.goo.gl/aU81FrqETdqqM7Mh8';

function buildWarmupEmail(name: string) {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #022c22; color: #ecfdf5; border-radius: 16px; overflow: hidden;">
        
        <!-- Header with fire emoji -->
        <div style="background: linear-gradient(135deg, #064e3b 0%, #0f766e 100%); padding: 30px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">⏳🔥</div>
            <h1 style="margin: 0; color: #fbbf24; font-size: 28px; letter-spacing: 1px;">Less Than 48 Hours!</h1>
            <p style="margin: 8px 0 0; color: #6ee7b7; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Ramadan Majlis 2026</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 35px 30px; text-align: center;">
            <p style="font-size: 20px; margin-bottom: 5px; color: #d1fae5;">Hello <strong style="color: #fbbf24;">${name}</strong>,</p>
            <p style="color: #a7f3d0; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
                We are so excited to see you! The <strong>Grand Summit</strong> is just around the corner. 
                Get ready for an unforgettable night of learning, networking, and premium Suhoor! 🌙
            </p>
            
            <!-- Event Details Card -->
            <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); padding: 25px; border-radius: 12px; text-align: left; margin-bottom: 25px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <h3 style="color: #fbbf24; margin: 0 0 18px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">📋 Event Details</h3>
                
                <div style="margin-bottom: 14px;">
                    <span style="color: #6ee7b7; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🌙 Event</span>
                    <p style="margin: 4px 0 0; color: #ecfdf5; font-size: 16px; font-weight: bold;">${NIGHT_TITLE} — The Legacy</p>
                </div>
                
                <div style="margin-bottom: 14px;">
                    <span style="color: #6ee7b7; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Date</span>
                    <p style="margin: 4px 0 0; color: #ecfdf5; font-size: 16px; font-weight: bold;">Thursday, 12 March 2026</p>
                </div>
                
                <div style="margin-bottom: 14px;">
                    <span style="color: #6ee7b7; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🕘 Time</span>
                    <p style="margin: 4px 0 0; color: #ecfdf5; font-size: 16px; font-weight: bold;">9:00 PM — 2:00 AM</p>
                </div>
                
                <div>
                    <span style="color: #6ee7b7; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📍 Location</span>
                    <p style="margin: 4px 0 0; color: #ecfdf5; font-size: 16px; font-weight: bold;">${NIGHT_LOCATION}</p>
                </div>
            </div>
            
            <!-- Location Button -->
            <a href="${NIGHT_LOCATION_URL}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; margin-bottom: 25px;">
                📍 View Location on Google Maps
            </a>
            
            <!-- Checklist -->
            <div style="background-color: rgba(6, 78, 59, 0.5); padding: 20px; border-radius: 10px; text-align: left; margin-top: 10px; border: 1px dashed rgba(16, 185, 129, 0.3);">
                <h3 style="color: #fbbf24; margin: 0 0 15px; font-size: 15px;">✅ Before You Come:</h3>
                <p style="color: #d1fae5; margin: 8px 0; font-size: 14px; line-height: 1.6;">☑️ Have your <strong>QR ticket</strong> ready (check your email or WhatsApp)</p>
                <p style="color: #d1fae5; margin: 8px 0; font-size: 14px; line-height: 1.6;">☑️ Bring your <strong>business cards</strong> for networking</p>
                <p style="color: #d1fae5; margin: 8px 0; font-size: 14px; line-height: 1.6;">☑️ Download the location and <strong>plan your route</strong></p>
                <p style="color: #d1fae5; margin: 8px 0; font-size: 14px; line-height: 1.6;">☑️ Follow us on <a href="https://www.facebook.com/profile.php?id=61575666404676" style="color: #10b981;">Facebook</a> for live updates</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #064e3b 0%, #0f766e 100%); padding: 20px; text-align: center;">
            <p style="margin: 0 0 8px; color: #fbbf24; font-size: 14px; font-weight: bold;">See you there! 🌟</p>
            <p style="margin: 0; color: #6ee7b7; font-size: 12px;">&copy; 2026 Next Academy. All rights reserved.</p>
        </div>
    </div>`;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'ramadan2026resend') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testEmail = searchParams.get('test');

    try {
        let query = supabaseAdmin
            .from('bookings')
            .select('id, customer_name, email, payment_status, total_amount')
            .eq('status', 'confirmed')
            .not('email', 'is', null);

        if (testEmail) {
            query = query.eq('email', testEmail);
        }

        const { data: bookings, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No confirmed bookings found' });
        }

        // Deduplicate by email (some people have multiple bookings with same email)
        const seenEmails = new Set<string>();
        const uniqueBookings = bookings.filter(b => {
            if (b.payment_status === 'refunded' && b.total_amount < 0) return false;
            const emailLower = b.email.toLowerCase().trim();
            if (seenEmails.has(emailLower)) return false;
            seenEmails.add(emailLower);
            return true;
        });

        const results: any[] = [];
        let successCount = 0;
        let failCount = 0;

        for (const booking of uniqueBookings) {
            try {
                const { data, error: emailError } = await resend.emails.send({
                    from: 'Ramadan Majlis <welcome@ramadanmajlis.nextacademyedu.com>',
                    to: [booking.email],
                    subject: '⏳ Less Than 48 Hours — Are You Ready? 🔥',
                    html: buildWarmupEmail(booking.customer_name.trim()),
                });

                if (emailError) {
                    failCount++;
                    results.push({ name: booking.customer_name, email: booking.email, status: 'failed', error: emailError.message });
                } else {
                    successCount++;
                    results.push({ name: booking.customer_name, email: booking.email, status: 'sent' });
                }

                // Rate limit delay
                await new Promise(r => setTimeout(r, 800));

            } catch (err: any) {
                failCount++;
                results.push({ name: booking.customer_name, email: booking.email, status: 'failed', error: err.message });
            }
        }

        return NextResponse.json({
            total: uniqueBookings.length,
            sent: successCount,
            failed: failCount,
            deduplicated: bookings.length - uniqueBookings.length,
            results
        });

    } catch (error: any) {
        console.error('Warmup email error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
