
import PaymentSuccessClient from './PaymentSuccessClient';
import { Suspense } from 'react';
import { confirmBooking } from '@/lib/booking-service';

export default async function PaymentSuccessPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const bookingId = searchParams.bookingId as string;

    let isVerifiedSuccess = false;
    let isPending = false;

    if (bookingId) {
        try {
            // EasyKash Verification
            const easyKashToken = process.env.EASYKASH_API_TOKEN;
            if (easyKashToken) {
                const verifyResponse = await fetch('https://back.easykash.net/api/cash-api/inquire', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': easyKashToken
                    },
                    body: JSON.stringify({ customerReference: bookingId })
                });
                const transaction = await verifyResponse.json();

                // Check for success status
                const isPaid = transaction.status === 'PAID' || transaction.status === 'SUCCESS';

                if (isPaid) {
                    await confirmBooking(bookingId);
                    isVerifiedSuccess = true;
                } else {
                    console.error('EasyKash Payment Failed or Pending:', transaction);
                    // Handle pending logic if needed, for now treat as failure/pending
                    if (transaction.status === 'PENDING') {
                        isPending = true;
                    }
                }
            }
        } catch (error) {
            console.error('Payment Verification Error:', error);
        }
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessClient
                isSuccess={isVerifiedSuccess}
                isPending={isPending}
            />
        </Suspense>
    );
}
