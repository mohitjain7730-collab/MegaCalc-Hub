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
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Asset Correlation Matrices</h1>
          <meta itemProp="description" content="Master portfolio construction with our Asset Correlation Matrix Calculator. Understand how assets interact to minimize risk and maximize diversification." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Asset Correlation Matrix, Portfolio Diversification, Correlation Coefficient, Risk Management, Modern Portfolio Theory, Investment Analysis, Asset Allocation" />

          <p className="text-lg italic text-muted-foreground">The secret weapon of professional portfolio managers: understanding how your investments interact with each other.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is a Correlation Matrix?</h2>
          <p>A correlation matrix is a table showing the correlation coefficients between potential pairs of assets. Each cell in the table shows the correlation between the two variables on the intersecting row and column.</p>
          <p>It acts as a "diagnostic map" for your portfolio, revealing connected risks that might not be obvious when looking at assets in isolation.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Decoding the Numbers</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>+1.0 (Perfect Positive):</strong> Assets move in perfect lockstep. If one goes up 5%, the other goes up (roughly) proportionally. Zero diversification benefit.</li>
            <li><strong>0.0 (Uncorrelated):</strong> Assets move independently. The price movement of one tells you nothing about the other. High diversification benefit.</li>
            <li><strong>-1.0 (Perfect Negative):</strong> Assets move in exact opposites. If one zigs, the other zags. Maximum hedging potential.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Why "Low Correlation" Matters</h2>
          <p>The goal of diversification isn't just to "buy many things," but to buy things that <strong>behave differently</strong>. Combining assets with low or negative correlations significantly reduces overall portfolio volatility (standard deviation) without necessarily sacrificing returns.</p>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Use this matrix to stress-test your portfolio construction. If all your assets have correlations above 0.8, you might be less diversified than you think.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Expert answers to your correlation questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do I interpret a full matrix?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Look for the off-diagonal numbers. The diagonal will always be 1.0 (an asset correlates perfectly with itself). Low numbers off-diagonal indicate good diversifiers.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is considered a "good" correlation for diversification?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Generally, correlations below 0.5 are considered good for diversification. Correlations below 0.3 or negative are excellent for effective risk reduction.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why do correlations change during market crashes?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">In panic selling, investors often sell <em>everything</em> to raise cash, causing assets that are normally unrelated to fall together. This phenomenon is known as "correlation breakdown" or "convergence to 1."</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How much historical data should I use?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">A common standard is 3 to 5 years of monthly data (36-60 observations). Using too little data (e.g., 3 months) creates statistical noise; too much (e.g., 20 years) may include irrelevant ancient history.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I use daily instead of monthly returns?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, but daily data can be noisy due to market microstructure issues (timing differences, non-trading days). Monthly or weekly data is often preferred for strategic asset allocation.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the formula for correlation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Correlation (ρ) = Covariance(A, B) / (Standard Deviation(A) × Standard Deviation(B)). It normalizes covariance to a range of -1 to +1.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does correlation imply causation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. Two assets might correlate simply because they react to the same external factor (e.g., interest rates), not because one causes the other to move.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is this useful for crypto?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Absolutely. Crypto assets often have high correlations with each other but varying correlations with stocks and gold, making this analysis vital for crypto portfolio construction.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do I fix a "N/A" result?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Ensure you have entered valid numerical data with at least 3 data points per series, and that no series is completely flat (variance cannot be zero).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I paste data from Excel?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, simply copy a column of returns from Excel or Google Sheets and paste it into the text areas. The calculator handles spaces and newlines automatically.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Asset Correlation Matrix Calculator computes pairwise Pearson correlations from return series. Use it to identify diversification opportunities—lower correlations mean greater potential for risk reduction when combining assets.</p></CardContent>
      </Card>
    </div>
  );
}


