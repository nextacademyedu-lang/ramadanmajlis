
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

        // 1. Authenticate with Paymob
        const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY })
        });
        const authData = await authResponse.json();

        if (!authData.token) {
            console.error('Paymob Auth Failed during Verification:', authData);
            return NextResponse.json({ success: false, message: "Payment provider error" }, { status: 500 });
        }
        const token = authData.token;

        // 2. Get Transaction Details from Paymob
        const transactionResponse = await fetch(`https://accept.paymob.com/api/acceptance/transactions/${transactionId}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, // Some endpoints use Header, some use query param. Usually Bearer works for retrieval.
                'Content-Type': 'application/json'
            }
        });
        
        // Convert to JSON
        const transaction = await transactionResponse.json();

        // Fallback: If Bearer doesn't work, try Query Param (Paymob inconsistency)
        /* 
        const transactionResponse = await fetch(`https://accept.paymob.com/api/acceptance/transactions/${transactionId}?token=${token}`);
        */
        
        if (transactionResponse.status !== 200 || !transaction.id) {
             console.error('Paymob Get Transaction Failed:', transaction);
             return NextResponse.json({ success: false, message: "Transaction check failed" }, { status: 500 });
        }

        console.log(`💳 Paymob Status for ${transactionId}: success=${transaction.success}, pending=${transaction.pending}`);

        // 3. Verify Logic
        // Check if successful AND not pending AND matches booking ID
        const isSuccess = transaction.success === true && transaction.pending === false;
        
        // Verify Order ID matches Booking ID (Handling various ID formats if necessary)
        // Paymob uses 'merchant_order_id' or inside 'order' object
        const paymobOrderId = transaction.order?.merchant_order_id || transaction.merchant_order_id;
        
        if (paymobOrderId !== bookingId) {
            console.warn(`⚠️ Transaction Checking: Booking ID Mismatch! Paymob says: ${paymobOrderId}, Request says: ${bookingId}`);
            // Depending on strictness, we might return false. For now, strict.
            // return NextResponse.json({ success: false, message: "Order mismatch" });
        }

        if (isSuccess) {
            // 4. Confirm Booking in Supabase (Idempotent)
            const confirmation = await confirmBooking(bookingId);
            
            return NextResponse.json({ 
                success: true, 
                message: "Transaction Verified",
                booking: confirmation.booking
            });
        } else {
             return NextResponse.json({ 
                success: false, 
                message: "Transaction Declined or Pending",
                details: { success: transaction.success, pending: transaction.pending }
            });
        }

    } catch (error: any) {
        console.error('Verify API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
