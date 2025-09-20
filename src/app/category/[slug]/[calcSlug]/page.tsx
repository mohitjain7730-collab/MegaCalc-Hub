import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';
import { categories } from '@/lib/categories';
import { calculators } from '@/lib/calculators';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';

const calculatorComponents: { [key: string]: React.ComponentType } = {
    'paint-coverage': dynamic(() => import('@/components/calculators/home-improvement/paint-coverage-calculator')),
    'tile-flooring': dynamic(() => import('@/components/calculators/home-improvement/tile-flooring-calculator')),
    'wallpaper-roll': dynamic(() => import('@/components/calculators/home-improvement/wallpaper-roll-calculator')),
    'drywall-plasterboard': dynamic(() => import('@/components/calculators/home-improvement/drywall-plasterboard-calculator')),
    'insulation-r-value': dynamic(() => import('@/components/calculators/home-improvement/insulation-r-value-calculator')),
    'decking-materials': dynamic(() => import('@/components/calculators/home-improvement/decking-materials-calculator')),
    'roofing-shingle': dynamic(() => import('@/components/calculators/home-improvement/roofing-shingle-calculator')),
    'concrete-volume': dynamic(() => import('@/components/calculators/home-improvement/concrete-volume-calculator')),
    'lumber-framing': dynamic(() => import('@/components/calculators/home-improvement/lumber-framing-calculator')),
    'lighting-layout': dynamic(() => import('@/components/calculators/home-improvement/lighting-layout-calculator')),
    'hvac-sizing': dynamic(() => import('@/components/calculators/home-improvement/hvac-sizing-calculator')),
    'staircase-rise-run': dynamic(() => import('@/components/calculators/home-improvement/staircase-rise-run-calculator')),
    'cost-estimator-renovation': dynamic(() => import('@/components/calculators/home-improvement/cost-estimator-renovation-calculator')),
    'water-usage-plumbing-flow': dynamic(() => import('@/components/calculators/home-improvement/water-usage-plumbing-flow-calculator')),
    'garden-landscape-soil-mulch': dynamic(() => import('@/components/calculators/home-improvement/garden-landscape-soil-mulch-calculator')),
    'beam-bending': dynamic(() => import('@/components/calculators/engineering/beam-bending-calculator')),
    'truss-analysis': dynamic(() => import('@/components/calculators/engineering/truss-analysis-calculator')),
    'pipe-flow': dynamic(() => import('@/components/calculators/engineering/pipe-flow-calculator')),
    'hydraulic-head-loss': dynamic(() => import('@/components/calculators/engineering/hydraulic-head-loss-calculator')),
    'concrete-mix': dynamic(() => import('@/components/calculators/engineering/concrete-mix-calculator')),
    'steel-weight': dynamic(() => import('@/components/calculators/engineering/steel-weight-calculator')),
    'column-buckling': dynamic(() => import('@/components/calculators/engineering/column-buckling-calculator')),
    'pump-power': dynamic(() => import('@/components/calculators/engineering/pump-power-calculator')),
    'hydraulic-cylinder-force': dynamic(() => import('@/components/calculators/engineering/hydraulic-cylinder-force-calculator')),
    'pressure-vessel-thickness': dynamic(() => import('@/components/calculators/engineering/pressure-vessel-thickness-calculator')),
    'slope-stability': dynamic(() => import('@/components/calculators/engineering/slope-stability-calculator')),
    'moment-of-inertia': dynamic(() => import('@/components/calculators/engineering/moment-of-inertia-calculator')),
    'electrical-circuit': dynamic(() => import('@/components/calculators/engineering/electrical-circuit-calculator')),
    'thermal-expansion': dynamic(() => import('@/components/calculators/engineering/thermal-expansion-calculator')),
    'gear-ratio-torque': dynamic(() => import('@/components/calculators/engineering/gear-ratio-torque-calculator')),
    'iq-score-estimator': dynamic(() => import('@/components/calculators/cognitive-psychology/iq-score-estimator')),
    'memory-span-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/memory-span-calculator')),
    'cognitive-load-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/cognitive-load-calculator')),
    'personality-trait-calculator': dynamic(() => import('@/components/calculators/cognitive-psychology/personality-trait-calculator')),
    'ancestry-composition-estimator': dynamic(() => import('@/components/calculators/genetic-ancestry/ancestry-composition-estimator')),
    'genetic-trait-probability-calculator': dynamic(() => import('@/components/calculators/genetic-ancestry/genetic-trait-probability-calculator')),
    'pedigree-analysis-calculator': dynamic(() => import('@/components/calculators/genetic-ancestry/pedigree-analysis-calculator')),
    'genealogy-timeline-generator': dynamic(() => import('@/components/calculators/genetic-ancestry/genealogy-timeline-generator')),
  };

export async function generateStaticParams() {
  return calculators.map((calc) => ({
    slug: calc.category,
    calcSlug: calc.slug,
  }));
}

export default function CalculatorPage({ params }: { params: { slug: string, calcSlug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  const calculator = calculators.find((c) => c.slug === params.calcSlug && c.category === params.slug);

  if (!category || !calculator) {
    notFound();
  }

  const CalculatorComponent = calculatorComponents[calculator.slug];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
       <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className='mb-4'>
                <Link href={`/category/${category.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {category.name}
                </Link>
            </Button>
            <Card className="w-full shadow-md">
                <CardContent className="p-8 text-center">
                    <CategoryIcon name={category.Icon} className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {calculator.name}
                    </h1>
                    <p className='text-muted-foreground mb-4'>{category.name}</p>
                    <p className="text-lg text-muted-foreground">
                        {calculator.description}
                    </p>
                </CardContent>
            </Card>
        </div>

        {CalculatorComponent ? (
          <Card className='w-full shadow-md'>
            <CardContent className='p-8'>
              <CalculatorComponent />
            </CardContent>
          </Card>
        ) : (
            <Card className="w-full max-w-lg text-center shadow-md mx-auto">
                <CardContent className="p-8">
                    <p className="text-lg text-muted-foreground">
                    This calculator is coming soon.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
