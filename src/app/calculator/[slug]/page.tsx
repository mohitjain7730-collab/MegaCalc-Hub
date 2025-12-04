import { notFound } from 'next/navigation';

import { calculators } from '@/lib/calculators';
import { categories } from '@/lib/categories';
import { CalculatorWrapper } from '@/components/calculator-wrapper';

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

// Generate params for all calculators
export async function generateStaticParams() {
  return calculators.map((calc) => ({
    slug: calc.slug,
  }));
}

export const revalidate = 86400; // ISR: revalidate every 24 hours

export default async function SingleCalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const calculator = calculators.find((c) => c.slug === slug);
  if (!calculator) {
    notFound();
  }

  const category = categories.find((c) => c.slug === calculator.category);
  if (!category) {
    notFound();
  }

  return (
    <CalculatorWrapper categorySlug={category.slug} calculatorSlug={calculator.slug} />
  );
}

