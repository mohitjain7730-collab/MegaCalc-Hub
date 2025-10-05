
import { CategoryCard } from '@/components/category-card';
import { categories } from '@/lib/categories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { List, Calculator, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchBar } from '@/components/search-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold mr-6">
            <Calculator className="h-6 w-6 text-primary" />
            <span className="text-lg">Mycalculating.com</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Learning Hub
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/learning-hub">All Articles</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 hero-pattern">
           <div className="container mx-auto text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Calculate everything you want to
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Your one-stop destination for all calculators. We offer a wide range of free online calculators for finance, health, and more.
            </p>
            <div className='mt-8'>
                <SearchBar />
            </div>
            <div className="mt-4 flex justify-center gap-4">
                <Button asChild>
                    <Link href="/calculators">
                        <List className="mr-2 h-4 w-4" />
                        Browse All Calculators
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
                    <p className="mt-2 text-muted-foreground">Find the perfect tool for your needs.</p>
                </div>
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {categories.map((category) => (
                    <CategoryCard key={category.slug} {...category} />
                    ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="py-6 md:px-8 md:py-0 bg-background border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
             <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy Policy
                </Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
