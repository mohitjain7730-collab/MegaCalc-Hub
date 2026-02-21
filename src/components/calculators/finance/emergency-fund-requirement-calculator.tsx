'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Star, Wallet, CheckCircle2, AlertTriangle, Users, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  housing: z.number().min(0).describe("Rent or Mortgage including property tax and insurance."),
  utilities: z.number().min(0).describe("Electricity, water, gas, internet, phone."),
  food: z.number().min(0).describe("Groceries and essential household items."),
  transportation: z.number().min(0).describe("Car payments, fuel, insurance, public transit."),
  debtPayments: z.number().min(0).describe("Minimum payments on credit cards, loans."),
  insurance: z.number().min(0).describe("Health, life, and other essential insurance premiums."),
  otherEssentials: z.number().min(0).describe("Childcare, medical, other fixed costs."),
  currentSavings: z.number().min(0).describe("Amount currently saved for emergencies."),
  incomeStability: z.enum(['stable', 'variable', 'high-risk']).describe("Nature of your income source."),
  dependents: z.number().min(0).max(20).describe("Number of people financially dependent on you."),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmergencyFundRequirementCalculator() {
  const [result, setResult] = useState<{
    monthlyExpenses: number;
    recommendedMonths: number;
    targetFund: number;
    currentGap: number;
    monthsCovered: number;
    status: string;
    financialHealth: string;
    recommendation: string;
    insights: string[];
    warnings: string[];
    breakdown: { category: string; amount: number; percentage: number }[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      housing: undefined,
      utilities: undefined,
      food: undefined,
      transportation: undefined,
      debtPayments: undefined,
      insurance: undefined,
      otherEssentials: undefined,
      currentSavings: undefined,
      incomeStability: 'stable',
      dependents: 0,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Total Monthly Essential Expenses
    const monthlyExpenses = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);

    if (monthlyExpenses === 0) return null;

    // 2. Determine Recommended Months based on Risk Profile
    let recommendedMonths = 3; // Base for single, stable income

    if (v.incomeStability === 'variable') recommendedMonths += 3; // Freelancers/Commission
    if (v.incomeStability === 'high-risk') recommendedMonths += 6; // Startup/Contractor

    if (v.dependents > 0) recommendedMonths += 3; // Add buffer for family

    // Cap at reasonable limits (e.g. 3-12 months is standard range)
    recommendedMonths = Math.min(Math.max(recommendedMonths, 3), 12);

    // 3. Calculate Target and Gap
    const targetFund = monthlyExpenses * recommendedMonths;
    const currentGap = targetFund - (v.currentSavings || 0);
    const monthsCovered = (v.currentSavings || 0) / monthlyExpenses;

    return {
      monthlyExpenses,
      recommendedMonths,
      targetFund,
      currentGap,
      monthsCovered,
      breakdown: [
        { category: 'Housing', amount: v.housing || 0, percentage: (v.housing || 0) / monthlyExpenses },
        { category: 'Living', amount: (v.food || 0) + (v.utilities || 0), percentage: ((v.food || 0) + (v.utilities || 0)) / monthlyExpenses },
        { category: 'Obligations', amount: (v.debtPayments || 0) + (v.insurance || 0) + (v.transportation || 0) + (v.otherEssentials || 0), percentage: ((v.debtPayments || 0) + (v.insurance || 0) + (v.transportation || 0) + (v.otherEssentials || 0)) / monthlyExpenses },
      ]
    };
  };

  const getStatus = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'Secure';
    if (monthsCovered >= recommendedMonths / 2) return 'Building';
    if (monthsCovered >= 1) return 'Minimal';
    return 'Vulnerable';
  };

  const getFinancialHealth = (gap: number) => {
    if (gap <= 0) return 'Excellent'; // Surplus
    if (gap < 5000) return 'Good';
    if (gap < 15000) return 'Fair';
    return 'Action Needed';
  };

  const getRecommendation = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'You have fully funded your emergency cushion. Focus on high-interest investments.';
    if (monthsCovered >= 3) return 'You have a basic safety net. Continue building to reach the recommended target for full security.';
    if (monthsCovered >= 1) return 'You have minimal coverage. Prioritize saving until you reach at least 3 months of expenses.';
    return 'Immediate action required. You are vulnerable to any income disruption. Cut discretionary spending to build a 1-month buffer.';
  };

  const getInsights = (v: FormValues, recommendedMonths: number) => {
    const insights = [];
    if (v.incomeStability === 'variable' || v.incomeStability === 'high-risk') {
      insights.push('Income volatility requires a larger safety margin (6-12 months).');
    }
    if (v.dependents > 0) {
      insights.push(`Dependents increase financial responsibility, adding 3 months to your target.`);
    }
    if ((v.housing || 0) > ((v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0)) * 0.5) {
      insights.push('High fixed housing costs increase your risk profile.');
    }
    return insights;
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) {
      setResult({
        ...res,
        status: getStatus(res.monthsCovered, res.recommendedMonths),
        financialHealth: getFinancialHealth(res.currentGap),
        recommendation: getRecommendation(res.monthsCovered, res.recommendedMonths),
        insights: getInsights(values, res.recommendedMonths),
        warnings: res.monthsCovered < 1 ? ['Less than 1 month covered: Extreme Risk'] : res.monthsCovered < 3 ? ['Below standard 3-month minimum benchmark'] : [],
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
            Financial Profile
          </CardTitle>
          <CardDescription>
            Enter your monthly essential expenses and risk factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Monthly Essentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="housing" render={({ field }) => (
                    <FormItem><FormLabel>Housing</FormLabel><FormControl><Input type="number" placeholder="Rent/Mortgage" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="food" render={({ field }) => (
                    <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" placeholder="Essential food costs" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="Power, Water, Net" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transportation" render={({ field }) => (
                    <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" placeholder="Car, transit" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="debtPayments" render={({ field }) => (
                    <FormItem><FormLabel>Minimum Debt Payments</FormLabel><FormControl><Input type="number" placeholder="Loans, Cards" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem><FormLabel>Insurance</FormLabel><FormControl><Input type="number" placeholder="Health, Life" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Risk Factors & Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="currentSavings" render={({ field }) => (
                    <FormItem><FormLabel>Current Emergency Savings</FormLabel><FormControl><Input type="number" placeholder="Total available cash" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="incomeStability" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Stability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select income type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable">Stable (Salaried, Secure)</SelectItem>
                          <SelectItem value="variable">Variable (Commission, Freelance)</SelectItem>
                          <SelectItem value="high-risk">High Risk (Startup, Contract)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dependents" render={({ field }) => (
                    <FormItem><FormLabel>Number of Dependents</FormLabel><FormControl><Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Requirement
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
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Total Emergency Fund Goal</CardTitle>
                  <CardDescription>Target amount based on your risk profile</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.targetFund.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground mt-2">
                  To cover <span className="font-semibold text-foreground">{result.recommendedMonths} months</span> of essential expenses
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Current Status</p>
                  <Badge variant={result.status === 'Secure' ? 'default' : result.status === 'Building' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Duration Covered</p>
                  <p className="text-lg font-bold">{result.monthsCovered.toFixed(1)} Months</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${result.currentGap <= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <p className="font-semibold">Funding Gap</p>
                  <p className="text-lg font-bold">{result.currentGap <= 0 ? 'Fully Funded' : `-$${result.currentGap.toLocaleString()}`}</p>
                </div>
              </div>

              <Alert variant={result.monthsCovered < result.recommendedMonths ? "default" : "default"} className={result.monthsCovered < result.recommendedMonths ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10" : "border-green-200 bg-green-50 dark:bg-green-900/10"}>
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
                <CardDescription>Tailored to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Keep these funds in a High-Yield Savings Account (HYSA) for liquidity + inflation protection.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Vulnerabilities detected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.warnings.length > 0 ? result.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{warning}</span>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Coverage is adequate for your current risk profile.</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-muted-foreground">Note: Inflation erodes purchasing power. Increase your fund by 3-4% annually to maintain real value.</p>
                </div>
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
            Methodology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Target Fund = Total Monthly Essentials × Recommended Months Factor
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The "Recommended Months Factor" is dynamic:
            <br />• 3 Months: Base line for stable income, no dependents.
            <br />• +3 Months: For variable income or dependents.
            <br />• +6 Months: For high-risk employment or multiple risk factors.
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
            Planning your financial safety net
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Track expenses accurately</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">When will you hit your target?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/simple-inflation-adjusted-return-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Inflation Impact</p>
                      <p className="text-sm text-muted-foreground">Real value of savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/credit-card-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt Payoff</p>
                      <p className="text-sm text-muted-foreground">Clear debt before saving?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/net-worth-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Net Worth</p>
                      <p className="text-sm text-muted-foreground">Track overall wealth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/retirement-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Retirement</p>
                      <p className="text-sm text-muted-foreground">Long-term security</p>
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
        <meta itemProp="name" content="The Complete Guide to Emergency Funds: How Much to Save and Why" />
        <meta itemProp="description" content="Calculate exactly how much you need in your emergency fund based on your unique expenses, income stability, and dependents. Learn where to stash your cash for safety and growth." />
        <meta itemProp="keywords" content="emergency fund calculator, how much emergency fund, rainy day fund, 3-6 months expenses, financial safety net, high yield savings account" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-10" />
        <meta itemProp="url" content="/emergency-fund-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Emergency Fund Guide: Calculating Your Financial Safety Net</h1>
        <p className="text-lg italic text-muted-foreground">Financial peace of mind starts with a fully funded emergency cushion. Discover the art of liquid savings and protect yourself against life's uncertainties.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-it" className="hover:underline">What is an Emergency Fund (and What isn't)?</a></li>
          <li><a href="#how-much" className="hover:underline">The 3-6 Month Rule: Is It Enough?</a></li>
          <li><a href="#where-to-keep" className="hover:underline">Where to Keep Your Emergency Cash</a></li>
          <li><a href="#step-by-step" className="hover:underline">Strategy: Building the Fund While Paying Debt</a></li>
          <li><a href="#when-to-use" className="hover:underline">Green Light: When to Tap into the Fund</a></li>
        </ul>
        <hr />

        {/* SECTION 1: WHAT IS IT */}
        <h2 id="what-is-it" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is an Emergency Fund (and What isn't)?</h2>
        <p>An <strong>Emergency Fund</strong> is a dedicated stash of cash set aside exclusively to cover unexpected financial distress. It acts as a self-insurance policy against life events such as job loss, medical emergencies, or urgent home repairs.</p>
        <p>Crucially, it is <strong>not</strong>:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Investment capital (it shouldn't be in the stock market).</li>
          <li>A "treat yourself" fund for vacations or new gadgets.</li>
          <li>Funding for predictable annual expenses (like Christmas gifts or car registration—those belong in a "sinking fund").</li>
        </ul>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg my-4 border border-blue-100 dark:border-blue-900">
          <h4 className="font-bold text-blue-800 dark:text-blue-300">The "Sleep at Night" Factor</h4>
          <p className="text-sm mt-2">Beyond the math, the primary ROI of an emergency fund is psychological. Knowing you can survive 6 months without income eliminates desperate decisions and reduces financial anxiety.</p>
        </div>

        <hr />

        {/* SECTION 2: HOW MUCH */}
        <h2 id="how-much" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 3-6 Month Rule: Is It Enough?</h2>
        <p>The standard advice is "3 to 6 months of expenses," but one size does not fit all. Your target depends on your <strong>Financial Vulnerability Score</strong>.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Lean Coverage (3 Months)</h3>
        <p>Aim for 3 months if:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>You are single with no dependents.</li>
          <li>You have a stable, salaried job in a high-demand industry.</li>
          <li>You rent your home (no surprise roof repairs).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Standard Coverage (6 Months)</h3>
        <p>Aim for 6 months if:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>You are married or have children.</li>
          <li>You own a home (higher maintenance risk).</li>
          <li>You have significant debt obligations.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Deep Coverage (9-12 Months)</h3>
        <p>Aim for 9+ months if:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>You are self-employed, a freelancer, or work on commission.</li>
          <li>You work in a volatile or seasonal industry.</li>
          <li>You are the sole income earner for a family.</li>
        </ul>

        <hr />

        {/* SECTION 3: WHERE TO KEEP */}
        <h2 id="where-to-keep" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Where to Keep Your Emergency Cash</h2>
        <p>Your emergency fund has two mandates: <strong>Liquidity</strong> (accessibility) and <strong>Safety</strong> (capital preservation). Yield is a distant third priority.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Best Option: High-Yield Savings Account (HYSA)</h3>
        <p>An HYSA at an online bank is ideal. It is FDIC-insured, separate from your checking account (preventing accidental spending), and grows with inflation (usually).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What to Avoid</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Checking Account:</strong> Too easy to spend; earns zero interest.</li>
          <li><strong>Stock Market (ETFs/Stocks):</strong> If the market crashes when you lose your job (which often happens together), your safety net shrinks when you need it most.</li>
          <li><strong>CDs (Certificates of Deposit):</strong> While safe, they lock your money away. Only use "No-Penalty" CDs if you choose this route.</li>
        </ul>

        <hr />

        {/* SECTION 4: STRATEGY */}
        <h2 id="step-by-step" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategy: Building the Fund vs. Paying Debt</h2>
        <p>This is a common dilemma. Should you save huge cash reserves while paying 20% interest on credit cards?</p>
        <p><strong>The Compromise Approach:</strong></p>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Stage 1: The Starter Fund.</strong> Save $1,000 to $2,000 immediately. This prevents you from using credit cards for minor issues like a blown tire.</li>
          <li><strong>Stage 2: Aggressive Debt Payoff.</strong> Stop saving. Throw every extra dollar at high-interest debt (&gt;7% APR).</li>
          <li><strong>Stage 3: The Full Fund.</strong> Once toxic debt is gone, redirect those debt payments into your HYSA until you hit your 3-6 month target.</li>
        </ol>

        <hr />

        {/* SECTION 5: WHEN TO USE */}
        <h2 id="when-to-use" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Green Light: When to Tap into the Fund</h2>
        <p>Be strict. Ask these three questions before withdrawing:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Is it unexpected?</strong> (Christmas is not unexpected).</li>
          <li><strong>Is it necessary?</strong> (A basic smartphone replacement is necessary; the latest iPhone Pro is not).</li>
          <li><strong>Is it urgent?</strong> (Can it wait until next payday?)</li>
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
            Expert answers to your saving questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Should I invest my emergency fund for better returns?</h4>
              <p className="text-muted-foreground">
                No. The widespread consensus among financial planners is that emergency funds are <strong>insurance</strong>, not investments. Investing exposes the principle to market risk. The "cost" of low returns is the premium you pay for certainty and liquidity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does a credit card count as an emergency fund?</h4>
              <p className="text-muted-foreground">
                Absolutely not. Credit lines can be slashed or cancelled by banks during economic downturns—exactly when you might need them. Relying on debt to solve a debt crisis is a recipe for bankruptcy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I review my fund?</h4>
              <p className="text-muted-foreground">
                Review it annually or whenever you have a "life event" (move, new job, new baby). If your monthly burn rate increases, your fund needs to grow proportionally to maintain the same month-coverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">I have a stable government job. Do I really need 6 months?</h4>
              <p className="text-muted-foreground">
                You might be safe with 3 months. However, job loss isn't the only emergency. Medical issues, disability, or helping a family member can also drain cash quickly. 3 months is the prudent minimum for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does "Monthly Expenses" include everything I spend?</h4>
              <p className="text-muted-foreground">
                No, only "Essential Expenses." If you lost your job, you would cut Netflix, dining out, and vacations. Calculate your target based on the "survival budget" needed to keep the lights on and food on the table.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if I have an HSA (Health Savings Account)?</h4>
              <p className="text-muted-foreground">
                An HSA protects you from medical emergencies, which lowers your risk. If you have a well-funded HSA, you might comfortably aim for the lower end of the months-coverage spectrum (e.g., 3-4 months instead of 6) for your liquid cash fund.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Where do Roth IRA contributions fit in?</h4>
              <p className="text-muted-foreground">
                Subject of debate. You <em>can</em> withdraw Roth IRA contributions (not earnings) penalty-free. Some aggressive savers use a Roth IRA as a "backup" emergency fund. However, withdrawing retirement funds should be the absolute last resort.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How long does it take to build a full fund?</h4>
              <p className="text-muted-foreground">
                It takes time. Saving 3-6 months of income often takes 2-3 years of diligent saving. Don't be discouraged. Even a 1-month fund puts you ahead of 40% of the population.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I pay off my mortgage early or build an emergency fund?</h4>
              <p className="text-muted-foreground">
                Emergency fund first. If you put all your cash into the mortgage and then lose your job, you can't eat the dry wall. You need liquidity to pay the mortgage bills while you look for work.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What about inflation?</h4>
              <p className="text-muted-foreground">
                Inflation erodes cash. If inflation is 3%, your $30,000 fund only buys $29,100 worth of goods next year. You must add to your fund annually to preserve its purchasing power.
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
          <p>The Emergency Fund Calculator helps you determine the precise amount of liquid savings needed to protect your financial life.</p>
          <p>By inputting your specific survival expenses and risk factors, it creates a personalized goal far more accurate than a generic rule of thumb.</p>
          <p>Building this fund is the first and most critical step in financial planning, providing the stability needed to invest and grow wealth confidently.</p>
        </CardContent>
      </Card>
    </div>
  );
}
