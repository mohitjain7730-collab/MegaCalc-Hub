'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, FunctionSquare, HelpCircle, Shield, Info, Calendar, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  beginningValue: z.number().min(0.0001).optional(),
  endingValue: z.number().min(0).optional(),
  income: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HoldingPeriodReturnCalculator() {
  const [result, setResult] = useState<{
    hprPct: number;
    priceReturn: number;
    incomeReturn: number;
    totalGain: number;
    performanceLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { beginningValue: undefined, endingValue: undefined, income: 0 as any } });

  const getPerformanceLevel = (hpr: number): string => {
    if (hpr >= 50) return 'Exceptional';
    if (hpr >= 20) return 'Strong';
    if (hpr >= 10) return 'Moderate';
    if (hpr >= 0) return 'Low';
    return 'Negative';
  };

  const getInsights = (hpr: number, priceRet: number, incomeRet: number): string[] => {
    const insights: string[] = [];
    insights.push(`Total holding period return of ${hpr.toFixed(2)}%`);
    if (incomeRet > 0) {
      insights.push(`Income (dividends) contributed ${incomeRet.toFixed(2)}% of return`);
    }
    insights.push(`Price appreciation contributed ${priceRet.toFixed(2)}%`);
    return insights;
  };

  const getConsiderations = (): string[] => [
    'HPR does not annualize—compare periods of equal length',
    'Reinvested dividends would compound total return',
    'Timing of income affects true return with reinvestment',
    'Inflation erodes purchasing power of nominal returns',
    'Compare HPR against benchmark over same period'
  ];

  const getRecommendation = (hpr: number): string => {
    if (hpr >= 30) return 'Strong return. Consider rebalancing to lock in gains.';
    if (hpr < 0) return 'Negative return. Evaluate if thesis remains intact before adding.';
    return 'Moderate return. Compare to benchmark to assess relative performance.';
  };

  const onSubmit = (v: FormValues) => {
    if (v.beginningValue == null || v.endingValue == null || v.income == null) { setResult(null); return; }
    const totalGain = v.endingValue + v.income - v.beginningValue;
    const hpr = (totalGain / v.beginningValue) * 100;
    const priceReturn = ((v.endingValue - v.beginningValue) / v.beginningValue) * 100;
    const incomeReturn = (v.income / v.beginningValue) * 100;
    setResult({
      hprPct: Math.round(hpr * 100) / 100,
      priceReturn,
      incomeReturn,
      totalGain,
      performanceLevel: getPerformanceLevel(hpr),
      interpretation: `Your total holding period return is ${hpr.toFixed(2)}%, combining ${priceReturn.toFixed(2)}% price change and ${incomeReturn.toFixed(2)}% income return.`,
      recommendation: getRecommendation(hpr),
      insights: getInsights(hpr, priceReturn, incomeReturn),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Holding Period Return (HPR)</CardTitle><CardDescription>Total return including income</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="beginningValue" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endingValue" render={({ field }) => (
                  <FormItem><FormLabel>Ending Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1120" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="income" render={({ field }) => (
                  <FormItem><FormLabel>Income (dividends)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate HPR</Button>
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
                  <CardTitle>HPR Analysis</CardTitle>
                  <CardDescription>Total holding period return breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.hprPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.hprPct}%</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Price Return</p>
                  <p className="text-lg font-bold">{result.priceReturn.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Income Return</p>
                  <p className="text-lg font-bold">{result.incomeReturn.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Total Gain</p>
                  <p className="text-lg font-bold">${result.totalGain.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Performance</p>
                  <Badge variant={result.performanceLevel === 'Exceptional' || result.performanceLevel === 'Strong' ? 'default' : result.performanceLevel === 'Moderate' ? 'secondary' : result.performanceLevel === 'Low' ? 'outline' : 'destructive'}>
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
                <CardDescription>Return analysis</CardDescription>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Compare returns and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/capital-gain-loss-calculator" className="text-primary hover:underline">Capital Gain/Loss</a></h4><p className="text-sm text-muted-foreground">Proceeds & taxes.</p></div>
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
              HPR = (Ending Value + Income - Beginning Value) / Beginning Value × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Captures total return including both capital appreciation and income received.
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
              <p className="text-sm text-muted-foreground">Initial investment value when purchased.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Ending Value</h4>
              <p className="text-sm text-muted-foreground">Current or sale value at end of period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Income</h4>
              <p className="text-sm text-muted-foreground">Dividends, coupons, or distributions received.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Holding Period Return (HPR): Measuring Total Profit" />
        <meta itemProp="description" content="Calculate the total return on an asset over the entire time it was held. Learn the difference between HPR and annualized return, how to account for income like dividends, and calculate short selling returns." />
        <meta itemProp="keywords" content="holding period return calculator, HPR formula, investment total return, calculate stock profit, portfolio performance, absolute return calculator, short vs long HPR" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-hpr" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Holding Period Return: Your Bottom Line</h1>
        <p className="text-lg italic text-muted-foreground">The simplest, most honest metric in finance. "Did I make money, and if so, how much?" It ignores time to focus on the raw absolute impact on your net worth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-hpr" className="hover:underline">What is HPR?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula Breakdown</a></li>
          <li><a href="#annualized" className="hover:underline">HPR vs. Annualized Return</a></li>
          <li><a href="#short-selling" className="hover:underline">HPR for Short Selling</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations & Cash Flows</a></li>
        </ul>
        <hr />

        <h2 id="what-is-hpr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Holding Period Return?</h2>
        <p><strong>Holding Period Return (HPR)</strong> is the total cumulative return earned on an asset over the period it was held. It combines both <strong>Price Appreciation</strong> (Capital Gains) and <strong>Income</strong> (Dividends/Interest).</p>
        <p>It answers a simple question: <em>"If I put in $1,000, what percentage of that $1,000 did I get back as profit?"</em></p>
        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula Breakdown</h2>
        <p className="font-mono bg-muted p-4 rounded text-center text-lg">HPR = [ ( End Value + Income ) - Start Value ] / Start Value</p>
        <p>Or simplified:</p>
        <p className="font-mono bg-muted p-2 rounded inline-block">HPR = Total Profit / Total Invested</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Total Return" Concept</h3>
        <p>Many investors ignore dividends. If you bought a stock at $100 and it is now $100, you might think your return is 0%. But if it paid $5 in dividends, your HPR is 5%. Always include income.</p>
        <hr />

        <h2 id="annualized" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HPR vs. Annualized Return</h2>
        <p>HPR is an "Absolute Return." It tells you the magnitude of your gain but ignores the duration.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-bold mb-2">Investment A</h4>
            <p><strong>HPR:</strong> 100% (Doubled your money)</p>
            <p><strong>Time:</strong> 2 Years</p>
            <p><strong>CAGR:</strong> ~41.4% (Great!)</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-bold mb-2">Investment B</h4>
            <p><strong>HPR:</strong> 100% (Doubled your money)</p>
            <p><strong>Time:</strong> 30 Years</p>
            <p><strong>CAGR:</strong> ~2.3% (Terrible, inflation likely ate it all).</p>
          </div>
        </div>
        <p className="mt-4">Use HPR to measure wealth accumulation ("I made $50k"). Use CAGR to measure efficiency ("I earned 12% a year").</p>
        <hr />

        <h2 id="short-selling" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HPR for Short Selling</h2>
        <p>When shorting, you profit when prices fall. The math inverts.</p>
        <p className="font-mono bg-muted p-2 rounded mt-2">Short HPR = ( Short Proceeds - Buyback Cost - Dividends Paid - Interest ) / Margin Posted</p>
        <p>Notice a key risk: In a long position, the worst HPR is -100%. In a short position, HPR can be -Infinity (if the stock goes to the moon).</p>
        <hr />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations & Cash Flows</h2>
        <p>The standard HPR formula works for a single "Buy once, Sell once" scenario. It breaks if you:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Add Money:</strong> Depositing $5k into a $10k account makes the "End Value" jump, artificially inflating HPR if not adjusted.</li>
          <li><strong>Withdraw Money:</strong> Taking cash out lowers End Value, artificially depressing HPR.</li>
        </ul>
        <p>For complex portfolios with cash flows, use <strong>Time-Weighted Return (TWR)</strong> or <strong>Money-Weighted Return (MWRR)</strong>.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about HPR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Does HPR account for inflation?</h4>
            <p className="text-muted-foreground">
              No. HPR is a nominal return measure. If your HPR is 10% over 5 years but inflation was 15% over that same period, you actually lost purchasing power despite the positive HPR. You must calculate "Real HPR" by subtracting inflation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does HPR differ from Yield?</h4>
            <p className="text-muted-foreground">
              Yield only measures income (Dividend Yield = Dividends / Price). HPR measures Total Return (Yield + Price Appreciation). A stock can have a 5% yield but a -10% HPR if the stock price drops 15%.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can HPR be negative?</h4>
            <p className="text-muted-foreground">
              Yes. If your "End Value + Income" is less than your "Start Value," your HPR is negative. The maximum loss for a long position is -100% (bankruptcy).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include reinvested dividends?</h4>
            <p className="text-muted-foreground">
              Yes. Reinvested dividends stay in the "Total Portfolio Value" (End Value). Do not double count them by adding them as "Income" AND including them in the End Value share count. Usually, looking at total account value is the easiest way to capture this.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does leverage (Margin) affect HPR?</h4>
            <p className="text-muted-foreground">
              Leverage magnifies HPR. If you use 2x leverage (50% margin), a 10% asset move creates a 20% HPR on your equity. Leverage works both ways-it can wipe out your equity twice as fast.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR calculated before or after tax?</h4>
            <p className="text-muted-foreground">
              Standard HPR is <strong>Pre-Tax</strong>. To calculate "After-Tax HPR," you must subtract expected tax liabilities on realized gains and dividends from your numerator.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I calculate HPR for a house flip?</h4>
            <p className="text-muted-foreground">
              Absolutely. (Sale Price - Purchase Price - Renovation Costs - Carrying Costs) / Total Cash Invested. This is often called "Return on Investment" (ROI) in real estate, but mathematically it is HPR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Portfolio vs. Single Asset HPR?</h4>
            <p className="text-muted-foreground">
              You can calculate HPR for a whole portfolio by using Total Portfolio Start Value and Total Portfolio End Value. Just be careful about deposits/withdrawals distorting the math.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR the same as Simple Return?</h4>
            <p className="text-muted-foreground">
              Yes. Simple Return and Holding Period Return are synonyms. They both measure the percentage change from A to B.
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
          <p>The HPR Calculator computes total return including capital gains and income over your investment period.</p>
          <p>HPR is not annualized—use CAGR for comparing investments with different durations.</p>
          <p>Essential for tracking trade performance and measuring actual investment results.</p>
        </CardContent>
      </Card>
    </div>
  );
}


