
'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { search } from '@/app/actions';

export function SearchBar() {
  return (
    <Card className="w-full max-w-3xl mx-auto my-8 border-primary/20 shadow-lg">
      <CardHeader>
        <div className='flex items-center gap-3 mb-2'>
            <SearchIcon className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Search Calculators</CardTitle>
        </div>
        <CardDescription>
          Can't find what you're looking for? Enter a keyword to search all available calculators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={search} className="flex flex-col sm:flex-row gap-2">
          <Input
            name="query"
            type="text"
            placeholder="e.g., 'Retirement', 'BMI', 'Mortgage'..."
            required
            className="flex-grow"
          />
          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
