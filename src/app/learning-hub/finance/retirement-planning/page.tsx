import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getRetirementArticlesList } from '../articles';
import { ArticleSearch } from '@/components/learning-hub/article-search';

export default function RetirementPlanningPage() {
  // Load articles on the server
  const articles = getRetirementArticlesList();

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub/finance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Finance
            </Link>
          </Button>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">
            Finance Track
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Retirement Planning
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
            Comprehensive guides on retirement planning, 401(k), IRAs, and long-term financial security.
          </p>
        </div>

        <ArticleSearch 
          articles={articles}
          iconName="Target"
          searchPlaceholder='Try "401(k)", "Roth IRA", "retirement savings"...'
        />
      </div>
    </div>
  );
}
