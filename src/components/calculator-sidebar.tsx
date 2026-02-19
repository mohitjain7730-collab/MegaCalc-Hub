"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, Menu } from 'lucide-react';
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

interface CalculatorSidebarProps {
  currentCategorySlug?: string;
}


interface SidebarContentProps {
  currentCategorySlug?: string;
  pathname: string;
  onMobileClose?: () => void;
}

function SidebarContent({ currentCategorySlug, pathname, onMobileClose }: SidebarContentProps) {
  return (
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
                onClick={onMobileClose}
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
    </div>
  );
}

export function CalculatorSidebar({ currentCategorySlug }: CalculatorSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-64 bg-background border-r z-30 overflow-hidden">
        <SidebarContent currentCategorySlug={currentCategorySlug} pathname={pathname} />
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
              <SidebarContent
                currentCategorySlug={currentCategorySlug}
                pathname={pathname}
                onMobileClose={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

