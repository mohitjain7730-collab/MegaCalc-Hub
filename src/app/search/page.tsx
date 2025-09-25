
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { calculators } from '@/lib/calculators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SearchX } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const filteredCalculators = query
    ? calculators.filter(
        (calc) =>
          calc.name.toLowerCase().includes(query.toLowerCase()) ||
          calc.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
                </Link>
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Search Results for "{query}"
            </h1>
        </div>

        {filteredCalculators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalculators.map((calc) => (
              <Link href={`/category/${calc.category}/${calc.slug}`} key={calc.id} className="group block h-full">
                <Card className="h-full transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{calc.name}</CardTitle>
                    <CardDescription className="pt-1">{calc.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="w-full text-center shadow-md mt-8">
            <CardContent className="p-8">
                <SearchX className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  No Results Found
                </h2>
                <p className="text-lg text-muted-foreground">
                  We couldn't find any calculators matching your search for "{query}".
                </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    )
}
