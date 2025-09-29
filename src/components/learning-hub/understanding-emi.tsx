
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function UnderstandingEmi() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
        Understanding Loans and EMIs
      </h1>
      <p className="lead">
        An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is paid off in full.
      </p>

      <Card className="my-8 bg-accent/50 border-l-4 border-primary">
        <CardContent className="p-6">
            <h3 className="mt-0">Key Takeaways</h3>
            <ul className="my-2">
                <li>EMIs consist of both a principal and an interest component.</li>
                <li>In the early stages of a loan, a larger portion of the EMI goes towards interest.</li>
                <li>As the loan matures, more of the EMI is allocated to paying down the principal.</li>
                <li>A shorter loan tenure means higher EMIs but lower total interest paid.</li>
            </ul>
        </CardContent>
      </Card>
      
      {/* 
        ================================================================
        YOUR DETAILED 1200-1500 WORD CONTENT GOES HERE.
        ================================================================
      */}
      <p className="text-lg text-muted-foreground p-8 border-dashed border-2 rounded-lg text-center">
        [Your detailed 1200-1500 word content explaining how loans work, the components of an EMI, the concept of amortization, the difference between fixed and floating rates, and how to use this information to make better borrowing decisions, goes here.]
      </p>

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold">Calculate your own EMI</h2>
        <p className="text-muted-foreground mb-4">Use our calculator to see your monthly payment and full amortization schedule.</p>
        <Button asChild size="lg">
          <Link href="/category/finance/loan-emi-calculator">
            <Calculator className="mr-2 h-5 w-5" />
            Go to Loan/EMI Calculator
          </Link>
        </Button>
      </div>
    </article>
  );
}
