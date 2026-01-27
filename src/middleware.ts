import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Return 410 Gone for unused image paths (e.g. /images/*.png) so crawlers stop
    // requesting them. 410 > 404 for crawl efficiency. Includes malformed URLs
    // like ...step2.png . png. Exclude only _next/* to avoid blocking Next.js internals.
    if (
        pathname.startsWith('/images/') ||
        pathname.startsWith('/assets/') ||
        pathname.startsWith('/static/') ||
        pathname.startsWith('/screenshots/')
    ) {
        if (!pathname.startsWith('/_next/')) {
            return new NextResponse(null, { status: 410, statusText: 'Gone' })
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
