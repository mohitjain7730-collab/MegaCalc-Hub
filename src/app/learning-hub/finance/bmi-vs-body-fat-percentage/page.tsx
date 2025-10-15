import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BmiVsBodyFatPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/learning-hub/finance">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Finance Articles
            </Link>
          </Button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">BMI vs. Body Fat Percentage: Key Differences Explained</h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <p>BMI is a height‑weight index; body fat percentage estimates adiposity. Use waist ratios and composition tools to contextualize BMI.</p>
        </article>
      </div>
    </div>
  );
}


