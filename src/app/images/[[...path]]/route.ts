import { NextRequest, NextResponse } from 'next/server';

/**
 * /images/* (including *.png) are not served. Return 410 Gone so crawlers
 * stop requesting them (avoids 404 crawl waste). Middleware also returns
 * 410 for /images/; this route is a fallback.
 */
export function GET(_request: NextRequest) {
  return new NextResponse(null, { status: 410, statusText: 'Gone' });
}

export function HEAD(_request: NextRequest) {
  return new NextResponse(null, { status: 410, statusText: 'Gone' });
}
