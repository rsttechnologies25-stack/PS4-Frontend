import { NextResponse } from 'next/server';

export default function middleware(request) {
    const token = request.cookies.get('admin_token')?.value;
    const { pathname } = request.nextUrl;

    const isPublicPath = pathname === '/login';

    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|logo-v1.png|icon.svg).*)'
    ]
};
