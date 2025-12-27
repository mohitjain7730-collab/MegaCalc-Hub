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
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Information Ratio</h1>
          <meta itemProp="description" content="Master the Information Ratio: the gold standard for measuring active portfolio management skill. Learn to calculate, interpret, and optimize your risk-adjusted returns." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Information Ratio, Active Return, Tracking Error, Risk-Adjusted Return, Portfolio Performance, Active Management, Alpha, Omega Ratio, Treynor Ratio" />

          <p className="text-lg italic text-muted-foreground">The ultimate scorecard for active managers: estimating how much skill (alpha) you're getting for the extra risk you're taking.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is the Information Ratio?</h2>
          <p>The Information Ratio (IR) is a metric used to measure the risk-adjusted returns of a financial portfolio relative to a specific benchmark. It answers a critical question: <em>"Was the deviation from the benchmark worth it?"</em></p>
          <p>While the Sharpe Ratio measures return per unit of total risk, the Information Ratio measures <strong>active return</strong> per unit of <strong>active risk</strong> (tracking error). It isolates the manager's ability to generate excess returns through security selection or market timing.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The Core Components</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Active Return (Alpha):</strong> The difference between the portfolio's return and the benchmark's return. (Rp - Rb)</li>
            <li><strong>Tracking Error:</strong> The standard deviation of those active returns. It quantifies the "consistency" of the outperformance. A lower tracking error means the manager stays closer to the benchmark's risk profile.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Interpreting Your Score</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">IR &lt; 0</h3>
              <p className="text-sm">The manager underperformed the benchmark, or took risk that didn't pay off. A negative IR is generally a red flag for active management.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">IR 0.0 - 0.5</h3>
              <p className="text-sm">Modest outperformance. Typical for many active mutual funds after fees.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">IR 0.5 - 1.0</h3>
              <p className="text-sm">Good to Very Good. The manager is consistently adding value relative to the risk taken.</p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-bold text-primary mb-2">IR &gt; 1.0</h3>
              <p className="text-sm">Exceptional. This level of consistency is rare and difficult to sustain over long periods (top quartile managers).</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>The Information Ratio is the "consistency metric" for alpha. A high IR implies that the manager is beating the benchmark steadily, rather than through wild, lucky bets. Use it to distinguish skill from luck in active portfolio management.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Expert answers on risk-adjusted performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How is it different from the Sharpe Ratio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Sharpe Ratio compares return to a <em>risk-free rate</em> and divides by <em>total volatility</em>. Information Ratio compares return to a <em>benchmark</em> and divides by <em>tracking error</em> (active risk). Use Sharpe for absolute return comparisons, and IR for benchmark-relative comparisons.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is considered a "good" Information Ratio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Generally, an IR of 0.5 is considered good. An IR of 0.75 is very good, and 1.0 or higher is exceptional classification for active managers. Grinold and Kahn famously stated that top-quartile managers typically achieve an IR of 0.5.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can the Information Ratio be negative?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. If a portfolio's return is less than the benchmark's return, the active return is negative, resulting in a negative IR. It means the manager failed to add value relative to the benchmark.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does benchmark choice matter?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Crucially. If you choose an "easy" benchmark (e.g., using S&P 500 for a high-risk tech fund), the IR will be artificially inflated. The benchmark must represent the investment universe and risk profile accurately.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the "Fundamental Law of Active Management"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It posits that Information Ratio ≈ Information Coefficient (skill) × √Breadth (number of independent bets). To increase IR, a manager needs either more skill or more opportunities to apply that skill.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Is a higher Tracking Error bad?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Not necessarily. High tracking error simply means "very different from the benchmark." If that difference leads to high returns, it's justified. If it leads to losses, it's just unrewarded risk.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do fees impact the Information Ratio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Fees reduce the active return (the numerator). Since active risk (denominator) remains the same, high fees directly degrade the Information Ratio. It's often calculated on a gross-of-fees basis to assess pure skill, but net-of-fees is what investors experience.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I use it for passive index funds?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">For passive funds, you want the Active Return and Tracking Error to both be effectively zero. The IR isn't very useful there; typically, you just look for the lowest possible Tracking Error.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does it work for bond portfolios?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes, it is widely used in fixed income to compare managers against bond indices (like the Aggregate Bond Index), though active returns in bonds are often smaller than in equities.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why annualize the inputs?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">To make comparisons standard. If you use monthly data, you multiply the monthly IR by √12 to get the annualized IR.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Information Ratio is the premier metric for evaluating active management skill. By normalizing excess returns by the risk taken to achieve them, it tells you not just <em>if</em> a manager beat the market, but <em>how efficiently</em> they did so.</p></CardContent>
      </Card>
    </div>
  );
}


