import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-8">
      <Card className="w-full max-w-lg text-center shadow-md">
        <CardContent className="p-8">
            <CategoryIcon name={category.Icon} className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {category.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Individual calculators coming soon.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
