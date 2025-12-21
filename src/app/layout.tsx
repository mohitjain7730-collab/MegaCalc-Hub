
import type { Metadata } from 'next';
import { Suspense } from 'react';

import Script from 'next/script';
import { Inter } from 'next/font/google';
import { HeaderClient } from '@/components/HeaderClient';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/footer';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ChunkErrorHandler } from '@/components/chunk-error-handler';
import { ConditionalNoIndex } from '@/components/conditional-no-index';

// Optimize font loading with Next.js font optimization (eliminates render-blocking CSS)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mycalculating.com'),
  title: 'Mycalculating.com',
  description:
    'Your one-stop destination for all calculators. Mycalculating.com offers a wide range of free online calculators for finance, health, and more.',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

// Next.js 15: Separate viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <ConditionalNoIndex />
        {/* Preconnect to Firebase domains for performance (LCP savings) */}
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://firebaseapp.com" />
        <link
          rel="preconnect"
          href="https://studio-1785634166-53e0b.firebaseapp.com"
        />

        {/* Preconnect and DNS-prefetch for Google Ads / Tag Manager */}
        <link
          rel="preconnect"
          href="https://pagead2.googlesyndication.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://pagead2.googlesyndication.com"
        />
        <link
          rel="dns-prefetch"
          href="https://www.googletagmanager.com"
        />

        {/* Preload core app CSS used for above-the-fold content */}
        {/* Note: Next.js automatically optimizes CSS loading and inlines critical CSS */}
        {/* This preload hint helps the browser prioritize CSS loading */}

        {/* Inline critical CSS for above-the-fold content to avoid flashes before Tailwind loads */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              body { margin: 0; font-family: var(--font-inter, system-ui, -apple-system, sans-serif); }
              .hero-pattern {
                background-image: radial-gradient(hsl(var(--muted)) 1px, transparent 1px);
                background-size: 16px 16px;
              }
              /* Critical above-the-fold styles */
              #calculator-container {
                min-height: 600px;
                width: 100%;
                display: flex;
                flex-direction: column;
              }
              /* Prevent layout shift for calculator container */
              [data-lcp-candidate] {
                contain: layout style paint;
              }
            `,
          }}
        />
        {/* Global chunk error handler - runs before React loads */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var CHUNK_RELOAD_KEY = 'chunk-reload-attempt';
                var CHUNK_RELOAD_MAX = 2;
                var CHUNK_RELOAD_DELAY = 1500;
                
                function getAttempts() {
                  try {
                    var attempts = sessionStorage.getItem(CHUNK_RELOAD_KEY);
                    return attempts ? parseInt(attempts, 10) : 0;
                  } catch {
                    return 0;
                  }
                }
                
                function incrementAttempts() {
                  try {
                    var attempts = getAttempts() + 1;
                    sessionStorage.setItem(CHUNK_RELOAD_KEY, attempts.toString());
                    return attempts;
                  } catch {
                    return 1;
                  }
                }
                
                function isChunkError(error) {
                  if (!error) return false;
                  var msg = error.message || '';
                  var name = error.name || '';
                  return msg.includes('Loading chunk') ||
                         msg.includes('ChunkLoadError') ||
                         msg.includes('Failed to fetch dynamically imported module') ||
                         msg.includes('timeout') ||
                         name === 'ChunkLoadError' ||
                         /chunk.*failed/i.test(msg) ||
                         /loading.*chunk/i.test(msg);
                }
                
                function handleChunkError(error) {
                  if (!isChunkError(error)) return false;
                  
                  // In development, don't auto-reload to prevent interference with form submissions
                  var isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
                  if (isDev || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.warn('Chunk error in development (not reloading):', error);
                    return false;
                  }
                  
                  console.warn('Chunk error detected (pre-React):', error);
                  
                  var attempts = getAttempts();
                  if (attempts < CHUNK_RELOAD_MAX) {
                    incrementAttempts();
                    setTimeout(function() {
                      window.location.reload();
                    }, CHUNK_RELOAD_DELAY);
                  } else {
                    try {
                      sessionStorage.clear();
                      window.location.href = window.location.href.split('#')[0] + '?t=' + Date.now();
                    } catch {
                      window.location.reload();
                    }
                  }
                  return true;
                }
                
                // Clear attempts after successful load
                setTimeout(function() {
                  try {
                    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
                  } catch {}
                }, 2000);
                
                // Handle errors
                window.addEventListener('error', function(e) {
                  if (handleChunkError(e.error)) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }, true);
                
                // Handle promise rejections
                window.addEventListener('unhandledrejection', function(e) {
                  if (handleChunkError(e.reason)) {
                    e.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className={`font-body antialiased ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <HeaderClient />
          <ChunkErrorHandler />
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              <Suspense>
                <AnalyticsProvider>
                  {children}
                </AnalyticsProvider>
              </Suspense>
            </div>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        {/* AdSense script - loaded with Next.js Script for better performance */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5405909046385135"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
