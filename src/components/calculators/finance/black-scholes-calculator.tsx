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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Black-Scholes Model
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting Black-Scholes option prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Black-Scholes model is a mathematical model for pricing European-style options. It calculates theoretical option prices based on five key inputs: current stock price, strike price, time to expiration, risk-free rate, and volatility. The model assumes constant volatility, efficient markets, and no dividends.
          </p>
          <p className="text-muted-foreground">
            Understanding Black-Scholes pricing is essential for options traders, risk managers, and financial analysts. While the model has limitations, it provides a foundation for option valuation and helps traders understand the factors that influence option prices, including time decay, volatility, and intrinsic value.
          </p>
        </CardContent>
      </Card>

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