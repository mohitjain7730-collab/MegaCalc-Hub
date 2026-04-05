import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categories } from '@/lib/categories';

import CategoryView, { generateCategoryMetadata } from '../../[slug]/category-view';

export const dynamicParams = false;

export async function generateStaticParams() {
    return categories.map((c) => ({ slug: c.slug }));
}

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
