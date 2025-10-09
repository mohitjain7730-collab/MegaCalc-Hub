
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { articles } from '@/lib/learning-hub-articles';
import { CategoryIcon } from '@/components/category-icon';
import { BmiChart } from '@/components/learning-hub/charts/bmi-chart';
import { CompoundInterestChart } from '@/components/learning-hub/charts/compound-interest-chart';
import { AprVsApyChart } from '@/components/learning-hub/charts/apr-vs-apy-chart';
import { NewtonsSecondLawChart } from '@/components/learning-hub/charts/newtons-second-law-chart';
import { PressureUnitsChart } from '@/components/learning-hub/charts/pressure-units-chart';
import { BfpChart } from '@/components/learning-hub/charts/bfp-chart';
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

const chartComponents: { [key: string]: ComponentType } = {
  BmiChart,
  CompoundInterestChart,
  AprVsApyChart,
  NewtonsSecondLawChart,
  PressureUnitsChart,
  BfpChart,
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }
  
  const ChartComponent = article.chartComponent ? chartComponents[article.chartComponent as any] : null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <div className="flex items-start gap-4">
             <CategoryIcon name={article.Icon} className="h-12 w-12 text-primary flex-shrink-0" strokeWidth={1.5} />
            <div>
                 <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {article.title}
                </h1>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
          
          {ChartComponent && (
            <div className="my-8">
              <ChartComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
