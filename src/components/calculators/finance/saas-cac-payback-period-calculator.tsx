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
import { TimerReset, TrendingUp, AlertCircle, Target, Info, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, UserPlus, Repeat, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  cac: z.number().min(0),
  monthlyGrossProfitPerCustomer: z.number().min(0.01),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'SaaS CAC Payback Period Calculator', item: 'https://mycalculating.com/category/finance/saas-cac-payback-period-calculator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SaaS CAC Payback Period Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate how many months it takes to recover Customer Acquisition Cost from monthly gross profit per customer. Essential SaaS unit economics metric.',
      url: 'https://mycalculating.com/category/finance/saas-cac-payback-period-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is SaaS CAC payback period?', acceptedAnswer: { '@type': 'Answer', text: 'CAC payback period is the number of months required to recover the cost of acquiring a customer (CAC) from the monthly gross profit that customer generates. Formula: Payback (months) = CAC ÷ Monthly Gross Profit per Customer.' } },
        { '@type': 'Question', name: 'What is a good CAC payback period for SaaS?', acceptedAnswer: { '@type': 'Answer', text: 'Sub-12 months is generally efficient; 12–18 months is common in growth stage; beyond 18 months can be risky unless churn is very low and LTV:CAC is strong (e.g. ≥3:1).' } },
        { '@type': 'Question', name: 'Should I use gross profit or revenue per customer?', acceptedAnswer: { '@type': 'Answer', text: 'Use gross profit per customer (revenue × gross margin), not revenue. Gross profit reflects true unit economics after cost of revenue.' } },
      ],
    },
  ],
};

