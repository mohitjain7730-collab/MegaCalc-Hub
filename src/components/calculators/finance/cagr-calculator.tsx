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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/holding-period-return-hpr-calculator" className="text-primary hover:underline">Holding Period Return</a></h4><p className="text-sm text-muted-foreground">Total period return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</a></h4><p className="text-sm text-muted-foreground">Growth projection.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to CAGR: Calculating Compound Annual Growth Rate" />
        <meta itemProp="description" content="Master the CAGR formula. Understand how to calculate the mean annual growth rate of an investment over a specified time period longer than one year." />
        <meta itemProp="keywords" content="CAGR calculator, compound annual growth rate formula, investment growth calculator, annualized return, portfolio performance measurement, smoothing investment returns" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-cagr" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to CAGR: Measuring Portfolio Growth</h1>
        <p className="text-lg italic text-muted-foreground">Cut through the noise of volatility. Learn how CAGR provides the most accurate "smoothed" representation of your investment's annual performance.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-cagr" className="hover:underline">What is CAGR?</a></li>
          <li><a href="#why-use-cagr" className="hover:underline">Why Use CAGR?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula Explained</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations of CAGR</a></li>
          <li><a href="#real-world" className="hover:underline">Real World Examples</a></li>
        </ul>
        <hr />

        <h2 id="what-is-cagr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is CAGR?</h2>
        <p>The Compound Annual Growth Rate (CAGR) is a representational figure, rather than a true return rate. It describes the rate at which an investment would have grown if it had grown the same rate every single year and the profits were reinvested at the end of each year.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Smoothing" Effect</h3>
        <p>Real markets are volatile. You might make 20% one year and lose 10% the next. CAGR smooths out this jagged line into a single, easy-to-compare percentage.</p>
        <hr />

        <h2 id="why-use-cagr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Use CAGR?</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Comparability:</strong> It allows you to compare the performance of two investments held for different time periods.</li>
          <li><strong>Objective Measurement:</strong> It is one of the standard metrics used by fund managers and investors to evaluate performance relative to benchmarks like the S&P 500.</li>
          <li><strong>Goal Planning:</strong> It helps you determine the required rate of return to reach a specific financial goal (e.g., "I need a 7% CAGR to retire in 20 years").</li>
        </ul>
        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula Explained</h2>
        <p className="font-mono bg-muted p-2 rounded">CAGR = (Ending Value / Beginning Value) ^ (1 / n) - 1</p>
        <p>Where <em>n</em> is the number of years.</p>
        <p>Essentially, you are dividing the final value by the start value to get the total multiple, and then taking the "nth root" of that multiple to find the annual rate.</p>
        <hr />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of CAGR</h2>
        <p>While powerful, CAGR has blind spots:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Ignores Volatility:</strong> A steady 8% return and a wild, risky path to the same 8% return look identical in CAGR.</li>
          <li><strong>Input Sensitivity:</strong> It is purely calculated on the start and end values. If you withdraw money or add money during the period, the standard CAGR formula breaks (you need "Money-Weighted Return" or XIRR for that).</li>
        </ul>
        <hr />

        <h2 id="real-world" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real World Examples</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Company Growth</h3>
        <p>CAGR is often used to track business metrics like revenue or user growth. "Our revenue grew at a 25% CAGR over the last 5 years" is a standard pitch to investors.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Investment Funds</h3>
        <p>Mutual funds report their 3-year, 5-year, and 10-year CAGRs. Always compare these against the fund's benchmark index.</p>
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
            <h4 className="font-semibold text-lg mb-3">How is CAGR different from Average Annual Return?</h4>
            <p className="text-muted-foreground">
              Average return is a simple arithmetic mean (e.g., (+50% - 50%) / 2 = 0%). CAGR is a geometric mean that accounts for compounding. In that same example, if $100 goes to $150 (+50%) then back to $75 (-50%), you lost money. The average return says 0%, but the CAGR is correctly negative (-13.4%). CAGR is the <strong>truth</strong>.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can CAGR be negative?</h4>
            <p className="text-muted-foreground">
              Yes. If the ending value is lower than the beginning value, the CAGR will be negative, indicating the annualized rate at which you lost capital.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">CAGR vs. IRR (Internal Rate of Return)?</h4>
            <p className="text-muted-foreground">
              CAGR is best for a single lump-sum investment held for a period. IRR is better if you have multiple cash flows (deposits and withdrawals) happening at different times during the investment period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use CAGR for periods less than a year?</h4>
            <p className="text-muted-foreground">
              Technically yes, but it can be misleading. "Annualizing" a 10% return earned in 1 month results in a massive (and likely unrealistic) CAGR. It is best used for periods of 1 year or longer.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does inflation affect CAGR?</h4>
            <p className="text-muted-foreground">
              The standard calculation gives you the "nominal" CAGR. To find the "real" CAGR (purchasing power growth), you subtract the inflation rate from the result. A 7% nominal CAGR with 3% inflation is roughly a 4% real CAGR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is high CAGR always better?</h4>
            <p className="text-muted-foreground">
              Not necessarily. A high CAGR often comes with high risk (volatility). A portfolio with a 15% CAGR that crashes 50% occasionally might be harder to stick with than a portfolio with a steady 10% CAGR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use CAGR for debt?</h4>
            <p className="text-muted-foreground">
              Yes. You can calculate the CARG of a debt load growing. If your credit card debt went from $1,000 to $5,000 in 3 years, calculating the CAGR will show you the terrifying effective interest rate you are paying (including fees/penalties).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I handle irregular time periods?</h4>
            <p className="text-muted-foreground">
              Calculators (like this one) often handle fractional years (e.g., 2.5 years). The formula <code>(1 / n)</code> works perfectly with decimals, so you don't need to round to the nearest whole year.
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


