'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Globe, Target, AlertCircle, CheckCircle2, TrendingUp, ArrowRightLeft, Percent, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  spotRate: z.number().min(0.0001, "Spot Rate must be positive"),
  forwardRate: z.number().min(0.0001, "Forward Rate must be positive"),
  timeDays: z.number().min(1).max(3650, "Time period must be in days (1-3650)"),
  quoteScale: z.number().min(1).max(1000000).default(10000),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyForwardPointsCalculator() {
  const [result, setResult] = useState<{
    points: number;
    premiumPercent: number;
    annualizedPercent: number;
    impliedDiff: number;
    status: string;
    pointsDirection: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotRate: undefined,
      forwardRate: undefined,
      timeDays: 30,
      quoteScale: 10000,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Forward Points
    // Formula: (Forward - Spot) * Scale
    const diff = v.forwardRate - v.spotRate;
    const points = diff * v.quoteScale;

    // 2. Percentage Premium / Discount (Absolute)
    const premiumPercent = (diff / v.spotRate) * 100;

    // 3. Annualized % (linear approximation for short term)
    // Annualized = (Premium% / Days) * 360
    const annualizedPercent = (premiumPercent / v.timeDays) * 360;

    // 4. Implied Interest Rate Differential (Approx)
    // Since F = S * (1 + r_diff * t)  => F/S - 1 = r_diff * t => r_diff = (F/S - 1) / t
    const t = v.timeDays / 360; // Using 360 day year convention common in FX
    const impliedDiff = ((v.forwardRate / v.spotRate) - 1) / t * 100;

    return {
      points,
      premiumPercent,
      annualizedPercent,
      impliedDiff
    };
  };

  const getStatus = (points: number) => {
    if (Math.abs(points) < 0.1) return 'Flat / Parity';
    if (points > 0) return 'Forward Premium';
    return 'Forward Discount';
  };

  const getRecommendation = (points: number, diffPct: number) => {
    if (points > 0) return 'The currency trades at a premium. Long positions earn positive carry if borrowing the quote currency, but cost carry if borrowing base.';
    if (points < 0) return 'The currency trades at a discount. Short positions cost carry (paying the points), while long positions might benefit from the discount if spot remains stable.';
    return 'Spot and Forward rates are identical. Interest rate differential is negligible.';
  };

  const getInsights = (points: number, annualized: number) => {
    const insights = [];
    if (Math.abs(annualized) > 5) insights.push('High Yield Volatility: The implied interest rate differential is significant (>5%).');
    else insights.push('Stable Yields: Interest rate differential is moderate.');

    if (points > 0) {
      insights.push('Base Currency Strength: Market expects base currency to depreciate to offset its higher interest rate (IRP theory).');
      insights.push('Hedging Cost: Exporters selling the base currency forward will get a "bonus" (premium).');
    } else {
      insights.push('Base Currency Weakness: Market expects base currency to appreciate to offset lower interest rate.');
      insights.push('Hedging Cost: Importers buying the base currency forward will get a "discount".');
    }
    return insights;
  };

  const getRisks = (timeDays: number) => {
    const risks = [];
    if (timeDays > 365) risks.push('Liquidity Risk: Long-dated forwards (>1 year) often have wider spreads.');
    risks.push('Basis Risk: Actual bank quotes may differ from theoretical points due to credit charges (CVA).');
    risks.push('Mark-to-Market: Forward points fluctuate daily with interest rate expectations, affecting hedge value.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      points: calc.points,
      premiumPercent: calc.premiumPercent,
      annualizedPercent: calc.annualizedPercent,
      impliedDiff: calc.impliedDiff,
      status: getStatus(calc.points),
      pointsDirection: calc.points > 0 ? 'Premium (+)' : calc.points < 0 ? 'Discount (-)' : 'Flat',
      recommendation: getRecommendation(calc.points, calc.impliedDiff),
      insights: getInsights(calc.points, calc.annualizedPercent),
      risks: getRisks(values.timeDays)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Rates & Parameters
          </CardTitle>
          <CardDescription>
            Input Spot and Forward rates to calculate pips, points, and annualized premiums.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="spotRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Spot Rate
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="1.1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="forwardRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Forward Rate
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="1.1050" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duration (Days)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="30" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quoteScale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Pip Scale
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="10000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Forward Points
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
                <ArrowRightLeft className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Forward Analysis</CardTitle>
                  <CardDescription>Points & Premiums</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.points.toFixed(2)} Points</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={result.points >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {result.status}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2">Annualized Rate: {result.annualizedPercent.toFixed(2)}%</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Globe className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Spread %</p>
                  <p className="font-medium text-lg">{result.premiumPercent.toFixed(4)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Percent className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Implied Rate Diff</p>
                  <p className="font-medium text-lg">{result.impliedDiff.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Direction</p>
                  <Badge variant={result.points > 0 ? 'default' : 'secondary'}>
                    {result.pointsDirection}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assessment:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Trading implications</CardDescription>
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
                  Risk Factors
                </CardTitle>
                <CardDescription>What to watch out for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Forward Points = (Forward Rate - Spot Rate) × Scale
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Annualized % = [ (Forward - Spot) / Spot ] × (360 / Days) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The &quot;Scale&quot; factor (usually 10,000 for most pairs, 100 for JPY pairs) converts the decimal difference into readable &quot;pips&quot; or &quot;points&quot;.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Spot Rate</h4>
              <p className="text-sm text-muted-foreground">The current market price for immediate exchange (approx. T+2).</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Forward Rate</h4>
              <p className="text-sm text-muted-foreground">The market price agreed upon today for an exchange at a future date.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Duration (Days)</h4>
              <p className="text-sm text-muted-foreground">The time difference between Spot date and Forward settlement date.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Pip Scale</h4>
              <p className="text-sm text-muted-foreground">Standard multiplier. Use 10,000 for pairs like EUR/USD (4 decimals) or 100 for USD/JPY (2 decimals).</p>
            </div>
          </div>
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
            Tools for Forex and derivatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/interest-rate-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">IRP Calculator</p>
                      <p className="text-sm text-muted-foreground">Theory vs Reality</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/currency-exchange-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">FX Converter</p>
                      <p className="text-sm text-muted-foreground">Live Rates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/covered-interest-arbitrage-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Arbitrage</p>
                      <p className="text-sm text-muted-foreground">Risk-free Profits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Currency Forward Points" />
        <meta itemProp="description" content="Master Currency Forward Points. Learn how to calculate premiums, discounts, and implied interest rates from FX forward curves." />
        <meta itemProp="keywords" content="Currency Forward Points, Forex Pips, FX Swap Points, Forward Premium, Forward Discount, Interest Rate Differential, Forex Hedging" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-30" />
        <meta itemProp="url" content="/definitive-guide-forward-points" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Currency Forward Points</h1>
        <p className="text-lg italic text-muted-foreground">In the world of professional Forex trading, prices are rarely quoted in full. They are quoted in &quot;points&quot;—the heartbeat of the interest rate market.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-are-points" className="hover:underline">What are Currency Forward Points?</a></li>
          <li><a href="#premium-discount" className="hover:underline">Premium vs. Discount Explained</a></li>
          <li><a href="#calculation" className="hover:underline">How to Calculate Points Manually</a></li>
          <li><a href="#interest-rates" className="hover:underline">The Link to Interest Rates</a></li>
          <li><a href="#real-world" className="hover:underline">Real-World Examples</a></li>
        </ul>
        <hr />

        {/* WHAT ARE POINTS */}
        <h2 id="what-are-points" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What are Currency Forward Points?</h2>
        <p>Currency Forward Points (often called &quot;fwd points&quot; or &quot;swap points&quot;) are the number of pips added to or subtracted from the Spot Rate to calculate the Forward Rate for a specific date.</p>
        <p>They are not a prediction of where the currency is going. Instead, they are a mathematical application of the **Interest Rate Parity** theory, representing the cost of carry between two currencies.</p>
        <hr />

        {/* PREMIUM VS DISCOUNT */}
        <h2 id="premium-discount" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Premium vs. Discount Explained</h2>
        <p>When looking at forward points, the sign (+ or -) tells you about the interest rate relationship:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">Forward Premium (+)</h3>
            <p><strong>Points are Positive.</strong></p>
            <p>This means the Forward Rate is HIGHER than the Spot Rate.</p>
            <p><strong>Cause:</strong> The Base Currency has a LOWER interest rate than the Quote Currency.</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/10">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Forward Discount (-)</h3>
            <p><strong>Points are Negative.</strong></p>
            <p>This means the Forward Rate is LOWER than the Spot Rate.</p>
            <p><strong>Cause:</strong> The Base Currency has a HIGHER interest rate than the Quote Currency.</p>
          </div>
        </div>
        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Points Manually</h2>
        <p>The standard formula is simple:</p>
        <div className="p-4 bg-muted rounded-lg my-4 text-center">
          <p className="font-mono font-bold">Forward Points = (Forward Rate - Spot Rate) × Scale</p>
        </div>
        <p>If EUR/USD Spot is 1.1000 and the 1-Year Forward is 1.1200:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Difference = 0.0200</li>
          <li>Scale (Pips) = 10,000</li>
          <li>Points = <strong>+200 Points</strong></li>
        </ul>
        <hr />

        {/* RATES */}
        <h2 id="interest-rates" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Link to Interest Rates</h2>
        <p>Why do points exist? Because money has a time value. If you hold a high-interest currency, you earn daily interest. If you hold a low-interest currency, you earn less.</p>
        <p>To prevent free money (arbitrage), the FX market adjusts the future exchange rate. If you hold the high-rate currency, the market forces you to sell it at a &quot;worse&quot; rate in the future (a discount) to offset exactly the extra interest you earned.</p>
        <hr />

        {/* REAL WORLD */}
        <h2 id="real-world" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real-World Examples</h2>
        <p><strong>USD/JPY:</strong> Typically trades at a discount (negative points) when US rates are higher than Japanese rates. Traders selling USD forward get fewer Yen than spot.</p>
        <p><strong>EUR/USD:</strong> If Euro rates (ECB) are lower than Fed rates, EUR/USD trades at a premium (positive points). Traders selling EUR forward get more Dollars than spot.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers on Forward Points and Pips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is one &quot;Point&quot; worth?</h4>
              <p className="text-muted-foreground">
                In most pairs (like EUR/USD), one point equals one pip (0.0001). In JPY pairs (like USD/JPY), one point equals 0.01. The scale factor adjusts this decimal placement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do positive points mean the currency will go up?</h4>
              <p className="text-muted-foreground">
                No. Positive points (Premium) only mean the base currency has a lower interest rate. It is not a bullish signal for the spot price. In fact, academically, it suggests the currency <em>should</em> fall to that level, though reality often differs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How are points quoted in the market?</h4>
              <p className="text-muted-foreground">
                Dealers quote points as bid/ask, e.g., &quot;20 / 22&quot;. If Spot is 1.1000, the Forward Bid is 1.1020 and Forward Ask is 1.1022. You always add points to spot (if positive) or subtract (if negative).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can forward points be negative?</h4>
              <p className="text-muted-foreground">
                Yes. If the Forward Rate is lower than the Spot Rate, points are negative. Traders often write this as a &quot;Forward Discount.&quot;
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Scale&quot; input?</h4>
              <p className="text-muted-foreground">
                It determines how many decimals correspond to a whole number. Standard Forex standard is 10,000 for 4-decimal pairs and 100 for 2-decimal pairs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do points change?</h4>
              <p className="text-muted-foreground">
                Points change primarily because interest rate expectations change. If the Central Bank signals a rate hike, the points curve shifts immediately.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a &quot;Swap Point&quot;?</h4>
              <p className="text-muted-foreground">
                It is synonymous with Forward Point. It refers to the points paid or earned in an FX Swap (Spot vs Forward) used to roll over positions overnight.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use this for commodities?</h4>
              <p className="text-muted-foreground">
                Yes, calculating &quot;Contango&quot; or &quot;Backwardation&quot; in commodity futures uses similar logic, comparing Spot to Future prices, though storage costs matter more than interest rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do banks charge a markup on points?</h4>
              <p className="text-muted-foreground">
                Yes. The &quot;Spread&quot; on the forward points is often wider than the spot spread. This is a hidden cost of hedging for corporate clients.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does time affect points?</h4>
              <p className="text-muted-foreground">
                Points scale roughly linearly with time. A 6-month forward will have roughly double the points of a 3-month forward, assuming the yield curve is flat.
              </p>
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
          <p>The Currency Forward Points Calculator reveals the interest rate differential between two currencies.</p>
          <p>It translates abstract decimal differences into actionable "pips" and premiums.</p>
          <p>Use this tool to price hedges, evaluate swap costs, and understand the cost of carry in your Forex portfolio.</p>
        </CardContent>
      </Card>
    </div>
  );
}
