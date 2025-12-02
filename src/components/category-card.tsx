'use client';

import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Category } from '@/lib/categories';
import { CategoryIcon } from './category-icon';

export function CategoryCard({ name, slug, description, Icon }: Category) {
  return (
    <Link href={`/category/${slug}`} className="group block h-full">
      <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
        <CardHeader>
          <CategoryIcon name={Icon} className="h-7 w-7 sm:h-8 sm:w-8 mb-3 sm:mb-4 text-primary flex-shrink-0" strokeWidth={1.5} />
          <CardTitle className="text-base sm:text-lg break-words">{name}</CardTitle>
          <CardDescription className="pt-1 text-sm sm:text-base break-words">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
