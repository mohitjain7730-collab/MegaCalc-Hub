'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CategoryIcon } from '@/components/category-icon';
import type { Article } from '@/types';

interface ArticleSearchProps {
  articles: Article[];
  iconName?: string;
  searchPlaceholder?: string;
  basePath?: string;
}

export function ArticleSearch({ articles, iconName = 'BookOpen', searchPlaceholder, basePath = '/learning-hub/finance' }: ArticleSearchProps) {
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    if (!query.trim()) {
      return articles;
    }

    const lowerQuery = query.toLowerCase();
    return articles.filter((article) =>
      `${article.title} ${article.description}`.toLowerCase().includes(lowerQuery)
    );
  }, [query, articles]);

  return (
    <>
      <div className="mb-8 space-y-2">
        <label className="text-sm font-medium text-foreground">
          Search articles
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder || 'Search articles...'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredArticles.length} of {articles.length} articles
        </p>
      </div>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link
              key={article.slug}
              href={`${basePath}/${article.slug}`}
              className="group block h-full"
            >
              <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                <CardHeader>
                  <CategoryIcon
                    name={iconName}
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
              No articles matched &quot;{query}&quot;
            </CardTitle>
            <CardDescription className="text-base">
              Try different keywords or explore the full list above.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </>
  );
}

