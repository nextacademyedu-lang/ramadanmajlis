import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the path starts with /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Allow access to the login page itself
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for the admin session cookie
        const adminSession = request.cookies.get('admin_session');

        // If no cookie, redirect to login
        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Check if the path starts with /partner
    if (request.nextUrl.pathname.startsWith('/partner')) {

        // Allow access to the login page itself
        if (request.nextUrl.pathname === '/partner/login') {
            return NextResponse.next();
        }

        // Check for the partner session cookie
        const partnerSession = request.cookies.get('partner_session');

        // If no cookie, redirect to login
        if (!partnerSession) {
            return NextResponse.redirect(new URL('/partner/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/partner/:path*'],
};
