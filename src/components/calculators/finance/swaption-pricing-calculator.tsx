'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Clock, FunctionSquare, CheckCircle2, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Zod Schema
const formSchema = z.object({
  type: z.enum(['payer', 'receiver']),
  notional: z.number().positive(),
  forwardSwapRate: z.number().min(0).max(100),
  strikeRate: z.number().min(0).max(100),
  volatility: z.number().min(0),
  riskFreeRate: z.number().min(-100).max(100),
  timeToExpiry: z.number().positive(),
  swapTenor: z.number().positive(),
  frequency: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

// Math Helpers for Black-76
function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function standardNormalCDF(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

export default function SwaptionPricingCalculator() {
  const [result, setResult] = useState<{
    premium: number;
    premiumPercent: number;
    annuityFactor: number;
    d1: number;
    d2: number;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'payer',
      notional: undefined,
      forwardSwapRate: undefined, // F
      strikeRate: undefined, // K
      volatility: undefined, // Sigma
      riskFreeRate: undefined, // r
      timeToExpiry: undefined, // T
      swapTenor: undefined, // L
      frequency: '2', // Semi-Annual
    },
  });

  const calculate = (v: FormValues) => {
    // Inputs
    const F = v.forwardSwapRate / 100;
    const K = v.strikeRate / 100;
    const sigma = v.volatility / 100;
    const T = v.timeToExpiry;
    const r = v.riskFreeRate / 100;
    const tenor = v.swapTenor;
    const freq = parseInt(v.frequency);

    // 1. Calculate Annuity Factor (Level)
    // Discount factor for the underlying swap payments
    // Approximation: Sum of bond discount factors assuming flat yield curve at rate r
    // Annuity starts at T and pays for Tenor years

    // PV of annuity of $1 paid `freq` times per year for `tenor` years, starting at T
    // Standard Annuity Formula immediate at T: (1 - (1+r/freq)^(-freq*tenor)) / (r/freq)
    // Then discount back to today: * e^(-r*T)

    // Note: Usually we discount the annuity at the Forward Swap Rate (F) or Risk Free Rate (r)?
    // In Black-76 for Swaptions, the Numeraire is the Annuity PVPB. 
    // We will use 'r' for the discounting consistency.

    const r_periodic = r / freq;
    const n_payments = tenor * freq;

    let annuityAtExpiry = 0;
    if (r === 0) {
      annuityAtExpiry = tenor;
    } else {
      annuityAtExpiry = (1 - Math.pow(1 + r_periodic, -n_payments)) / r_periodic;
      annuityAtExpiry = annuityAtExpiry / freq; // Adjust for frequency (paying 1/freq each time)
    }

    const annuityToday = annuityAtExpiry * Math.exp(-r * T);

    // 2. Black's Variables
    const d1 = (Math.log(F / K) + 0.5 * sigma * sigma * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // 3. Option Pricing
    const isPayer = v.type === 'payer';
    const Nd1 = standardNormalCDF(isPayer ? d1 : -d1);
    const Nd2 = standardNormalCDF(isPayer ? d2 : -d2);
    const sign = isPayer ? 1 : -1;

    // Value = A(0) * [sign * (F * N(sign*d1) - K * N(sign*d2))]
    const valueFactor = sign * (F * standardNormalCDF(sign * d1) - K * standardNormalCDF(sign * d2));
    const premium = v.notional * annuityToday * valueFactor; // Wait, valueFactor is rate diff. A is scaling.

    // Actually typically Black's Model for Swaptions:
    // Payer = A * (F * N(d1) - K * N(d2)) * Notional (implied in A if A is monetary)
    // Our A is unit annuity. So Multiply by Notional? 
    // Usually Annuity factor A is calculated on Notional 1.
    // So Premium = A * (F*N(d1) - K*N(d2)). Wait, F and K are rates.
    // Yes. Rate Diff * Annuity * Notional. 
    // Check units: Rate (0.05) * Annuity (Years approx 4) * Notional (1M) = 0.2 * 1M = 200k. Correct.

    const calculatedPremium = annuityToday * v.notional * (isPayer ? (F * standardNormalCDF(d1) - K * standardNormalCDF(d2)) : (K * standardNormalCDF(-d2) - F * standardNormalCDF(-d1)));

    // Greeks (Approximated)
    // Delta (dV/dF) = A * N(d1) (Payer)
    const delta = isPayer
      ? annuityToday * standardNormalCDF(d1)
      : -annuityToday * standardNormalCDF(-d1);

    // Gamma (d2V/dF2) = A * N'(d1) / (F * sigma * sqrt(T))
    const pdf_d1 = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1);
    const gamma = (annuityToday * pdf_d1) / (F * sigma * Math.sqrt(T));

    // Vega (dV/dSigma) = A * F * sqrt(T) * N'(d1)
    const vega = (annuityToday * F * Math.sqrt(T) * pdf_d1) / 100; // Divide by 100 for 1% vol change

    // Theta (decay) - complex for swaptions, simplified approximation
    const theta = -(F * annuityToday * pdf_d1 * sigma) / (2 * Math.sqrt(T));

    return {
      premium: calculatedPremium,
      premiumPercent: (calculatedPremium / v.notional) * 100,
      annuityFactor: annuityToday,
      d1,
      d2,
      delta,
      gamma,
      vega,
      theta,
      status: calculatedPremium > 0 ? 'Valid' : 'Invalid',
    };
  };

  const getRecommendation = (val: number, type: string) => {
    if (type === 'payer') {
      return 'Premium reflects the cost to hedge against RISING interest rates. Compare this cost against the potential impact of unhedged floating rate debt.';
    }
    return 'Premium reflects the cost to hedge against FALLING interest rates. Useful for asset managers locking in yield on future investments.';
  };

  const getInsights = (val: number, delta: number, vega: number) => {
    const insights = [];
    insights.push(`Break-even: Swap rates must move by >${((val / delta) * 100).toFixed(2)} bps roughly to cover premium.`);
    insights.push(`Delta Exposure: The swaption behaves like a ${(delta * 100).toFixed(1)}% notional forward swap position.`);
    insights.push(`Vega Risk: A 1% increase in volatility increases premium by $${vega.toFixed(0)}.`);
    return insights;
  };

  const getRisks = (vol: number) => {
    const risks = [];
    if (vol > 50) risks.push('High Volatility Regime: Premiums are expensive. Consider collars or swaps instead.');
    risks.push('Model Risk: Assumes log-normal distribution (no negative rates unless using Bachelier).');
    risks.push('Basis Risk: Forward swap rate used may differ from actual realized rate.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      recommendation: getRecommendation(calc.premium, values.type),
      insights: getInsights(calc.premium, calc.delta, calc.vega),
      risks: getRisks(values.volatility)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Pricing Parameters
          </CardTitle>
          <CardDescription>
            Black-76 model inputs for European Swaptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Swaption Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="payer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Payer (Right to Pay Fixed)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="receiver" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Receiver (Right to Receive Fixed)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="notional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Notional Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100000"
                          placeholder="e.g., 10000000"
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
                  name="forwardSwapRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Forward Swap Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 3.50"
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
                  name="strikeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strike Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 3.75"
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
                  name="volatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Volatility (Log-normal %)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 20.0"
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
                        <Landmark className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 4.0"
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
                  name="timeToExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time to Expiry (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.0"
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
                  name="swapTenor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Underlying Swap Tenor
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="Years, e.g. 5"
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
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Annual (1)</SelectItem>
                          <SelectItem value="2">Semi-Annual (2)</SelectItem>
                          <SelectItem value="4">Quarterly (4)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Premium
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
                  <CardTitle>Option Premium</CardTitle>
                  <CardDescription>Estimated Market Value</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {result.premium.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">
                  ({result.premiumPercent.toFixed(3)}% of Notional)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Delta</p>
                  <p className="font-mono font-bold">{result.delta.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Gamma</p>
                  <p className="font-mono font-bold">{result.gamma.toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Vega</p>
                  <p className="font-mono font-bold">{result.vega.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Annuity Factor</p>
                  <p className="font-mono font-bold">{result.annuityFactor.toFixed(4)}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Note:</strong> {result.recommendation}
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
                  Greeks & Metrics
                </CardTitle>
                <CardDescription>Risk Sensitivity Analysis</CardDescription>
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
                <CardDescription>Model Limitations</CardDescription>
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
            Formula: Black-76 Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Payer Premium = A × [F × N(d1) - K × N(d2)]
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Receiver Premium = A × [K × N(-d2) - F × N(-d1)]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Where <strong>A</strong> is the Present Value of the Annuity (Start T, End T+L), <strong>F</strong> is the Forward Swap Rate, <strong>K</strong> is the Strike Rate, and <strong>N(x)</strong> is the cumulative standard normal distribution.
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
            <Link href="/category/finance/swap-valuation-plain-vanilla-interest-rate-swap-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Swap Valuation</p>
                      <p className="text-sm text-muted-foreground">Price underlying swaps</p>
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
                      <p className="text-sm text-muted-foreground">Detailed risk metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/black-scholes-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Black-Scholes</p>
                      <p className="text-sm text-muted-foreground">Standard option model</p>
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
        <meta itemProp="headline" content="Swaption Pricing Guide: Calculating Premiums with Black-76" />
        <meta itemProp="description" content="Master swaption pricing using the Black-76 model. Understand Payer vs. Receiver swaptions, annuity factors, and how volatility impacts premiums." />
        <meta itemProp="keywords" content="swaption pricing calculator, black-76 model, payer swaption, receiver swaption, annuity factor formula, implied volatility, interest rate derivatives" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-09-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Swaption Pricing</h1>
        <p className="text-lg italic text-muted-foreground">Swaptions give institutional investors the option—but not the obligation—to enter into an interest rate swap. They are critical tools for hedging future borrowing costs or speculating on rate volatility.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is a Swaption?</a></li>
          <li><a href="#types" className="hover:underline">Payer vs. Receiver</a></li>
          <li><a href="#model" className="hover:underline">The Black-76 Model</a></li>
          <li><a href="#inputs" className="hover:underline">Key Valuation Inputs</a></li>
          <li><a href="#settlement" className="hover:underline">Cash vs. Physical Settlement</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is a Swaption?</h2>
        <p>
          A <strong>Swaption</strong> (Survival + Option) is an option granting the holder the right to enter into an underlying Interest Rate Swap.
        </p>
        <p className="mt-2">
          Like any option, it has a <strong>Strike Rate</strong>, an <strong>Expiry Date</strong>, and a <strong>Premium</strong> (the upfront cost). The underlying asset is not a stock, but a forward start swap.
        </p>

        <h2 id="types" className="text-2xl font-bold text-foreground pt-8">Payer vs. Receiver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Payer Swaption (Put on Bond)</h4>
            <p className="text-sm">Gives the right to <strong>Pay Fixed</strong> and Receive Floating. Typical buyer: A corporate borrower fearing rising interest rates. If rates rise above Strike, the option is ITM.</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Receiver Swaption (Call on Bond)</h4>
            <p className="text-sm">Gives the right to <strong>Receive Fixed</strong> and Pay Floating. Typical buyer: An asset manager fearing falling rates. If rates fall below Strike, the option is ITM.</p>
          </div>
        </div>

        <h2 id="model" className="text-2xl font-bold text-foreground pt-8">The Black-76 Model</h2>
        <p>
          The standard market model for pricing European swaptions is <strong>Black-76</strong>. It assumes forward swap rates follow a log-normal distribution.
        </p>
        <p className="mt-2">
          The formula requires calculating the <strong>Annuity Factor (A)</strong>, which represents the present value of receiving $1 basis point over the life of the swap. The premium is essentially the expected payoff discounted by this annuity factor.
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">Premium = Annuity × [F N(d1) - K N(d2)]</p>
        </div>

        <h2 id="inputs" className="text-2xl font-bold text-foreground pt-8">Key Valuation Inputs</h2>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Forward Swap Rate (F):</strong> The market rate today for a swap starting at expiry.</li>
          <li><strong>Strike Rate (K):</strong> The rate on the swap you have the right to enter.</li>
          <li><strong>Volatility (σ):</strong> The annualized standard deviation of the forward swap rate. High volatility increases premium significantly (Vega).</li>
          <li><strong>Annuity Factor:</strong> Determined by the Risk-Free Rate and the Tenor of the underlying swap. Longer tenor = Higher Annuity = More Expensive Swaption.</li>
        </ul>

        <h2 id="settlement" className="text-2xl font-bold text-foreground pt-8">Cash vs. Physical Settlement</h2>
        <p>
          Swaptions can be settled in two ways:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Physical:</strong> The parties actually enter into the swap contract upon exercise.</li>
          <li><strong>Cash:</strong> The seller pays the buyer the Net Present Value (NPV) of the underlying swap at the time of exercise. This is common for speculators who don't want the actual swap on their books.</li>
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
            Common questions about Swaption trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are swaptions cheaper than caps/floors?</h4>
              <p className="text-muted-foreground">
                A Swaption is a one-time option on a whole stream of payments. A Cap/Floor is a strip of options on each individual payment. Because swap rates average out volatilities, swaptions are often cheaper than buying a strip of caps.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if interest rates are negative?</h4>
              <p className="text-muted-foreground">
                The standard Black-76 model (log-normal) breaks down with negative rates (can't take log of negative). The market switched to the <strong>Bachelier</strong> or <strong>Normal</strong> model, which assumes normally distributed rates (allowing negatives).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a Bermuda Swaption?</h4>
              <p className="text-muted-foreground">
                A Bermuda swaption can be exercised on a set of specific dates (e.g., every contract anniversary). It is more expensive than a European swaption but cheaper than an American one.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Tenor affect price?</h4>
              <p className="text-muted-foreground">
                A "5y5y" swaption (5-year expiry into 5-year swap) is generally pricier than a "5y2y" swaption because the underlying asset (the annuity) is larger (more payments to hedge).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Vol Cube"?</h4>
              <p className="text-muted-foreground">
                Market makers quote vol based on three dimensions: Expiry (Option life), Tenor (Swap life), and Strike (Moneyness). This 3D matrix is called the Volatility Cube.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Who hedges with Swaptions?</h4>
              <p className="text-muted-foreground">
                Mortgage servicers are huge users. They hold "embedded short receiver swaption" positions (homeowners refinancing when rates drop) and buy Receiver Swaptions to hedge this prepayment risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is Straddle in Swaptions?</h4>
              <p className="text-muted-foreground">
                Buying both a Payer and a Receiver swaption at the same strike. You profit if rates move significantly in EITHER direction (Volatility trade).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is the premium paid upfront?</h4>
              <p className="text-muted-foreground">
                Usually, yes. However, zero-cost collars (buying a payer, selling a receiver) are popular to hedge without upfront cash outlay.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Gamma" in this context?</h4>
              <p className="text-muted-foreground">
                Gamma measures how fast your Delta changes. Near expiry, At-The-Money swaptions have massive Gamma. Traders must re-hedge frequently to avoid losses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I sell a swaption before expiry?</h4>
              <p className="text-muted-foreground">
                Yes, but OTC liquidity is lower than exchange-traded options. You typically unwind it with the original dealer, paying the spread.
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
          <p>The Swaption Pricing Calculator estimates fair premiums for European options on Interest Rate Swaps.</p>
          <p>It utilizes the Black-76 model, accounting for the annuity value of the underlying fixed leg.</p>
          <p>Use this tool to price hedges for future debt issuances or manage interest rate volatility risk.</p>
        </CardContent>
      </Card>
    </div>
  );
}
