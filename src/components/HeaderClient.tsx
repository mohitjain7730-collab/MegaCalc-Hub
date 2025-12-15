"use client";

import Link from "next/link";
import { Calculator, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const ThemeToggle = dynamic(
    () => import("@/components/ThemeToggle").then((mod) => mod.ThemeToggle),
    { ssr: false }
);

export function HeaderClient() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container flex h-14 items-center">
                <Link href="/" className="flex items-center gap-2 font-bold mr-4">
                    <Calculator className="h-6 w-6 text-primary" />
                    <span className="hidden sm:inline-block text-lg">Mycalculating.com</span>
                </Link>
                <div className="ml-auto flex items-center gap-2 sm:gap-4">
                    <Button asChild variant="ghost" className="px-2 sm:px-4">
                        <Link href="/ai-tool">
                            <Sparkles className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline-block">Try Our AI Tool</span>
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="px-2 sm:px-4">
                        <Link href="/learning-hub">
                            <BookOpen className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline-block">Learning Hub</span>
                        </Link>
                    </Button>
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
