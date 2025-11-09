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
  homeValue: z.number().positive(),
  firstMortgageBalance: z.number().nonnegative(),
  secondMortgageBalance: z.number().nonnegative().optional().nullable(),
  lenderMaxLtvPercent: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

type EquityResult = {
  equity: number;
  cltvPercent: number;
  estimatedMaxHeloc: number;
  opinion: string;
};

export default function MortgageEquityHelocCalculator() {
  const [res, setRes] = useState<EquityResult | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeValue: 0,
      firstMortgageBalance: 0,
      secondMortgageBalance: 0,
      lenderMaxLtvPercent: 85,
    },
  });

  const onSubmit = (v: FormValues) => {
    const totalLiens = (v.firstMortgageBalance || 0) + (v.secondMortgageBalance || 0);
    const equity = Math.max(0, v.homeValue - totalLiens);
    const cltv = v.homeValue > 0 ? (totalLiens / v.homeValue) * 100 : 0;
    const maxAllowedLiens = (v.lenderMaxLtvPercent / 100) * v.homeValue;
    const estimatedMaxHeloc = Math.max(0, maxAllowedLiens - totalLiens);
    let opinion = 'Healthy equity improves approval odds and terms. Keep CLTV within lender limits.';
    if (cltv > v.lenderMaxLtvPercent) opinion = 'Current CLTV exceeds typical limits. You may need to reduce balances or wait for appreciation.';
    setRes({ equity, cltvPercent: cltv, estimatedMaxHeloc, opinion });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Mortgage Equity / Home Equity Loan / HELOC Calculator
          </CardTitle>
          <CardDescription>
            Calculate home equity and estimate available HELOC amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="homeValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Value ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="firstMortgageBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>1st Mortgage Balance ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="secondMortgageBalance" render={({ field }) => (
                  <FormItem>
                    <FormLabel>2nd Mortgage/HELOC Balance ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lenderMaxLtvPercent" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lender Max CLTV (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Estimate Equity & HELOC
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Home Equity & HELOC Estimate</CardTitle></div>
            <CardDescription>Inputs stay blank so you can enter your values.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Equity</p><p className="text-2xl font-bold">${res.equity.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">CLTV</p><p className="text-2xl font-bold">{res.cltvPercent.toFixed(1)}%</p></div>
              <div><p className="text-sm text-muted-foreground">Est. Max HELOC</p><p className="text-2xl font-bold">${res.estimatedMaxHeloc.toLocaleString()}</p></div>
            </div>
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
            Explore other home equity and mortgage calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-refinance-savings-calculator" className="text-primary hover:underline">
                  Mortgage Refinance Savings
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate potential savings from refinancing your mortgage.
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
                <a href="/category/finance/loan-amortization-extra-payments-calculator" className="text-primary hover:underline">
                  Loan Amortization with Extra Payments
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate loan amortization schedules with extra payments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Home Equity, HELOC, and Home Equity Loan Calculations" />
    <meta itemProp="description" content="An expert guide detailing how to calculate home equity, the difference between a Home Equity Loan (fixed-rate installment) and a HELOC (revolving line of credit), key loan-to-value (LTV) ratios, and the repayment mechanics of equity-based debt." />
    <meta itemProp="keywords" content="home equity calculator formula, HELOC vs home equity loan, loan to value ratio LTV, combined loan to value CLTV, equity calculation real estate, debt service home equity, principal and interest home equity" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-home-equity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Home Equity and Equity-Based Loans (HELOC & Home Equity Loan)</h1>
    <p className="text-lg italic text-muted-foreground">Master the metrics used to determine the usable value locked in your home and the financial differences between the primary debt products that leverage it.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#equity-calc" className="hover:underline">Home Equity: Definition and Calculation</a></li>
        <li><a href="#ltv" className="hover:underline">The Critical Loan-to-Value (LTV) Ratio</a></li>
        <li><a href="#heloc" className="hover:underline">Home Equity Loan vs. HELOC: Debt Structures</a></li>
        <li><a href="#payment-mechanics" className="hover:underline">Payment and Amortization Mechanics</a></li>
        <li><a href="#risk" className="hover:underline">Financial Risks of Leveraging Home Equity</a></li>
    </ul>
<hr />

    {/* HOME EQUITY: DEFINITION AND CALCULATION */}
    <h2 id="equity-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Home Equity: Definition and Calculation</h2>
    <p><strong className="font-semibold">Home Equity</strong> is the difference between the current fair market value (FMV) of a home and the total amount of debt owed against it (the outstanding mortgage principal). It represents the homeowner’s true ownership stake in the property.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fundamental Equity Formula</h3>
    <p>Equity is the residual value claimed by the owner after all creditors are paid. The calculation is straightforward but highly dependent on an accurate appraisal of the home's current value:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Home Equity = Fair Market Value - Outstanding Mortgage Balance'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">How Equity Grows</h3>
    <p>Equity grows in two primary ways:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Amortization (Principal Paydown):</strong> The portion of the mortgage payment that reduces the outstanding principal balance (guaranteed, steady growth).</li>
        <li><strong className="font-semibold">Appreciation (Market Value Increase):</strong> The increase in the home’s market value due to external economic factors (variable and unpredictable).</li>
    </ol>

<hr />

    {/* THE CRITICAL LOAN-TO-VALUE (LTV) RATIO */}
    <h2 id="ltv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Loan-to-Value (LTV) Ratio</h2>
    <p>Lenders use the **Loan-to-Value (LTV) Ratio** to determine eligibility for a mortgage and any subsequent equity-based financing. LTV measures the ratio of debt to the home's value, indicating the lender's risk exposure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">LTV Formula</h3>
    <p>The LTV ratio is calculated by dividing the total mortgage debt by the home's appraised value:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'LTV = (Outstanding Mortgage Balance / Fair Market Value) * 100'}
        </p>
    </div>
    <p>Lenders typically set a maximum LTV for equity products, usually **80%** or **85%**. The accessible equity is the portion of the home's value that falls beneath this LTV cap.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Combined Loan-to-Value (CLTV)</h3>
    <p>For second liens (like a HELOC or Home Equity Loan), lenders use the **Combined Loan-to-Value (CLTV)** ratio, which includes *both* the first mortgage and the new equity debt. Lenders use a strict CLTV threshold (e.g., 90%) to manage the total debt exposure against the asset.</p>

<hr />

    {/* HOME EQUITY LOAN VS. HELOC: DEBT STRUCTURES */}
    <h2 id="heloc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Home Equity Loan vs. HELOC: Debt Structures</h2>
    <p>The two main products used to access home equity—the Home Equity Loan and the Home Equity Line of Credit (HELOC)—are fundamentally different in their structure and repayment mechanism.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Home Equity Loan (Second Mortgage)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Structure:</strong> Installment loan. Provides the entire loan amount in a single, lump-sum disbursement at closing.</li>
        <li><strong className="font-semibold">Interest Rate:</strong> Typically fixed, meaning payments remain constant for the life of the loan.</li>
        <li><strong className="font-semibold">Repayment:</strong> Fully amortizing loan with a fixed maturity date, similar to the first mortgage.</li>
        <li><strong className="font-semibold">Best for:</strong> Large, one-time expenses with predictable costs (e.g., major home renovations or debt consolidation).</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Home Equity Line of Credit (HELOC)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Structure:</strong> Revolving line of credit. The borrower can withdraw funds repeatedly up to the credit limit during a **draw period** (typically 5-10 years).</li>
        <li><strong className="font-semibold">Interest Rate:</strong> Almost always variable, tied to a prime index, leading to fluctuating monthly payments.</li>
        <li><strong className="font-semibold">Repayment:</strong> Often requires only interest-only payments during the draw period, followed by a fully amortizing repayment period.</li>
        <li><strong className="font-semibold">Best for:</strong> Ongoing, flexible expenses where the timing and amount are uncertain (e.g., funding college tuition over four years).</li>
    </ul>

<hr />

    {/* PAYMENT AND AMORTIZATION MECHANICS */}
    <h2 id="payment-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payment and Amortization Mechanics</h2>
    <p>The calculation of monthly payments for equity products depends heavily on whether the product is fixed-rate (amortizing) or variable-rate (revolving).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Amortization of a Home Equity Loan</h3>
    <p>The Home Equity Loan payment is calculated using the standard **Loan Amortization Formula** (Present Value of Annuity), where the payment (PMT) covers both interest and principal, ensuring the loan reaches a zero balance by the maturity date.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">HELOC Repayment Phases</h3>
    <p>A HELOC has two distinct repayment phases that significantly affect monthly cash flow:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Draw Period:</strong> Payments may be interest-only. This keeps monthly costs low but does not reduce the principal balance.</li>
        <li><strong className="font-semibold">Repayment Period:</strong> Once the draw period ends, the loan converts to a fully amortizing schedule. The monthly payment often increases dramatically ("payment shock") as the borrower must now pay both principal and interest.</li>
    </ol>
    <p>The HELOC payment calculation must project the new, higher payment required during the repayment period based on the outstanding principal balance at the end of the draw period.</p>

<hr />

    {/* FINANCIAL RISKS OF LEVERAGING HOME EQUITY */}
    <h2 id="risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Financial Risks of Leveraging Home Equity</h2>
    <p>While home equity financing offers lower interest rates than unsecured debt, it carries the significant risk of tying debt to the primary asset.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Foreclosure Risk</h3>
    <p>Because both Home Equity Loans and HELOCs are secured by the home, failure to make payments can lead to **foreclosure**, even if the first mortgage is current. The second lien holder has the right to force the sale of the home to recover the debt.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Appreciation vs. Payment Shock</h3>
    <p>If the home value decreases (depreciation), the homeowner could end up "underwater"—owing more than the home is worth. This, combined with the sudden increase in payments upon the HELOC's transition to the repayment phase (payment shock), creates a significant financial hazard, particularly for those who relied solely on interest-only payments.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Home equity represents the crucial net wealth built up in a property, quantified by the difference between the market value and the outstanding debt. Accessing this value requires strict adherence to the **Loan-to-Value (LTV) ratio** thresholds set by lenders.</p>
    <p>The decision between a fully amortizing **Home Equity Loan** (fixed-rate stability) and a **HELOC** (variable-rate flexibility) must be driven by the user's need for predictable cash flow versus the need for revolving access, always recognizing the added foreclosure risk associated with a secured second lien.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about home equity and HELOC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is home equity?</h4>
            <p className="text-muted-foreground">
              Home equity is the difference between your home's market value and the amount you owe on all mortgages and liens. It represents the portion of your home that you actually own.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is CLTV?</h4>
            <p className="text-muted-foreground">
              Combined Loan-to-Value (CLTV) is the ratio of all your mortgage balances combined to your home's appraised value, expressed as a percentage. Lenders use this to determine how much they'll let you borrow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a HELOC?</h4>
            <p className="text-muted-foreground">
              A Home Equity Line of Credit (HELOC) is a revolving line of credit that uses your home as collateral. You can borrow against it, pay it back, and borrow again up to your credit limit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between HELOC and home equity loan?</h4>
            <p className="text-muted-foreground">
              A HELOC is a revolving line of credit with variable rates, while a home equity loan is a lump sum with fixed rates. HELOCs offer flexibility but variable costs, while home equity loans provide predictable payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How much can I borrow with a HELOC?</h4>
            <p className="text-muted-foreground">
              Most lenders allow you to borrow up to 80-90% of your home's value, minus any existing mortgage balances. Your credit score, income, and CLTV ratio all affect the maximum amount you can borrow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What can I use a HELOC for?</h4>
            <p className="text-muted-foreground">
              You can use a HELOC for home improvements, debt consolidation, major purchases, education expenses, or any other purpose. However, using it for investments or business expenses may have tax implications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Are HELOC interest rates variable?</h4>
            <p className="text-muted-foreground">
              Yes, most HELOCs have variable interest rates that can change based on market conditions. Some lenders offer fixed-rate conversion options for specific portions of the balance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the risks of a HELOC?</h4>
            <p className="text-muted-foreground">
              HELOC risks include variable interest rates, potential for payment increases, possibility of foreclosure if you can't make payments, and temptation to overspend. Use HELOCs responsibly.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Is HELOC interest tax-deductible?</h4>
            <p className="text-muted-foreground">
              Interest on HELOCs may be tax-deductible if the funds are used for home improvements that add value to the home. Tax laws change frequently, so consult a tax professional for specific advice.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can I get a HELOC with bad credit?</h4>
            <p className="text-muted-foreground">
              It's difficult but possible to get a HELOC with bad credit. You'll likely face higher interest rates and lower credit limits. Consider improving your credit score before applying, or explore secured credit alternatives.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="mortgage-equity-heloc-calculator" />
    </div>
  );
}


