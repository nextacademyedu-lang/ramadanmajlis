
import { NextResponse } from 'next/server';
import { confirmBooking } from '@/lib/booking-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { transactionId, bookingId } = body;

        console.log(`🔍 Verifying Transaction: ${transactionId} for Booking: ${bookingId}`);

        if (!transactionId || !bookingId) {
            return NextResponse.json({ success: false, message: "Missing parameters" }, { status: 400 });
        }

        if (!bookingId) {
            return NextResponse.json({ success: false, message: "Missing booking ID" }, { status: 400 });
        }

        // --- EASYKASH VERIFICATION ---
        // EasyKash verification is done by "Inquiry" using the customerReference (which matches our bookingId)

        console.log(`[EasyKash] Verifying Booking: ${bookingId}`);
        const easyKashToken = process.env.EASYKASH_API_TOKEN;

        if (!easyKashToken) {
            console.error('[EasyKash] Token missing in env');
            return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
        }

        const verifyResponse = await fetch('https://back.easykash.net/api/cash-api/inquire', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': easyKashToken
            },
            body: JSON.stringify({ customerReference: bookingId })
        });

        const transaction = await verifyResponse.json();
        console.log(`[EasyKash] Inquiry Response for ${bookingId}:`, JSON.stringify(transaction));

        // Validation Logic:
        // EasyKash usually returns: { status: "PAID", ... } or { status: "SUCCESS" ... } - Verification needed on exact string
        // Based on common integrations, it's often "PAID" for cards.

        const isSuccess = transaction.status === 'PAID' || transaction.status === 'SUCCESS';

        if (isSuccess) {
            // 4. Confirm Booking in Supabase
            const confirmation = await confirmBooking(bookingId);

            return NextResponse.json({
                success: true,
                message: "Transaction Verified",
                booking: confirmation.booking
            });
        } else {
            return NextResponse.json({
                success: false,
                message: `Transaction not paid: ${transaction.status || 'Unknown'}`,
                details: transaction
            });
        }

    } catch (error: any) {
        console.error('Verify API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
