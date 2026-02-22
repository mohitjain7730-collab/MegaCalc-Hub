
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
  volatility: z.number().min(1).max(500),
  timeYears: z.number().min(0.001).max(50),
  optionType: z.enum(['call', 'put']),
});

type FormValues = z.infer<typeof formSchema>;

// Mathematical helper functions
function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

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

function calculateGreeks(S: number, K: number, rPct: number, volPct: number, T: number, type: 'call' | 'put') {
  const r = rPct / 100;
  const sigma = volPct / 100;

  if (sigma === 0 || T === 0) {
    return { delta: NaN, gamma: NaN, vega: NaN, theta: NaN, rho: NaN, d1: NaN, d2: NaN };
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = normCdf(d1);
  const Nd2 = normCdf(d2);
  const NNd1 = normCdf(-d1);
  const NNd2 = normCdf(-d2);
  const pdf = normPdf(d1);

  // Delta
  const delta = type === 'call' ? Nd1 : Nd1 - 1;

  // Gamma (same for calls and puts)
  const gamma = pdf / (S * sigma * sqrtT);

  // Vega (same for calls and puts, per 1% vol change)
  const vega = S * pdf * sqrtT / 100;

  // Theta (per day)
  const discount = Math.exp(-r * T);
  let theta: number;
  if (type === 'call') {
    theta = (-(S * pdf * sigma) / (2 * sqrtT) - r * K * discount * Nd2) / 365;
  } else {
    theta = (-(S * pdf * sigma) / (2 * sqrtT) + r * K * discount * NNd2) / 365;
  }

  // Rho (per 1% rate change)
  const rho = type === 'call'
    ? K * T * discount * Nd2 / 100
    : -K * T * discount * NNd2 / 100;

  return { delta, gamma, vega, theta, rho, d1, d2 };
}

export default function OptionGreeksCalculator() {
  const [result, setResult] = useState<{
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
    rho: number;
    moneyness: string;
    deltaInterpretation: string;
    riskLevel: string;
    recommendation: string;
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

  const getDeltaInterpretation = (delta: number, type: 'call' | 'put') => {
    const absDelta = Math.abs(delta);
    if (absDelta > 0.8) return 'High directional exposure; option moves nearly dollar-for-dollar with underlying.';
    if (absDelta > 0.5) return 'Moderate directional exposure; option has meaningful price sensitivity.';
    if (absDelta > 0.2) return 'Low directional exposure; option less sensitive to underlying moves.';
    return 'Minimal directional exposure; option primarily driven by time value decay.';
  };

  const getRiskLevel = (gamma: number, vega: number, theta: number, timeYears: number) => {
    const gammaRisk = gamma * 100; // Scaled for interpretation
    if (timeYears < 0.05 && gammaRisk > 0.05) return 'Very High';
    if (gammaRisk > 0.03) return 'High';
    if (gammaRisk > 0.01) return 'Moderate';
    return 'Low';
  };

  const getRecommendation = (delta: number, gamma: number, theta: number, timeYears: number) => {
    const absDelta = Math.abs(delta);
    if (timeYears < 0.05) {
      return 'Near expiry: Extreme gamma risk. Consider closing or rolling position to avoid rapid P&L swings.';
    }
    if (absDelta > 0.8) {
      return 'Deep ITM: Consider exercising or converting to stock position to avoid time decay.';
    }
    if (absDelta < 0.2) {
      return 'Deep OTM: Low probability of profit. Consider closing position or adjusting strike.';
    }
    if (gamma > 0.05) {
      return 'High gamma: Requires frequent delta hedging. Monitor position closely for large underlying moves.';
    }
    return 'Standard exposure: Maintain position with regular monitoring of delta and theta decay.';
  };

  const getInsights = (delta: number, gamma: number, vega: number, theta: number, timeYears: number) => {
    const insights = [];
    const absDelta = Math.abs(delta);

    if (absDelta > 0.5) {
      insights.push(`Delta of ${delta.toFixed(2)} suggests ${Math.round(absDelta * 100)}% probability of expiring ITM`);
    } else {
      insights.push(`Delta of ${delta.toFixed(2)} suggests ${Math.round(absDelta * 100)}% probability of expiring ITM`);
    }

    if (gamma > 0.02) {
      insights.push('High gamma means delta will change significantly with underlying movement');
    } else {
      insights.push('Low gamma indicates stable delta; less frequent rehedging needed');
    }

    if (vega > 0.5) {
      insights.push('High vega exposure: Position sensitive to volatility changes');
    } else {
      insights.push('Moderate vega: Volatility changes have limited impact');
    }

    return insights;
  };

  const getConsiderations = (theta: number, gamma: number, timeYears: number) => {
    const considerations = [];
    considerations.push('Black-Scholes assumes constant volatility and log-normal returns');
    considerations.push('Model ignores dividends; adjust for dividend-paying stocks');
    considerations.push('Theta decay accelerates as expiry approaches, especially for ATM options');
    considerations.push('Real-world bid-ask spreads may erode theoretical greek edges');
    considerations.push('Gamma risk increases near expiry; position sizing becomes critical');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const greeks = calculateGreeks(
      values.spot!,
      values.strike!,
      values.rate!,
      values.volatility!,
      values.timeYears!,
      values.optionType!
    );

    if (!isNaN(greeks.delta)) {
      setResult({
        delta: greeks.delta,
        gamma: greeks.gamma,
        vega: greeks.vega,
        theta: greeks.theta,
        rho: greeks.rho,
        moneyness: getMoneyness(values.spot!, values.strike!, values.optionType!),
        deltaInterpretation: getDeltaInterpretation(greeks.delta, values.optionType!),
        riskLevel: getRiskLevel(greeks.gamma, greeks.vega, greeks.theta, values.timeYears!),
        recommendation: getRecommendation(greeks.delta, greeks.gamma, greeks.theta, values.timeYears!),
        insights: getInsights(greeks.delta, greeks.gamma, greeks.vega, greeks.theta, values.timeYears!),
        considerations: getConsiderations(greeks.theta, greeks.gamma, values.timeYears!)
      });
    }
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
            Enter the option specifications to calculate Delta, Gamma, Vega, Theta, and Rho (Greeks)
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
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Option Greeks
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
                  <CardTitle>Option Greeks Analysis</CardTitle>
                  <CardDescription>Black-Scholes Sensitivity Metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Greeks Display Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground font-medium">Delta (Δ)</p>
                  <p className="text-2xl font-bold text-primary">{result.delta.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Directional</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Gamma (Γ)</p>
                  <p className="text-2xl font-bold">{result.gamma.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Convexity</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Vega (ν)</p>
                  <p className="text-2xl font-bold">{result.vega.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per 1% IV</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-red-200 dark:border-red-900/30">
                  <p className="text-sm text-muted-foreground font-medium">Theta (Θ)</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{result.theta.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per Day</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Rho (ρ)</p>
                  <p className="text-2xl font-bold">{result.rho.toFixed(4)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per 1% Rate</p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Moneyness</p>
                  <Badge variant={result.moneyness.includes('ITM') ? 'default' : result.moneyness === 'ATM' ? 'outline' : 'secondary'}>
                    {result.moneyness}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Risk Level</p>
                  <Badge variant={result.riskLevel === 'Very High' ? 'destructive' : result.riskLevel === 'High' ? 'destructive' : result.riskLevel === 'Moderate' ? 'outline' : 'secondary'}>
                    {result.riskLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">ITM Probability</p>
                  <p className="text-lg font-bold">{Math.round(Math.abs(result.delta) * 100)}%</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Delta Interpretation</p>
                <p className="text-muted-foreground">{result.deltaInterpretation}</p>
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
                <CardDescription>Position management recommendations</CardDescription>
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
                <CardDescription>Model limitations and risks</CardDescription>
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
            Formulas Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              d₂ = d₁ - σ√T
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs">Delta = N(d₁) for calls</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs">Gamma = N'(d₁) / (S·σ·√T)</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs">Vega = S·N'(d₁)·√T</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs">Theta = -[S·N'(d₁)·σ] / (2√T) - rKe⁻ʳᵀN(d₂)</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs">Rho = KTe⁻ʳᵀN(d₂) for calls</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Greeks are partial derivatives of the Black-Scholes option pricing formula with respect to underlying price (Delta, Gamma), volatility (Vega), time (Theta), and interest rate (Rho).
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
            Explore other derivatives and options analysis tools
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
            <Link href="/implied-volatility-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Implied Volatility</p>
                      <p className="text-sm text-muted-foreground">IV extraction from prices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/option-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Option Payoff</p>
                      <p className="text-sm text-muted-foreground">P&L visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/put-call-parity-calculator" className="block">
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
            <Link href="/binomial-option-pricing-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Binomial Model</p>
                      <p className="text-sm text-muted-foreground">American option pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/straddle-strangle-strategy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Straddle/Strangle</p>
                      <p className="text-sm text-muted-foreground">Volatility strategies</p>
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
        <meta itemProp="name" content="The Definitive Guide to Option Greeks: Delta, Gamma, Vega, Theta, and Rho Explained" />
        <meta itemProp="description" content="An expert guide explaining the five primary option Greeks—Delta, Gamma, Vega, Theta, and Rho—their formulas, interpretations, and practical applications in options trading and risk management." />
        <meta itemProp="keywords" content="option Greeks, delta hedging, gamma risk, vega exposure, theta decay, rho sensitivity, Black-Scholes Greeks, options risk management, delta neutral" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-option-greeks-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Option Greeks: Mastering Delta, Gamma, Vega, Theta, and Rho</h1>
        <p className="text-lg italic text-muted-foreground">Master the five sensitivity measures that quantify how option prices respond to changes in underlying price, volatility, time, and interest rates.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#delta-section" className="hover:underline">Delta: Directional Exposure</a></li>
          <li><a href="#gamma-section" className="hover:underline">Gamma: Delta's Rate of Change</a></li>
          <li><a href="#vega-section" className="hover:underline">Vega: Volatility Sensitivity</a></li>
          <li><a href="#theta-section" className="hover:underline">Theta: Time Decay</a></li>
          <li><a href="#rho-section" className="hover:underline">Rho: Interest Rate Sensitivity</a></li>
        </ul>
        <hr />

        {/* DELTA SECTION */}
        <h2 id="delta-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Delta (Δ): Directional Exposure</h2>
        <p>**Delta** measures the rate of change of the option price with respect to changes in the underlying asset's price. It is the most frequently used Greek and serves multiple purposes in options trading.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Delta Interpretation</h3>
        <p>Delta has three primary interpretations:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Price Sensitivity**: A delta of 0.50 means the option price moves $0.50 for every $1 move in the underlying.</li>
          <li>**Hedge Ratio**: Delta tells you how many shares to trade to create a delta-neutral position (e.g., delta 0.50 means hedge with 50 shares per option).</li>
          <li>**Probability Proxy**: Delta approximates the probability that the option expires in-the-money (a 0.30 delta call has roughly 30% ITM probability).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Delta Ranges</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Call Options**: Delta ranges from 0 to +1. Deep ITM calls approach +1; deep OTM calls approach 0.</li>
          <li>**Put Options**: Delta ranges from -1 to 0. Deep ITM puts approach -1; deep OTM puts approach 0.</li>
          <li>**ATM Options**: At-the-money options typically have delta around ±0.50.</li>
        </ul>

        <hr />

        {/* GAMMA SECTION */}
        <h2 id="gamma-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Gamma (Γ): Delta's Rate of Change</h2>
        <p>**Gamma** measures the rate of change of delta with respect to the underlying price. It indicates how quickly your delta exposure changes as the underlying moves.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Gamma Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Always Positive**: Gamma is positive for both calls and puts (long positions).</li>
          <li>**Highest at ATM**: Gamma peaks when the option is at-the-money and declines as options move ITM or OTM.</li>
          <li>**Increases Near Expiry**: Gamma explodes as expiration approaches, especially for ATM options.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Gamma Risk</h3>
        <p>High gamma creates **hedging challenges**. If you're short gamma (short options), large underlying moves can cause rapid, accumulating losses. Near expiry, short gamma positions become extremely dangerous as small price moves cause large delta swings, requiring constant rehedging.</p>

        <hr />

        {/* VEGA SECTION */}
        <h2 id="vega-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Vega (ν): Volatility Sensitivity</h2>
        <p>**Vega** measures the option price sensitivity to changes in implied volatility. It tells you how much the option price changes for a 1% change in IV.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Vega Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Always Positive for Long Options**: Higher volatility increases option value (more potential for profit).</li>
          <li>**Highest at ATM**: Like gamma, vega peaks at-the-money.</li>
          <li>**Decreases Near Expiry**: Vega decreases as expiration approaches because there's less time for volatility to affect the outcome.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Trading Volatility</h3>
        <p>Vega is critical for **volatility traders**. If you expect volatility to increase, buy options (positive vega). If you expect volatility to decrease (e.g., after earnings), sell options (negative vega). Straddles and strangles are common vega plays.</p>

        <hr />

        {/* THETA SECTION */}
        <h2 id="theta-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Theta (Θ): Time Decay</h2>
        <p>**Theta** measures the rate at which an option loses value as time passes, assuming all other factors remain constant. It is typically expressed as the dollar amount lost per day.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Theta Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Negative for Long Options**: Long option holders lose money each day due to time decay.</li>
          <li>**Positive for Short Options**: Option sellers earn theta (collect time decay premium).</li>
          <li>**Accelerates Near Expiry**: Time decay is not linear—it accelerates exponentially as expiration approaches, especially for ATM options.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Theta-Gamma Trade-off</h3>
        <p>There's an inherent trade-off: **long gamma positions bleed theta** (you pay for potential big moves), while **short gamma positions earn theta** (but face catastrophic risk from big moves). Managing this trade-off is central to options portfolio management.</p>

        <hr />

        {/* RHO SECTION */}
        <h2 id="rho-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rho (ρ): Interest Rate Sensitivity</h2>
        <p>**Rho** measures the option price sensitivity to changes in the risk-free interest rate. While often the least important Greek for short-dated options, rho becomes significant for longer-dated options.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Rho Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Positive for Calls**: Higher rates increase call values (lower present value of strike payment).</li>
          <li>**Negative for Puts**: Higher rates decrease put values.</li>
          <li>**Increases with Time**: Longer-dated options have higher rho since rate changes compound over more time.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">When Rho Matters</h3>
        <p>Rho is typically insignificant for short-term options but becomes important for **LEAPS** (long-term equity anticipation securities) and in environments of rapidly changing interest rates. A 1% rate change might move a 2-year option's price by several percent.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The **Option Greeks** are essential tools for understanding and managing options risk. Delta provides directional exposure, Gamma measures delta instability, Vega captures volatility sensitivity, Theta quantifies time decay, and Rho addresses interest rate impact.</p>
        <p>Professional options traders use Greeks to construct **delta-neutral portfolios**, manage **gamma risk**, trade **volatility**, and harvest **theta decay**. Mastering Greeks transforms options from complex derivatives into manageable, quantifiable risk exposures.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Option Greeks and risk management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are Option Greeks?</h4>
              <p className="text-muted-foreground">
                Option Greeks are sensitivity measures that quantify how an option's price changes in response to various factors. The five primary Greeks are: Delta (underlying price), Gamma (delta's rate of change), Vega (volatility), Theta (time decay), and Rho (interest rates). They are derived from the Black-Scholes option pricing model.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use Delta for hedging?</h4>
              <p className="text-muted-foreground">
                Delta represents the hedge ratio. If you own a call with delta 0.60, hedge by shorting 60 shares per option contract (100 shares). This creates a delta-neutral position that doesn't profit or lose from small underlying moves. Note that delta changes (gamma), so hedges must be adjusted as the underlying moves.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Gamma important near expiry?</h4>
              <p className="text-muted-foreground">
                Gamma explodes near expiration for ATM options because delta can swing from near 0 to near 1 (or vice versa) with small underlying moves. This creates extreme P&L volatility and hedging challenges. Short gamma positions near expiry are especially dangerous and are a common source of trading losses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What does negative Theta mean?</h4>
              <p className="text-muted-foreground">
                Negative theta means the option loses value each day due to time decay. Long option positions have negative theta—you're paying for the right to participate in potential moves. Short option positions have positive theta—you earn money each day as the option's time value erodes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Vega relate to implied volatility?</h4>
              <p className="text-muted-foreground">
                Vega measures sensitivity to implied volatility (IV), not realized volatility. If an option has vega of 0.15, a 1% increase in IV increases the option price by $0.15. Traders buy options (positive vega) before expected volatility increases and sell options (negative vega) when IV is elevated.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When does Rho become significant?</h4>
              <p className="text-muted-foreground">
                Rho is usually the least important Greek for short-dated options but becomes significant for LEAPS and in rapidly changing rate environments. For a 2-year call option, a 1% rate increase might add 2-3% to the option's value. In normal conditions with short-dated options, rho can often be ignored.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a delta-neutral strategy?</h4>
              <p className="text-muted-foreground">
                Delta-neutral means the portfolio's total delta is zero—it doesn't profit or lose from small underlying moves. This is achieved by combining options with opposite deltas or hedging with stock. Delta-neutral strategies focus on other factors like volatility (vega) or time decay (theta) rather than directional moves.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do ATM options have the highest Greeks?</h4>
              <p className="text-muted-foreground">
                ATM options have the most uncertainty about whether they'll expire ITM or OTM, making them most sensitive to all factors. Gamma peaks because small moves dramatically change ITM probability. Vega peaks because volatility has the most impact on uncertain outcomes. This sensitivity decreases as options move deep ITM or OTM.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How accurate are Black-Scholes Greeks?</h4>
              <p className="text-muted-foreground">
                Black-Scholes Greeks assume constant volatility, log-normal returns, no dividends, and continuous trading. Real markets violate these assumptions. Greeks are best viewed as approximations for small moves and short time horizons. Practitioners use more sophisticated models (stochastic volatility, jumps) for precision.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Gamma-Theta trade-off?</h4>
              <p className="text-muted-foreground">
                Long gamma positions (long options) give you the potential to profit from large moves but cost theta daily. Short gamma positions (short options) earn theta daily but face unlimited risk from large moves. This trade-off is fundamental to options—you can't have positive gamma and positive theta simultaneously.
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
          <p>The Option Greeks Calculator computes Delta, Gamma, Vega, Theta, and Rho using the Black-Scholes model.</p>
          <p>Use Greeks to understand option sensitivity, construct hedged positions, and manage portfolio risk exposures.</p>
          <p>Monitor Greeks regularly as they change with underlying price, volatility, and time to expiration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
