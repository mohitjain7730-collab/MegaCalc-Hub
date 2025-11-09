'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  stockPrice: z.number().positive(),
  strikePrice: z.number().positive(),
  timeToExpiry: z.number().positive(),
  riskFreeRate: z.number().nonnegative(),
  volatility: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BlackScholesCalculator() {
  const [result, setResult] = useState<{ 
    callPrice: number;
    putPrice: number;
    interpretation: string; 
    optionLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stockPrice: undefined,
      strikePrice: undefined,
      timeToExpiry: undefined,
      riskFreeRate: undefined,
      volatility: undefined,
    },
  });

  // Standard normal cumulative distribution function approximation
  const normCDF = (x: number) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  };

  const calculateBlackScholes = (v: FormValues) => {
    if (v.stockPrice == null || v.strikePrice == null || v.timeToExpiry == null || v.riskFreeRate == null || v.volatility == null) return null;
    
    const S = v.stockPrice;
    const K = v.strikePrice;
    const T = v.timeToExpiry / 365; // Convert days to years
    const r = v.riskFreeRate / 100; // Convert percentage to decimal
    const sigma = v.volatility / 100; // Convert percentage to decimal

    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    const callPrice = S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
    const putPrice = K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);

    return { callPrice, putPrice };
  };

  const interpret = (callPrice: number, putPrice: number, stockPrice: number, strikePrice: number) => {
    const intrinsicValueCall = Math.max(0, stockPrice - strikePrice);
    const intrinsicValuePut = Math.max(0, strikePrice - stockPrice);
    const timeValueCall = callPrice - intrinsicValueCall;
    const timeValuePut = putPrice - intrinsicValuePut;

    if (timeValueCall > stockPrice * 0.1 || timeValuePut > stockPrice * 0.1) {
      return 'High time value - options have significant extrinsic value and are sensitive to volatility and time decay.';
    } else if (timeValueCall > stockPrice * 0.05 || timeValuePut > stockPrice * 0.05) {
      return 'Moderate time value - options have reasonable extrinsic value with balanced risk-return profile.';
    } else {
      return 'Low time value - options are close to intrinsic value with minimal extrinsic premium.';
    }
  };

  const getOptionLevel = (callPrice: number, putPrice: number) => {
    const avgPrice = (callPrice + putPrice) / 2;
    if (avgPrice >= 50) return 'High';
    if (avgPrice >= 20) return 'Moderate';
    if (avgPrice >= 5) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (callPrice: number, putPrice: number, stockPrice: number, strikePrice: number) => {
    const intrinsicValueCall = Math.max(0, stockPrice - strikePrice);
    const intrinsicValuePut = Math.max(0, strikePrice - stockPrice);
    
    if (callPrice > intrinsicValueCall * 2) {
      return 'Consider selling calls or buying puts - high extrinsic value suggests overpricing.';
    } else if (putPrice > intrinsicValuePut * 2) {
      return 'Consider selling puts or buying calls - high extrinsic value suggests overpricing.';
    } else {
      return 'Options appear fairly priced - consider your market outlook and risk tolerance.';
    }
  };

  const getStrength = (callPrice: number, putPrice: number) => {
    const avgPrice = (callPrice + putPrice) / 2;
    if (avgPrice >= 50) return 'Strong';
    if (avgPrice >= 20) return 'Good';
    if (avgPrice >= 5) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (callPrice: number, putPrice: number, stockPrice: number, strikePrice: number) => {
    const insights = [];
    const intrinsicValueCall = Math.max(0, stockPrice - strikePrice);
    const intrinsicValuePut = Math.max(0, strikePrice - stockPrice);
    const timeValueCall = callPrice - intrinsicValueCall;
    const timeValuePut = putPrice - intrinsicValuePut;

    if (timeValueCall > stockPrice * 0.1) {
      insights.push('High call option time value');
      insights.push('Significant volatility premium');
      insights.push('Sensitive to time decay');
    } else {
      insights.push('Moderate call option time value');
      insights.push('Reasonable volatility premium');
      insights.push('Balanced time sensitivity');
    }

    if (timeValuePut > stockPrice * 0.1) {
      insights.push('High put option time value');
      insights.push('Significant downside protection');
      insights.push('Volatility-driven pricing');
    } else {
      insights.push('Moderate put option time value');
      insights.push('Reasonable downside protection');
      insights.push('Stable pricing');
    }

    return insights;
  };

  const getConsiderations = (callPrice: number, putPrice: number) => {
    const considerations = [];
    considerations.push('Black-Scholes assumes constant volatility');
    considerations.push('Model assumes efficient markets');
    considerations.push('Time decay accelerates as expiration approaches');
    considerations.push('Volatility changes significantly affect option prices');
    considerations.push('Consider transaction costs and bid-ask spreads');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const prices = calculateBlackScholes(values);
    if (prices !== null) {
      setResult({
        callPrice: prices.callPrice,
        putPrice: prices.putPrice,
        interpretation: interpret(prices.callPrice, prices.putPrice, values.stockPrice, values.strikePrice),
        optionLevel: getOptionLevel(prices.callPrice, prices.putPrice),
        recommendation: getRecommendation(prices.callPrice, prices.putPrice, values.stockPrice, values.strikePrice),
        strength: getStrength(prices.callPrice, prices.putPrice),
        insights: getInsights(prices.callPrice, prices.putPrice, values.stockPrice, values.strikePrice),
        considerations: getConsiderations(prices.callPrice, prices.putPrice)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Option Pricing – Black-Scholes Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate theoretical option prices using the Black-Scholes model for call and put options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="stockPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Current Stock Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter stock price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="strikePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Strike Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter strike price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeToExpiry" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Time to Expiry (Days)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter days to expiry" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Risk-Free Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter risk-free rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volatility" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Volatility (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter volatility" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Option Prices
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle>Black-Scholes Option Prices</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.optionLevel === 'High' ? 'default' : result.optionLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.optionLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      ${result.callPrice.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Call Option Price</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      ${result.putPrice.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Put Option Price</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle>Insights & Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths & Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Important Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other essential financial metrics for comprehensive options analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/capm-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">CAPM</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Black-Scholes-Merton (BSM) Option Pricing Model, Formula, and Variables" />
    <meta itemProp="description" content="An expert guide detailing the Black-Scholes-Merton (BSM) formula, its core role in pricing European options (calls and puts), the function of each input variable (volatility, time, strike price), and its application in financial risk management." />
    <meta itemProp="keywords" content="black scholes model formula explained, option pricing theory, calculating call option price, put option price black scholes, implied volatility options, risk-free rate options pricing" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-black-scholes-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Black-Scholes-Merton Model: Option Pricing Theory</h1>
    <p className="text-lg italic text-muted-foreground">Master the Nobel Prize-winning formula that calculates the theoretical fair value of a European option by relating price, risk, and time.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">Black-Scholes: Core Purpose and Assumptions</a></li>
        <li><a href="#formula" className="hover:underline">The Black-Scholes Formula Components</a></li>
        <li><a href="#inputs" className="hover:underline">The Five Critical Input Variables</a></li>
        <li><a href="#implied-vol" className="hover:underline">Implied Volatility and the Volatility Surface</a></li>
        <li><a href="#applications" className="hover:underline">Model Applications and Limitations</a></li>
    </ul>
<hr />

    {/* BLACK-SCHOLES: CORE PURPOSE AND ASSUMPTIONS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Black-Scholes: Core Purpose and Assumptions</h2>
    <p>The **Black-Scholes-Merton (BSM) Model** is a differential equation model used to price European-style call and put options. It establishes the relationship between an option's price and the factors that influence its potential payoff. The model assumes that the options are priced efficiently and that there are no arbitrage opportunities in the market.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Model Assumptions</h3>
    <p>The BSM model relies on several core, simplified assumptions:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>The option is European-style (can only be exercised at expiration).</li>
        <li>The risk-free rate ($R_f$) and volatility ($\sigma$) are constant over the option's life.</li>
        <li>The stock price follows a lognormal distribution (it moves randomly).</li>
        <li>There are no transaction costs or taxes.</li>
    </ul>

<hr />

    {/* THE BLACK-SCHOLES FORMULA COMPONENTS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Black-Scholes Formula Components</h2>
    <p>The model calculates the value of an option by discounting the expected payoff at expiration. The two main components are the call price ($C$) and the put price ($P$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Black-Scholes Call Price Formula</h3>
    <p>The call price ($C$) is calculated as the present value of receiving the stock at expiration if the option is in the money, minus the present value of paying the strike price if the option is in the money:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'C = S * N(d1) - X * e^(-rT) * N(d2)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Black-Scholes Put Price Formula (Put-Call Parity)</h3>
    <p>The put price ($P$) is derived from the **Put-Call Parity** principle, which defines the relationship between the call and put options and the underlying stock price ($S$).</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'P = X * e^(-rT) * N(-d2) - S * N(-d1)'}
        </p>
    </div>
    <p>Where $N(d1)$ and $N(d2)$ are cumulative standard normal distribution functions representing the probability that the option will expire in the money.</p>

<hr />

    {/* THE FIVE CRITICAL INPUT VARIABLES */}
    <h2 id="inputs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Five Critical Input Variables</h2>
    <p>The BSM model requires five inputs, each of which has a distinct effect on the final option price.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Current Stock Price ($S$)</h3>
    <p>The price of the underlying asset. A higher stock price increases the value of the Call option (higher probability of expiring in the money) and decreases the value of the Put option.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Option Strike Price ($X$)</h3>
    <p>The price at which the asset can be bought or sold. A higher strike price decreases the value of the Call option and increases the value of the Put option.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Time to Expiration ($T$)</h3>
    <p>The time remaining until the option expires (expressed as a fraction of a year). A longer time to expiration increases the value of both Calls and Puts because it increases the probability of extreme price movements (volatility) before the contract ends.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Risk-Free Rate ($r$)</h3>
    <p>The theoretical rate of return on an investment with no risk (typically the yield on a Treasury security). An increase in the risk-free rate increases the Call value (due to discounting) and decreases the Put value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Volatility ($\sigma$)</h3>
    <p>**Volatility** is the annualized standard deviation of the stock's returns. This is the only input that is not directly observable. An increase in expected volatility increases the value of both Calls and Puts because the option owner benefits from extreme price moves in either direction.</p>

<hr />

    {/* IMPLIED VOLATILITY AND THE VOLATILITY SURFACE */}
    <h2 id="implied-vol" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Implied Volatility and the Volatility Surface</h2>
    <p>Since the volatility ($\sigma$) input is not directly observable, it is often derived backward from the current market price of the option. This derived measure is called **Implied Volatility (IV)**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Implied Volatility Concept</h3>
    <p>Implied Volatility is the market's forecast of the stock's future volatility over the life of the option. It represents the uncertainty priced into the option. If an option is trading for more than its BSM price, the implied volatility is higher than the historical volatility, meaning the market expects riskier price action.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Volatility Smile and Skew</h3>
    <p>The BSM model assumes volatility is constant across all strike prices and maturities. In reality, the market violates this assumption, giving rise to the **Volatility Surface**. The **Volatility Smile** refers to the observation that options far "out-of-the-money" (low strike Calls, high strike Puts) trade with higher implied volatility than "at-the-money" options, indicating that the market anticipates greater risk from extreme price moves.</p>

<hr />

    {/* MODEL APPLICATIONS AND LIMITATIONS */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Model Applications and Limitations</h2>
    <p>The BSM model, despite its simplifying assumptions, remains the most important tool for option market pricing and risk management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Applications</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Pricing:** Calculating the theoretical fair value of new options or complex derivatives.</li>
        <li>**Hedging (Greeks):** The BSM model is used to calculate the **Option Greeks** (Delta, Gamma, Vega, Theta), which are measures of risk and sensitivity essential for portfolio hedging.</li>
        <li>**Market Efficiency:** The difference between the BSM price and the actual market price can signal potential mispricings or opportunities.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <p>The model's limitations stem from its assumptions:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>It cannot accurately price American options (which can be exercised before expiration).</li>
        <li>It assumes rates and volatility are constant, which is untrue in reality.</li>
        <li>It assumes continuous trading with no transaction costs.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Black-Scholes-Merton Model is the foundational framework for option pricing, defining the theoretical value of a contract based on five inputs: the **Current Price**, **Strike Price**, **Time**, **Risk-Free Rate**, and **Volatility**.</p>
    <p>While the model provides a precise fair value, its practical use involves reversing the formula to derive **Implied Volatility**—the market's consensus forecast of future risk, which is the most active and speculative component of option pricing.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Black-Scholes Model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Black-Scholes model?</h4>
              <p className="text-muted-foreground">
                The Black-Scholes model is a mathematical formula for pricing European-style options. It calculates theoretical option prices based on five inputs: current stock price, strike price, time to expiration, risk-free rate, and volatility. The model assumes constant volatility, efficient markets, and no dividends.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate Black-Scholes option prices?</h4>
              <p className="text-muted-foreground">
                The Black-Scholes formula uses complex mathematical functions including the cumulative normal distribution. For calls: C = S×N(d1) - K×e^(-rT)×N(d2). For puts: P = K×e^(-rT)×N(-d2) - S×N(-d1). Where d1 and d2 are calculated using stock price, strike price, time, risk-free rate, and volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the key assumptions of Black-Scholes?</h4>
              <p className="text-muted-foreground">
                Key assumptions include: constant volatility, efficient markets, no transaction costs, continuous trading, constant risk-free rate, no dividends, and log-normal distribution of stock prices. These assumptions often don't hold in real markets, which is why actual option prices may differ from theoretical values.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does volatility affect option prices?</h4>
              <p className="text-muted-foreground">
                Volatility is a key driver of option prices. Higher volatility increases option prices because it increases the probability of large price movements, which benefits option holders. Lower volatility decreases option prices. This relationship is captured in the "vega" of an option, which measures sensitivity to volatility changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is time decay in options?</h4>
              <p className="text-muted-foreground">
                Time decay (theta) refers to the reduction in option value as time passes, all else being equal. Options lose value as they approach expiration because there's less time for favorable price movements. Time decay accelerates as expiration approaches, especially for out-of-the-money options.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret Black-Scholes results?</h4>
              <p className="text-muted-foreground">
                Compare theoretical prices to market prices to identify potential opportunities. If market prices are higher than theoretical prices, options may be overpriced. If lower, they may be underpriced. Consider the model's limitations and use results as a starting point for analysis, not definitive pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Black-Scholes?</h4>
              <p className="text-muted-foreground">
                Limitations include: assumes constant volatility (volatility smile), no early exercise for American options, no dividends, efficient markets, and log-normal price distribution. Real markets exhibit volatility clustering, jumps, and other complexities not captured by the model. Use with caution and consider market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use Black-Scholes for trading?</h4>
              <p className="text-muted-foreground">
                Use Black-Scholes to identify potentially mispriced options, understand option sensitivities (Greeks), and develop trading strategies. Compare theoretical prices to market prices, analyze implied volatility, and consider the model's limitations. Combine with fundamental and technical analysis for comprehensive trading decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the Greeks in options?</h4>
              <p className="text-muted-foreground">
                The Greeks measure option sensitivities: Delta (price sensitivity), Gamma (delta sensitivity), Theta (time decay), Vega (volatility sensitivity), and Rho (interest rate sensitivity). These help traders understand how option prices change with underlying factors and manage risk effectively.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is Black-Scholes important for risk management?</h4>
              <p className="text-muted-foreground">
                Black-Scholes helps risk managers understand option exposures, calculate portfolio Greeks, and assess risk metrics. It provides a framework for valuing complex derivatives and understanding the factors that drive option prices. While not perfect, it's a fundamental tool for options risk management and portfolio analysis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}