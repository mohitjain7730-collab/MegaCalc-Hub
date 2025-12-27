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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Tracking Error: Measuring Active Risk" />
        <meta itemProp="description" content="Calculate Tracking Error (Active Risk) to understand portfolio deviation from benchmarks. Essential for evaluating active management consistency and closet indexing." />
        <meta itemProp="keywords" content="Tracking Error, Active Risk, Portfolio Performance, Benchmark Deviation, Information Ratio, Closet Indexing, Standard Deviation" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-tracking-error" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Tracking Error: The Price of Being Different</h1>
        <p className="text-lg italic text-muted-foreground">If you want to beat the market, you have to look different from the market. Tracking Error measures <em>how</em> different you look.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Active Risk?</a></li>
          <li><a href="#ranges" className="hover:underline">Typical Ranges by Strategy</a></li>
          <li><a href="#closet-indexing" className="hover:underline">The "Closet Indexer" Scam</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations & Warnings</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is "Active Risk"?</h2>
        <p>Tracking Error is often called "Active Risk." It is defined as the <strong>Standard Deviation of the Active Returns</strong> (Portfolio Return minus Benchmark Return).</p>
        <p>A simpler way to think about it: It measures the "volatility of the difference."</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>If you own the exact S&P 500 ETF (SPY), your Tracking Error against the S&P 500 is <strong>0%</strong>.</li>
          <li>If you own a concentric portfolio of 5 tech stocks, your Tracking Error against the S&P 500 might be <strong>15%</strong>.</li>
        </ul>
        <hr />

        <h2 id="ranges" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Typical Ranges by Strategy</h2>
        <p>Use these benchmarks to categorize a fund:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 font-bold">Tracking Error</th>
                <th className="p-2 font-bold">Fund Type</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="p-2">0.0% - 0.2%</td><td className="p-2">Passive Index Fund (ETF)</td></tr>
              <tr className="border-b"><td className="p-2">0.5% - 2.0%</td><td className="p-2">Enhanced Index / Smart Beta</td></tr>
              <tr className="border-b"><td className="p-2">3.0% - 8.0%</td><td className="p-2">True Active Management</td></tr>
              <tr className="border-b"><td className="p-2">10.0% +</td><td className="p-2">Concentrated / Aggressive / Hedge Fund</td></tr>
            </tbody>
          </table>
        </div>
        <hr />

        <h2 id="closet-indexing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Closet Indexer" Scam</h2>
        <p>One of the biggest problems in the mutual fund industry is "Closet Indexing."</p>
        <p>This happens when a manager charges high fees (e.g., 1.5%) for "active management," but builds a portfolio that basically mirrors the benchmark (Tracking Error &lt; 2%). They are hugging the index to avoid getting fired for underperformance, but their high fees guarantee they will lag the index. <strong>High fees + Low Tracking Error = Rip-off.</strong></p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Advanced Risk metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Is high Tracking Error good or bad?</h4>
            <p className="text-muted-foreground">
              It is neutral. It just means "different." If you are right, high tracking error leads to massive outperformance. If you are wrong, it leads to massive underperformance. You cannot have high alpha without high tracking error.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does it relate to Information Ratio?</h4>
            <p className="text-muted-foreground">
              Information Ratio is simply (Alpha / Tracking Error). It divides the reward (Alpha) by the risk taken to get it (Tracking Error). A manager with high Tracking Error but low Alpha has a terrible Information Ratio.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can Tracking Error predict future returns?</h4>
            <p className="text-muted-foreground">
              No, it only predicts the <em>dispersion</em> of future returns relative to the benchmark. A high TE fund will likely be either at the top or bottom of the performance league table; a low TE fund will be in the middle using index-like returns.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Ex-Ante" vs. "Ex-Post" Tracking Error?</h4>
            <p className="text-muted-foreground">
              <strong>Ex-Post (this calculator):</strong> Based on historical realized returns.
              <br />
              <strong>Ex-Ante:</strong> A forward-looking estimate based on a factor risk model (like Barra) predicting how the current holdings <em>should</em> deviate from the benchmark.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does cash affect Tracking Error?</h4>
            <p className="text-muted-foreground">
              Yes. If a fund holds 10% Cash and the benchmark is 100% Equities, the cash drag will create tracking error whenever the market moves up or down (since cash stays flat).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why annualize it?</h4>
            <p className="text-muted-foreground">
              Standard practice. If calculated on monthly data, multiply by √12 (approx 3.46). If calculated on daily data, multiply by √252 (approx 15.87). This makes it comparable across different reporting periods.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Tracking Error is the "Maverick Metric."</p>
          <p>It tells you if a manager is truly active or just a "Closet Indexer" charging high fees for passive performance.</p>
          <p>Use it to verify if a fund is behaving how it claims to behave.</p>
        </CardContent>
      </Card>
    </div>
  );
}


