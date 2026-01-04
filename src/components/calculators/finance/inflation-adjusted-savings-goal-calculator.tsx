'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowUpRight, Scale, PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentCost: z.number().min(0, 'Cost must be positive'),
  years: z.number().positive('Years must be positive').max(50, 'Projection limited to 50 years'),
  inflationRate: z.number().min(0).max(50, 'Inflation rate limited to 50%'),
  investmentReturn: z.number().min(0).max(50, 'Return rate limited to 50%'),
  currentSavings: z.number().min(0, 'Savings cannot be negative').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InflationAdjustedSavingsGoalCalculator() {
  const [result, setResult] = useState<{
    futureCost: number;
    totalInflationImpact: number;
    monthlySavingsNeeded: number;
    purchasingPowerLoss: number;
    realReturn: number;
    interpretation: string;
    actionableAdvice: string;
    impactLevel: string;
    steps: string[];
    warnings: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCost: undefined,
      years: undefined,
      inflationRate: undefined,
      investmentReturn: undefined,
      currentSavings: 0,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Future Cost of the Goal
    const futureCost = v.currentCost * Math.pow(1 + v.inflationRate / 100, v.years);
    const totalInflationImpact = futureCost - v.currentCost;

    // 2. Calculate Growth of Current Savings
    const r = v.investmentReturn / 100;
    const n_months = v.years * 12;
    const r_monthly = r / 12;

    const currentSavingsFV = (v.currentSavings || 0) * Math.pow(1 + r, v.years);

    // 3. Determine Remaining Amount Needed
    const shortfall = futureCost - currentSavingsFV;

    // 4. Calculate Monthly Savings Needed (PMT)
    // PMT = FV / [((1 + r)^n - 1) / r]
    let monthlySavingsNeeded = 0;
    if (shortfall > 0) {
      if (r === 0) {
        monthlySavingsNeeded = shortfall / n_months;
      } else {
        monthlySavingsNeeded = shortfall / ((Math.pow(1 + r_monthly, n_months) - 1) / r_monthly);
      }
    }

    // 5. Purchasing Power Insight (What $1 saved today is worth in future terms)
    // Value = 1 / (1+i)^n
    const purchasingPowerRetention = 1 / Math.pow(1 + v.inflationRate / 100, v.years);
    const purchasingPowerLoss = 1 - purchasingPowerRetention;

    // 6. Real Rate of Return
    // (1+n)/(1+i) - 1
    const realReturn = ((1 + r) / (1 + v.inflationRate / 100)) - 1;

    return { futureCost, totalInflationImpact, monthlySavingsNeeded, purchasingPowerLoss, realReturn };
  };

  const getInterpretation = (inflationCost: number, years: number) => {
    if (years < 5) return 'Short-term inflation impact is noticeable but manageable.';
    if (inflationCost > 100000) return 'Inflation is drastically increasing your funding requirement over this long period.';
    return 'Inflation is steadily eroding the value of your target, requiring aggressive saving.';
  };

  const getAdvice = (realReturn: number, savings: number) => {
    if (realReturn < 0) return 'Your investments are growing slower than inflation. You are technically losing wealth. Consider higher-yield assets.';
    if (realReturn < 0.02) return 'You are barely beating inflation. Your purchasing power is preserved, but growth is minimal.';
    return 'Excellent. Your investment strategy is outpacing inflation, effectively reducing the burden of saving.';
  };

  const onSubmit = (values: FormValues) => {
    const { futureCost, totalInflationImpact, monthlySavingsNeeded, purchasingPowerLoss, realReturn } = calculate(values);

    const steps = [];
    steps.push(`Update your mental target from $${values.currentCost.toLocaleString()} to $${futureCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`);
    if (monthlySavingsNeeded > 0) steps.push(`Set up an automatic transfer of $${monthlySavingsNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })} monthly.`);
    if (values.investmentReturn <= values.inflationRate) steps.push('Reivew your asset allocation to find returns that beat inflation.');

    const warnings = [];
    if (values.inflationRate > 5) warnings.push('High inflation environments make holding cash extremely dangerous.');
    if (values.years > 20) warnings.push('Over very long periods, even small changes in inflation rates have massive effects.');

    setResult({
      futureCost,
      totalInflationImpact,
      monthlySavingsNeeded: monthlySavingsNeeded > 0 ? monthlySavingsNeeded : 0,
      purchasingPowerLoss: purchasingPowerLoss * 100,
      realReturn: realReturn * 100,
      interpretation: getInterpretation(totalInflationImpact, values.years),
      actionableAdvice: getAdvice(realReturn, values.currentSavings || 0),
      impactLevel: totalInflationImpact > values.currentCost * 0.5 ? 'Severe' : totalInflationImpact > values.currentCost * 0.2 ? 'Moderate' : 'Low',
      steps,
      warnings
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Inflation Adjuster
          </CardTitle>
          <CardDescription>
            Calculate the true future cost of your financial goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Cost of Goal ($)
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
                  name="years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Years to Purchase
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

                <FormField
                  control={form.control}
                  name="inflationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Expected Inflation Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 3.5"
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
                  name="investmentReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Investment Return Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 7.0"
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
                  name="currentSavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Existing Savings ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Current amount saved (optional)"
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
                Calculate Future Value
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
                  <CardTitle>Future Cost Projection</CardTitle>
                  <CardDescription>The real price of waiting</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Future Price Tag</p>
                <p className="text-4xl font-extrabold text-primary mt-1">${result.futureCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-lg text-red-600 mt-2 flex items-center justify-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Inflation added ${result.totalInflationImpact.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PiggyBank className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Save Monthly</p>
                  <p className="text-lg font-bold">${result.monthlySavingsNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Value Erosion</p>
                  <Badge variant="destructive">
                    -{result.purchasingPowerLoss.toFixed(1)}% / Dollar
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Real Return</p>
                  <p className={`text-lg font-bold ${result.realReturn > 0 ? 'text-green-600' : 'text-red-600'}`}>{result.realReturn.toFixed(2)}%</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Insight:</strong> {result.actionableAdvice}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Action Plan
                </CardTitle>
                <CardDescription>Steps to beat inflation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{step}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Critical Warnings
                </CardTitle>
                <CardDescription>Risks to your goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.warnings.map((warn, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{warn}</span>
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
            Understanding Inflation Mechanics
          </CardTitle>
          <CardDescription>
            Why money loses value over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Nominal vs Real
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The number on the bill vs what it feels like to pay.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Nominal Cost:</strong> The price tag you will see in the future shop window (e.g., $75,000 for a car).</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Real Cost:</strong> The cost adjusted to today's money. It helps you understand the "effort" required to buy it.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingDown className="h-4 w-4" />
                The Rate Gap
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The battle between your savings and inflation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Positive Real Return:</strong> Investment Rate &gt; Inflation Rate. You are getting richer.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Negative Real Return:</strong> Investment Rate &lt; Inflation Rate. You are slowly going broke (purchasing power wise).</span>
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
            The Inflation Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Future Cost = Current Cost × (1 + Inflation Rate)ⁿ
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Real Return ≈ Nominal Return - Inflation Rate
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This is the standard Compound Annual Growth Rate (CAGR) formula applied to prices. The approximation for real return is useful for quick mental math, though the precise formula is <em>(1+Nominal)/(1+Inflation) - 1</em>.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            More ways to optimize your financial planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calc</p>
                      <p className="text-sm text-muted-foreground">Historical inflation impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/real-rate-of-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Real ROR Calc</p>
                      <p className="text-sm text-muted-foreground">True investment growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/investment-goal-tracker-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Goal Tracker</p>
                      <p className="text-sm text-muted-foreground">General saving goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Retirement Calc</p>
                      <p className="text-sm text-muted-foreground">Long-term inflation plan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Wealth accumulation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cost-of-living-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Cost of Living</p>
                      <p className="text-sm text-muted-foreground">Lifestyle comparison</p>
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
        <meta itemProp="name" content="Impact of Inflation on Savings Goals: The Silent Wealth Destroyer" />
        <meta itemProp="description" content="Learn how inflation erodes your future purchasing power and how to adjust your savings goals to ensure you can actually afford what you are saving for." />
        <meta itemProp="keywords" content="inflation adjusted savings calculator, future value of money, real rate of return, purchasing power calculator, financial planning inflation" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-11-25" />
        <meta itemProp="url" content="/inflation-adjusted-savings-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Inflation: The Silent Tax on Your Savings Goals</h1>
        <p className="text-lg italic text-muted-foreground">Why saving $1 million for retirement might only feel like saving $500,000, and how to fix your plan before it's too late.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#whatis" className="hover:underline">What is Inflation?</a></li>
          <li><a href="#impact" className="hover:underline">The "Rule of 72" for Costs</a></li>
          <li><a href="#planning" className="hover:underline">Planning for Real Returns</a></li>
          <li><a href="#sectors" className="hover:underline">Sector-Specific Inflation (Healthcare & Education)</a></li>
          <li><a href="#defense" className="hover:underline">How to Defend Your Wealth</a></li>
        </ul>
        <hr />

        {/* WHAT IS INFLATION */}
        <h2 id="whatis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Inflation?</h2>
        <p>Inflation is the rate at which the general level of prices for goods and services is rising. Consequently, the purchasing power of currency is falling. It is often described as "too much money chasing too few goods."</p>
        <p>If the inflation rate is 3%, a loaf of bread that costs $1.00 this year will cost $1.03 next year. This sounds small, but over decades, it is devastating.</p>

        <hr />

        {/* THE RULE OF 72 FOR COSTS */}
        <h2 id="impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Rule of 72" for Costs</h2>
        <p>Just as the Rule of 72 tells you how fast your investment doubles, it also tells you how fast your expenses double.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>At <strong>3% inflation</strong>, prices double every 24 years (72 ÷ 3).</li>
          <li>At <strong>6% inflation</strong>, prices double every 12 years (72 ÷ 6).</li>
        </ul>
        <p>If you are 30 years old and planning to retire at 60, a 3% average inflation rate means your cost of living will <strong>double</strong> by the time you retire. If you need $50,000/year to live now, you will need $100,000/year then just to maintain the <em>exact same lifestyle</em>.</p>

        <hr />

        {/* PLANNING FOR REAL RETURNS */}
        <h2 id="planning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Planning for Real Returns</h2>
        <p>The most important metric in long-term investing is not the Nominal Return (what the bank tells you) but the <strong>Real Return</strong>.</p>
        <div className="p-4 bg-muted border-l-4 border-primary my-4">
          <p className="font-semibold">Real Return ≈ Nominal Return - Inflation Rate</p>
        </div>
        <p>If your high-yield savings account pays 4% interest, but inflation is 3.5%, your real wealth is only growing by 0.5% per year. If you are taxed on that interest, you might actually be losing money.</p>

        <hr />

        {/* SECTORS */}
        <h2 id="sectors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sector-Specific Inflation</h2>
        <p>The Consumer Price Index (CPI) is an average. However, certain sectors notoriously inflate faster than the average.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Education</h3>
        <p>College tuition costs have historically risen at 2x the rate of general inflation. If you are saving for a child's education, using a standard 3% inflation assumption will leave you drastically underfunded.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Healthcare</h3>
        <p>Medical costs also trend significantly higher than CPI. For retirement planning, where healthcare is a major expense, it is prudent to assume a higher inflation rate (e.g., 5-6%) for that portion of your budget.</p>

        <hr />

        {/* DEFENSE */}
        <h2 id="defense" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Defend Your Wealth</h2>
        <p>You cannot stop inflation, but you can hedge against it.</p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Invest in Equities:</strong> Stocks represent ownership in businesses. As prices rise, businesses earn more revenue, and stock prices generally track or exceed inflation over the long term.</li>
          <li><strong>Real Estate:</strong> Property values and rents tend to rise with inflation, acting as a natural hedge.</li>
          <li><strong>TIPS (Treasury Inflation-Protected Securities):</strong> These are government bonds specifically designed to increase their payout as inflation rises.</li>
          <li><strong>Gold/Commodities:</strong> Often viewed as a store of value when fiat currencies weaken, though they can be volatile.</li>
        </ol>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Inflation and Savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a normal inflation rate?</h4>
              <p className="text-muted-foreground">
                Central banks (like the Federal Reserve) usually target an inflation rate of around 2%. However, historically, it fluctuates. In the 1970s, it hit double digits; recently, it has been higher than normal. A prudent long-term planning assumption is 3-3.5%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does inflation affect debt?</h4>
              <p className="text-muted-foreground">
                Yes, but in a good way for borrowers! Inflation helps you pay off fixed-rate debt with "cheaper" current dollars. If you have a 30-year fixed mortgage, the payment stays the same while your salary (hopefully) rises with inflation, effectively making the debt easier to service over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I use the current inflation rate for 20-year projections?</h4>
              <p className="text-muted-foreground">
                No. Current rates can be outliers. It's better to use a long-term historical average (like 3%) for multi-decade goals to smooth out short-term volatility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Shrinkflation"?</h4>
              <p className="text-muted-foreground">
                This is when manufacturers reduce the size or quantity of a product while keeping the price the same. It is a stealthy form of inflation often seen in groceries and household goods.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect my 401(k) / retirement withdrawal?</h4>
              <p className="text-muted-foreground">
                It increases the amount you need to withdraw. If you follow the 4% Rule, you withdraw 4% in the first year, and then increase that dollar amount by the inflation rate every subsequent year to maintain your standard of living.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Are savings accounts useless then?</h4>
              <p className="text-muted-foreground">
                Not useless, but they are for *preservation* and *safety*, not growth. Your emergency fund should be in a savings account despite inflation because you need the liquidity and stability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is Hyperinflation?</h4>
              <p className="text-muted-foreground">
                Hyperinflation is extremely rapid and out-of-control inflation (usually &gt;50% per month). It effectively renders a currency worthless. While rare in stable economies, it is a catastrophic economic event (e.g., Zimbabwe, Venezuela).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate my personal inflation rate?</h4>
              <p className="text-muted-foreground">
                Track your actual spending year over year. If you spend mostly on education, healthcare, and rent, your personal inflation rate might be much higher than the official government CPI number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can deflation happen?</h4>
              <p className="text-muted-foreground">
                Yes, deflation is when prices fall. While it sounds good for consumers, it is often bad for the economy (leading to recession/job loss) because people delay purchases expecting lower prices later, stalling economic activity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is 2% the magic target?</h4>
              <p className="text-muted-foreground">
                Economists believe a small amount of inflation stimulates spending (better to buy now than later) and allows wages to adjust more easily. 0% inflation risks deflation spirals.
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
                <strong className="block text-primary mb-1">Long-term Planners</strong>
                <span className="text-sm text-muted-foreground">Anyone planning for goals &gt;5 years away (Retirement, Education, Home Buying).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirees</strong>
                <span className="text-sm text-muted-foreground">To estimate how much their annual spending needs will grow over a 20-30 year retirement.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Salary Negotiators</strong>
                <span className="text-sm text-muted-foreground">To understand if a 2% raise is actually a pay cut in real terms (if inflation is 4%).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Policy Enthusiasts</strong>
                <span className="text-sm text-muted-foreground">To visualize the long-term impact of fiscal policy and currency devaluation on personal wealth.</span>
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
                <span><strong>Personal Inflation Rate:</strong> Your personal inflation might differ from the CPI. If you rent in a hot market or have high medical bills, your inflation is higher than average.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Variable Rates:</strong> Inflation is never static. It can be 2% for a decade and then strike at 9% for two years. A flat rate input is an approximation.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Tax Drag:</strong> Taxes on investment gains often apply to the <em>nominal</em> gain, not the real gain, which can exacerbate the inflation problem (taxing phantom gains).</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">The 1970s Stagflation</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  During the late 1970s, US inflation hit ~14%. Cash savers were decimated. Even those getting 10% interest were losing 4% of their purchasing power annually.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">The Post-2008 Great Moderation</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  From 2009-2020, inflation was historically low (~1.5%). This allowed savers to get complacent, often underestimating the sudden spike that occurred in 2021-2022.
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
          <p>The Inflation Adjusted Savings Goal Calculator provides the "Real" picture of your financial future.</p>
          <p>It exposes the hidden erosion of purchasing power, ensuring that you don't just hit a nominal number, but actually afford the lifestyle you are planning for.</p>
          <p>Use this tool to realistic-check every long-term financial target you have set.</p>
        </CardContent>
      </Card>
    </div>
  );
}
