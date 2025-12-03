
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { CategoryIcon } from '@/components/category-icon';
import { calculators } from '@/lib/calculators';
import { CategorySearch } from '@/components/category-search';
import { CalculatorSidebar } from '@/components/calculator-sidebar';
import { generateCategorySchema } from '@/lib/schema-generator';

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryCalculators = calculators.filter(
    (calc) => calc.category === category.slug
  );

  return (
    <>
      <CalculatorSidebar currentCategorySlug={category.slug} />
      <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:pl-64">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateCategorySchema(category, categoryCalculators))
          }}
        />
        <div className="w-full max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <Button asChild variant="ghost" className='mb-3 sm:mb-4 text-sm sm:text-base'>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
            <CategoryIcon name={category.Icon} className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
                {category.name}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">{category.description}</p>
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
    </>
  );
}
