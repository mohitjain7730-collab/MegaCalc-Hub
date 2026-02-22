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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/cagr-calculator" className="text-primary hover:underline">CAGR</Link></h4><p className="text-sm text-muted-foreground">Annualized returns.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Growth modeling.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discounting tool.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</Link></h4><p className="text-sm text-muted-foreground">After inflation.</p></div>
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
        <meta itemProp="name" content="The Definitive Guide to Setting Target Prices: Valuation, Strategy, and Exit Planning" />
        <meta itemProp="description" content="A comprehensive masterclass on calculating and using target prices. Learn fundamental vs. technical targeting, the mathematics of required returns, institutional exit strategies, and how to avoid common psychological traps." />
        <meta itemProp="keywords" content="target price calculator, stock valuation models, price target formula, exit strategy planning, risk reward ratio, intrinsic value calculation, technical analysis targets, fundamental analysis targets" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-guide-target-price" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Setting Target Prices: Strategic Exit Planning</h1>
        <p className="text-lg italic text-muted-foreground">"Plan the trade, trade the plan." Master the art of defining your exit before you even enter. This guide bridges the gap between simple profit goals and professional valuation methodologies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-target" className="hover:underline">What is a Target Price?</a></li>
          <li><a href="#three-schools" className="hover:underline">The Three Schools of Targeting</a></li>
          <li><a href="#math-behind" className="hover:underline">The Mathematics of Growth</a></li>
          <li><a href="#institutional-vs-retail" className="hover:underline">Institutional vs. Retail Approaches</a></li>
          <li><a href="#risk-management" className="hover:underline">Target Prices as Risk Management</a></li>
          <li><a href="#psychology" className="hover:underline">Psychology of the Exit</a></li>
        </ul>
        <hr />

        <h2 id="what-is-target" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Target Price?</h2>
        <p>A <strong>Target Price</strong> is more than just a wishful number; it is a calculated projection of a security's future value based on specific assumptions about growth, earnings, and market sentiment.</p>
        <p>For a disciplined investor, it serves as the "Take Profit" order—the finish line where the risk of holding the asset no longer justifies the potential remaining reward. Without a target price, you are investing with no defined destination, making you vulnerable to emotional decision-making when volatility strikes.</p>
        <hr />

        <h2 id="three-schools" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Three Schools of Targeting</h2>
        <p>Investors typically use one (or a combination) of three distinct methodologies to derive a target price. Each answers a different question.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Fundamental Valuation ("What is it worth?")</h3>
        <p>This method ignores the stock chart and focuses on the business. It assumes that price will eventually follow value.</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>P/E Expansion:</strong> "If TechCorp grows earnings to $5.00 and trades at a standard 20x multiple, it should be $100."</li>
          <li><strong>DCF (Discounted Cash Flow):</strong> "The present value of all future cash flows is $100/share."</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Technical Analysis ("Where is it going?")</h3>
        <p>This method focuses on supply and demand dynamics, ignoring the business fundamentals.</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Resistance Levels:</strong> "Sellers always step in at $150. I will sell at $148."</li>
          <li><strong>Fibonacci Extensions:</strong> "The 1.618 extension of the last rally projects a target of $150."</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Required Return ("What do I need?")</h3>
        <p>This is the <strong>Goal-Based Approach</strong> used by this calculator. It works backward from your financial objectives.</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li>"I need to turn $10,000 into $15,000 to buy a car in 3 years."</li>
          <li>"I need a 12% annualized return to retire on time."</li>
        </ul>
        <hr />

        <h2 id="math-behind" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of Growth</h2>
        <p>Understanding the difference between <strong>Simple</strong> and <strong>Compound</strong> targets is critical for multi-year planning.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Simple Target (Swing Trading)</h3>
        <p>For short-term trades (days to weeks), compounding is irrelevant. You simply apply the percentage to the current price.</p>
        <div className="p-4 bg-muted rounded-lg my-4 font-mono text-sm">Target = Current Price × (1 + Return%)</div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Annualized Target (Long-Term Investing)</h3>
        <p>For investments held over years, you need exponential growth to maintain a constant annual rate of return (CAGR). The "Rule of 72" applies here. To double your money in 7 years, you need roughly 10% annual growth.</p>
        <div className="p-4 bg-muted rounded-lg my-4 font-mono text-sm">Target = Current Price × (1 + AnnualReturn%) ^ Years</div>
        <p><em>Example:</em> A stock at $100 growing at 15% for 5 years targets roughly $201. A simple 15% target would only be $115, massively underestimating the power of compounding.</p>
        <hr />

        <h2 id="institutional-vs-retail" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Institutional vs. Retail Approaches</h2>
        <p>How do the "Big Money" players set targets compared to individual investors?</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Institutions (Wall Street)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Consensus Targets:</strong> Analysts publish 12-month price targets based on detailed earnings models.</li>
          <li><strong>Scenario Analysis:</strong> They model "Bull Case" ($150), "Base Case" ($120), and "Bear Case" ($90).</li>
          <li><strong>Rebalancing:</strong> They sell not because they "want" to, but because a position has grown too large for their portfolio rules.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Retail Investors (You)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Often rely on arbitrary numbers ("I want to double my money").</li>
          <li>Prone to "moving the goalposts" (raising the target) when greed kicks in during a rally.</li>
          <li><strong>Advantage:</strong> You can be more flexible and hold for longer time horizons than valid institutions quarterly pressures allow.</li>
        </ul>
        <hr />

        <h2 id="risk-management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Target Prices as Risk Management</h2>
        <p>A target price is the "Reward" side of the equation. It must always be compared to the "Risk" (Stop Loss).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Risk/Reward Ratio</h3>
        <p>Professional traders demand a <strong>minimum 1:3 ratio</strong>. If you are risking $1.00 of loss (your stop loss is $1 below entry), you must be targeting at least $3.00 of profit. If the chart says the realistic target is only $1.50 away, <strong>you do not take the trade</strong>.</p>
        <p>The calculation of a target price is therefore a "filter" that stops you from taking bad trades.</p>
        <hr />

        <h2 id="psychology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Psychology of the Exit</h2>
        <p>The hardest thing in trading is not buying; it is selling.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Endowment Effect</h3>
        <p>Once we own a stock, we irrationally overvalue it. We start "rooting" for it. A pre-set target price acts as a contract with yourself to sell when the logic dictates, overruling your emotions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategies for Execution</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Scale Out:</strong> Sell 50% of your position at your calculated target. Let the other 50% ride with a "trailing stop." This guarantees a profit while keeping "upside optionality."</li>
          <li><strong>Front-Run Round Numbers:</strong> If your calculation says $100.50, set your target at $99.90. Humans and algorithms love round numbers; selling just before them ensures you get filled before the resistance wall.</li>
        </ul>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Expert answers on target price strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use a "Limit Order" or "Market Order" for my target?</h4>
            <p className="text-muted-foreground">
              Almost always use a <strong>Limit Order</strong> (Good-Till-Canceled). This instructs your broker to sell automatically when the price hits your specific target. This ensures you lock in the price you planned for, even if the market only touches it for a split second (a "wick").
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What if the stock hits my target but keeps going up?</h4>
            <p className="text-muted-foreground">
              This is the fear of missing out (FOMO). To combat this, use the "Scaling Out" method. Sell half your position at the target to lock in a "Free Ride" on the rest. You secure profit but stay in the game if the trend continues.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I raise my target prices?</h4>
            <p className="text-muted-foreground">
              Only raise signals if the <strong>fundamental thesis</strong> has improved (e.g., earnings grew faster than expected). Raising targets just because the price is going up is a trap called "moving the goalposts," which usually leads to holding a winner until it becomes a loser.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Does dividends yield count towards hitting my target?</h4>
            <p className="text-muted-foreground">
              Yes, for "Total Return" investors. If your goal is a 10% return ($10 gain on $100), and you receive $2 in dividends, you only need the price to rise $8 to hit your financial goal. Subtract expected dividends from your pure price target.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Why are analyst price targets often wrong?</h4>
            <p className="text-muted-foreground">
              Analyst targets are often lagging indicators; they tend to upgrade targets <em>after</em> the stock has already risen. They also have conflicts of interest (investment banking relationships). Treat consensus targets as a sentiment gauge, not a roadmap.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How do I adjust targets for inflation?</h4>
            <p className="text-muted-foreground">
              If you want a 7% <em>real</em> return (purchasing power) and inflation is 3%, you must target a 10% <em>nominal</em> return. Input 10% into the calculator to find the nominal price you need to see on the screen.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is "Valuation Compression"?</h4>
            <p className="text-muted-foreground">
              This is a risk where a company grows earnings, but the market decides to pay a lower multiple (P/E) for them (e.g., due to rising interest rates). Your target must account for this. A stock can grow earnings by 20% but stay flat if its P/E ratio drops by 20%.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Should my target be based on the "Ask" or "Bid" price?</h4>
            <p className="text-muted-foreground">
              You sell at the "Bid" price. For highly liquid stocks (e.g., Apple), the difference is negligible. For illiquid penny stocks, the spread can be huge. Always target the Bid to ensure you can actually exit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does volatility (Beta) affect targets?</h4>
            <p className="text-muted-foreground">
              High Beta (volatile) stocks need wider targets and stops. Setting a 5% target on a stock that moves 5% a day is just noise trading. Your target distance should effectively be a multiple of the stock's average daily range (ATR).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What is the "Rule of 20" in valuation?</h4>
            <p className="text-muted-foreground">
              A rough heuristic that suggests the P/E ratio plus the Inflation Rate should equal 20 for "Fair Value." If inflation is 5%, fair P/E is 15. This helps set realistic valuation-based price targets in different economic environments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can I use this for options trading?</h4>
            <p className="text-muted-foreground">
              Yes, but options require "Time" accuracy too. Predicting a stock will hit $150 is useless for a Call Option if it happens 3 days after expiration. For options, you must have high convection on <strong>velocity</strong> as well as direction.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What are "Fibonacci Extensions"?</h4>
            <p className="text-muted-foreground">
              A technical analysis method used to predict price targets during a breakout. Common extensions are 1.272 (127.2%) and 1.618 (161.8%) of the previous move. Traders often place sell orders at these mathematical levels.
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


