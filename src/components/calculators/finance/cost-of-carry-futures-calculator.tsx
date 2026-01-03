'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, Shield, Percent, FunctionSquare, CheckCircle2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  spotPrice: z.number().positive('Spot price must be positive'),
  riskFreeRate: z.number().min(-100).max(100, 'Rate must be between -100% and 100%'),
  storageCost: z.number().min(0).default(0),
  convenienceYield: z.number().min(0).default(0),
  dividendYield: z.number().min(0).default(0),
  timeToMaturity: z.number().positive('Time must be positive'),
  actualFuturesPrice: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfCarryFuturesCalculator() {
  const [result, setResult] = useState<{
    costOfCarryRate: number;
    totalCarryCost: number;
    theoreticalFuturesPrice: number;
    arbitrageGap: number | null;
    impliedDirection: string;
    marketCondition: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotPrice: undefined,
      riskFreeRate: undefined, // User must input
      storageCost: 0,
      convenienceYield: 0,
      dividendYield: 0,
      timeToMaturity: undefined,
      actualFuturesPrice: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Allowances
    // Rates are percentages, so divide by 100
    const r = v.riskFreeRate / 100;
    const u = v.storageCost / 100;
    const y = v.convenienceYield / 100;
    const d = v.dividendYield / 100;

    // Cost of Carry (c) = r + u - y - d
    const c = r + u - y - d;

    // 2. Theoretical Future Price F* = S * e^(c*t)
    const theoreticalPrice = v.spotPrice * Math.exp(c * v.timeToMaturity);

    // 3. Absolute Cost of Carry Value ($)
    const totalCarryCost = theoreticalPrice - v.spotPrice;

    // 4. Arbitrage Calculation (if actual price provided)
    let arbitrageGap = null;
    let impliedStrategy = 'Hold';
    if (v.actualFuturesPrice) {
      arbitrageGap = v.actualFuturesPrice - theoreticalPrice;

      if (arbitrageGap > 0) {
        impliedStrategy = 'Cash-and-Carry Arbitrage'; // Actual > Theoretical (Sell High Future, Buy Low Spot)
      } else if (arbitrageGap < 0) {
        impliedStrategy = 'Reverse Cash-and-Carry'; // Actual < Theoretical (Buy Low Future, Sell High Spot)
      }
    }

    // 5. Market Condition
    let condition = 'Neutral';
    if (c > 0) condition = 'Contango';
    else if (c < 0) condition = 'Backwardation';

    return {
      costOfCarryRate: c * 100,
      totalCarryCost,
      theoreticalFuturesPrice: theoreticalPrice,
      arbitrageGap,
      impliedDirection: impliedStrategy,
      marketCondition: condition,
    };
  };

  const getInterpretation = (condition: string, cRate: number) => {
    if (condition === 'Contango') {
      return `The cost of carry is positive (${cRate.toFixed(2)}%), causing the theoretical futures price to trade at a premium to spot. This is normal for markets with storage costs exceeding benefits.`;
    } else if (condition === 'Backwardation') {
      return `The cost of carry is negative (${cRate.toFixed(2)}%), causing the theoretical futures price to trade at a discount. Convenience yields or dividends serve as a benefit greater than financing costs.`;
    }
    return `The cost of carry is effectively zero, implying spot and futures prices should be nearly identical.`;
  };

  const getRecommendation = (gap: number | null, strategy: string) => {
    if (gap !== null && Math.abs(gap) > 0) {
      if (strategy === 'Cash-and-Carry Arbitrage') {
        return 'Opportunity effectively to Short the Futures (Overvalued) and Long the Spot asset. Capitalize on the convergence.';
      } else if (strategy === 'Reverse Cash-and-Carry') {
        return 'Opportunity effectively to Long the Futures (Undervalued) and Short the Spot asset. Capitalize on the discount.';
      }
    }
    return 'Monitor the carrying costs. Without significant mispricing, focus on fundamental directional trading rather than arbitrage.';
  };

  const getInsights = (condition: string, theoretical: number, spot: number) => {
    const insights = [];
    if (condition === 'Contango') {
      insights.push('Long futures positions suffer from negative "roll yield".');
      insights.push('Holders of physical assets are compensated for storage.');
    } else {
      insights.push('Long futures positions benefit from positive "roll yield".');
      insights.push('Physical holders are implicitly paying an opportunity cost.');
    }

    insights.push(`Theoretical Forward Price: $${theoretical.toFixed(2)}`);
    insights.push(`Implied Carry Cost: $${(theoretical - spot).toFixed(2)} total`);

    return insights;
  };

  const getRisks = (gap: number | null) => {
    const risks = [];
    risks.push('Interest rate volatility affects fair value calculations.');
    risks.push('Estimating "Convenience Yield" is subjective and prone to error.');
    if (gap !== null && Math.abs(gap) > 0) {
      risks.push('Execution risk: Slippage may erode arbitrage profits.');
      risks.push('Funding constraints (margin calls) during the trade lifecycle.');
    }
    risks.push('Storage costs may fluctuate (e.g., tanker rates for oil).');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: getInterpretation(calc.marketCondition, calc.costOfCarryRate),
      recommendation: getRecommendation(calc.arbitrageGap, calc.impliedDirection),
      insights: getInsights(calc.marketCondition, calc.theoreticalFuturesPrice, values.spotPrice),
      risks: getRisks(calc.arbitrageGap)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Pricing Parameters
          </CardTitle>
          <CardDescription>
            Input spot prices, rates, and yields to determine the fair futures value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="spotPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Spot Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1500.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeToMaturity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Time to Expiry (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.5 (6 months)"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5.0"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storageCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Storage Cost (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2.0 (Optional)"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="convenienceYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Convenience Yield (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.5 (Optional)"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dividendYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dividend Yield (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1.5 (Optional)"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualFuturesPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-primary">
                        <Target className="h-4 w-4" />
                        Actual Futures Price (To Check Arbitrage)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional: Compare Market Price"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Theoretical Price
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Fair Value Assessment</CardTitle>
                  <CardDescription>Theoretical Pricing & Cost Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Theoretical Futures Price</p>
                <p className="text-4xl font-bold text-primary">${result.theoreticalFuturesPrice.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Net Cost of Carry</p>
                  <p className="text-lg font-bold">{result.costOfCarryRate.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Annualized Rate</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Market Condition</p>
                  <Badge variant={result.marketCondition === 'Contango' ? 'default' : result.marketCondition === 'Backwardation' ? 'secondary' : 'outline'}>
                    {result.marketCondition}
                  </Badge>
                </div>
                {result.arbitrageGap !== null ? (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold">Arbitrage Gap</p>
                    <p className={`text-lg font-bold ${result.arbitrageGap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.arbitrageGap > 0 ? '+' : ''}{result.arbitrageGap.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg opacity-50">
                    <Target className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-semibold">Arbitrage</p>
                    <p className="text-sm">Enter Actual Price to View</p>
                  </div>
                )}
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Carry Insights
                </CardTitle>
                <CardDescription>Impact of holding costs on price</CardDescription>
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
                  Model Risks
                </CardTitle>
                <CardDescription>Potential pricing discrepancies</CardDescription>
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
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              F = S × e^((r + u - y - d) × t)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Where <strong>F</strong> is the Theoretical Futures Price, <strong>S</strong> is the Spot Price, <strong>r</strong> is the risk-free rate, <strong>u</strong> is storage cost, <strong>y</strong> is convenience yield, <strong>d</strong> is dividend yield, and <strong>t</strong> is time to maturity in years.
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
            Tools for derivatives and interest rate analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/futures-basis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Futures Basis</p>
                      <p className="text-sm text-muted-foreground">Basis analysis tool</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-rate-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Interest Rate Parity</p>
                      <p className="text-sm text-muted-foreground">FX Forward Pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/present-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Present Value</p>
                      <p className="text-sm text-muted-foreground">Time value of money</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="headline" content="Mastering Cost of Carry: Calculating Theoretical Futures Prices" />
        <meta itemProp="description" content="A comprehensive guide to the Cost of Carry model for futures pricing. Learn how to calculate theoretical prices using interest rates, storage costs, and convenience yields." />
        <meta itemProp="keywords" content="cost of carry formula, theoretical futures price, cash-and-carry arbitrage, convenience yield, futures pricing model, contango explanation" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-07-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Cost of Carry: The Mathematical Foundation of Futures Pricing</h1>
        <p className="text-lg italic text-muted-foreground">The Cost of Carry model is the cornerstone of fair value analysis in derivatives markets, explaining the price gap between today's spot market and tomorrow's futures contract.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Cost of Carry?</a></li>
          <li><a href="#components" className="hover:underline">The 4 Key Components</a></li>
          <li><a href="#formula" className="hover:underline">The Cost of Carry Formula</a></li>
          <li><a href="#arbitrage" className="hover:underline">Arbitrage: Cash-and-Carry</a></li>
          <li><a href="#implications" className="hover:underline">Implications for Market Structure</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Cost of Carry?</h2>
        <p>
          The <strong>Cost of Carry</strong> refers to the total costs involved in holding a physical asset or financial instrument over a specific period. In futures markets, the price of a futures contract is essentially the <strong>Spot Price + Cost of Carry</strong>.
        </p>
        <p className="mt-2">
          If the futures price deviates significantly from this theoretical value, arbitrageurs step in to restore equilibrium.
        </p>

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8">The 4 Key Components</h2>
        <p>Depending on the asset class (Commodities, Equities, Currencies), the cost of carry consists of different variables:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Financing Cost (Interest Rate)</h3>
        <p>Buying an asset requires capital. The interest paid on borrowed money (or lost interest on own capital) is the financing cost. This is relevant for <strong>ALL</strong> assets.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Storage & Insurance Costs</h3>
        <p>Relevant for <strong>Commodities</strong> (Oil, Wheat, Gold). It costs money to store and insure physical goods. High storage costs increase the futures price (Steeper Contango).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Income / Dividend Yield</h3>
        <p>Relevant for <strong>Equities and Bonds</strong>. Holding the asset pays dividends or coupons. This income reduces the net cost of carry.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Convenience Yield</h3>
        <p>Relevant for <strong>Physical Commodities</strong>. The intangible benefit of holding the physical inventory (e.g., to keep a refinery running during a shortage). It acts like a "negative cost" or a "dividend" for commodities.</p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Cost of Carry Formula</h2>
        <p>Using continuous compounding (standard for professional derivatives pricing):</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">F = S × e<sup>(r + u - y - d)t</sup></p>
        </div>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>r</strong> = Risk-free interest rate</li>
          <li><strong>u</strong> = Storage cost (percentage)</li>
          <li><strong>y</strong> = Convenience yield (percentage)</li>
          <li><strong>d</strong> = Dividend yield (percentage)</li>
          <li><strong>t</strong> = Time to maturity (years)</li>
        </ul>

        <h2 id="arbitrage" className="text-2xl font-bold text-foreground pt-8">Arbitrage: Cash-and-Carry</h2>
        <p>
          The model empowers traders to identify risk-free profit opportunities known as <strong>Cash-and-Carry Arbitrage</strong>.
        </p>
        <div className="mt-4 p-4 border-l-4 border-primary bg-primary/5">
          <h4 className="font-bold">Scenario: Futures Price &gt; Theoretical Price</h4>
          <p>The Future is "overvalued."</p>
          <ol className="list-decimal ml-6 mt-2">
            <li>Borrow money at rate <strong>r</strong>.</li>
            <li>Buy the Spot asset at <strong>S</strong>.</li>
            <li>Sell the Futures contract at <strong>F</strong>.</li>
            <li>Store the asset until expiry.</li>
            <li>Deliver asset against the Futures contract.</li>
          </ol>
          <p className="mt-2 text-sm italic">The profit is the difference between the Actual F and Theoretical F*.</p>
        </div>

        <h2 id="implications" className="text-2xl font-bold text-foreground pt-8">Implications for Market Structure</h2>
        <p>The sign of the net Cost of Carry determines the market structure:</p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Positive Carry (r + u &gt; y + d):</strong> The theoretical futures price is higher than spot. Market is in <strong>Contango</strong>.</li>
          <li><strong>Negative Carry (r + u &lt; y + d):</strong> The theoretical futures price is lower than spot. Market is in <strong>Backwardation</strong>.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about the Cost of Carry model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are gold futures always in Contango?</h4>
              <p className="text-muted-foreground">
                Gold has significant storage costs and insurance costs, but it has zero industrial "convenience yield" (it mostly sits in vaults) and pays no dividends. Thus, `r + u` is always positive, making Futures &gt; Spot (Contango).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does the convenience yield affect the price?</h4>
              <p className="text-muted-foreground">
                Convenience yield lowers the theoretical futures price. If the convenience yield helps offset storage and interest costs, the market flips into Backwardation (Futures &lt; Spot). This happens during supply shortages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What risk-free rate should I use?</h4>
              <p className="text-muted-foreground">
                Professionals typically use the rate on government treasury bills or SOFR (Secured Overnight Financing Rate) that matches the duration of the futures contract.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can storage costs be negative?</h4>
              <p className="text-muted-foreground">
                No, storage costs are real expenses. However, for financial assets like Bitcoin or digital tokens, storage costs might be negligible, meaning the cost of carry is driven almost entirely by interest rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if I ignore dividends?</h4>
              <p className="text-muted-foreground">
                For Equity Index Futures (like S&P 500), ignoring dividends will make your theoretical price way too high. Dividends effectively reduce the cost of holding the stock, pushing the futures price down relative to spot.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this model apply to Cryptocurrencies?</h4>
              <p className="text-muted-foreground">
                Yes. For Bitcoin futures, the cost of carry is dominated by the USD interest rate (financing cost) since storage is cheap. This is why Bitcoin futures usually trade at a premium (Contango) in bull markets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the outcome different from the market price?</h4>
              <p className="text-muted-foreground">
                The "Theoretical Pice" assumes perfect markets. Real markets have transaction costs, borrowing constraints, and differing expectations of convenience yield. The difference is the "Arbitrage Gap" or "Basis Risk."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is Reverse Cash-and-Carry easy to execute?</h4>
              <p className="text-muted-foreground">
                It's harder than Cash-and-Carry because it requires <strong>short-selling</strong> the spot asset. Many commodities (like Oil or Wheat) are very difficult or impossible to short-sell in the spot market.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does time to maturity affect the calculation?</h4>
              <p className="text-muted-foreground">
                The longer the time to maturity (`t`), the larger the effect of the cost of carry. This is why the spread between spot and futures is widest for distant contracts and converges to zero as time expires.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Full Carry"?</h4>
              <p className="text-muted-foreground">
                "Full Carry" is a situation in grain markets where the price difference between delivery months covers the full cost of storage and interest. If the spread is less than full carry, it discourages storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Cost of Carry Futures Calculator computes the theoretical fair value of a futures contract.</p>
          <p>It accounts for financing rates, storage costs, convenience yields, and dividends.</p>
          <p>Use this tool to identify arbitrage opportunities and understand the drivers of Contango and Backwardation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
