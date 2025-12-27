'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  roa: z.number().min(-100).max(100).optional(),
  debtToEquity: z.number().min(0).max(100).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialLeverageEffectCalculator() {
  const [result, setResult] = useState<{ roe: number; leverageEffect: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { roa: undefined as unknown as number, debtToEquity: undefined as unknown as number, interestRate: undefined as unknown as number, taxRate: undefined as unknown as number },
  });

  const onSubmit = (v: FormValues) => {
    if (v.roa === undefined || v.debtToEquity === undefined || v.interestRate === undefined || v.taxRate === undefined) { setResult(null); return; }
    const rdAfterTax = v.interestRate * (1 - v.taxRate / 100);
    const roe = v.roa + v.debtToEquity * (v.roa - rdAfterTax);
    const leverageEffect = roe - v.roa;
    const interpretation = leverageEffect >= 0 ? 'Leverage increases ROE because ROA exceeds after-tax cost of debt.' : 'Leverage reduces ROE because ROA is less than after-tax cost of debt.';
    setResult({ roe, leverageEffect, interpretation, suggestions: ['Aim for ROA above the after-tax cost of debt to amplify ROE.', 'Avoid excessive leverage; rising rates or falling ROA can invert the benefit.', 'Stress-test scenarios for rate hikes and lower profitability.', 'Consider covenants and liquidity risk in leverage decisions.'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Financial Leverage Effect Calculator</CardTitle>
          <CardDescription>Estimate how leverage changes ROE given ROA, debt cost, and taxes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="roa" render={({ field }) => (<FormItem><FormLabel>ROA (%)</FormLabel><FormControl>{num('e.g., 8', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="debtToEquity" render={({ field }) => (<FormItem><FormLabel>Debt-to-Equity (x)</FormLabel><FormControl>{num('e.g., 1.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (<FormItem><FormLabel>Interest Rate on Debt (%)</FormLabel><FormControl>{num('e.g., 6', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ROE impact from leverage</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated ROE</p><p className="text-2xl font-bold">{result.roe.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Leverage Effect</p><p className={`text-2xl font-bold ${result.leverageEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.leverageEffect.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Capital structure optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Positive leverage effect amplifies returns to shareholders</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Negative leverage effect destroys shareholder value rapidly</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Capital structure and returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Assess profitability to shareholders.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Evaluate blended financing cost.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              ROE = ROA + (D/E) × (ROA - r_d × (1 - Tax Rate))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Leverage amplifies ROE when ROA exceeds the after-tax cost of debt.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">ROA & Interest Rate (%)</h4>
              <p className="text-sm text-muted-foreground">Return on assets and the borrowing cost on debt.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">D/E & Tax Rate</h4>
              <p className="text-sm text-muted-foreground">Debt-to-equity ratio and effective tax rate for interest shield.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Financial Leverage: The Double-Edged Sword" />
        <meta itemProp="description" content="Master financial leverage. Calculate how debt amplifies Return on Equity (ROE) and understand the precise tipping point where leverage destroys value." />
        <meta itemProp="keywords" content="Financial Leverage, ROE, ROA, Debt Financing, Capital Structure, Leverage Effect, Tax Shield, Bankruptcy Risk, WACC, Modigliani-Miller" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-financial-leverage" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Financial Leverage: Rocket Fuel for Returns</h1>
        <p className="text-lg italic text-muted-foreground">Archimedes said, "Give me a lever long enough and I shall move the world." In finance, if you give a CEO enough leverage, they will either become a billionaire or go bankrupt.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#mechanics" className="hover:underline">How The "Magic" Works</a></li>
          <li><a href="#tax-shield" className="hover:underline">The Tax Shield Bonus</a></li>
          <li><a href="#dangers" className="hover:underline">The "Death Spiral"</a></li>
          <li><a href="#optimal" className="hover:underline">Finding the Sweet Spot</a></li>
        </ul>
        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How The "Magic" Works</h2>
        <p>Imagine you buy a house for $100k. It goes up 10% to $110k.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>All Cash:</strong> You put in $100k, make $10k. <strong>Return = 10%</strong>.</li>
          <li><strong>With Leverage (Mortgage):</strong> You put in $20k, borrow $80k. House sells for $110k. You pay back $80k. You keep $30k (your $20k + $10k gain). <strong>Return = 50%</strong>.</li>
        </ul>
        <p>This is the <strong>Financial Leverage Effect</strong>. By using other people's money (OPM) at a fixed cost, you magnify the returns on your own equity.</p>
        <hr />

        <h2 id="tax-shield" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Tax Shield Bonus</h2>
        <p> Governments subsidize debt. Interest payments are tax-deductible expenses, whereas dividends paid to shareholders are not.</p>
        <p>This means the <em>effective</em> cost of debt is even lower than the interest rate. If your interest rate is 10% and tax rate is 30%, the debt only costs you 7%. This makes the hurdle for positive leverage even easier to clear.</p>
        <hr />

        <h2 id="dangers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Death Spiral"</h2>
        <p>Leverage works in reverse. If that house drops 10% to $90k:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>All Cash:</strong> You lose 10%. Painful, but survivable.</li>
          <li><strong>With Leverage:</strong> You sell for $90k, pay back $80k. You are left with $10k. You lost 50% of your money from a 10% drop.</li>
        </ul>
        <p>If assets drop 20%, your equity is wiped out completely. This is why highly levered companies (like Lehman Brothers) can vanish overnight.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Capital Structure & Risk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Good" Leverage?</h4>
            <p className="text-muted-foreground">
              Good leverage is debt used to buy productive assets (like factories or real estate) that generate cash flow <strong>higher</strong> than the interest cost. It pays for itself.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Bad" Leverage?</h4>
            <p className="text-muted-foreground">
              Bad leverage is borrowing to fund operating losses, stock buybacks at high valuations, or depreciating assets (like cars). It increases risk without increasing sustainable cash flow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does leverage affect stock price?</h4>
            <p className="text-muted-foreground">
              Yes, it increases Volatility (Beta). A highly levered company will swing wildly with economic news. Investors demand a higher expected return (cost of equity) to hold levered stocks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I know if a company has too much debt?</h4>
            <p className="text-muted-foreground">
              Look at the <strong>Interest Coverage Ratio</strong> (EBIT / Interest Expense). If it's below 2.0x, the company is walking on thin ice. Below 1.5x, the bond market usually treats it as "junk."
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the Modigliani-Miller Theorem?</h4>
            <p className="text-muted-foreground">
              A famous theory stating that in a perfect world (no taxes, no bankruptcy costs), capital structure doesn't matter. The value of the firm is determined by its assets, not how it pays for them. In the real world (with taxes and bankruptcy), structure matters a lot.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why do Tech companies have low leverage?</h4>
            <p className="text-muted-foreground">
              Because their assets are intangible (people, code) and their volatility is high. Banks don't like lending against "code." Utilities have high leverage because they have tangible power plants and predictable cash flow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does leverage increase WACC?</h4>
            <p className="text-muted-foreground">
              Initially, adding debt <em>lowers</em> WACC (because debt is cheaper than equity). But as you add too much debt, bankruptcy risk spikes, causing both debt and equity costs to soar, raising WACC. The goal is to find the minimum WACC point.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Financial Leverage is the multiplier of the business world.</p>
          <p>It turns boring 5% asset returns into exciting 15% equity returns—if you survive.</p>
          <p>Monitor your "Spread" (ROA - Cost of Debt) religiously; if it turns negative, leverage turns deadly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


