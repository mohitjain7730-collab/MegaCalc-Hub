import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToCalculateLoanInterestPage() {
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
            How to Calculate Loan Interest
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Understanding Loan Interest</h2>
          <p>Loan interest is the cost of borrowing money from a lender. It's calculated as a percentage of the principal amount and can be computed using different methods depending on the type of loan.</p>
          
          <h3>Types of Interest Calculation</h3>
          <h4>Simple Interest</h4>
          <p>Simple interest is calculated only on the principal amount:</p>
          <p><strong>Formula:</strong> Interest = Principal × Rate × Time</p>
          <p>Example: $10,000 loan at 5% annual rate for 2 years = $10,000 × 0.05 × 2 = $1,000</p>
          
          <h4>Compound Interest</h4>
          <p>Compound interest is calculated on the principal plus any accumulated interest:</p>
          <p><strong>Formula:</strong> A = P(1 + r/n)^(nt)</p>
          <ul>
            <li>A = Final amount</li>
            <li>P = Principal</li>
            <li>r = Annual interest rate</li>
            <li>n = Number of times interest compounds per year</li>
            <li>t = Time in years</li>
          </ul>
          
          <h3>Common Loan Types and Their Interest Calculations</h3>
          <h4>Mortgages</h4>
          <p>Most mortgages use compound interest with monthly compounding. The monthly payment includes both principal and interest.</p>
          
          <h4>Personal Loans</h4>
          <p>Personal loans typically use simple interest and have fixed monthly payments.</p>
          
          <h4>Credit Cards</h4>
          <p>Credit cards use compound interest with daily compounding, making them more expensive if balances aren't paid in full.</p>
          
          <h3>Factors Affecting Interest Rates</h3>
          <ul>
            <li><strong>Credit Score:</strong> Higher scores typically get lower rates</li>
            <li><strong>Loan Term:</strong> Longer terms often have higher rates</li>
            <li><strong>Loan Amount:</strong> Larger loans may qualify for better rates</li>
            <li><strong>Collateral:</strong> Secured loans typically have lower rates</li>
            <li><strong>Market Conditions:</strong> Economic factors affect base rates</li>
          </ul>
          
          <h3>Tips for Borrowers</h3>
          <ul>
            <li>Compare rates from multiple lenders</li>
            <li>Improve your credit score before applying</li>
            <li>Consider shorter loan terms to reduce total interest</li>
            <li>Make extra payments when possible</li>
            <li>Understand all fees and charges</li>
          </ul>
          
          <h3>Related Calculators</h3>
          <ul>
            <li><a href="/category/finance/loan-calculator" className="text-primary underline">Loan Calculator</a></li>
            <li><a href="/category/finance/mortgage-calculator" className="text-primary underline">Mortgage Calculator</a></li>
            <li><a href="/category/finance/compound-interest-calculator" className="text-primary underline">Compound Interest Calculator</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
