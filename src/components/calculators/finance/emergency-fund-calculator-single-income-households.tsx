'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Wallet, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  housing: z.number().min(0, 'Enter housing cost'),
  utilities: z.number().min(0),
  food: z.number().min(0),
  transportation: z.number().min(0),
  debtPayments: z.number().min(0),
  insurance: z.number().min(0),
  otherEssentials: z.number().min(0),
  currentSavings: z.number().min(0),
  incomeStability: z.enum(['stable', 'variable', 'high-risk']),
  dependents: z.number().min(0).max(20),
}).refine((data) => {
  const total = (data.housing || 0) + (data.utilities || 0) + (data.food || 0) + (data.transportation || 0) + (data.debtPayments || 0) + (data.insurance || 0) + (data.otherEssentials || 0);
  return total > 0;
}, { message: 'Enter at least one monthly expense', path: ['housing'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Emergency Fund Calculator for Single Income Households',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate emergency fund target for single-income households: recommended 6–12 months of essential expenses, no backup earner. Includes housing, food, utilities, debt, insurance, and risk factors.',
      url: 'https://mycalculating.com/category/finance/emergency-fund-calculator-single-income-households',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function EmergencyFundCalculatorSingleIncomeHouseholds() {
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
    const monthlyExpenses = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);
    if (monthlyExpenses === 0) return null;

    // Single-income base: 6 months (no backup earner; job loss = 100% income loss)
    let recommendedMonths = 6;
    if (v.incomeStability === 'variable') recommendedMonths += 3;
    if (v.incomeStability === 'high-risk') recommendedMonths += 6;
    if (v.dependents > 0) recommendedMonths += 3;
    recommendedMonths = Math.min(Math.max(recommendedMonths, 6), 18);

    const targetFund = monthlyExpenses * recommendedMonths;
    const currentGap = targetFund - (v.currentSavings || 0);
    const monthsCovered = monthlyExpenses > 0 ? (v.currentSavings || 0) / monthlyExpenses : 0;

    const total = monthlyExpenses;
    return {
      monthlyExpenses,
      recommendedMonths,
      targetFund,
      currentGap,
      monthsCovered,
      breakdown: [
        { category: 'Housing', amount: v.housing || 0, percentage: total > 0 ? (v.housing || 0) / total : 0 },
        { category: 'Living', amount: (v.food || 0) + (v.utilities || 0), percentage: total > 0 ? ((v.food || 0) + (v.utilities || 0)) / total : 0 },
        { category: 'Obligations', amount: (v.debtPayments || 0) + (v.insurance || 0) + (v.transportation || 0) + (v.otherEssentials || 0), percentage: total > 0 ? ((v.debtPayments || 0) + (v.insurance || 0) + (v.transportation || 0) + (v.otherEssentials || 0)) / total : 0 },
      ],
    };
  };

  const getStatus = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'Secure';
    if (monthsCovered >= recommendedMonths / 2) return 'Building';
    if (monthsCovered >= 3) return 'Minimal';
    return 'Vulnerable';
  };

  const getFinancialHealth = (gap: number) => {
    if (gap <= 0) return 'Excellent';
    if (gap < 10000) return 'Good';
    if (gap < 25000) return 'Fair';
    return 'Action Needed';
  };

  const getRecommendation = (monthsCovered: number, recommendedMonths: number) => {
    if (monthsCovered >= recommendedMonths) return 'Single-income emergency fund is fully funded. Keep funds in a high-yield savings account for liquidity.';
    if (monthsCovered >= 6) return 'You have a partial buffer. Continue building to the recommended 6–12 months for single-income security.';
    if (monthsCovered >= 3) return 'You have minimal coverage. Single-income households have no backup earner; prioritize reaching at least 6 months of expenses.';
    return 'Immediate action required. With one income, job loss removes 100% of income; build at least 3 months of expenses as a first milestone, then aim for 6–12 months.';
  };

  const getInsights = (v: FormValues, recommendedMonths: number) => {
    const insights = [];
    insights.push('Single-income households have no backup earner; job loss removes 100% of income, so 6–12 months is the standard target.');
    if (v.incomeStability === 'variable' || v.incomeStability === 'high-risk') {
      insights.push('Variable or high-risk income increases recommended months (9–12+ months).');
    }
    if (v.dependents > 0) {
      insights.push(`Dependents increase financial responsibility; target includes additional months.`);
    }
    const total = (v.housing || 0) + (v.utilities || 0) + (v.food || 0) + (v.transportation || 0) + (v.debtPayments || 0) + (v.insurance || 0) + (v.otherEssentials || 0);
    if (total > 0 && (v.housing || 0) > total * 0.5) {
      insights.push('High housing cost increases risk; consider reducing fixed costs or building a larger fund.');
    }
    return insights;
  };

  const getWarnings = (monthsCovered: number, recommendedMonths: number) => {
    const warnings = [];
    if (monthsCovered < 1) warnings.push('Less than 1 month covered: extreme risk for single-income households.');
    if (monthsCovered < 3) warnings.push('Below 3 months: minimal buffer; single-income families should prioritize reaching at least 6 months.');
    if (monthsCovered < recommendedMonths && monthsCovered >= 3) warnings.push('Below recommended single-income target (6–12 months).');
    return warnings;
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
        warnings: getWarnings(res.monthsCovered, res.recommendedMonths),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="emergency-fund-single-income-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Single-Income Household Profile
          </CardTitle>
          <CardDescription>
            Enter monthly essential expenses and risk factors. Single-income households have no backup earner; target is typically 6–12 months of expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Monthly Essential Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="housing" render={({ field }) => (
                    <FormItem><FormLabel>Housing (rent/mortgage, tax, insurance)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1800" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="utilities" render={({ field }) => (
                    <FormItem><FormLabel>Utilities</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="food" render={({ field }) => (
                    <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="transportation" render={({ field }) => (
                    <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" placeholder="e.g., 350" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="debtPayments" render={({ field }) => (
                    <FormItem><FormLabel>Minimum Debt Payments</FormLabel><FormControl><Input type="number" placeholder="e.g., 400" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem><FormLabel>Insurance (health, life, etc.)</FormLabel><FormControl><Input type="number" placeholder="e.g., 250" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="otherEssentials" render={({ field }) => (
                    <FormItem><FormLabel>Other Essentials</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Savings & Risk (Single Income)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="currentSavings" render={({ field }) => (
                    <FormItem><FormLabel>Current Emergency Savings ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 15000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="incomeStability" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Stability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable">Stable (salaried, secure)</SelectItem>
                          <SelectItem value="variable">Variable (commission, freelance)</SelectItem>
                          <SelectItem value="high-risk">High risk (contract, seasonal)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dependents" render={({ field }) => (
                    <FormItem><FormLabel>Number of Dependents</FormLabel><FormControl><Input type="number" min={0} placeholder="0" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Emergency Fund Target
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Emergency Fund Goal (Single Income)</CardTitle>
                  <CardDescription>Target based on 6–12 months of essential expenses; no backup earner</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.targetFund.toLocaleString()}</p>
                <p className="text-lg text-muted-foreground mt-2">
                  To cover <span className="font-semibold text-foreground">{result.recommendedMonths} months</span> of essential expenses
                </p>
                <p className="text-sm text-muted-foreground mt-1">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'Secure' ? 'default' : result.status === 'Building' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Months Covered</p>
                  <p className="text-lg font-bold">{result.monthsCovered.toFixed(1)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className={`h-6 w-6 mx-auto mb-2 ${result.currentGap <= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <p className="font-semibold">Gap to Target</p>
                  <p className="text-lg font-bold">{result.currentGap <= 0 ? 'Fully Funded' : `$${result.currentGap.toLocaleString()}`}</p>
                </div>
              </div>

              <Alert className={result.monthsCovered < result.recommendedMonths ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10' : 'border-green-200 bg-green-50 dark:bg-green-900/10'}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Single-income specific</CardDescription>
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
                  <span className="text-sm font-medium">Keep emergency funds in a high-yield savings account (HYSA) for liquidity and some growth.</span>
                </div>
              </CardContent>
            </Card>
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
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
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">Coverage meets or exceeds single-income recommendation.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Single-Income Emergency Funds
          </CardTitle>
          <CardDescription>Why 6–12 months for single-income households</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-4 w-4" />
                No Backup Earner
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                With one income, job loss removes 100% of household income. Dual-income households can often rely on the other earner; single-income cannot. That is why the base target is 6 months (not 3) and often 9–12 months with variable income or dependents.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Base: 6 months of essential expenses</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Variable/high-risk income or dependents: add 3–6 months</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <DollarSign className="h-4 w-4" />
                What Counts as Essential
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Housing, utilities, food, transportation, minimum debt payments, insurance, and other non-discretionary costs. Exclude discretionary spending (dining out, subscriptions, travel) so the fund covers true essentials only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              Target Fund = Monthly Essential Expenses × Recommended Months
            </p>
            <p className="font-mono text-sm text-center">
              Single-income base: 6 months. +3 for variable income, +6 for high-risk, +3 for dependents (capped 6–18 months).
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Months covered = Current savings ÷ Monthly expenses. Gap = Target fund − Current savings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Emergency fund and budgeting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund Requirement</p>
                      <p className="text-sm text-muted-foreground">General emergency fund target</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Monthly Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Track expenses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Savings Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">When will you hit your target?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Emergency Fund for Single Income Households: Why 6–12 Months" />
        <meta itemProp="description" content="How much emergency fund single-income households need: no backup earner, job loss = 100% income loss. Recommended 6–12 months of essential expenses, with risk adjustments." />
        <meta itemProp="keywords" content="emergency fund single income, single income household emergency fund, how much emergency fund single earner, 6 months expenses single income" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/emergency-fund-calculator-single-income-households" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Emergency Fund for Single Income Households: Why 6–12 Months</h1>
        <p className="text-lg italic text-muted-foreground">Single-income households have no backup earner; job loss removes 100% of income. A larger emergency fund (6–12 months of essential expenses) is the standard recommendation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#single-income-risk" className="hover:underline">Why Single Income Needs More</a></li>
          <li><a href="#months-target" className="hover:underline">Recommended Months (6–12)</a></li>
          <li><a href="#what-counts" className="hover:underline">What Counts as Essential Expenses</a></li>
          <li><a href="#applications-ef" className="hover:underline">Using the Emergency Fund Target</a></li>
          <li><a href="#conclusion-ef" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="single-income-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Single Income Needs More</h2>
        <p>Dual-income households can often rely on one income if the other is lost; single-income households cannot. Job loss, disability, or a career gap removes <strong>100% of household income</strong>. Financial advisors typically recommend <strong>6 months</strong> of essential expenses as a minimum for single-income households, and <strong>9–12 months</strong> for variable income, high-risk employment, or dependents.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">No Backup Earner</h3>
        <p>With one income, there is no second paycheck to fall back on. Unemployment or illness removes all household income. That is why the base target for single-income households is 6 months (not 3), and often 9–12 months when income is variable or there are dependents.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Job Loss and Re-employment Time</h3>
        <p>Finding a new job often takes several months. Six months of expenses gives time to search without depleting savings; 9–12 months adds buffer for variable income or dependents who depend on that single income.</p>

        <hr />

        <h2 id="months-target" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Recommended Months (6–12)</h2>
        <p>Base recommendation for single income: <strong>6 months</strong>. Add 3 months for variable income (commission, freelance), 6 months for high-risk (contract, seasonal), and 3 months for dependents. Cap at 6–18 months. This calculator applies these rules to your expense total and risk profile.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Target Fund = Monthly Essential Expenses × Recommended Months
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">When to Add More Months</h3>
        <p>Variable or high-risk income (freelance, contract, seasonal) increases the chance of income gaps; add 3–6 months. Dependents increase financial responsibility; add 3 months. The calculator adjusts recommended months based on your income stability and number of dependents.</p>

        <hr />

        <h2 id="what-counts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Counts as Essential Expenses</h2>
        <p>Include only essential, non-discretionary costs: housing (rent/mortgage, tax, insurance), utilities, food and groceries, transportation, minimum debt payments, insurance (health, life, etc.), and other essentials (childcare, medical). Exclude discretionary spending so the fund covers true necessities during income loss.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Exclude Discretionary Spending</h3>
        <p>Do not include dining out, subscriptions, travel, or other non-essential spending. The emergency fund should cover only what you must pay to maintain housing, food, utilities, debt minimums, and essential insurance.</p>

        <hr />

        <h2 id="applications-ef" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using the Emergency Fund Target</h2>
        <p>Use the target fund and gap to set a savings goal. If the gap is large, prioritize building at least 3 months first, then work toward 6, then 9–12 if your risk profile warrants it. Keep the fund in a high-yield savings account (HYSA) for liquidity and some growth.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Where to Keep the Fund</h3>
        <p>Emergency funds should be liquid and low-risk. A high-yield savings account (HYSA) or money market account is typical; avoid tying the fund to stocks or illiquid assets so you can access it quickly in a job loss or emergency.</p>

        <hr />

        <h2 id="conclusion-ef" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Single-income households have no backup earner; job loss removes 100% of income. A target of 6–12 months of essential expenses is the standard recommendation, with more months for variable income, high-risk employment, or dependents. Use this calculator to set your target and track the gap; keep the fund in a liquid, low-risk account.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about emergency funds for single-income households
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the emergency fund target higher for single-income households?</h4>
            <p className="text-muted-foreground">
              Single-income households have no backup earner. Job loss or disability removes 100% of household income. Dual-income families can often rely on the other income; single-income cannot. So the base target is 6 months (not 3) and often 9–12 months with variable income or dependents.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How many months should a single-income household save?</h4>
            <p className="text-muted-foreground">
              At least 6 months of essential expenses is the standard minimum. With variable income, high-risk employment, or dependents, 9–12 months (or more) is often recommended. This calculator adjusts recommended months based on your income stability and number of dependents.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What expenses should I include?</h4>
            <p className="text-muted-foreground">
              Include only essential, non-discretionary costs: housing, utilities, food, transportation, minimum debt payments, insurance, and other essentials (e.g. childcare, medical). Exclude discretionary spending (dining out, subscriptions, travel) so the fund covers true necessities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Where should I keep my emergency fund?</h4>
            <p className="text-muted-foreground">
              Keep the fund in a liquid, low-risk account such as a high-yield savings account (HYSA) or money market account. Avoid stocks or illiquid assets so you can access the money quickly in a job loss or emergency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I pay off debt first or build the emergency fund?</h4>
            <p className="text-muted-foreground">
              Many advisors recommend building at least a small emergency buffer (e.g. 1 month) first, then tackling high-interest debt, then continuing to build the fund to 6–12 months. That way you avoid going deeper into debt if an emergency occurs.
            </p>
          </div>
        </CardContent>
      </Card>

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
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Single Earners</strong>
                <span className="text-sm text-muted-foreground">To set an emergency fund target with no backup earner (6–12 months of expenses).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Sole Breadwinners with Dependents</strong>
                <span className="text-sm text-muted-foreground">To account for dependents and income stability in the recommended months.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Expense accuracy:</strong> Use actual or realistic essential expenses; understating expenses understates the target.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation:</strong> Emergency fund targets should be revisited periodically; inflation erodes purchasing power over time.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Other assets:</strong> If you have other liquid assets (e.g. taxable investments), you may count a portion toward the fund; balance liquidity and risk.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Shield className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Single earner, stable job, no dependents</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Base target: 6 months of essential expenses. If monthly essentials are $4,000, target fund = $24,000. Build this before focusing heavily on discretionary spending or aggressive investing.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Single earner, freelance income, 2 dependents</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Variable income + dependents: add 3 + 3 = 6 months to the base. Target becomes 12 months of essential expenses. If monthly essentials are $5,000, target fund = $60,000. Prioritize building this buffer before scaling discretionary spending.
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
          <p>The Emergency Fund Calculator for Single Income Households computes a target fund based on 6–12 months of essential expenses, with no backup earner.</p>
          <p>Use it to set and track your emergency fund goal and close the gap to the recommended single-income target.</p>
        </CardContent>
      </Card>
    </div>
  );
}
