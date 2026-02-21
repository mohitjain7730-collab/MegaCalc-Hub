'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calculator, Percent, BarChart3, CheckCircle2, LineChart, Target, CalendarClock, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  startValue: z.number().positive('Start value must be positive'),
  endValue: z.number().positive('End value must be positive').optional(),
  periods: z.number().min(1, 'Periods must be at least 1').optional(),
  growthRate: z.number().optional(),
  projectionPeriods: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialForecastGrowthRateCalculator() {
  const [result, setResult] = useState<{
    growthRate: number | null;
    cagr: number | null;
    projectedValue: number | null;
    doublingTime: number | null;
    absoluteChange: number | null;
    growthStrength: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startValue: undefined,
      endValue: undefined,
      periods: undefined,
      growthRate: undefined,
      projectionPeriods: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { startValue, endValue, periods, growthRate, projectionPeriods } = v;

    let calculatedCAGR = null;
    let calculatedGrowthRate = null;
    let projected = null;
    let absoluteChange = null;

    // Mode 1: Historical Analysis (Start + End + Periods provided)
    if (startValue && endValue && periods) {
      absoluteChange = endValue - startValue;
      calculatedGrowthRate = ((endValue - startValue) / startValue) * 100;
      calculatedCAGR = (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
    }

    // Mode 2: Projection (Start + Rate provided)
    let rateToUse = growthRate;
    if (rateToUse === undefined && calculatedCAGR !== null) {
      rateToUse = calculatedCAGR;
    }

    if (startValue && rateToUse !== undefined && (projectionPeriods || periods)) {
      const time = projectionPeriods || periods || 1;
      projected = startValue * Math.pow(1 + rateToUse / 100, time);
    }

    // Derived metrics
    const effectiveRate = rateToUse !== undefined ? rateToUse : (calculatedCAGR !== null ? calculatedCAGR : 0);
    const doublingTime = effectiveRate > 0 ? 72 / effectiveRate : null;

    // Interpretation
    let growthStrength = 'Moderate';
    if (effectiveRate > 20) growthStrength = 'Aggressive';
    else if (effectiveRate > 10) growthStrength = 'Strong';
    else if (effectiveRate < 3 && effectiveRate > 0) growthStrength = 'Sluggish';
    else if (effectiveRate <= 0) growthStrength = 'Eroding';

    const interpretation = effectiveRate > 0
      ? `The asset is growing at a compounded rate of ${effectiveRate.toFixed(2)}% per period.`
      : `The asset is shrinking at a rate of ${Math.abs(effectiveRate).toFixed(2)}% per period.`;

    let recommendation = '';
    if (growthStrength === 'Aggressive') recommendation = 'High growth requires cash to fuel scaling. Ensure working capital can keep up.';
    else if (growthStrength === 'Eroding') recommendation = 'Warning: Negative growth trajectory. Immediate strategic pivot or cost-cutting required.';
    else recommendation = 'Steady growth. Focus on margin optimization and retaining existing efficiency.';

    const insights = [
      `A CAGR of ${effectiveRate.toFixed(2)}% means your money multiplies by ${(1 + effectiveRate / 100).toFixed(2)}x annually.`,
      doublingTime ? `At this pace, your value will double in approx. ${doublingTime.toFixed(1)} periods (Rule of 72).` : 'Growth is zero or negative; value will not double.'
    ];

    if (projected) {
      insights.push(`Projected Forecast: ${startValue.toLocaleString()} → ${projected.toLocaleString()}`);
    }

    const risks = [
      effectiveRate > 30 ? 'Sustainability Risk: Ultra-high growth is rarely permanent. Plan for eventual slowing.' : undefined,
      effectiveRate < 5 ? 'Inflation Risk: This growth may barely beat inflation, losing real purchasing power.' : undefined,
    ].filter(Boolean) as string[];

    if (risks.length === 0) risks.push('Standard growth variance applies; past performance does not guarantee future results.');

    return {
      growthRate: calculatedGrowthRate,
      cagr: calculatedCAGR,
      projectedValue: projected,
      doublingTime,
      absoluteChange,
      growthStrength,
      interpretation,
      recommendation,
      insights,
      risks,
    };
  };

  const onSubmit = (values: FormValues) => {
    // Basic validation to ensure we have enough to do SOMETHING
    if (!values.startValue) return;
    if ((!values.endValue || !values.periods) && values.growthRate === undefined) return;

    const res = calculate(values);
    setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Growth Scenario
          </CardTitle>
          <CardDescription>
            Analyze historical growth (CAGR) or forecast future value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Starting Value
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100000"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Option A: Analyze Past Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="endValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Ending Value (Historical)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 150000"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="periods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            Number of Periods (Years)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 3"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Option B: Forecast Future</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="growthRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Known Growth Rate (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5 (Optional if calculating above)"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectionPeriods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4" />
                            Years to Forecast
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Growth
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Forecast Analysis</CardTitle>
                  <CardDescription>Growth trajectory results</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Effective Annual Rate</p>
                  {result.cagr !== null ? (
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">{result.cagr.toFixed(2)}%</p>
                  ) : (
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">{form.getValues('growthRate')}%</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Compound Annual Growth Rate</p>
                </div>
                <div className="text-center p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Projected Value</p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
                    {result.projectedValue ? `$${result.projectedValue.toLocaleString([], { maximumFractionDigits: 0 })}` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Future Future Outlook</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Trend</p>
                  <Badge variant={result.growthStrength === 'Aggressive' || result.growthStrength === 'Strong' ? 'default' : result.growthStrength === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.growthStrength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CalendarClock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Doubling Time</p>
                  <p className="text-lg font-bold text-amber-600">
                    {result.doublingTime ? `${result.doublingTime.toFixed(1)} Years` : 'Never'}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold">Total Gain/Loss</p>
                  <p className={`text-lg font-bold ${result.absoluteChange && result.absoluteChange < 0 ? 'text-destructive' : 'text-indigo-600'}`}>
                    {result.absoluteChange ? `$${result.absoluteChange.toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Insight:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Growth Metrics
                </CardTitle>
                <CardDescription>Key takeaways</CardDescription>
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
                  Potential Risks
                </CardTitle>
                <CardDescription>Factors to watch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Understanding Forecasting Variables
          </CardTitle>
          <CardDescription>
            These inputs define the trajectory of your financial model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="h-4 w-4" />
                Historical Data
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Start & End Value:</strong> The raw beginning and ending numbers of the period observed (e.g., Revenue in 2020 vs 2024).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Periods:</strong> The number of steps (years/months) between the two values. Essential for smoothing out the average via CAGR.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <ArrowUpRight className="h-4 w-4" />
                Projection Inputs
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Growth Rate:</strong> The percentage you expect the asset to rise by each year. Can be derived from historical (CAGR) or estimated manually.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Forecast Time:</strong> How far into the future you want to look. Compounding effects become dramatic after 10+ periods.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              CAGR = (End Value / Start Value)^(1/n) - 1
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Future Value = Present Value × (1 + Rate)^n
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Where <em>n</em> is the number of time periods (typically years).
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Tools to compare simplified options and plan repayments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/cagr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">CAGR Calculator</p>
                      <p className="text-sm text-muted-foreground">Specialized growth tool</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/future-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Future Value</p>
                      <p className="text-sm text-muted-foreground">TVM Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/dcf-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">DCF Calculator</p>
                      <p className="text-sm text-muted-foreground">Discounted Cash Flow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/cash-flow-forecasting-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Cash Flow Forecast</p>
                      <p className="text-sm text-muted-foreground">Liquidity projection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth projection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Investment return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="headline" content="Mastering Financial Forecasting and Growth Rates" />
        <meta itemProp="description" content="A comprehensive guide to calculating Annual Growth Rates (CAGR) and forecasting future financial performance. Learn to model business scenarios." />
        <meta itemProp="author" content="Financial Modeling Institute" />
        <meta itemProp="datePublished" content="2025-09-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Financial Forecasting and Growth Rates</h1>
        <p className="text-lg italic text-muted-foreground">Predicting the future is impossible, but modeling it is essential. Financial forecasting allows businesses and investors to anticipate potential outcomes and prepare for success.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#growth-types" className="hover:underline">Types of Growth Rates (CAGR vs. AAGR)</a></li>
          <li><a href="#forecasting" className="hover:underline">Forecasting Methods: The Basics</a></li>
          <li><a href="#compounding" className="hover:underline">The Power of Compounding</a></li>
          <li><a href="#accuracy" className="hover:underline">Forecasting Accuracy & Risks</a></li>
          <li><a href="#strategic" className="hover:underline">Strategic Application</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="growth-types" className="text-2xl font-bold text-foreground pt-8">Types of Growth Rates (CAGR vs. AAGR)</h2>
        <p>When analyzing historical performance, not all averages are created equal.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>AAGR (Average Annual Growth Rate):</strong> The simple arithmetic mean of a series of yearly growth rates. It can be misleading if there is high volatility (e.g., +50% then -50%).</li>
          <li><strong>CAGR (Compound Annual Growth Rate):</strong> The geometric mean. It "smooths" the volatility to show you what constant rate would have taken you from the Start Value to the End Value. This is the gold standard for investment analysis.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="forecasting" className="text-2xl font-bold text-foreground pt-8">Forecasting Methods: The Basics</h2>
        <p>Financial forecasting typically relies on one of three approaches:</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Historical Run Rate:</strong> Assuming the future will look exactly like the recent past. Good for stable, mature industries (utilities).</li>
          <li><strong>Market-Driven:</strong> Projecting growth based on total addressable market (TAM) expansion. Common for startups.</li>
          <li><strong>Bottom-Up:</strong> Estimating sales by headcount, production capacity, or marketing spend. This is usually the most accurate for operational budgeting.</li>
        </ol>

        <hr className="my-6" />

        <h2 id="compounding" className="text-2xl font-bold text-foreground pt-8">The Power of Compounding</h2>
        <p>Albert Einstein reportedly called compound interest the "eighth wonder of the world." In forecasting, small differences in the growth rate variable lead to massive divergence over time.</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            Current $100k @ 5% for 20 years = $265k
          </p>
          <p className="font-mono text-xl text-primary font-bold mt-2">
            Current $100k @ 10% for 20 years = $672k
          </p>
        </div>
        <p>Doubling the rate didn't double the result—it nearly tripled it. This illustrates why striving for even a 1% efficiency gain is worth significant effort in long-term planning.</p>

        <hr className="my-6" />

        <h2 id="accuracy" className="text-2xl font-bold text-foreground pt-8">Forecasting Accuracy & Risks</h2>
        <p>No model is perfect. The further out you forecast (e.g., 5 years vs. 1 year), the lower the probability of accuracy. This concept is known as the "Cone of Uncertainty."</p>
        <p>To mitigate this, financial analysts effectively use **Scenario Planning**: creating a "Base Case," "Bull Case" (Optimistic), and "Bear Case" (Pessimistic). This helps management prepare for volatility range rather than betting on a single number.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about growth modeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "good" growth rate?</h4>
              <p className="text-muted-foreground">
                It depends entirely on the stage of the business. An early-stage startup might need 100%+ annual growth to survive and attract VC funding. A mature blue-chip company might be considered healthy with 5-7% growth (beating inflation).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CAGR preferred over average growth?</h4>
              <p className="text-muted-foreground">
                Average growth ignores the effects of compounding and volatility. If you lose 50% one year and gain 50% the next, your average is 0%, but you have actually lost 25% of your money. CAGR captures this reality.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I forecast negative growth?</h4>
              <p className="text-muted-foreground">
                Yes. This is called a "declining balance" forecast, often used for depreciation of assets or modeling the decay of a customer cohort (churn analysis).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Rule of 72?</h4>
              <p className="text-muted-foreground">
                It's a mental math shortcut. Divide 72 by your annual growth rate to see how many years it takes to double your investment. (72 / 10% = 7.2 years).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this calculator account for inflation?</h4>
              <p className="text-muted-foreground">
                No, this calculates "Nominal" growth. To find "Real" growth (purchasing power), you must subtract the inflation rate from the nominal growth rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do acquisitions affect growth rate?</h4>
              <p className="text-muted-foreground">
                Acquisitions create "Inorganic Growth." When analyzing long-term trends, analysts often strip this out to see "Organic Growth," which reflects the true health of the core business.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "linear" vs "exponential" growth?</h4>
              <p className="text-muted-foreground">
                Linear growth adds a fixed amount ($10k/year). Exponential growth adds a fixed percentage (10%/year). Over long periods, exponential growth always vastly outperforms linear growth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do growth rates slow down?</h4>
              <p className="text-muted-foreground">
                The "Law of Large Numbers." It is mathematically harder to grow 50% on $1 billion revenue than on $1 million revenue. Saturation eventually slows all growth curves.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is high growth always risky?</h4>
              <p className="text-muted-foreground">
                Often, yes. High growth usually burns cash (negative working capital) and attracts fierce competition. "Hypergrowth" stresses operational systems and culture.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How far ahead should I forecast?</h4>
              <p className="text-muted-foreground">
                Typically 3-5 years. Anything beyond 5 years is widely considered speculative guess-work (or "hockey stick" dreams) in dynamic industries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Best practices for reliable forecasting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Stock Investors</strong>
                <span className="text-sm text-muted-foreground">To compare the historical CAGR of earnings for different companies.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Sales Directors</strong>
                <span className="text-sm text-muted-foreground">To set next year's quotas based on previous growth trajectories.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement Planners</strong>
                <span className="text-sm text-muted-foreground">To project how big a 401(k) nest egg will grow over 30 years at 7%.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Corporate Strategists</strong>
                <span className="text-sm text-muted-foreground">To determine if the core business is growing fast enough to satisfy shareholders.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Garbage In, Garbage Out:</strong> A forecast is only as good as its assumptions. If you assume 20% growth forever, the calculator will spit out trillions, but reality will differ.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Black Swan Events:</strong> Mathematical models cannot predict pandemics, wars, or regulatory bans which can instantly invert a growth trend.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Startup Curve</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A software startup goes from $100k to $1M revenue in 2 years. This is a 216% CAGR. Using this rate to forecast the next 5 years would predict they become larger than Google. Investors dampen the rate (e.g., to 50%) for future years to account for saturation.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The Dividend Stock</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A utility company grows its dividend from $1.00 to $1.15 over 5 years. That's a 2.8% CAGR. While low, it is highly predictable and safe, making it perfect for a retiree's income forecasting model.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Financial Forecast & Growth Rate Calculator is a versatile tool for both backward-looking analysis (CAGR) and forward-looking projection (Future Value).</p>
          <p>It highlights the immense power of compound growth over long time horizons while providing standardized metrics for comparing investments.</p>
          <p>Use it to ground your financial dreams in mathematical reality and set achievable benchmarks for success.</p>
        </CardContent>
      </Card>
    </div>
  );
}
