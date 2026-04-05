import { calculators } from '@/lib/calculators';
import ClientRedirect from './client-redirect';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return calculators.map((c) => ({ slug: c.slug }));
}

export default async function CalculatorRedirectPage({ params }: PageProps) {
    const { slug } = await params;
    return <ClientRedirect slug={slug} />;
}
