'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, LineChart, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  portfolioReturn: z.number().min(-100).max(100).optional(),
  benchmarkReturn: z.number().min(-100).max(100).optional(),
  trackingError: z.number().min(0).max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InformationRatioCalculator() {
  const [result, setResult] = useState<{ activeReturn: number; informationRatio: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined as unknown as number,
      benchmarkReturn: undefined as unknown as number,
      trackingError: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (v.portfolioReturn === undefined || v.benchmarkReturn === undefined || v.trackingError === undefined || v.trackingError === 0) {
      setResult(null);
      return;
    }
    const active = v.portfolioReturn - v.benchmarkReturn;
    const ir = active / v.trackingError;
    const interpretation = ir > 0.5 ? 'Strong risk-adjusted outperformance versus the benchmark.' : ir > 0 ? 'Modest positive risk-adjusted performance.' : ir === 0 ? 'Neutral versus benchmark on a risk-adjusted basis.' : 'Underperformance after adjusting for risk.';
    setResult({ activeReturn: active, informationRatio: ir, interpretation, suggestions: ['Stabilize active returns with consistent strategy execution.', 'Lower tracking error by aligning factor exposures with the benchmark.', 'Evaluate fees and turnover; high costs can reduce IR.', 'Compare IR across rolling windows for persistence.'] });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Risk-Adjusted Return (Information Ratio) Calculator
          </CardTitle>
          <CardDescription>Compute information ratio from active return and tracking error.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 12" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="benchmarkReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benchmark Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 8" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="trackingError" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Error (Std Dev of Active) (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
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
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Results & Insights
              </CardTitle>
              <CardDescription>Active performance versus risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Return</p>
                  <p className="text-2xl font-bold">{result.activeReturn.toFixed(2)}%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Information Ratio</p>
                  <p className="text-2xl font-bold">{result.informationRatio.toFixed(3)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Interpretation</p>
                  <p className="font-medium">{result.interpretation}</p>
                </div>
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
                  <span className="text-sm font-medium">Consistent active returns boost IR more than occasional big wins</span>
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
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">High tracking error implies significant deviation from benchmark</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Performance and risk tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Risk-adjusted return using total volatility.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/treynor-ratio-calculator" className="text-primary hover:underline">Treynor Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Risk-adjusted return using beta.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate total risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Expected return from beta and market risk premium.</p></div>
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
              Information Ratio = (Portfolio Return - Benchmark Return) / Tracking Error
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures active return per unit of active risk (tracking error).
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Portfolio Return (%)</h4>
              <p className="text-sm text-muted-foreground">Your portfolio's total return for the period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Benchmark Return (%)</h4>
              <p className="text-sm text-muted-foreground">The benchmark's return over the same period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Tracking Error (%)</h4>
              <p className="text-sm text-muted-foreground">Standard deviation of active returns (portfolio minus benchmark).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to the Information Ratio: Measuring Active Skill" />
        <meta itemProp="description" content="Calculate and interpret the Information Ratio. Distinguish between luck and skill in active portfolio management by analyzing risk-adjusted active returns." />
        <meta itemProp="keywords" content="Information Ratio, Active Return, Tracking Error, Risk-Adjusted Return, Portfolio Performance, Active Management, Alpha, Fundamental Law of Active Management" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-information-ratio" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Information Ratio: Are You Good, or Just Lucky?</h1>
        <p className="text-lg italic text-muted-foreground">Any manager can beat the market by taking insane risks. The Information Ratio tells you who beat the market through skill.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#the-concept" className="hover:underline">The "Consistency" Metric</a></li>
          <li><a href="#the-formula" className="hover:underline">Anatomy of the Formula</a></li>
          <li><a href="#interpretation" className="hover:underline">What is a "Good" Score?</a></li>
          <li><a href="#fundamental-law" className="hover:underline">The Fundamental Law of Active Management</a></li>
        </ul>
        <hr />

        <h2 id="the-concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Consistency" Metric</h2>
        <p>The Sharpe Ratio measures "Total Return per unit of Total Risk." The Information Ratio measures "Active Return per unit of Active Risk."</p>
        <p>It answers a specific question: <em>"For every unit of deviation from the benchmark (Tracking Error), how much extra return (Alpha) did you generate?"</em> It is the ultimate litmus test for active managers.</p>
        <hr />

        <h2 id="the-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Anatomy of the Formula</h2>
        <p className="font-mono bg-muted p-2 rounded text-center">IR = (Portfolio Return - Benchmark Return) / Tracking Error</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Numerator (Alpha):</strong> The excess return. If you made 12% and the market made 10%, your Alpha is +2%.</li>
          <li><strong>Denominator (Tracking Error):</strong> The standard deviation of that Alpha. If your Alpha is usually +2%, but sometimes -5% and sometimes +10%, your Tracking Error is high. If your Alpha is steady at +0.15% every single month, your Tracking Error is low.</li>
        </ul>
        <hr />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a "Good" Score?</h2>
        <p>According to Grinold and Kahn (the godfathers of quantitative investing):</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>0.0 - 0.5:</strong> Average. Most mutual funds fall here after fees.</li>
          <li><strong>0.5 - 0.75:</strong> Good. You are consistently adding value.</li>
          <li><strong>0.75 - 1.0:</strong> Very Good. Top quartile managers.</li>
          <li><strong>&gt; 1.0:</strong> Exceptional. Rare to sustain over long periods (e.g., Renaissance Technologies).</li>
        </ul>
        <hr />

        <h2 id="fundamental-law" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Fundamental Law of Active Management</h2>
        <p>This law states: <strong>IR ≈ IC × √Breadth</strong></p>
        <p>Where <strong>IC</strong> is your skill (Information Coefficient) and <strong>Breadth</strong> is how many independent bets you make.</p>
        <p><strong>The Insight:</strong> To get a high Information Ratio, you can either be extremely smart (High IC) like Warren Buffett by picking a few stocks perfectly, OR you can be slightly smart about thousands of stocks (High Breadth) like a Quant Fund.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Advanced Performance Analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Can I have a negative Information Ratio?</h4>
            <p className="text-muted-foreground">
              Yes. If you underperform the benchmark, your numerator is negative. A negative IR means you paid active fees to get worse results than a cheap index fund.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why not just use Sharpe Ratio?</h4>
            <p className="text-muted-foreground">
              Sharpe is absolute. Information Ratio is relative. If the market is down -20% and you are down -15%, your Sharpe Ratio is terrible (negative), but your Information Ratio might be excellent (positive alpha).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is a high Tracking Error bad?</h4>
            <p className="text-muted-foreground">
              Not necessarily. High Tracking Error just means you are "very different" from the benchmark. If you have high Tracking Error and high returns, you are a "high conviction" manager. If you have high Tracking Error and low returns, you are just gambling.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do fees affect IR?</h4>
            <p className="text-muted-foreground">
              Fees destroy IR. Since fees reduce the Numerator (Alpha) directly but don't change the Denominator (Risk), a 1% management fee can turn a "Good" IR of 0.5 into a "Bad" IR of 0.0 very easily.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Closet Indexing"?</h4>
            <p className="text-muted-foreground">
              A manager with a very low Tracking Error (near 0) and low Alpha. They charge active fees but just hug the benchmark. Their IR will be near zero (or negative after fees).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does IR work for Hedge Funds?</h4>
            <p className="text-muted-foreground">
              Sometimes, but be careful. Hedge funds often don't have a clear "benchmark." If the benchmark is "Cash" (Absolute Return), the Tracking Error becomes just Volatility, and the IR becomes the Sharpe Ratio.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Information Ratio is the "Truth Serum" for active managers.</p>
          <p>It reveals whether outperformance is a result of consistent skill or erratic luck.</p>
          <p>Use it to justify active management fees—if the IR isn't above 0.5, you're likely better off in an index fund.</p>
        </CardContent>
      </Card>
    </div>
  );
}


