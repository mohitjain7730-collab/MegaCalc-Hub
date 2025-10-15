import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToCalculateYourBmiPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">How to Calculate Your BMI: Step by Step Guide</h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <h2>Manual Calculation</h2>
          <p>Metric: divide weight in kilograms by height in meters squared. Imperial: divide pounds by inches squared and multiply by 703.</p>
          <h2>Using Online Tools</h2>
          <p>Prefer calculators that support both unit systems and validate inputs. Try our <a className="text-primary underline" href="/category/health-fitness/bmi-calculator">BMI Calculator</a>.</p>
          <h2>Troubleshooting</h2>
          <ul>
            <li>Double‑check unit conversions (cm → m, ft/in → in).</li>
            <li>Use recent, accurate measurements.</li>
            <li>Recalculate after significant weight or height updates.</li>
          </ul>
        </article>
      </div>
    </div>
  );
}


