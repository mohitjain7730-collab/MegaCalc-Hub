import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories } from '@/lib/categories';

import CategoryView, { generateCategoryMetadata } from '../../[slug]/category-view';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    const isCategory = categories.some(c => c.slug === slug);
    if (!isCategory) {
        return { title: 'Not Found' };
    }

    return generateCategoryMetadata(slug);
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const isCategory = categories.some(c => c.slug === slug);
    if (!isCategory) {
        notFound();
    }

    return <CategoryView slug={slug} />;
}
