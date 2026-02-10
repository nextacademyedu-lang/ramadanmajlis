import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        
        // Check against environment variable
        const validPassword = process.env.PARTNER_ACCESS_PASSWORD;
        
        if (!validPassword) {
            console.error('PARTNER_ACCESS_PASSWORD is not defined in environment variables');
            return NextResponse.json({ 
                message: 'System configuration error: Password not set on server. Please checking env vars.' 
            }, { status: 500 });
        }

        if (password === validPassword) {
            // Set cookie
            const cookieStore = await cookies();
            cookieStore.set('partner_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 // 1 day
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ message: 'Invalid Access Code' }, { status: 401 });

    } catch (err: any) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
