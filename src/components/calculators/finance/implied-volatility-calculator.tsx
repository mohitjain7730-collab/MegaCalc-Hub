
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import Link from 'next/link';

const formSchema = z.object({
  spot: z.number().positive(),
  strike: z.number().positive(),
  rate: z.number().min(-50).max(100),
  timeYears: z.number().min(0.001).max(50),
  optionType: z.enum(['call', 'put']),
  optionPrice: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

// Mathematical helper functions
function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function bsPrice(S: number, K: number, rPct: number, sigma: number, T: number, type: 'call' | 'put'): number {
  const r = rPct / 100;
  if (sigma <= 0 || T === 0) {
    if (type === 'call') return Math.max(S - K * Math.exp(-r * T), 0);
    return Math.max(K * Math.exp(-r * T) - S, 0);
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  if (type === 'call') {
    return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
  }
  return K * Math.exp(-r * T) * normCdf(-d2) - S * normCdf(-d1);
}

function impliedVolatility(S: number, K: number, rPct: number, T: number, type: 'call' | 'put', price: number): number {
  // Bisection method to find IV
  let lo = 0.0001;
  let hi = 5.0; // 500% volatility upper bound

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const modelPrice = bsPrice(S, K, rPct, mid, T, type);

    if (Math.abs(modelPrice - price) < 0.0001) {
      return mid * 100; // Convert to percentage
    }

    if (modelPrice > price) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return ((lo + hi) / 2) * 100; // Return as percentage
}

export default function ImpliedVolatilityCalculator() {
  const [result, setResult] = useState<{
    impliedVolPct: number;
    modelPrice: number;
    calibrationError: number;
    ivLevel: string;
    optionExpensiveness: string;
    recommendation: string;
    moneyness: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spot: undefined,
      strike: undefined,
      rate: undefined,
      timeYears: undefined,
      optionType: undefined,
      optionPrice: undefined,
    },
  });

  const getIVLevel = (iv: number) => {
    if (iv >= 80) return 'Extremely High';
    if (iv >= 50) return 'Very High';
    if (iv >= 30) return 'High';
    if (iv >= 20) return 'Moderate';
    if (iv >= 10) return 'Low';
    return 'Very Low';
  };

  const getOptionExpensiveness = (iv: number) => {
    if (iv >= 80) return 'Extremely Expensive';
    if (iv >= 50) return 'Very Expensive';
    if (iv >= 30) return 'Expensive';
    if (iv >= 20) return 'Fair Value';
    if (iv >= 10) return 'Cheap';
    return 'Very Cheap';
  };

  const getMoneyness = (spot: number, strike: number, type: 'call' | 'put') => {
    const ratio = spot / strike;
    if (type === 'call') {
      if (ratio > 1.05) return 'Deep ITM';
      if (ratio > 1.01) return 'ITM';
      if (ratio >= 0.99) return 'ATM';
      if (ratio >= 0.95) return 'OTM';
      return 'Deep OTM';
    } else {
      if (ratio < 0.95) return 'Deep ITM';
      if (ratio < 0.99) return 'ITM';
      if (ratio <= 1.01) return 'ATM';
      if (ratio <= 1.05) return 'OTM';
      return 'Deep OTM';
    }
  };

  const getRecommendation = (iv: number, moneyness: string) => {
    if (iv >= 80) {
      return 'Extremely elevated IV suggests significant expected movement or event risk. Consider selling premium via spreads to capture IV crush, but size positions carefully.';
    }
    if (iv >= 50) {
      return 'Very high IV indicates expensive options. Selling strategies (covered calls, credit spreads) may be attractive. Compare to historical IV percentile before trading.';
    }
    if (iv >= 30) {
      return 'Elevated IV suggests moderately expensive premiums. Balanced strategies like iron condors may work well. Monitor for IV contraction opportunities.';
    }
    if (iv >= 20) {
      return 'Fair IV levels. Both buying and selling strategies are reasonable depending on directional view. Consider historical IV range.';
    }
    if (iv >= 10) {
      return 'Low IV suggests cheap options. Long option strategies (calls, puts, straddles) may offer favorable risk/reward if you expect volatility expansion.';
    }
    return 'Very low IV indicates extremely cheap premiums. Strong opportunity for long volatility strategies if you anticipate market movement.';
  };

  const getInsights = (iv: number, moneyness: string, timeYears: number) => {
    const insights = [];

    insights.push(`Implied Volatility of ${iv.toFixed(1)}% represents the market's expected annualized move`);

    if (iv >= 50) {
      insights.push('High IV often precedes earnings, FDA decisions, or major economic events');
    } else if (iv <= 20) {
      insights.push('Low IV environment; options relatively cheap vs historical norms');
    }

    if (timeYears < 0.1) {
      insights.push('Near-term expiry: IV impact diminishes as theta decay accelerates');
    } else if (timeYears > 0.5) {
      insights.push('Longer-dated option: Vega exposure significant; IV changes materially impact price');
    }

    return insights;
  };

  const getConsiderations = () => {
    const considerations = [];
    considerations.push('IV derived using Black-Scholes assumes constant volatility (unrealistic)');
    considerations.push('Model ignores dividends—adjust for dividend-paying stocks');
    considerations.push('Deep ITM/OTM options may yield unstable IV estimates');
    considerations.push('Wide bid-ask spreads distort IV calculations');
    considerations.push('Compare IV to historical volatility (HV) and IV percentile for context');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const iv = impliedVolatility(
      values.spot!,
      values.strike!,
      values.rate!,
      values.timeYears!,
      values.optionType!,
      values.optionPrice!
    );

    const modelPrice = bsPrice(
      values.spot!,
      values.strike!,
      values.rate!,
      iv / 100,
      values.timeYears!,
      values.optionType!
    );

    const moneyness = getMoneyness(values.spot!, values.strike!, values.optionType!);

    setResult({
      impliedVolPct: iv,
      modelPrice: modelPrice,
      calibrationError: Math.abs(modelPrice - values.optionPrice!),
      ivLevel: getIVLevel(iv),
      optionExpensiveness: getOptionExpensiveness(iv),
      recommendation: getRecommendation(iv, moneyness),
      moneyness: moneyness,
      insights: getInsights(iv, moneyness, values.timeYears!),
      considerations: getConsiderations()
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Option Parameters
          </CardTitle>
          <CardDescription>
            Enter option details and market price to extract Implied Volatility (IV)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="spot"
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
                          placeholder="e.g., 100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strike"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strike Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 105"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
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
                        <BarChart3 className="h-4 w-4" />
                        Time to Expiry (years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 0.5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Option Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value || undefined)}
                        >
                          <option value="">Select type...</option>
                          <option value="call">Call Option</option>
                          <option value="put">Put Option</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Option Market Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 4.50"
                          {...field}
                          value={field.value ?? ''}
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
                Calculate Implied Volatility
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
                  <CardTitle>Implied Volatility Analysis</CardTitle>
                  <CardDescription>Market-Implied Expected Volatility</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary IV Display */}
              <div className="text-center p-6 bg-muted/30 rounded-lg border-2 border-primary/20">
                <p className="text-sm text-muted-foreground font-medium mb-2">Implied Volatility</p>
                <p className="text-5xl font-bold text-primary">{result.impliedVolPct.toFixed(2)}%</p>
                <p className="text-sm text-muted-foreground mt-2">Annualized expected volatility derived from option price</p>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">IV Level</p>
                  <Badge variant={result.ivLevel.includes('Extremely') || result.ivLevel.includes('Very High') ? 'destructive' : result.ivLevel === 'High' ? 'destructive' : result.ivLevel === 'Moderate' ? 'outline' : 'secondary'}>
                    {result.ivLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Option Pricing</p>
                  <Badge variant={result.optionExpensiveness.includes('Expensive') ? 'destructive' : result.optionExpensiveness === 'Fair Value' ? 'outline' : 'secondary'}>
                    {result.optionExpensiveness}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Moneyness</p>
                  <Badge variant={result.moneyness.includes('ITM') ? 'default' : result.moneyness === 'ATM' ? 'outline' : 'secondary'}>
                    {result.moneyness}
                  </Badge>
                </div>
              </div>

              {/* Model Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-1">Model Price Check</p>
                  <p className="text-2xl font-bold">${result.modelPrice.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">BS price at extracted IV</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-1">Calibration Error</p>
                  <p className="text-2xl font-bold">${result.calibrationError.toExponential(2)}</p>
                  <p className="text-sm text-muted-foreground">Model vs market price difference</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategy Recommendation:</strong> {result.recommendation}
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
                  Strategic Insights
                </CardTitle>
                <CardDescription>Volatility trading opportunities</CardDescription>
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
                <CardDescription>Model limitations and considerations</CardDescription>
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
              Find σ such that: BS(S, K, r, σ, T) = Market Price
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Implied Volatility is the volatility input that makes the Black-Scholes theoretical price equal the observed market price. It is solved numerically via bisection since there is no closed-form solution.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg mt-4">
            <p className="font-semibold mb-2">Interpretation</p>
            <p className="text-sm text-muted-foreground">
              An IV of 25% means the market expects the underlying to move within ±25% (annualized, one standard deviation) over the option's life. This translates to an expected daily move of approximately 25% / √252 ≈ 1.6%.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Options Calculators
          </CardTitle>
          <CardDescription>
            Explore other derivatives and volatility analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/black-scholes-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Black-Scholes</p>
                      <p className="text-sm text-muted-foreground">Option pricing model</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/option-greeks-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Option Greeks</p>
                      <p className="text-sm text-muted-foreground">Delta, Gamma, Vega, Theta, Rho</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Historical Volatility</p>
                      <p className="text-sm text-muted-foreground">Realized volatility calculation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/put-call-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Put-Call Parity</p>
                      <p className="text-sm text-muted-foreground">Arbitrage relationships</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/straddle-strangle-strategy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Straddle/Strangle</p>
                      <p className="text-sm text-muted-foreground">Volatility strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/option-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Option Payoff</p>
                      <p className="text-sm text-muted-foreground">P&L visualization</p>
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
        <meta itemProp="name" content="The Definitive Guide to Implied Volatility (IV): Calculation, Interpretation, and Trading Applications" />
        <meta itemProp="description" content="An expert guide explaining Implied Volatility—how it's calculated from option prices, what it represents, volatility smile and skew, IV rank and percentile, and practical trading strategies based on IV analysis." />
        <meta itemProp="keywords" content="implied volatility calculation, IV extraction, Black-Scholes IV, volatility smile, volatility skew, IV percentile, IV rank, volatility trading, options pricing" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-implied-volatility-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Implied Volatility (IV): Understanding Market Expectations</h1>
        <p className="text-lg italic text-muted-foreground">Master the concept of Implied Volatility—the market's forward-looking expectation of price variability extracted from option prices.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#iv-definition" className="hover:underline">What is Implied Volatility?</a></li>
          <li><a href="#iv-calculation" className="hover:underline">How Implied Volatility is Calculated</a></li>
          <li><a href="#iv-interpretation" className="hover:underline">Interpreting IV Levels</a></li>
          <li><a href="#volatility-surface" className="hover:underline">The Volatility Surface: Smile and Skew</a></li>
          <li><a href="#iv-trading" className="hover:underline">Trading Strategies Based on IV</a></li>
        </ul>
        <hr />

        {/* WHAT IS IMPLIED VOLATILITY? */}
        <h2 id="iv-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Implied Volatility?</h2>
        <p>**Implied Volatility (IV)** is the market's expectation of how much the underlying asset's price will move over a given period. Unlike historical volatility (which measures past price movements), IV is forward-looking—it represents what traders collectively believe will happen in the future.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Market's Consensus Forecast</h3>
        <p>IV is embedded in option prices. When traders buy options aggressively (bidding up prices), IV rises. When they sell options (depressing prices), IV falls. Thus, IV reflects the supply and demand for options, which in turn reflects expectations about future volatility.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">IV vs Historical Volatility</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Historical Volatility (HV)**: Backward-looking; measures actual past price movements over a period.</li>
          <li>**Implied Volatility (IV)**: Forward-looking; derived from option prices; represents expected future volatility.</li>
          <li>**Volatility Risk Premium**: IV typically exceeds HV because options sellers demand compensation for uncertainty.</li>
        </ul>

        <hr />

        {/* HOW IMPLIED VOLATILITY IS CALCULATED */}
        <h2 id="iv-calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Implied Volatility is Calculated</h2>
        <p>IV cannot be calculated directly—it must be solved numerically. Given all other Black-Scholes inputs (spot, strike, time, rate) and the market option price, IV is the volatility that makes the model price equal the market price.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Inverse Problem</h3>
        <p>Black-Scholes calculates option price from volatility. IV solves the inverse: given the option price, find the volatility. Since there's no closed-form solution, numerical methods (bisection, Newton-Raphson) are used.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Numerical Methods</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Bisection**: Reliable but slow. Starts with bounds (e.g., 1% to 500%) and iteratively narrows until convergence.</li>
          <li>**Newton-Raphson**: Faster but can fail to converge. Uses vega (the derivative of price with respect to volatility) to iterate.</li>
          <li>**Brenner-Subrahmanyam**: Approximation formula for quick estimates; less accurate but instantaneous.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Annualization</h3>
        <p>IV is expressed as an annualized percentage. An IV of 30% means the market expects approximately ±30% movement over one year (one standard deviation). To convert to daily expected move: IV / √252 ≈ IV / 15.9.</p>

        <hr />

        {/* INTERPRETING IV LEVELS */}
        <h2 id="iv-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting IV Levels</h2>
        <p>Understanding whether IV is "high" or "low" requires context. Absolute levels vary significantly by asset class, sector, and market conditions.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">IV Percentile and Rank</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**IV Percentile**: What percentage of the past year's IV readings were below the current IV. An IV percentile of 80% means current IV is higher than 80% of observations.</li>
          <li>**IV Rank**: (Current IV - 52-week low IV) / (52-week high IV - 52-week low IV) × 100. Measures where IV sits within its recent range.</li>
          <li>**Interpretation**: High IV percentile/rank suggests expensive options; low readings suggest cheap options.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Asset Class Differences</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Equity Indices (SPY, QQQ)**: Typically 15-25% IV in normal markets; 30-50%+ during corrections.</li>
          <li>**Individual Stocks**: Varies widely; growth stocks 40-60%+; defensive stocks 20-30%.</li>
          <li>**Commodities**: Highly variable; oil can exceed 100% IV during supply shocks.</li>
          <li>**Currencies**: Generally lower; 5-15% for majors.</li>
        </ul>

        <hr />

        {/* THE VOLATILITY SURFACE: SMILE AND SKEW */}
        <h2 id="volatility-surface" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Volatility Surface: Smile and Skew</h2>
        <p>IV is not constant across strikes and expirations—it varies, creating a **volatility surface**. Understanding this structure is essential for professional options trading.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Volatility Smile</h3>
        <p>The **volatility smile** refers to the U-shaped pattern where OTM calls and OTM puts both have higher IV than ATM options. This was observed after the 1987 crash and reflects:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Demand for downside protection (puts) and upside participation (calls).</li>
          <li>Recognition that extreme moves happen more often than Black-Scholes predicts (fat tails).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Volatility Skew</h3>
        <p>The **volatility skew** is the asymmetry in IV across strikes:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Equity Skew**: OTM puts typically have higher IV than OTM calls (downside fear premium).</li>
          <li>**Commodity Skew**: Can be inverted (calls have higher IV) due to supply disruption risks.</li>
          <li>**Skew as Indicator**: Steep skew indicates fear of crashes; flat skew suggests complacency.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Term Structure</h3>
        <p>IV also varies by expiration (term structure):</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Contango**: Near-term IV lower than far-term IV (normal state).</li>
          <li>**Backwardation**: Near-term IV higher than far-term IV (fear/event premium).</li>
          <li>**Event Effects**: Earnings, Fed meetings, and macro events cause IV spikes in nearby expirations.</li>
        </ul>

        <hr />

        {/* TRADING STRATEGIES BASED ON IV */}
        <h2 id="iv-trading" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Trading Strategies Based on IV</h2>
        <p>IV analysis drives numerous options trading strategies, exploiting whether volatility is cheap or expensive relative to expectations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">High IV Strategies (Sell Volatility)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Covered Calls**: Sell calls against long stock to earn premium income.</li>
          <li>**Credit Spreads**: Sell OTM spread to capture premium while limiting risk.</li>
          <li>**Iron Condors**: Sell both put and call spreads to profit from IV contraction and range-bound price.</li>
          <li>**Short Straddles/Strangles**: Aggressive premium collection betting on low realized volatility.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Low IV Strategies (Buy Volatility)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Long Calls/Puts**: Buy directional options when IV is cheap.</li>
          <li>**Long Straddles/Strangles**: Profit from big moves in either direction.</li>
          <li>**Calendar Spreads**: Buy longer-dated options, sell shorter-dated; benefit from term structure.</li>
          <li>**Debit Spreads**: Pay for OTM spread when IV is low for favorable risk/reward.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The IV Crush</h3>
        <p>**IV Crush** is the rapid decline in IV after an anticipated event (earnings, FDA decision). Options are expensive before the event; IV collapses after uncertainty resolves. Option sellers profit from IV crush; buyers must overcome it to profit.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>**Implied Volatility** is the market's forward-looking expectation of price variability, extracted from option prices. It drives option pricing, informs trading strategies, and reflects collective market sentiment about future uncertainty.</p>
        <p>Professional options traders monitor IV levels, compare to historical ranges (IV percentile/rank), analyze the volatility surface (smile, skew, term structure), and construct strategies based on whether options are cheap or expensive. Mastering IV analysis is essential for consistent success in derivatives trading.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Implied Volatility and options pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Implied Volatility?</h4>
              <p className="text-muted-foreground">
                Implied Volatility (IV) is the market's expectation of future price volatility, extracted from option prices using a pricing model like Black-Scholes. Unlike historical volatility (which looks at past prices), IV is forward-looking. An IV of 30% suggests the market expects the underlying to move within ±30% annualized.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How is IV calculated from option prices?</h4>
              <p className="text-muted-foreground">
                IV is calculated by solving the inverse Black-Scholes problem numerically. Given the market option price and all other inputs (spot, strike, rate, time), iterative methods like bisection or Newton-Raphson find the volatility that makes the model price equal the market price. There is no closed-form solution.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What does high IV mean for options traders?</h4>
              <p className="text-muted-foreground">
                High IV means options are expensive—premiums are elevated. This often occurs before known events (earnings, FDA decisions) or during market stress. High IV favors option sellers (premiums are rich) and is challenging for buyers (need large moves to profit). Consider selling strategies in high IV environments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is IV Crush?</h4>
              <p className="text-muted-foreground">
                IV Crush is the rapid decline in implied volatility after an anticipated event (earnings, news) resolves. Before the event, uncertainty is high and IV is elevated. Once the event passes, uncertainty drops and IV collapses. Long option holders often lose money due to IV crush even if their directional view was correct.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do IV Percentile and IV Rank differ?</h4>
              <p className="text-muted-foreground">
                IV Percentile measures what percentage of past IV readings were below the current level. IV Rank measures where current IV sits within the 52-week range [(Current - Low) / (High - Low)]. Both help determine if IV is relatively high or low. An 80th percentile means IV is higher than 80% of historical observations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the volatility smile?</h4>
              <p className="text-muted-foreground">
                The volatility smile is the U-shaped pattern where OTM options (both calls and puts) have higher IV than ATM options. It reflects market recognition that extreme moves occur more frequently than the log-normal distribution assumes. The smile/skew pattern emerged strongly after the 1987 crash.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is IV typically higher than realized volatility?</h4>
              <p className="text-muted-foreground">
                IV typically exceeds historical volatility due to the volatility risk premium (VRP). Option sellers demand compensation for taking unlimited risk. This premium means buyers systematically pay more than the expected value of moves. The VRP is a key source of alpha for systematic volatility sellers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can IV predict future stock moves?</h4>
              <p className="text-muted-foreground">
                IV predicts the expected magnitude of moves, not direction. High IV suggests the market expects large moves, but doesn't indicate whether the stock will go up or down. IV is a measure of uncertainty, not a directional forecast. However, sudden IV changes can signal upcoming events or market stress.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does IV affect vega?</h4>
              <p className="text-muted-foreground">
                Vega measures the option's sensitivity to IV changes. If an option has vega of 0.10 and IV increases by 1%, the option price rises by $0.10. Long options have positive vega (benefit from rising IV); short options have negative vega (hurt by rising IV). ATM options have the highest vega.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I buy options vs sell options based on IV?</h4>
              <p className="text-muted-foreground">
                Buy options when IV is low (cheap premiums) and you expect volatility to increase or need directional exposure. Sell options when IV is high (rich premiums) and you expect IV to decline or the underlying to stay range-bound. Use IV percentile/rank to assess whether current IV is relatively high or low versus history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Implied Volatility Calculator extracts IV from option market prices using the Black-Scholes model.</p>
          <p>Use IV to assess whether options are cheap or expensive and to inform volatility trading strategies.</p>
          <p>Compare IV to historical levels (IV percentile/rank) and analyze across strikes (skew) for comprehensive volatility analysis.</p>
        </CardContent>
      </Card>
    </div>
  );
}
