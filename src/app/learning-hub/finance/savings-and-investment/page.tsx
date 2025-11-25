import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FINANCE_ARTICLES } from '../articles';
import { CategoryIcon } from '@/components/category-icon';

export default function SavingsAndInvestmentPage() {
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

        {FINANCE_ARTICLES.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FINANCE_ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/learning-hub/finance/${article.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name="PiggyBank"
                      className="h-8 w-8 mb-4 text-primary"
                      strokeWidth={1.5}
                    />
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription className="pt-1">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Articles coming soon
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}


