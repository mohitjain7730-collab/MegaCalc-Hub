'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        <>
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
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Performance optimization</CardDescription>
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
                  <span className="text-sm font-medium">Use tracking error to budget active risk across managers</span>
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
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Ex-post tracking error may differ significantly from ex-ante models</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
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
              Tracking Error = σ(Portfolio Returns - Benchmark Returns)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Standard deviation of active returns measures deviation from the benchmark.
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
              <h4 className="font-semibold mb-2">Portfolio Returns</h4>
              <p className="text-sm text-muted-foreground">Series of periodic returns for your portfolio.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Benchmark Returns</h4>
              <p className="text-sm text-muted-foreground">Corresponding benchmark returns for the same periods.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Tracking Error</h1>
        <p className="text-lg italic text-muted-foreground">Understand active risk and how portfolios deviate from benchmarks.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Tracking Error?</h2>
        <p>Tracking error measures the volatility of the difference between portfolio and benchmark returns. Higher tracking error means more active risk—the portfolio deviates more from its benchmark.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Interpreting Values</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Low TE (0-2%):</strong> Index-like behavior.</li>
          <li><strong>Moderate TE (2-5%):</strong> Active management with some benchmark deviation.</li>
          <li><strong>High TE (&gt;5%):</strong> Significant active bets.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Tracking error is essential for understanding active risk. Use it alongside Information Ratio to evaluate whether active bets are being rewarded.</p>
      </section>

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

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Tracking Error measures the standard deviation of active returns (portfolio minus benchmark). Higher TE indicates more active risk and greater deviation from the benchmark strategy.</p></CardContent>
      </Card>
    </div>
  );
}


