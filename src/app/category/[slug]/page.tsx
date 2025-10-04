
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { CategoryIcon } from '@/components/category-icon';
import { calculators } from '@/lib/calculators';
import { CategorySearch } from '@/components/category-search';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const categoryCalculators = calculators.filter(
    (calc) => calc.category === category.slug
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className='mb-4'>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className='flex items-center gap-4'>
            <CategoryIcon name={category.Icon} className="h-12 w-12 text-primary" strokeWidth={1.5} />
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {category.name}
                </h1>
                <p className="text-muted-foreground mt-1">{category.description}</p>
            </div>
          </div>
        </div>
        
        <CategorySearch
          calculators={categoryCalculators}
          categoryName={category.name}
          categorySlug={category.slug}
        />

      </div>
    </div>
  );
}
