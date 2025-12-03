import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { calculators } from '@/lib/calculators';
import { categories } from '@/lib/categories';
import { calculatorComponents, calculatorComponentKeys } from '@/app/category/[slug]/[calcSlug]/page';
import { CalculatorWrapper } from '@/components/calculator-wrapper';
import { CalculatorLoading } from '@/components/calculator-loading';

// Force dynamic rendering to prevent dev-only chunk mismatch issues
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

// Only generate params for calculators that have corresponding component files
export async function generateStaticParams() {
  return calculators
    .filter((calc) => {
      const category = categories.find((c) => c.slug === calc.category);
      if (!category) return false;
      const componentKey = `${category.slug}/${calc.slug}`;
      return calculatorComponentKeys.has(componentKey) || calculatorComponentKeys.has(calc.slug);
    })
    .map((calc) => ({
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

  const componentKey = `${category.slug}/${calculator.slug}`;
  const finalComponentKey = calculatorComponentKeys.has(componentKey)
    ? componentKey
    : calculator.slug;

  // Ensure finalComponentKey exists and is valid before accessing calculatorComponents
  // Use nullish coalescing to handle undefined cases safely
  const CalculatorComponent =
    (finalComponentKey && calculatorComponents[finalComponentKey]) ??
    dynamic(() => import('@/components/calculator-loading'));

  return (
    <CalculatorWrapper calculator={calculator} category={category}>
      <Suspense fallback={<CalculatorLoading />}>
        <CalculatorComponent />
      </Suspense>
    </CalculatorWrapper>
  );
}


