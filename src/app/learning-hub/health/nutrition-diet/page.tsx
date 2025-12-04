import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getNutritionArticles } from './articles';
import { ArticleSearch } from '@/components/learning-hub/article-search';

export default function NutritionDietPage() {
  // Load articles on the server
  const articles = getNutritionArticles();

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
            Nutrition & Diet
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
            Learn about healthy eating, meal planning, and nutritional science.
          </p>
        </div>

        <ArticleSearch 
          articles={articles}
          iconName="Apple"
          searchPlaceholder='Try "metabolic flexibility", "protein", "gut health"...'
          basePath="/learning-hub/health/nutrition-diet"
        />
      </div>
    </div>
  );
}
