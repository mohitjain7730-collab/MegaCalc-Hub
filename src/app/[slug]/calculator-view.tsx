import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { getCalculator } from '@/lib/calculator-data-utils';
import { calculators } from '@/lib/calculators';
import { CategoryIcon } from '@/components/category-icon';
import { EmbedWidget } from '@/components/embed-widget';
import { indexableCalculatorSlugs } from '@/lib/indexing-whitelist';

import { generateCalculatorSchema, generateFAQSchema, generateHowToSchema } from '@/lib/schema-generator';
import { getCalculatorSeoContent } from '@/lib/calculator-seo-content';
import { CalculatorWrapper } from '@/components/calculator-wrapper';
import { CalculatorSeoArticle } from '@/components/calculator-seo-article';

// Force server-side rendering so all content is in the initial HTML

export async function generateCalculatorMetadata(slug: string): Promise<Metadata> {
    // Find calculator from data
    const calculator = calculators.find((c) => c.slug === slug);
    if (!calculator) {
        return {
            title: 'Calculator Not Found',
        };
    }

    const canonicalUrl = `https://mycalculating.com/${calculator.slug}`;
    const isIndexable = indexableCalculatorSlugs.includes(calculator.slug);

    return {
        title: calculator.metaTitle || calculator.name,
        description: calculator.metaDescription || calculator.description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: isIndexable,
            follow: true,
        },
        openGraph: {
            title: calculator.metaTitle || calculator.name,
            description: calculator.metaDescription || calculator.description,
            url: canonicalUrl,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: calculator.metaTitle || calculator.name,
            description: calculator.metaDescription || calculator.description,
        },
    };
}

export default async function CalculatorView({ slug }: { slug: string }) {
    const calculator = calculators.find((c) => c.slug === slug);
    if (!calculator) notFound();

    const category = categories.find((c) => c.slug === calculator.category);
    if (!category) notFound();

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = `https://mycalculating.com/${calculator.slug}`;

    const calculatorSchema = generateCalculatorSchema(calculator, category);
    const faqSchema = generateFAQSchema(calculator);
    const howToSchema = generateHowToSchema(calculator);
    // Note: getCalculatorFAQContent, getCalculatorHowToContent seem to use calculator object. Let's make sure they are imported.
    const { getCalculatorFAQContent, getCalculatorHowToContent } = await import('@/lib/schema-generator');
    const faqContent = getCalculatorFAQContent(calculator);
    const howToSteps = getCalculatorHowToContent(calculator);
    const extendedSeoContent = getCalculatorSeoContent(calculator.slug);

    const comprehensiveSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                    { '@type': 'ListItem', position: 2, name: category.name, item: `https://mycalculating.com/${category.slug}` },
                    ...(calculator.subcategory ? [{ '@type': 'ListItem', position: 3, name: calculator.subcategory, item: `https://mycalculating.com/${category.slug}/${calculator.subcategory}` }] : []),
                    { '@type': 'ListItem', position: calculator.subcategory ? 4 : 3, name: calculator.name, item: baseUrl },
                ],
            },
            {
                '@type': 'Article',
                headline: calculator.name,
                description: calculator.description,
                author: { '@type': 'Organization', name: 'Mycalculating.com' },
                publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
                url: baseUrl,
                mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
                datePublished: '2024-01-01',
                dateModified: today,
            },
            calculatorSchema,
            faqSchema,
            howToSchema,
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(comprehensiveSchema) }}
            />
            <div className="flex flex-col min-h-screen bg-secondary/50 p-4 sm:p-6">
                <div className="w-full max-w-4xl mx-auto bg-background rounded-lg shadow-sm p-4 sm:p-6 md:p-8 flex-1" id="calculator-container" data-lcp-candidate style={{ minHeight: '600px' }}>
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href={`/${category.slug}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to {category.name}
                            </Link>
                        </Button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <CategoryIcon name={category.Icon} className="h-8 w-8 sm:h-10 sm:w-10 text-primary flex-shrink-0" strokeWidth={1.5} />
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                                    {calculator.name}
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1 break-words">{calculator.description}</p>
                            </div>
                        </div>
                    </div>

                    <CalculatorWrapper categorySlug={category.slug} calculatorSlug={calculator.slug} />
                    <EmbedWidget categorySlug={category.slug} calculatorSlug={calculator.slug} />

                    {/* SEO: server-rendered article — full content in View Page Source */}
                    <CalculatorSeoArticle
                        calculator={calculator}
                        categorySlug={category.slug}
                        extendedSeoContent={extendedSeoContent}
                        faqContent={faqContent}
                        howToSteps={howToSteps}
                    />
                </div>
            </div>
        </>
    );
}
