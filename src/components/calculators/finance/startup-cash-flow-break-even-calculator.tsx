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
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlyOperatingExpenses: z.number().min(0),
  currentMonthlyRevenue: z.number().min(0),
  monthlyRevenueGrowthPercent: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

// Note: FAQPage schema is injected by the category page (generateFAQSchema). Do not add a second FAQPage here or Google will report "Duplicate field FAQPage".
const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Startup Cash Flow Break-Even Calculator', item: 'https://mycalculating.com/category/finance/startup-cash-flow-break-even-calculator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Startup Cash Flow Break-Even Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate when your startup reaches cash flow break-even: revenue covers operating expenses. Uses current revenue and monthly growth rate.',
      url: 'https://mycalculating.com/category/finance/startup-cash-flow-break-even-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function StartupCashFlowBreakEvenCalculator() {
  const [result, setResult] = useState<{
    breakEvenRevenue: number;
    monthsToBreakEven: number | null;
    status: string;
    interpretation: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyOperatingExpenses: undefined,
      currentMonthlyRevenue: undefined,
      monthlyRevenueGrowthPercent: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const opex = v.monthlyOperatingExpenses;
    const revenue = v.currentMonthlyRevenue;
    const growth = v.monthlyRevenueGrowthPercent / 100;
    const breakEvenRevenue = opex;
    if (revenue >= opex) {
      return { breakEvenRevenue: opex, monthsToBreakEven: 0 };
    }
    if (growth <= 0) return { breakEvenRevenue: opex, monthsToBreakEven: null };
    const months = Math.log(opex / revenue) / Math.log(1 + growth);
    return { breakEvenRevenue: opex, monthsToBreakEven: Math.ceil(Math.max(0, months)) };
  };

  const interpret = (revenue: number, opex: number, months: number | null) => {
    if (revenue >= opex) return 'You are at or above cash flow break-even. Revenue covers operating expenses.';
    if (months === null) return 'Break-even not achievable with zero growth. Increase revenue or reduce expenses.';
    if (months <= 6) return 'Path to break-even is short. Maintain growth and monitor expenses.';
    if (months <= 18) return 'Moderate path to break-even. Balance growth investments with runway.';
    return 'Long path to break-even. Consider accelerating growth or reducing burn to extend runway.';
  };

  const getStatus = (revenue: number, opex: number, months: number | null) => {
    if (revenue >= opex) return 'At break-even';
    if (months === null) return 'Not achievable';
    if (months <= 6) return 'Short path';
    if (months <= 18) return 'On track';
    return 'Long path';
  };

  const getRecommendation = (revenue: number, opex: number, months: number | null) => {
    if (revenue >= opex) return 'Focus on profitable growth and optional reinvestment. Track unit economics.';
    if (months === null) return 'Introduce revenue growth or cut opex. Runway calculator to plan cash needs.';
    if (months <= 12) return 'Maintain growth rate and control opex. Plan fundraising if runway is tight.';
    return 'Accelerate growth or reduce burn. Pair with runway calculator to avoid running out of cash.';
  };

  const getStrength = (revenue: number, opex: number, months: number | null) => {
    if (revenue >= opex) return 'Very Strong';
    if (months === null) return 'Weak';
    if (months <= 6) return 'Strong';
    if (months <= 18) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (opex: number, months: number | null, breakEvenRevenue: number) => {
    const insights = [];
    if (months === 0) {
      insights.push('Revenue already covers operating expenses');
      insights.push('Net burn from operations is zero at current levels');
      insights.push('Track unit economics and growth efficiency');
    } else if (months !== null) {
      insights.push(`Break-even revenue target: $${breakEvenRevenue.toLocaleString()}/month`);
      insights.push(`Months to break-even at current growth: ${months}`);
      insights.push('Pair with runway calculator to ensure cash lasts until break-even');
    } else {
      insights.push(`Break-even revenue target: $${breakEvenRevenue.toLocaleString()}/month`);
      insights.push('Revenue growth or cost reduction needed to reach break-even');
      insights.push('Use runway calculator to plan cash needs while growing');
    }
    return insights;
  };

  const getConsiderations = () => [
    'Use consistent monthly figures; annualize only for comparison',
    'Operating expenses = opex only; exclude one-time and financing',
    'Revenue growth is monthly; convert annual growth if needed (e.g. 10% annual ≈ 0.8% monthly)',
    'Break-even ignores reinvestment; after break-even you may still burn if you invest in growth',
    'Pair with runway and burn rate calculators for full cash picture',
  ];

  const onSubmit = (values: FormValues) => {
    const { breakEvenRevenue, monthsToBreakEven } = calculate(values);
    setResult({
      breakEvenRevenue,
      monthsToBreakEven,
      interpretation: interpret(values.currentMonthlyRevenue, values.monthlyOperatingExpenses, monthsToBreakEven),
      status: getStatus(values.currentMonthlyRevenue, values.monthlyOperatingExpenses, monthsToBreakEven),
      recommendation: getRecommendation(values.currentMonthlyRevenue, values.monthlyOperatingExpenses, monthsToBreakEven),
      strength: getStrength(values.currentMonthlyRevenue, values.monthlyOperatingExpenses, monthsToBreakEven),
      insights: getInsights(values.monthlyOperatingExpenses, monthsToBreakEven, breakEvenRevenue),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">
      <Script id="startup-cash-flow-break-even-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter monthly operating expenses, current revenue, and revenue growth to find when you reach cash flow break-even
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyOperatingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monthly Operating Expenses ($)
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
                  name="currentMonthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Current Monthly Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 20000"
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
                  name="monthlyRevenueGrowthPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Monthly Revenue Growth (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5"
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
                Calculate Break-Even
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Cash Flow Break-Even</CardTitle>
                  <CardDescription>When revenue covers operating expenses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {result.monthsToBreakEven === 0 ? 'At break-even' : result.monthsToBreakEven !== null ? `${result.monthsToBreakEven} months` : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Break-even revenue: ${result.breakEvenRevenue.toLocaleString()}/month
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'At break-even' || result.status === 'Short path' ? 'default' : result.status === 'On track' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Break-even revenue</p>
                  <p className="text-lg font-bold">${result.breakEvenRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Path strength</p>
                  <Badge variant={result.strength === 'Very Strong' || result.strength === 'Strong' ? 'default' : result.strength === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.strength}
                  </Badge>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Break-even and path to profitability</CardDescription>
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
                <CardDescription>Factors to monitor</CardDescription>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>Key components required for the startup cash flow break-even calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Monthly Operating Expenses
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total monthly cash operating costs: salaries, rent, software, marketing, and other opex. Exclude one-time and financing.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Salaries, rent, utilities, software, marketing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude depreciation, one-time costs, debt principal</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use same basis as burn rate for consistency</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Break-even when revenue equals this number</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="h-4 w-4" />
                Current Revenue &amp; Growth
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current monthly revenue and expected monthly growth rate (%). Growth drives how fast you reach break-even.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Recurring or predictable monthly revenue</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Monthly growth %: 5% = 5, not 0.05</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Convert annual to monthly if needed (e.g. ~0.8% monthly for 10% annual)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Zero growth means break-even only if revenue already &gt;= opex</span>
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
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Break-even revenue = Monthly operating expenses
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Months to break-even = log(Opex ÷ Current revenue) ÷ log(1 + Monthly growth rate)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Cash flow break-even is when monthly revenue equals monthly opex. With growth, the formula estimates how many months until revenue reaches opex.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other startup and cash flow tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/pre-revenue-startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Pre-Revenue Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Months of cash left</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Runway with Revenue Growth</p>
                      <p className="text-sm text-muted-foreground">Path to profitability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/burn-rate-calculator-pre-revenue" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Burn Rate (Pre-Revenue)</p>
                      <p className="text-sm text-muted-foreground">Detailed expense burn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/runway-extension-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Runway Extension</p>
                      <p className="text-sm text-muted-foreground">Savings and new capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cash-flow-break-even-calculator-for-small-businesses" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Cash Flow Break-Even (Small Business)</p>
                      <p className="text-sm text-muted-foreground">Units and revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to Startup Cash Flow Break-Even" />
        <meta itemProp="description" content="Expert guide to startup cash flow break-even: when revenue covers operating expenses, formula, and how to shorten time to break-even." />
        <meta itemProp="keywords" content="startup cash flow break-even, months to break-even, revenue vs opex, path to profitability, startup runway" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-startup-cash-flow-break-even-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Cash Flow Break-Even</h1>
        <p className="text-lg italic text-muted-foreground">When does your startup stop burning cash? Cash flow break-even is the point where monthly revenue equals monthly operating expenses.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#be-definition" className="hover:underline">What Is Cash Flow Break-Even?</a></li>
          <li><a href="#be-formula" className="hover:underline">Formula and Components</a></li>
          <li><a href="#be-interpretation" className="hover:underline">Interpreting Results and Benchmarks</a></li>
          <li><a href="#be-runway" className="hover:underline">Break-Even vs Runway</a></li>
          <li><a href="#be-improve" className="hover:underline">How to Reach Break-Even Sooner</a></li>
          <li><a href="#be-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="be-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Cash Flow Break-Even?</h2>
        <p><strong className="font-semibold text-foreground">Cash flow break-even</strong> is the point where monthly revenue equals monthly operating expenses, so net burn from operations is zero.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters for Startups</h3>
        <p>Until break-even, the startup consumes cash (runway). After break-even, it can fund itself from revenue (before reinvesting in growth). Investors and boards use it to assess path to profitability.</p>
        <hr />

        <h2 id="be-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formula and Components</h2>
        <p>Break-even revenue = Monthly operating expenses. If current revenue is below that, months to break-even depend on monthly revenue growth.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Break-even revenue = Monthly operating expenses
          </p>
          <p className="font-mono text-sm mt-2">Months to break-even = log(Opex ÷ Current revenue) ÷ log(1 + Monthly growth % ÷ 100)</p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Opex and Revenue</h3>
        <p>Opex = salaries, rent, software, marketing, and other monthly cash operating costs. Revenue = recurring or predictable monthly revenue. Growth rate is monthly (e.g. 5% per month).</p>
        <hr />

        <h2 id="be-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results and Benchmarks</h2>
        <p>If you are already at or above break-even, net burn from operations is zero. If not, a shorter time to break-even (e.g. under 12–18 months) is generally better, assuming runway lasts that long.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Runway Constraint</h3>
        <p>Ensure runway exceeds months to break-even; otherwise you run out of cash before reaching profitability. Pair this calculator with a runway calculator.</p>
        <hr />

        <h2 id="be-runway" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Break-Even vs Runway</h2>
        <p>Runway = how long cash lasts at current burn. Break-even = when revenue covers opex. You need runway &gt;= months to break-even (or new funding) to reach profitability without running out of cash.</p>
        <hr />

        <h2 id="be-improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Reach Break-Even Sooner</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Increase revenue growth through pricing, distribution, and product.</li>
          <li>Reduce monthly opex without hurting growth (e.g. efficiency, outsourcing).</li>
          <li>Extend runway (fundraising or cost cuts) so you have enough time to reach break-even.</li>
        </ul>
        <hr />

        <h2 id="be-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Startup cash flow break-even is the core milestone where <strong className="font-semibold text-foreground">revenue covers operating expenses</strong>. Use it with runway and burn rate to plan your path to profitability.</p>
        <p>Target a realistic time to break-even and ensure runway (or funding) lasts at least that long.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about startup cash flow break-even</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is startup cash flow break-even?</h4>
            <p className="text-muted-foreground">
              Cash flow break-even is the point where monthly revenue equals monthly operating expenses, so net burn is zero. The startup stops consuming cash from operations at that level.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I calculate months to break-even?</h4>
            <p className="text-muted-foreground">
              Break-even revenue equals monthly operating expenses. If current revenue is below that and you have a monthly growth rate, months to break-even = log(break-even revenue / current revenue) / log(1 + growth rate/100).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I have zero revenue growth?</h4>
            <p className="text-muted-foreground">
              If revenue does not grow and is below opex, you never reach break-even without cutting expenses or raising revenue. The calculator shows break-even revenue; you need to change inputs to get there.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use monthly or annual growth?</h4>
            <p className="text-muted-foreground">
              Use monthly growth for the formula. If you have annual growth, convert: e.g. 10% annual compound growth is roughly (1.10^(1/12) - 1) × 100 ≈ 0.8% per month.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does break-even include debt repayment?</h4>
            <p className="text-muted-foreground">
              Only if you include debt service in monthly operating expenses. For a strict opex-only break-even, exclude principal; including interest in opex is common.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does break-even relate to runway?</h4>
            <p className="text-muted-foreground">
              Runway is how long your cash lasts at current burn. You need runway to be at least as long as months to break-even (or you need funding) to reach profitability before running out of cash.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good time to break-even for a startup?</h4>
            <p className="text-muted-foreground">
              It depends on sector and strategy. Many startups target 18–36 months to break-even; others stay growth-focused longer. Ensure runway exceeds time to break-even.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can I be at break-even and still need funding?</h4>
            <p className="text-muted-foreground">
              Yes. At break-even, net burn from operations is zero, but you may reinvest in growth (marketing, R&D), which increases burn again. Break-even means you could sustain without growth spend.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do investors care about break-even?</h4>
            <p className="text-muted-foreground">
              Investors use break-even to assess path to profitability and capital efficiency. A clear path with runway &gt; months to break-even reduces risk and supports valuation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the difference between cash flow break-even and profit break-even?</h4>
            <p className="text-muted-foreground">
              Cash flow break-even is when revenue covers cash opex (no accounting accruals). Profit break-even includes depreciation and non-cash items. For startups, cash flow break-even is usually the relevant milestone.
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
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Founders &amp; CFOs</strong>
                <span className="text-sm text-muted-foreground">To plan when revenue will cover opex and to align with runway.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors &amp; Board Members</strong>
                <span className="text-sm text-muted-foreground">To assess path to profitability and capital needs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Finance &amp; Ops Teams</strong>
                <span className="text-sm text-muted-foreground">To model scenarios (growth, opex) and report to leadership.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Accelerators &amp; Advisors</strong>
                <span className="text-sm text-muted-foreground">To help portfolio companies plan break-even and runway.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations &amp; Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant growth:</strong> Formula assumes constant monthly growth. Real growth is often lumpy; use as a guide, not a guarantee.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Opex changes:</strong> If you add headcount or costs, break-even revenue rises. Update inputs when plans change.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>After break-even:</strong> Many startups reinvest and burn again. Break-even means you could sustain; growth spend is a choice.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Early SaaS with strong growth</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Opex $40K, revenue $15K, growth 8%/month → break-even in ~13 months. With 18 months runway, the startup reaches break-even before cash runs out.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Already at break-even</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Opex $60K, revenue $65K → already at break-even. Net burn from operations is zero; any additional spend is growth reinvestment.
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
          <p>The Startup Cash Flow Break-Even Calculator shows when monthly revenue equals monthly operating expenses and estimates months to reach that point given revenue growth.</p>
          <p>Use it with runway and burn rate calculators to ensure you have enough cash to reach break-even.</p>
          <p>Target a realistic path to break-even and keep runway longer than months to break-even (or plan funding).</p>
        </CardContent>
      </Card>
    </div>
  );
}
