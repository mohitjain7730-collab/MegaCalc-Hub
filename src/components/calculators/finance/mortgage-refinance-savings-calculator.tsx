'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Calculator, Globe, FileText, Info, Home } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  currentBalance: z.number().positive(),
  currentRatePercent: z.number().nonnegative(),
  remainingTermYears: z.number().positive(),
  newRatePercent: z.number().nonnegative(),
  newTermYears: z.number().positive(),
  closingCosts: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

type RefiResult = {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  breakevenMonths: number | null;
  totalInterestRemainingCurrent: number;
  totalInterestNew: number;
  totalSavings: number;
  opinion: string;
};

function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function MortgageRefinanceSavingsCalculator() {
  const [res, setRes] = useState<RefiResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentBalance: 0,
      currentRatePercent: 0,
      remainingTermYears: 0,
      newRatePercent: 0,
      newTermYears: 0,
      closingCosts: 0,
    },
  });

  const onSubmit = (v: FormValues) => {
    const remainingMonths = v.remainingTermYears * 12;
    const currentPmt = monthlyPayment(v.currentBalance, v.currentRatePercent, remainingMonths);
    const newMonths = v.newTermYears * 12;
    const newPmt = monthlyPayment(v.currentBalance, v.newRatePercent, newMonths);
    const monthlySavings = Math.max(0, currentPmt - newPmt);

    // Interest remaining (approx) using payment schedule without extra payments
    const totalPaidCurrent = currentPmt * remainingMonths;
    const totalInterestRemainingCurrent = Math.max(0, totalPaidCurrent - v.currentBalance);
    const totalPaidNew = newPmt * newMonths;
    const totalInterestNew = Math.max(0, totalPaidNew - v.currentBalance);

    const breakevenMonths = monthlySavings > 0 ? Math.ceil(v.closingCosts / monthlySavings) : null;
    const totalSavings = (totalInterestRemainingCurrent - totalInterestNew) - v.closingCosts;

    let opinion = 'Refinance may help if you plan to keep the loan long enough to recoup closing costs.';
    if (monthlySavings <= 0) opinion = 'New payment is not lower. Consider staying with your current loan.';
    else if (breakevenMonths !== null && breakevenMonths > 48) opinion = 'Long breakeven period. Refi only if you expect to hold the loan for many years.';
    else if (totalSavings > 0) opinion = 'Refi appears favorable: lower payment and positive lifetime savings after costs.';

    setRes({ currentPayment: currentPmt, newPayment: newPmt, monthlySavings, breakevenMonths, totalInterestRemainingCurrent, totalInterestNew, totalSavings, opinion });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Refinance Savings Calculator
          </CardTitle>
          <CardDescription>
            Calculate potential savings from refinancing your mortgage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="currentBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Loan Balance ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentRatePercent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="remainingTermYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining Term (years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="newRatePercent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="newTermYears" render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Term (years)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="closingCosts" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Closing Costs ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Calculate Refinance Savings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Refinance Comparison</CardTitle></div>
            <CardDescription>Your personalized comparison. Inputs remain blank until you enter values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Current Payment</p><p className="text-2xl font-bold">${res.currentPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
              <div><p className="text-sm text-muted-foreground">New Payment</p><p className="text-2xl font-bold">${res.newPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
              <div><p className="text-sm text-muted-foreground">Monthly Savings</p><p className="text-2xl font-bold">${res.monthlySavings.toLocaleString(undefined,{maximumFractionDigits:2})}</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div><p className="text-sm text-muted-foreground">Breakeven</p><p className="text-xl font-semibold">{res.breakevenMonths === null ? 'N/A' : `${res.breakevenMonths} mo`}</p></div>
              <div><p className="text-sm text-muted-foreground">Interest Remaining (Current)</p><p className="text-xl font-semibold">${res.totalInterestRemainingCurrent.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
              <div><p className="text-sm text-muted-foreground">Interest (New)</p><p className="text-xl font-semibold">${res.totalInterestNew.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
            </div>
            <div className="text-center mt-6"><p className="text-sm text-muted-foreground">Estimated Lifetime Savings after costs</p><p className="text-2xl font-bold">${res.totalSavings.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
            <div className="mt-4 text-center"><CardDescription>{res.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other mortgage and loan calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments for fixed-rate loans.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/arm-payment-projection-calculator" className="text-primary hover:underline">
                  ARM Payment Projection Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Project how ARM interest rates and payments may change.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Loan Amortization with Extra Payments
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate loan amortization schedules with extra payments.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/balloon-payment-loan-calculator" className="text-primary hover:underline">
                  Balloon Payment Loan Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate balloon payment loans with lower monthly payments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Mortgage Refinance Savings Calculation: Breakeven Point and Net Benefit" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the net savings from mortgage refinancing, covering the breakeven point, total interest saved, closing cost amortization, and the analysis of loan term changes." />
    <meta itemProp="keywords" content="mortgage refinance savings calculator, calculating breakeven point refinance, net present value of refinancing, total interest saved refinance, closing cost amortization refinance, debt service reduction" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-mortgage-refinance-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Mortgage Refinance Savings: Calculating Breakeven and Net Benefit</h1>
    <p className="text-lg italic text-muted-foreground">Master the financial analysis required to determine if lowering your interest rate justifies the upfront cost of refinancing.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#drivers" className="hover:underline">Primary Drivers of Refinance Savings</a></li>
        <li><a href="#breakeven" className="hover:underline">The Breakeven Point Calculation</a></li>
        <li><a href="#total-benefit" className="hover:underline">Calculating Total Interest Savings and Net Benefit</a></li>
        <li><a href="#term-change" className="hover:underline">Impact of Changing the Loan Term</a></li>
        <li><a href="#npv" className="hover:underline">Advanced Analysis: Net Present Value (NPV) of Refinancing</a></li>
    </ul>
<hr />

    {/* PRIMARY DRIVERS OF REFINANCE SAVINGS */}
    <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Primary Drivers of Refinance Savings</h2>
    <p>Mortgage refinancing involves paying off an existing loan with a new loan, typically to achieve better terms. The potential for savings is driven by two key factors: the **Interest Rate Differential** and the **Loan Term**. Analysis requires comparing the future cash flow of the old loan versus the new loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interest Rate Differential</h3>
    <p>The core incentive for refinancing is a drop in the interest rate. The greater the difference between the existing mortgage rate (R old) and the new mortgage rate (R new), the larger the savings generated on the monthly payment and the total interest paid over the life of the loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Upfront Closing Costs</h3>
    <p>Refinancing is not free. It involves **closing costs**, which typically range from 2% to 5% of the new loan principal. These costs (appraisal fees, title insurance, origination fees, etc.) are the financial hurdle that must be overcome by the projected monthly savings.</p>
    <p>The total net savings is calculated as the total cash inflow (monthly payment reductions) minus the total cash outflow (closing costs).</p>

<hr />

    {/* THE BREAKEVEN POINT CALCULATION */}
    <h2 id="breakeven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Breakeven Point Calculation</h2>
    <p>The <strong className="font-semibold">Breakeven Point</strong> is the time, measured in months, required for the accumulated monthly savings to equal the total upfront closing costs of the new loan. It tells the homeowner the minimum amount of time they must remain in the home to benefit from the refinance.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Breakeven Formula</h3>
    <p>The calculation is based on dividing the total cost of the refinance by the net monthly savings realized:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Breakeven Months = Total Closing Costs / (Old Monthly Payment - New Monthly Payment)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Refinance Decision Rule (Breakeven)</h3>
    <p>The standard decision rule based on the breakeven point is:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Refinance:</strong> If the expected number of months until the house is sold is **greater** than the Breakeven Months.</li>
        <li><strong className="font-semibold">Avoid Refinancing:</strong> If the expected number of months until the house is sold is **less** than the Breakeven Months.</li>
    </ul>

<hr />

    {/* CALCULATING TOTAL INTEREST SAVINGS AND NET BENEFIT */}
    <h2 id="total-benefit" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Total Interest Savings and Net Benefit</h2>
    <p>The total benefit of refinancing is the sum of all monthly payment reductions over the entire remaining life of the mortgage, minus the upfront costs. This requires accurately forecasting the total interest paid under both scenarios.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Total Interest Paid Calculation</h3>
    <p>The total interest paid for any loan is calculated by taking the total of all payments (Monthly Payment $\times$ Total Months) and subtracting the initial principal borrowed. This must be calculated for both the old loan and the new loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Savings Formula</h3>
    <p>The true financial gain is the difference between the interest saved and the cost incurred:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Net Savings = (Total Interest Old Loan - Total Interest New Loan) - Closing Costs'}
        </p>
    </div>
    <p>If the Net Savings is positive, the refinance is financially beneficial over the full term.</p>

<hr />

    {/* IMPACT OF CHANGING THE LOAN TERM */}
    <h2 id="term-change" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of Changing the Loan Term</h2>
    <p>Refinancing often presents the option to change the loan term (e.g., refinancing a remaining 25-year mortgage into a new 15-year mortgage). This change has the most dramatic impact on the total interest cost.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Shortening the Term (e.g., 30-year to 15-year)</h3>
    <p>This strategy significantly increases the monthly payment (decreasing the monthly savings or creating a net outflow) but drastically reduces the **total interest paid**. This is a wealth-building strategy, as the borrower achieves equity faster and minimizes the interest burden.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Lengthening the Term (e.g., 15-year to 30-year)</h3>
    <p>This strategy is typically used for debt restructuring. It lowers the monthly payment, improving immediate cash flow, but increases the **total interest paid** over the life of the loan. While it provides immediate relief, it is financially detrimental in the long term.</p>

<hr />

    {/* ADVANCED ANALYSIS: NET PRESENT VALUE (NPV) OF REFINANCING */}
    <h2 id="npv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Analysis: Net Present Value (NPV) of Refinancing</h2>
    <p>For the most rigorous financial analysis, refinancing should be viewed as a capital budgeting decision, utilizing the **Net Present Value (NPV)** method.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">NPV Methodology</h3>
    <p>The NPV calculation discounts all future cash flows (the difference between the old and new payments) back to the present using an appropriate discount rate (the required rate of return or opportunity cost). The formula is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'NPV = Sum [ (Old PMT - New PMT)_t / (1 + r)^t ] - Closing Costs'}
        </p>
    </div>
    <p>A positive NPV indicates that the present value of the savings exceeds the present value of the costs, making the refinance economically sound, even when accounting for the Time Value of Money.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Mortgage refinance analysis is fundamentally a comparison of future cash flows against current costs. The most crucial decision point is the **Breakeven Point**, which determines the minimum holding period required to recover the upfront closing fees.</p>
    <p>While maximizing the interest rate differential generates the highest savings, the ultimate financial gain must always be weighed against the **loan term**. Savvy refinancing prioritizes shortening the loan term to minimize the total interest paid and rapidly build home equity.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about mortgage refinancing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">When does refinancing make sense?</h4>
            <p className="text-muted-foreground">
              Refinancing makes sense when you can get a lower interest rate, want to shorten your loan term, or need to lower monthly payments. It's important to consider closing costs and how long you plan to stay in the home.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the breakeven point?</h4>
            <p className="text-muted-foreground">
              The breakeven point is the number of months it takes to recover the closing costs through monthly savings. Divide your closing costs by your monthly savings to calculate this number.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I refinance to a shorter or longer term?</h4>
            <p className="text-muted-foreground">
              A shorter term typically means higher monthly payments but less interest over the life of the loan. A longer term means lower monthly payments but more interest paid over time. Choose based on your financial goals and ability to make payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are closing costs?</h4>
            <p className="text-muted-foreground">
              Closing costs typically range from 2% to 5% of the loan amount and include lender fees, title insurance, appraisal fees, and other charges. Always ask for a detailed breakdown of all costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I refinance with negative equity?</h4>
            <p className="text-muted-foreground">
              Refinancing with negative equity (underwater) is difficult but possible through government programs like HARP or with the same lender. You may need to bring money to closing or extend the loan term.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is cash-out refinancing?</h4>
            <p className="text-muted-foreground">
              Cash-out refinancing allows you to borrow more than you owe on your current mortgage and receive the difference in cash. This increases your loan balance and monthly payment, so use it carefully.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does credit score affect refinancing?</h4>
            <p className="text-muted-foreground">
              Your credit score significantly impacts the interest rate you'll receive. A higher credit score typically means a lower interest rate. Check your credit report before applying and address any issues.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I lock my interest rate?</h4>
            <p className="text-muted-foreground">
              Rate locks protect you from interest rate increases during the loan process, typically for 30-60 days. If you expect rates to rise or want peace of mind, locking your rate is usually recommended.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a no-cost refinance?</h4>
            <p className="text-muted-foreground">
              A no-cost refinance rolls closing costs into the loan balance or charges a higher interest rate instead of upfront fees. This means no out-of-pocket costs but may result in higher long-term costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I refinance multiple times?</h4>
            <p className="text-muted-foreground">
              Yes, you can refinance multiple times, but each refinancing comes with closing costs. Make sure the savings from a new refinance will outweigh the costs. Generally, refinancing more than once should be done carefully and only when rates drop significantly.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="mortgage-refinance-savings-calculator" />
    </div>
  );
}


