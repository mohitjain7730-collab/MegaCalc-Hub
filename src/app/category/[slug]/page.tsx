import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { calculators } from '@/lib/calculators';

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

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

        {categoryCalculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCalculators.map((calc) => (
              <Link href={`/category/${category.slug}/${calc.slug}`} key={calc.id} className="group block h-full">
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{calc.name}</CardTitle>
                    <CardDescription className="pt-1">{calc.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md mt-8">
            <CardContent className="p-8">
                <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Calculators Coming Soon
                </h2>
                <p className="text-lg text-muted-foreground">
                  Individual calculators for the {category.name} category are being built.
                </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
