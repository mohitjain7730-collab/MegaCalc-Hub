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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Target Price Calculation: Strategies for Disciplined Exits" />
        <meta itemProp="description" content="Learn how to calculate precise target prices for your investments. Understand simple vs. annualized targets, how to set realistic profit goals, and using target prices for risk management." />
        <meta itemProp="keywords" content="target price calculator, stock exit strategy, calculate profit target, stock market return goals, annualized return calculator, investment exit planning" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-target-price" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Setting Target Prices: Strategic Exit Planning</h1>
        <p className="text-lg italic text-muted-foreground">Remove emotion from your trading by calculating precise price targets aligned with your financial goals and time horizon.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-target" className="hover:underline">What is a Target Price?</a></li>
          <li><a href="#simple-vs-compound" className="hover:underline">Simple vs. Compounded Targets</a></li>
          <li><a href="#setting-targets" className="hover:underline">How to Set Realistic Targets</a></li>
          <li><a href="#fundamental-targets" className="hover:underline">Fundamental vs. Technical Targets</a></li>
          <li><a href="#using-targets" className="hover:underline">Using Targets Effectively</a></li>
        </ul>
        <hr />

        <h2 id="what-is-target" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Target Price?</h2>
        <p>A target price is the projected future price level at which you plan to sell an investment to achieve your desired return. It serves as a concrete goalpost that helps you execute a disciplined exit strategy, rather than relying on "gut feeling."</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Set Target Prices?</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Discipline:</strong> Predetermined exits prevent greed from turning a winner into a loser (round-tripping).</li>
          <li><strong>Goal Alignment:</strong> Ensures your individual investments are working hard enough to meet your broader financial objectives (e.g., retirement).</li>
          <li><strong>Risk Management:</strong> By defining your potential reward (target), you can properly size your risk (stop-loss) to achieve a positive expectancy ratio.</li>
        </ul>
        <hr />

        <h2 id="simple-vs-compound" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Simple vs. Compounded Targets</h2>
        <p>The time horizon of your trade dictates which calculation method is appropriate.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Simple Target (Short-Term)</h3>
        <p>For trades lasting less than a year. It applies your desired return percentage directly to the current price. Example: buying at $50 for a 10% swing trade move = $55 target.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Annualized Target (Long-Term)</h3>
        <p>For multi-year investments. It accounts for compounding growth. If you want 15% annual growth over 5 years, the math is exponential: $50 × (1.15)^5 = ~$100.57. This is vital for long-term wealth planning.</p>
        <hr />

        <h2 id="setting-targets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Set Realistic Targets</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Benchmark Against Market</h3>
        <p>The S&P 500 historically returns ~10% annually. If your target requires a stock to grow 50% annually for 5 years, you are betting on an extreme outlier performance. Is your thesis strong enough to support that?</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Consider Valuation</h3>
        <p>Targets should be grounded in reality. If your price target implies a P/E ratio of 100x for a utility company, it is likely unrealistic. Use fundamental analysis (earnings growth) to sanity-check your math.</p>
        <hr />

        <h2 id="fundamental-targets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundamental vs. Technical Targets</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Fundamental:</strong> Based on valuation metrics (e.g., "Trading at 15x next year's earnings").</li>
          <li><strong>Technical:</strong> Based on chart patterns, resistance levels, or Fibonacci extensions (e.g., "Selling at the 200-day moving average").</li>
          <li><strong>Hybrid:</strong> The best targets often combine both—fundamentals justify the "why," and technicals fine-tune the "where."</li>
        </ul>
        <hr />

        <h2 id="using-targets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using Targets Effectively</h2>
        <h3 className="text-xl font-semibold text-foreground mt-6">Scaling Out</h3>
        <p>You don't have to sell everything at one price. Professional traders often "scale out"—selling 50% at the first target to lock in profit, and letting the rest ride with a trailing stop.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Stop-Loss Pairing</h3>
        <p>A target price is half of the equation. Always pair it with a risk limit. If you target a $10 gain, ensure your stop-loss risks no more than $3-$5 to maintain a healthy 2:1 or 3:1 reward-to-risk ratio.</p>
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
              Use simple targets for shorter-term trades (swing trading, day trading) where the holding period is typically under a year. Use annualized targets for long-term investing portfolios to ensure your compounded wealth goals are being met.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Do dividends affect target prices?</h4>
            <p className="text-muted-foreground">
              Strictly speaking, a price target focuses on capital appreciation. However, for total return planning, you should subtract the expected dividend yield from your required return. If you need 10% total return and the stock pays 4% dividends, you only need 6% price appreciation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I use analyst price targets?</h4>
            <p className="text-muted-foreground">
              Analyst targets can be a useful reference point for market consensus, but they are often lagging indicators or overly optimistic. Treat them as one data point among many, rather than a guaranteed roadmap. Your own financial timeline matters more than an analyst's 12-month outlook.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should I adjust targets for inflation?</h4>
            <p className="text-muted-foreground">
              This calculator uses nominal returns. If your goal is to maintain purchasing power, you should add your expected inflation rate to your desired real return. E.g., for a 5% real return with 3% inflation, target a nominal 8% return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What are "psychological" price targets?</h4>
            <p className="text-muted-foreground">
              Markets often hesitate at round numbers (e.g., $100, $500, $1,000). These are psychological barriers. It is often wise to set your sell limit slightly <em>below</em> a major round number (e.g., $99.95 instead of $100.00) to ensure your order gets filled before the crowd sells.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What risks can derail my target?</h4>
            <p className="text-muted-foreground">
              Earnings misses, valuation compression (market paying less for the same earnings), rising interest rates, sector rotation, and macroeconomic shocks can all prevent a stock from reaching a logical target.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I revisit targets?</h4>
            <p className="text-muted-foreground">
              Review targets quarterly during earnings season or whenever there is material news about the company. If the investment thesis changes (e.g., they lose a major patent), your target price must be updated to reflect the new reality.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How should I combine targets with stop-losses?</h4>
            <p className="text-muted-foreground">
              Set independent risk limits using the "R-Multiple" concept. If you risk $1 per share (1R) on your stop-loss, your target should generally be at least $2 or $3 away (2R or 3R) to ensure profitable trading over the long run.
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


