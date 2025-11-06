'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  fund: z.string().min(1),
  bench: z.string().min(1),
  frequency: z.enum(['daily', 'monthly', 'annual']),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] | null {
  try {
    const parts = s.replace(/\n/g, ',').split(',').map(x => x.trim()).filter(Boolean);
    const arr = parts.map(p => {
      let v = parseFloat(p.replace('%',''));
      if (!Number.isFinite(v)) throw new Error('bad');
      if (Math.abs(v) > 2) v = v / 100; // assume % if > 2 in magnitude
      return v;
    });
    return arr.length ? arr : null;
  } catch { return null; }
}

export default function TrackingDifferenceCalculator() {
  const [result, setResult] = useState<{ meanDiff: number; stdDiff: number; annMean: number; annStd: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { fund: '', bench: '', frequency: 'monthly' } });

  const onSubmit = (v: FormValues) => {
    const a = parseSeries(v.fund);
    const b = parseSeries(v.bench);
    if (!a || !b || a.length !== b.length || a.length < 3) { setResult(null); return; }
    const diffs = a.map((x, i) => x - b[i]);
    const mean = diffs.reduce((s, x) => s + x, 0) / diffs.length;
    const varx = diffs.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, diffs.length - 1);
    const std = Math.sqrt(varx);
    const scale = v.frequency === 'daily' ? Math.sqrt(252) : v.frequency === 'monthly' ? Math.sqrt(12) : 1;
    const annMean = mean * (v.frequency === 'daily' ? 252 : v.frequency === 'monthly' ? 12 : 1);
    const annStd = std * scale;
    const interpretation = `Average tracking difference ${(annMean*100).toFixed(2)}% per year with volatility ${(annStd*100).toFixed(2)}%. Lower absolute tracking difference suggests closer benchmark replication.`;
    setResult({ meanDiff: mean * 100, stdDiff: std * 100, annMean: annMean * 100, annStd: annStd * 100, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Tracking Difference</CardTitle>
          <CardDescription>Compare fund vs benchmark periodic returns to quantify average difference and dispersion.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fund" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Returns (comma or newline)</FormLabel>
                    <FormControl><Textarea rows={6} placeholder="0.8%,1.0%,−0.4%,0.3%" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bench" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benchmark Returns (comma or newline)</FormLabel>
                    <FormControl><Textarea rows={6} placeholder="0.7%,0.9%,−0.5%,0.4%" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="frequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )} />
              <Button type="submit">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Annualized summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Annualized Avg Difference:</strong> {result.annMean.toFixed(2)}%</p>
            <p><strong>Annualized Volatility of Difference:</strong> {result.annStd.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Benchmarking tools</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</Link></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Exposure</Link></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</Link></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</Link></h4><p className="text-sm text-muted-foreground">Efficient frontier.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sample Guide: Tracking Difference vs Tracking Error</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Tracking difference is the average return gap; tracking error is the standard deviation of that gap. Use both to assess replication quality.</p>
          <p>Fee drag and sampling can create persistent negative tracking difference even when tracking error is small.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <details><summary>What is tracking difference?</summary><p>The average return difference between a fund and its benchmark over time.</p></details>
          <details><summary>How is it different from tracking error?</summary><p>Tracking error measures volatility of the difference; both are informative.</p></details>
          <details><summary>Which frequency should I use?</summary><p>Match your evaluation horizon; monthly is common for funds, daily for ETFs.</p></details>
          <details><summary>Why is average difference negative?</summary><p>Fees, taxes, and sampling can create a persistent lag versus the benchmark.</p></details>
          <details><summary>Can tracking difference be positive?</summary><p>Occasionally due to securities lending or sampling luck, but not guaranteed.</p></details>
          <details><summary>How many periods should I include?</summary><p>Use enough observations (e.g., 36–60 monthly) for stable estimates.</p></details>
          <details><summary>Do I need to annualize results?</summary><p>Yes for comparability; this tool reports annualized stats based on frequency.</p></details>
          <details><summary>How do large outliers affect results?</summary><p>They inflate tracking error; consider robust metrics for stress periods.</p></details>
          <details><summary>Is tracking error the same as active risk?</summary><p>Yes; it’s the standard deviation of active returns.</p></details>
          <details><summary>How can I reduce tracking difference?</summary><p>Optimize replication, reduce fees, and manage cash drag and rebalancing slippage.</p></details>
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="tracking-difference-calculator" calculatorName="Tracking Difference Calculator" />
    </div>
  );
}




