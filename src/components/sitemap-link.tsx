'use client';

import Link from 'next/link';
import { MouseEvent } from 'react';

interface SitemapLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function SitemapLink({ href, className, children }: SitemapLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

