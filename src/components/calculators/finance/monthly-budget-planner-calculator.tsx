'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, PieChart, Wallet, CreditCard, ShoppingBag, Home, FunctionSquare, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  // Income
  salary: z.number().min(0).describe("Net monthly salary (take-home pay)."),
  sideHustle: z.number().min(0).optional().describe("Freelance, part-time, or bonus income."),
  otherIncome: z.number().min(0).optional().describe("Passive income, dividends, support."),

  // Needs (50%)
  housing: z.number().min(0).describe("Rent/Mortgage, property tax, insurance."),
  utilities: z.number().min(0).describe("Electricity, water, gas, internet, phone."),
  groceries: z.number().min(0).describe("Essential food and household supplies."),
  transport: z.number().min(0).describe("Car payment, gas, public transit."),
  insurance: z.number().min(0).describe("Health, life, and medical costs."),
  minDebt: z.number().min(0).describe("Minimum required payments on loans/cards."),

  // Wants (30%)
  dining: z.number().min(0).optional().describe("Restaurants, coffee shops, takeout."),
  entertainment: z.number().min(0).optional().describe("Movies, concerts, streaming services."),
  shopping: z.number().min(0).optional().describe("Clothing, electronics, non-essentials."),
  travel: z.number().min(0).optional().describe("Vacations, weekend trips."),

  // Savings (20%)
  emergencyFund: z.number().min(0).optional().describe("Contributions to cash reserves."),
  retirement: z.number().min(0).optional().describe("401k, IRA contributions (from net pay)."),
  extraDebt: z.number().min(0).optional().describe("Debt payments above the minimum."),
});

type FormValues = z.infer<typeof formSchema>;

