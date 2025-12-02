
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Calculator, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Mycalculating.com',
  description:
    'Your one-stop destination for all calculators. Mycalculating.com offers a wide range of free online calculators for finance, health, and more.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Optimized font loading with font-display swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        
        {/* AdSense script - loaded asynchronously */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5405909046385135"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
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
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
