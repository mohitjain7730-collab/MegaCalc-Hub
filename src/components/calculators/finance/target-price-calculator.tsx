'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, Percent, FunctionSquare, HelpCircle, Shield, Info, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentPrice: z.number().min(0.01).optional(),
  desiredReturnPct: z.number().min(-100).max(1000).optional(),
  holdingYears: z.number().min(0).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TargetPriceCalculator() {
  const [result, setResult] = useState<{
    targetSimple: number;
    targetAnnualized: number;
    appreciation: number;
    annualizedReturn: number;
    returnLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentPrice: undefined, desiredReturnPct: undefined, holdingYears: undefined as any } });

  const getReturnLevel = (returnPct: number): string => {
    if (returnPct >= 50) return 'Aggressive';
    if (returnPct >= 20) return 'Growth';
    if (returnPct >= 10) return 'Moderate';
    return 'Conservative';
  };

  const getInsights = (returnPct: number, years: number, currentPrice: number, targetPrice: number): string[] => {
    const insights: string[] = [];
    insights.push(`Target price of $${targetPrice.toFixed(2)} represents ${returnPct.toFixed(1)}% total return`);
    if (years > 0) {
      const annualized = (Math.pow(targetPrice / currentPrice, 1 / years) - 1) * 100;
      insights.push(`This equals ${annualized.toFixed(1)}% annualized return over ${years} years`);
    }
    if (returnPct >= 50) {
      insights.push('Aggressive target—ensure fundamentals support this growth');
    } else if (returnPct >= 20) {
      insights.push('Reasonable growth target with proper risk management');
    }
    return insights;
  };

  const getConsiderations = (): string[] => [
    'Markets may not achieve your target within expected timeframe',
    'Consider setting stop-loss alongside target price',
    'Dividends add to total return beyond price appreciation',
    'Valuation multiples may compress even with earnings growth',
    'Revisit targets after major fundamental changes'
  ];

  const getRecommendation = (returnPct: number, years: number): string => {
    if (returnPct > 30 && years <= 1) return 'Aggressive short-term target. Consider scaling out in stages.';
    if (returnPct > 50) return 'Very ambitious target. Ensure strong conviction backed by fundamentals.';
    if (years > 5) return 'Long-term target. Review annually and adjust for changing conditions.';
    return 'Set limit orders at your target. Pair with stop-loss for risk management.';
  };

  const onSubmit = (v: FormValues) => {
    if (v.currentPrice == null || v.desiredReturnPct == null || v.holdingYears == null) { setResult(null); return; }
    const targetSimple = v.currentPrice * (1 + v.desiredReturnPct / 100);
    const targetAnnualized = v.holdingYears > 0 ? v.currentPrice * Math.pow(1 + v.desiredReturnPct / 100, v.holdingYears) : targetSimple;
    const appreciation = targetAnnualized - v.currentPrice;
    const annualizedReturn = v.holdingYears > 0 ? (Math.pow(targetAnnualized / v.currentPrice, 1 / v.holdingYears) - 1) * 100 : v.desiredReturnPct;
    setResult({
      targetSimple,
      targetAnnualized,
      appreciation,
      annualizedReturn,
      returnLevel: getReturnLevel(v.desiredReturnPct),
      interpretation: `To achieve ${v.desiredReturnPct}% return${v.holdingYears > 0 ? ` compounded over ${v.holdingYears} year(s)` : ''}, the stock needs to reach $${targetAnnualized.toFixed(2)}.`,
      recommendation: getRecommendation(v.desiredReturnPct, v.holdingYears),
      insights: getInsights(v.desiredReturnPct, v.holdingYears, v.currentPrice, targetAnnualized),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Target Price</CardTitle><CardDescription>Price needed to meet return goals</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="desiredReturnPct" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Desired Return (%)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="holdingYears" render={({ field }) => (
                  <FormItem><FormLabel>Holding Period (years)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Target</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Target Price Analysis</CardTitle>
                  <CardDescription>Required prices for your return goals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.targetAnnualized.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Simple Target</p>
                  <p className="text-lg font-bold">${result.targetSimple.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Appreciation</p>
                  <p className="text-lg font-bold">${result.appreciation.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Annualized</p>
                  <p className="text-lg font-bold">{result.annualizedReturn.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Risk Profile</p>
                  <Badge variant={result.returnLevel === 'Conservative' ? 'secondary' : result.returnLevel === 'Moderate' ? 'outline' : result.returnLevel === 'Growth' ? 'default' : 'destructive'}>
                    {result.returnLevel}
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
                <CardDescription>Target price optimization</CardDescription>
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
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Plan returns and valuation</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</Link></h4><p className="text-sm text-muted-foreground">Annualized returns.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth modeling.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discounting tool.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">After inflation.</p></div>
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
              Simple Target = Current Price × (1 + Return%)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Annualized Target = Current Price × (1 + Return%)^Years
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The simple target gives a one-time return; the annualized target compounds over multiple years.
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
          <CardDescription>What each parameter means for target price</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Price</h4>
              <p className="text-sm text-muted-foreground">Today's market price of the stock.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Desired Return</h4>
              <p className="text-sm text-muted-foreground">Your profit goal as a percentage (e.g., 20 for 20%).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Holding Period</h4>
              <p className="text-sm text-muted-foreground">Number of years for compounded targets.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Setting Target Prices: Strategic Exit Planning</h1>
        <p className="text-lg italic text-muted-foreground">Learn how to calculate target prices for disciplined investing and profitable exits.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-target" className="hover:underline">What is a Target Price?</a></li>
          <li><a href="#simple-vs-compound" className="hover:underline">Simple vs. Compounded Targets</a></li>
          <li><a href="#setting-targets" className="hover:underline">How to Set Realistic Targets</a></li>
          <li><a href="#using-targets" className="hover:underline">Using Targets Effectively</a></li>
        </ul>
        <hr />

        <h2 id="what-is-target" className="text-2xl font-bold text-foreground pt-8">What is a Target Price?</h2>
        <p>A target price is the price level at which you plan to sell to achieve your desired return. It's a key exit strategy component that removes emotion from investment decisions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Set Target Prices?</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Discipline:</strong> Predetermined exits prevent emotional decisions.</li>
          <li><strong>Goal Alignment:</strong> Ensure investments meet financial objectives.</li>
          <li><strong>Risk Management:</strong> Combined with stop-losses, define your reward profile.</li>
        </ul>
        <hr />

        <h2 id="simple-vs-compound" className="text-2xl font-bold text-foreground pt-8">Simple vs. Compounded Targets</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Simple Target</h3>
        <p>Applies your return once. A 20% target on $50 gives $60. Best for short-term trades.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Annualized Target</h3>
        <p>Compounds return over the holding period. A 20% annual target over 3 years: $50 × 1.20³ = $86.40. For long-term investments.</p>
        <hr />

        <h2 id="setting-targets" className="text-2xl font-bold text-foreground pt-8">How to Set Realistic Targets</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Benchmark Against Market</h3>
        <p>The S&P 500 returns ~10% annually long-term. Expecting 50% annually is unrealistic for most stocks.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Consider Valuation</h3>
        <p>If a stock is at high multiples, upside may be limited. Base targets on fundamental analysis.</p>
        <hr />

        <h2 id="using-targets" className="text-2xl font-bold text-foreground pt-8">Using Targets Effectively</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Scaling Out</h3>
        <p>Sell portions as stocks approach targets to lock in gains while allowing upside participation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stop-Loss Pairing</h3>
        <p>Pair target prices with stop-losses. A 3:1 reward-to-risk ratio: target 30% gain with 10% stop-loss.</p>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Target prices are essential for disciplined investing. Calculate based on your goals and timeframe, set realistic expectations, and pair with stop-losses for risk management.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about target prices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use simple or annualized target?</h4>
            <p className="text-muted-foreground">
              Use simple targets for short-term trades under one year. Use annualized targets for multi-year investments to reflect realistic compound growth expectations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do dividends affect target prices?</h4>
            <p className="text-muted-foreground">
              This calculator focuses on price targets. Total return includes dividends, so add expected dividend income for complete analysis. Some investors reduce price targets by expected dividend yield.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What risks can derail my target?</h4>
            <p className="text-muted-foreground">
              Earnings misses, valuation compression, rising rates, sector rotation, and macro shocks can prevent stocks from reaching targets. Diversification and stop-losses help manage these risks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I revisit targets?</h4>
            <p className="text-muted-foreground">
              Review targets quarterly with earnings or after material news. Avoid changing targets based on short-term price movements—focus on fundamental changes affecting long-term value.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is desired return nominal or real?</h4>
            <p className="text-muted-foreground">
              This calculator uses nominal percentages. For real purchasing power analysis, subtract expected inflation from your target return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How should I combine targets with stop-losses?</h4>
            <p className="text-muted-foreground">
              Set independent risk limits. Many traders aim for 2:1 or 3:1 reward-to-risk ratios. If your target is 30% above current price, consider a stop-loss 10-15% below.
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
          <p>The Target Price Calculator computes the price needed to achieve your desired return, both as a simple one-time target and as a compounded multi-year goal.</p>
          <p>Use simple targets for short-term trades and annualized targets for long-term investments.</p>
          <p>Pair target prices with stop-losses for disciplined risk management.</p>
        </CardContent>
      </Card>
    </div>
  );
}


