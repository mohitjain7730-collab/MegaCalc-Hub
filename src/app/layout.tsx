
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Calculator, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { Footer } from '@/components/footer';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ChunkErrorHandler } from '@/components/chunk-error-handler';

// Optimize font loading with Next.js font optimization (eliminates render-blocking CSS)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
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
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css"
          as="style"
        />

        {/* Inline a tiny bit of critical CSS for the hero section to avoid flashes before Tailwind loads */}
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              body { margin: 0; }
              .hero-pattern {
                background-image: radial-gradient(hsl(var(--muted)) 1px, transparent 1px);
                background-size: 16px 16px;
              }
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
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container flex h-14 items-center">
              <Link href="/" className="flex items-center gap-2 font-bold mr-4">
                <Calculator className="h-6 w-6 text-primary" />
                <span className="hidden sm:inline-block text-lg">Mycalculating.com</span>
              </Link>
              <div className="ml-auto flex items-center gap-2 sm:gap-4">
                <Button asChild variant="ghost" className="px-2 sm:px-4">
                  <Link href="/ai-tool">
                    <Sparkles className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline-block">Try Our AI Tool</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="px-2 sm:px-4">
                  <Link href="/learning-hub">
                    <BookOpen className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline-block">Learning Hub</span>
                  </Link>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>
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
