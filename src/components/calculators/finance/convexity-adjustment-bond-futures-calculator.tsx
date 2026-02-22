'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calculator, Info, TrendingUp, AlertCircle, CheckCircle2, History, Link as LinkIcon, BarChart3, LineChart, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  forwardPrice: z.number().min(0.01, "Forward Price must be positive"),
  yieldVolatility: z.number().min(0.01, "Volatility must be positive"),
  timeYears: z.number().min(0.01, "Time must be positive"),
  duration: z.number().min(0.01, "Duration must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConvexityAdjustmentBondFuturesCalculator() {
  const [result, setResult] = useState<{
    adjustment: number;
    futuresPrice: number;
    priceDifference: number;
    adjustmentPercent: number;
    impactLevel: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forwardPrice: undefined, // User must input
      yieldVolatility: undefined, // User must input
      timeYears: undefined, // User must input
      duration: undefined // User must input
    },
  });

  const calculate = (v: FormValues) => {
    // Formula Approximation for Bond Futures Convexity Adjustment
    // Futures Price ≈ Forward Price - (0.5 * σ² * T * D² * Forward Price)
    // Note: The sign of adjustment depends on correlation. For Bonds (negatively correlated with rates),
    // the Futures Price is typically LOWER than Forward Price because of the financing bias (Short pays MTM when rates rise/prices fall).
    // Wait, let's verify standard theory.
    // If rates rise => Bond Prices Fall. Short Profit => Reinvest at higher rate. Short wins.
    // If rates fall => Bond Prices Rise. Short Loss => Finance at lower rate. Short loses less.
    // Therefore, Futures Price < Forward Price. The adjustment is negative.

    // Inputs:
    // Sigma (σ) = Yield Volatility (decimal)
    // T = Time to Maturity
    // D = Modified Duration

    const sigma = v.yieldVolatility / 100;

    // Hull's Approx for Price Adjustment:
    // Adj ≈ 0.5 * sigma^2 * T * Duration^2 * Price
    const adjustment = 0.5 * Math.pow(sigma, 2) * v.timeYears * Math.pow(v.duration, 2) * v.forwardPrice;

    // Futures = Forward - Adjustment
    const futuresPrice = v.forwardPrice - adjustment;

    return {
      adjustment,
      futuresPrice
    };
  };

  const getImpactLevel = (adjPct: number) => {
    if (adjPct < 0.1) return 'Negligible';
    if (adjPct < 0.5) return 'Moderate';
    return 'Significant';
  };

  const getRecommendation = (adjPct: number) => {
    if (adjPct > 0.5) return "The convexity adjustment is large. Pricing the future simply as a forward contract will lead to significant overvaluation.";
    return "The adjustment is minor. Standard cost-of-carry models (Spot + Financing) are likely sufficient approximations.";
  };

  const getInsights = (adj: number, sigma: number, duration: number) => {
    const insights = [];
    if (sigma > 20) insights.push('High Volatility Regime: Volatility is the primary driver of this adjustment skew.');
    if (duration > 10) insights.push('Long Duration: Sensitivity to convexity is magnified by the long tenor of the bond.');
    insights.push('Financing Bias: Futures prices are lower than Forwards because MTM settlement harms the long position when correlated with rates.');
    return insights;
  };

  const getRiskFactors = (adjPct: number) => {
    const risks = [];
    risks.push('Model Risk: This calculation assumes constant volatility and simplified correlation.');
    if (adjPct > 1.0) risks.push('Basis Risk: The large gap between Futures and Spot/Forward creates hedging slippage.');
    risks.push('Cheapest-to-Deliver (CTD) Switch: Large rate moves may change which bond is delivered, altering the effective duration.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    const adjPct = (calc.adjustment / values.forwardPrice) * 100;

    setResult({
      adjustment: calc.adjustment,
      futuresPrice: calc.futuresPrice,
      priceDifference: calc.adjustment, // Absolute difference
      adjustmentPercent: adjPct,
      impactLevel: getImpactLevel(adjPct),
      recommendation: getRecommendation(adjPct),
      insights: getInsights(calc.adjustment, values.yieldVolatility, values.duration),
      riskFactors: getRiskFactors(adjPct)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Pricing Parameters
          </CardTitle>
          <CardDescription>
            Estimate the convexity bias between Forward and Futures prices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="forwardPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign /> Forward Price
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yieldVolatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Yield Volatilty (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="15.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <History className="h-4 w-4" /> Time to Maturity (Yrs)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Duration (Modified)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="8.0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Adjustment
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
                  <CardTitle>Convexity Analysis</CardTitle>
                  <CardDescription>Futures Pricing Adjustment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.futuresPrice.toFixed(4)}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="text-muted-foreground font-medium">Estimated Futures Price</span>
                </div>
                <p className="text-sm text-red-500 mt-2">-{result.adjustment.toFixed(4)} ({result.adjustmentPercent.toFixed(3)}%) vs Forward</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calculator className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Forward Price</p>
                  <p className="font-medium text-lg">{form.getValues('forwardPrice')?.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Adjustment</p>
                  <p className="font-medium text-lg">-{result.adjustment.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Impact</p>
                  <Badge variant={result.adjustmentPercent > 0.5 ? 'destructive' : 'secondary'}>
                    {result.impactLevel}
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
                <CardDescription>Valuation drivers</CardDescription>
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
                <CardDescription>Model limitations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((risk, index) => (
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
              Adjustment = 0.5 × σ² × T × Duration² × Price
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Futures Price ≈ Forward Price - Adjustment
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This Hull approximation estimates how much lower the futures price should be relative to the forward price due to the negative convexity bias in bond futures settlement.
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
            Tools for Fixed Income Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Bond Duration</p>
                      <p className="text-sm text-muted-foreground">Macaulay & Modified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/bond-convexity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Bond Convexity</p>
                      <p className="text-sm text-muted-foreground">Curvature Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/duration-gap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <History className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Duration Gap</p>
                      <p className="text-sm text-muted-foreground">ALM Strategy</p>
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
        <meta itemProp="name" content="The Definitive Guide to Convexity Adjustment (Bond Futures)" />
        <meta itemProp="description" content="Calculate the Convexity Adjustment for Bond Futures. Understand why Futures prices trade lower than Forward prices due to daily Mark-to-Market settlement." />
        <meta itemProp="keywords" content="Convexity Adjustment, Bond Futures, Forward Price vs Futures Price, Mark to Market, Yield Volatility, Hull Convexity Formula" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-20" />
        <meta itemProp="url" content="/definitive-guide-convexity-adjustment" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Convexity Adjustment</h1>
        <p className="text-lg italic text-muted-foreground">Why do Futures prices diverge from Forward prices? The answer lies in the subtle mechanics of daily settlement and volatility.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is Convexity Adjustment?</a></li>
          <li><a href="#forward-vs-futures" className="hover:underline">Forward vs. Futures: The Crucial Difference</a></li>
          <li><a href="#mechanics" className="hover:underline">The Mechanics of the Bias</a></li>
          <li><a href="#volatility" className="hover:underline">The Impact of Volatility</a></li>
          <li><a href="#implications" className="hover:underline">Implications for Hedging</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Convexity Adjustment?</h2>
        <p>The Convexity Adjustment is a correction factor applied to the Forward Price of an asset to derive its theoretical Futures Price. In the context of Bond Futures (prices) or Eurodollar Futures (rates), it accounts for the impact of daily Mark-to-Market (MTM) settlement.</p>
        <p>While Forwards and Futures are similar, they are not identical. A Forward contract is settled only at maturity. A Futures contract is settled daily. When interest rates are volatile, this difference creates a pricing gap.</p>
        <hr />

        {/* FORWARD VS FUTURES */}
        <h2 id="forward-vs-futures" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Forward vs. Futures: The Crucial Difference</h2>
        <p><strong>Forward Contract:</strong> No cash changes hands until the very end. You are not exposed to interest rate risk on your profit/loss <em>during</em> the life of the trade.</p>
        <p><strong>Futures Contract:</strong> You effectively &quot;realize&quot; your profit or loss every single day. If you make a profit, you can reinvest that cash. If you lose, you must finance that loss.</p>
        <p>Because interest rates (financing costs) are correlated with bond prices, this creates a bias.</p>
        <hr />

        {/* MECHANICS */}
        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mechanics of the Bias</h2>
        <p>For Bonds, prices fall when financing rates rise. This correlation is negative.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Scenario A (Rates Rise):</strong> Bond prices fall. The Short position makes a profit. The Short receives cash *immediately* and can reinvest it at the *new, higher* interest rate. This is excellent for the Short.</li>
          <li><strong>Scenario B (Rates Fall):</strong> Bond prices rise. The Short position loses money. The Short must pay cash, but borrows at the *new, lower* interest rate. This reduces the pain of the loss.</li>
        </ul>
        <p>Since the Short position wins &apos;double&apos; when they win (reinvesting at high rates) and loses &apos;less&apos; when they lose (borrowing at low rates), the Short position is more valuable. Paradoxically, in a competitive market, this advantage forces the Futures Price <strong>down</strong> relative to the Forward Price.</p>
        <hr />

        {/* VOLATILITY */}
        <h2 id="volatility" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Impact of Volatility</h2>
        <p>The adjustment is proportional to the <strong>square of volatility (σ²)</strong>. This means:</p>
        <div className="p-4 bg-muted rounded-lg my-4">
          <p className="font-semibold text-center">Doubling volatility quadruples the convexity adjustment.</p>
        </div>
        <p>In calm markets, the adjustment is tiny and often ignored. In volatile markets (like 2008 or 2022), the adjustment becomes massive, creating significant arbitrage opportunities for those who can price it correctly.</p>
        <hr />

        {/* IMPLICATIONS */}
        <h2 id="implications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Implications for Hedging</h2>
        <p>If you use Futures to hedge a Forward exposure (or vice versa) without accounting for convexity, you will be under-hedged. The &quot;tail risk&quot; (extreme convexity events) will leave you exposed exactly when the market moves the most.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers on Pricing Adjustments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is the futures price usually higher or lower?</h4>
              <p className="text-muted-foreground">
                For Bond Futures, it is typically lower than the Forward Price. For Interest Rate Futures (like Eurodollars, where the underlying is the Rate itself), the rate is typically higher (meaning the implied price/index is lower).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if correlation is zero?</h4>
              <p className="text-muted-foreground">
                If the asset price and interest rates are uncorrelated, the convexity adjustment is zero. Forward Price = Futures Price. This relies on the theorem by Cox, Ingersoll, and Ross (CIR).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this apply to commodities?</h4>
              <p className="text-muted-foreground">
                Generally not as much. Commodity prices (Gold, Oil) are not strongly correlated with short-term financing rates in the same mechanical way bonds are.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How accurate is the Hull approximation?</h4>
              <p className="text-muted-foreground">
                It is a Taylor Series expansion approximation. It works well for short maturities (less than 5 years). For very long-dated options or futures, more complex stochastic models (like BGM) are required.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Duration squared in the formula?</h4>
              <p className="text-muted-foreground">
                Because convexity is the second derivative of price with respect to yield. The formula is deriving the price impact of the volatility of yields, which relates to price via duration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can the adjustment be positive?</h4>
              <p className="text-muted-foreground">
                Yes, if the asset is positively correlated with interest rates. In that case, the Long position has the financing advantage, pushing the Futures Price above the Forward Price.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I estimate yield volatility?</h4>
              <p className="text-muted-foreground">
                You can use the implied volatility from Swaptions (volatility of swap rates) or calculate historical standard deviation of daily yield changes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;Cheapest to Deliver&quot; (CTD)?</h4>
              <p className="text-muted-foreground">
                Bond futures allow the seller to deliver any of several eligible bonds. They will choose the one that is cheapest to buy relative to the futures conversion factor. This option value also depresses the futures price.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is this related to &quot;Convexity&quot; of a bond?</h4>
              <p className="text-muted-foreground">
                Yes, they are cousins. Bond Convexity makes the bond price curve &quot;smile.&quot; Futures Convexity Adjustment accounts for how that smile interacts with daily cash settlement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why don't simple calculators include this?</h4>
              <p className="text-muted-foreground">
                Because it requires estimating volatility, which is not observable directly in price. It is an advanced pricing metric for derivatives traders.
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
          <p>The Convexity Adjustment Calculator quantifies the pricing gap between Forwards and Futures.</p>
          <p>It highlights the hidden value of daily liquidity and financing in volatile markets.</p>
          <p>Use this tool to avoid overpaying for futures contracts in high-volatility environments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
