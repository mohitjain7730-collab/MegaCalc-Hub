'use client';

import { useState, useMemo } from 'react';
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
  marketStdev: z.number().min(0).max(200),
  targetStdev: z.number().min(0).max(200),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalMarketLineCalculator() {
  const [result, setResult] = useState<{ slope: number; expectedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { riskFree: 2, marketReturn: 8, marketStdev: 15, targetStdev: 10 } });

  const numInput = (name: keyof FormValues, label: string, suffix = '%') => (
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

  const onSubmit = (v: FormValues) => {
    const rf = v.riskFree / 100;
    const rm = v.marketReturn / 100;
    const sm = v.marketStdev / 100;
    const st = v.targetStdev / 100;
    const slope = sm > 0 ? (rm - rf) / sm : 0;
    const expectedReturn = rf + slope * st;
    const interpretation = `CML slope ${(slope).toFixed(3)} implies an expected return ${(expectedReturn*100).toFixed(2)}% at ${(st*100).toFixed(1)}% volatility. Higher target risk scales return linearly along the CML.`;
    setResult({ slope, expectedReturn: expectedReturn * 100, interpretation });
  };

  const rfVariants = useMemo(() => [-1, 0, 2, 4], []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Capital Market Line (CML)</CardTitle>
          <CardDescription>Compute CML slope and expected return at a target volatility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numInput('riskFree', 'Risk‑Free Rate')}
              {numInput('marketReturn', 'Market Expected Return')}
              {numInput('marketStdev', 'Market Volatility (σm)')}
              {numInput('targetStdev', 'Target Portfolio Volatility')}
              <div className="md:col-span-2"><Button type="submit">Calculate</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Return scales with risk along the CML</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Slope:</strong> {(result.slope).toFixed(3)}</p>
            <p><strong>Expected Return at target σ:</strong> {result.expectedReturn.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            <div className="text-sm text-muted-foreground">What‑ifs by risk‑free rate: {rfVariants.map(v => <span key={v} className="mr-2">RF {v}%</span>)}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Portfolio theory</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</Link></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</Link></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance</Link></h4><p className="text-sm text-muted-foreground">Risk floor.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</Link></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sample Guide: Understanding the CML</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The CML links portfolio risk (σ) to expected return when combining the market portfolio with the risk‑free asset. The slope equals the market Sharpe ratio.</p>
          <p>Levered positions extend above the market volatility; de‑levered positions lie between the risk‑free rate and market point.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <details><summary>What inputs define the CML?</summary><p>Risk‑free rate, market expected return, and market volatility set the slope and intercept.</p></details>
          <details><summary>How is CML slope computed?</summary><p>(Rm − Rf) / σm, which equals the market Sharpe ratio.</p></details>
          <details><summary>What does a higher slope imply?</summary><p>Greater expected return per unit of risk, improving attractiveness of levering the market portfolio.</p></details>
          <details><summary>Can expected return be below the CML?</summary><p>Yes; inefficient portfolios lie below the CML, indicating suboptimal risk‑return trade‑off.</p></details>
          <details><summary>How does leverage show on the CML?</summary><p>Target σ above market σ implies borrowing at Rf to invest more in the market portfolio.</p></details>
          <details><summary>Does changing Rf move the CML?</summary><p>Yes; it shifts up/down and changes slope via the risk premium.</p></details>
          <details><summary>Is the market point always efficient?</summary><p>Under CAPM assumptions yes; in practice consider frictions, constraints, and estimation error.</p></details>
          <details><summary>What horizon are inputs?</summary><p>Annualized returns and volatility are typical; be consistent across inputs.</p></details>
          <details><summary>Can I use this for target‑date planning?</summary><p>It provides a simple return‑risk mapping but does not replace full glidepath analysis.</p></details>
          <details><summary>How often should I update inputs?</summary><p>At least annually or when risk‑free rates and market conditions change materially.</p></details>
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="capital-market-line-calculator" calculatorName="Capital Market Line (CML) Calculator" />
    </div>
  );
}




