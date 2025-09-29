
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
        A Systematic Investment Plan, or SIP, is a method of investing a fixed amount of money in mutual funds at regular intervals. It's one of the most popular ways for individuals to build wealth over the long term through disciplined, passive investing.
      </p>

      <Card className="my-8 bg-accent/50 border-l-4 border-primary">
        <CardContent className="p-6">
            <h3 className="mt-0">Key Takeaways</h3>
            <ul className="my-2">
                <li>SIPs promote disciplined saving and investing habits.</li>
                <li>They leverage Rupee Cost Averaging to mitigate market volatility.</li>
                <li>The power of compounding can significantly enhance returns over time.</li>
                <li>It's an accessible way for retail investors to participate in the market.</li>
            </ul>
        </CardContent>
      </Card>
      
      {/* 
        ================================================================
        YOUR DETAILED 1200-1500 WORD CONTENT GOES HERE.
        You can add more sections using h2, h3, p, ul, ol, etc.
        For example:
        
        <h2>How Does a SIP Work?</h2>
        <p>Detailed explanation...</p>

        <h2>Benefits of SIP Investing</h2>
        <h3>1. Rupee Cost Averaging</h3>
        <p>More detailed explanation...</p>
        <h3>2. Power of Compounding</h3>
        <p>More detailed explanation...</p>

        <h2>How to Start a SIP</h2>
        <p>Step-by-step guide...</p>

        ================================================================
      */}
      <p className="text-lg text-muted-foreground p-8 border-dashed border-2 rounded-lg text-center">
        [Your detailed 1200-1500 word content explaining SIPs in detail, including benefits like Rupee Cost Averaging and the Power of Compounding, how to start a SIP, and what to look for in a mutual fund, goes here.]
      </p>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">Ready to see it in action?</h2>
        <p className="text-muted-foreground mb-4">Use our calculator to project the future value of your own SIP investments.</p>
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
