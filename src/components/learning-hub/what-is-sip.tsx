
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function WhatIsSip() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        What is a Systematic Investment Plan (SIP)?
      </h1>
      <p className="lead">
        Learn about disciplined investing, rupee cost averaging, and the power of compounding with SIPs.
      </p>

      <Card className="my-8 bg-accent/50 border-l-4 border-primary">
        <CardContent className="p-6">
            <h3 className="mt-0">Key Takeaways</h3>
            <ul className="my-2">
                <li>What a SIP is and how it automates investing.</li>
                <li>The benefits of Rupee Cost Averaging and compounding.</li>
                <li>How to start investing with a SIP.</li>
            </ul>
        </CardContent>
      </Card>
      
      {/* 
        ================================================================
        YOUR DETAILED 1200-1500 WORD CONTENT GOES HERE.
        ================================================================
      */}
      <p className="text-lg text-muted-foreground p-8 border-dashed border-2 rounded-lg text-center">
        [Your detailed 1200-1500 word content explaining what a SIP is, its benefits, the mechanics of how it works, and how to get started, goes here.]
      </p>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">See it in action</h2>
        <p className="text-muted-foreground mb-4">Use our SIP calculator to project the future value of your investments.</p>
        <Button asChild size="lg">
          <Link href="/category/finance/sip-calculator">
            <Calculator className="mr-2 h-5 w-5" />
            Go to SIP Calculator
          </Link>
        </Button>
      </div>
    </article>
  );
}
