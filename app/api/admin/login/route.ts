import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();
        const SECRET = process.env.ADMIN_SECRET_TOKEN || 'ramadan2026'; // Default fallback if env not set

        if (token !== SECRET) {
            return NextResponse.json({ message: 'Invalid Token' }, { status: 401 });
        }

        // Set Cookie
        // Note: In Next.js App Router, cookies() is read-only in some contexts, 
        // but in Route Handlers it's the standard way to set them via the response.
        // However, cookies().set() is the modern API.

        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}
