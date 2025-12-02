import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 bg-background border-t mt-auto">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link 
            href="/sitemap" 
            className="transition-colors hover:text-foreground"
          >
            Sitemap
          </Link>
          <Link 
            href="/privacy-policy" 
            className="transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}


