'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info } from 'lucide-react';

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Benchmarking tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</a></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Portfolio Exposure</a></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient frontier.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding tracking difference and tracking error for fund evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Tracking difference is the average return gap between a fund and its benchmark; tracking error is the standard deviation of that gap.</li>
            <li>Use both metrics to assess replication quality—low tracking difference and error indicate better benchmark tracking.</li>
            <li>Fee drag and sampling can create persistent negative tracking difference even when tracking error is small.</li>
            <li>Match frequency to your evaluation horizon: monthly for funds, daily for ETFs, annual for long-term assessments.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Tracking difference, tracking error, and fund benchmarking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is tracking difference?</h4><p className="text-muted-foreground">The average return difference between a fund and its benchmark over time, indicating persistent outperformance or underperformance.</p></div>
          <div><h4 className="font-semibold mb-2">How is it different from tracking error?</h4><p className="text-muted-foreground">Tracking error measures volatility of the difference; both are informative for understanding fund performance relative to benchmarks.</p></div>
          <div><h4 className="font-semibold mb-2">Which frequency should I use?</h4><p className="text-muted-foreground">Match your evaluation horizon; monthly is common for funds, daily for ETFs, annual for long-term assessments.</p></div>
          <div><h4 className="font-semibold mb-2">Why is average difference negative?</h4><p className="text-muted-foreground">Fees, taxes, and sampling can create a persistent lag versus the benchmark. Even low-cost index funds typically have small negative tracking differences.</p></div>
          <div><h4 className="font-semibold mb-2">Can tracking difference be positive?</h4><p className="text-muted-foreground">Occasionally due to securities lending income or sampling luck, but not guaranteed. Positive differences are rare for passive funds.</p></div>
          <div><h4 className="font-semibold mb-2">How many periods should I include?</h4><p className="text-muted-foreground">Use enough observations (e.g., 36–60 monthly) for stable estimates. More data provides better statistical significance.</p></div>
          <div><h4 className="font-semibold mb-2">Do I need to annualize results?</h4><p className="text-muted-foreground">Yes for comparability; this tool reports annualized stats based on frequency to enable comparisons across different evaluation periods.</p></div>
          <div><h4 className="font-semibold mb-2">How do large outliers affect results?</h4><p className="text-muted-foreground">They inflate tracking error; consider robust metrics for stress periods or use median-based measures for more stable estimates.</p></div>
          <div><h4 className="font-semibold mb-2">Is tracking error the same as active risk?</h4><p className="text-muted-foreground">Yes; it's the standard deviation of active returns, measuring the variability of fund performance relative to the benchmark.</p></div>
          <div><h4 className="font-semibold mb-2">How can I reduce tracking difference?</h4><p className="text-muted-foreground">Optimize replication, reduce fees, and manage cash drag and rebalancing slippage. Lower-cost funds typically have smaller tracking differences.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





