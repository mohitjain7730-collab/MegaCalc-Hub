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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">HPR</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Risk metric.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI</a></h4><p className="text-sm text-muted-foreground">Simple return.</p></div>
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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Weighted Average Return: Portfolio Performance Analysis" />
        <meta itemProp="description" content="Calculate your portfolio's true performance using the Weighted Average Return method. Learn about asset allocation impact or 'contribution to return', rebalancing effects, and benchmarking." />
        <meta itemProp="keywords" content="Weighted Average Return, Portfolio Performance, contribution to return, weighted return formula, portfolio rebalancing, investment benchmarking, asset allocation math" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-weighted-average-return" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Weighted Average Return: Measuring Portfolio Success</h1>
        <p className="text-lg italic text-muted-foreground">Don't just count your winners. Learn how to mathematically determine how much each position contributes to your overall bottom line.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-it" className="hover:underline">What is Weighted Average Return?</a></li>
          <li><a href="#math-breakdown" className="hover:underline">The Math: Contribution to Return</a></li>
          <li><a href="#impact-of-weights" className="hover:underline">The Impact of Asset Allocation</a></li>
          <li><a href="#rebalancing" className="hover:underline">Rebalancing & Weight Drift</a></li>
          <li><a href="#benchmarking" className="hover:underline">Benchmarking Your Performance</a></li>
        </ul>
        <hr />

        <h2 id="what-is-it" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Weighted Average Return?</h2>
        <p>The <strong>Weighted Average Return</strong> is the aggregate return of a portfolio, calculated by multiplying the return of each asset by its weight (percentage of total capital) in the portfolio.</p>
        <p>Unlike a simple average, which treats a $100 position the same as a $100,000 position, the weighted average respects the <em>financial reality</em> of your allocation. It answers the question: <strong>"How did my actual money perform?"</strong></p>
        <hr />

        <h2 id="math-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Math: Contribution to Return</h2>
        <p>Investment professionals use a concept called "Contribution to Return" (CTR). This is the specific slice of performance that a single asset adds to the whole.</p>
        <p className="font-mono bg-muted p-2 rounded">CTR = Asset Weight × Asset Return</p>
        <p><strong>Example:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Tech Stock:</strong> 20% Weight × 50% Return = <strong>+10.0%</strong> contribution.</li>
          <li><strong>Bond Fund:</strong> 80% Weight × 2% Return = <strong>+1.6%</strong> contribution.</li>
          <li><strong>Total Portfolio Return:</strong> 10.0% + 1.6% = <strong>11.6%</strong>.</li>
        </ul>
        <p>Notice how the "boring" bond fund diluted the high-flying tech stock. This is the mechanism of diversification in action.</p>
        <hr />

        <h2 id="impact-of-weights" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Impact of Asset Allocation</h2>
        <p>Asset allocation—the weights you choose—is widely considered the primary driver of long-term investment returns, explaining over 90% of a portfolio's variance.</p>
        <p><strong>Strategy Tip:</strong> If you have high conviction in a trade, sizing it too small (e.g., 1% weight) means even a 100% gain only adds 1% to your year. "Sizing ensures your winners matter."</p>
        <hr />

        <h2 id="rebalancing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rebalancing & Weight Drift</h2>
        <p>Market movements naturally change your weights. This is called "Drift."</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>The Problem:</strong> Winners grow to become a larger % of the pie, increasing risk. Losers shrink, reducing their potential rebound impact.</li>
          <li><strong>The Fix:</strong> Rebalancing involves selling some of the overweight assets (selling high) and buying underweight assets (buying low) to restore your target weights.</li>
        </ul>
        <hr />

        <h2 id="benchmarking" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarking Your Performance</h2>
        <p>Once you calculate your weighted return, compare it to a relevant benchmark.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>US Stocks:</strong> S&P 500 (SPY)</li>
          <li><strong>Global Stocks:</strong> MSCI World (VT)</li>
          <li><strong>Bonds:</strong> US Aggregate Bond (AGG)</li>
        </ul>
        <p>Did short-term trading beat the "lazy" benchmark? The weighted average tells the truth.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about weighted returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this include dividends?</h4>
            <p className="text-muted-foreground">
              To get an accurate "Total Return," you <strong>must</strong> include dividends in the individual asset return percentage. If a stock rose 8% and paid 2% dividend, input 10% as the return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I handle cash drag?</h4>
            <p className="text-muted-foreground">
              Cash is a position! If 20% of your portfolio is in cash earning 0%, input it as: Weight 20%, Return 0%. This will rightfully lower your total portfolio return, illustrating "cash drag" in a rising market.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if my weights don't sum to 100%?</h4>
            <p className="text-muted-foreground">
              If they sum to less than 100%, you are missing data (or cash). If they sum to 120%, you are using leverage (margin). The calculator will still do the math, but the result implies a leveraged return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does this differ from Time-Weighted Return (TWR)?</h4>
            <p className="text-muted-foreground">
              Weighted Average is a snapshot of current holdings. TWR links returns over time periods to eliminate the effect of deposits/withdrawals. Fund managers use TWR; this calculator is better for "Attribution Analysis" of a static allocation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for short positions?</h4>
            <p className="text-muted-foreground">
              Yes. But the math can get tricky. Usually, you treat the short exposure weight as positive (it uses capital) but the <em>return</em> depends on price drop. If you shorted $10k and it made 5%, input Weight X%, Return +5%.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is high concentration bad?</h4>
            <p className="text-muted-foreground">
              Concentration (high weights in few assets) increases variance. It allows for massive outperformance but also massive underperformance. Diversification (low weights in many assets) "smooths" the weighted return towards the market average.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I calculate this?</h4>
            <p className="text-muted-foreground">
              Calculate it whenever you are considering a rebalance, typically quarterly or annually. Checking it daily is usually noise.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What about negative returns?</h4>
            <p className="text-muted-foreground">
              Negative asset returns simple subtract from the total. A -20% return on a 50% weighted asset drags the whole portfolio down by -10%. This highlights why "risk management" (avoiding large losses) is mathematically potent.
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
          <p>The Weighted Average Return Calculator breaks down portfolio performance by asset contribution.</p>
          <p>It highlights the critical importance of position sizing—your weights matter as much as your picks.</p>
          <p>Use it to analyze "Contribution to Return" and spot which assets are driving (or dragging) your results.</p>
        </CardContent>
      </Card>
    </div>
  );
}


