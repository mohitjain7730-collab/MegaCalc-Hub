'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  riskFree: z.number().min(-100).max(100),
  marketReturn: z.number().min(-100).max(100),
  beta: z.number().min(-5).max(5),
});

type FormValues = z.infer<typeof formSchema>;

export default function SecurityMarketLineCalculator() {
  const [result, setResult] = useState<{ expectedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { riskFree: 2, marketReturn: 8, beta: 1 } });

  const onSubmit = (v: FormValues) => {
    const rf = v.riskFree / 100;
    const rm = v.marketReturn / 100;
    const er = rf + v.beta * (rm - rf);
    const text = `At beta ${v.beta.toFixed(2)}, expected return is ${(er*100).toFixed(2)}% on the SML.`;
    setResult({ expectedReturn: er * 100, interpretation: text });
  };

  const num = (name: keyof FormValues, label: string, suffix = '%') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2"><Input type="number" step="0.01" {...field} /><span className="text-sm text-muted-foreground">{suffix}</span></div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Security Market Line (SML)</CardTitle>
          <CardDescription>CAPM expected return from beta, risk‑free rate, and market return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {num('riskFree', 'Risk‑Free Rate')}
              {num('marketReturn', 'Market Expected Return')}
              {num('beta', 'Security Beta', '')}
              <div className="md:col-span-3"><Button type="submit">Calculate</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Positioning along the SML</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Expected Return:</strong> {result.expectedReturn.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{result.interpretation} Compare realized returns to assess alpha relative to CAPM.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Risk and return</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</Link></h4><p className="text-sm text-muted-foreground">Risk‑adjusted performance.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Exposure</Link></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</Link></h4><p className="text-sm text-muted-foreground">Efficient frontier.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</Link></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sample Guide: Using the SML for Expected Return</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The SML maps beta to expected return via CAPM. It’s a benchmark for pricing systematic risk.</p>
          <p>Deviations from the SML suggest alpha (positive or negative) or model misspecification.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <details><summary>What is the SML?</summary><p>A line relating expected return to beta under CAPM.</p></details>
          <details><summary>What inputs do I need?</summary><p>Risk‑free rate, market expected return, and the security’s beta.</p></details>
          <details><summary>How do I interpret beta 1?</summary><p>Matches market risk; expected return equals market expected return.</p></details>
          <details><summary>What if beta is negative?</summary><p>Expect returns below the risk‑free rate if the market premium is positive.</p></details>
          <details><summary>Does CAPM hold in practice?</summary><p>It’s an approximation; consider multi‑factor models for richer explanations.</p></details>
          <details><summary>Is beta stable over time?</summary><p>No; re‑estimate periodically using consistent horizons.</p></details>
          <details><summary>What horizon should I use?</summary><p>Annualized inputs are typical; keep units consistent.</p></details>
          <details><summary>What is alpha vs SML?</summary><p>Excess realized return above the CAPM expectation at given beta.</p></details>
          <details><summary>How does changing Rf affect SML?</summary><p>Shifts intercept and alters expected return at all betas.</p></details>
          <details><summary>Why is market premium important?</summary><p>It scales expected returns per unit of beta risk.</p></details>
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="security-market-line-calculator" calculatorName="Security Market Line (SML) Calculator" />
    </div>
  );
}




