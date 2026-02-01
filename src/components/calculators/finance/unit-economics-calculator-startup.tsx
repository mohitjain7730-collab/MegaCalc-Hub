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
import { BarChart3, DollarSign, Target, Info, Calculator, Shield, Users, Briefcase, AlertTriangle, AlertCircle, CheckCircle2, FunctionSquare, TrendingUp, TimerReset, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  arpuMonthly: z.number().positive('Enter monthly revenue per customer'),
  grossMarginPct: z.number().min(0.01, 'Enter gross margin %').max(100, 'Gross margin cannot exceed 100%'),
  monthlyChurnPct: z.number().min(0.01, 'Enter monthly churn %').max(99, 'Churn must be under 100%'),
  cac: z.number().positive('Enter customer acquisition cost'),
}).refine((data) => data.monthlyChurnPct > 0, { message: 'Monthly churn must be positive for LTV', path: ['monthlyChurnPct'] });

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Unit Economics Calculator (Startup)',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate startup unit economics: LTV (Lifetime Value), LTV:CAC ratio, CAC payback period in months, contribution margin per customer, and customer lifetime. Uses ARPU, gross margin %, monthly churn %, and CAC.',
      url: 'https://mycalculating.com/category/finance/unit-economics-calculator-startup',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function UnitEconomicsCalculatorStartup() {
  const [result, setResult] = useState<{
    contributionMarginMonthly: number;
    customerLifetimeMonths: number;
    ltv: number;
    ltvCacRatio: number;
    cacPaybackMonths: number;
    interpretation: string;
    ltvCacLevel: string;
    paybackLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      arpuMonthly: undefined,
      grossMarginPct: undefined,
      monthlyChurnPct: undefined,
      cac: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const contributionMarginMonthly = v.arpuMonthly * (v.grossMarginPct / 100);
    const customerLifetimeMonths = 100 / v.monthlyChurnPct; // 1 / (churn/100)
    const ltv = contributionMarginMonthly * customerLifetimeMonths;
    const ltvCacRatio = v.cac > 0 ? ltv / v.cac : 0;
    const cacPaybackMonths = contributionMarginMonthly > 0 ? v.cac / contributionMarginMonthly : 0;
    return {
      contributionMarginMonthly,
      customerLifetimeMonths,
      ltv,
      ltvCacRatio,
      cacPaybackMonths,
    };
  };

  const interpret = (ltvCac: number, paybackMonths: number) => {
    const cacOk = ltvCac >= 3;
    const paybackOk = paybackMonths <= 18;
    if (cacOk && paybackOk) return 'Strong unit economics. LTV:CAC ≥ 3 and payback within 18 months support scalable acquisition and growth.';
    if (cacOk && !paybackOk) return 'LTV:CAC is healthy but payback is long. Consider improving margin or ARPU, or reducing CAC to shorten payback.';
    if (!cacOk && paybackOk) return 'Payback is acceptable but LTV:CAC is below 3. Improve LTV (reduce churn, increase ARPU or margin) or reduce CAC.';
    return 'Unit economics need improvement. Target LTV:CAC ≥ 3 and CAC payback under 18 months; optimize pricing, churn, and acquisition efficiency.';
  };

  const getLtvCacLevel = (ratio: number) => {
    if (ratio >= 4) return 'Excellent';
    if (ratio >= 3) return 'Healthy';
    if (ratio >= 2) return 'Moderate';
    if (ratio >= 1) return 'Weak';
    return 'Unsustainable';
  };

  const getPaybackLevel = (months: number) => {
    if (months <= 12) return 'Fast';
    if (months <= 18) return 'Standard';
    if (months <= 24) return 'Slow';
    return 'Very Slow';
  };

  const getRecommendation = (ltvCac: number, paybackMonths: number) => {
    if (ltvCac >= 3 && paybackMonths <= 18) return 'Maintain and scale. Track LTV:CAC and payback by segment and channel; double down on efficient acquisition.';
    if (ltvCac >= 3 && paybackMonths > 18) return 'Shorten payback: improve gross margin or ARPU, or reduce CAC. Long payback increases sensitivity to churn.';
    if (ltvCac < 3 && paybackMonths <= 18) return 'Improve LTV:CAC: reduce churn, increase ARPU or margin, or lower CAC. Target ≥ 3:1 for sustainable growth.';
    return 'Urgent: improve LTV (reduce churn, raise ARPU/margin) and/or reduce CAC. Aim for LTV:CAC ≥ 3 and payback under 18 months before scaling spend.';
  };

  const getStrength = (ltvCac: number, paybackMonths: number) => {
    if (ltvCac >= 3 && paybackMonths <= 12) return 'Very Strong';
    if (ltvCac >= 3 && paybackMonths <= 18) return 'Strong';
    if (ltvCac >= 2 && paybackMonths <= 24) return 'Moderate';
    if (ltvCac >= 1) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (r: { ltv: number; ltvCacRatio: number; cacPaybackMonths: number; contributionMarginMonthly: number; customerLifetimeMonths: number }, v: FormValues) => {
    const insights = [];
    insights.push(`LTV $${r.ltv.toFixed(0)} = $${r.contributionMarginMonthly.toFixed(2)}/mo contribution × ${r.customerLifetimeMonths.toFixed(1)} mo lifetime`);
    insights.push(`LTV:CAC ${r.ltvCacRatio.toFixed(2)}:1 ${r.ltvCacRatio >= 3 ? '(target ≥ 3:1 met)' : '(target ≥ 3:1 not met)'}`);
    insights.push(`CAC payback: ${r.cacPaybackMonths.toFixed(1)} months ${r.cacPaybackMonths <= 18 ? '(within 18 mo target)' : '(exceeds 18 mo target)'}`);
    if (r.ltvCacRatio >= 3) {
      insights.push('Unit economics support scalable acquisition; monitor churn and CAC by channel');
    } else {
      insights.push('Improve LTV (reduce churn, increase ARPU/margin) or reduce CAC to reach LTV:CAC ≥ 3');
    }
    return insights;
  };

  const getConsiderations = () => [
    'Use consistent period: ARPU and churn should be from the same cohort or trailing period.',
    'Gross margin % = (Revenue − COGS) / Revenue; use recurring margin for subscription businesses.',
    'Monthly churn % = customers lost in month / customers at start; use cohort or blended with care.',
    'CAC = total sales + marketing spend (and optional onboarding) / new customers in same period.',
    'LTV assumes constant churn; use cohort-based LTV for more accuracy if churn varies by tenure.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: interpret(calc.ltvCacRatio, calc.cacPaybackMonths),
      ltvCacLevel: getLtvCacLevel(calc.ltvCacRatio),
      paybackLevel: getPaybackLevel(calc.cacPaybackMonths),
      recommendation: getRecommendation(calc.ltvCacRatio, calc.cacPaybackMonths),
      strength: getStrength(calc.ltvCacRatio, calc.cacPaybackMonths),
      insights: getInsights(calc, values),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">
      <Script id="unit-economics-startup-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Unit Economics Parameters
          </CardTitle>
          <CardDescription>
            Enter ARPU (monthly revenue per customer), gross margin %, monthly churn %, and CAC to calculate LTV, LTV:CAC, and CAC payback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="arpuMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        ARPU – Monthly Revenue per Customer ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50"
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
                  name="grossMarginPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Gross Margin (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 80"
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
                  name="monthlyChurnPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Monthly Churn (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 3"
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
                  name="cac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        CAC – Customer Acquisition Cost ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 400"
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
                Calculate Unit Economics
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Unit Economics Summary</CardTitle>
                  <CardDescription>LTV, LTV:CAC, and CAC payback from your inputs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.ltvCacRatio.toFixed(2)}:1</p>
                <p className="text-lg text-muted-foreground mt-2">LTV:CAC ratio</p>
                <p className="text-sm text-muted-foreground mt-1">LTV ${result.ltv.toFixed(0)} ÷ CAC ${form.getValues('cac').toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">LTV</p>
                  <p className="text-lg font-bold">${result.ltv.toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">LTV:CAC</p>
                  <Badge variant={result.ltvCacLevel === 'Excellent' || result.ltvCacLevel === 'Healthy' ? 'default' : result.ltvCacLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.ltvCacRatio.toFixed(2)}:1
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TimerReset className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">CAC Payback</p>
                  <p className="text-lg font-bold">{result.cacPaybackMonths.toFixed(1)} mo</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Customer Lifetime</p>
                  <p className="text-lg font-bold">{result.customerLifetimeMonths.toFixed(1)} mo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Contribution margin per customer per month</p>
                  <p className="text-xl font-bold">${result.contributionMarginMonthly.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">ARPU × Gross margin %</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Payback level</p>
                  <Badge variant={result.paybackLevel === 'Fast' ? 'default' : result.paybackLevel === 'Standard' ? 'secondary' : 'outline'}>
                    {result.paybackLevel}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Target: under 18 months for SaaS</p>
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
                <CardDescription>Unit economics interpretation</CardDescription>
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
                <CardDescription>Critical factors for unit economics</CardDescription>
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
            Key components for startup unit economics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                ARPU & Gross Margin
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ARPU (Average Revenue Per User) is monthly recurring revenue per customer. Gross margin % = (Revenue − COGS) / Revenue; use recurring margin for subscription businesses.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use trailing or cohort ARPU for consistency</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Contribution margin = ARPU × Gross margin %</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" />
                Monthly Churn & CAC
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Monthly churn % = customers lost in month ÷ customers at start of month. CAC = total sales + marketing spend (and optional onboarding) ÷ new customers in the same period.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Customer lifetime (months) = 100 ÷ Monthly churn %</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>LTV = Contribution margin per month × Customer lifetime</span>
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
            Formulas Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              Contribution margin per month = ARPU × (Gross margin % ÷ 100)
            </p>
            <p className="font-mono text-sm text-center">
              Customer lifetime (months) = 100 ÷ Monthly churn %
            </p>
            <p className="font-mono text-sm text-center">
              LTV = Contribution margin per month × Customer lifetime
            </p>
            <p className="font-mono text-sm text-center">
              LTV:CAC = LTV ÷ CAC
            </p>
            <p className="font-mono text-sm text-center">
              CAC payback (months) = CAC ÷ Contribution margin per month
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Startup benchmarks: LTV:CAC ≥ 3:1 is healthy; CAC payback under 18 months (ideally under 12 for SaaS) supports scalable acquisition.
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
            Explore other startup and unit economics tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/saas-customer-acquisition-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS Customer Acquisition Cost</p>
                      <p className="text-sm text-muted-foreground">CAC and adjusted CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-cac-payback-period-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TimerReset className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Payback Period</p>
                      <p className="text-sm text-muted-foreground">Months to recover CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/marketing-spend-impact-on-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Marketing Spend Impact on Runway</p>
                      <p className="text-sm text-muted-foreground">Runway impact of marketing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/contribution-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Contribution Margin</p>
                      <p className="text-sm text-muted-foreground">Per-unit contribution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ltv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">LTV Calculator</p>
                      <p className="text-sm text-muted-foreground">Lifetime value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/pre-revenue-startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Pre-Revenue Startup Runway</p>
                      <p className="text-sm text-muted-foreground">Runway with expense breakdown</p>
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
        <meta itemProp="name" content="The Definitive Guide to Startup Unit Economics: LTV, CAC, LTV:CAC, and Payback" />
        <meta itemProp="description" content="An expert guide to startup unit economics: LTV (Lifetime Value) from ARPU, gross margin, and churn; CAC; LTV:CAC ratio (target ≥ 3:1); and CAC payback period. Formulas, benchmarks, and interpretation." />
        <meta itemProp="keywords" content="unit economics calculator startup, LTV CAC ratio, CAC payback period, startup LTV formula, contribution margin per customer, customer lifetime value" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/category/finance/unit-economics-calculator-startup" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Unit Economics: LTV, CAC, and Payback</h1>
        <p className="text-lg italic text-muted-foreground">Master the metrics that determine whether your startup can acquire customers profitably and scale: LTV, CAC, LTV:CAC ratio, and CAC payback period.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What Are Unit Economics and Why They Matter</a></li>
          <li><a href="#ltv" className="hover:underline">Lifetime Value (LTV): Formula and Components</a></li>
          <li><a href="#cac" className="hover:underline">Customer Acquisition Cost (CAC)</a></li>
          <li><a href="#ltv-cac" className="hover:underline">LTV:CAC Ratio and the 3:1 Rule</a></li>
          <li><a href="#payback" className="hover:underline">CAC Payback Period</a></li>
          <li><a href="#applications" className="hover:underline">Using Unit Economics in Planning</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Are Unit Economics and Why They Matter</h2>
        <p><strong>Unit economics</strong> describe the profit (or contribution) per customer over that customer's lifetime, and the cost to acquire that customer. For startups, the core metrics are <strong>LTV</strong> (Lifetime Value), <strong>CAC</strong> (Customer Acquisition Cost), the <strong>LTV:CAC ratio</strong>, and the <strong>CAC payback period</strong> (months to recover CAC from contribution margin).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
        <p>If LTV is too low relative to CAC, or payback is too long, the business cannot scale acquisition profitably. Investors and operators use LTV:CAC ≥ 3:1 and payback under 18 months (often under 12 for SaaS) as benchmarks for healthy unit economics.</p>

        <hr />

        <h2 id="ltv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Lifetime Value (LTV): Formula and Components</h2>
        <p>LTV is the total contribution (revenue minus variable costs) you expect from one customer over their lifetime. A simple, widely used formula for subscription businesses is:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            LTV = (ARPU × Gross margin %) × (1 ÷ Monthly churn %) = Contribution margin per month × Customer lifetime (months)
          </p>
        </div>

        <p>Where <strong>Contribution margin per month</strong> = ARPU × (Gross margin % ÷ 100), and <strong>Customer lifetime (months)</strong> = 100 ÷ Monthly churn %. For example, 5% monthly churn implies a 20-month average lifetime.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Defining the Inputs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong className="font-semibold">ARPU (monthly):</strong> Average recurring revenue per customer per month.</li>
          <li><strong className="font-semibold">Gross margin %:</strong> (Revenue − COGS) / Revenue; use recurring margin for subscription.</li>
          <li><strong className="font-semibold">Monthly churn %:</strong> Percentage of customers lost each month; 100 ÷ churn % = average customer lifetime in months.</li>
        </ul>

        <hr />

        <h2 id="cac" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Customer Acquisition Cost (CAC)</h2>
        <p><strong>CAC</strong> = Total sales and marketing spend (and optionally onboarding/implementation) in a period ÷ New customers acquired in that same period. Use the same period for spend and new customers to avoid mis-stating CAC.</p>

        <hr />

        <h2 id="ltv-cac" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">LTV:CAC Ratio and the 3:1 Rule</h2>
        <p><strong>LTV:CAC</strong> = LTV ÷ CAC. A ratio of <strong>3:1 or higher</strong> is commonly considered healthy: for every dollar spent acquiring a customer, the business expects three or more dollars of contribution over the customer's lifetime. A ratio below 3 often signals that acquisition is expensive relative to value, or that churn is too high.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Improving LTV:CAC</h3>
        <p>Raise LTV by increasing ARPU, improving gross margin, or reducing churn. Lower CAC by improving channel efficiency, targeting, and conversion. Both levers improve the ratio.</p>

        <hr />

        <h2 id="payback" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">CAC Payback Period</h2>
        <p><strong>CAC payback</strong> = CAC ÷ Contribution margin per month. It is the number of months of contribution margin required to recover the cost of acquiring one customer. For SaaS, payback under <strong>18 months</strong> (ideally under 12) is a common target; longer payback increases sensitivity to churn and cash flow.</p>

        <hr />

        <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using Unit Economics in Planning</h2>
        <p>Use LTV:CAC and payback to decide whether to scale marketing spend, to set CAC targets by channel, and to model runway (e.g. with a marketing spend impact on runway calculator). If LTV:CAC is below 3 or payback over 18 months, improve unit economics before scaling acquisition.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Startup unit economics—LTV, CAC, LTV:CAC, and CAC payback—determine whether customer acquisition is profitable and scalable. Target LTV:CAC ≥ 3:1 and CAC payback under 18 months (ideally under 12 for SaaS), and use this calculator to quantify and track these metrics.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about startup unit economics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is LTV in unit economics?</h4>
              <p className="text-muted-foreground">
                LTV (Lifetime Value) is the total contribution (revenue minus variable costs) you expect from one customer over their lifetime. For subscription businesses, LTV = Contribution margin per month × Customer lifetime (months), where customer lifetime = 100 ÷ Monthly churn %.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good LTV:CAC ratio?</h4>
              <p className="text-muted-foreground">
                A ratio of 3:1 or higher is generally considered healthy: for every dollar spent acquiring a customer, the business expects at least three dollars of contribution over the customer's lifetime. Below 3:1, acquisition is often too expensive relative to value or churn is too high.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate CAC payback period?</h4>
              <p className="text-muted-foreground">
                CAC payback (months) = CAC ÷ Contribution margin per customer per month. Contribution margin per month = ARPU × (Gross margin % ÷ 100). It is the number of months of contribution required to recover the cost of acquiring one customer.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good CAC payback for SaaS?</h4>
              <p className="text-muted-foreground">
                Payback under 18 months is a common target; under 12 months is ideal for SaaS. Long payback increases sensitivity to churn and ties up cash; short payback supports scalable acquisition and faster recovery of marketing spend.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why use monthly churn for LTV?</h4>
              <p className="text-muted-foreground">
                Monthly churn % is the percentage of customers lost each month. Average customer lifetime in months = 100 ÷ Monthly churn % (e.g. 5% churn → 20 months). LTV then = Contribution margin per month × Customer lifetime. This simple formula is widely used for subscription unit economics; cohort-based LTV can refine accuracy.
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
                <span className="text-sm text-muted-foreground">To quantify LTV, LTV:CAC, and payback and set targets for scaling acquisition.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Growth / Marketing</strong>
                <span className="text-sm text-muted-foreground">To ensure marketing spend is justified by unit economics and payback.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess whether a startup’s unit economics support scalable growth.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors</strong>
                <span className="text-sm text-muted-foreground">To model scenarios (e.g. churn or ARPU changes) and recommend LTV:CAC and payback targets.</span>
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
                <span>LTV assumes constant monthly churn; cohort-based LTV can differ if churn varies by tenure.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Use consistent definitions for ARPU, margin, churn, and CAC across periods and segments.</span>
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
          <p>The Unit Economics Calculator (Startup) computes LTV, LTV:CAC ratio, CAC payback period, contribution margin per customer, and customer lifetime from ARPU, gross margin %, monthly churn %, and CAC.</p>
          <p>Use it to track and target LTV:CAC ≥ 3:1 and CAC payback under 18 months for scalable, profitable acquisition.</p>
        </CardContent>
      </Card>
    </div>
  );
}
