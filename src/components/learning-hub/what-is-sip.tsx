
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function WhatIsSip() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        A Complete Guide to Systematic Investment Plans (SIP)
      </h1>
      <p className="lead">
        A Systematic Investment Plan (SIP) is a powerful method of investing that allows you to invest a fixed amount of money at regular intervals. It's a disciplined approach to building wealth over time.
      </p>

      <Card className="my-8 bg-accent/50 border-l-4 border-primary">
        <CardContent className="p-6">
            <h3 className="mt-0">Key Takeaways</h3>
            <ul className="my-2">
                <li>SIPs help in disciplined investing through automation.</li>
                <li>They leverage Rupee Cost Averaging to mitigate market volatility.</li>
                <li>Compounding helps your investment grow exponentially over the long term.</li>
                <li>You can start a SIP with a small, manageable amount.</li>
            </ul>
        </CardContent>
      </Card>
      
      {/* 
        ================================================================
        YOUR DETAILED 1200-1500 WORD CONTENT GOES HERE.
        ================================================================
      */}
      <p className="text-lg text-muted-foreground p-8 border-dashed border-2 rounded-lg text-center">
        [Your detailed 1200-1500 word content explaining the mechanics, benefits, and types of SIPs, along with how to start one, goes here.]
      </p>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">Calculate your potential returns</h2>
        <p className="text-muted-foreground mb-4">Use our SIP calculator to project how your monthly investments can grow over time.</p>
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
