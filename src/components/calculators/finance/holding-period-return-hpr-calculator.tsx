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
        <meta itemProp="description" content="Calculate the total return on an asset over the entire time it was held. Learn the difference between HPR and annualized return, and how to account for income like dividends." />
        <meta itemProp="keywords" content="holding period return calculator, HPR formula, investment total return, calculate stock profit, portfolio performance, absolute return calculator" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-hpr" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Holding Period Return: Your Bottom Line</h1>
        <p className="text-lg italic text-muted-foreground">The simplest, most honest metric in finance. "Did I make money, and if so, how much?"</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-hpr" className="hover:underline">What is HPR?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula</a></li>
          <li><a href="#annualized" className="hover:underline">HPR vs. Annualized Return</a></li>
          <li><a href="#components" className="hover:underline">Components of Return</a></li>
          <li><a href="#examples" className="hover:underline">Real World Examples</a></li>
        </ul>
        <hr />

        <h2 id="what-is-hpr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Holding Period Return?</h2>
        <p>Holding Period Return (HPR) is the total return received from holding an asset or portfolio of assets over a specified period of time. It is expressed as a percentage.</p>
        <p>Unlike annualized metrics, HPR doesn't care about <em>how long</em> you held the asset. Whether you made 50% in 1 year or 50% in 10 years, the HPR is 50% in both cases.</p>
        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula</h2>
        <p className="font-mono bg-muted p-2 rounded">HPR = ((Income + (End Value - Initial Value)) / Initial Value) * 100</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Income:</strong> Dividends or interest payments received during the period.</li>
          <li><strong>End Value:</strong> The sale price or current market value.</li>
          <li><strong>Initial Value:</strong> The purchase price.</li>
        </ul>
        <hr />

        <h2 id="annualized" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HPR vs. Annualized Return</h2>
        <p>HPR is an "Absolute Return." It tells you the magnitude of your gain.</p>
        <p><strong>Example:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Investment A: 20% HPR over 1 year. (Great!)</li>
          <li>Investment B: 20% HPR over 10 years. (Terrible ~1.8% annual return).</li>
        </ul>
        <p>Always check the time period when looking at HPR.</p>
        <hr />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Components of Return</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Capital Appreciation</h3>
        <p>The change in the price of the asset itself. (Buy low, sell high).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Yield (Income)</h3>
        <p>Cash flow generated by the asset, such as dividends from stocks or coupon payments from bonds. HPR captures this crucial component that price charts often miss.</p>
        <hr />

        <h2 id="examples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real World Examples</h2>
        <p><strong>Real Estate:</strong> HPR is excellent for house flips. You buy for $200k, spend $50k renovating (total cost $250k), sell for $350k. Your HPR is ($350k - $250k) / $250k = 40%.</p>
        <p><strong>Dividend Stocks:</strong> Buying AT&T at $20 and selling at $20 sounds like 0% return. But if you collected $2 in dividends, your HPR is ($2 + $0) / $20 = 10%.</p>
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
              No. HPR is a nominal return measure. If your HPR is 10% over 5 years but inflation was 15% over that same period, you actually lost purchasing power despite the positive HPR.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does HPR differ from TWR (Time Weighted Return)?</h4>
            <p className="text-muted-foreground">
              HPR calculates the return for a single period. TWR links multiple HPRs together geometrically to eliminate the distorting effects of cash inflows and outflows (deposits/withdrawals) into the portfolio. Fund managers use TWR; individual investors typically care about their personal HPR (or Money Weighted Return).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can HPR be negative?</h4>
            <p className="text-muted-foreground">
              Yes. If the sum of your ending value and income is less than your initial investment, your HPR will be negative, representing a loss.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include reinvested dividends?</h4>
            <p className="text-muted-foreground">
              Yes. If you reinvest dividends, they increase your basis or share count, but they are still part of the "total return." Ensure you account for the value of those additional shares in your End Value.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does margin trading affect HPR?</h4>
            <p className="text-muted-foreground">
              Margin acts as a multiplier. If you put up 50% cash and borrow 50%, a 10% rise in the asset price results in a 20% HPR on your cash equity (minus borrowing costs). Conversely, a 10% drop causes a 20% loss.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What about short selling?</h4>
            <p className="text-muted-foreground">
              For short selling, the formula inverts. You profit when the End Value is <em>lower</em> than Initial Value. HPR = (Initial Value - End Value - Dividends Paid) / Margin Posted. Note that short sellers <em>pay</em> dividends rather than receive them.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR the same as "Total Return"?</h4>
            <p className="text-muted-foreground">
              Yes, the terms are often used interchangeably. Both refer to the combination of price appreciation and income received over a specific holding period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Portfolio vs. Single Asset HPR?</h4>
            <p className="text-muted-foreground">
              You can calculate HPR for a whole portfolio by using Total Portfolio Start Value and Total Portfolio End Value. However, if you added cash to the portfolio during the period, the simple HPR formula will be distorted (making it look like investment gain when it was just a deposit).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR nominal or real?</h4>
            <p className="text-muted-foreground">HPR is typically nominal. For real purchasing power, subtract cumulative inflation over the holding period.</p>
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


