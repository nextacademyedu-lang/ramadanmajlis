import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Use service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const { code, selectedNights, isPackage } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false, message: 'Code is required' }, { status: 400 });
        }

        const { data: promo, error } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !promo) {
            return NextResponse.json({ valid: false, message: 'Invalid promo code' }, { status: 404 });
        }

        if (!promo.is_active) {
            return NextResponse.json({ valid: false, message: 'This code is no longer active' }, { status: 400 });
        }

        if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
            return NextResponse.json({ valid: false, message: 'This code has expired' }, { status: 400 });
        }

        if (promo.is_package_exclusive && !isPackage) {
            return NextResponse.json({ valid: false, message: 'This code is only valid for full package bookings' }, { status: 400 });
        }

        if (promo.target_nights && promo.target_nights.length > 0) {
             // selectedNights is array of IDs. Check if all selected are in target
             // OR check if at least one?
             // Prompt implies "Link to a night".
             // Interpretation: Valid ONLY if all selected nights are in the target list.
             if (!selectedNights || selectedNights.some((n: string) => !promo.target_nights.includes(n))) {
                 return NextResponse.json({ valid: false, message: 'This code is not valid for the selected nights' }, { status: 400 });
             }
        }

        if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
            return NextResponse.json({ valid: false, message: 'This code has reached its usage limit' }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            id: promo.id,
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            agent: promo.sales_agent
        });

    } catch (error: any) {
        console.error('Promo Validation Error:', error);
        return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 });
    }
}
