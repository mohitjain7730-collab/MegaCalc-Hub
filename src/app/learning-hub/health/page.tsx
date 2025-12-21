import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Learning Hub - MegaCalc Hub',
  description: 'Explore health articles and guides.',
  alternates: {
    canonical: '/learning-hub/health',
  },
};
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryIcon } from '@/components/category-icon';
import { getNutritionArticles } from './nutrition-diet/articles';

export default function HealthPage() {
  // Load articles on the server
  const nutritionArticles = getNutritionArticles();

  const healthSections = [
    {
      name: 'Nutrition & Diet',
      slug: 'nutrition-diet',
      description: 'Learn about healthy eating, meal planning, and nutritional science.',
      icon: 'Apple',
      count: nutritionArticles.length,
    },
    {
      name: 'Weight & Metabolism',
      slug: 'weight-metabolism',
      description: 'Understand weight management, metabolic health, and body composition.',
      icon: 'Scale',
      count: 0,
    },
    {
      name: 'Fitness & Sports',
      slug: 'fitness-sports',
      description: 'Explore exercise science, training programs, and athletic performance.',
      icon: 'Activity',
      count: 0,
    },
    {
      name: 'Body Composition',
      slug: 'body-composition',
      description: 'Learn about muscle mass, body fat, and physical measurements.',
      icon: 'Target',
      count: 0,
    },
    {
      name: "Women's Health",
      slug: 'womens-health',
      description: 'Comprehensive guides on women\'s health, hormones, and wellness.',
      icon: 'HeartPulse',
      count: 0,
    },
    {
      name: 'Medical Risk Scores',
      slug: 'medical-risk-scores',
      description: 'Understand health risk assessments, screening tools, and preventive care.',
      icon: 'Shield',
      count: 0,
    },
    {
      name: 'Mental Health & Sleep',
      slug: 'mental-health-sleep',
      description: 'Explore mental wellness, stress management, and sleep optimization.',
      icon: 'Moon',
      count: 0,
    },
    {
      name: 'Longevity & Wellness',
      slug: 'longevity-wellness',
      description: 'Discover strategies for healthy aging and long-term wellness.',
      icon: 'Leaf',
      count: 0,
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Learning Hub
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Health
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Explore health articles and guides.
          </p>
        </div>

        {healthSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthSections.map((section) => (
              <Link
                key={section.slug}
                href={`/learning-hub/health/${section.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name={section.icon}
                      className="h-8 w-8 mb-4 text-primary"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-lg">{section.name}</CardTitle>
                    <CardDescription className="pt-1">
                      {section.description}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-3">
                      {section.count ?? 0} {section.count === 1 ? 'article' : 'articles'}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Coming soon
              </CardTitle>
            </CardHeader>
            <CardDescription className="text-base">
              Health content is coming soon. Check back later!
            </CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}



