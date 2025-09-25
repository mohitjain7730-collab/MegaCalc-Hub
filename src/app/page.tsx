
import { CategoryCard } from '@/components/category-card';
import { categories } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/search-bar';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 bg-background">
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center my-8 md:my-12">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            MegaCalc Hub
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground">
            500+ Calculators for Every Niche – starting with Personal Finance &
            Investing
          </p>
        </div>
        <ThemeToggle />
      </div>


      <SearchBar />
      <div className="mt-4">
        <Button asChild variant="link" className="text-muted-foreground">
          <Link href="/calculators">
            <List className="mr-2 h-4 w-4" />
            Or, see a list of all calculators
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {categories.map((category) => (
          <CategoryCard key={category.slug} {...category} />
        ))}
      </div>
    </main>
  );
}
