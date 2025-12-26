'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, Calendar, FunctionSquare, HelpCircle, Shield, Info, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  beginningValue: z.number().min(0.0001).optional(),
  endingValue: z.number().min(0.0001).optional(),
  years: z.number().min(0.0001).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CagrCalculator() {
  const [result, setResult] = useState<{
    cagrPct: number;
    totalReturn: number;
    growthMultiple: number;
    performanceLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { beginningValue: undefined, endingValue: undefined, years: undefined } });

  const getPerformanceLevel = (cagr: number): string => {
    if (cagr >= 25) return 'Exceptional';
    if (cagr >= 15) return 'Strong';
    if (cagr >= 10) return 'Market-like';
    if (cagr >= 5) return 'Moderate';
    if (cagr >= 0) return 'Low';
    return 'Negative';
  };

  const getInsights = (cagr: number, years: number, totalReturn: number, multiple: number): string[] => {
    const insights: string[] = [];
    insights.push(`${cagr.toFixed(2)}% annualized return over ${years} years`);
    insights.push(`Total return of ${totalReturn.toFixed(1)}% (${multiple.toFixed(2)}x your money)`);
    if (cagr >= 10) {
      insights.push('Outperforming typical market benchmarks');
    } else if (cagr >= 7) {
      insights.push('Tracking with historical market averages');
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'CAGR smooths volatility—actual annual returns vary',
    'Past performance does not guarantee future results',
    'Inflation reduces real purchasing power of returns',
    'Compare against relevant benchmark over same period',
    'Consider risk-adjusted returns (Sharpe ratio) for fuller picture'
  ];

  const getRecommendation = (cagr: number, years: number): string => {
    if (cagr >= 20 && years < 3) return 'Strong short-term performance. Verify sustainability before extrapolating.';
    if (cagr >= 15) return 'Excellent growth. Consider rebalancing if concentrated in single position.';
    if (cagr < 5 && years > 5) return 'Below-market performance. Review strategy and consider alternatives.';
    return 'Solid growth trajectory. Continue monitoring against benchmark.';
  };

  const onSubmit = (v: FormValues) => {
    if (v.beginningValue == null || v.endingValue == null || v.years == null) { setResult(null); return; }
    const cagr = Math.pow(v.endingValue / v.beginningValue, 1 / v.years) - 1;
    const totalReturn = ((v.endingValue - v.beginningValue) / v.beginningValue) * 100;
    const multiple = v.endingValue / v.beginningValue;
    const cagrPct = Math.round(cagr * 10000) / 100;
    setResult({
      cagrPct,
      totalReturn,
      growthMultiple: multiple,
      performanceLevel: getPerformanceLevel(cagrPct),
      interpretation: `Your investment grew at ${cagrPct}% per year, turning every $1 into $${multiple.toFixed(2)} over ${v.years} years.`,
      recommendation: getRecommendation(cagrPct, v.years),
      insights: getInsights(cagrPct, v.years, totalReturn, multiple),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>CAGR (Compound Annual Growth Rate)</CardTitle><CardDescription>Annualized growth between two values</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="beginningValue" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 10000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endingValue" render={({ field }) => (
                  <FormItem><FormLabel><DollarSign className="h-4 w-4" /> Ending Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Years</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate CAGR</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>CAGR Analysis</CardTitle>
                  <CardDescription>Compounded annual growth rate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.cagrPct}%</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Total Return</p>
                  <p className="text-lg font-bold">{result.totalReturn.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Growth Multiple</p>
                  <p className="text-lg font-bold">{result.growthMultiple.toFixed(2)}x</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Annualized</p>
                  <p className="text-lg font-bold">{result.cagrPct}%/yr</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Performance</p>
                  <Badge variant={result.performanceLevel === 'Exceptional' || result.performanceLevel === 'Strong' ? 'default' : result.performanceLevel === 'Market-like' ? 'secondary' : result.performanceLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.performanceLevel}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Growth analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
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
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Compare return metrics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total period return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</a></h4><p className="text-sm text-muted-foreground">Growth projection.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            CAGR represents the smoothed annual rate that takes you from beginning to ending value, assuming constant compounding.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</h4>
              <p className="text-sm text-muted-foreground">Initial investment value or starting portfolio balance.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Ending Value</h4>
              <p className="text-sm text-muted-foreground">Final value after the investment period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Years</h4>
              <p className="text-sm text-muted-foreground">Number of years between beginning and ending values.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to CAGR: Understanding Compound Annual Growth Rate</h1>
        <p className="text-lg italic text-muted-foreground">Master the most important metric for comparing investment performance across different time periods.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-cagr" className="hover:underline">What is CAGR?</a></li>
          <li><a href="#cagr-vs-average" className="hover:underline">CAGR vs. Average Return</a></li>
          <li><a href="#using-cagr" className="hover:underline">Using CAGR for Comparisons</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations of CAGR</a></li>
        </ul>
        <hr />

        <h2 id="what-is-cagr" className="text-2xl font-bold text-foreground pt-8">What is CAGR?</h2>
        <p>CAGR (Compound Annual Growth Rate) is the rate of return that would be required for an investment to grow from its beginning value to its ending value, assuming profits are reinvested at the end of each year.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why CAGR Matters</h3>
        <p>CAGR smooths out volatility to show consistent annual growth. It's the go-to metric for comparing investments with different time horizons or comparing to benchmarks like the S&P 500.</p>
        <hr />

        <h2 id="cagr-vs-average" className="text-2xl font-bold text-foreground pt-8">CAGR vs. Average Return</h2>
        <p>Arithmetic average can be misleading with volatility. Example: +50% year 1, -50% year 2. Average is 0%, but you're actually down 25%!</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">CAGR Captures Reality</h3>
        <p>CAGR of the above example: √(1.5 × 0.5) - 1 = -13.4%. This reflects your actual experience, not the misleading arithmetic average.</p>
        <hr />

        <h2 id="using-cagr" className="text-2xl font-bold text-foreground pt-8">Using CAGR for Comparisons</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Compare investments with different holding periods.</li>
          <li>Benchmark against market indices.</li>
          <li>Evaluate fund manager performance.</li>
          <li>Set future investment goals.</li>
        </ul>
        <hr />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8">Limitations of CAGR</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Ignores Volatility:</strong> Doesn't show the ride (drawdowns, spikes).</li>
          <li><strong>No Cash Flows:</strong> Assumes no additions/withdrawals during the period.</li>
          <li><strong>Start/End Sensitive:</strong> Different windows can give very different results.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>CAGR is essential for understanding true investment performance. Use it to compare investments, set goals, and cut through the noise of volatile annual returns.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about CAGR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">How is CAGR different from average return?</h4>
            <p className="text-muted-foreground">
              CAGR is the geometric mean, which correctly captures compounding effects. Arithmetic averages can significantly overstate returns when there's volatility. Always use CAGR for multi-year performance comparison.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does timing of cash flows matter for CAGR?</h4>
            <p className="text-muted-foreground">
              CAGR ignores intermediate contributions or withdrawals—it only looks at start and end values. If you made additional investments during the period, use IRR (Internal Rate of Return) or XIRR instead.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if ending value is less than beginning?</h4>
            <p className="text-muted-foreground">
              CAGR will be negative, representing the compound annual rate of decline. For example, going from $100 to $50 over 5 years gives CAGR of (0.5)^(1/5) - 1 = -12.9% annually.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I compare different investments using CAGR?</h4>
            <p className="text-muted-foreground">
              Yes—that's one of CAGR's strengths. It normalizes returns to annual terms, so you can compare a 3-year investment to a 10-year one. Just be aware it doesn't capture risk or volatility differences.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is CAGR sensitive to start and end dates?</h4>
            <p className="text-muted-foreground">
              Yes. Picking favorable start/end points can dramatically change CAGR. Use consistent timeframes when comparing, and consider calculating for multiple periods to get a fuller picture.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use before-fee or after-fee values?</h4>
            <p className="text-muted-foreground">
              Use after-fee, after-tax values to reflect your actual investor experience. Published fund CAGRs are typically before personal taxes, so your realized CAGR may differ.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The CAGR Calculator computes the compound annual growth rate from a beginning value to an ending value over a specified number of years.</p>
          <p>CAGR is the gold standard for comparing investment performance across different time periods.</p>
          <p>Use this to evaluate investments, compare to benchmarks, and set realistic growth expectations.</p>
        </CardContent>
      </Card>
    </div>
  );
}


