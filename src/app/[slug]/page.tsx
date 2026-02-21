import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';

import CategoryView, { generateCategoryMetadata } from './category-view';
import CalculatorView, { generateCalculatorMetadata } from './calculator-view';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // Check if it's a category
    const isCategory = categories.some(c => c.slug === slug);
    if (isCategory) {
        return generateCategoryMetadata(slug);
    }

    // Check if it's a calculator
    const isCalculator = calculators.some(c => c.slug === slug);
    if (isCalculator) {
        return generateCalculatorMetadata(slug);
    }

    return { title: 'Not Found' };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const isCategory = categories.some(c => c.slug === slug);
    if (isCategory) {
        return <CategoryView slug={slug} />;
    }

    const isCalculator = calculators.some(c => c.slug === slug);
    if (isCalculator) {
        return <CalculatorView slug={slug} />;
    }

    notFound();
}
