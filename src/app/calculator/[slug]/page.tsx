
import { redirect, notFound } from 'next/navigation';
import { calculators } from '@/lib/calculators';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CalculatorRedirect({ params }: PageProps) {
    const { slug } = await params;
    const calc = calculators.find((c) => c.slug === slug);

    if (calc) {
        redirect(`/category/${calc.category}/${calc.slug}`);
    }

    notFound();
}
