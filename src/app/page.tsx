
import type { Metadata } from 'next';
import { CategoryCard } from '@/components/category-card';
import { categories } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { search } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { generateWebsiteSchema } from '@/lib/schema-generator';
import { DeferredSchema } from '@/components/deferred-schema';

// Force static generation for homepage to improve LCP
export const dynamic = 'force-static';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  const schema = generateWebsiteSchema();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DeferredSchema schema={schema} id="website-schema" />
      <main className="flex-1">
        <section className="relative w-full py-12 sm:py-16 md:py-24 lg:py-32 hero-pattern">
          <div className="container mx-auto text-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Calculate everything you want to
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              Your one-stop destination for all calculators. We offer a wide range of free online calculators for finance, health, and more.
            </p>
            <div className='mt-6 sm:mt-8 max-w-2xl mx-auto'>
              <form action={search} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    name="query"
                    type="text"
                    placeholder="e.g., 'Retirement', 'BMI', 'Mortgage'..."
                    required
                    className="w-full pl-9 sm:pl-10 text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto text-sm sm:text-base">
                  Search Calculators
                </Button>
              </form>
            </div>

          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Categories</h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Find the perfect tool for your needs.</p>
            </div>
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {categories.filter((category) => category.slug === 'finance' || category.slug === 'gaming' || category.slug === 'others').map((category) => (
                <CategoryCard key={category.slug} {...category} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