export default function SaaSCacPaybackPeriodCalculator() {
  const [result, setResult] = useState<{
    paybackMonths: number;
    interpretation: string;
    status: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cac: undefined,
      monthlyGrossProfitPerCustomer: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.monthlyGrossProfitPerCustomer <= 0) return null;
    return v.cac / v.monthlyGrossProfitPerCustomer;
  };

  const interpret = (months: number) => {
    if (months < 12) return 'Fast payback – highly efficient. CAC is recovered in under a year; strong unit economics.';
    if (months <= 18) return 'Standard payback – acceptable for growth stage. Pair with LTV:CAC and churn to confirm efficiency.';
    return 'Slow payback – elevated risk. Improve CAC, margin, or ARPA to accelerate recovery; monitor churn closely.';
  };

  const getStatus = (months: number) => {
    if (months < 12) return 'Fast';
    if (months <= 18) return 'Standard';
    return 'Slow';
  };

  const getRecommendation = (months: number) => {
    if (months < 12) return 'Maintain efficiency. Scale channels with similar payback; track LTV:CAC and churn.';
    if (months <= 18) return 'Optimize pricing and channel mix to shorten payback. Reduce CAC where possible without sacrificing quality.';
    return 'Urgent: improve margin or ARPA, or reduce CAC. Slow payback plus high churn can make CAC unrecoverable.';
  };

  const getStrength = (months: number) => {
    if (months < 12) return 'Very Strong';
    if (months <= 18) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (months: number, cac: number, monthlyGross: number) => {
    const insights = [];
    if (months < 12) {
      insights.push('Payback under 12 months supports scalable acquisition');
      insights.push('Suitable for growth; pair with LTV:CAC (target ≥3:1)');
      insights.push('Track payback by segment and channel to double down on winners');
    } else {
      insights.push('Consider increasing ARPA or gross margin to shorten payback');
      insights.push('Reduce CAC via channel efficiency and onboarding optimization');
      insights.push('Monitor churn – slow payback plus high churn risks unrecovered CAC');
    }
    insights.push(`At $${monthlyGross.toFixed(2)}/mo gross profit, $${cac.toLocaleString()} CAC recovers in ${months.toFixed(1)} months`);
    return insights;
  };

  const getConsiderations = () => [
    'Use same definition of CAC (sales + marketing + optional onboarding) as your CAC calculator',
    'Monthly gross profit = ARPU × gross margin %; use recurring gross profit for SaaS',
    'Segment by cohort or channel for accurate payback; blended can hide inefficiency',
    'Pair with LTV:CAC and net revenue retention for full unit economics',
    'Payback lengthens if churn is high – factor in expected lifetime',
  ];

  const onSubmit = (values: FormValues) => {
    const paybackMonths = calculate(values);
    if (paybackMonths !== null) {
      setResult({
        paybackMonths,
        interpretation: interpret(paybackMonths),
        status: getStatus(paybackMonths),
        recommendation: getRecommendation(paybackMonths),
        strength: getStrength(paybackMonths),
        insights: getInsights(paybackMonths, values.cac, values.monthlyGrossProfitPerCustomer),
        considerations: getConsiderations(),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="saas-cac-payback-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter your CAC and monthly gross profit per customer to calculate SaaS CAC payback period in months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        CAC – Customer Acquisition Cost ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 900"
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
                  name="monthlyGrossProfitPerCustomer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Monthly Gross Profit per Customer ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 75"
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
                Calculate Payback Period
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
                <TimerReset className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>SaaS CAC Payback Period</CardTitle>
                  <CardDescription>Months to recover CAC from gross profit</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.paybackMonths.toFixed(1)} months</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Payback Status</p>
                  <Badge variant={result.status === 'Fast' ? 'default' : result.status === 'Standard' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Unit Economics</p>
                  <Badge variant={result.strength === 'Very Strong' ? 'default' : result.strength === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Recovery</p>
                  <p className="text-lg font-bold">{(result.paybackMonths / 12).toFixed(2)} years</p>
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
                <CardDescription>Efficiency and improvement opportunities</CardDescription>
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
          <CardDescription>Key components required for the SaaS CAC payback calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                CAC (Customer Acquisition Cost)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Fully loaded cost to acquire one new customer: sales + marketing spend (and optionally onboarding) divided by new customers in the same period.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Use same definition as your CAC calculator</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Segment by channel for payback by cohort</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Include sales, marketing, and optional onboarding costs</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Same period as new customer count to avoid mis-stating</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <BarChart3 className="h-4 w-4" />
                Monthly Gross Profit per Customer
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Recurring gross profit from one customer per month: ARPU × gross margin (%). Use gross profit, not revenue, for unit economics.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Revenue minus cost of revenue (COGS)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Per-customer monthly contribution before S&amp;G</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>ARPU × gross margin % for recurring SaaS revenue</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Exclude one-time fees; use recurring gross profit only</span>
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
              Payback (months) = CAC ÷ Monthly Gross Profit per Customer
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Number of months of gross profit from one customer needed to recover the cost to acquire that customer. Pair with LTV:CAC and churn for full efficiency view.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other SaaS and unit economics tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/saas-customer-acquisition-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Calculator</p>
                      <p className="text-sm text-muted-foreground">Cost per customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ltv-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">LTV Calculator</p>
                      <p className="text-sm text-muted-foreground">Lifetime value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/monthly-burn-multiple-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Monthly Burn Multiple</p>
                      <p className="text-sm text-muted-foreground">Capital efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-net-revenue-retention-nrr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS NRR Calculator</p>
                      <p className="text-sm text-muted-foreground">Net revenue retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">With revenue growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to SaaS CAC Payback Period: Calculation, Benchmarks, and Unit Economics" />
        <meta itemProp="description" content="Expert guide to CAC payback period: formula, ideal thresholds, how to shorten payback, and how it connects to LTV:CAC and churn for SaaS efficiency." />
        <meta itemProp="keywords" content="SaaS CAC payback period, CAC recovery months, gross profit per customer, unit economics, LTV CAC payback, SaaS efficiency metrics" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-saas-cac-payback-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SaaS CAC Payback Period</h1>
        <p className="text-lg italic text-muted-foreground">How many months it takes to recover the cost of acquiring a customer from the gross profit that customer generates—and why it matters for scalable growth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#payback-definition" className="hover:underline">What Is CAC Payback Period?</a></li>
          <li><a href="#payback-formula" className="hover:underline">Formula and Components</a></li>
          <li><a href="#payback-benchmarks" className="hover:underline">Benchmarks and Interpretation</a></li>
          <li><a href="#payback-ltv" className="hover:underline">Payback vs LTV:CAC and Churn</a></li>
          <li><a href="#payback-improve" className="hover:underline">How to Improve Payback</a></li>
          <li><a href="#payback-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="payback-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is CAC Payback Period?</h2>
        <p><strong className="font-semibold text-foreground">CAC payback period</strong> is the number of months required to recover the full cost of acquiring one customer (CAC) from the <strong className="font-semibold text-foreground">monthly gross profit</strong> that customer generates. It answers: &quot;How long until this customer has paid back their acquisition cost in gross profit?&quot;</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Payback Matters for Scalability</h3>
        <p>Shorter payback supports faster scaling and lower risk if churn increases. It is a vital metric for investors, boards, and growth teams to assess whether acquisition is capital-efficient.</p>
        <hr />

        <h2 id="payback-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formula and Components</h2>
        <p>Payback (months) = CAC ÷ Monthly Gross Profit per Customer. Use <strong className="font-semibold text-foreground">gross profit</strong> (revenue × gross margin), not revenue, so unit economics reflect true contribution after cost of revenue.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Payback (months) = CAC ÷ Monthly Gross Profit per Customer
          </p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Defining CAC and Monthly Gross Profit</h3>
        <p>CAC is fully loaded cost per new customer (sales + marketing + optional onboarding). Monthly gross profit per customer is ARPU × gross margin—recurring contribution before S&amp;G.</p>
        <hr />

        <h2 id="payback-benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks and Interpretation</h2>
        <p><strong className="font-semibold text-foreground">Sub-12 months:</strong> Efficient; supports scalable acquisition. <strong className="font-semibold text-foreground">12–18 months:</strong> Common in growth stage; pair with LTV:CAC. <strong className="font-semibold text-foreground">Over 18 months:</strong> Risky unless churn is very low and LTV:CAC is strong (e.g. ≥3:1).</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Payback (Sub-12 Months)</h3>
        <p>Historically, payback under 12 months has been considered efficient for SaaS, indicating that each new customer pays back their acquisition cost within a year from gross profit.</p>
        <hr />

        <h2 id="payback-ltv" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Payback vs LTV:CAC and Churn</h2>
        <p>Payback shows <em>time</em> to recover CAC; LTV:CAC shows <em>total return</em>. Use both: target LTV:CAC ≥ 3:1 and payback under 12–18 months where possible.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Churn Risk</h3>
        <p>High churn shortens effective lifetime—slow payback plus high churn can mean CAC is never fully recovered. Pair payback with NRR and LTV for a full picture.</p>
        <hr />

        <h2 id="payback-improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Payback</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Increase ARPA or gross margin to raise monthly gross profit per customer.</li>
          <li>Reduce CAC through channel mix, targeting, and onboarding efficiency.</li>
          <li>Track payback by segment and channel to invest in efficient cohorts.</li>
        </ul>
        <hr />

        <h2 id="payback-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>CAC payback period is the core metric for measuring <strong className="font-semibold text-foreground">time to recover acquisition cost</strong> from gross profit. It serves as an essential complement to LTV:CAC and churn for unit economics.</p>
        <p>Target payback under 12–18 months where possible, and pair it with LTV:CAC ≥ 3:1 and healthy NRR for scalable, sustainable growth.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about SaaS CAC payback period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is SaaS CAC payback period?</h4>
            <p className="text-muted-foreground">
              CAC payback period is the number of months required to recover the cost of acquiring a customer (CAC) from the monthly gross profit that customer generates. Formula: Payback (months) = CAC ÷ Monthly Gross Profit per Customer.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good CAC payback period for SaaS?</h4>
            <p className="text-muted-foreground">
              Sub-12 months is generally efficient; 12–18 months is common in growth stage; beyond 18 months can be risky unless churn is very low and LTV:CAC is strong (e.g. ≥3:1).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use gross profit or revenue per customer?</h4>
            <p className="text-muted-foreground">
              Use gross profit per customer (revenue × gross margin), not revenue. Gross profit reflects true unit economics after cost of revenue.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does churn affect payback?</h4>
            <p className="text-muted-foreground">
              Higher churn shortens customer lifetime. Slow payback plus high churn can mean CAC is never recovered. Pair payback with NRR and LTV for a full picture.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why pair payback with LTV:CAC?</h4>
            <p className="text-muted-foreground">
              Payback shows how fast you recover CAC; LTV:CAC shows total return over lifetime. Target LTV:CAC ≥ 3:1 and payback under 12–18 months for healthy unit economics.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my payback is over 18 months?</h4>
            <p className="text-muted-foreground">
              Payback over 18 months can be risky unless churn is very low and LTV:CAC is strong. Focus on reducing CAC, increasing ARPA or margin, or improving channel efficiency to shorten payback.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I segment payback by channel?</h4>
            <p className="text-muted-foreground">
              Yes. Segmenting payback by channel or cohort reveals which acquisition sources are efficient. Double down on channels with faster payback and reassess those with slow recovery.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does payback relate to burn multiple?</h4>
            <p className="text-muted-foreground">
              Payback shows time to recover CAC per customer; burn multiple shows how much burn it takes to add a dollar of ARR. Both measure capital efficiency—use them together for a full view.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do investors care about CAC payback?</h4>
            <p className="text-muted-foreground">
              Investors use payback to assess scalability of acquisition. Fast payback (sub-12 months) suggests capital-efficient growth; slow payback plus high churn raises concerns about unit economics.
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
                <strong className="block text-primary mb-1">SaaS Founders & CFOs</strong>
                <span className="text-sm text-muted-foreground">To set and track payback targets and connect CAC to unit economics.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & Board Members</strong>
                <span className="text-sm text-muted-foreground">To assess capital efficiency and scalability of acquisition.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Growth & Marketing Teams</strong>
                <span className="text-sm text-muted-foreground">To prioritize channels and segments with faster payback.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Analysts</strong>
                <span className="text-sm text-muted-foreground">To model scenarios (ARPA, margin, CAC) and sensitivity.</span>
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
                <span><strong>Blended vs segment:</strong> Blended payback can hide inefficiency. Segment by channel or cohort for accurate payback by source.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Gross profit timing:</strong> Use recurring gross profit per month. One-time fees or seasonal spikes can distort payback if included.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Churn not in formula:</strong> Payback assumes the customer stays. High churn shortens effective lifetime—pair with NRR and LTV.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Efficient SMB SaaS</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  CAC $600, monthly gross profit $75 → payback 8 months. Sub-12-month payback supports scalable acquisition; pair with LTV:CAC ≥ 3:1 for healthy unit economics.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Enterprise with long payback</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  CAC $15,000, monthly gross profit $800 → payback 18.75 months. Acceptable for enterprise if churn is very low and LTV:CAC is strong; otherwise improve margin or reduce CAC.
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
          <p>The SaaS CAC Payback Period Calculator estimates how many months it takes to recover customer acquisition cost from monthly gross profit per customer.</p>
          <p>Use it with LTV:CAC and churn to assess unit economics and scalability of growth.</p>
          <p>Target payback under 12–18 months where possible and segment by channel for accurate efficiency analysis.</p>
        </CardContent>
      </Card>
    </div>
  );
}
