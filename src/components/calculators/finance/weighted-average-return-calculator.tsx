'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Plus, Trash2, FunctionSquare, HelpCircle, Shield, Info, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const itemSchema = z.object({ weightPct: z.number().min(0).max(100).optional(), returnPct: z.number().min(-100).max(1000).optional() });
const formSchema = z.object({ items: z.array(itemSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function WeightedAverageReturnCalculator() {
  const [result, setResult] = useState<{
    weightedReturn: number;
    totalWeight: number;
    assetCount: number;
    performanceLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { items: [{ weightPct: undefined as any, returnPct: undefined as any }] as any } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const getPerformanceLevel = (ret: number): string => {
    if (ret >= 20) return 'Exceptional';
    if (ret >= 10) return 'Strong';
    if (ret >= 5) return 'Moderate';
    if (ret >= 0) return 'Low';
    return 'Negative';
  };

  const getInsights = (ret: number, assets: number, totalW: number): string[] => {
    const insights: string[] = [];
    insights.push(`Portfolio weighted return of ${ret.toFixed(2)}%`);
    insights.push(`Based on ${assets} asset(s) totaling ${totalW.toFixed(1)}% weight`);
    if (ret >= 10) {
      insights.push('Outperforming typical market benchmarks');
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'Weights should sum to 100% for accurate portfolio return',
    'Individual asset risk not captured by weighted return alone',
    'Correlation between assets affects true portfolio risk',
    'Rebalancing impacts actual realized returns',
    'Consider Sharpe ratio for risk-adjusted comparison'
  ];

  const getRecommendation = (ret: number, totalW: number): string => {
    if (Math.abs(totalW - 100) > 1) return `Weights sum to ${totalW.toFixed(1)}%. Adjust to 100% for accurate portfolio return.`;
    if (ret >= 15) return 'Strong portfolio performance. Review correlation to ensure diversification.';
    return 'Moderate return. Evaluate individual holdings for optimization opportunities.';
  };

  const onSubmit = (v: FormValues) => {
    const valid = v.items.filter(it => it.weightPct != null && it.returnPct != null);
    const totalW = valid.reduce((s, it) => s + (it.weightPct as number), 0);
    const wr = valid.reduce((s, it) => s + ((it.weightPct as number) / 100) * (it.returnPct as number), 0);
    setResult({
      weightedReturn: Math.round(wr * 100) / 100,
      totalWeight: totalW,
      assetCount: valid.length,
      performanceLevel: getPerformanceLevel(wr),
      interpretation: `Your portfolio weighted return is ${wr.toFixed(2)}% based on ${valid.length} asset(s).`,
      recommendation: getRecommendation(wr, totalW),
      insights: getInsights(wr, valid.length, totalW),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Weighted Average Return</CardTitle><CardDescription>Combine returns by portfolio weights</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <FormField control={form.control} name={`items.${i}.weightPct` as const} render={({ field }) => (
                    <FormItem><FormLabel>Weight (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${i}.returnPct` as const} render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" onClick={() => remove(i)} className="md:w-auto"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => append({ weightPct: undefined as any, returnPct: undefined as any })}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                <Button type="submit" className="md:w-auto">Calculate Weighted Return</Button>
              </div>
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
                  <CardTitle>Portfolio Return Analysis</CardTitle>
                  <CardDescription>Weighted average across assets</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.weightedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.weightedReturn}%</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Total Weight</p>
                  <p className="text-lg font-bold">{result.totalWeight.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Assets</p>
                  <p className="text-lg font-bold">{result.assetCount}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Return</p>
                  <p className="text-lg font-bold">{result.weightedReturn}%</p>
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
                <CardDescription>Portfolio analysis</CardDescription>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Portfolio analytics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">HPR</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Risk metric.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI</a></h4><p className="text-sm text-muted-foreground">Simple return.</p></div>
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
              Weighted Return = Σ (Weight_i × Return_i)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Each component's return is multiplied by its portfolio weight, then summed to get the total portfolio return.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Weight (%)</h4>
              <p className="text-sm text-muted-foreground">Percentage of portfolio allocated to this component. Should sum to 100%.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Return (%)</h4>
              <p className="text-sm text-muted-foreground">The return achieved by this component (can be positive or negative).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Weighted Average Return</h1>
          <meta itemProp="description" content="Calculate your portfolio's true performance using the Weighted Average Return method. Understand how asset allocation impacts your overall investment results." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Weighted Average Return, Portfolio Performance, Investment Calculator, Asset Allocation, Finance Tools" />

          <p className="text-lg italic text-muted-foreground">Learn how to calculate portfolio-level returns from individual component performance.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Weighted Average Return?</h2>
          <p>Weighted average return combines individual asset returns based on their portfolio weights. It tells you how your portfolio performed overall by accounting for how much of your capital was allocated to each holding.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Why Weights Matter</h2>
          <p>A stock that returns 50% but represents only 5% of your portfolio has less impact than one returning 10% that represents 50% of your holdings. Weighting captures this reality.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Equal-Weight vs. Cap-Weight</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Equal-Weight:</strong> Each component has the same weight (e.g., 10% each in a 10-stock portfolio).</li>
            <li><strong>Cap-Weight:</strong> Weights based on market capitalization or portfolio allocation percentages.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">Calculating Your Portfolio Return</h2>
          <p>The formula is simple: Sum of (Weight of Asset × Return of Asset). Repeat for all assets.</p>
          <p>Example:
            <br />Asset A (40% weight, 10% return) = 0.40 × 10 = 4%
            <br />Asset B (60% weight, 5% return) = 0.60 × 5 = 3%
            <br />Total Weighted Return = 4% + 3% = 7%
          </p>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Weighted average return is essential for understanding portfolio performance. It properly accounts for your actual allocation decisions.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Detailed answers about weighted returns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Should weights always sum to 100%?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Ideally, yes. If your weights sum to less than 100%, it implies some capital is unallocated (cash) or missing from the calculation. If they sum to more than 100%, it implies leverage or a calculation error.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How do I handle cash in this calculation?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Treat cash as another asset. Its weight is the percentage of cash in the portfolio, and its return is the interest rate earned (often close to 0%).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I use this for short positions?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. Short positions effectively have negative weights in a typical long-only framework if you view them as "owing" the asset, but usually, in return attribution, you treat the short exposure weight as positive but the <em>return</em> contribution logic might differ (gaining when price drops). A simpler way is to input the realized return of the short leg directly.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What about fees and commissions?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">For the most accurate result, use "net returns" (after fees) for each asset. Alternatively, you can deduct a fixed percentage from the final weighted average to estimate the fee impact.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does rebalancing affect this?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. If you rebalance, you change the weights. This calculator is a snapshot in time. For performance over a period with rebalancing, you need to calculate Time-Weighted Returns or link period returns.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the difference between this and ROI?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">ROI (Return on Investment) usually refers to the total gain/loss relative to initial cost. Weighted Average Return breaks down <em>how</em> that total return was achieved based on the components.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Does this measure risk?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">No. This calculates performance (return). To measure risk, you need to look at standard deviation, beta, or portfolio variance, which account for how asset prices move together (correlation).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can I use this for a bond portfolio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Absolutely. Use the yield or total return of each bond and its weight in the portfolio.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Why doesn't my broker show the same number?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Brokers often use Time-Weighted Return (TWR) or Money-Weighted Return (MWR/IRR) which account for cash inflows and outflows differently than a simple weighted average of current holdings.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Summary Section */}
        <div className="mt-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The Weighted Average Return Calculator combines individual asset returns by their portfolio weights to get overall portfolio performance.</p>
              <p>Ensure weights sum to 100% for complete portfolio analysis.</p>
              <p>Input net-of-fee returns for accurate after-cost performance measurement.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


