
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { getCalculator, getCalculatorsByCategory } from '@/lib/calculator-data-utils';
import { calculators } from '@/lib/calculators';
import { CategoryIcon } from '@/components/category-icon';
import { EmbedWidget } from '@/components/embed-widget';
import { indexableCalculatorSlugs } from '@/lib/indexing-whitelist';

import { generateCalculatorSchema, generateFAQSchema, generateHowToSchema, generateSubCategorySchema, getCalculatorFAQContent, getCalculatorHowToContent } from '@/lib/schema-generator';
import { getCalculatorSeoContent } from '@/lib/calculator-seo-content';
import { CalculatorWrapper } from '@/components/calculator-wrapper';
import { CalculatorSeoArticle } from '@/components/calculator-seo-article';
import { CategorySearch } from '@/components/category-search';

// Force server-side rendering so all content is in the initial HTML
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string; path: string[] }>
}): Promise<Metadata> {
    const { slug, path } = await params;
    const category = categories.find((c) => c.slug === slug);

    if (!category) return { title: 'Not Found' };

    // CHECK SUBCATEGORY: /[slug]/[sub]
    if (path.length === 1) {
        const subSlug = path[0];
        const subcategory = category.subcategories?.find((s) => s.slug === subSlug);
        if (subcategory) {
            return {
                title: `${subcategory.name} Calculators - ${category.name} - Mycalculating.com`,
                description: subcategory.description,
                alternates: {
                    canonical: `/category/${category.slug}/${subcategory.slug}`,
                },
            };
        }
    }

    // CHECK CALCULATOR logic removed
    return { title: 'Not Found' };
}

export default async function CatchAllCategoryPage({ params }: { params: Promise<{ slug: string; path: string[] }> }) {
    const { slug, path } = await params;
    const category = categories.find((c) => c.slug === slug);

    if (!category) notFound();

    // --------------------------------------------------------------------------
    // LOGIC BRANCH 1: SUBCATEGORY PAGE
    // --------------------------------------------------------------------------
    if (path.length === 1) {
        const subSlug = path[0];
        const subcategory = category.subcategories?.find((s) => s.slug === subSlug);

        if (subcategory) {
            const allCalculators = await getCalculatorsByCategory(category.slug);
            const subcategoryCalculators = allCalculators.filter(c => c.subcategory === subSlug);

            return (
                <>
                    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify(generateSubCategorySchema(category, subcategory, subcategoryCalculators))
                            }}
                        />
                        <div className="w-full max-w-4xl">
                            <div className="mb-6 sm:mb-8">
                                <Button asChild variant="ghost" className='mb-3 sm:mb-4 text-sm sm:text-base'>
                                    <Link href={`/category/${category.slug}`}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to {category.name}
                                    </Link>
                                </Button>
                                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4'>
                                    <CategoryIcon name={category.Icon} className="h-10 w-10 sm:h-12 sm:w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground break-words">
                                            {subcategory.name}
                                        </h1>
                                        <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">{subcategory.description}</p>
                                    </div>
                                </div>
                            </div>

                            <CategorySearch
                                calculators={subcategoryCalculators}
                                categoryName={subcategory.name}
                                categorySlug={category.slug}
                            />
                        </div>
                    </div>
                </>
            );
        }
    }

    // --------------------------------------------------------------------------
    // LOGIC BRANCH 2: CALCULATOR PAGE
    // Calculators are now handled by /app/[calculatorSlug]/page.tsx
    // --------------------------------------------------------------------------
    notFound();
}
