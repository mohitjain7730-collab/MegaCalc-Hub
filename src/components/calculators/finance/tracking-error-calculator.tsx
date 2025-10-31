'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  portfolioSeries: z.string().min(1).optional(),
  benchmarkSeries: z.string().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] {
  const matches = (s || '').match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  return matches.map(Number).filter(n => Number.isFinite(n));
}

export default function TrackingErrorCalculator() {
  const [result, setResult] = useState<{ trackingError: number; n: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { portfolioSeries: '', benchmarkSeries: '' },
  });

  const onSubmit = (v: FormValues) => {
    if (!v.portfolioSeries || !v.benchmarkSeries) { setResult(null); return; }
    const p = parseSeries(v.portfolioSeries);
    const b = parseSeries(v.benchmarkSeries);
    const n = Math.min(p.length, b.length);
    if (n < 3) { setResult({ trackingError: NaN, n, interpretation: 'Insufficient data to compute robust tracking error (need 3+ pairs).', suggestions: [] }); return; }
    const diffs = Array.from({ length: n }, (_, i) => p[i] - b[i]);
    const mean = diffs.reduce((s, x) => s + x, 0) / n;
    const variance = diffs.reduce((s, x) => s + (x - mean) * (x - mean), 0) / (n - 1);
    const te = Math.sqrt(variance);
    const interpretation = te <= 2 ? 'Low tracking error: portfolio closely follows the benchmark.' : te <= 5 ? 'Moderate tracking error: some active risk versus benchmark.' : 'High tracking error: substantial active risk relative to benchmark.';
    setResult({ trackingError: te, n, interpretation, suggestions: ['Align factor exposures with the benchmark.', 'Diversify idiosyncratic bets to reduce active risk.', 'Evaluate rebalancing frequency and implementation costs.'] });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Tracking Error Calculator</CardTitle>
          <CardDescription>Estimate the standard deviation of active returns from two series.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="portfolioSeries" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Returns (%, separated)</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 1.1 0.5 -0.3 0.7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="benchmarkSeries" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benchmark Returns (%, separated)</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 0.9 0.4 -0.2 0.6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle>
            <CardDescription>Benchmark-relative risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Pairs Used</p><p className="text-2xl font-bold">{result.n}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Tracking Error (%)</p><p className="text-2xl font-bold">{Number.isFinite(result.trackingError) ? result.trackingError.toFixed(3) : 'N/A'}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Risk and performance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/information-ratio-calculator" className="text-primary hover:underline">Information Ratio</a></h4><p className="text-sm text-muted-foreground">Uses tracking error for risk adjustment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/volatility-standard-deviation-calculator" className="text-primary hover:underline">Volatility Calculator</a></h4><p className="text-sm text-muted-foreground">Measure standalone risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Tracking Error</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for the detailed guide.</p><p>Include sampling frequency and annualization nuances.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Active risk measurement</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is tracking error?</h4><p className="text-muted-foreground">The standard deviation of the return differences between a portfolio and its benchmark.</p></div>
          <div><h4 className="font-semibold mb-2">How many observations are needed?</h4><p className="text-muted-foreground">More is better; we require at least 3 pairs for a basic estimate.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use monthly or daily data?</h4><p className="text-muted-foreground">Match your investment horizon and be consistent across series.</p></div>
          <div><h4 className="font-semibold mb-2">How do I annualize?</h4><p className="text-muted-foreground">Multiply by sqrt(periods per year) if your inputs are per-period returns.</p></div>
          <div><h4 className="font-semibold mb-2">What increases tracking error?</h4><p className="text-muted-foreground">Concentration, active factor tilts, and timing differences.</p></div>
          <div><h4 className="font-semibold mb-2">Is zero tracking error good?</h4><p className="text-muted-foreground">It indicates index-like behavior; whether that’s good depends on your goal.</p></div>
          <div><h4 className="font-semibold mb-2">Can it be compared across funds?</h4><p className="text-muted-foreground">Yes, if benchmarks and measurement windows are comparable.</p></div>
          <div><h4 className="font-semibold mb-2">Is TE symmetric to alpha?</h4><p className="text-muted-foreground">No. TE is risk; alpha is return relative to expectation.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


