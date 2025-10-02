
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export function WhatIsSip() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>What is a Systematic Investment Plan (SIP)?</h1>
      <p className="lead">
        A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money in mutual funds at regular intervals. This guide will walk you through everything you need to know.
      </p>

      {/* 
        ================================================================
        YOUR DETAILED 1200-1500 WORD CONTENT GOES HERE.
        ================================================================
      */}
      <p className="text-lg text-muted-foreground p-8 border-dashed border-2 rounded-lg text-center">
        [Your detailed 1200-1500 word content explaining SIPs, compounding, rupee cost averaging, etc., goes here.]
      </p>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">See It in Action</h2>
        <p className="text-muted-foreground mb-4">Use our calculator to project how your SIP can grow over time.</p>
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
