
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import Link from 'next/link';

const formSchema = z.object({
  spot: z.number().positive(),
  strike: z.number().positive(),
  rate: z.number().min(-50).max(100),
  volatility: z.number().min(1).max(500),
  timeYears: z.number().min(0.001).max(50),
  optionType: z.enum(['call', 'put']),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function ProbabilityExpiringITMOptionsCalculator() {
  const [result, setResult] = useState<{
    probITM: number;
    probOTM: number;
    delta: number;
    moneyness: string;
    probabilityLevel: string;
    recommendation: string;
    riskRewardAssessment: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spot: undefined,
      strike: undefined,
      rate: undefined,
      volatility: undefined,
      timeYears: undefined,
      optionType: undefined,
    },
  });

  const getMoneyness = (spot: number, strike: number, type: 'call' | 'put') => {
    const ratio = spot / strike;
    if (type === 'call') {
      if (ratio > 1.1) return 'Deep ITM';
      if (ratio > 1.02) return 'ITM';
      if (ratio >= 0.98) return 'ATM';
      if (ratio >= 0.9) return 'OTM';
      return 'Deep OTM';
    } else {
      if (ratio < 0.9) return 'Deep ITM';
      if (ratio < 0.98) return 'ITM';
      if (ratio <= 1.02) return 'ATM';
      if (ratio <= 1.1) return 'OTM';
      return 'Deep OTM';
    }
  };

  const getProbabilityLevel = (prob: number) => {
    if (prob >= 0.8) return 'Very High';
    if (prob >= 0.6) return 'High';
    if (prob >= 0.4) return 'Moderate';
    if (prob >= 0.2) return 'Low';
    return 'Very Low';
  };

  const getRiskRewardAssessment = (prob: number, type: 'call' | 'put') => {
    if (prob >= 0.8) return 'High probability but limited profit potential; premium is expensive relative to expected payoff.';
    if (prob >= 0.6) return 'Favorable odds with reasonable risk/reward; suitable for directional trades with conviction.';
    if (prob >= 0.4) return 'Balanced probability; consider spreads to improve risk/reward profile.';
    if (prob >= 0.2) return 'Low probability trade; requires large move for profit. Use small position sizes or spreads.';
    return 'Lottery ticket trade; very unlikely to profit but offers asymmetric upside if move occurs.';
  };

  const getRecommendation = (prob: number, moneyness: string, type: 'call' | 'put') => {
    if (prob >= 0.8) {
      return 'High ITM probability implies expensive premium. Consider selling this option or using it as part of a spread to reduce cost basis.';
    }
    if (prob >= 0.6) {
      return 'Good probability of profit. Suitable for directional trades. Consider ATM or slightly OTM strikes for better leverage.';
    }
    if (prob >= 0.4) {
      return 'Moderate probability; consider debit spreads to reduce cost and define risk. Pure long positions require significant moves.';
    }
    if (prob >= 0.2) {
      return 'Low probability requires cheap entry. Consider buying on volatility dips. Use small sizes or as part of multi-leg strategies.';
    }
    return 'Very low probability—treat as speculative. Only use small position sizes. Consider as cheap hedge or lottery play.';
  };

  const getInsights = (prob: number, probOTM: number, delta: number, moneyness: string, type: 'call' | 'put') => {
    const insights = [];

    insights.push(`${(prob * 100).toFixed(1)}% probability suggests the option expires ITM roughly ${Math.round(prob * 10)} out of 10 times (risk-neutral)`);

    if (delta > 0.5 || delta < -0.5) {
      insights.push('Delta exceeds 0.50—option has meaningful directional exposure and is likely to move with the underlying');
    } else {
      insights.push('Delta below 0.50—option is primarily time value; needs significant move to profit');
    }

    if (moneyness.includes('Deep')) {
      insights.push(`${moneyness} options trade with less time premium but higher absolute cost`);
    } else if (moneyness === 'ATM') {
      insights.push('ATM options have highest time value and maximum vega/gamma exposure');
    }

    return insights;
  };

  const getConsiderations = (prob: number, timeYears: number) => {
    const considerations = [];
    considerations.push('Probability is risk-neutral (pricing probability), not real-world probability');
    considerations.push('Model assumes log-normal distribution; fat tails are underestimated');
    considerations.push('Dividends, early exercise, and carry costs can shift actual probabilities');
    considerations.push('Probability changes dynamically with spot, volatility, and time');
    considerations.push('High probability trades often have poor risk/reward; balance both factors');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const r = values.rate! / 100;
    const sigma = values.volatility! / 100;
    const T = values.timeYears!;
    const S = values.spot!;
    const K = values.strike!;

    if (sigma === 0 || T === 0) return;

    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    const probITM = values.optionType === 'call' ? normCdf(d2) : normCdf(-d2);
    const probOTM = 1 - probITM;
    const delta = values.optionType === 'call' ? normCdf(d1) : normCdf(d1) - 1;
    const moneyness = getMoneyness(S, K, values.optionType!);

    setResult({
      probITM,
      probOTM,
      delta,
      moneyness,
      probabilityLevel: getProbabilityLevel(probITM),
      recommendation: getRecommendation(probITM, moneyness, values.optionType!),
      riskRewardAssessment: getRiskRewardAssessment(probITM, values.optionType!),
      insights: getInsights(probITM, probOTM, delta, moneyness, values.optionType!),
      considerations: getConsiderations(probITM, T)
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
            Enter option specifications to calculate the probability of expiring in-the-money (ITM)
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
                  name="volatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Implied Volatility (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 25"
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
                          placeholder="e.g., 0.25"
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
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate ITM Probability
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
                <Percent className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>ITM Probability Analysis</CardTitle>
                  <CardDescription>Risk-Neutral Expiration Probability</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Result Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Probability of Expiring ITM</p>
                  <p className="text-5xl font-bold text-primary">{(result.probITM * 100).toFixed(2)}%</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Probability of Expiring OTM</p>
                  <p className="text-5xl font-bold text-muted-foreground">{(result.probOTM * 100).toFixed(2)}%</p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Probability Level</p>
                  <Badge variant={result.probabilityLevel === 'Very High' ? 'default' : result.probabilityLevel === 'High' ? 'secondary' : result.probabilityLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.probabilityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Moneyness</p>
                  <Badge variant={result.moneyness.includes('ITM') ? 'default' : result.moneyness === 'ATM' ? 'outline' : 'secondary'}>
                    {result.moneyness}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Delta (≈ Prob)</p>
                  <p className="text-lg font-bold">{result.delta.toFixed(4)}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Risk/Reward Assessment</p>
                <p className="text-muted-foreground">{result.riskRewardAssessment}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
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
                <CardDescription>Trade analysis and positioning</CardDescription>
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
                <CardDescription>Model limitations and assumptions</CardDescription>
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
              P(ITM) = N(d₂) for calls | P(ITM) = N(-d₂) for puts
            </p>
            <p className="font-mono text-sm text-center mt-2">
              d₂ = [ln(S/K) + (r - σ²/2)T] / (σ√T)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The probability is derived from the Black-Scholes d₂ term, representing the risk-neutral probability that the option expires in-the-money. Note that N(d₁) (delta) is related but slightly different.
          </p>
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
            Explore other options analysis and pricing tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/black-scholes-calculator" className="block">
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
            <Link href="/option-greeks-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Option Greeks</p>
                      <p className="text-sm text-muted-foreground">Delta, Gamma, Vega, Theta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/implied-volatility-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Implied Volatility</p>
                      <p className="text-sm text-muted-foreground">IV extraction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/option-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Option Payoff</p>
                      <p className="text-sm text-muted-foreground">P&L visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/covered-call-protective-put-strategy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Covered Call/Put</p>
                      <p className="text-sm text-muted-foreground">Stock-option strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/binomial-option-pricing-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Binomial Model</p>
                      <p className="text-sm text-muted-foreground">American option pricing</p>
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
        <meta itemProp="name" content="The Definitive Guide to ITM Probability: Understanding Option Expiration Probabilities" />
        <meta itemProp="description" content="An expert guide explaining ITM probability calculation, risk-neutral vs real-world probability, delta as probability proxy, and applications in options trading strategy selection." />
        <meta itemProp="keywords" content="ITM probability, option expiration probability, Black-Scholes d2, delta probability, risk-neutral probability, option trading probability, exercise probability" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-itm-probability-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to ITM Probability: Understanding Option Expiration Outcomes</h1>
        <p className="text-lg italic text-muted-foreground">Master the concept of ITM probability—the risk-neutral likelihood that an option will have intrinsic value at expiration.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#itm-definition" className="hover:underline">What is ITM Probability?</a></li>
          <li><a href="#calculation-method" className="hover:underline">How ITM Probability is Calculated</a></li>
          <li><a href="#risk-neutral" className="hover:underline">Risk-Neutral vs Real-World Probability</a></li>
          <li><a href="#delta-relationship" className="hover:underline">Delta as a Probability Proxy</a></li>
          <li><a href="#trading-applications" className="hover:underline">Trading Applications and Strategy Selection</a></li>
        </ul>
        <hr />

        {/* WHAT IS ITM PROBABILITY? */}
        <h2 id="itm-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is ITM Probability?</h2>
        <p>**ITM Probability** is the probability that an option will expire in-the-money (ITM)—meaning it will have intrinsic value at expiration. For a call option, this means the underlying price is above the strike; for a put, it means the underlying is below the strike.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why ITM Probability Matters</h3>
        <p>ITM probability is fundamental to options trading because it helps traders:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Assess Trade Quality**: Higher probability trades have lower payoff potential; lower probability trades offer asymmetric upside.</li>
          <li>**Select Strikes**: Balance probability of profit against premium paid.</li>
          <li>**Position Sizing**: Adjust position sizes based on expected win rates.</li>
          <li>**Strategy Selection**: High-probability trades favor selling strategies; low-probability trades suit long speculation.</li>
        </ul>

        <hr />

        {/* HOW ITM PROBABILITY IS CALCULATED */}
        <h2 id="calculation-method" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How ITM Probability is Calculated</h2>
        <p>ITM probability is derived from the Black-Scholes model using the **d₂ term** of the formula.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Mathematical Foundation</h3>
        <p>The probability of a call expiring ITM is N(d₂), where N() is the cumulative standard normal distribution function:</p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            {'d₂ = [ln(S/K) + (r - σ²/2)T] / (σ√T)'}
          </p>
        </div>
        <p>For puts, ITM probability is N(-d₂). This formula accounts for the underlying's drift rate adjusted for volatility.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Input Dependencies</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Spot Price (S)**: Higher spot relative to strike increases call ITM probability.</li>
          <li>**Strike Price (K)**: Lower strikes have higher call ITM probability.</li>
          <li>**Volatility (σ)**: Higher volatility increases OTM option ITM probability (more potential movement).</li>
          <li>**Time (T)**: More time increases probability that OTM options can reach ITM.</li>
          <li>**Interest Rate (r)**: Minor effect; higher rates slightly increase call ITM probability.</li>
        </ul>

        <hr />

        {/* RISK-NEUTRAL VS REAL-WORLD PROBABILITY */}
        <h2 id="risk-neutral" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk-Neutral vs Real-World Probability</h2>
        <p>A critical distinction: ITM probability from Black-Scholes is **risk-neutral probability**, not real-world probability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Difference</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Risk-Neutral Probability**: Used for pricing derivatives. Assumes all assets grow at the risk-free rate. This is a mathematical construct, not a forecast.</li>
          <li>**Real-World Probability**: Incorporates risk premiums and expected returns. Equities have historically earned more than the risk-free rate.</li>
          <li>**Implication**: Real-world call ITM probability is typically slightly higher than risk-neutral for upward-drifting assets like stocks.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Risk-Neutral Still Matters</h3>
        <p>Despite not being "real" probability, risk-neutral probability is used because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>It's the probability embedded in option prices.</li>
          <li>It enables consistent valuation and hedging.</li>
          <li>Differences from real-world probability are typically small for short-dated options.</li>
        </ul>

        <hr />

        {/* DELTA AS A PROBABILITY PROXY */}
        <h2 id="delta-relationship" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Delta as a Probability Proxy</h2>
        <p>**Delta** (N(d₁)) is often used as an approximation for ITM probability. While not exactly equal to N(d₂), they are closely related.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Delta vs N(d₂)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Delta = N(d₁)**: The hedge ratio; also represents the expected number of shares to replicate the option.</li>
          <li>**ITM Prob = N(d₂)**: The actual risk-neutral probability of expiring ITM.</li>
          <li>**Relationship**: d₁ = d₂ + σ√T. Delta is always slightly higher than ITM probability for calls (lower for puts in absolute terms).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Practical Usage</h3>
        <p>For most practical purposes, traders use delta as a probability proxy because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Delta is readily available on trading platforms.</li>
          <li>The difference from N(d₂) is small, especially for shorter-dated options.</li>
          <li>A delta of 0.30 means approximately 30% ITM probability.</li>
        </ul>

        <hr />

        {/* TRADING APPLICATIONS AND STRATEGY SELECTION */}
        <h2 id="trading-applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Trading Applications and Strategy Selection</h2>
        <p>ITM probability guides strategy selection and strike choice.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">High Probability Trades (60%+)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>ITM or deep ITM options have high probability but expensive premiums.</li>
          <li>Better suited for **selling**: covered calls, cash-secured puts.</li>
          <li>Risk is that losses can be large when the trade fails despite high probability.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Moderate Probability Trades (30-60%)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>ATM and slightly OTM options balance probability and cost.</li>
          <li>Suitable for directional trades with conviction.</li>
          <li>Consider spreads to define risk and reduce cost basis.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Low Probability Trades (&lt;30%)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>OTM and far OTM options have low probability but cheap premiums.</li>
          <li>Asymmetric payoff potential—lottery ticket profile.</li>
          <li>Use small position sizes or as part of multi-leg strategies.</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>**ITM Probability** is a fundamental concept for options traders, providing insight into the likelihood of an option having value at expiration. While derived as risk-neutral probability (not a real-world forecast), it helps traders assess trade quality, select appropriate strikes, and balance risk versus reward.</p>
        <p>Combined with delta analysis, payoff diagrams, and position sizing, ITM probability forms the quantitative foundation for systematic options trading strategies.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about ITM probability and options expiration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is ITM probability?</h4>
              <p className="text-muted-foreground">
                ITM probability is the likelihood that an option will expire in-the-money, meaning it will have intrinsic value at expiration. For calls, this means spot &gt; strike; for puts, spot &lt; strike. It&apos;s calculated using the Black-Scholes d₂ term and represents risk-neutral probability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is ITM probability the same as delta?</h4>
              <p className="text-muted-foreground">
                No, but they're closely related. Delta equals N(d₁), while ITM probability equals N(d₂). Delta is always slightly higher than ITM probability for calls. The difference is σ√T. For practical purposes, delta is often used as a probability proxy since the values are close.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is this called "risk-neutral" probability?</h4>
              <p className="text-muted-foreground">
                Risk-neutral probability assumes all assets grow at the risk-free rate, removing risk preferences from the calculation. It's a mathematical construct used for pricing, not a real-world forecast. Real-world probability would incorporate expected returns and risk premiums.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does volatility affect ITM probability?</h4>
              <p className="text-muted-foreground">
                Higher volatility increases the ITM probability of OTM options (more potential for large moves) but decreases the ITM probability of already-ITM options. ATM options are least affected. Volatility creates more uncertainty about the final outcome.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does time remaining affect ITM probability?</h4>
              <p className="text-muted-foreground">
                Yes. For OTM options, more time increases ITM probability (more time for favorable moves). For ITM options, time has mixed effects. As expiration approaches, probabilities converge toward 0% or 100% depending on whether the option finishes ITM or OTM.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What ITM probability is considered good for buying options?</h4>
              <p className="text-muted-foreground">
                There's no universal answer—it depends on strategy. Low probability (20-40%) options are cheap and offer asymmetric upside but usually lose. High probability (60%+) options are expensive with limited upside. Many traders target 40-50% probability for balanced risk/reward.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do option sellers use ITM probability?</h4>
              <p className="text-muted-foreground">
                Option sellers want high probability of the option expiring worthless (OTM). They target low ITM probability strikes—typically 70-85% probability of OTM expiration. This provides consistent premium income but with occasional large losses when trades fail.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does the model account for dividends?</h4>
              <p className="text-muted-foreground">
                Basic Black-Scholes doesn't include dividends. For dividend-paying stocks, the spot price should be adjusted (reduced by present value of expected dividends) for accurate probability calculation. Dividends reduce call ITM probability and increase put ITM probability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How accurate is ITM probability for real trading?</h4>
              <p className="text-muted-foreground">
                ITM probability is a model estimate, not a precise prediction. Real markets have fat tails (extreme moves more frequent than model assumes), volatility isn't constant, and risk-neutral differs from real-world. Use it as a guide, not gospel.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use ITM probability for American options?</h4>
              <p className="text-muted-foreground">
                ITM probability from Black-Scholes applies to European options (exercise only at expiration). American options can be exercised early, which affects timing but not the final ITM/OTM outcome at expiration. For most practical purposes, the probabilities are similar.
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
          <p>The ITM Probability Calculator estimates the risk-neutral probability of an option expiring in-the-money using the Black-Scholes d₂ term.</p>
          <p>Use ITM probability to assess trade quality, select appropriate strikes, and balance probability of profit against potential payoff.</p>
          <p>Remember that risk-neutral probability differs from real-world probability and should be used as a guide alongside other analysis.</p>
        </CardContent>
      </Card>
    </div>
  );
}