export default function MonthlyBudgetPlannerCalculator() {
  const [result, setResult] = useState<{
    totalIncome: number;
    totalNeeds: number;
    totalWants: number;
    totalSavings: number;
    totalExpenses: number;
    remaining: number;
    ratios: { needs: number; wants: number; savings: number };
    interpretation: string;
    financialHealth: string;
    recommendation: string;
    insights: string[];
    actionableTips: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salary: undefined,
      sideHustle: 0,
      otherIncome: 0,
      housing: undefined,
      utilities: undefined,
      groceries: undefined,
      transport: undefined,
      insurance: undefined,
      minDebt: undefined,
      dining: 0,
      entertainment: 0,
      shopping: 0,
      travel: 0,
      emergencyFund: 0,
      retirement: 0,
      extraDebt: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const totalIncome = (v.salary || 0) + (v.sideHustle || 0) + (v.otherIncome || 0);

    const needs = (v.housing || 0) + (v.utilities || 0) + (v.groceries || 0) + (v.transport || 0) + (v.insurance || 0) + (v.minDebt || 0);
    const wants = (v.dining || 0) + (v.entertainment || 0) + (v.shopping || 0) + (v.travel || 0);
    const savings = (v.emergencyFund || 0) + (v.retirement || 0) + (v.extraDebt || 0);

    const totalExpenses = needs + wants + savings;
    const remaining = totalIncome - totalExpenses;

    if (totalIncome === 0) return null;

    const ratios = {
      needs: (needs / totalIncome) * 100,
      wants: (wants / totalIncome) * 100,
      savings: (savings / totalIncome) * 100
    };

    return {
      totalIncome,
      totalNeeds: needs,
      totalWants: wants,
      totalSavings: savings,
      totalExpenses,
      remaining,
      ratios
    };
  };

  const getFinancialHealth = (ratios: { needs: number; wants: number; savings: number }, remaining: number) => {
    if (remaining < 0) return 'Deficit';
    if (ratios.savings >= 20 && ratios.needs <= 50) return 'Excellent';
    if (ratios.savings >= 10 && remaining >= 0) return 'Stable';
    if (ratios.savings < 5) return 'Vulnerable';
    return 'Imbalanced';
  };

  const getInterpretation = (health: string, remaining: number) => {
    if (health === 'Deficit') return `You are overspending by $${Math.abs(remaining).toFixed(0)} per month. Immediate cuts are needed.`;
    if (health === 'Excellent') return 'You have mastered the budget! Your allocation is optimal for wealth building.';
    if (health === 'Stable') return 'Your finances are solid, though there is room to optimize for higher savings.';
    if (health === 'Vulnerable') return 'You are living paycheck to paycheck with little margin for error.';
    return 'Your spending is covered, but your allocation may be risky.';
  };

  const getInsights = (ratios: { needs: number; wants: number; savings: number }) => {
    const insights = [];
    if (ratios.needs > 50) insights.push(`Needs are ${ratios.needs.toFixed(1)}% of income (Target: 50%). Review housing and car costs.`);
    else insights.push(`Great job keeping fixed costs low (${ratios.needs.toFixed(1)}%).`);

    if (ratios.wants > 30) insights.push(`Wants are ${ratios.wants.toFixed(1)}% of income (Target: 30%). Consider cutting discretionary spending.`);

    if (ratios.savings < 20) insights.push(`Savings rate is only ${ratios.savings.toFixed(1)}% (Target: 20%+). Try to automate transfers.`);
    else insights.push(`Excellent savings rate of ${ratios.savings.toFixed(1)}%.`);

    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) {
      const health = getFinancialHealth(res.ratios, res.remaining);
      setResult({
        ...res,
        financialHealth: health,
        interpretation: getInterpretation(health, res.remaining),
        recommendation: health === 'Deficit' ? 'Stop all non-essential spending immediately. Audit fixed costs.' : 'Automate your savings to ensure consistency.',
        insights: getInsights(res.ratios),
        actionableTips: [
          res.ratios.wants > 30 ? 'Try a "No Spend Month" to reset habits.' : 'Maintain your disciplined discretionary spending.',
          res.ratios.savings < 10 ? 'Start with a 1% increase in savings next month.' : 'Consider investing surplus in a brokerage account.',
          res.ratios.needs > 60 ? 'Consider house hacking or downsizing if housing is >40%.' : 'Your foundation is solid.'
        ]
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Input
          </CardTitle>
          <CardDescription>
            Enter your monthly net income and expenses (categorized)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Income */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-green-600 flex items-center gap-2">
                  <Wallet className="h-4 w-4" /> Income (Net / Take-Home)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="salary" render={({ field }) => (
                    <FormItem><FormLabel>Primary Salary</FormLabel><FormControl><Input type="number" placeholder="Salary" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="sideHustle" render={({ field }) => (
                    <FormItem><FormLabel>Side Hustle / Bonus</FormLabel><FormControl><Input type="number" placeholder="Extra income" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="otherIncome" render={({ field }) => (
                    <FormItem><FormLabel>Other Income</FormLabel><FormControl><Input type="number" placeholder="Dividends, etc." {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Needs */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-blue-600 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Essential Needs (Fixed Costs)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="housing" render={({ field }) => (
                    <FormItem><FormLabel>Housing</FormLabel><FormControl><Input type="number" placeholder="Rent/Mortgage" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="Bills" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="groceries" render={({ field }) => (
                    <FormItem><FormLabel>Groceries</FormLabel><FormControl><Input type="number" placeholder="Food" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transport" render={({ field }) => (
                    <FormItem><FormLabel>Transport</FormLabel><FormControl><Input type="number" placeholder="Car/Transit" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem><FormLabel>Insurance</FormLabel><FormControl><Input type="number" placeholder="Medical/Life" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="minDebt" render={({ field }) => (
                    <FormItem><FormLabel>Minimum Debt</FormLabel><FormControl><Input type="number" placeholder="Min Payments" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Wants */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-purple-600 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Discretionary Wants
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="dining" render={({ field }) => (
                    <FormItem><FormLabel>Dining Out</FormLabel><FormControl><Input type="number" placeholder="Restaurants" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="entertainment" render={({ field }) => (
                    <FormItem><FormLabel>Entertainment</FormLabel><FormControl><Input type="number" placeholder="Movies, Subs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="shopping" render={({ field }) => (
                    <FormItem><FormLabel>Shopping</FormLabel><FormControl><Input type="number" placeholder="Clothes, Tech" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="travel" render={({ field }) => (
                    <FormItem><FormLabel>Travel/Leisure</FormLabel><FormControl><Input type="number" placeholder="Vacations" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              {/* Savings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-amber-600 flex items-center gap-2">
                  <Landmark className="h-4 w-4" /> Savings & Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="emergencyFund" render={({ field }) => (
                    <FormItem><FormLabel>Emergency Fund</FormLabel><FormControl><Input type="number" placeholder="Contributions" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="retirement" render={({ field }) => (
                    <FormItem><FormLabel>Retirement/Investing</FormLabel><FormControl><Input type="number" placeholder="Investments" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="extraDebt" render={({ field }) => (
                    <FormItem><FormLabel>Extra Debt Payoff</FormLabel><FormControl><Input type="number" placeholder="Above Minimum" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Budget
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
                <PieChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Budget Analysis</CardTitle>
                  <CardDescription>Breakdown based on the 50/30/20 Rule</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {result.remaining >= 0 ? '+' : ''}${result.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border-t-4 border-blue-500">
                  <p className="font-semibold text-blue-700">Needs (Fixed)</p>
                  <p className="text-2xl font-bold">{result.ratios.needs.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Target: 50%</p>
                  <p className="text-sm font-medium mt-1">${result.totalNeeds.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border-t-4 border-purple-500">
                  <p className="font-semibold text-purple-700">Wants (Variable)</p>
                  <p className="text-2xl font-bold">{result.ratios.wants.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Target: 30%</p>
                  <p className="text-sm font-medium mt-1">${result.totalWants.toLocaleString()}</p>
                </div>
                <div className={`text-center p-4 bg-muted/50 rounded-lg border-t-4 ${result.ratios.savings >= 20 ? 'border-green-500' : 'border-amber-500'}`}>
                  <p className="font-semibold text-green-700">Savings/Debt</p>
                  <p className="text-2xl font-bold">{result.ratios.savings.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Target: 20%</p>
                  <p className="text-sm font-medium mt-1">${result.totalSavings.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-center p-4 bg-muted rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="font-bold text-lg">${result.totalIncome.toLocaleString()}</p>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="font-bold text-lg">${result.totalExpenses.toLocaleString()}</p>
                </div>
              </div>

              <Alert variant={result.financialHealth === 'Deficit' ? 'destructive' : 'default'} className={result.financialHealth === 'Deficit' ? '' : 'bg-primary/5 border-primary/20'}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Health Check: {result.financialHealth}</strong>. {result.recommendation}
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
                  Insights
                </CardTitle>
                <CardDescription>Category analysis</CardDescription>
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

            <Card className="h-full border-indigo-100 bg-indigo-50/10 dark:border-indigo-900/20 dark:bg-indigo-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-indigo-600 dark:text-indigo-400">
                  <Zap className="h-6 w-6" />
                  Actionable Tips
                </CardTitle>
                <CardDescription>Steps to improve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.actionableTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                    <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{tip}</span>
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
            Budgeting Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Target: Needs (50%) + Wants (30%) + Savings (20%) = 100% of Net Income
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This calculator uses the popular <strong>50/30/20 Rule</strong> popularized by Senator Elizabeth Warren. It simplifies financial planning by grouping expenses into three broad buckets rather than tracking every coffee.
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
            Optimize your savings and debt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Safety net planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">Track savings targets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/credit-card-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt Payoff</p>
                      <p className="text-sm text-muted-foreground">Clear loans faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Retirement</p>
                      <p className="text-sm text-muted-foreground">Future planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/net-worth-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Net Worth</p>
                      <p className="text-sm text-muted-foreground">Total wealth Check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/simple-inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Inflation Impact</p>
                      <p className="text-sm text-muted-foreground">Purchasing power</p>
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
        <meta itemProp="name" content="The Ultimate Guide to Monthly Budgeting: The 50/30/20 Rule and Beyond" />
        <meta itemProp="description" content="Master your money with our comprehensive budgeting guide. Learn how to allocate income using the 50/30/20 rule, cut unnecessary expenses, and build wealth automatically." />
        <meta itemProp="keywords" content="monthly budget planner, 50 30 20 rule calculator, how to budget money, personal finance tracker, savings rate calculator, zero based budgeting" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-15" />
        <meta itemProp="url" content="/budgeting-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Master Your Money: The Strategic Guide to Monthly Budgeting</h1>
        <p className="text-lg italic text-muted-foreground">A budget isn't a restriction; it's a permission slip to spend money on what truly matters to you. Learn how to design a spending plan that builds freedom.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#why-budget" className="hover:underline">Why 90% of Budgets Fail (And How Yours Won't)</a></li>
          <li><a href="#50-30-20" className="hover:underline">The Gold Standard: The 50/30/20 Rule</a></li>
          <li><a href="#needs-vs-wants" className="hover:underline">Needs vs. Wants: The Grey Areas</a></li>
          <li><a href="#zero-based" className="hover:underline">Alternative Method: Zero-Based Budgeting</a></li>
          <li><a href="#optimization" className="hover:underline">Optimization: Cutting Costs Without Misery</a></li>
        </ul>
        <hr />

        {/* SECTION 1: WHY BUDGET */}
        <h2 id="why-budget" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why 90% of Budgets Fail (And How Yours Won't)</h2>
        <p>Most budgets fail because they are too restrictive or too complicated. People try to track every latte and get burnt out by week three. The secret to a successful budget is <strong>High-Level Categorization</strong>.</p>
        <p>Instead of obsessing over pennies, focus on the big wins: Housing, Transport, and Automating Savings. If you get the big chunks right, the small purchases matter less.</p>

        <hr />

        {/* SECTION 2: 50/30/20 */}
        <h2 id="50-30-20" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Gold Standard: The 50/30/20 Rule</h2>
        <p>Popularized by Senator Elizabeth Warren, this framework is the backbone of modern personal finance because of its simplicity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">50% Needs (Non-Negotiables)</h3>
        <p>These are bills you absolutely must pay to survive and work. They include rent/mortgage, utilities, basic groceries, insurance, and minimum debt payments.</p>
        <p><strong>Goal:</strong> Keep this under 50% of net income. If it creeps higher (e.g., 60%), your budget becomes fragile.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">30% Wants (Fun Money)</h3>
        <p>This is the "Life" part of work-life balance. Dining out, Netflix, hobbies, travel, and upgrading your phone.</p>
        <p><strong>Goal:</strong> Enjoy this guilt-free, but cap it at 30%. This is the first category to cut if you have an emergency.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">20% Savings (Future You)</h3>
        <p>This is for debt repayment (above the minimums), emergency funds, and investing.</p>
        <p><strong>Goal:</strong> This is the most critical number. If you hit 20%, you are almost guaranteed to build substantial wealth over time.</p>

        <hr />

        {/* SECTION 3: NEEDS VS WANTS */}
        <h2 id="needs-vs-wants" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Needs vs. Wants: The Grey Areas</h2>
        <p>Defining these categories can be tricky. Here is a cheat sheet:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Groceries = Need</strong>. Filet Mignon = Want.</li>
          <li><strong>Phone Plan = Need</strong>. Newest iPhone Pro Max = Want.</li>
          <li><strong>Gym Membership = ?</strong> Arguably a Need for health, but a Want if it's a luxury club.</li>
          <li><strong>Clothing = Need</strong>. Designer clothes = Want.</li>
        </ul>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg my-4 border border-purple-100 dark:border-purple-900">
          <h4 className="font-bold text-purple-800 dark:text-purple-300">Pro Tip: "The Subscription Trap"</h4>
          <p className="text-sm mt-2">Subscriptions (Spotify, Netflix, Gym) often feel like fixed "Needs" because they recur automatically. They are actually "Wants." Audit them ruthlessly.</p>
        </div>

        <hr />

        {/* SECTION 4: ZERO BASED */}
        <h2 id="zero-based" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Alternative Method: Zero-Based Budgeting</h2>
        <p>If the 50/30/20 rule feels too loose, try <strong>Zero-Based Budgeting</strong>. The philosophy is simple: Income minus Expenses equals Zero.</p>
        <p>Every dollar you earn is "given a job" before the month begins. Even if you have $500 left over, you assign it to "Savings" or "Extra Debt Payoff" so that your unallocated money is $0. This prevents "lifestyle creep" where extra money just disappears.</p>

        <hr />

        {/* SECTION 5: OPTIMIZATION */}
        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimization: Cutting Costs Without Misery</h2>
        <p>You can't frugality your way to wealth if your big fixed costs are too high.</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Housing:</strong> If you spend &gt;40% on rent, moving to a cheaper place saves more in one month than skipping lattes does in a year.</li>
          <li><strong>Car:</strong> A paid-off reliable car allows you to redirect $400-$600/month into investments.</li>
          <li><strong>Insurance:</strong> Shop for quotes every year. Loyalty to an insurer rarely pays off.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions (FAQ)
          </CardTitle>
          <CardDescription>
            Solutions to common budgeting problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does "Income" mean Gross or Net?</h4>
              <p className="text-muted-foreground">
                Always use <strong>Net Income</strong> (what actually hits your bank account). You can't spend your taxes. If you have 401k deductions, count them towards your 20% savings goal, but budget your cash flow based on take-home pay.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">My "Needs" are 70% of my income. What do I do?</h4>
              <p className="text-muted-foreground">
                This is a "house poor" or "car poor" situation. You have little wiggle room. Short term: aggressive austerity on "Wants." Long term: You must increase income or move to cheaper housing/sell the car. You cannot budget your way out of a mathematical impossibility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I budget with irregular income?</h4>
              <p className="text-muted-foreground">
                Base your budget on your <strong>lowest</strong> expected monthly income. In good months, shovel all the surplus into a buffer fund. When a bad month hits, draw from the buffer. Never budget based on your "best" sales month.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a Sinking Fund?</h4>
              <p className="text-muted-foreground">
                A sinking fund is savings seeking a purpose. You save $100/month for "Car Repair" or "Christmas" so that when the event happens, you have the cash ready. It smooths out lumpy expenses so they don't break your monthly budget.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I pay debt or save?</h4>
              <p className="text-muted-foreground">
                Mathematically? Pay high-interest debt (&gt;7%) first. Psychologically? Save $1,000 for emergencies first so you don't use credit cards again. Then attack the debt.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I check my budget?</h4>
              <p className="text-muted-foreground">
                New budgeters: Weekly. It keeps you honest. Experienced budgeters: Monthly. Just a quick check-in to ensure you hit your savings targets and didn't overspend on dining.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does the budget include my partner's income?</h4>
              <p className="text-muted-foreground">
                If you have shared finances, yes. Combine all household Net Income and all household Expenses. If you keep finances separate, run this calculator largely for your portion of the shared bills plus your personal expenses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Latte Factor"?</h4>
              <p className="text-muted-foreground">
                The idea that small daily spending (like coffee) adds up to huge amounts. While true ($5/day = $1,825/year), focus on the "Big Wins" (Housing, Cars) first. It's easier to fix one big lease payment than to deny yourself coffee every day for 10 years.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I track cash spending?</h4>
              <p className="text-muted-foreground">
                It's hard. Try to move spending to debit/credit cards (paid in full monthly) for automatic tracking. If you use cash, use the "Envelope System"—put $200 cash in an envelope for "Dining." When it's empty, stop eating out.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">I failed my budget this month. Now what?</h4>
              <p className="text-muted-foreground">
                Forgive yourself. Financial fitness is like physical fitness—one cheat meal doesn't ruin a diet. Analyze why you overspent (Stress? Unexpected bill?), adjust next month's plan, and keep going.
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
          <p>The Monthly Budget Planner helps you gain control over your cash flow by implementing the proven 50/30/20 framework.</p>
          <p>It categorizes your spending into Needs, Wants, and Savings, instantly revealing imbalances in your financial life.</p>
          <p>Regular use of this tool ensures you are saving enough for the future while still enjoying life today.</p>
        </CardContent>
      </Card>
    </div>
  );
}
