import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mental Health & Sleep - Health Learning Hub',
  description: 'Explore mental wellness, stress management, and sleep optimization.',
  alternates: {
    canonical: '/learning-hub/health/mental-health-sleep',
  },
};

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

export default function MentalHealthSleepPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub/health">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Health
            </Link>
          </Button>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">
            Health Track
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Mental Health & Sleep
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
            Explore mental wellness, stress management, and sleep optimization.
          </p>
        </div>

        <Card className="w-full text-center shadow-md">
          <CardHeader>
            <CategoryIcon
              name="Moon"
              className="h-12 w-12 mb-4 text-primary mx-auto"
              strokeWidth={1.5}
            />
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Coming soon
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Content for Mental Health & Sleep is coming soon. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}


