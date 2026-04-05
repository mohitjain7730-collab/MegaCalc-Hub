import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calculators } from '@/lib/calculators';
import { categories } from '@/lib/categories';

import CalculatorView, { generateCalculatorMetadata } from './calculator-view';
import CategoryView, { generateCategoryMetadata } from './category-view';

export const dynamicParams = false;

export async function generateStaticParams() {
    const calculatorSlugs = calculators.map((c) => ({ slug: c.slug }));
    const categorySlugs = categories.map((c) => ({ slug: c.slug }));
    return [...calculatorSlugs, ...categorySlugs];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // Check if it's a calculator
    const isCalculator = calculators.some(c => c.slug === slug);
    if (isCalculator) {
        return generateCalculatorMetadata(slug);
    }

    // Check if it's a category
    const isCategory = categories.some(c => c.slug === slug);
    if (isCategory) {
        return generateCategoryMetadata(slug);
    }

    return { title: 'Not Found' };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const isCalculator = calculators.some(c => c.slug === slug);
    if (isCalculator) {
        return <CalculatorView slug={slug} />;
    }

    const isCategory = categories.some(c => c.slug === slug);
    if (isCategory) {
        return <CategoryView slug={slug} />;
    }

    notFound();
}
