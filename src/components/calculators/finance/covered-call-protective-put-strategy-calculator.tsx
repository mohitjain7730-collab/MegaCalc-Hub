
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
  optionPremium: z.number().min(0),
  shares: z.number().positive().int(),
  strategyType: z.enum(['covered-call', 'protective-put']),
  finalPrice: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CoveredCallProtectivePutStrategyCalculator() {
  const [result, setResult] = useState<{
    netCost: number;
    profit: number;
    returnPct: number;
    maxProfit: number;
    maxLoss: number;
    breakEven: number;
    strategyType: string;
    outcomeAssessment: string;
    profitabilityLevel: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spot: undefined,
      strike: undefined,
      optionPremium: undefined,
      shares: 100,
      strategyType: undefined,
      finalPrice: undefined,
    },
  });

  const getProfitabilityLevel = (returnPct: number) => {
    if (returnPct >= 10) return 'Excellent';
    if (returnPct >= 5) return 'Good';
    if (returnPct >= 0) return 'Breakeven/Marginal';
    if (returnPct >= -10) return 'Minor Loss';
    return 'Significant Loss';
  };

  const getOutcomeAssessment = (profit: number, strategyType: string, spot: number, strike: number, finalPrice: number) => {
    if (strategyType === 'covered-call') {
      if (finalPrice >= strike) {
        return 'Stock called away at strike—max profit achieved. Consider rolling to next expiry if you wish to maintain position.';
      } else if (finalPrice >= spot) {
        return 'Stock rose but stayed below strike—kept stock plus premium. Optimal outcome for covered call writers.';
      } else if (profit >= 0) {
        return 'Stock declined but premium offsets loss—breakeven or slight gain. Premium provided downside cushion.';
      } else {
        return 'Stock declined below breakeven—net loss despite premium received. Consider position management.';
      }
    } else {
      if (finalPrice <= strike) {
        return 'Put is in-the-money—downside is protected. Loss capped at strike minus spot plus premium paid.';
      } else if (finalPrice >= spot) {
        return 'Stock rose—the put expires worthless but stock gains offset premium cost. Protection was unnecessary.';
      } else {
        return 'Stock declined above strike—put expires worthless with partial stock loss. Protection limit not reached.';
      }
    }
  };

  const getRecommendation = (strategyType: string, profit: number, returnPct: number, spot: number, strike: number, finalPrice: number) => {
    if (strategyType === 'covered-call') {
      if (finalPrice >= strike) {
        return 'Max profit achieved. If bullish, consider buy-to-close the call and keep shares; if neutral, let assignment occur and redeploy capital.';
      } else if (returnPct > 0) {
        return 'Profitable position. Consider writing another covered call for the next expiry to continue income generation.';
      } else {
        return 'Loss scenario. Consider rolling down to a lower strike for more premium, or hold if you remain bullish on the stock.';
      }
    } else {
      if (returnPct > 0) {
        return 'Protection strategy successful. Evaluate whether continued protection is needed or if you can let the next expiry go uncovered.';
      } else if (finalPrice > strike) {
        return 'Stock declined—protection didn\'t trigger. Consider lower strike puts for cheaper protection next time.';
      } else {
        return 'Protected downside activated. Evaluate whether to exercise the put, roll to new expiry, or close the position.';
      }
    }
  };

  const getInsights = (strategyType: string, profit: number, returnPct: number, spot: number, strike: number, premium: number, finalPrice: number) => {
    const insights = [];

    if (strategyType === 'covered-call') {
      insights.push(`Premium received lowers effective cost basis from $${spot.toFixed(2)} to $${(spot - premium).toFixed(2)}`);
      insights.push(`Maximum profit is capped at $${((strike - spot + premium) * 100).toFixed(2)} if stock is called away at $${strike.toFixed(2)}`);
      insights.push(`Strategy generates ${((premium / spot) * 100).toFixed(2)}% yield from premium collection alone`);
    } else {
      insights.push(`Protection cost of $${premium.toFixed(2)} per share provides downside floor at $${strike.toFixed(2)}`);
      insights.push(`Maximum loss is limited to $${((spot - strike + premium) * 100).toFixed(2)} regardless of how far stock falls`);
      insights.push(`Breakeven requires stock to rise to $${(spot + premium).toFixed(2)} to cover put cost`);
    }

    return insights;
  };

  const getConsiderations = (strategyType: string) => {
    const considerations = [];

    if (strategyType === 'covered-call') {
      considerations.push('Upside is capped at strike price—you miss gains above this level');
      considerations.push('Still exposed to full downside risk minus premium received');
      considerations.push('Assignment may trigger taxable event on underlying stock');
      considerations.push('Dividends: if stock goes ex-div, early assignment risk increases for ITM calls');
      considerations.push('Opportunity cost if stock rallies significantly above strike');
    } else {
      considerations.push('Premium paid is a sunk cost—protection may never be needed');
      considerations.push('Put expires worthless if stock stays above strike—insurance cost');
      considerations.push('Time decay (theta) works against long put positions');
      considerations.push('Must decide whether to exercise or sell put if ITM at expiry');
      considerations.push('Rolling protection forward has ongoing costs');
    }

    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const S = values.spot!;
    const K = values.strike!;
    const premium = values.optionPremium!;
    const shares = values.shares!;
    const finalPrice = values.finalPrice!;
    const strategyType = values.strategyType!;

    let netCost: number, profit: number, maxProfit: number, maxLoss: number, breakEven: number;

    if (strategyType === 'covered-call') {
      // Cost basis = spot - premium received
      netCost = (S - premium) * shares;
      // Profit = stock P&L + premium - call payoff (if assigned)
      const stockPnL = (finalPrice - S) * shares;
      const callPayoff = Math.max(0, finalPrice - K) * shares;
      profit = stockPnL + (premium * shares) - callPayoff;
      // Max profit: stock called at strike
      maxProfit = ((K - S) + premium) * shares;
      // Max loss: stock goes to zero, keep premium
      maxLoss = (premium - S) * shares; // This is negative (loss)
      // Breakeven
      breakEven = S - premium;
    } else {
      // Cost basis = spot + premium paid
      netCost = (S + premium) * shares;
      // Profit = stock P&L - premium + put payoff
      const stockPnL = (finalPrice - S) * shares;
      const putPayoff = Math.max(0, K - finalPrice) * shares;
      profit = stockPnL - (premium * shares) + putPayoff;
      // Max profit: unlimited upside minus premium
      maxProfit = Infinity; // Technically unlimited
      // Max loss: stock falls to strike (capped)
      maxLoss = ((K - S) - premium) * shares; // Loss capped at strike level
      // Breakeven
      breakEven = S + premium;
    }

    const returnPct = (profit / Math.abs(netCost)) * 100;

    setResult({
      netCost,
      profit,
      returnPct,
      maxProfit,
      maxLoss,
      breakEven,
      strategyType: strategyType === 'covered-call' ? 'Covered Call' : 'Protective Put',
      outcomeAssessment: getOutcomeAssessment(profit, strategyType, S, K, finalPrice),
      profitabilityLevel: getProfitabilityLevel(returnPct),
      recommendation: getRecommendation(strategyType, profit, returnPct, S, K, finalPrice),
      insights: getInsights(strategyType, profit, returnPct, S, K, premium, finalPrice),
      considerations: getConsiderations(strategyType)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategy Parameters
          </CardTitle>
          <CardDescription>
            Analyze Covered Call or Protective Put strategy payoffs at different price scenarios
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
                        Stock Entry Price ($)
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
                        Option Strike Price ($)
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
                  name="optionPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Option Premium ($/share)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 3.00"
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
                  name="shares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Number of Shares
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strategyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Strategy Type
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value || undefined)}
                        >
                          <option value="">Select strategy...</option>
                          <option value="covered-call">Covered Call (Sell Call)</option>
                          <option value="protective-put">Protective Put (Buy Put)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Stock Price at Expiry ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 110"
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
                Analyze Strategy
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
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.strategyType} Analysis</CardTitle>
                  <CardDescription>Strategy Performance at Expiration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Result Display */}
              <div className="text-center p-6 bg-muted/30 rounded-lg border-2 border-primary/20">
                <p className="text-sm text-muted-foreground font-medium mb-2">Profit / Loss</p>
                <p className={`text-5xl font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${result.profit.toFixed(2)}
                </p>
                <p className={`text-lg mt-2 ${result.returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.returnPct >= 0 ? '+' : ''}{result.returnPct.toFixed(2)}% Return
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Net Cost Basis</p>
                  <p className="text-xl font-bold">${result.netCost.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Breakeven</p>
                  <p className="text-xl font-bold">${result.breakEven.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Max Profit</p>
                  <p className="text-xl font-bold text-green-600">
                    {result.maxProfit === Infinity ? 'Unlimited' : `$${result.maxProfit.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Max Loss</p>
                  <p className="text-xl font-bold text-red-600">${Math.abs(result.maxLoss).toFixed(2)}</p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Profitability</p>
                  <Badge variant={result.profitabilityLevel === 'Excellent' ? 'default' : result.profitabilityLevel === 'Good' ? 'secondary' : result.profitabilityLevel.includes('Loss') ? 'destructive' : 'outline'}>
                    {result.profitabilityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Strategy</p>
                  <Badge variant="outline">{result.strategyType}</Badge>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="font-semibold mb-2">Outcome Assessment</p>
                <p className="text-muted-foreground">{result.outcomeAssessment}</p>
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
                <CardDescription>Key position characteristics</CardDescription>
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
                <CardDescription>Strategy limitations and risks</CardDescription>
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
            <p className="font-mono text-sm text-center font-semibold">Covered Call:</p>
            <p className="font-mono text-sm text-center mt-1">
              P&L = (Final - Entry) + Premium - max(0, Final - Strike)
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg overflow-x-auto mt-3">
            <p className="font-mono text-sm text-center font-semibold">Protective Put:</p>
            <p className="font-mono text-sm text-center mt-1">
              P&L = (Final - Entry) - Premium + max(0, Strike - Final)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Covered calls generate income but cap upside. Protective puts provide downside insurance at the cost of premium paid.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Options Strategy Calculators
          </CardTitle>
          <CardDescription>
            Explore other options strategy analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/iron-condor-butterfly-strategy-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Iron Condor/Butterfly</p>
                      <p className="text-sm text-muted-foreground">Multi-leg spread analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/straddle-strangle-strategy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
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
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Option Payoff</p>
                      <p className="text-sm text-muted-foreground">P&L visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/option-greeks-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Option Greeks</p>
                      <p className="text-sm text-muted-foreground">Sensitivity analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/probability-expiring-itm-options-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">ITM Probability</p>
                      <p className="text-sm text-muted-foreground">Expiration probability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/black-scholes-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Black-Scholes</p>
                      <p className="text-sm text-muted-foreground">Option pricing</p>
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
        <meta itemProp="name" content="The Definitive Guide to Covered Calls and Protective Puts: Stock-Options Strategies Explained" />
        <meta itemProp="description" content="An expert guide explaining covered call and protective put strategies, including construction, payoff analysis, optimal market conditions, risk/reward profiles, and practical implementation tips." />
        <meta itemProp="keywords" content="covered call strategy, protective put, buy-write, married put, stock options strategy, income generation, portfolio protection, options hedging" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-covered-call-protective-put-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Covered Calls and Protective Puts: Mastering Stock-Options Strategies</h1>
        <p className="text-lg italic text-muted-foreground">Master the two foundational stock-options strategies that combine equity exposure with options for income generation and portfolio protection.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#covered-call-section" className="hover:underline">The Covered Call Strategy</a></li>
          <li><a href="#protective-put-section" className="hover:underline">The Protective Put Strategy</a></li>
          <li><a href="#payoff-analysis" className="hover:underline">Payoff Analysis and Breakevens</a></li>
          <li><a href="#when-to-use" className="hover:underline">When to Use Each Strategy</a></li>
          <li><a href="#management-tips" className="hover:underline">Position Management and Rolling</a></li>
        </ul>
        <hr />

        {/* COVERED CALL SECTION */}
        <h2 id="covered-call-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Covered Call Strategy</h2>
        <p>A **covered call** involves owning stock and selling (writing) a call option against that position. It's one of the most popular options strategies for income generation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Construction</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Long Stock**: Own 100 shares (or multiples thereof) of the underlying.</li>
          <li>**Short Call**: Sell one call option per 100 shares owned.</li>
          <li>**Premium**: Receive option premium immediately as income.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risk/Reward Profile</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Max Profit**: Strike - Entry + Premium (if stock called away at strike).</li>
          <li>**Max Loss**: Entry - Premium (stock goes to zero, but premium provides cushion).</li>
          <li>**Breakeven**: Entry Price - Premium Received.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Ideal Market Conditions</h3>
        <p>Covered calls work best in **neutral to moderately bullish** markets. The ideal scenario is the stock staying flat or rising slightly to the strike—you keep the stock, earn the premium, and can write another call.</p>

        <hr />

        {/* PROTECTIVE PUT SECTION */}
        <h2 id="protective-put-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Protective Put Strategy</h2>
        <p>A **protective put** (also called a "married put") involves owning stock and buying a put option as insurance against downside.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Construction</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Long Stock**: Own 100 shares of the underlying.</li>
          <li>**Long Put**: Buy one put option per 100 shares owned.</li>
          <li>**Premium**: Pay option premium as the cost of protection.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risk/Reward Profile</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Max Profit**: Unlimited upside minus premium paid.</li>
          <li>**Max Loss**: Entry - Strike + Premium (loss capped at put strike level).</li>
          <li>**Breakeven**: Entry Price + Premium Paid.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Ideal Market Conditions</h3>
        <p>Protective puts are ideal when you're **bullish but concerned about downside risk**—perhaps ahead of earnings, macroeconomic uncertainty, or when protecting large unrealized gains.</p>

        <hr />

        {/* PAYOFF ANALYSIS */}
        <h2 id="payoff-analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payoff Analysis and Breakevens</h2>
        <p>Understanding payoff diagrams helps visualize strategy outcomes across price scenarios.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Covered Call Payoff</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Below breakeven: Loss increases as stock falls (but less than naked stock due to premium).</li>
          <li>Between breakeven and strike: Profit increases with stock price.</li>
          <li>Above strike: Profit capped at max profit (stock called away).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Protective Put Payoff</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Below strike: Loss capped—put gains offset stock losses below strike.</li>
          <li>Between strike and breakeven: Loss equals premium paid.</li>
          <li>Above breakeven: Unlimited profit potential minus premium cost.</li>
        </ul>

        <hr />

        {/* WHEN TO USE EACH STRATEGY */}
        <h2 id="when-to-use" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Use Each Strategy</h2>
        <p>Strategy selection depends on your market outlook and risk tolerance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Use Covered Calls When:</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>You're neutral to mildly bullish on the stock.</li>
          <li>You want to generate income from existing holdings.</li>
          <li>You're willing to sell shares at the strike price.</li>
          <li>Implied volatility is elevated (richer premiums).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Use Protective Puts When:</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>You're bullish but worried about near-term downside.</li>
          <li>You have significant unrealized gains to protect.</li>
          <li>Major events (earnings, FOMC) could cause volatility.</li>
          <li>You need to sleep at night with large equity exposure.</li>
        </ul>

        <hr />

        {/* POSITION MANAGEMENT AND ROLLING */}
        <h2 id="management-tips" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Position Management and Rolling</h2>
        <p>Active management can improve strategy outcomes.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Covered Call Management</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Roll Up**: If stock rises near strike, buy back the call and sell a higher strike for same expiry or later.</li>
          <li>**Roll Out**: If approaching expiry ITM, roll to a later expiry to defer assignment and collect more premium.</li>
          <li>**Close Early**: Buy back cheap OTM calls to free the position for re-entry.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Protective Put Management</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Roll Down**: If stock rallies, roll put to lower strike to reduce ongoing protection cost.</li>
          <li>**Roll Forward**: As expiry approaches, evaluate whether to extend protection.</li>
          <li>**Exercise vs Sell**: If put is ITM at expiry, decide whether to exercise (sell stock at strike) or sell the put and stock separately.</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>**Covered calls** and **protective puts** are foundational strategies that modify the risk/reward profile of stock ownership. Covered calls generate income by sacrificing upside; protective puts provide insurance at the cost of premium.</p>
        <p>Both strategies are essential tools for portfolio managers and individual investors seeking to enhance returns, generate income, or protect gains. Understanding their mechanics, optimal conditions, and management techniques is fundamental to successful options-based investing.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about covered calls and protective puts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a covered call?</h4>
              <p className="text-muted-foreground">
                A covered call involves owning stock and selling a call option against it. You receive premium income immediately, but your upside is capped at the strike price. If the stock rises above the strike, your shares will be called away (sold at the strike price).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a protective put?</h4>
              <p className="text-muted-foreground">
                A protective put involves owning stock and buying a put option as insurance. You pay premium for downside protection. If the stock falls below the strike, your losses are capped because the put gains value. Upside remains unlimited minus the premium cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I use a covered call?</h4>
              <p className="text-muted-foreground">
                Use covered calls when you're neutral to moderately bullish, want income from existing positions, and are willing to sell at the strike price. They work best in sideways markets or when implied volatility is elevated, providing richer premiums.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I use a protective put?</h4>
              <p className="text-muted-foreground">
                Use protective puts when you're bullish but worried about short-term downside—for example, before earnings, during market uncertainty, or to protect large unrealized gains. It's like buying insurance on your stock position.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if my covered call is assigned?</h4>
              <p className="text-muted-foreground">
                If assigned, you sell your shares at the strike price. You keep the premium received and the difference between strike and entry (if positive). This may trigger a taxable event. You can avoid assignment by buying back the call before expiry.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does the protective put protect against all losses?</h4>
              <p className="text-muted-foreground">
                No—your loss is capped at the difference between your entry price and the put strike, plus the premium paid. The put strike determines your floor. If the stock falls below the strike, the put gains value dollar-for-dollar, offsetting further losses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I choose ITM, ATM, or OTM strikes?</h4>
              <p className="text-muted-foreground">
                For covered calls: OTM strikes give more upside but less premium; ITM strikes give more premium but higher chance of assignment. For puts: OTM puts are cheaper but provide less protection; ITM puts give better protection at higher cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is rolling a covered call?</h4>
              <p className="text-muted-foreground">
                Rolling means buying back your existing call and selling a new one—typically at a higher strike or later expiry. This lets you defer potential assignment, collect additional premium, and adjust the position to current market conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do dividends affect covered calls?</h4>
              <p className="text-muted-foreground">
                If a stock goes ex-dividend and your call is ITM, the option holder may exercise early to capture the dividend. This means early assignment risk increases for ITM covered calls on dividend-paying stocks approaching ex-div dates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What's the typical return from covered calls?</h4>
              <p className="text-muted-foreground">
                Returns vary by market conditions and strike selection. Typical monthly premium yields range from 1-3% of stock value for OTM calls, or 10-30%+ annualized. Higher yields come with higher probability of assignment and capped upside.
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
          <p>The Covered Call/Protective Put Calculator analyzes the two foundational stock-options strategies.</p>
          <p>Covered calls generate income by capping upside; protective puts provide insurance at premium cost.</p>
          <p>Use this tool to model scenarios, understand breakevens, and optimize strike selection for your market outlook.</p>
        </CardContent>
      </Card>
    </div>
  );
}
