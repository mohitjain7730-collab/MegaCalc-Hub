import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HealthRisksOfBmiPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">Health Risks Associated with High or Low BMI</h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <p>Population data link high BMI with cardiovascular disease, diabetes, and some cancers. Low BMI may associate with nutrient deficiencies and fragility in some groups. Individual risk varies—discuss results with a clinician.</p>
        </article>
      </div>
    </div>
  );
}


