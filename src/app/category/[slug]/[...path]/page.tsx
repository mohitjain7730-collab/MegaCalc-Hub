
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
import { getCalculatorSeoContent, getRelatedCalculatorUrl } from '@/lib/calculator-seo-content';
import { CalculatorWrapper } from '@/components/calculator-wrapper';
import { CategorySearch } from '@/components/category-search';

// Use ISR
export const revalidate = 3600;

// Dynamic params must be true for catch-all
export const dynamicParams = true;

export async function generateStaticParams() {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) return [];

    const params: { slug: string; path: string[] }[] = [];

    // 1. Generate for Calculators (Level 2: /category/slug/calcSlug)
    calculators.forEach((calc) => {
        // Determine path based on if it has a subcategory or not
        // Wait, existing calculators don't have subcategory in URL.
        // New Maths calculators DO.
        if (calc.category === 'education' && calc.subcategory === 'maths') {
            // Path: /category/education/maths/calc
            params.push({ slug: calc.category, path: ['maths', calc.slug] });
        } else {
            // Path: /category/cat/calc
            params.push({ slug: calc.category, path: [calc.slug] });
        }
    });

    // 2. Generate for Subcategories (Level 2: /category/slug/sub)
    categories.forEach((category) => {
        category.subcategories?.forEach((sub) => {
            params.push({
                slug: category.slug,
                path: [sub.slug],
            });
        });
    });

    return params;
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string; path: string[] }>
}): Promise<Metadata> {
    const { slug, path } = await params;
    const category = categories.find((c) => c.slug === slug);

    if (!category) return { title: 'Not Found' };

    // CHECK SUBCATEGORY: /category/[slug]/[sub]
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

    // CHECK CALCULATOR
    let calcSlug = '';
    if (path.length === 1) calcSlug = path[0];
    else if (path.length === 2) calcSlug = path[1];
    else return { title: 'Not Found' };

    const calculator = await getCalculator(slug, calcSlug);

    if (!calculator) {
        return {
            title: 'Calculator Not Found',
        };
    }

    const canonicalPath = path.length === 2 ? `${category.slug}/${path[0]}/${calculator.slug}` : `${category.slug}/${calculator.slug}`;
    const canonicalUrl = `https://mycalculating.com/category/${canonicalPath}`;

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
    // --------------------------------------------------------------------------
    let calcSlug = '';
    // if path is [calcSlug]
    if (path.length === 1) calcSlug = path[0];
    // if path is [subcategory, calcSlug]
    else if (path.length === 2) calcSlug = path[1];
    else notFound();

    const calculator = await getCalculator(slug, calcSlug);
    if (!calculator) notFound();

    // Verification: If path has 2 segments, ensure the first one matches the calculator's subcategory?
    // User might not care if we are loose here, but let's be safe.
    if (path.length === 2 && calculator.subcategory !== path[0]) {
        // e.g. /category/education/wrongsub/calc -> should 404
        notFound();
    }

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = `https://mycalculating.com/category/${category.slug}/${path.join('/')}`;

    const calculatorSchema = generateCalculatorSchema(calculator, category);
    const faqSchema = generateFAQSchema(calculator);
    const howToSchema = generateHowToSchema(calculator);
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
                    { '@type': 'ListItem', position: 2, name: category.name, item: `https://mycalculating.com/category/${category.slug}` },
                    // Add Subcategory crumb if applicable
                    ...(path.length === 2 ? [{ '@type': 'ListItem', position: 3, name: path[0], item: `https://mycalculating.com/category/${category.slug}/${path[0]}` }] : []),
                    { '@type': 'ListItem', position: path.length === 2 ? 4 : 3, name: calculator.name, item: baseUrl },
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
            <div className="flex flex-col items-center min-h-screen bg-secondary/50 p-4 sm:p-6">
                <div className="w-full max-w-4xl bg-background rounded-lg shadow-sm p-4 sm:p-6 md:p-8 flex-1" id="calculator-container" data-lcp-candidate style={{ minHeight: '600px', width: '100%' }}>
                    <div className="mb-8">
                        <Button asChild variant="ghost" className="mb-4">
                            <Link href={`/category/${category.slug}`}>
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

                    {/* SEO: server-rendered article content — visible in View Page Source and on page; only calculator UI is client-side */}
                    <article
                        id="calculator-seo-content"
                        className="mt-10 pt-8 border-t border-border prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5"
                    >
                        <h2>{calculator.name}</h2>
                        <p>{calculator.description}</p>

                        {extendedSeoContent ? (
                            <>
                                {extendedSeoContent.whatIs && (
                                    <>
                                        <h2>What Is the {calculator.name}?</h2>
                                        <p>{extendedSeoContent.whatIs}</p>
                                    </>
                                )}
                                {extendedSeoContent.formula && (
                                    <>
                                        <h2>Formula</h2>
                                        <div>
                                            <p><strong>Formula:</strong> {extendedSeoContent.formula}</p>
                                            {extendedSeoContent.formulaExplanation && (
                                                <p>{extendedSeoContent.formulaExplanation}</p>
                                            )}
                                        </div>
                                    </>
                                )}
                                <h2>Calculator Inputs and Parameters</h2>
                                <p>This calculator uses the following inputs:</p>
                                <ul>
                                    {extendedSeoContent.inputs.map((input, i) => (
                                        <li key={i}>
                                            <strong>{input.label}</strong>
                                            {input.description ? ` — ${input.description}` : ''}
                                        </li>
                                    ))}
                                </ul>
                                {extendedSeoContent.howToUseSteps && extendedSeoContent.howToUseSteps.length > 0 && (
                                    <>
                                        <h2>How to Use the {calculator.name}</h2>
                                        <p>Follow these steps to get accurate results:</p>
                                        <ul>
                                            {extendedSeoContent.howToUseSteps.map((step, i) => (
                                                <li key={i}>{step}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                {extendedSeoContent.whatResultsMean && (
                                    <>
                                        <h2>What the Results Mean</h2>
                                        {extendedSeoContent.whatResultsMean.intro && (
                                            <p>{extendedSeoContent.whatResultsMean.intro}</p>
                                        )}
                                        <ul>
                                            {extendedSeoContent.whatResultsMean.items.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                {extendedSeoContent.whyUse && extendedSeoContent.whyUse.length > 0 && (
                                    <>
                                        <h2>Why Use the {calculator.name}?</h2>
                                        <p>Understanding your results can help you make informed decisions. Here is how this calculator can be useful:</p>
                                        <ul>
                                            {extendedSeoContent.whyUse.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                <h2>Results and Output</h2>
                                <p>The calculator displays the following results:</p>
                                <ul>
                                    {extendedSeoContent.results.map((result, i) => (
                                        <li key={i}>{result}</li>
                                    ))}
                                </ul>
                                <h2>Frequently Asked Questions (FAQ)</h2>
                                {faqContent.map((faq, i) => (
                                    <div key={i}>
                                        <h3>{faq.question}</h3>
                                        <p>{faq.answer}</p>
                                    </div>
                                ))}
                                {extendedSeoContent.conclusion && (
                                    <>
                                        <h2>Conclusion</h2>
                                        <p>{extendedSeoContent.conclusion}</p>
                                    </>
                                )}
                                {extendedSeoContent.aboutTheory && extendedSeoContent.aboutTheory.length > 0 && (
                                    <>
                                        <h2>About and Theory</h2>
                                        {extendedSeoContent.aboutTheory.map((block, i) => (
                                            <div key={i}>
                                                <h3>{block.title}</h3>
                                                <p>{block.content}</p>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {extendedSeoContent.relatedCalculators && extendedSeoContent.relatedCalculators.length > 0 && (
                                    <>
                                        <h2>Related Calculators</h2>
                                        <p>Explore other related tools:</p>
                                        <ul>
                                            {extendedSeoContent.relatedCalculators.map((rel, i) => (
                                                <li key={i}>
                                                    <a href={getRelatedCalculatorUrl(rel.slug, category.slug)}>{rel.name}</a>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <h2>How to use {calculator.name}</h2>
                                <p>Step-by-step guide to using the {calculator.name}:</p>
                                <ol>
                                    {howToSteps.map((step, i) => (
                                        <li key={i}>
                                            <strong>{step.name}.</strong> {step.text}
                                        </li>
                                    ))}
                                </ol>
                                <h2>Frequently asked questions</h2>
                                {faqContent.map((faq, i) => (
                                    <div key={i}>
                                        <h3>{faq.question}</h3>
                                        <p>{faq.answer}</p>
                                    </div>
                                )                                )}
                            </>
                        )}
                    </article>
                </div>
            </div>
        </>
    );
}
