'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NUTRITION_ARTICLES } from './articles';
import { CategoryIcon } from '@/components/category-icon';
import { Input } from '@/components/ui/input';

export default function NutritionDietPage() {
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    if (!query.trim()) {
      return NUTRITION_ARTICLES;
    }

    const lowerQuery = query.toLowerCase();
    return NUTRITION_ARTICLES.filter((article) =>
      `${article.title} ${article.description}`.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

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

        <div className="mb-8 space-y-2">
          <label className="text-sm font-medium text-foreground">
            Search articles
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder='Try "metabolic flexibility", "protein", "gut health"...'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredArticles.length} of {NUTRITION_ARTICLES.length} articles
          </p>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/learning-hub/health/nutrition-diet/${article.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CategoryIcon
                      name="Apple"
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
                No articles matched "{query}"
              </CardTitle>
              <CardDescription className="text-base">
                Try different keywords or explore the full list above.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
