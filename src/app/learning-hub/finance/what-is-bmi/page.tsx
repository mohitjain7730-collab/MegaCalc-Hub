import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhatIsBmiPage() {
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
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            What is BMI? Understanding Body Mass Index
          </h1>
        </div>
        <article className="prose dark:prose-invert max-w-none">
          <p>Body Mass Index (BMI) is a simple height‑to‑weight ratio used to categorize weight status. It is calculated as weight divided by height squared. Clinicians use BMI at a population level to screen for potential health risks but not as a direct measure of body fat or health.</p>
          <h2>Formula and Units</h2>
          <ul>
            <li>Metric: BMI = kg / m²</li>
            <li>Imperial: BMI = (lbs / in²) × 703</li>
          </ul>
          <h2>History and Context</h2>
          <p>Developed in the 19th century by Adolphe Quetelet, BMI became a public‑health screening tool due to its simplicity and correlation with health outcomes at scale.</p>
          <h2>How It Differs from Other Metrics</h2>
          <p>BMI does not distinguish between fat and muscle or describe fat distribution. Complement it with waist measures, body fat estimates, and clinical evaluation.</p>
        </article>
      </div>
    </div>
  );
}


