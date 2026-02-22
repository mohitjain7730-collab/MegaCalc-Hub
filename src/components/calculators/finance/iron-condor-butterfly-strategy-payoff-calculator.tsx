
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Activity, Percent, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import Link from 'next/link';

const formSchema = z.object({
  lowerPutStrike: z.number().positive(),
  shortPutStrike: z.number().positive(),
  shortCallStrike: z.number().positive(),
  upperCallStrike: z.number().positive(),
  netPremium: z.number(),
  strategyType: z.enum(['iron-condor', 'iron-butterfly']),
  finalPrice: z.number().positive(),
  contracts: z.number().positive().int().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IronCondorButterflyStrategyPayoffCalculator() {
  const [result, setResult] = useState<{
    profit: number;
    maxProfit: number;
    maxLoss: number;
    breakEvenLower: number;
    breakEvenUpper: number;
    wingWidth: number;
    profitZone: string;
    strategyType: string;
    outcomeAssessment: string;
    riskRewardRatio: number;
    profitabilityLevel: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lowerPutStrike: undefined,
      shortPutStrike: undefined,
      shortCallStrike: undefined,
      upperCallStrike: undefined,
      netPremium: undefined,
      strategyType: undefined,
      finalPrice: undefined,
      contracts: 1,
    },
  });

  const getProfitabilityLevel = (profit: number, maxProfit: number) => {
    const profitPct = (profit / Math.abs(maxProfit)) * 100;
    if (profit >= maxProfit * 0.9) return 'Max Profit Zone';
    if (profit >= maxProfit * 0.5) return 'Profitable';
    if (profit >= 0) return 'Marginal Profit';
    if (profit >= -maxProfit * 0.5) return 'Partial Loss';
    return 'Near Max Loss';
  };

  const getOutcomeAssessment = (profit: number, strategyType: string, finalPrice: number, shortPutStrike: number, shortCallStrike: number, breakLower: number, breakUpper: number) => {
    if (profit >= 0) {
      if (finalPrice >= shortPutStrike && finalPrice <= shortCallStrike) {
        return strategyType === 'iron-condor'
          ? 'Price stayed within the profit zone—max profit achieved. All options expire worthless (OTM).'
          : 'Price at center strike—max profit achieved for butterfly.';
      } else {
        return 'Price is within breakeven range—still profitable but not at maximum.';
      }
    } else {
      if (finalPrice < breakLower) {
        return 'Price fell below lower breakeven—loss from put spread. The short put is ITM.';
      } else {
        return 'Price rose above upper breakeven—loss from call spread. The short call is ITM.';
      }
    }
  };

  const getRecommendation = (profit: number, strategyType: string, maxProfit: number, maxLoss: number, finalPrice: number, shortPutStrike: number, shortCallStrike: number) => {
    if (profit >= maxProfit * 0.8) {
      return 'Near max profit—consider closing early to lock in gains and avoid gamma risk as expiration approaches.';
    }
    if (profit >= 0) {
      return 'Profitable position. Evaluate closing early if you\'ve captured 50%+ of max profit to free capital and reduce risk.';
    }
    if (profit > maxLoss * 0.5) {
      return 'Partial loss. Consider adjusting by rolling untested side closer or closing the losing spread to limit further damage.';
    }
    return 'Near max loss. Damage is done—evaluate whether to ride to expiration or cut losses. Future trades should size for max loss.';
  };

  const getInsights = (strategyType: string, maxProfit: number, maxLoss: number, breakLower: number, breakUpper: number, wingWidth: number, netPremium: number) => {
    const insights = [];
    const riskReward = Math.abs(maxProfit / maxLoss);

    if (strategyType === 'iron-condor') {
      insights.push(`Profit zone: ${breakLower.toFixed(2)} to ${breakUpper.toFixed(2)}—price must stay within this range`);
      insights.push(`Risk/Reward: ${riskReward.toFixed(2)} (${(riskReward * 100).toFixed(0)}% return on risk if max profit achieved)`);
      insights.push(`Wing width of ${wingWidth.toFixed(2)} defines max loss beyond the short strikes`);
    } else {
      insights.push(`Maximum profit achieved only if stock expires exactly at center strike`);
      insights.push(`Profit declines as price moves away from center—highly directional to a specific price`);
      insights.push(`Lower probability of max profit but excellent risk/reward when correct`);
    }

    return insights;
  };

  const getConsiderations = (strategyType: string) => {
    const considerations = [];

    considerations.push('Four legs mean higher commission costs that can erode thin profit margins');
    considerations.push('Early assignment risk on ITM short options—especially near ex-dividend dates');
    considerations.push('Managing four legs simultaneously is complex; closing requires coordinated execution');
    considerations.push('Margin requirements can be substantial—check with your broker');
    considerations.push('Gamma risk increases dramatically near expiration for at-the-money positions');

    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const L1 = values.lowerPutStrike!;   // Long put (lowest strike)
    const S1 = values.shortPutStrike!;   // Short put
    const S2 = values.shortCallStrike!;  // Short call
    const L2 = values.upperCallStrike!;  // Long call (highest strike)
    const premium = values.netPremium!;
    const finalPrice = values.finalPrice!;
    const contracts = values.contracts || 1;
    const multiplier = contracts * 100;

    // For iron condor: net premium received (positive = credit)
    // For iron butterfly: typically net credit

    // Calculate wing widths
    const putWingWidth = S1 - L1;
    const callWingWidth = L2 - S2;
    const wingWidth = Math.max(putWingWidth, callWingWidth);

    // Max profit = net premium received
    const maxProfit = Math.abs(premium) * multiplier;

    // Max loss = wing width - premium (for equal wings)
    const maxLoss = (wingWidth - Math.abs(premium)) * multiplier;

    // Breakevens
    const breakEvenLower = S1 - Math.abs(premium);
    const breakEvenUpper = S2 + Math.abs(premium);

    // Calculate P&L at final price
    let profit: number;

    if (values.strategyType === 'iron-condor') {
      // Iron condor: profit within short strikes, loss outside wings
      if (finalPrice <= L1) {
        // Below long put: max loss from put spread
        profit = -maxLoss;
      } else if (finalPrice < S1) {
        // Between long put and short put: partial loss from put spread
        const putSpreadLoss = (S1 - finalPrice) * multiplier;
        profit = (Math.abs(premium) * multiplier) - putSpreadLoss;
      } else if (finalPrice <= S2) {
        // Within the body: max profit
        profit = maxProfit;
      } else if (finalPrice < L2) {
        // Between short call and long call: partial loss from call spread
        const callSpreadLoss = (finalPrice - S2) * multiplier;
        profit = (Math.abs(premium) * multiplier) - callSpreadLoss;
      } else {
        // Above long call: max loss from call spread
        profit = -maxLoss;
      }
    } else {
      // Iron butterfly: max profit only at center, declines rapidly
      const center = (S1 + S2) / 2;
      if (finalPrice <= L1 || finalPrice >= L2) {
        profit = -maxLoss;
      } else if (finalPrice === center) {
        profit = maxProfit;
      } else {
        // Profit declines linearly from center
        const distanceFromCenter = Math.abs(finalPrice - center);
        const maxDistance = wingWidth;
        profit = maxProfit - (distanceFromCenter / maxDistance) * (maxProfit + maxLoss);
        profit = Math.max(profit, -maxLoss);
      }
    }

    const riskRewardRatio = Math.abs(maxProfit / maxLoss);

    setResult({
      profit,
      maxProfit,
      maxLoss,
      breakEvenLower,
      breakEvenUpper,
      wingWidth,
      profitZone: `$${breakEvenLower.toFixed(2)} - $${breakEvenUpper.toFixed(2)}`,
      strategyType: values.strategyType === 'iron-condor' ? 'Iron Condor' : 'Iron Butterfly',
      outcomeAssessment: getOutcomeAssessment(profit, values.strategyType!, finalPrice, S1, S2, breakEvenLower, breakEvenUpper),
      riskRewardRatio,
      profitabilityLevel: getProfitabilityLevel(profit, maxProfit),
      recommendation: getRecommendation(profit, values.strategyType!, maxProfit, maxLoss, finalPrice, S1, S2),
      insights: getInsights(values.strategyType!, maxProfit, maxLoss, breakEvenLower, breakEvenUpper, wingWidth, premium),
      considerations: getConsiderations(values.strategyType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Multi-Leg Strategy Parameters
          </CardTitle>
          <CardDescription>
            Analyze Iron Condor or Iron Butterfly payoffs at different expiration prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="lowerPutStrike"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Long Put Strike (Lowest)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 90"
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
                  name="shortPutStrike"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Short Put Strike
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 95"
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
                  name="shortCallStrike"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Short Call Strike
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                  name="upperCallStrike"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Long Call Strike (Highest)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
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
                <FormField
                  control={form.control}
                  name="netPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Net Premium ($/share)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 2.50 (credit)"
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
                          <option value="iron-condor">Iron Condor</option>
                          <option value="iron-butterfly">Iron Butterfly</option>
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
                        <BarChart3 className="h-4 w-4" />
                        Stock Price at Expiry ($)
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
                  name="contracts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        # of Contracts
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Analyze Strategy Payoff
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
                <Layers className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.strategyType} Analysis</CardTitle>
                  <CardDescription>Multi-Leg Strategy Performance at Expiration</CardDescription>
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
                <p className="text-sm text-muted-foreground mt-2">at stock price of ${form.getValues('finalPrice')?.toFixed(2)}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Max Profit</p>
                  <p className="text-xl font-bold text-green-600">${result.maxProfit.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Max Loss</p>
                  <p className="text-xl font-bold text-red-600">${result.maxLoss.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Lower Breakeven</p>
                  <p className="text-xl font-bold">${result.breakEvenLower.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Upper Breakeven</p>
                  <p className="text-xl font-bold">${result.breakEvenUpper.toFixed(2)}</p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Outcome</p>
                  <Badge variant={result.profitabilityLevel.includes('Profit') || result.profitabilityLevel.includes('Max') ? 'default' : result.profitabilityLevel.includes('Marginal') ? 'outline' : 'destructive'}>
                    {result.profitabilityLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Risk/Reward</p>
                  <p className="text-lg font-bold">{(result.riskRewardRatio * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Profit Zone</p>
                  <p className="text-sm font-medium">{result.profitZone}</p>
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
                <CardDescription>Position characteristics and targets</CardDescription>
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
                <CardDescription>Execution and management risks</CardDescription>
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
            <p className="font-mono text-sm text-center font-semibold">Iron Condor:</p>
            <p className="font-mono text-sm text-center mt-1">
              Max Profit = Net Premium Received
            </p>
            <p className="font-mono text-sm text-center mt-1">
              Max Loss = Wing Width - Net Premium
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg overflow-x-auto mt-3">
            <p className="font-mono text-sm text-center font-semibold">Breakevens:</p>
            <p className="font-mono text-sm text-center mt-1">
              Lower BE = Short Put Strike - Premium | Upper BE = Short Call Strike + Premium
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Iron condors and butterflies are defined-risk strategies that profit from range-bound markets. Max profit is achieved when the underlying stays within the profit zone.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Multi-Leg Strategy Calculators
          </CardTitle>
          <CardDescription>
            Explore other options spread analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/covered-call-protective-put-strategy-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Covered Call/Put</p>
                      <p className="text-sm text-muted-foreground">Stock-option strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/straddle-strangle-strategy-calculator" className="block">
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
            <Link href="/option-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Option Payoff</p>
                      <p className="text-sm text-muted-foreground">General P&L analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/option-greeks-calculator" className="block">
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
            <Link href="/probability-expiring-itm-options-calculator" className="block">
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
            <Link href="/implied-volatility-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Implied Volatility</p>
                      <p className="text-sm text-muted-foreground">IV extraction</p>
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
        <meta itemProp="name" content="The Definitive Guide to Iron Condors and Iron Butterflies: Multi-Leg Spread Strategies Explained" />
        <meta itemProp="description" content="An expert guide explaining iron condor and iron butterfly strategies, including construction, payoff profiles, strike selection, optimal market conditions, and position management techniques." />
        <meta itemProp="keywords" content="iron condor strategy, iron butterfly, options spread, defined risk trading, credit spread, neutral options strategy, theta decay, range-bound trading" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-iron-condor-butterfly-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Iron Condors and Iron Butterflies: Mastering Range-Bound Strategies</h1>
        <p className="text-lg italic text-muted-foreground">Master the most popular defined-risk spread strategies that profit from low volatility and range-bound market conditions.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#iron-condor-section" className="hover:underline">The Iron Condor Strategy</a></li>
          <li><a href="#iron-butterfly-section" className="hover:underline">The Iron Butterfly Strategy</a></li>
          <li><a href="#construction-section" className="hover:underline">Construction and Strike Selection</a></li>
          <li><a href="#risk-reward-section" className="hover:underline">Risk/Reward Analysis</a></li>
          <li><a href="#management-section" className="hover:underline">Position Management and Adjustments</a></li>
        </ul>
        <hr />

        {/* IRON CONDOR SECTION */}
        <h2 id="iron-condor-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Iron Condor Strategy</h2>
        <p>An **iron condor** is a four-leg options strategy that combines a bull put spread and a bear call spread. It profits when the underlying stays within a defined range.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Construction</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Buy OTM Put** (lowest strike): Long put provides protection on the downside.</li>
          <li>**Sell OTM Put** (higher strike): Short put generates credit.</li>
          <li>**Sell OTM Call** (lower call strike): Short call generates credit.</li>
          <li>**Buy OTM Call** (highest strike): Long call provides protection on the upside.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Payoff Characteristics</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Max Profit**: Net premium received—achieved when price stays between short strikes.</li>
          <li>**Max Loss**: Wing width minus premium—achieved when price moves beyond either long strike.</li>
          <li>**Profit Zone**: Between the breakevens (short strikes ± premium).</li>
        </ul>

        <hr />

        {/* IRON BUTTERFLY SECTION */}
        <h2 id="iron-butterfly-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Iron Butterfly Strategy</h2>
        <p>An **iron butterfly** is similar to an iron condor but with the short put and short call at the same strike (ATM). It offers higher premium but a narrower profit zone.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Construction</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Buy OTM Put** (lower strike): Downside protection wing.</li>
          <li>**Sell ATM Put and ATM Call** (same strike): Maximum premium collection at the center.</li>
          <li>**Buy OTM Call** (higher strike): Upside protection wing.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Differences from Iron Condor</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Higher Premium**: ATM options have more time value, generating larger credits.</li>
          <li>**Narrower Profit Zone**: Max profit only if price expires exactly at center strike.</li>
          <li>**Lower Probability of Profit**: Profit declines rapidly as price moves from center.</li>
          <li>**Better Risk/Reward**: Higher potential return if your price target is accurate.</li>
        </ul>

        <hr />

        {/* CONSTRUCTION AND STRIKE SELECTION */}
        <h2 id="construction-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Construction and Strike Selection</h2>
        <p>Strike selection is critical for balancing probability, premium, and risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Iron Condor Strike Selection</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Wider Short Strikes**: Higher probability of profit, lower premium received.</li>
          <li>**Narrower Short Strikes**: Lower probability, higher premium.</li>
          <li>**Wing Width**: Determines max loss; wider wings = more risk but often required for liquidity.</li>
          <li>**Delta Targeting**: Many traders select short strikes at 15-20 delta for ~70-80% probability of profit.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Expiration Selection</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**30-45 Days**: Sweet spot for theta decay and gamma risk balance.</li>
          <li>**Weekly Options**: Higher gamma risk; faster decay but less time to recover from unfavorable moves.</li>
          <li>**Longer-Dated**: More time value but slower decay; greater exposure to volatility changes.</li>
        </ul>

        <hr />

        {/* RISK/REWARD ANALYSIS */}
        <h2 id="risk-reward-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk/Reward Analysis</h2>
        <p>Understanding the risk/reward tradeoff is essential for position sizing.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Typical Risk/Reward Profiles</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Wide Iron Condor (30 delta)**: ~$1 premium / $4 risk = 25% return on risk; ~70% probability of profit.</li>
          <li>**Standard Iron Condor (20 delta)**: ~$1.50 premium / $3.50 risk = 40% return; ~60% probability.</li>
          <li>**Iron Butterfly**: ~$3 premium / $2 risk = 150% max return but only 30-40% probability of max profit.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Position Sizing</h3>
        <p>Size positions based on **max loss**, not premium received. If you can lose $500 per contract on an iron condor and your risk budget is $2,500, trade a maximum of 5 contracts regardless of expected profit.</p>

        <hr />

        {/* POSITION MANAGEMENT */}
        <h2 id="management-section" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Position Management and Adjustments</h2>
        <p>Active management can significantly improve strategy performance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Profit Taking</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**50% Rule**: Close when you've captured 50% of max profit to free capital and reduce gamma risk.</li>
          <li>**21 DTE Exit**: Many traders close all positions at 21 days to expiration regardless of profit level.</li>
          <li>**Time Decay Acceleration**: Most theta decay occurs in final weeks—balance profit potential vs. risk.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defense and Adjustments</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Roll Untested Side**: If price moves toward one side, close the untested spread and potentially roll it closer for additional credit.</li>
          <li>**Inversion Defense**: If tested, you can "invert" the condor by rolling the tested side through the untested side.</li>
          <li>**Stop Loss**: Close at 2x premium received (100% loss) to avoid catastrophic losses.</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>**Iron condors** and **iron butterflies** are powerful defined-risk strategies for neutral market outlooks. Iron condors provide higher probability with lower returns; iron butterflies offer higher returns for those willing to accept lower probability.</p>
        <p>Success requires proper strike selection, disciplined position sizing, active management, and realistic expectations. These strategies are cornerstone positions for systematic options traders focused on consistent income generation in range-bound markets.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about iron condors and iron butterflies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is an iron condor?</h4>
              <p className="text-muted-foreground">
                An iron condor is a four-leg options strategy combining a bull put spread and bear call spread. You collect premium and profit when the underlying stays within a defined range between the short strikes. Risk is limited to the wing width minus premium received.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is an iron butterfly?</h4>
              <p className="text-muted-foreground">
                An iron butterfly is similar to an iron condor but with both short options at the same strike (typically ATM). It collects more premium but has a narrower profit zone—max profit only occurs if the underlying expires exactly at the center strike.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I use an iron condor vs butterfly?</h4>
              <p className="text-muted-foreground">
                Use iron condors when you expect low volatility and want higher probability of profit with a wider profit zone. Use iron butterflies when you have a specific price target and want higher potential return, accepting lower probability of success.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What are typical strike selection guidelines?</h4>
              <p className="text-muted-foreground">
                Many traders select short strikes at 15-20 delta (approximately one standard deviation OTM), providing 65-75% probability of the strikes expiring OTM. Wing width (difference between long and short strikes) determines max loss—typically $2.50-$5 per contract.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What expiration should I choose?</h4>
              <p className="text-muted-foreground">
                30-45 days to expiration (DTE) is the sweet spot for most traders. This balances theta decay (time value capture) against gamma risk (sensitivity to price moves). Shorter expirations offer faster decay but higher gamma; longer expirations have slower decay.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">When should I take profits?</h4>
              <p className="text-muted-foreground">
                Many traders close at 50% of max profit. Studies show this improves risk-adjusted returns by reducing exposure to gamma risk in the final weeks. Alternatively, close at 21 DTE regardless of profit to avoid expiration week volatility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I manage a losing iron condor?</h4>
              <p className="text-muted-foreground">
                Options include: (1) Close the untested side and potentially roll it closer for additional credit, (2) Close the entire position at a predetermined loss (e.g., 2x premium), (3) Roll the tested side out in time, (4) Accept max loss if close to expiration with little recovery potential.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the risk/reward ratio for iron condors?</h4>
              <p className="text-muted-foreground">
                Typical iron condors collect $1-$2 premium with $3-$4 max risk per $5-wide wings, yielding 25-50% return on risk if max profit is achieved. However, when trades fail, you lose the full risk amount—requiring high win rates for profitability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How should I size my iron condor positions?</h4>
              <p className="text-muted-foreground">
                Size based on max loss, not expected profit. If your max risk per trade is 2% of your account and max loss is $500 per condor, with a $50,000 account you'd trade (50,000 × 0.02) / 500 = 2 contracts maximum.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do iron condors work in all market conditions?</h4>
              <p className="text-muted-foreground">
                Iron condors work best in low-volatility, range-bound markets. They struggle in trending or high-volatility environments where large moves breach the short strikes. Avoid opening new iron condors before major events (earnings, Fed meetings) unless you adjust strike selection.
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
          <p>The Iron Condor/Butterfly Calculator analyzes these popular multi-leg spread strategies for range-bound markets.</p>
          <p>Iron condors offer wider profit zones with lower returns; iron butterflies provide higher returns for precise price targets.</p>
          <p>Use this tool to model scenarios, understand breakevens, and evaluate risk/reward before entering positions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
