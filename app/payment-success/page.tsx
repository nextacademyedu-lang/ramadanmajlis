import crypto from 'crypto';
import PaymentSuccessClient from './PaymentSuccessClient';
import { Suspense } from 'react';

function calculateHmac(queryParams: any, secret: string) {
    const hmacKeys = [
        "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction",
        "id", "integration_id", "is_3d_secure", "is_auth", "is_capture", "is_refunded",
        "is_standalone_payment", "is_voided", "order", "owner", "pending", "source_data.pan",
        "source_data.sub_type", "source_data.type", "success"
    ];

    // Sort keys and concatenate values
    const concatenatedValues = hmacKeys.sort().map(key => queryParams[key] || "").join("");
    
    // Create HMAC
    const hmac = crypto.createHmac('sha512', secret)
        .update(concatenatedValues)
        .digest('hex');

    return hmac;
}

export default async function PaymentSuccessPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const success = searchParams.success === 'true';
    const pending = searchParams.pending === 'true';
    const hmac = searchParams.hmac as string;
    const secret = process.env.PAYMOB_HMAC;

    let isHmacValid = false;

    if (secret && hmac) {
        try {
            const calculatedHmac = calculateHmac(searchParams, secret);
            isHmacValid = calculatedHmac === hmac;
            
            // Log for debugging (server-side only)
            if (!isHmacValid) {
                console.warn('[Paymob HMAC Mismatch]', {
                    received: hmac,
                    calculated: calculatedHmac,
                    params: searchParams
                });
            }
        } catch (error) {
            console.error('HMAC Calculation Error:', error);
        }
    } else {
        // If no secret configured or no HMAC received, we might want to fail safe
        // But for backward compatibility or dev mode, we might allow if strictly success=true
        // However, user setup has HMAC, so we should enforce it.
        // For now, if no secret, we can't accept.
        console.warn('[Paymob] Missing secret or HMAC');
    }

    // Final Success Check: Must be success=true AND HMAC valid
    // For pending, usually 'pending' is true and 'success' is false, logic depends on provider.
    // Paymob wallet payments might return success=false pending=true initially?
    // Let's stick to the visual requirement: if success=false and pending=false, show error.
    
    // If HMAC is invalid, we should treat it as failure or potential tampering.
    // However, during development/testing if variables are messy, we might block valid payments.
    // Let's be strict: if success is true, HMAC MUST be valid.
    
    const isVerifiedSuccess = success && isHmacValid;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessClient 
                isSuccess={isVerifiedSuccess} 
                isPending={pending} 
            />
        </Suspense>
    );
}
