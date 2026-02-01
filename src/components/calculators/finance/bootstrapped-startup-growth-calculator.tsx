'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Info, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, AlertCircle, Briefcase, AlertTriangle, Users, Zap, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentMonthlyRevenue: z.number().positive('Enter current monthly revenue'),
  monthlyGrowthRatePct: z.number().min(0).max(50, 'Growth rate 0–50%'),
  targetMonthlyRevenue: z.number().positive('Enter target monthly revenue'),
  monthlyOperatingExpenses: z.number().min(0).optional(),
}).refine((data) => data.targetMonthlyRevenue >= data.currentMonthlyRevenue, {
  message: 'Target revenue must be at least current revenue',
  path: ['targetMonthlyRevenue'],
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Bootstrapped Startup Growth Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate bootstrapped startup growth: months to reach target revenue at compound monthly growth rate, revenue at 6/12/24 months, and optional profit and reinvestment capacity. No external funding.',
      url: 'https://mycalculating.com/category/finance/bootstrapped-startup-growth-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function monthsToReachTarget(current: number, target: number, monthlyRatePct: number): number {
  if (monthlyRatePct <= 0 || current <= 0 || target <= current) return Infinity;
  const r = monthlyRatePct / 100;
  return Math.ceil(Math.log(target / current) / Math.log(1 + r));
}

function revenueAtMonth(current: number, monthlyRatePct: number, months: number): number {
  const r = monthlyRatePct / 100;
  return current * Math.pow(1 + r, months);
}

export default function BootstrappedStartupGrowthCalculator() {
  const [result, setResult] = useState<{
    monthsToTarget: number;
    revenueAt6Mo: number;
    revenueAt12Mo: number;
    revenueAt24Mo: number;
    monthlyProfit: number | null;
    interpretation: string;
    growthLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentMonthlyRevenue: undefined,
      monthlyGrowthRatePct: undefined,
      targetMonthlyRevenue: undefined,
      monthlyOperatingExpenses: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const monthsToTarget = monthsToReachTarget(v.currentMonthlyRevenue, v.targetMonthlyRevenue, v.monthlyGrowthRatePct);
    const revenueAt6Mo = revenueAtMonth(v.currentMonthlyRevenue, v.monthlyGrowthRatePct, 6);
    const revenueAt12Mo = revenueAtMonth(v.currentMonthlyRevenue, v.monthlyGrowthRatePct, 12);
    const revenueAt24Mo = revenueAtMonth(v.currentMonthlyRevenue, v.monthlyGrowthRatePct, 24);
    const expenses = v.monthlyOperatingExpenses ?? 0;
    const monthlyProfit = expenses >= 0 ? revenueAt12Mo - expenses : null;
    return {
      monthsToTarget: monthsToTarget === Infinity || !Number.isFinite(monthsToTarget) ? 999 : monthsToTarget,
      revenueAt6Mo,
      revenueAt12Mo,
      revenueAt24Mo,
      monthlyProfit: monthlyProfit !== null ? monthlyProfit : null,
    };
  };

  const interpret = (monthsToTarget: number, growthRate: number) => {
    if (monthsToTarget <= 12 && growthRate >= 5) return 'Strong bootstrapped trajectory. At this growth rate you reach target in under a year; reinvest profit to sustain or accelerate.';
    if (monthsToTarget <= 24) return 'Achievable bootstrapped path. Target is reachable within 24 months at current growth; monitor retention and unit economics.';
    if (monthsToTarget <= 60) return 'Moderate timeline. Target is several years out at current growth; consider pricing, retention, or efficiency to accelerate.';
    return 'Long timeline at current growth. Reaching target may take many years; reassess growth levers or target.';
  };

  const getGrowthLevel = (monthsToTarget: number) => {
    if (monthsToTarget <= 12) return 'Fast';
    if (monthsToTarget <= 24) return 'Moderate';
    if (monthsToTarget <= 48) return 'Slow';
    return 'Very Slow';
  };

  const getRecommendation = (monthsToTarget: number, growthRate: number) => {
    if (monthsToTarget <= 12) return 'Reinvest profit into highest-ROI growth levers; track unit economics to avoid growth at negative margin.';
    if (monthsToTarget <= 24) return 'Focus on retention and pricing to protect growth rate; avoid dilutive discounts.';
    if (monthsToTarget <= 48) return 'Review pricing, churn, and acquisition efficiency; bootstrapped growth is constrained by retained earnings.';
    return 'Consider whether target or timeline is realistic without external capital; or prioritize levers that materially increase growth rate.';
  };

  const getStrength = (monthsToTarget: number) => {
    if (monthsToTarget <= 12) return 'Very Strong';
    if (monthsToTarget <= 24) return 'Strong';
    if (monthsToTarget <= 48) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (r: { monthsToTarget: number; revenueAt6Mo: number; revenueAt12Mo: number; revenueAt24Mo: number; monthlyProfit: number | null }, v: FormValues) => {
    const insights = [];
    if (r.monthsToTarget >= 999) {
      insights.push('At 0% monthly growth, target revenue is not reachable; growth rate must be positive.');
    } else {
      insights.push(`At ${v.monthlyGrowthRatePct}% monthly growth, target revenue in ${r.monthsToTarget} months`);
    }
    insights.push(`Revenue at 6 mo: $${r.revenueAt6Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })} | 12 mo: $${r.revenueAt12Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })} | 24 mo: $${r.revenueAt24Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    if (r.monthlyProfit !== null && v.monthlyOperatingExpenses != null && v.monthlyOperatingExpenses > 0) {
      insights.push(`At 12-mo revenue, monthly profit ≈ $${r.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} (reinvestable for bootstrapped growth)`);
    }
    insights.push('Bootstrapped growth is limited by retained earnings; compound growth rate must be sustained by product and retention.');
    return insights;
  };

  const getConsiderations = () => [
    'Compound growth assumes constant monthly rate; in practice growth often decelerates as base grows.',
    'Bootstrapped startups cannot rely on external capital; growth is funded by profit and cash flow.',
    'Use consistent revenue definition (e.g. MRR, recurring only) and same period for current and target.',
    'Reinvest profit into marketing, product, or hiring to sustain or increase growth rate.',
    'Compare months-to-target to runway; ensure you have enough cash to reach milestones.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: interpret(calc.monthsToTarget, values.monthlyGrowthRatePct),
      growthLevel: getGrowthLevel(calc.monthsToTarget),
      recommendation: getRecommendation(calc.monthsToTarget, values.monthlyGrowthRatePct),
      strength: getStrength(calc.monthsToTarget),
      insights: getInsights(calc, values),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">
      <Script id="bootstrapped-growth-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bootstrapped Growth Parameters
          </CardTitle>
          <CardDescription>
            Enter current monthly revenue, monthly growth rate (%), and target monthly revenue. Optional: monthly operating expenses for profit/reinvestment view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Monthly Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 15000"
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
                  name="monthlyGrowthRatePct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly Growth Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 8"
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
                  name="targetMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Target Monthly Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
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
                  name="monthlyOperatingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Monthly Operating Expenses ($) — Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 12000"
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
                Calculate Bootstrapped Growth
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
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Growth Trajectory</CardTitle>
                  <CardDescription>Months to target revenue at compound monthly growth</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.monthsToTarget >= 999 ? '—' : `${result.monthsToTarget} mo`}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.monthsToTarget >= 999 ? 'Target not reachable at 0% growth' : 'Months to reach target revenue'}</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Revenue at 6 mo</p>
                  <p className="text-lg font-bold">${result.revenueAt6Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Revenue at 12 mo</p>
                  <p className="text-lg font-bold">${result.revenueAt12Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Revenue at 24 mo</p>
                  <p className="text-lg font-bold">${result.revenueAt24Mo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              {result.monthlyProfit !== null && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Approx. monthly profit at 12-mo revenue</p>
                  <p className="text-xl font-bold">${result.monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reinvestable for bootstrapped growth (revenue at 12 mo − operating expenses)</p>
                </div>
              )}

              <Alert>
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
                  Things to Consider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{c}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>Key components for bootstrapped growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Current & Target Revenue
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Use recurring monthly revenue (e.g. MRR) for consistency. Target is the monthly revenue milestone you want to reach without external funding.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Same definition for current and target</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Compound growth applied month-over-month</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                Monthly Growth Rate
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Percentage increase in revenue each month. Bootstrapped growth is funded by retained profit; growth rate is constrained by how much you reinvest.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Use trailing 3–6 month average if variable</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Growth often decelerates as base increases</span>
                </li>
              </ul>
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
              Revenue(n) = Current revenue × (1 + Monthly growth rate)^n
            </p>
            <p className="font-mono text-sm text-center">
              Months to target = log(Target ÷ Current) ÷ log(1 + Monthly growth rate)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Compound monthly growth: each month revenue is multiplied by (1 + rate). Bootstrapped startups rely on profit reinvestment to sustain growth; no external funding assumed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Startup and growth tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Startup Runway with Revenue Growth</p>
                      <p className="text-sm text-muted-foreground">Runway and cash flow</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-cash-flow-break-even-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Cash Flow Break-Even</p>
                      <p className="text-sm text-muted-foreground">When revenue covers opex</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/unit-economics-calculator-startup" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Unit Economics (Startup)</p>
                      <p className="text-sm text-muted-foreground">LTV, CAC, payback</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Bootstrapped Startup Growth: Compound Revenue Growth and Months to Target" />
        <meta itemProp="description" content="How bootstrapped startups project revenue growth without external funding: compound monthly growth rate, months to reach target revenue, and profit reinvestment." />
        <meta itemProp="keywords" content="bootstrapped startup growth calculator, compound revenue growth, months to target revenue, bootstrap growth rate, startup without funding" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/category/finance/bootstrapped-startup-growth-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Bootstrapped Startup Growth: Compound Revenue and Months to Target</h1>
        <p className="text-lg italic text-muted-foreground">Project how long it takes to reach target revenue at a given monthly growth rate when growth is funded only by retained profit.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#bootstrapped-def" className="hover:underline">What Is Bootstrapped Growth</a></li>
          <li><a href="#formula" className="hover:underline">Compound Growth Formula</a></li>
          <li><a href="#reinvestment" className="hover:underline">Profit and Reinvestment</a></li>
          <li><a href="#applications" className="hover:underline">Using Bootstrapped Growth in Planning</a></li>
          <li><a href="#conclusion-bootstrap" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="bootstrapped-def" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Bootstrapped Growth</h2>
        <p>Bootstrapped startups grow without external equity or debt funding. Growth is limited by <strong>retained earnings</strong> and cash flow. Revenue growth rate must be sustained by reinvesting profit into marketing, product, or hiring.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why No External Funding</h3>
        <p>Bootstrapped companies do not raise venture capital or take on growth debt. All growth is funded from operating cash flow and profit. That constrains how fast you can grow: the higher the growth rate, the more profit or efficiency you need to reinvest.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Reinvestment Constraint</h3>
        <p>Sustainable monthly growth rate depends on how much profit you can plow back into acquisition, product, or headcount. If you cannot reinvest enough, growth will decelerate; this calculator assumes a constant monthly rate for simplicity.</p>

        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Compound Growth Formula</h2>
        <p>Revenue after <em>n</em> months = Current monthly revenue × (1 + monthly growth rate)<sup>n</sup>. Months to reach target = log(Target ÷ Current) ÷ log(1 + growth rate). Growth rate is expressed as a decimal (e.g. 8% → 0.08).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">
            Months to target = log(Target ÷ Current) ÷ log(1 + Monthly growth rate)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Compound Growth</h3>
        <p>Each month revenue is multiplied by (1 + rate). So growth compounds: next month’s base is higher, and the same rate applies to a larger base. Small differences in monthly rate lead to large differences in months to reach a target.</p>

        <hr />

        <h2 id="reinvestment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Profit and Reinvestment</h2>
        <p>If you enter monthly operating expenses, the calculator estimates monthly profit at 12-month revenue. That profit is the reinvestment capacity for bootstrapped growth; sustaining or increasing growth rate typically requires reinvesting a portion of profit.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Reinvestment and Sustainable Growth</h3>
        <p>The more profit you reinvest into marketing, product, or hiring, the higher the growth rate you can sustain. If you distribute profit or hold excess cash, growth will be lower. Use the optional expenses field to see profit at 12 months and plan reinvestment.</p>

        <hr />

        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using Bootstrapped Growth in Planning</h2>
        <p>Use months-to-target to set milestones and compare to runway. If months-to-target exceeds your runway, you will run out of cash before reaching the target unless you accelerate growth, reduce burn, or extend runway (e.g. with revenue or funding).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Pair With Runway and Break-Even</h3>
        <p>Combine this calculator with a startup runway calculator (with revenue growth) and a break-even calculator to ensure you have enough cash to reach the target revenue and that the target is achievable without external capital.</p>

        <hr />

        <h2 id="conclusion-bootstrap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Bootstrapped startup growth is constrained by retained earnings and cash flow. This calculator shows months to reach target revenue at a compound monthly growth rate and revenue at 6, 12, and 24 months. Use it to plan milestones and reinvestment, and pair it with runway and break-even tools to ensure the plan is feasible.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about bootstrapped startup growth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is bootstrapped startup growth?</h4>
            <p className="text-muted-foreground">
              Growth funded only by retained profit and cash flow, with no external equity or debt. Revenue growth rate is constrained by how much profit you reinvest into acquisition, product, or operations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is months to target calculated?</h4>
            <p className="text-muted-foreground">
              Using compound growth: months = log(Target ÷ Current) ÷ log(1 + monthly growth rate). It assumes the same monthly growth rate every month until target is reached.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does growth rate matter so much?</h4>
            <p className="text-muted-foreground">
              Small differences in monthly growth rate dramatically change time to target. For example, 5% vs 10% monthly growth leads to many more months to reach the same target at 5%.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my growth rate is not constant?</h4>
            <p className="text-muted-foreground">
              The calculator assumes constant monthly growth. In practice, growth often decelerates as the base increases. Use a conservative rate or model different scenarios to stress-test your timeline.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I use the optional operating expenses?</h4>
            <p className="text-muted-foreground">
              Enter monthly operating expenses to see approximate monthly profit at 12-month revenue. That profit is what you can reinvest to sustain or accelerate growth; it helps you judge whether your growth rate is achievable without external funding.
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
                <strong className="block text-primary mb-1">Bootstrapped Founders</strong>
                <span className="text-sm text-muted-foreground">To see how long until revenue milestones at current growth and to plan reinvestment.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs / Ops</strong>
                <span className="text-sm text-muted-foreground">To model growth scenarios and compare to runway and break-even.</span>
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
                <span><strong>Constant growth:</strong> Assumes the same monthly growth rate every month; in practice growth often decelerates as the base grows.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No external funding:</strong> Model assumes no new equity or debt; if you plan to raise, runway and milestones change.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Revenue definition:</strong> Use consistent recurring revenue (e.g. MRR); one-time or variable revenue can distort the timeline.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: SaaS at 8% monthly growth</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  At $20k MRR growing 8% per month, you reach $50k MRR in about 12 months. Bootstrapped growth is achievable if you reinvest most profit into acquisition and product; pair with unit economics to ensure LTV:CAC and payback support the spend.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Slower growth, longer timeline</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  At 3% monthly growth, reaching 2× current revenue takes about 24 months. Bootstrapped companies often face this tradeoff: slower growth with less reinvestment, or higher growth only if profit and efficiency allow more reinvestment.
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
          <p>The Bootstrapped Startup Growth Calculator computes months to reach target monthly revenue at a compound monthly growth rate, plus revenue at 6, 12, and 24 months.</p>
          <p>Use it to plan milestones and reinvestment when growing without external funding.</p>
        </CardContent>
      </Card>
    </div>
  );
}
