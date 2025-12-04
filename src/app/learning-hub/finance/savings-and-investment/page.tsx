import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getFinanceArticles } from '../articles';
import { ArticleSearch } from '@/components/learning-hub/article-search';

export default function SavingsAndInvestmentPage() {
  // Load articles on the server
  const articles = getFinanceArticles();

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
            Savings & Investment
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
            Deep dives on building savings habits, optimizing emergency funds, and crafting U.S.-centric investment strategies.
          </p>
        </div>

        <ArticleSearch 
          articles={articles}
          iconName="PiggyBank"
          searchPlaceholder='Try "Roth IRA limits", "ETFs", "emergency fund"...'
        />
      </div>
    </div>
  );
}


