'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Scale, Clock, PieChart, ArrowRightLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  lumpSumAmount: z.number().min(0, 'Amount cannot be negative'),
  sipMonthlyAmount: z.number().min(0, 'Amount cannot be negative'),
  annualReturn: z.number().min(-100).max(100, 'Return must be between -100% and 100%'),
  investmentPeriod: z.number().positive('Period must be positive').max(100, 'Period limited to 100 years'),
});

type FormValues = z.infer<typeof formSchema>;

export default function LumpSumVsSIPComparisonCalculator() {
  const [result, setResult] = useState<{
    lumpSumFinal: number;
    sipFinal: number;
    lumpSumInvested: number;
    sipInvested: number;
    difference: number;
    winner: 'Lump Sum' | 'SIP';
    percentDifference: number;
    interpretation: string;
    recommendation: string;
    volatilityInsight: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lumpSumAmount: undefined,
      sipMonthlyAmount: undefined,
      annualReturn: undefined,
      investmentPeriod: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const r = v.annualReturn / 100;
    const rMonthly = r / 12;
    const n = v.investmentPeriod * 12;

    // Lump Sum Calculation: FV = P * (1 + r)^t
    // Using monthly compounding for fair comparison with SIP (or annual? usually lump sum is annual CAGR, but SIP is monthly. Let's use monthly compounding for both to be precise and consistent).
    const lumpSumFinal = v.lumpSumAmount * Math.pow(1 + rMonthly, n);

    // SIP Calculation: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    // Assuming investment at beginning of month (Annuity Due)
    let sipFinal = 0;
    if (v.annualReturn === 0) {
      sipFinal = v.sipMonthlyAmount * n;
    } else {
      sipFinal = v.sipMonthlyAmount * ((Math.pow(1 + rMonthly, n) - 1) / rMonthly) * (1 + rMonthly);
    }

    const lumpSumInvested = v.lumpSumAmount;
    const sipInvested = v.sipMonthlyAmount * n;

    const diff = Math.abs(lumpSumFinal - sipFinal);
    const winner: 'Lump Sum' | 'SIP' = lumpSumFinal > sipFinal ? 'Lump Sum' : 'SIP';
    const percentDiff = (diff / Math.min(lumpSumFinal, sipFinal)) * 100;

    return { lumpSumFinal, sipFinal, lumpSumInvested, sipInvested, diff, winner, percentDiff };
  };

  const getInterpretation = (winner: string, percentDiff: number, years: number) => {
    if (percentDiff > 50) return `${winner} is overwhelmingly superior in this scenario, generating significantly higher returns over ${years} years.`;
    if (percentDiff > 20) return `${winner} demonstrates a clear advantage, outperforming the alternative by a solid margin.`;
    if (percentDiff > 5) return `${winner} holds a slight edge, but the difference is relatively manageable over the long term.`;
    return `The results are nearly identical. Start with whichever method fits your current cash flow better.`;
  };

  const getRecommendation = (winner: string, r: number) => {
    if (winner === 'Lump Sum') {
      return 'Since you have the capital upfront, investing immediately maximizes your time in the market, capturing full compound growth from day one.';
    }
    return 'SIP helps mitigate the risk of entering the market at a peak. Spreading investments allows you to buy more units when prices are low (Dollar Cost Averaging).';
  };

  const getInsights = (winner: string, lsAmount: number, sipTotal: number) => {
    const insights: string[] = [];
    if (lsAmount > sipTotal * 1.5) insights.push('Comparing a large Lump Sum to a small SIP might be unfair; ensure total capital deployed is comparable for a true strategy test.');
    if (winner === 'Lump Sum') {
      insights.push('Time in the market generally beats timing the market.');
      insights.push('Lump Sum suffers no "cash drag" (money sitting idle).');
      insights.push('Best for windfalls, bonuses, or inheritances.');
    } else {
      insights.push('SIP instills financial discipline through automation.');
      insights.push('Reduces the emotional impact of market volatility.');
      insights.push('Ideal for salary-earners matching income flows.');
    }
    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const { lumpSumFinal, sipFinal, lumpSumInvested, sipInvested, diff, winner, percentDiff } = calculate(values);

    const interpretation = getInterpretation(winner, percentDiff, values.investmentPeriod);
    const recommendation = getRecommendation(winner, values.annualReturn);
    const insights = getInsights(winner, lumpSumInvested, sipInvested);

    // Risk factors based on the "Loser" or general context
    const riskFactors: string[] = [];
    if (winner === 'Lump Sum') {
      riskFactors.push('Lump Sum Risk: Investing just before a crash takes years to recover.');
      riskFactors.push('Psychological Difficulty: Watching a large sum drop 20% is painful.');
    } else {
      riskFactors.push('SIP Risk: In a bull market, you buy at constantly higher prices.');
      riskFactors.push('Opportunity Cost: Cash waiting to be invested earns low interest.');
    }

    setResult({
      lumpSumFinal,
      sipFinal,
      lumpSumInvested,
      sipInvested,
      difference: diff,
      winner,
      percentDifference: percentDiff,
      interpretation,
      recommendation,
      volatilityInsight: values.annualReturn > 10 ? 'High expected returns favor Lump Sum, but increase short-term variance risk.' : 'Conservative returns make the choice less critical.',
      insights,
      riskFactors
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Comparison Parameters
          </CardTitle>
          <CardDescription>
            Contrast two powerful investment approaches to see which wins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="lumpSumAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Lump Sum Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 120000"
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
                  name="sipMonthlyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly SIP Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1000"
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
                  name="annualReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Expected Annual Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 10"
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
                  name="investmentPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Investment Period (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10"
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
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Compare Strategies
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
                  <CardTitle>Strategy Analysis</CardTitle>
                  <CardDescription>Performance Breakdown</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">The Winner Is</p>
                <p className="text-4xl font-extrabold text-primary mt-1">{result.winner}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`text-center p-6 rounded-lg border-2 ${result.winner === 'Lump Sum' ? 'bg-primary/5 border-primary' : 'bg-muted/50 border-muted'}`}>
                  <p className="font-semibold text-lg mb-2">Lump Sum Result</p>
                  <p className="text-3xl font-bold text-primary">${result.lumpSumFinal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Inv. Amount: ${result.lumpSumInvested.toLocaleString()}</p>
                    <p>Gain: ${(result.lumpSumFinal - result.lumpSumInvested).toLocaleString()}</p>
                  </div>
                </div>

                <div className={`text-center p-6 rounded-lg border-2 ${result.winner === 'SIP' ? 'bg-primary/5 border-primary' : 'bg-muted/50 border-muted'}`}>
                  <p className="font-semibold text-lg mb-2">SIP Result</p>
                  <p className="text-3xl font-bold text-primary">${result.sipFinal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Inv. Amount: ${result.sipInvested.toLocaleString()}</p>
                    <p>Gain: ${(result.sipFinal - result.sipInvested).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Value Difference</p>
                  <p className="text-lg font-bold">${result.difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Advantage</p>
                  <Badge variant={result.percentDifference > 25 ? 'default' : 'secondary'}>
                    {result.percentDifference.toFixed(1)}% Higher
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Expected Volatility</p>
                  <p className="text-sm font-medium mt-1">{result.volatilityInsight}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Advice:</strong> {result.recommendation}
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
                  Why {result.winner} Won
                </CardTitle>
                <CardDescription>Key drivers of this outcome</CardDescription>
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
                  Risk Considerations
                </CardTitle>
                <CardDescription>What to watch out for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((risk, index) => (
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

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Defining the contenders in this financial face-off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Lump Sum
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Making a single, one-time investment of a substantial amount.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Definition:</strong> Investing all your available capital at once.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Best For:</strong> Inheritances, lottery winnings, annual bonuses, or accumulated savings.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Key Advantage:</strong> Maximizes the "time value of money" by deploying cash immediately.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                SIP (Systematic Investment Plan)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Investing a fixed amount periodically (usually monthly).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Definition:</strong> A disciplined, automated approach to investing small amounts regularly.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Best For:</strong> Salaried individuals, risk-averse investors, and long-term wealth builders.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Key Advantage:</strong> Dollar Cost Averaging (buying more units when prices fall).</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Logic Behind the Math
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center mb-2">
              <strong>Lump Sum:</strong> FV = P × (1 + r)ⁿ
            </p>
            <p className="font-mono text-sm text-center">
              <strong>SIP:</strong> FV = PMT × [((1 + r)ⁿ - 1) / r] × (1 + r)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The Lump Sum formula is simple compound interest. The SIP formula is the Future Value of an Annuity Due (assuming investment at the beginning of each period). Note that <strong>r</strong> represents the periodic (monthly) rate, and <strong>n</strong> is the total number of periods (months).
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
            Explore other tools to optimize your wealth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/sip-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SIP Calculator</p>
                      <p className="text-sm text-muted-foreground">Deep dive into SIPs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">One-time investment analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calculator</p>
                      <p className="text-sm text-muted-foreground">Adjust for purchasing power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/investment-goal-tracker-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Goal Tracker</p>
                      <p className="text-sm text-muted-foreground">Track your progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">FD Calculator</p>
                      <p className="text-sm text-muted-foreground">Fixed Deposit returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceArticle">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="Lump Sum vs SIP: The Ultimate Investment Strategy Showdown" />
        <meta itemProp="description" content="Deciding between a one-time Lump Sum investment and a Systematic Investment Plan (SIP)? Our detailed guide analyzes the math, risks, and psychology to help you choose the winner." />
        <meta itemProp="keywords" content="lump sum vs SIP, investment strategy, dollar cost averaging, market timing, lump sum investment calculator, SIP benefits" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-20" />
        <meta itemProp="url" content="/lump-sum-vs-sip-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Lump Sum vs. SIP: Which Strategy Reigns Supreme?</h1>
        <p className="text-lg italic text-muted-foreground">One of the most debated questions in personal finance: If you have the money, should you invest it all at once or trickle it in slowly?</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definitions" className="hover:underline">Defining the Contenders: What Are They?</a></li>
          <li><a href="#math" className="hover:underline">The Math: Why Lump Sum Usually Wins</a></li>
          <li><a href="#psychology" className="hover:underline">The Psychology: Why SIP Often Feels Better</a></li>
          <li><a href="#volatility" className="hover:underline">The Role of Market Volatility</a></li>
          <li><a href="#verdict" className="hover:underline">Final Verdict: How to Choose</a></li>
        </ul>
        <hr />

        {/* DEFINITIONS */}
        <h2 id="definitions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Defining the Contenders: What Are They?</h2>
        <p>Before diving into the numbers, let's clarify the two strategies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Lump Sum Investment</h3>
        <p>This involves taking a large pile of cash—perhaps from a bonus, inheritance, or sale of an asset—and investing it into the market in a single transaction. You are fully invested from Day 1.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">SIP (Systematic Investment Plan) / DCA</h3>
        <p>Often called Dollar Cost Averaging (DCA), this strategy involves taking that same large pile of cash and investing a small, fixed portion of it every month until the cash is depleted. Alternatively, it refers to simply investing a portion of your monthly income as you earn it.</p>

        <hr />

        {/* THE MATH */}
        <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Math: Why Lump Sum Usually Wins</h2>
        <p>If we look purely at historical data and mathematics, <strong>Lump Sum investing outperforms SIP about 67% of the time</strong> (according to Vanguard studies).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The "Cash Drag" Effect</h3>
        <p>The reason is simple: Markets tend to go up over time. By holding cash on the sidelines waiting to be "dripped" into the market via SIP, you are missing out on the growth that the cash could have earned if it were invested.</p>
        <p>When you choose SIP over Lump Sum for a windfall, you are effectively betting that the market will drop in the near future, allowing you to buy at cheaper prices. Since markets rise more often than they fall, this bet usually fails.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Compounding Power</h3>
        <p>Compound interest needs time. A Lump Sum investment gives every single dollar the maximum amount of time to grow. In an SIP, the last dollar invested has significantly less time to compound than the first dollar.</p>

        <hr />

        {/* THE PSYCHOLOGY */}
        <h2 id="psychology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Psychology: Why SIP Often Feels Better</h2>
        <p>Arguments based on math assume investors are robots. We are not. We feel pain when we lose money more intensely than we feel joy when we gain it (Loss Aversion).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Regret Minimization</h3>
        <p>Imagine investing $100,000 today, and the market crashes 20% tomorrow. You would feel devastated. You might panic and sell.</p>
        <p>Now imagine investing $10,000/month. If the market crashes tomorrow, you might actually feel <em>good</em> because your next month's $10,000 will buy more shares at a discount. SIP acts as an emotional hedge against bad timing.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Sleep-at-Night Factor</h3>
        <p>For many investors, the optimal strategy isn't the one with the highest mathematical return; it's the one they can stick with. If Lump Sum investing makes you too anxious to sleep, then SIP is the better choice for you, regardless of the math.</p>

        <hr />

        {/* VOLATILITY */}
        <h2 id="volatility" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Role of Market Volatility</h2>
        <p>The choice between strategies often depends on the current market environment.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">In Bull Markets</h3>
        <p>In a steadily rising market, SIP is punishing. You are constantly buying at higher and higher prices. Lump Sum is heavily favored here.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">In Bear Markets or Choppy Markets</h3>
        <p>In a falling or volatile market, SIP shines. You buy more units when prices are low, lowering your average cost per share. When the market eventually recovers, your portfolio recovers faster because of this lower average cost.</p>

        <hr />

        {/* VERDICT */}
        <h2 id="verdict" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Final Verdict: How to Choose</h2>
        <p>So, which should you pick? Here is a decision framework:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 bg-muted border rounded-lg">
            <strong className="block text-lg mb-2 text-primary">Choose Lump Sum If:</strong>
            <ul className="list-disc ml-4 space-y-1">
              <li>You want the highest statistical probability of maximum return.</li>
              <li>You have a high risk tolerance and won't panic if the market drops.</li>
              <li>You have a long time horizon (10+ years) to recover from any immediate dips.</li>
            </ul>
          </div>
          <div className="p-4 bg-muted border rounded-lg">
            <strong className="block text-lg mb-2 text-primary">Choose SIP If:</strong>
            <ul className="list-disc ml-4 space-y-1">
              <li>You are investing your monthly salary (you don't have the cash upfront anyway).</li>
              <li>You are risk-averse and afraid of investing at a market peak.</li>
              <li>You want to automate your investing and "forget it."</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Investment Strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does SIP guarantee profits?</h4>
              <p className="text-muted-foreground">
                No. SIP reduces risk, but it does not eliminate it. If the market falls consistently for 5 years, your SIP portfolio will also be in the negative, though likely less negative than a Lump Sum invested at the peak.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is it risky to invest a Lump Sum at an all-time high?</h4>
              <p className="text-muted-foreground">
                Psychologically, yes. Statistically, less so than you think. Markets spend a lot of time at "all-time highs." Waiting for a dip can often result in missing significant gains if the market continues to rally.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I stop an SIP midway?</h4>
              <p className="text-muted-foreground">
                Yes, SIPs are flexible. You can pause, stop, or increase them at any time without penalty in most mutual funds. However, stopping during a market crash defeats the purpose of buying low.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Rupee/Dollar Cost Averaging"?</h4>
              <p className="text-muted-foreground">
                It is the mechanism behind SIP. By investing a fixed amount of money, you buy more shares when prices are low and fewer when prices are high. This automatically lowers your average cost per share over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect this decision?</h4>
              <p className="text-muted-foreground">
                Lump Sum provides better protection against inflation risk regarding the cash itself. Cash sitting in a bank account (waiting for SIP deployment) loses purchasing power to inflation every day.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a STP (Systematic Transfer Plan)?</h4>
              <p className="text-muted-foreground">
                STP is a middle ground. You invest your Lump Sum into a safe Liquid Fund (earning ~4-6%) and then systematically transfer a fixed amount monthly into an Equity Fund. This optimizes the returns on the "waiting cash" while still giving you SIP benefits.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I do SIP in stocks or mutual funds?</h4>
              <p className="text-muted-foreground">
                Mutual funds are generally better for SIPs because they allow fractional ownership (in many countries) or easy diversification. Doing SIP in single stocks exposes you to high specific risk—if that one company fails, your discipline doesn't save you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the ideal SIP duration?</h4>
              <p className="text-muted-foreground">
                To truly benefit from market cycles (ups and downs), an SIP should ideally run for at least 3-5 years. This allows you to accumulate units through various market phases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I do both strategies?</h4>
              <p className="text-muted-foreground">
                Absolutely. A common strategy is to have a long-running SIP for your salary income, and topping it up with Lump Sum investments whenever you get a bonus or market corrections occur.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How are they taxed?</h4>
              <p className="text-muted-foreground">
                In many jurisdictions (like India or USA), each SIP installment is treated as a separate investment with its own date. Capital gains tax applies based on the holding period of *each* unit. Lump sum is simpler—one buy date, one holding period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Windfall Recipients</strong>
                <span className="text-sm text-muted-foreground">Individuals who have received an inheritance, bonus, or legal settlement and are debating whether to invest it all now or over time.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Nervous Investors</strong>
                <span className="text-sm text-muted-foreground">Those with a low risk tolerance who lose sleep over the thought of investing at a "market top."</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Planners</strong>
                <span className="text-sm text-muted-foreground">To demonstrate the mathematical cost of waiting (cash drag) versus the psychological benefit of averaging.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirees</strong>
                <span className="text-sm text-muted-foreground">Deciding how to deploy a lump sum retirement corpus into income-generating buckets.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Sequence of Returns Risk:</strong> The calculator assumes a steady average return. In reality, if a crash happens in Year 1, Lump Sum suffers more than SIP. If a rally happens in Year 1, Lump Sum wins big.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Psychological Cost:</strong> The math doesn't account for panic selling. If a Lump Sum investor sells after a 10% drop, their actual return is far worse than the calculator predicts.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Opportunity Cost of Cash:</strong> For SIP, the calculator assumes money sits idle. In reality, you might keep the uninvested portion in a Savings Account (earning ~3%), which softens the "Cash Drag."</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Historical Context
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The 2008 Financial Crisis</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  An investor who did a Lump Sum in Jan 2008 saw their portfolio drop ~40% by year-end. An SIP investor kept buying at lower and lower prices, recovering much faster when the market turned in 2009. <strong>SIP Won.</strong>
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The 2013-2021 Bull Run</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Markets went up almost linearly. SIP investors kept waiting for a "dip" that never really came, buying at constantly higher prices. The Lump Sum investor from 2013 enjoyed massive compounding on the full amount. <strong>Lump Sum Won.</strong>
                </p>
              </div>
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
          <p>The Lump Sum vs. SIP Calculator quantifies the age-old dilemma of "Time in the Market" vs. "Timing the Market."</p>
          <p>While Lump Sum is mathematically superior in rising markets, SIP provides the psychological armor necessary to stay invested during specific volatile periods.</p>
          <p>Use this tool to weigh the potential financial upside of a lump sum against the emotional security of a systematic plan.</p>
        </CardContent>
      </Card>
    </div>
  );
}
