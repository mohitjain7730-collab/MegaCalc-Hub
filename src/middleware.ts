import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check for unused image paths to return 410 Gone
    // We explicitly check for specific directories to avoid accidental blocking of nextjs internals
    // We use detailed checks to be safe.
    if (
        pathname.startsWith('/images/') ||
        pathname.startsWith('/assets/') ||
        pathname.startsWith('/static/') ||
        pathname.startsWith('/screenshots/')
    ) {
        // Ensure we don't block _next/static
        if (!pathname.startsWith('/_next/')) {
            return new NextResponse(null, { status: 410, statusText: "Gone" })
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
