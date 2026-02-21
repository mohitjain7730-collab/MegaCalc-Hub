'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Calendar, PieChart, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  goalAmount: z.number().positive('Goal amount must be positive'),
  initialInvestment: z.number().min(0, 'Initial investment cannot be negative'),
  monthlyContribution: z.number().min(0, 'Monthly contribution cannot be negative'),
  annualReturn: z.number().min(-100).max(100, 'Return must be between -100% and 100%'),
  years: z.number().positive('Time horizon must be positive').max(100, 'Time horizon limited to 100 years'),
});

type FormValues = z.infer<typeof formSchema>;

export default function InvestmentGoalTrackerCalculator() {
  const [result, setResult] = useState<{
    projectedValue: number;
    shortfall: number;
    percentAchieved: number;
    interpretation: string;
    feasibilityLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    risks: string[];
    requiredMonthly: number;
    requiredReturn: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goalAmount: undefined,
      initialInvestment: undefined,
      monthlyContribution: undefined,
      annualReturn: undefined,
      years: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const r = v.annualReturn / 100 / 12; // Monthly rate
    const n = v.years * 12; // Total months

    // Future Value of Initial Investment: P * (1 + r)^n
    const fvInitial = v.initialInvestment * Math.pow(1 + r, n);

    // Future Value of Series (Contributions): PMT * [((1 + r)^n - 1) / r]
    // If r is 0, just PMT * n
    let fvSeries = 0;
    if (v.annualReturn === 0) {
      fvSeries = v.monthlyContribution * n;
    } else {
      fvSeries = v.monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
    }

    const totalFV = fvInitial + fvSeries;
    const shortfall = v.goalAmount - totalFV;
    const percentAchieved = (totalFV / v.goalAmount) * 100;

    // Calculate Required Monthly Contribution to hit goal
    // Goal = FV_Initial + PMT_Req * SeriesFactor
    // PMT_Req = (Goal - FV_Initial) / SeriesFactor
    let requiredMonthly = 0;
    if (v.annualReturn === 0) {
      requiredMonthly = (v.goalAmount - v.initialInvestment) / n;
    } else {
      const seriesFactor = ((Math.pow(1 + r, n) - 1) / r);
      requiredMonthly = (v.goalAmount - fvInitial) / seriesFactor;
    }
    if (requiredMonthly < 0) requiredMonthly = 0;

    return { totalFV, shortfall, percentAchieved, requiredMonthly };
  };

  const getInterpretation = (percent: number) => {
    if (percent >= 120) return 'Exceptional progress - you are on track to significantly exceed your goal.';
    if (percent >= 100) return 'Goal achieved! Your current plan is sufficient to reach your target.';
    if (percent >= 90) return 'Very close to target - minor adjustments can bridge the gap.';
    if (percent >= 75) return 'Good progress, but you may fall short without increasing contributions.';
    if (percent >= 50) return 'Moderate progress - significant changes needed to reach the full goal.';
    return 'Currently off track - immediate strategic changes are required.';
  };

  const getFeasibilityLevel = (percent: number) => {
    if (percent >= 100) return 'Very High';
    if (percent >= 85) return 'High';
    if (percent >= 70) return 'Moderate';
    if (percent >= 50) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (percent: number, shortfall: number, requiredMonthly: number) => {
    if (percent >= 100) return 'Consider setting a more ambitious goal or reducing risk exposure as you are comfortably on track.';
    if (percent >= 90) return `You are nearly there. Increase your monthly contribution slightly to ensure you hit the target safely.`;
    if (shortfall > 0) return `To bridge the gap of $${shortfall.toLocaleString(undefined, { maximumFractionDigits: 0 })}, consider increasing monthly savings to $${requiredMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`;
    return 'Review your budget to release more funds for investment or extend your timeline.';
  };

  const getStrength = (percent: number) => {
    if (percent >= 110) return 'Dominant';
    if (percent >= 100) return 'Strong';
    if (percent >= 80) return 'Stable';
    if (percent >= 60) return 'Marginal';
    return 'Critical';
  };

  const getInsights = (percent: number, requiredMonthly: number, currentMonthly: number, years: number) => {
    const insights = [];
    if (percent >= 100) {
      insights.push('You have a financial surplus buffer');
      insights.push('Opportunity to diversify into lower-risk assets');
      insights.push('Consider inflation-proofing your surplus');
    } else {
      const diff = requiredMonthly - currentMonthly;
      if (diff > 0) insights.push(`Increase monthly contribution by $${diff.toFixed(0)} to reach goal`);
      insights.push(`Extending timeline by ${Math.ceil(years * 0.2)} years could separate the gap`);
      insights.push('Review expense ratio of your investment vehicles');
    }
    if (years > 10) insights.push('Long time horizon allows for higher equity exposure');
    if (years < 5) insights.push('Short horizon suggests shifting to capital preservation');
    return insights;
  };

  const getRisks = (percent: number, years: number, r: number) => {
    const risks = [];
    risks.push('Inflation erodes real purchasing power of the goal');
    if (r > 12) risks.push('Assumed return rate is aggressive and high-risk');
    if (years > 15) risks.push('Long-term market cycles may impact average returns');
    if (percent < 50) risks.push('Compound interest works against you when starting late');
    risks.push('Tax liabilities on gains may reduce net maturity value');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const { totalFV, shortfall, percentAchieved, requiredMonthly } = calculate(values);

    setResult({
      projectedValue: totalFV,
      shortfall: shortfall > 0 ? shortfall : 0,
      percentAchieved,
      interpretation: getInterpretation(percentAchieved),
      feasibilityLevel: getFeasibilityLevel(percentAchieved),
      recommendation: getRecommendation(percentAchieved, shortfall, requiredMonthly),
      strength: getStrength(percentAchieved),
      insights: getInsights(percentAchieved, requiredMonthly, values.monthlyContribution, values.years),
      risks: getRisks(percentAchieved, values.years, values.annualReturn),
      requiredMonthly,
      requiredReturn: 0 // Placeholder, calculation complex for solving r
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Define your financial target and current investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Target Goal Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 1000000"
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
                  name="initialInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <WalletIcon className="h-4 w-4" />
                        Current Principal ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
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
                  name="monthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly Contribution ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2000"
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
                          placeholder="e.g., 8.5"
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
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Time Horizon (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
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
                Analyze Goals
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
                  <CardTitle>Investment Projection</CardTitle>
                  <CardDescription>Goal Feasibility Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <div className="flex flex-col items-center mt-2">
                  <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                  <p className={`text-sm font-medium mt-1 ${result.shortfall > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {result.shortfall > 0 ? `Shortfall of $${result.shortfall.toLocaleString()}` : `Surplus of $${(result.projectedValue - (form.getValues().goalAmount || 0)).toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Goal Coverage</p>
                  <Badge variant={result.percentAchieved >= 100 ? 'default' : result.percentAchieved >= 80 ? 'secondary' : result.percentAchieved >= 50 ? 'outline' : 'destructive'}>
                    {result.percentAchieved.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Plan Strength</p>
                  <Badge variant={result.strength === 'Dominant' || result.strength === 'Strong' ? 'default' : result.strength === 'Stable' ? 'secondary' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Required Monthly</p>
                  <p className="text-lg font-bold">${result.requiredMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
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
                <CardDescription>Strategies to secure your goal</CardDescription>
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
                <CardDescription>Potential hurdles to success</CardDescription>
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

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components that drive your investment trajectory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Capital Components
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The money you put to work in the market.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Initial Investment:</strong> The lump sum you have available today to start the portfolio.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Monthly Contribution:</strong> The disciplined addition of fresh capital, key to Dollar Cost Averaging.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Goal Amount:</strong> Your financial finish line (e.g., retirement corpus, house down payment).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                Growth Factors
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The variables that accelerate or decelerate your wealth creation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Annual Return:</strong> The compound annual growth rate (CAGR) you expect from your portfolio.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Time Horizon:</strong> The number of years the money stays invested. Time is the most potent multiplier in compounding.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Compounding Frequency:</strong> Assumed to be monthly in this calculator, matching contribution frequency.</span>
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
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              FV = P × (1 + r)ⁿ + PMT × [((1 + r)ⁿ - 1) / r]
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Where <strong>P</strong> is the initial principal, <strong>r</strong> is the monthly interest rate, <strong>n</strong> is the total number of months, and <strong>PMT</strong> is the monthly contribution.
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
            Tools to refine your investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">The 8th wonder of the world</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calculator</p>
                      <p className="text-sm text-muted-foreground">Real value adjustment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Retirement Planner</p>
                      <p className="text-sm text-muted-foreground">Long-term life goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/lump-sum-vs-sip-comparison-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Lump Sum vs SIP</p>
                      <p className="text-sm text-muted-foreground">Investment style analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/fire-financial-independence-retire-early-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">FIRE Calculator</p>
                      <p className="text-sm text-muted-foreground">Financial Independence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Ultimate Guide to Investment Goal Tracking: Planning, Strategy, and Execution" />
        <meta itemProp="description" content="A comprehensive masterclass on how to set, track, and achieve financial investment goals. Learn about compound interest mechanics, asset allocation, tax efficiency, and behavioral finance." />
        <meta itemProp="keywords" content="investment goal tracker, financial planning, compound interest, monthly contribution calculator, savings goal, wealth building strategies, asset allocation, tax efficiency, FIRE movement" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-15" />
        <meta itemProp="url" content="/definitive-investment-goal-guide" />

        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Financial Planning Masterclass</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">The Definitive Guide to Investment Goal Tracking: Turning Dreams into Data</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Master the art of reverse-engineering your financial success. This guide moves beyond simple calculations to explore the fundamental mechanics of wealth accumulation, the strategic levers at your disposal, and the psychological fortitude required to stay the course.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#importance" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Why Tracking is Non-Negotiable</a></li>
            <li><a href="#variables" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Four Pillars of Wealth</a></li>
            <li><a href="#strategy" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Strategic Levers: Closing the Gap</a></li>
            <li><a href="#taxes" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Tax Drag: Account Types</a></li>
            <li><a href="#risks" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Hidden Killers: Inflation & Volatility</a></li>
            <li><a href="#psychology" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Psychology of Compounding</a></li>
          </ul>
        </nav>

        {/* WHY TRACKING IS IMPORTANT */}
        <article id="importance" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Why Tracking Investment Goals is Non-Negotiable</h2>
          <p>
            Investing without a clear goal is akin to setting sail without a compass; you may be moving, but the probability of reaching a specific destination is statistically negligible. <strong>Goal-based investing</strong> represents a paradigm shift from the traditional "beat the market" mentality to a more personalized "meet your needs" approach.
          </p>
          <p>
            Research in behavioral economics suggests that individuals who actively track their financial goals are <strong>42% more likely to achieve them</strong>. This isn't magic; it's the result of the Feedback Loop. When you measure progress, you inevitably manage it. Tracking transforms the abstract concept of "saving for the future" into a concrete, gamified process where every dollar saved is a point on the scoreboard.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">The Power of Quantification</h3>
          <p>
            Most people harbor vague financial desires: "I want to be rich," "I want to retire comfortably," or "I want to send my kids to a good college." In the world of finance, these are merely wishes. A <strong>goal</strong> is distinct because it is SMART: Specific, Measurable, Achievable, Relevant, and Time-bound.
          </p>
          <p>
            For instance, replacing "I want to retire" with "I need a portfolio of $2.5 million by age 65 to generate $100,000 in annual passive income" changes everything. Once the target is quantified, the path reveals itself. You can mathematically determine that to hit $2.5M in 25 years at an 8% return, you need to invest exactly $2,630 per month. The vague wish has become an actionable directive.
          </p>
        </article>

        <hr className="border-border" />

        {/* THE FOUR PILLARS */}
        <article id="variables" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Four Pillars of Wealth Accumulation</h2>
          <p>
            Regardless of whether you are a billionaire hedge fund manager or a college student saving for a laptop, the mathematics of wealth accumulation are governed by the same four immutable variables. Understanding how they interact is the key to manipulating your financial outcome.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
            <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">1. Principal (The Seed)</h3>
              <p className="text-sm text-blue-700/80 dark:text-blue-400/80">
                The starting amount. While a larger lump sum provides a significant head start, it is not the sole determinant of success. The "magic" of compounding can turn even a modest seed into a forest given enough time.
              </p>
            </div>
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">2. Contributions (The Water)</h3>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">
                The recurring addition of capital. This is the variable most under your control. In the accumulation phase, your savings rate (income minus expenses) is far more critical than your investment returns.
              </p>
            </div>
            <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-300 mb-2">3. Rate of Return (The Sun)</h3>
              <p className="text-sm text-purple-700/80 dark:text-purple-400/80">
                The velocity of growth. It is the reward for accepting risk. While you cannot control the market, you can control your asset allocation (stocks vs bonds) which dictates your expected long-term return.
              </p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">4. Time (The Season)</h3>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                The exponent in the equation. Time does the heavy lifting. Due to exponential growth, the money invested in your 20s is worth significantly more than money invested in your 50s.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mt-6">Deep Dive: The Rule of 72</h3>
          <p>
            To quickly estimate the power of the "Rate of Return," investors use the <strong>Rule of 72</strong>. Divide 72 by your annual interest rate to see how many years it takes for your money to double.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>At <strong>4%</strong> (High Yield Savings), money doubles every <strong>18 years</strong>.</li>
            <li>At <strong>8%</strong> (Stock Market Average), money doubles every <strong>9 years</strong>.</li>
            <li>At <strong>12%</strong> (Aggressive Growth), money doubles every <strong>6 years</strong>.</li>
          </ul>
          <p>
            This simple heuristic demonstrates why chasing yield (within reason) can shave decades off your working life.
          </p>
        </article>

        <hr className="border-border" />

        {/* STRATEGIC LEVERS */}
        <article id="strategy" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Strategic Levers: How to Close the Gap</h2>
          <p>
            When this calculator displays a "Shortfall" or a "Required Monthly Contribution" that seems impossible, do not despair. This is simply data informing you that the current equation is unbalanced. You have four levers to pull to realign your trajectory.
          </p>

          <div className="space-y-6 mt-6">
            <div className="flex gap-4">
              <div className="flex-none pt-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Save More (Increase PMT)</h4>
                <p>The safest and most reliable lever. It involves widening the gap between income and expense. This might mean negotiating a raise, starting a side hustle, or optimizing major expenses like housing and transportation. Even an extra $500/month invested at 8% over 30 years adds nearly <strong>$750,000</strong> to your final balance.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none pt-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Take More Risk (Increase r)</h4>
                <p>If you cannot save more, your capital must work harder. This implies shifting your asset allocation. For example, moving from a 60/40 Stock/Bond portfolio to an 80/20 split could increase your expected return by 1-2%. However, remember that risk is the price you pay for return. Higher exposure means enduring deeper drawdowns during recessions.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none pt-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Wait Longer (Increase n)</h4>
                <p>Pushing back your goal date is a powerful lever. Retiring at 67 instead of 65 does two things: it gives your pot 2 more years to grow (accumulation) and reduces the time you need to live off it by 2 years (decumulation). It is the most effective "bailout" for a plan that is falling short.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-none pt-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Lower the Bar (Decrease Goal)</h4>
                <p>Often, the goal itself is inflated. Do you really need $100,000/year in retirement, or could you live happily on $80,000? Re-evaluating needs versus wants can instantly transform an "Impossible" plan into an "Achievable" one.</p>
              </div>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        {/* TAX EFFICIENCY */}
        <article id="taxes" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Tax Drag: Location Matters</h2>
          <p>
            It's not just what you earn, but what you keep. Taxes act as a constant drag on your compounding velocity. A pre-tax return of 10% might only be 7% after taxes, significantly altering your trajectory. Where you locate your assets is as important as what assets you choose.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">The Three Buckets of Money</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Taxable (Brokerage Accounts):</strong> You pay tax on dividends and realizable gains every year. <em>Good for:</em> Liquidity, buying a house, retiring before 59½.
            </li>
            <li>
              <strong>Tax-Deferred (Traditional 401k/IRA):</strong> You get a tax break now, but pay income tax on withdrawals later. <em>Good for:</em> High earners trying to lower current tax brackets.
            </li>
            <li>
              <strong>Tax-Exempt (Roth IRA/401k):</strong> You pay tax now, but the money grows tax-free forever. <em>Good for:</em> Young earners, expecting higher taxes in the future.
            </li>
          </ul>
          <p>
            <strong>Pro Tip:</strong> For this calculator, if you are investing in a Taxable account, ensure you input an "After-Tax" rate of return estimates to stay realistic.
          </p>
        </article>

        <hr className="border-border" />

        {/* RISKS AND INFLATION */}
        <article id="risks" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Hidden Killers: Inflation and Volatility</h2>
          <p>
            Even with a perfect plan, two invisible forces work tirelessly to undermine your wealth: <strong>Inflation</strong> and <strong>Volatility</strong>.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">The Silent Thief: Inflation</h3>
          <p>
            Inflation is the gradual loss of purchasing power. A million dollars in 1990 is vastly different from a million dollars in 2030. If inflation averages 3%, the value of your money is cut in half roughly every 24 years.
          </p>
          <p>
            When utilizing this calculator, you have two choices:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Use Nominal Dollars:</strong> Project a future amount (e.g., $2M) but mentally understand that $2M won't buy as much then as it does today.</li>
            <li><strong>Use Real Returns:</strong> Subtract inflation from your return rate. If you expect 8% market returns and 3% inflation, use a 5% return rate in the calculator. This inputs "Today's Dollars," meaning if the result says $1M, it will buy $1M worth of goods in today's terms.</li>
          </ol>

          <h3 className="text-xl font-semibold text-foreground mt-6">Sequence of Returns Risk</h3>
          <p>
            Averages are misleading. If you dip your head in the fridge and feet in the oven, on average you are comfortable, but in reality, you are dead. Similarly, the market might "average" 8%, but the <em>sequence</em> matters.
          </p>
          <p>
            If a major market crash (-40%) happens in the year just before you plan to cash out (e.g., the year before your child starts college or you retire), your plan fails, even if the 30-year average was fine. This is why you must use a <strong>Glide Path</strong>: slowly shifting from volatile stocks to stable bonds as you approach your goal date.
          </p>
        </article>

        <hr className="border-border" />

        {/* PSYCHOLOGY */}
        <article id="psychology" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Psychology of Long-Term Investing</h2>
          <p>
            The math of investing is simple; simple additions and multiplications. The behavior of investing is excruciatingly hard. The biggest enemy of the long-term investor is not the market, the economy, or the government—it is the person in the mirror.
          </p>

          <div className="bg-muted p-6 rounded-lg my-6">
            <h4 className="font-bold mb-2">Common Behavioral Traps:</h4>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Recency Bias:</strong> Start thinking that the last 6 months of performance will continue forever. (e.g., "Tech stocks only go up!").</li>
              <li><strong>Loss Aversion:</strong> Feeling the pain of a $1,000 loss twice as intensely as the joy of a $1,000 gain, leading to panic selling at the bottom.</li>
              <li><strong>Action Bias:</strong> The feeling that you must "do something" when headlines are scary. Usually, in investing, the best action is inaction.</li>
            </ul>
          </div>

          <p>
            Using a calculator like this serves a crucial psychological function: it anchors you. When the market drops 20% and the news screams "Recession," looking at your 20-year trajectory reminds you that this is just a blip in the data. It shifts your focus from the scary "Now" to the wealthy "Later."
          </p>
        </article>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about investment planning and goal tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I determine a realistic annual return rate?</h4>
              <p className="text-muted-foreground">
                For a diversified stock portfolio (e.g., S&P 500), historical averages are around 9-10% (nominal) or 6-7% (real, after inflation). For conservative portfolios with bonds, expect 4-6%. Always err on the side of caution; assuming a 15% return is dangerous and unrealistic over long periods.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I adjust my goal for inflation?</h4>
              <p className="text-muted-foreground">
                Yes, absolutely. If you need $50,000/year purchasing power in 20 years, and inflation is 3%, you actually need to target roughly $90,000/year in nominal terms. You can handle this by either increasing your goal amount or subtracting the inflation rate from your expected return rate (using the real rate of return).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if I miss a monthly contribution?</h4>
              <p className="text-muted-foreground">
                Missing one month won't ruin your plan, but habitual inconsistency will. The "cost" of missing a contribution isn't just the cash amount; it's the lost decades of compounding on that cash. Try to make up missed contributions when possible, or recalculate your plan to see the impact.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I rebalance my portfolio?</h4>
              <p className="text-muted-foreground">
                Most experts recommend rebalancing annually or semi-annually. Rebalancing forces you to "buy low and sell high" by selling assets that have grown beyond their target allocation and buying those that have lagged, maintaining your desired risk profile.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is it better to invest a lump sum or dollar cost average (DCA)?</h4>
              <p className="text-muted-foreground">
                Statistically, investing a lump sum immediately outperforms DCA about 66% of the time because markets trend up. However, DCA provides psychological safety and reduces the risk of investing everything at a market peak. The best approach is the one that gets you invested and keeps you sleeping at night.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this calculator account for taxes?</h4>
              <p className="text-muted-foreground">
                No, this calculator shows gross growth. In a taxable account, you must pay capital gains tax on profits. In tax-advantaged accounts (like 401ks), you pay tax on withdrawal. In Roth accounts, growth is tax-free. Decrease your "Annual Return" input by 1-2% to roughly approximate the drag of taxes if using a taxable account.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I track short-term goals with this?</h4>
              <p className="text-muted-foreground">
                Yes, but short-term goals (under 5 years) should not be invested in volatile stocks. For short horizons, use High-Yield Savings Accounts (HYSA) or CDs and input a lower return rate (e.g., 3-5%) to ensure capital preservation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Rule of 72"?</h4>
              <p className="text-muted-foreground">
                The Rule of 72 is a mental shortcut to estimate how long it takes to double your money. Divide 72 by your annual interest rate. At 8% return, your money doubles every 9 years (72 / 8 = 9). This helps visualize the exponential nature of compounding.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why does the calculator show a shortfall even with high contributions?</h4>
              <p className="text-muted-foreground">
                This often happens if the time horizon is too short. Compounding needs time to work. If you are starting late, the math is unforgiving—you simply must save a much higher percentage of your income to reach the same goal as someone who started ten years earlier.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How specific should my goal amount be?</h4>
              <p className="text-muted-foreground">
                It's fine to estimate, but try to base it on reality. For retirement, a common rule of thumb is the "4% Rule"—you need 25 times your annual expenses. If you need $40,000/year, your goal is $1 million.
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
                <strong className="block text-primary mb-1">Retirement Planners</strong>
                <span className="text-sm text-muted-foreground">Individuals focused on building a nest egg (FIRE, traditional retirement) to see if their savings rate is sufficient.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Parents Saving for Education</strong>
                <span className="text-sm text-muted-foreground">To determine how much to contribute monthly to a 529 plan to cover future tuition costs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Home Buyers</strong>
                <span className="text-sm text-muted-foreground">To calculate how long it will take to accumulate a 20% down payment based on current savings.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Advisors</strong>
                <span className="text-sm text-muted-foreground">To demonstrate the impact of increasing contributions or changing asset allocation to clients.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Linear Returns assumption:</strong> Returns are never linear. Market crashes and booms happen. This calculator assumes a steady average, which smooths out the rough ride of reality.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Tax Drag:</strong> Without explicit tax inputs, this shows "gross" growth. Your "net" spendable amount may be 15-30% lower depending on jurisdiction and account type.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Changing Variables:</strong> Life is dynamic. You might lose a job, get a raise, or inherit money. A static calculator cannot predict these life events—regular updates are required.</span>
              </li>
            </ul>
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
          <p>The Investment Goal Tracker serves as your financial GPS, helping you navigate from where you are to where you want to be.</p>
          <p>By inputting your target, timeline, and savings capacity, it demystifies the path to wealth using proven time-value-of-money formulas.</p>
          <p>Regularly consulting this tool ensures you stay accountable to your future self, allowing for timely course corrections before small gaps become unbridgeable chasms.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function WalletIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-8Z" />
    </svg>
  )
}
