'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  stockPrice: z.number().positive(),
  strikePrice: z.number().positive(),
  timeToExpiry: z.number().positive(),
  riskFreeRate: z.number().nonnegative(),
  volatility: z.number().positive(),
  steps: z.number().min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function BinomialOptionPricingCalculator() {
  const [result, setResult] = useState<{ 
    callPrice: number;
    putPrice: number;
    interpretation: string; 
    accuracyLevel: string;
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
      steps: 10,
    },
  });

  const calculateBinomialPricing = (v: FormValues) => {
    if (v.stockPrice == null || v.strikePrice == null || v.timeToExpiry == null || v.riskFreeRate == null || v.volatility == null) return null;
    
    const S = v.stockPrice;
    const K = v.strikePrice;
    const T = v.timeToExpiry / 365; // Convert days to years
    const r = v.riskFreeRate / 100; // Convert percentage to decimal
    const sigma = v.volatility / 100; // Convert percentage to decimal
    const n = v.steps;

    const dt = T / n;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp(r * dt) - d) / (u - d);

    // Create binomial tree for stock prices
    const stockPrices = [];
    for (let i = 0; i <= n; i++) {
      stockPrices[i] = S * Math.pow(u, n - i) * Math.pow(d, i);
    }

    // Calculate option values at expiration
    const callValues = [];
    const putValues = [];
    for (let i = 0; i <= n; i++) {
      callValues[i] = Math.max(0, stockPrices[i] - K);
      putValues[i] = Math.max(0, K - stockPrices[i]);
    }

    // Backward induction for call option
    for (let j = n - 1; j >= 0; j--) {
      for (let i = 0; i <= j; i++) {
        callValues[i] = Math.exp(-r * dt) * (p * callValues[i] + (1 - p) * callValues[i + 1]);
      }
    }

    // Backward induction for put option
    for (let j = n - 1; j >= 0; j--) {
      for (let i = 0; i <= j; i++) {
        putValues[i] = Math.exp(-r * dt) * (p * putValues[i] + (1 - p) * putValues[i + 1]);
      }
    }

    return { callPrice: callValues[0], putPrice: putValues[0] };
  };

  const interpret = (callPrice: number, putPrice: number, steps: number) => {
    if (steps >= 50) return 'High accuracy binomial pricing with detailed tree structure and precise option valuation.';
    if (steps >= 20) return 'Good accuracy binomial pricing with reasonable tree structure for option valuation.';
    if (steps >= 10) return 'Moderate accuracy binomial pricing with basic tree structure for option valuation.';
    return 'Basic binomial pricing with simple tree structure - consider increasing steps for better accuracy.';
  };

  const getAccuracyLevel = (steps: number) => {
    if (steps >= 50) return 'High';
    if (steps >= 20) return 'Good';
    if (steps >= 10) return 'Moderate';
    return 'Basic';
  };

  const getRecommendation = (steps: number, callPrice: number, putPrice: number) => {
    if (steps < 20) return 'Consider increasing the number of steps for more accurate pricing.';
    if (callPrice > putPrice * 2) return 'Call option significantly more expensive - verify market conditions and volatility.';
    if (putPrice > callPrice * 2) return 'Put option significantly more expensive - verify market conditions and volatility.';
    return 'Binomial pricing appears reasonable - compare with market prices and other models.';
  };

  const getStrength = (steps: number) => {
    if (steps >= 50) return 'Very Strong';
    if (steps >= 20) return 'Strong';
    if (steps >= 10) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (callPrice: number, putPrice: number, steps: number) => {
    const insights = [];
    if (steps >= 50) {
      insights.push('High precision pricing model');
      insights.push('Detailed tree structure');
      insights.push('Accurate option valuation');
    } else if (steps >= 20) {
      insights.push('Good precision pricing model');
      insights.push('Reasonable tree structure');
      insights.push('Reliable option valuation');
    } else {
      insights.push('Basic pricing model');
      insights.push('Simple tree structure');
      insights.push('Fundamental option valuation');
    }

    if (callPrice > putPrice) {
      insights.push('Call options more expensive');
      insights.push('Bullish market sentiment');
    } else {
      insights.push('Put options more expensive');
      insights.push('Bearish market sentiment');
    }

    return insights;
  };

  const getConsiderations = (steps: number) => {
    const considerations = [];
    considerations.push('More steps provide higher accuracy but slower calculation');
    considerations.push('Binomial model assumes discrete price movements');
    considerations.push('Model converges to Black-Scholes as steps increase');
    considerations.push('Consider computational efficiency vs accuracy trade-off');
    considerations.push('Verify results against market prices and other models');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const prices = calculateBinomialPricing(values);
    if (prices !== null) {
      setResult({
        callPrice: prices.callPrice,
        putPrice: prices.putPrice,
        interpretation: interpret(prices.callPrice, prices.putPrice, values.steps),
        accuracyLevel: getAccuracyLevel(values.steps),
        recommendation: getRecommendation(values.steps, prices.callPrice, prices.putPrice),
        strength: getStrength(values.steps),
        insights: getInsights(prices.callPrice, prices.putPrice, values.steps),
        considerations: getConsiderations(values.steps)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Binomial Option Pricing Model Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate theoretical option prices using the binomial tree model with customizable steps
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
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Number of Steps
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter number of steps" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Binomial Option Prices
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
                  <CardTitle>Binomial Option Pricing Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.accuracyLevel === 'High' ? 'default' : result.accuracyLevel === 'Good' ? 'secondary' : 'destructive'}>
                    {result.accuracyLevel}
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
            <Link href="/category/finance/black-scholes-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Black-Scholes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/option-payoff-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Option Payoff</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/monte-carlo-portfolio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Monte Carlo</p>
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
            Complete Guide to Binomial Option Pricing
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting binomial option pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Binomial Option Pricing Model is a discrete-time model that values options by creating a binomial tree of possible stock prices. It assumes the stock price can move up or down by specific factors in each time period, allowing for more realistic modeling of discrete price movements compared to continuous models.
          </p>
          <p className="text-muted-foreground">
            This model is particularly useful for American options (which can be exercised early), dividend-paying stocks, and situations where the Black-Scholes assumptions don't hold. The model converges to Black-Scholes pricing as the number of steps increases, providing a bridge between discrete and continuous models.
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
            Common questions about Binomial Option Pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Binomial Option Pricing Model?</h4>
              <p className="text-muted-foreground">
                The Binomial Option Pricing Model is a discrete-time model that values options by creating a binomial tree of possible stock prices. It assumes the stock price can move up or down by specific factors in each time period, allowing for more realistic modeling of discrete price movements compared to continuous models like Black-Scholes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the binomial model work?</h4>
              <p className="text-muted-foreground">
                The binomial model creates a tree where each node represents a possible stock price at a given time. Starting from the current price, the tree branches into "up" and "down" movements. Option values are calculated at expiration, then worked backward through the tree using risk-neutral probabilities to find the current option price.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the advantages of binomial pricing?</h4>
              <p className="text-muted-foreground">
                Advantages include: ability to handle American options (early exercise), flexibility with dividend payments, more realistic discrete price movements, convergence to Black-Scholes as steps increase, and ability to model complex option features. It's particularly useful when Black-Scholes assumptions don't hold.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How many steps should I use?</h4>
              <p className="text-muted-foreground">
                More steps provide higher accuracy but slower calculation. Generally, 20-50 steps provide good accuracy for most purposes. For very accurate pricing, use 100+ steps. The model converges to Black-Scholes as steps approach infinity. Balance accuracy needs with computational efficiency.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does binomial compare to Black-Scholes?</h4>
              <p className="text-muted-foreground">
                Binomial is more flexible and realistic for discrete markets, while Black-Scholes assumes continuous trading. Binomial can handle American options and dividends, while Black-Scholes is limited to European options. As binomial steps increase, it converges to Black-Scholes pricing. Both have their place in options analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the key parameters in binomial pricing?</h4>
              <p className="text-muted-foreground">
                Key parameters include: current stock price, strike price, time to expiration, risk-free rate, volatility, and number of steps. The model calculates up/down factors and risk-neutral probabilities from these inputs. Each parameter significantly affects the final option price and should be carefully estimated.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret binomial pricing results?</h4>
              <p className="text-muted-foreground">
                Compare binomial results to market prices and other models. Higher step counts generally provide more accurate results. If results differ significantly from market prices, check input parameters, especially volatility estimates. Use binomial pricing as one tool among many for option valuation.
              </p>
            </div>
            
                 <div>
              <h4 className="font-semibold text-lg mb-3">Can binomial pricing handle dividends?</h4>
              <p className="text-muted-foreground">
                Yes, the binomial model can easily incorporate dividend payments by adjusting stock prices at dividend dates. This is a significant advantage over Black-Scholes, which requires modifications to handle dividends. The model can handle both discrete and continuous dividend payments.
              </p>
                </div>
            
                <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of binomial pricing?</h4>
              <p className="text-muted-foreground">
                Limitations include: computational complexity with many steps, assumption of constant volatility, discrete time periods may not reflect continuous trading, and convergence issues with extreme parameters. The model also assumes risk-neutral pricing, which may not hold in all market conditions.
              </p>
                </div>
            
                 <div>
              <h4 className="font-semibold text-lg mb-3">How do I use binomial pricing for trading?</h4>
              <p className="text-muted-foreground">
                Use binomial pricing to identify potentially mispriced options, understand option sensitivities, and develop trading strategies. Compare theoretical prices to market prices, analyze the impact of different parameters, and consider the model's limitations. Combine with other analysis methods for comprehensive trading decisions.
              </p>
            </div>
                </div>
        </CardContent>
      </Card>
    </div>
  );
}