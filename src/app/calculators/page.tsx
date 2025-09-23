
import Link from 'next/link';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AllCalculatorsPage() {
  let calculatorCount = 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            All Calculators
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse every tool available on MegaCalc Hub, organized by category.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => {
            const categoryCalculators = calculators.filter(
              (calc) => calc.category === category.slug
            );

            if (categoryCalculators.length === 0) {
              return null;
            }

            return (
              <section key={category.slug}>
                <div className="flex items-center gap-4 mb-6">
                  <CategoryIcon name={category.Icon} className="h-8 w-8 text-primary" strokeWidth={1.5} />
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                     {String.fromCharCode(97 + categoryIndex)}. {category.name}
                  </h2>
                </div>
                <div className="space-y-3">
                  {categoryCalculators.map((calc, calcIndex) => {
                    calculatorCount++;
                    return (
                        <Link
                        href={`/category/${category.slug}/${calc.slug}`}
                        key={calc.id}
                        className="group block"
                        >
                        <Card className="transition-all duration-200 ease-in-out group-hover:bg-muted/50 group-hover:border-primary/30">
                            <CardHeader>
                            <CardTitle className="text-lg group-hover:text-primary">{calculatorCount}. {calcIndex + 1}. {calc.name}</CardTitle>
                            </CardHeader>
                        </Card>
                        </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
