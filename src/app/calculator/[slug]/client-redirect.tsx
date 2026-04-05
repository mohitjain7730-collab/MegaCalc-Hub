'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { calculators } from '@/lib/calculators';
import { Loader2 } from 'lucide-react';

export default function ClientRedirect({ slug }: { slug: string }) {
    const router = useRouter();

    useEffect(() => {
        const calc = calculators.find((c) => c.slug === slug);
        if (calc) {
            if (calc.category === 'education' && calc.subcategory === 'maths') {
                router.replace(`/${calc.slug}`);
            } else {
                router.replace(`/${calc.category}/${calc.slug}`);
            }
        } else {
            router.replace('/');
        }
    }, [slug, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to calculator...</p>
        </div>
    );
}
