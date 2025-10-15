import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToImproveYourBmiPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">How to Improve Your BMI: Healthy Weight Management Tips</h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <ul>
            <li>Prioritize protein and fiber‑rich whole foods.</li>
            <li>Target 150–300 min/week activity plus 2 days strength training.</li>
            <li>Sleep 7–9 hours and manage stress for appetite regulation.</li>
            <li>Set sustainable goals; avoid extreme diets.</li>
          </ul>
        </article>
      </div>
    </div>
  );
}


