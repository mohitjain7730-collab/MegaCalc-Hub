import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

const calculatorComponents: { [key: string]: React.ComponentType } = {
    'paint-coverage': dynamic(() => import('@/components/calculators/home-improvement/paint-coverage-calculator')),
    // Add other calculators here as they are created
  };

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

  const CalculatorComponent = calculatorComponents[calculator.slug];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
       <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className='mb-4'>
                <Link href={`/category/${category.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {category.name}
                </Link>
            </Button>
            <Card className="w-full shadow-md">
                <CardContent className="p-8 text-center">
                    <CategoryIcon name={category.Icon} className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {calculator.name}
                    </h1>
                    <p className='text-muted-foreground mb-4'>{category.name}</p>
                    <p className="text-lg text-muted-foreground">
                        {calculator.description}
                    </p>
                </CardContent>
            </Card>
        </div>

        {CalculatorComponent ? (
          <Card className='w-full shadow-md'>
            <CardContent className='p-8'>
              <CalculatorComponent />
            </CardContent>
          </Card>
        ) : (
            <Card className="w-full max-w-lg text-center shadow-md mx-auto">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground">
                    This calculator is coming soon.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
