import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

export async function generateStaticParams() {
  return calculators.map((calc) => ({
    slug: calc.category,
    calcSlug: calc.slug,
  }));
}

export default function CalculatorPage({ params }: { params: { slug: string, calcSlug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  const calculator = calculators.find((c) => c.slug === params.calcSlug && c.category === params.slug);

  if (!category || !calculator) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <Card className="w-full max-w-lg text-center shadow-md">
        <CardContent className="p-8">
            <CategoryIcon name={category.Icon} className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {calculator.name}
            </h1>
            <p className='text-muted-foreground mb-4'>{category.name}</p>
            <p className="text-lg text-muted-foreground mb-8">
              This calculator is coming soon.
            </p>
            <Button asChild>
              <Link href={`/category/${category.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {category.name}
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
