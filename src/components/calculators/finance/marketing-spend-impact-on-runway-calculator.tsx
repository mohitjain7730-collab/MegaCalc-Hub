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
import { Megaphone, Zap, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Users, Briefcase, AlertTriangle, CheckCircle2, FunctionSquare, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentCash: z.number().min(0, 'Enter current cash balance'),
  currentMonthlyBurn: z.number().positive('Enter current monthly burn'),
  additionalMonthlyMarketingSpend: z.number().min(0, 'Enter additional monthly marketing spend'),
  oneTimeMarketingSpend: z.number().min(0).optional(),
}).refine((data) => data.currentMonthlyBurn > 0, { message: 'Monthly burn must be positive', path: ['currentMonthlyBurn'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Marketing Spend Impact on Runway Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate how adding or increasing marketing spend affects startup runway: new monthly burn, new runway in months, runway lost, and percentage impact. Optional one-time campaign cost.',
      url: 'https://mycalculating.com/finance/marketing-spend-impact-on-runway-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function MarketingSpendImpactOnRunwayCalculator() {
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
      additionalMonthlyMarketingSpend: undefined,
      oneTimeMarketingSpend: 0,
    },
  });

  const calculate = (v: FormValues) => {
    const cash = v.currentCash;
    const oldBurn = v.currentMonthlyBurn;
    const additionalBurn = v.additionalMonthlyMarketingSpend;
    const newBurn = oldBurn + additionalBurn;
    const oneTimeTotal = v.oneTimeMarketingSpend ?? 0;
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
    if (pct <= 5) return 'Minimal runway impact. Marketing spend is a small fraction of burn; runway remains strong if acquisition pays off.';
    if (pct <= 15) return 'Moderate runway impact. Runway shortens; ensure expected CAC payback or revenue lift justifies the spend.';
    if (pct <= 25) return 'Meaningful runway impact. Plan for measurable ROI from marketing; avoid scaling spend before validating channels.';
    if (pct <= 40) return 'Significant runway impact. Marketing materially shortens runway; tie spend to proven channels and payback metrics.';
    return 'High runway impact. Significant marketing spend shortens runway sharply; secure funding or prove unit economics before scaling.';
  };

  const getRunwayLevel = (newRunwayMonths: number) => {
    if (newRunwayMonths >= 24) return 'Excellent';
    if (newRunwayMonths >= 18) return 'Strong';
    if (newRunwayMonths >= 12) return 'Moderate';
    if (newRunwayMonths >= 6) return 'Short';
    return 'Critical';
  };

  const getRecommendation = (newRunwayMonths: number, runwayLost: number) => {
    if (newRunwayMonths >= 18) return 'Runway remains healthy. Track marketing ROI and CAC payback; scale spend only where payback is under 18 months.';
    if (newRunwayMonths >= 12) return 'Runway is adequate but tightening. Prioritize highest-ROI channels and measure incremental revenue from marketing.';
    if (newRunwayMonths >= 6) return 'Runway is short. Reduce or reallocate marketing spend unless you have proven payback; extend cash before increasing burn.';
    if (runwayLost > 3) return 'Marketing significantly reduced runway. Consider cutting non-performing channels or securing funding first.';
    return 'Critical runway. Cut discretionary marketing or extend cash immediately; avoid new spend until runway is above 12 months.';
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
    insights.push(`New monthly burn: $${r.newMonthlyBurn.toLocaleString()} (base $${v.currentMonthlyBurn.toLocaleString()} + $${v.additionalMonthlyMarketingSpend.toLocaleString()} marketing)`);
    insights.push(`Runway shortens by ${r.runwayLostMonths.toFixed(1)} months (${r.runwayChangePct.toFixed(0)}% reduction)`);
    if (r.oneTimeCostTotal > 0) {
      insights.push(`One-time marketing cost: $${r.oneTimeCostTotal.toLocaleString()} reduces cash before new runway calculation`);
    }
    if (r.newRunwayMonths >= 12) {
      insights.push('Post-spend runway is still 12+ months; reasonable buffer if marketing drives payback within 12â€“18 months');
    } else if (r.newRunwayMonths >= 6) {
      insights.push('Post-spend runway is 6â€“12 months; ensure marketing ROI and CAC payback are measurable before scaling');
    } else {
      insights.push('Post-spend runway is under 6 months; high risk without proven unit economics or near-term funding');
    }
    return insights;
  };

  const getConsiderations = () => [
    'Include all incremental marketing: paid ads, content, tools, contractors, and allocated internal time.',
    'One-time costs (campaigns, creative, launches) reduce cash immediately and shorten runway in addition to recurring spend.',
    'Marketing should be tied to CAC and LTV; use unit economics calculator to ensure LTV:CAC â‰¥ 3 and payback under 18 months.',
    'Fundraising typically takes 3â€“6 months; keep runway above that after adding marketing burn.',
    'Test before scaling: validate channel ROI and payback before increasing monthly marketing burn.',
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
      <Script id="marketing-spend-runway-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Runway & Marketing Parameters
          </CardTitle>
          <CardDescription>
            Enter current cash, monthly burn, and additional monthly marketing spend to see the impact on runway
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
                  name="additionalMonthlyMarketingSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4" />
                        Additional Monthly Marketing Spend ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 25000 (ads, content, tools)"
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
                  name="oneTimeMarketingSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        One-Time Marketing Spend ($) â€” Optional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="500"
                          placeholder="e.g., 10000 (campaign, creative)"
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
                Calculate Marketing Impact on Runway
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
                <Megaphone className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Runway Impact</CardTitle>
                  <CardDescription>Effect of additional marketing spend on months of runway</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.newRunwayMonths.toFixed(1)} mo</p>
                <p className="text-lg text-muted-foreground mt-2">New runway after marketing spend</p>
                <p className="text-sm text-muted-foreground mt-1">Down from {result.oldRunwayMonths.toFixed(1)} months (âˆ’{result.runwayLostMonths.toFixed(1)} months)</p>
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
                  <p className="text-lg font-bold">âˆ’{result.runwayLostMonths.toFixed(1)} mo ({result.runwayChangePct.toFixed(0)}%)</p>
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
                <CardDescription>Runway and marketing context</CardDescription>
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
                <CardDescription>Critical factors when increasing marketing spend</CardDescription>
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
            Key components for marketing spend impact on runway
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
                Current cash is the balance available today. Monthly burn is total recurring expenses (excluding the new marketing you are adding). Runway = Cash Ã· Burn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use actual bank balance and recent average burn</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude the incremental marketing you are modeling</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Megaphone className="h-4 w-4" />
                Additional Marketing Spend
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Recurring monthly marketing (ads, tools, contractors, allocated internal cost). One-time (campaigns, creative, launches) reduces cash immediately before computing new runway.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Include paid ads, content, SEO, tools, and agency/contractor fees</span>
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
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              New Monthly Burn = Current Burn + Additional Monthly Marketing Spend
            </p>
            <p className="font-mono text-sm text-center">
              Cash After One-Time = Current Cash âˆ’ One-Time Marketing Spend
            </p>
            <p className="font-mono text-sm text-center">
              New Runway (months) = Cash After One-Time Ã· New Monthly Burn
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Runway is months of cash left at the new burn rate. One-time marketing costs reduce cash first; recurring marketing increases monthly burn.
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
            Explore other startup, runway, and unit economics tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/hiring-cost-impact-on-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Hiring Cost Impact on Runway</p>
                      <p className="text-sm text-muted-foreground">Headcount vs runway</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/unit-economics-calculator-startup" className="block">
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
            <Link href="/pre-revenue-startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Pre-Revenue Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Runway with expense breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/saas-customer-acquisition-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SaaS Customer Acquisition Cost</p>
                      <p className="text-sm text-muted-foreground">CAC and adjusted CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/saas-cac-payback-period-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Payback Period</p>
                      <p className="text-sm text-muted-foreground">Months to recover CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/burn-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Burn Rate Calculator</p>
                      <p className="text-sm text-muted-foreground">Monthly cash burn</p>
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
        <meta itemProp="name" content="The Definitive Guide to Marketing Spend Impact on Runway: Calculation and Planning" />
        <meta itemProp="description" content="An expert guide to how additional marketing spend affects startup runway: new monthly burn, new runway in months, runway lost, one-time vs recurring impact, and how to tie marketing to unit economics and CAC payback." />
        <meta itemProp="keywords" content="marketing spend runway calculator, startup runway impact, marketing burn rate, CAC payback runway, startup unit economics marketing" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/marketing-spend-impact-on-runway-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Marketing Spend Impact on Runway</h1>
        <p className="text-lg italic text-muted-foreground">See how adding or increasing marketing spend changes monthly burn and shortens runway, and how to plan spend against CAC payback and unit economics.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What Is Runway and How Marketing Spend Affects It</a></li>
          <li><a href="#formula" className="hover:underline">The Runway and Marketing Spend Formulas</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Runway Impact</a></li>
          <li><a href="#unit-economics" className="hover:underline">Tying Marketing to Unit Economics and CAC Payback</a></li>
          <li><a href="#applications" className="hover:underline">Planning Marketing Spend and Fundraising</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Runway and How Marketing Spend Affects It</h2>
        <p><strong>Runway</strong> is the number of months the company can operate at the current burn rate before cash runs out. When you add or increase marketing spend, you increase monthly burn (recurring) and may incur one-time costs (campaigns, creative). Both reduce runway: one-time costs reduce cash immediately, and higher burn shortens the time that cash lasts.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>Startups must balance growth spend (marketing) with runway (survival until the next round or profitability). Increasing marketing without proven unit economics or payback can shorten runway dangerously. This calculator quantifies the tradeoff.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Recurring vs One-Time</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Recurring:</strong> Monthly ad spend, tools, contractors, and allocated internal cost increase burn. New runway = Cash Ã· New monthly burn.</li>
          <li><strong className="font-semibold">One-time:</strong> Campaigns, creative, launch events reduce cash in the period paid. Cash after one-time is used in the runway calculation.</li>
        </ul>

        <hr />

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Runway and Marketing Spend Formulas</h2>
        <p>New monthly burn = Current burn + Additional monthly marketing spend. If there are one-time costs, cash after one-time = Current cash âˆ’ One-time marketing spend. New runway = Cash after one-time Ã· New monthly burn.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            New Runway = (Cash âˆ’ One-Time Marketing) Ã· (Current Burn + Additional Monthly Marketing)
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Inputs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">Current cash:</strong> Bank balance (or projected) available for operations.</li>
          <li><strong className="font-semibold">Current monthly burn:</strong> Total recurring expenses per month before the additional marketing.</li>
          <li><strong className="font-semibold">Additional monthly marketing:</strong> All incremental marketing: paid ads, content, tools, contractors, allocated internal.</li>
          <li><strong className="font-semibold">One-time marketing:</strong> Campaigns, creative, launch events, paid at or near start.</li>
        </ul>

        <hr />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Runway Impact</h2>
        <p>A small percentage drop in runway (e.g. under 10%) usually means the incremental marketing is affordable relative to burn, provided you have or expect payback. A large drop (e.g. over 25%) means runway shortens materially; plan for measurable ROI and payback.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Target Runway After Adding Marketing</h3>
        <p>Keep runway above <strong>12â€“18 months</strong> when possible so you have time to fundraise (typically 3â€“6 months) and validate channels. If post-spend runway falls below 12 months, ensure CAC payback is under 18 months and LTV:CAC is healthy (e.g. â‰¥ 3:1).</p>

        <hr />

        <h2 id="unit-economics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tying Marketing to Unit Economics and CAC Payback</h2>
        <p>Marketing spend should be justified by <strong>Customer Acquisition Cost (CAC)</strong> and <strong>Lifetime Value (LTV)</strong>. Use a unit economics or CAC payback calculator to ensure: (1) LTV:CAC â‰¥ 3:1, and (2) CAC payback in months is under 18 (ideally under 12) for SaaS. If payback is long, increasing marketing shortens runway without sufficient revenue lift.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Best Practice</h3>
        <p>Model scenarios: e.g. $20k vs $50k additional monthly marketing. Compare post-spend runway to your target and to typical fundraising timelines. Pair this calculator with unit economics and CAC payback tools to ensure spend is efficient before scaling.</p>

        <hr />

        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Planning Marketing Spend and Fundraising</h2>
        <p>Use this calculator before committing to higher marketing budgets: see how much runway you lose and whether you still have buffer for fundraising or path to profitability. If runway drops too much, reduce or reallocate marketing, or extend cash first.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Marketing spend increases burn and, when one-time costs exist, reduces cash. Both shorten runway. Use this tool to quantify the impact and plan marketing against runway, unit economics, and CAC payback. Keep runway above 12â€“18 months when possible, and tie marketing to proven channels and payback metrics.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about marketing spend and runway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How does marketing spend affect runway?</h4>
              <p className="text-muted-foreground">
                Additional marketing adds recurring monthly cost (ads, tools, contractors), which increases burn. It may also add one-time cost (campaigns, creative), which reduces cash immediately. Higher burn and lower cash both shorten runway (months of cash left).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What should I include in additional marketing spend?</h4>
              <p className="text-muted-foreground">
                Include all incremental marketing: paid ads (Google, Meta, etc.), content production, SEO tools, marketing software, agency or contractor fees, and allocated internal time. Use the same period (e.g. monthly) for consistency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should I include one-time marketing costs?</h4>
              <p className="text-muted-foreground">
                Yes. One-time costs (campaigns, creative, launch events) reduce cash in the period they are paid. The calculator subtracts them from current cash before computing new runway, so you see the full impact on months of runway.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What runway should I target after adding marketing?</h4>
              <p className="text-muted-foreground">
                Many startups aim for 12â€“18 months of runway after adding marketing. Fundraising often takes 3â€“6 months, so having at least 12 months gives time to raise or validate channels. Ensure CAC payback is under 18 months and LTV:CAC is healthy (e.g. â‰¥ 3:1) before scaling spend.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I justify marketing spend against runway?</h4>
              <p className="text-muted-foreground">
                Tie marketing to unit economics: use a CAC and LTV calculator to ensure LTV:CAC â‰¥ 3:1 and CAC payback is under 18 months (ideally under 12 for SaaS). If payback is long, increasing marketing shortens runway without sufficient revenue lift; optimize channels before scaling.
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
                <span className="text-sm text-muted-foreground">To see how much runway you lose when adding or increasing marketing spend.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Marketing Leads</strong>
                <span className="text-sm text-muted-foreground">To plan budgets against runway and ensure spend is justified by CAC payback and unit economics.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess whether a startupâ€™s marketing plan is consistent with runway and unit economics.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors</strong>
                <span className="text-sm text-muted-foreground">To model scenarios (e.g. $20k vs $50k monthly marketing) and recommend runway targets.</span>
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
                <span>Assumes burn and marketing spend are constant; revenue growth or channel changes will change runway in practice.</span>
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
          <p>The Marketing Spend Impact on Runway Calculator shows how additional marketing spend changes monthly burn and shortens runway.</p>
          <p>Use it to plan marketing budgets against cash and fundraising, and to tie spend to unit economics and CAC payback.</p>
        </CardContent>
      </Card>
    </div>
  );
}
