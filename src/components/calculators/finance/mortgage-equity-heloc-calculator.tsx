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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Home Equity & HELOC
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

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


