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
  sizeP: z.number().min(-3).max(3),
  valueP: z.number().min(-3).max(3),
  momentumP: z.number().min(-3).max(3),
  qualityP: z.number().min(-3).max(3),
  lowVolP: z.number().min(-3).max(3),
  sizeB: z.number().min(-3).max(3),
  valueB: z.number().min(-3).max(3),
  momentumB: z.number().min(-3).max(3),
  qualityB: z.number().min(-3).max(3),
  lowVolB: z.number().min(-3).max(3),
});

type FormValues = z.infer<typeof formSchema>;

export default function StyleDriftAnalyzer() {
  const [result, setResult] = useState<{ diffs: { name: string; diff: number }[]; driftScore: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sizeP: 0.2, valueP: 0.1, momentumP: 0, qualityP: 0.1, lowVolP: 0, sizeB: 0, valueB: 0, momentumB: 0, qualityB: 0, lowVolB: 0 } });

  const num = (name: keyof FormValues, label: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2"><Input type="number" step="0.01" {...field} /><span className="text-sm text-muted-foreground">exposure</span></div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    const names = ['Size (SMB)', 'Value (HML)', 'Momentum (MOM)', 'Quality (QMJ)', 'Low Volatility (LVOL)'];
    const p = [v.sizeP, v.valueP, v.momentumP, v.qualityP, v.lowVolP];
    const b = [v.sizeB, v.valueB, v.momentumB, v.qualityB, v.lowVolB];
    const diffs = p.map((x, i) => ({ name: names[i], diff: x - b[i] }));
    const driftScore = Math.sqrt(diffs.reduce((s, d) => s + d.diff * d.diff, 0));
    const max = diffs.reduce((a, d) => Math.abs(d.diff) > Math.abs(a.diff) ? d : a, diffs[0]);
    const interpretation = `Overall drift score ${driftScore.toFixed(2)}. Largest shift in ${max.name} (${max.diff.toFixed(2)}). Consider rebalancing if drift exceeds policy bands.`;
    setResult({ diffs, driftScore, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Style Drift Analyzer</CardTitle>
          <CardDescription>Compare portfolio factor exposures to benchmark and quantify drift.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Portfolio Exposures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {num('sizeP', 'Size (SMB)')}
                  {num('valueP', 'Value (HML)')}
                  {num('momentumP', 'Momentum (MOM)')}
                  {num('qualityP', 'Quality (QMJ)')}
                  {num('lowVolP', 'Low Volatility (LVOL)')}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benchmark Exposures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {num('sizeB', 'Size (SMB)')}
                  {num('valueB', 'Value (HML)')}
                  {num('momentumB', 'Momentum (MOM)')}
                  {num('qualityB', 'Quality (QMJ)')}
                  {num('lowVolB', 'Low Volatility (LVOL)')}
                </div>
              </div>
              <div className="md:col-span-2"><Button type="submit">Analyze</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Exposure differences and drift score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.diffs.map(d => (
                <div key={d.name} className="flex justify-between border rounded px-3 py-2 text-sm">
                  <span>{d.name}</span>
                  <span className={Math.abs(d.diff) > 0.3 ? 'text-destructive' : 'text-foreground'}>{d.diff.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p><strong>Drift Score (Euclidean):</strong> {result.driftScore.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Style and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Exposure</Link></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</Link></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</Link></h4><p className="text-sm text-muted-foreground">Allocation targeting.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance</Link></h4><p className="text-sm text-muted-foreground">Risk floor.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sample Guide: Monitoring Style Drift</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Define policy bands for factor exposures. Rebalance or adjust mandates when drift exceeds tolerances.</p>
          <p>Use rolling windows to track persistence and link drift to performance attribution.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <details><summary>What is style drift?</summary><p>A shift in portfolio factor exposures away from benchmark or mandate.</p></details>
          <details><summary>Which factors are most common?</summary><p>Size, value, momentum, quality, and low volatility are widely used.</p></details>
          <details><summary>How do I quantify drift?</summary><p>Compare exposures and compute a distance metric (e.g., Euclidean).</p></details>
          <details><summary>What thresholds are material?</summary><p>Depends on policy; ±0.3 exposure often signals noticeable shift.</p></details>
          <details><summary>How often to measure?</summary><p>Quarterly or monthly, aligned with reporting cycles and data refresh.</p></details>
          <details><summary>Can drift be intentional?</summary><p>Yes for tactical tilts; document and monitor risk impacts.</p></details>
          <details><summary>What data do I need?</summary><p>Factor exposures from regressions or provider models for both portfolio and benchmark.</p></details>
          <details><summary>How is drift linked to performance?</summary><p>Non‑benchmark tilts can drive active returns and risk.</p></details>
          <details><summary>Is multi‑factor drift additive?</summary><p>Approximate via distance, but consider correlations among factors.</p></details>
          <details><summary>How do I remediate drift?</summary><p>Rebalance positions, update mandates, or hedge undesired factor bets.</p></details>
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="style-drift-analyzer" calculatorName="Style Drift Analyzer (Portfolio vs Benchmark)" />
    </div>
  );
}




