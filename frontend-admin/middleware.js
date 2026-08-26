import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('admin_token')?.value;
    
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Basic JWT structure validation (3 base64 parts)
    const parts = token.split('.');
    if (parts.length !== 3) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_token');
        return response;
    }
    
    // Check token expiration
    try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
        // Validate admin token identity and expiration
        if (!payload.id && !payload.email) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }

        // If role claim exists, ensure it is ADMIN or SUPERADMIN
        if (payload.role && payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
    } catch (e) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_token');
        return response;
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!login|_next/static|_next/image|favicon.ico|logo|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
