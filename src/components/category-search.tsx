
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Construction } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Calculator } from '@/lib/calculators';

interface CategorySearchProps {
  calculators: Calculator[];
  categoryName: string;
  categorySlug: string;
}

export function CategorySearch({ calculators, categoryName, categorySlug }: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCalculators = calculators.filter(
    (calc) =>
      calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      calc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search in ${categoryName}...`}
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery.length === 0 && categorySlug === 'conversions' && (
        <>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
            Length conversion
            </h2>
        </>
      )}

      {filteredCalculators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalculators.map((calc) => (
            <Link href={`/category/${categorySlug}/${calc.slug}`} key={calc.id} className="group block h-full">
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
              <Construction className="mx-auto h-16 w-16 mb-6 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {calculators.length > 0 ? 'No Calculators Found' : 'Calculators Coming Soon'}
              </h2>
              <p className="text-lg text-muted-foreground">
                 {calculators.length > 0 
                  ? `Your search for "${searchQuery}" did not match any calculators in this category.`
                  : `Individual calculators for the ${categoryName} category are being built.`
                 }
              </p>
          </CardContent>
        </Card>
      )}

      {searchQuery.length === 0 && categorySlug === 'conversions' && (
        <h2 className="text-2xl font-bold tracking-tight text-foreground my-6">
          Area converter
        </h2>
      )}
    </>
  );
}
