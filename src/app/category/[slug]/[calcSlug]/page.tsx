
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Construction } from 'lucide-react';
import { Suspense } from 'react';
import React from 'react';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { EmbedWidget } from '@/components/embed-widget';
import { CalculatorSidebar } from '@/components/calculator-sidebar';
import { CalculatorLoading } from '@/components/calculator-loading';
import { generateCalculatorSchema, generateFAQSchema, generateHowToSchema } from '@/lib/schema-generator';
import { CalculatorWrapper } from '@/components/calculator-wrapper';

// Note: Dynamic imports are handled by CalculatorWrapper (Client Component)
// This Server Component only needs to render the wrapper

// Use ISR (Incremental Static Regeneration) for optimal build speed and LCP performance
// Pages are pre-rendered at build time, but only regenerated when needed
// This allows incremental builds while maintaining fast LCP
export const revalidate = 3600; // Revalidate every hour (pages stay cached until then)
export const dynamicParams = true; // Allow dynamic params for on-demand generation

export async function generateStaticParams() {
  // In production, generate all pages at build time for optimal LCP
  // In development, generate fewer pages for faster builds
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // In dev, only generate first 50 calculators for faster builds
    return calculators.slice(0, 50).map((calc) => ({
      slug: calc.category,
      calcSlug: calc.slug,
    }));
  }
  
  // Production: generate all pages
  return calculators.map((calc) => ({
      slug: calc.category,
      calcSlug: calc.slug,
    }));
}

// Generate metadata with canonical URL for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string; calcSlug: string }> 
}): Promise<Metadata> {
  const { slug, calcSlug } = await params;
  const category = categories.find((c) => c.slug === slug);
  const calculator = calculators.find((c) => c.slug === calcSlug && c.category === slug);
  
  if (!category || !calculator) {
    return {
      title: 'Calculator Not Found',
    };
  }

  const canonicalUrl = `https://mycalculating.com/category/${category.slug}/${calculator.slug}`;
  
  return {
    title: calculator.metaTitle || calculator.name,
    description: calculator.metaDescription || calculator.description,
    alternates: {
      canonical: canonicalUrl,
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

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string; calcSlug: string }> }) {
  const { slug, calcSlug } = await params;
  const category = categories.find((c) => c.slug === slug);
  const calculator = calculators.find((c) => c.slug === calcSlug && c.category === slug);

  if (!category || !calculator) {
    notFound();
  }

  // category and calculator are guaranteed to exist due to notFound() check above

  // Generate schemas once - server-side rendered for Google crawlers
  // Cache date string to avoid creating multiple Date objects
  const today = new Date().toISOString().split('T')[0];
  const baseUrl = `https://mycalculating.com/category/${category.slug}/${calculator.slug}`;
  
  // Generate schemas efficiently
  const calculatorSchema = generateCalculatorSchema(calculator, category);
  const faqSchema = generateFAQSchema(calculator);
  const howToSchema = generateHowToSchema(calculator);
  
  // Create comprehensive schema with BreadcrumbList, Article, SoftwareApplication, FAQPage, and HowTo
  const comprehensiveSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
          { '@type': 'ListItem', position: 2, name: category.name, item: `https://mycalculating.com/category/${category.slug}` },
          { '@type': 'ListItem', position: 3, name: calculator.name, item: baseUrl },
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
      {
        '@type': 'SoftwareApplication',
        name: calculator.name,
        applicationCategory: 'Calculator',
        operatingSystem: 'Web Browser',
        description: calculator.description,
        url: baseUrl,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      },
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
      <CalculatorSidebar currentCategorySlug={category.slug} />
      <div className="flex flex-col items-center min-h-screen bg-secondary/50 p-4 sm:p-6 lg:pl-64">
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
            {/* Embed Widget Section */}
            <EmbedWidget categorySlug={category.slug} calculatorSlug={calculator.slug} />
        </div>
      </div>
    </>
  );
}
    