import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BmiRangesMeaningPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">BMI Ranges: What Do Your Scores Mean?</h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <ul>
            <li>Underweight: &lt; 18.5</li>
            <li>Normal: 18.5–24.9</li>
            <li>Overweight: 25–29.9</li>
            <li>Obesity: ≥ 30 (classes I–III)</li>
          </ul>
          <p>Cutoffs can vary across regions and populations. Always interpret alongside clinical context.</p>
        </article>
      </div>
    </div>
  );
}


