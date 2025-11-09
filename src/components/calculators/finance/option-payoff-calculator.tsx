'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  optionType: z.enum(['call', 'put']),
  strikePrice: z.number().positive(),
  premium: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OptionPayoffCalculator() {
  const [result, setResult] = useState<{ 
    chartData: any[];
    breakEven: number;
    maxProfit: number;
    maxLoss: number;
    interpretation: string; 
    riskLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      optionType: 'call',
      strikePrice: undefined,
      premium: undefined,
    },
  });

  const calculatePayoff = (v: FormValues) => {
    if (v.strikePrice == null || v.premium == null) return null;
    
    const chartData = [];
    const breakEven = v.optionType === 'call' ? v.strikePrice + v.premium : v.strikePrice - v.premium;
    const range = v.strikePrice * 0.4;
    
    for (let i = 0; i <= 20; i++) {
      const underlyingPrice = v.strikePrice - range + (i * (range * 2 / 20));
      let profit = 0;
      if (v.optionType === 'call') {
        profit = Math.max(0, underlyingPrice - v.strikePrice) - v.premium;
      } else {
        profit = Math.max(0, v.strikePrice - underlyingPrice) - v.premium;
      }
      
      chartData.push({
        underlyingPrice: underlyingPrice.toFixed(2),
        profit: profit.toFixed(2),
        underlyingPriceNum: underlyingPrice,
        profitNum: profit
      });
    }

    const maxProfit = v.optionType === 'call' ? Infinity : v.strikePrice - v.premium;
    const maxLoss = v.premium;

    return { chartData, breakEven, maxProfit, maxLoss };
  };

  const interpret = (optionType: string, maxProfit: number, maxLoss: number, breakEven: number) => {
    if (optionType === 'call') {
      if (maxLoss > breakEven * 0.1) return 'High-risk call option with significant premium cost and unlimited upside potential.';
      return 'Moderate-risk call option with reasonable premium and good upside potential.';
    } else {
      if (maxLoss > breakEven * 0.1) return 'High-risk put option with significant premium cost and limited upside potential.';
      return 'Moderate-risk put option with reasonable premium and good downside protection.';
    }
  };

  const getRiskLevel = (optionType: string, maxLoss: number, strikePrice: number) => {
    const lossRatio = maxLoss / strikePrice;
    if (lossRatio > 0.1) return 'High';
    if (lossRatio > 0.05) return 'Moderate';
    return 'Low';
  };

  const getRecommendation = (optionType: string, maxLoss: number, strikePrice: number) => {
    const lossRatio = maxLoss / strikePrice;
    if (optionType === 'call') {
      if (lossRatio > 0.1) return 'Consider if you have strong bullish conviction - high premium requires significant move.';
      return 'Suitable for moderate bullish outlook with reasonable risk-reward profile.';
    } else {
      if (lossRatio > 0.1) return 'Consider if you have strong bearish conviction - high premium requires significant move.';
      return 'Suitable for moderate bearish outlook with reasonable risk-reward profile.';
    }
  };

  const getStrength = (optionType: string, maxLoss: number, strikePrice: number) => {
    const lossRatio = maxLoss / strikePrice;
    if (lossRatio > 0.1) return 'Weak';
    if (lossRatio > 0.05) return 'Moderate';
    return 'Strong';
  };

  const getInsights = (optionType: string, maxProfit: number, maxLoss: number, breakEven: number) => {
    const insights = [];
    if (optionType === 'call') {
      insights.push('Unlimited upside potential');
      insights.push('Limited downside to premium paid');
      insights.push('Bullish market outlook required');
      insights.push('Time decay works against position');
    } else {
      insights.push('Limited upside potential');
      insights.push('Downside protection up to strike price');
      insights.push('Bearish market outlook required');
      insights.push('Time decay works against position');
    }
    return insights;
  };

  const getConsiderations = (optionType: string) => {
    const considerations = [];
    considerations.push('Options have expiration dates');
    considerations.push('Time decay accelerates as expiration approaches');
    considerations.push('Volatility changes affect option prices');
    considerations.push('Consider transaction costs and bid-ask spreads');
    considerations.push('Monitor underlying asset price movements');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const payoff = calculatePayoff(values);
    if (payoff !== null) {
      setResult({
        chartData: payoff.chartData,
        breakEven: payoff.breakEven,
        maxProfit: payoff.maxProfit,
        maxLoss: payoff.maxLoss,
        interpretation: interpret(values.optionType, payoff.maxProfit, payoff.maxLoss, payoff.breakEven),
        riskLevel: getRiskLevel(values.optionType, payoff.maxLoss, values.strikePrice),
        recommendation: getRecommendation(values.optionType, payoff.maxLoss, values.strikePrice),
        strength: getStrength(values.optionType, payoff.maxLoss, values.strikePrice),
        insights: getInsights(values.optionType, payoff.maxProfit, payoff.maxLoss, payoff.breakEven),
        considerations: getConsiderations(values.optionType)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Put / Call Option Payoff Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate option payoffs and visualize profit/loss scenarios for call and put options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="optionType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Option Type
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="call" id="call" />
                        <label htmlFor="call">Call Option</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="put" id="put" />
                        <label htmlFor="put">Put Option</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="strikePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Strike Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter strike price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="premium" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Premium Paid ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter premium" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Option Payoff
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
                  <CardTitle>Option Payoff Analysis</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Low' ? 'default' : result.riskLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.breakEven.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Break-Even Price</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.maxProfit === Infinity ? '∞' : `$${result.maxProfit.toFixed(2)}`}
                    </div>
                    <p className="text-sm text-muted-foreground">Maximum Profit</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      ${result.maxLoss.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Maximum Loss</p>
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
            <Link href="/category/finance/binomial-option-pricing-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Binomial Pricing</p>
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
            <Link href="/category/finance/value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Value at Risk</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Put and Call Option Payoff Calculation and Profit/Loss Analysis" />
    <meta itemProp="description" content="An expert guide detailing the payoff formulas for long and short call/put options, the concept of intrinsic value, break-even points, and how to graphically analyze the profit and loss profiles of option contracts at expiration." />
    <meta itemProp="keywords" content="call option payoff formula, put option payoff calculation, intrinsic value options explained, option break-even price, long call vs short put payoff, options expiration profit loss graph" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-option-payoff-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Put and Call Option Payoff: Understanding Profit and Loss at Expiration</h1>
    <p className="text-lg italic text-muted-foreground">Master the fundamental formulas that quantify the gain or loss of an option contract based on the underlying asset's price at expiration.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#basics" className="hover:underline">Option Basics: Definitions, Strike Price, and Premium</a></li>
        <li><a href="#call-payoff" className="hover:underline">Call Option Payoff (Long and Short)</a></li>
        <li><a href="#put-payoff" className="hover:underline">Put Option Payoff (Long and Short)</a></li>
        <li><a href="#intrinsic" className="hover:underline">Intrinsic Value and Moneyness</a></li>
        <li><a href="#breakeven" className="hover:underline">Calculating the Break-Even Price</a></li>
    </ul>
<hr />

    {/* OPTION BASICS: DEFINITIONS, STRIKE PRICE, AND PREMIUM */}
    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Option Basics: Definitions, Strike Price, and Premium</h2>
    <p>An **Option** is a contract that gives the holder the right, but not the obligation, to buy or sell an underlying asset (like a stock) at a specific price on or before a specific date.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Terminology</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Strike Price (X):</strong> The fixed price at which the asset can be bought or sold (the exercise price).</li>
        <li><strong className="font-semibold">Expiration Date:</strong> The date the option contract expires, after which it is worthless.</li>
        <li><strong className="font-semibold">Premium:</strong> The upfront price paid by the buyer to the seller (writer) for the option contract. This is the maximum loss for the buyer.</li>
        <li><strong className="font-semibold">Underlying Price (S_T):</strong> The price of the asset at the expiration time (T).</li>
    </ul>

<hr />

    {/* CALL OPTION PAYOFF (LONG AND SHORT) */}
    <h2 id="call-payoff" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Call Option Payoff (Long and Short)</h2>
    <p>A **Call Option** grants the holder the right to *buy* the underlying asset at the strike price (X). Buyers profit when the market price ($S_T$) is above the strike price.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Long Call (Buying the Call)</h3>
    <p>The buyer pays the premium and seeks upward movement in the stock price. The potential profit is theoretically unlimited, and the maximum loss is limited to the premium paid.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Long Call Payoff = Max(0, S_T - X) - Premium'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Short Call (Selling the Call)</h3>
    <p>The seller receives the premium upfront but takes on the obligation to sell the asset at the strike price. The maximum gain is limited to the premium received, and the potential loss is theoretically unlimited.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Short Call Payoff = Premium - Max(0, S_T - X)'}
        </p>
    </div>

<hr />

    {/* PUT OPTION PAYOFF (LONG AND SHORT) */}
    <h2 id="put-payoff" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Put Option Payoff (Long and Short)</h2>
    <p>A **Put Option** grants the holder the right to *sell* the underlying asset at the strike price (X). Buyers profit when the market price ($S_T$) is below the strike price.</p>
    

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Long Put (Buying the Put)</h3>
    <p>The buyer pays the premium and seeks downward movement in the stock price. The potential profit is substantial (limited by $S_T$ hitting zero), and the maximum loss is limited to the premium paid.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Long Put Payoff = Max(0, X - S_T) - Premium'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Short Put (Selling the Put)</h3>
    <p>The seller receives the premium upfront but takes on the obligation to buy the asset at the strike price. The maximum gain is limited to the premium received, and the potential loss is substantial (limited by $S_T$ hitting zero).</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Short Put Payoff = Premium - Max(0, X - S_T)'}
        </p>
    </div>

<hr />

    {/* INTRINSIC VALUE AND MONEYNESS */}
    <h2 id="intrinsic" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Intrinsic Value and Moneyness</h2>
    <p>The **Intrinsic Value** of an option is the immediate profit the option would yield if exercised today. It is always a non-negative value (zero or greater).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Intrinsic Value Calculation</h3>
    <ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">Call Intrinsic Value:</strong> Max(0, S_T - X)</li>
    <li><strong className="font-semibold">Put Intrinsic Value:</strong> Max(0, X - S_T)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Moneyness Status at Expiration</h3>
    <p>The profitability of the option (before accounting for premium) is determined by its moneyness status relative to the strike price (X):</p>
    <table className="min-w-full divide-y divide-border border border-border my-4">
        <thead className="bg-muted">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Moneyness</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Call Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Put Condition</th>
            </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">In the Money (ITM)</strong></td>
                <td className="px-6 py-4">S_T &gt; X</td>
                <td className="px-6 py-4">S_T &lt; X</td>
            </tr>
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">At the Money (ATM)</strong></td>
                <td className="px-6 py-4">S_T = X</td>
                <td className="px-6 py-4">S_T = X</td>
            </tr>
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">Out of the Money (OTM)</strong></td>
                <td className="px-6 py-4">S_T &lt; X</td>
                <td className="px-6 py-4">S_T &gt; X</td>
            </tr>
        </tbody>
    </table>
    <p>Only ITM options have positive intrinsic value at expiration; ATM and OTM options expire worthless.</p>

<hr />

    {/* CALCULATING THE BREAK-EVEN PRICE */}
    <h2 id="breakeven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Break-Even Price</h2>
    <p>The **Break-Even Price** is the underlying stock price ($S_T$) at which the option's profit is exactly zero, meaning the gain from the price movement equals the initial premium paid.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Break-Even Price Formulas</h3>
    <p>The break-even price determines the minimal price movement required for the trade to be profitable for the option buyer.</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Long Call Break-Even:</strong> Strike Price + Premium</li>
        <li><strong className="font-semibold">Long Put Break-Even:</strong> Strike Price - Premium</li>
    </ul>
    <p>For option sellers (Short Call/Short Put), the break-even is identical, representing the point where they begin to lose money.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Option payoff analysis quantifies the net profit or loss of a contract by determining the <strong className="font-semibold">Intrinsic Value</strong> (Max(0, ...)) at expiration and adjusting for the <strong className="font-semibold">Premium</strong> paid or received.</p>
    <p>The payoff formulas reveal the core risk structure: option buyers face limited loss (the premium) and either unlimited (Call) or substantial (Put) profit potential. Option sellers face limited gain (the premium) and the corresponding large risk potential.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Option Payoffs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is an option payoff?</h4>
              <p className="text-muted-foreground">
                An option payoff is the profit or loss from holding an option at expiration based on the underlying asset's price. For calls: payoff = max(0, underlying price - strike price) - premium paid. For puts: payoff = max(0, strike price - underlying price) - premium paid. Payoffs help visualize potential outcomes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate call option payoff?</h4>
              <p className="text-muted-foreground">
                Call option payoff = max(0, underlying price - strike price) - premium paid. If the underlying price is above the strike price, the payoff is the difference minus the premium. If below, the payoff is just the loss of the premium paid. Break-even occurs at strike price + premium.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate put option payoff?</h4>
              <p className="text-muted-foreground">
                Put option payoff = max(0, strike price - underlying price) - premium paid. If the underlying price is below the strike price, the payoff is the difference minus the premium. If above, the payoff is just the loss of the premium paid. Break-even occurs at strike price - premium.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the break-even point?</h4>
              <p className="text-muted-foreground">
                The break-even point is the underlying price at which the option position neither profits nor loses money. For calls: break-even = strike price + premium paid. For puts: break-even = strike price - premium paid. This is the minimum price movement needed to recover the premium cost.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is maximum profit and loss?</h4>
              <p className="text-muted-foreground">
                For call options: maximum profit is unlimited (as underlying price can rise indefinitely), maximum loss is the premium paid. For put options: maximum profit is strike price - premium paid (if underlying goes to zero), maximum loss is the premium paid. Understanding these limits is crucial for risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does time decay affect payoffs?</h4>
              <p className="text-muted-foreground">
                Time decay (theta) reduces option value as expiration approaches, affecting the payoff curve. Before expiration, options have time value that decreases over time. At expiration, only intrinsic value remains. Time decay works against option buyers and benefits option sellers, making timing crucial for options trading.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors influence option payoffs?</h4>
              <p className="text-muted-foreground">
                Option payoffs are influenced by underlying price movement, volatility changes, time decay, interest rates, and dividends. The most significant factor is underlying price movement, which directly determines intrinsic value. Volatility affects option prices before expiration, while time decay reduces option value as expiration approaches.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use payoff analysis for trading?</h4>
              <p className="text-muted-foreground">
                Use payoff analysis to visualize potential outcomes, assess risk-reward ratios, and compare different strategies. Identify break-even points, maximum profit/loss scenarios, and probability of profit. This helps determine position sizing, set profit targets, and establish stop-loss levels for effective risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between payoff and P&L?</h4>
              <p className="text-muted-foreground">
                Payoff shows profit/loss at expiration based on underlying price, while P&L (profit and loss) shows current unrealized gains/losses before expiration. P&L includes time value and volatility changes, while payoff focuses on intrinsic value at expiration. Both are important for different aspects of options trading.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret payoff charts?</h4>
              <p className="text-muted-foreground">
                Payoff charts show profit/loss on the y-axis and underlying price on the x-axis. The break-even point is where the line crosses zero. Above break-even shows profit potential, below shows loss potential. Steep slopes indicate high leverage, while flat areas show limited profit potential. Use charts to visualize risk-reward profiles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}