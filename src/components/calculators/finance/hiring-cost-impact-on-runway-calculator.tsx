'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingDown, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Users, Briefcase, AlertTriangle, CheckCircle2, FunctionSquare, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentCash: z.number().min(0, 'Enter current cash balance'),
  currentMonthlyBurn: z.number().positive('Enter current monthly burn'),
  newHireMonthlyCost: z.number().min(0, 'Enter monthly cost per hire'),
  numberOfHires: z.number().int().min(1, 'Enter at least 1 hire'),
  oneTimeCostPerHire: z.number().min(0).optional(),
}).refine((data) => data.currentMonthlyBurn > 0, { message: 'Monthly burn must be positive', path: ['currentMonthlyBurn'] });

type FormValues = z.infer<typeof formSchema>;

export default function HiringCostImpactOnRunwayCalculator() {
  const [result, setResult] = useState<{
    oldRunwayMonths: number;
    newRunwayMonths: number;
    newMonthlyBurn: number;
    runwayLostMonths: number;
    runwayChangePct: number;
    oneTimeCostTotal: number;
    interpretation: string;
    runwayLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCash: undefined,
      currentMonthlyBurn: undefined,
      newHireMonthlyCost: undefined,
      numberOfHires: 1,
      oneTimeCostPerHire: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const cash = v.currentCash;
    const oldBurn = v.currentMonthlyBurn;
    const additionalMonthly = v.newHireMonthlyCost * v.numberOfHires;
    const newBurn = oldBurn + additionalMonthly;
    const oneTimeTotal = (v.oneTimeCostPerHire ?? 0) * v.numberOfHires;
    const cashAfterOneTime = cash - oneTimeTotal;
    const oldRunwayMonths = oldBurn > 0 ? cash / oldBurn : 0;
    const newRunwayMonths = newBurn > 0 && cashAfterOneTime > 0 ? cashAfterOneTime / newBurn : 0;
    const runwayLostMonths = oldRunwayMonths - newRunwayMonths;
    const runwayChangePct = oldRunwayMonths > 0 ? (runwayLostMonths / oldRunwayMonths) * 100 : 0;
    return {
      oldRunwayMonths,
      newRunwayMonths,
      newMonthlyBurn: newBurn,
      runwayLostMonths,
      runwayChangePct,
      oneTimeCostTotal: oneTimeTotal,
    };
  };

  const interpret = (runwayLost: number, oldRunway: number) => {
    const pct = oldRunway > 0 ? (runwayLost / oldRunway) * 100 : 0;
    if (pct <= 5) return 'Minimal runway impact. Hiring cost is a small fraction of burn; runway remains strong.';
    if (pct <= 15) return 'Moderate runway impact. Runway shortens; ensure you have enough buffer for fundraising or revenue.';
    if (pct <= 25) return 'Meaningful runway impact. Plan fundraising or cost offsets; avoid over-hiring before extending runway.';
    if (pct <= 40) return 'Significant runway impact. Runway drops materially; prioritize extending cash or reducing other burn.';
    return 'High runway impact. Hiring significantly shortens runway; secure funding or cut other costs before scaling headcount.';
  };

  const getRunwayLevel = (newRunwayMonths: number) => {
    if (newRunwayMonths >= 24) return 'Excellent';
    if (newRunwayMonths >= 18) return 'Strong';
    if (newRunwayMonths >= 12) return 'Moderate';
    if (newRunwayMonths >= 6) return 'Short';
    return 'Critical';
  };

  const getRecommendation = (newRunwayMonths: number, runwayLost: number) => {
    if (newRunwayMonths >= 18) return 'Runway remains healthy. Continue to track burn and plan fundraising ahead of 12 months.';
    if (newRunwayMonths >= 12) return 'Runway is adequate but tightening. Start fundraising or revenue initiatives soon.';
    if (newRunwayMonths >= 6) return 'Runway is short. Prioritize extending cash (fundraising or cost cuts) before adding more hires.';
    if (runwayLost > 3) return 'Hiring significantly reduced runway. Consider phasing hires or securing funding first.';
    return 'Critical runway. Extend cash immediately (fundraising or drastic cost reduction) before further hiring.';
  };

  const getStrength = (newRunwayMonths: number) => {
    if (newRunwayMonths >= 24) return 'Very Strong';
    if (newRunwayMonths >= 18) return 'Strong';
    if (newRunwayMonths >= 12) return 'Moderate';
    if (newRunwayMonths >= 6) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (r: { newMonthlyBurn: number; newRunwayMonths: number; runwayLostMonths: number; runwayChangePct: number; oneTimeCostTotal: number }, v: FormValues) => {
    const insights = [];
    insights.push(`New monthly burn: $${r.newMonthlyBurn.toLocaleString()} ($${v.newHireMonthlyCost.toLocaleString()} × ${v.numberOfHires} hire(s))`);
    insights.push(`Runway shortens by ${r.runwayLostMonths.toFixed(1)} months (${r.runwayChangePct.toFixed(0)}% reduction)`);
    if (r.oneTimeCostTotal > 0) {
      insights.push(`One-time cost: $${r.oneTimeCostTotal.toLocaleString()} (reduces cash before new runway calculation)`);
    }
    if (r.newRunwayMonths >= 12) {
      insights.push('Post-hire runway is still 12+ months; reasonable buffer for most startups');
    } else if (r.newRunwayMonths >= 6) {
      insights.push('Post-hire runway is 6–12 months; plan fundraising or revenue before it shortens further');
    } else {
      insights.push('Post-hire runway is under 6 months; high risk without immediate funding or cost cuts');
    }
    return insights;
  };

  const getConsiderations = () => [
    'Include fully loaded cost per hire: salary, benefits, payroll tax, equipment, and allocated overhead.',
    'One-time costs (signing bonus, relocation, equipment) reduce cash immediately and shorten runway.',
    'Fundraising typically takes 3–6 months; ensure runway stays above that after hiring.',
    'Phasing hires can spread cost and preserve runway; model different scenarios.',
    'Revenue growth can offset burn; pair with revenue assumptions when planning headcount.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: interpret(calc.runwayLostMonths, calc.oldRunwayMonths),
      runwayLevel: getRunwayLevel(calc.newRunwayMonths),
      recommendation: getRecommendation(calc.newRunwayMonths, calc.runwayLostMonths),
      strength: getStrength(calc.newRunwayMonths),
      insights: getInsights(calc, values),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Runway & Hiring Parameters
          </CardTitle>
          <CardDescription>
            Enter current cash, monthly burn, and new hire costs to see the impact on runway
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current Cash ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 2000000"
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
                  name="currentMonthlyBurn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Current Monthly Burn ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 150000"
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
                  name="newHireMonthlyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Monthly Cost per New Hire ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 12000 (salary + benefits + overhead)"
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
                  name="numberOfHires"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Number of New Hires
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min={1}
                          placeholder="e.g., 2"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oneTimeCostPerHire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        One-Time Cost per Hire ($) — Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="500"
                          placeholder="e.g., 5000 (signing, equipment)"
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
                Calculate Hiring Impact on Runway
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <TrendingDown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Runway Impact</CardTitle>
                  <CardDescription>Effect of new hires on months of runway</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.newRunwayMonths.toFixed(1)} mo</p>
                <p className="text-lg text-muted-foreground mt-2">New runway after hiring</p>
                <p className="text-sm text-muted-foreground mt-1">Down from {result.oldRunwayMonths.toFixed(1)} months (−{result.runwayLostMonths.toFixed(1)} months)</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Runway Level</p>
                  <Badge variant={result.runwayLevel === 'Excellent' ? 'default' : result.runwayLevel === 'Strong' ? 'secondary' : result.runwayLevel === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.runwayLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">New Monthly Burn</p>
                  <p className="text-lg font-bold">${result.newMonthlyBurn.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Runway Lost</p>
                  <p className="text-lg font-bold">−{result.runwayLostMonths.toFixed(1)} mo ({result.runwayChangePct.toFixed(0)}%)</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Runway and hiring context</CardDescription>
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
                <CardDescription>Critical factors when adding headcount</CardDescription>
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

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components for runway impact calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Current Cash & Monthly Burn
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current cash is the balance available today. Monthly burn is total recurring expenses per month (salaries, rent, software, etc.). Runway = Cash ÷ Burn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use actual bank balance and recent average burn</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude one-time items from burn when possible</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Users className="h-4 w-4" />
                New Hire Cost
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Monthly cost per hire should include fully loaded cost: gross salary, benefits, payroll taxes, and allocated overhead (tools, space). One-time cost (signing, equipment) reduces cash immediately.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Typical fully loaded: 1.25–1.4× base salary</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>One-time cost shortens runway by reducing cash up front</span>
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
              New Monthly Burn = Current Burn + (Monthly Cost per Hire × Number of Hires)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Cash After One-Time = Current Cash − (One-Time per Hire × Number of Hires)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              New Runway = Cash After One-Time ÷ New Monthly Burn
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Runway is months of cash left at the new burn rate. One-time hiring costs reduce cash first, then runway is calculated with the higher recurring burn.
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
            Explore other startup and runway tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly cash burn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/pre-revenue-startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Pre-Revenue Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Runway with expense breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/post-funding-runway-extension-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Post-Funding Runway Extension</p>
                      <p className="text-sm text-muted-foreground">Runway after closing a round</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/esop-dilution-impact-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">ESOP Dilution Impact</p>
                      <p className="text-sm text-muted-foreground">Option pool dilution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Break-Even Analysis</p>
                      <p className="text-sm text-muted-foreground">When revenue covers costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cash-flow-forecasting-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Cash Flow Forecasting</p>
                      <p className="text-sm text-muted-foreground">Forecast future cash flows</p>
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
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Hiring Cost Impact on Runway: Calculation and Planning" />
        <meta itemProp="description" content="An expert guide to how new hire costs affect startup runway: fully loaded cost per hire, one-time vs recurring impact, and how to plan headcount against cash and fundraising." />
        <meta itemProp="keywords" content="hiring cost runway calculator, startup runway impact, fully loaded cost per hire, headcount runway, startup burn rate hiring" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/category/finance/hiring-cost-impact-on-runway-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Hiring Cost Impact on Runway</h1>
        <p className="text-lg italic text-muted-foreground">See how adding headcount changes monthly burn and shortens runway, and how to plan hiring against cash and fundraising.</p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What Is Runway and How Hiring Affects It</a></li>
          <li><a href="#formula" className="hover:underline">The Runway and Hiring Cost Formulas</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Runway Impact</a></li>
          <li><a href="#fully-loaded" className="hover:underline">Fully Loaded Cost per Hire</a></li>
          <li><a href="#applications" className="hover:underline">Planning Headcount and Fundraising</a></li>
        </ul>
        <hr />

        {/* WHAT IS RUNWAY AND HOW HIRING AFFECTS IT */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Runway and How Hiring Affects It</h2>
        <p><strong>Runway</strong> is the number of months the company can operate at the current burn rate before cash runs out. When you add employees, you increase monthly burn (recurring cost) and often incur one-time costs (signing bonus, equipment). Both reduce runway: one-time costs reduce cash immediately, and higher burn shortens the time that cash lasts.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Startups must balance hiring (to grow) with runway (to survive until the next round or profitability). Hiring too aggressively shortens runway and increases pressure to fundraise or cut costs; hiring too slowly can delay growth. This calculator quantifies the tradeoff.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Two Levers: Recurring and One-Time</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Recurring cost:</strong> Salary, benefits, payroll taxes, and allocated overhead increase monthly burn. New runway = Cash ÷ New monthly burn.</li>
          <li><strong className="font-semibold">One-time cost:</strong> Signing bonus, relocation, equipment reduce cash in the period paid. Cash after one-time is used in the runway calculation, so one-time costs shorten runway even before the first full month of new burn.</li>
        </ul>

        <hr />

        {/* THE RUNWAY AND HIRING COST FORMULAS */}
        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Runway and Hiring Cost Formulas</h2>
        <p>New monthly burn = Current burn + (Monthly cost per hire × Number of hires). If there are one-time costs, cash after one-time = Current cash − (One-time per hire × Number of hires). New runway = Cash after one-time ÷ New monthly burn.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            New Runway = (Cash − One-Time Costs) ÷ (Current Burn + New Hire Recurring Cost)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Inputs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Current cash:</strong> Bank balance (or projected at hire date) available for operations.</li>
          <li><strong className="font-semibold">Current monthly burn:</strong> Total recurring expenses per month before the new hires.</li>
          <li><strong className="font-semibold">Monthly cost per hire:</strong> Fully loaded—salary, benefits, taxes, allocated overhead (see Fully Loaded section).</li>
          <li><strong className="font-semibold">One-time per hire:</strong> Signing bonus, relocation, equipment, etc., paid at or near start.</li>
        </ul>

        <hr />

        {/* INTERPRETING RUNWAY IMPACT */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Runway Impact</h2>
        <p>A small percentage drop in runway (e.g. under 10%) usually means hiring is affordable relative to current burn. A large drop (e.g. over 25%) means runway shortens materially; plan fundraising or cost offsets.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Target Runway After Hiring</h3>
        <p>Keep runway above <strong>12–18 months</strong> when possible so you have time to fundraise (typically 3–6 months) and hit milestones. If post-hire runway falls below 12 months, consider phasing hires, raising first, or reducing other burn.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When Impact Is Acceptable</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Runway drop &lt; 10%:</strong> Hiring is a small increment to burn; usually acceptable if runway remains above target.</li>
          <li><strong className="font-semibold">Runway drop 10–25%:</strong> Meaningful impact; ensure fundraising or revenue plan is on track.</li>
          <li><strong className="font-semibold">Runway drop &gt; 25%:</strong> Significant; prioritize extending cash or reducing other costs before scaling headcount.</li>
        </ul>

        <hr />

        {/* FULLY LOADED COST PER HIRE */}
        <h2 id="fully-loaded" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fully Loaded Cost per Hire</h2>
        <p>Use <strong>fully loaded</strong> monthly cost for the recurring impact: base salary + benefits + payroll taxes + allocated overhead (software, space, etc.).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Rule of Thumb</h3>
        <p>A common multiplier is <strong>1.25–1.4× base salary</strong> for fully loaded cost. One-time costs (signing, relocation, equipment) reduce cash in month zero and should be entered separately in this calculator.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What to Include</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>Gross salary (or prorated monthly).</li>
          <li>Employer-side benefits (health, 401k match, etc.).</li>
          <li>Employer payroll taxes (e.g. FICA).</li>
          <li>Allocated overhead: share of tools, rent, and other shared costs.</li>
        </ul>

        <hr />

        {/* PLANNING HEADCOUNT AND FUNDRAISING */}
        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Planning Headcount and Fundraising</h2>
        <p>Use this calculator before committing to offers: see how many hires you can add and still keep runway above your target (e.g. 12 months).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">If Runway Drops Too Much</h3>
        <p>Consider phasing hires, raising first, or reducing other burn. Pair with a runway extension calculator to model the effect of closing a round—then you can plan hires after funding with updated cash and optional post-raise burn.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Best Practice</h3>
        <p>Model scenarios: e.g. 2 hires now vs 4 over 6 months. Compare post-hire runway to your target and to typical fundraising timelines (3–6 months) so you do not run out of cash before the next milestone or round.</p>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Hiring increases burn and, when one-time costs exist, reduces cash. Both effects shorten runway. Use this tool to quantify the impact and plan headcount against cash and fundraising timelines.</p>
        <p>Keep runway above 12–18 months when possible, and pair this calculator with burn rate and post-funding runway tools to model full scenarios before scaling headcount.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about hiring cost and runway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How does hiring affect runway?</h4>
              <p className="text-muted-foreground">
                Hiring adds recurring monthly cost (salary, benefits, overhead), which increases burn. It may also add one-time cost (signing, equipment), which reduces cash immediately. Higher burn and lower cash both shorten runway (months of cash left).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is fully loaded cost per hire?</h4>
              <p className="text-muted-foreground">
                Fully loaded cost includes base salary, benefits, employer payroll taxes, and allocated overhead (tools, space, etc.). A common multiplier is 1.25–1.4× base salary. Use monthly fully loaded cost for the recurring burn impact.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should I include one-time hiring costs?</h4>
              <p className="text-muted-foreground">
                Yes. One-time costs (signing bonus, relocation, equipment) reduce cash in the period they are paid. The calculator subtracts them from current cash before computing new runway, so you see the true impact on months of runway.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What runway should I target after hiring?</h4>
              <p className="text-muted-foreground">
                Many startups aim for 12–18 months of runway after key hires. Fundraising often takes 3–6 months, so having at least 12 months gives time to raise without running out of cash. Adjust by stage and market conditions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I reduce the runway impact of hiring?</h4>
              <p className="text-muted-foreground">
                Phase hires over time, secure funding before scaling headcount, or offset new cost by reducing other burn. Use this calculator to compare scenarios (e.g. 2 hires now vs 4 over 6 months) and pair with a post-funding runway calculator to model raising first.
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
          <CardDescription>Practical applications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Founders & CFOs</strong>
                <span className="text-sm text-muted-foreground">To see how many hires you can add and still maintain target runway.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">People / HR</strong>
                <span className="text-sm text-muted-foreground">To plan headcount against budget and runway before making offers.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess whether a startup’s hiring plan is consistent with its runway and raise timeline.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors</strong>
                <span className="text-sm text-muted-foreground">To model scenarios (e.g. phased hiring vs big batch) and recommend runway targets.</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Assumes burn and hire costs are constant; revenue growth or other cost changes will change runway in practice.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>One-time costs are applied immediately; if spread over time, adjust cash or use a cash flow forecast.</span>
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
          <p>The Hiring Cost Impact on Runway Calculator shows how new hires change monthly burn and shorten runway.</p>
          <p>Use it to plan headcount against cash and fundraising, and to model fully loaded and one-time hiring costs.</p>
        </CardContent>
      </Card>
    </div>
  );
}
