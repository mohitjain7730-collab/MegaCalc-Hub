
import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Gamepad2 } from 'lucide-react';

import { CategoryCard } from '@/components/category-card';
import { categories } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateWebsiteSchema } from '@/lib/schema-generator';
import { calculators } from '@/lib/calculators';
import { search } from '@/app/actions';

// Force server-side rendering so all content is in the initial HTML
export const dynamic = 'force-dynamic';

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

  const featuredGamingCalculators = calculators
    .filter((calculator) => calculator.category === 'gaming')
    .slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script type="application/ld+json" id="website-schema" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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

        {featuredGamingCalculators.length > 0 && (
          <section className="py-10 sm:py-14 md:py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
                      Popular Gaming Calculators
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Jump straight into our most useful gaming and Minecraft tools.
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link href="/category/gaming">
                    View all gaming calculators
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {featuredGamingCalculators.map((calc) => (
                  <Link
                    key={calc.id}
                    href={`/category/${calc.category}/${calc.slug}`}
                    className="group rounded-lg border bg-card hover:border-primary/60 hover:shadow-sm transition-all p-3 sm:p-4 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary line-clamp-2">
                        {calc.name}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-3">
                        {calc.metaDescription || calc.description}
                      </p>
                    </div>
                    <span className="mt-2 text-[11px] sm:text-xs text-primary font-medium group-hover:underline">
                      Open calculator
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 text-center sm:hidden">
                <Button asChild variant="outline" size="sm">
                  <Link href="/category/gaming">
                    View all gaming calculators
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
