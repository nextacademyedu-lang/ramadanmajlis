import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRIZES = [
    { label: "20%", value: 20, weight: 35 },
    { label: "40%", value: 40, weight: 30 },
    { label: "50%", value: 50, weight: 20 },
    { label: "60%", value: 60, weight: 15 },
];

export async function POST(request: Request) {
    try {
        const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
        const random = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        let selectedPrizeIndex = 0;

        for (let i = 0; i < PRIZES.length; i++) {
            cumulativeWeight += PRIZES[i].weight;
            if (random <= cumulativeWeight) {
                selectedPrizeIndex = i;
                break;
            }
        }

        const prize = PRIZES[selectedPrizeIndex];

        // Generate a random unique code (e.g. RM26-WIN-4A9XYZ)
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `RM26-WIN-${randomString}`;

        // Save to database as a single-use promo code
        const { error } = await supabase.from('promo_codes').insert({
            code: code,
            discount_type: 'percentage',
            discount_value: prize.value,
            sales_agent: 'Roulette Spin',
            is_active: true,
            usage_limit: 1
        });

        if (error) {
           console.error('Error saving promo code:', error);
           return NextResponse.json({ success: false, message: 'Failed to generate code' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            prizeIndex: selectedPrizeIndex, 
            prize: prize,
            code: code 
        });

    } catch (error) {
        console.error('Spin Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
