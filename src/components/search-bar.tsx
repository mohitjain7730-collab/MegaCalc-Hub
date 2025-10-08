
'use client';

import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { search } from '@/app/actions';

export function SearchBar() {
  return (
    <form action={search} className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-grow">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          name="query"
          type="text"
          placeholder="e.g., 'Retirement', 'BMI', 'Mortgage'..."
          required
          className="w-full pl-10"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Search
      </Button>
    </form>
  );
}
