"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, BookOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/category-icon';
import { categories } from '@/lib/categories';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Learning Hub categories structure
const learningHubCategories = [
  {
    name: 'Finance',
    slug: 'finance',
    sections: [
      { name: 'Savings & Investment', slug: 'savings-and-investment' },
      { name: 'Retirement Planning', slug: 'retirement-planning' },
      { name: 'Budgeting & Personal Finance', slug: 'budgeting-personal-finance' },
      { name: 'Taxes & Tax Planning', slug: 'taxes-tax-planning' },
      { name: 'Credit & Debt Management', slug: 'credit-debt-management' },
      { name: 'Insurance & Risk Management', slug: 'insurance-risk-management' },
      { name: 'Banking & Accounts', slug: 'banking-accounts' },
      { name: 'Real Estate & Mortgages', slug: 'real-estate-mortgages' },
      { name: 'Loans & Lending', slug: 'loans-lending' },
      { name: 'Stocks & Securities', slug: 'stocks-securities' },
      { name: 'Mutual Funds & ETFs', slug: 'mutual-funds-etfs' },
      { name: 'Business & Corporate Finance', slug: 'business-corporate-finance' },
      { name: 'Financial Ratios & Analysis', slug: 'financial-ratios-analysis' },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    sections: [
      { name: 'Nutrition & Diet', slug: 'nutrition-diet' },
      { name: 'Weight & Metabolism', slug: 'weight-metabolism' },
      { name: 'Fitness & Sports', slug: 'fitness-sports' },
      { name: 'Body Composition', slug: 'body-composition' },
      { name: "Women's Health", slug: 'womens-health' },
      { name: 'Medical Risk Scores', slug: 'medical-risk-scores' },
      { name: 'Mental Health & Sleep', slug: 'mental-health-sleep' },
      { name: 'Longevity & Wellness', slug: 'longevity-wellness' },
    ],
  },
];

interface CalculatorSidebarProps {
  currentCategorySlug?: string;
}

export function CalculatorSidebar({ currentCategorySlug }: CalculatorSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Calculator Categories */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator Categories
          </h2>
        </div>
        <nav className="p-2 space-y-1">
          {categories.map((category) => {
            const isActive = currentCategorySlug === category.slug || pathname?.includes(`/category/${category.slug}`);
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <CategoryIcon
                  name={category.Icon}
                  className="h-4 w-4 flex-shrink-0"
                  strokeWidth={1.5}
                />
                <span className="truncate">{category.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Learning Hub Section */}
      <div className="border-t flex-shrink-0">
        <div className="p-4 border-b bg-background">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Hub
          </h2>
        </div>
        <nav className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
          {learningHubCategories.map((topic) => (
            <div key={topic.slug} className="space-y-1">
              <Link
                href={`/learning-hub/${topic.slug}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname?.includes(`/learning-hub/${topic.slug}`) && !pathname?.includes(`/learning-hub/${topic.slug}/`)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{topic.name}</span>
              </Link>
              <div className="pl-4 space-y-0.5">
                {topic.sections.map((section) => {
                  const isActive = pathname?.includes(`/learning-hub/${topic.slug}/${section.slug}`);
                  return (
                    <Link
                      key={section.slug}
                      href={`/learning-hub/${topic.slug}/${section.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block px-3 py-1.5 rounded-md text-xs transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {section.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-64 bg-background border-r z-30 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-16 left-4 z-30 lg:hidden shadow-md"
            >
              <Menu className="h-4 w-4 mr-2" />
              Categories
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 sm:w-80">
            <SheetHeader className="p-4 border-b sticky top-0 bg-background z-10">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

