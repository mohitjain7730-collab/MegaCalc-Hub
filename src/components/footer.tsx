import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-4 sm:py-6 md:px-8 md:py-0 bg-background border-t mt-auto">
      <div className="container flex flex-col items-center justify-center gap-3 sm:gap-4 md:h-24 md:flex-row px-4">
        <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-muted-foreground">
          <Link
            href="/privacy-policy"
            className="transition-colors hover:text-foreground touch-target"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-conditions"
            className="transition-colors hover:text-foreground touch-target"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-foreground touch-target"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}


