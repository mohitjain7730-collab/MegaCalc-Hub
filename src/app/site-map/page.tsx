import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CategoryIcon } from '@/components/category-icon';
import { SitemapLink } from '@/components/sitemap-link';
import { getCalculatorsByCategory } from '@/lib/calculator-data-utils';
import { categories } from '@/lib/categories';


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sitemap - Mycalculating.com',
  description: 'Complete sitemap of all calculators and learning hub articles organized by category and topic.',
  alternates: {
    canonical: '/site-map',
  },
};

export default async function SitemapPage() {


  // Dynamically fetch calculators for each category
  const calculatorsByCategory = (await Promise.all(
    categories.map(async (category) => {
      const calcs = await getCalculatorsByCategory(category.slug);
      return {
        category,
        calculators: calcs,
      };
    })
  )).filter((group) => group.calculators.length > 0);



  const totalCalculators = calculatorsByCategory.reduce((acc, group) => acc + group.calculators.length, 0);
  const totalArticles = 0;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Button asChild variant="ghost" className="mb-3 sm:mb-4 text-sm sm:text-base">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Sitemap
            </h1>
          </div>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
            Complete directory of all calculators and learning hub articles. This page automatically updates when new content is added.
          </p>
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {totalCalculators} Calculators
            </span>

          </div>
        </div>

        {/* Calculators Section */}
        <section className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Calculators</h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-1">
            All calculators organized by category
          </p>

          <Accordion type="multiple" className="w-full space-y-3 sm:space-y-4 md:space-y-6">
            {calculatorsByCategory.map(({ category, calculators: categoryCalculators }) => (
              <AccordionItem key={category.slug} value={category.slug} className="border rounded-lg overflow-hidden">
                <Card className="border-0 shadow-none">
                  <CardHeader className="bg-muted/50 p-3 sm:p-4 md:p-6">
                    <AccordionTrigger className="hover:no-underline py-2 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 text-left">
                        <CategoryIcon
                          name={category.Icon}
                          className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0"
                          strokeWidth={1.5}
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg md:text-xl truncate">{category.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-0.5 sm:mt-1">
                            {category.description} • {categoryCalculators.length} calculator{categoryCalculators.length !== 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="pt-3 sm:pt-4 md:pt-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {categoryCalculators.map((calc) => (
                          <Link
                            key={calc.id}
                            href={`/${calc.slug}`}
                            className="group block p-2.5 sm:p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 min-h-[60px] sm:min-h-[70px] flex flex-col justify-center"
                          >
                            <h3 className="font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors leading-tight">
                              {calc.name}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {calc.description}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </section>



        {/* Quick Links */}
        <section className="mb-8 sm:mb-12">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-base sm:text-lg md:text-xl">Quick Links</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Navigate to main sections</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <Button asChild variant="outline" className="justify-start h-auto py-2.5 sm:py-3 text-sm sm:text-base">
                  <Link href="/">
                    <Calculator className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start h-auto py-2.5 sm:py-3 text-sm sm:text-base">
                  <Link href="/calculators">
                    <Calculator className="mr-2 h-4 w-4" />
                    All Calculators
                  </Link>
                </Button>

              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

