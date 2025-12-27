'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, Info, Grid, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
  name1: z.string().min(1).default('Asset A'),
  name2: z.string().min(1).default('Asset B'),
  name3: z.string().min(1).default('Asset C'),
  series1: z.string().min(1),
  series2: z.string().min(1),
  series3: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] {
  // Extract numeric tokens robustly (supports negatives, decimals, scientific, ignores % and text)
  const matches = s.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  return matches
    .map(tok => Number(tok))
    .filter(n => Number.isFinite(n));
}

function corr(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  // Require at least 3 paired observations; with only 2 points, correlation is always ±1 and misleading
  if (n < 3) return NaN;
  const ax = a.slice(0, n);
  const bx = b.slice(0, n);
  const ma = ax.reduce((s, v) => s + v, 0) / n;
  const mb = bx.reduce((s, v) => s + v, 0) / n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = ax[i] - ma;
    const db = bx[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va === 0 || vb === 0) return NaN;
  return cov / Math.sqrt(va * vb);
}

export default function AssetCorrelationMatrixCalculator() {
  const [matrix, setMatrix] = useState<number[][] | null>(null);
  const [labels, setLabels] = useState<string[]>(['Asset A', 'Asset B', 'Asset C']);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name1: 'Asset A',
      name2: 'Asset B',
      name3: 'Asset C',
      series1: '',
      series2: '',
      series3: '',
    },
  });

  const onSubmit = (v: FormValues) => {
    const s1 = parseSeries(v.series1);
    const s2 = parseSeries(v.series2);
    const s3 = parseSeries(v.series3);
    const m = [
      [1, corr(s1, s2), corr(s1, s3)],
      [corr(s2, s1), 1, corr(s2, s3)],
      [corr(s3, s1), corr(s3, s2), 1],
    ];
    setMatrix(m);
    setLabels([v.name1, v.name2, v.name3]);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Asset Correlation Matrix Calculator
          </CardTitle>
          <CardDescription>Paste return series and compute a 3×3 correlation matrix.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="name1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name3" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 3 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="series1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Returns (comma/space separated)</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 1.2 0.5 -0.3 0.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="series2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Returns</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 0.9 0.1 -0.2 0.4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="series3" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 3 Returns</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 1.1 0.2 -0.1 0.6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Compute Matrix</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {matrix && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Correlation Matrix
              </CardTitle>
              <CardDescription>Symmetric Pearson correlation matrix</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Asset</th>
                      {labels.map((l, i) => (<th className="p-2" key={i}>{l}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map((row, i) => (
                      <tr className="border-t" key={i}>
                        <td className="p-2 font-semibold">{labels[i]}</td>
                        {row.map((v, j) => (
                          <td className="p-2" key={j}>{Number.isFinite(v) ? v.toFixed(3) : 'N/A'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interpretation</h4>
                <p className="text-muted-foreground">Values range from -1 (perfect inverse) to +1 (perfect positive). Lower correlations typically increase diversification benefits.</p>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Correlation analysis takeaways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Low correlation pairs offer strongest diversification benefits</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Negative correlations can hedge portfolio during downturns</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Use correlation matrix to optimize portfolio allocations</span>
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
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Correlations are unstable and change over market regimes</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Crisis periods often see correlation spikes across all assets</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Sample size matters: correlation from short periods may be unreliable</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Refresh correlation analysis periodically with recent data</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Correlation and risk tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Translate correlation into total risk.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/risk-parity-portfolio-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Assess individual risk inputs.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Relate risk to performance outcomes.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Contextualize returns in real terms.</p>
            </div>
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
              ρ(A,B) = Cov(A,B) / (σ_A × σ_B)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Pearson correlation coefficient measures linear relationship between two return series (-1 to +1).
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
              <h4 className="font-semibold mb-2">Asset Names</h4>
              <p className="text-sm text-muted-foreground">Labels for your assets (e.g., Stocks, Bonds, Gold).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Return Series</h4>
              <p className="text-sm text-muted-foreground">Historical percentage returns (comma/space separated). Use consistent periods.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Asset Correlation: The Matrix of Diversification" />
        <meta itemProp="description" content="Generate and interpret Asset Correlation Matrices. Learn how pairwise correlations drive portfolio risk and how to use this matrix for superior asset allocation." />
        <meta itemProp="keywords" content="Asset Correlation Matrix, Pearson Correlation, Portfolio Optimization, Diversification Strategy, Correlation Coefficients, Risk Management Tools" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-correlation-matrix" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Correlation Matrix: The Map of the Market</h1>
        <p className="text-lg italic text-muted-foreground">It looks like a simple grid of numbers. In reality, it is the treasure map that reveals whether your portfolio is a fortress or a house of cards.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#reading-the-matrix" className="hover:underline">How to Read the Matrix</a></li>
          <li><a href="#heatmap" className="hover:underline">The "Heatmap" Mental Model</a></li>
          <li><a href="#regimes" className="hover:underline">Why Correlations Lie (Regime Changes)</a></li>
          <li><a href="#math" className="hover:underline">The Math Behind the Magic</a></li>
        </ul>
        <hr />

        <h2 id="reading-the-matrix" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Read the Matrix</h2>
        <p>A correlation matrix is always symmetric (Top-Right matches Bottom-Left) and always has 1.0 down the diagonal (Asset A is perfectly correlated with itself).</p>
        <p><strong>The Golden Rule:</strong> You want low numbers in the "off-diagonal" cells.
          <br />
          - If you see lots of <strong>0.80+</strong>: You basically own the same asset five times.
          <br />
          - If you see <strong>0.20 to 0.50</strong>: You have a healthy, diversified portfolio.
          <br />
          - If you see <strong>Negative Numbers</strong>: You have powerful hedges in place.</p>
        <hr />

        <h2 id="heatmap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Heatmap" Mental Model</h2>
        <p>Professional traders often color-code these matrices:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Red (High Correlation, &gt; 0.7):</strong> "Danger Zone." If one crashes, they all crash.</li>
          <li><strong>Yellow (Moderate, 0.3 - 0.7):</strong> "Standard Zone." Typical behavior for assets in the same economy (e.g., Tech Stocks vs. Bank Stocks).</li>
          <li><strong>Green (Low/Negative, &lt; 0.3):</strong> "Safe Zone." These assets march to the beat of their own drum (e.g., Gold vs. Stocks, or Treasury Bonds vs. Crypto).</li>
        </ul>
        <hr />

        <h2 id="regimes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Correlations Lie (Regime Changes)</h2>
        <p><strong>Crucial Warning:</strong> Correlations are not fixed laws of physics like gravity. They are statistical artifacts of the past.</p>
        <p>During calm markets, Stocks and Bonds might have a correlation of -0.3 (great!). But during an "Inflation Shock" (like 2022), that correlation can flip to +0.6 (disastrous!). This is called a "Regime Change." Always stress-test your portfolio assuming correlations might rise when you least want them to.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Advanced Correlation Topics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Does correlation imply causation?</h4>
            <p className="text-muted-foreground">
              <strong>Never.</strong> Ice cream sales and shark attacks are highly correlated (both happen in summer), but eating ice cream doesn't cause shark attacks. Similarly, assets might move together just because of global liquidity, not because they directly impact each other.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How many data points do I need?</h4>
            <p className="text-muted-foreground">
              Statistically, you want at least 30 observations to have any confidence. For monthly returns, that means 2.5 years of data. If you use fewer points (e.g., last 3 months), the correlation is just "noise" and likely random.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Spurious Correlation"?</h4>
            <p className="text-muted-foreground">
              It's a fake correlation that appears by random chance. If you compare thousands of random charts, you <em>will</em> find two that look identical purely by accident. This is a common trap in algorithmic trading.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is -1.0 correlation good?</h4>
            <p className="text-muted-foreground">
              It is the <em>best</em> for risk reduction, but it can be annoying for returns. If you have a perfect hedge, you maintain a flat line value. You usually want correlations that are low (0 to 0.2) or slightly negative, rather than perfectly negative, so your portfolio can still grow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does this work for irregular time series?</h4>
            <p className="text-muted-foreground">
              No. The data points must be "synchronous" (same dates). You cannot correlate Bitcoin's 24/7 price with the NYSE's 9-5 price unless you align them (e.g., using "Daily Close" timestamps). This calculator assumes you impute aligned data.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Beta" vs. "Correlation"?</h4>
            <p className="text-muted-foreground">
              Correlation measures <em>tightness</em> of fit (0 to 1). Beta measures <em>magnitude</em> of move. An asset can have high correlation (moves exactly with market) but low Beta (moves only half as much). Both are needed for full risk analysis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Asset Correlation Matrix is the dashboard for diversification.</p>
          <p>It exposes hidden risks where you thought you were safe, and highlights the true diversifiers in your portfolio.</p>
          <p>Use it regularly, because correlations—unlike diamonds—are not forever.</p>
        </CardContent>
      </Card>
    </div>
  );
}


