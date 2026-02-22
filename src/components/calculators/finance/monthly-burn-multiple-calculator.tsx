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
import { Flame, TrendingUp, AlertCircle, Target, Info, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlyNetBurn: z.number().min(0),
  netNewARRThisMonth: z.number().min(0.01),
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
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Monthly Burn Multiple Calculator', item: 'https://mycalculating.com/finance/monthly-burn-multiple-calculator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Monthly Burn Multiple Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate monthly burn multiple: net burn in a month divided by net new ARR in that month. Measures how efficiently cash converts to recurring revenue.',
      url: 'https://mycalculating.com/finance/monthly-burn-multiple-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function MonthlyBurnMultipleCalculator() {
  const [result, setResult] = useState<{
    burnMultiple: number;
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
      monthlyNetBurn: undefined,
      netNewARRThisMonth: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.netNewARRThisMonth <= 0) return null;
    return v.monthlyNetBurn / v.netNewARRThisMonth;
  };

  const interpret = (multiple: number) => {
    if (multiple < 1) return 'Elite efficiency â€“ each dollar of burn creates more than a dollar of ARR this month.';
    if (multiple < 1.5) return 'Strong efficiency â€“ capital converts well to recurring revenue. Maintain discipline while scaling.';
    if (multiple <= 2.5) return 'Moderate efficiency â€“ workable; track trend and tighten spend if growth slows.';
    return 'Weak efficiency â€“ reassess CAC, pricing, and payback to improve capital productivity.';
  };

  const getStatus = (multiple: number) => {
    if (multiple < 1) return 'Elite';
    if (multiple < 1.5) return 'Strong';
    if (multiple <= 2.5) return 'Moderate';
    return 'Weak';
  };

  const getRecommendation = (multiple: number) => {
    if (multiple < 1) return 'Maintain efficiency. Scale go-to-market while monitoring burn and ARR growth.';
    if (multiple < 1.5) return 'Keep discipline. Prioritize channels with fast payback and strong unit economics.';
    if (multiple <= 2.5) return 'Optimize spend and growth. Shift toward higher-ROI channels; track payback and CAC.';
    return 'Urgent: improve efficiency. Reduce burn or accelerate ARR growth; reassess CAC and payback.';
  };

  const getStrength = (multiple: number) => {
    if (multiple < 1) return 'Very Strong';
    if (multiple < 1.5) return 'Strong';
    if (multiple <= 2.5) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (multiple: number, burn: number, arr: number) => {
    const insights = [];
    if (multiple < 1.5) {
      insights.push('Capital efficiency is strong this month');
      insights.push('Pair with CAC payback and LTV:CAC for full unit economics');
      insights.push('Track monthly and rolling 3-month average to smooth volatility');
    } else {
      insights.push('Efficiency needs improvement â€“ link burn to pipeline and payback');
      insights.push('Prioritize channels with CAC payback under 12 months');
      insights.push('Consider pausing low-ROI programs until multiple improves');
    }
    insights.push(`$${burn.toLocaleString()} burn Ã· $${arr.toLocaleString()} net new ARR = ${multiple.toFixed(2)}x burn multiple`);
    return insights;
  };

  const getConsiderations = () => [
    'Use net burn from cash flow (opex + capex + working capital; exclude financing inflows)',
    'Net new ARR = change in ARR over the month; if using MRR change, multiply by 12',
    'Exclude one-time items and financing to reflect operating efficiency',
    'Track monthly and use rolling 3-month average to reduce noise',
    'Pair with CAC payback and LTV:CAC for full capital efficiency view',
  ];

  const onSubmit = (values: FormValues) => {
    const burnMultiple = calculate(values);
    if (burnMultiple !== null) {
      setResult({
        burnMultiple,
        interpretation: interpret(burnMultiple),
        status: getStatus(burnMultiple),
        recommendation: getRecommendation(burnMultiple),
        strength: getStrength(burnMultiple),
        insights: getInsights(burnMultiple, values.monthlyNetBurn, values.netNewARRThisMonth),
        considerations: getConsiderations(),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="monthly-burn-multiple-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter monthly net burn and net new ARR for the same month to calculate Monthly Burn Multiple
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="monthlyNetBurn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        Monthly Net Burn ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 250000"
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
                  name="netNewARRThisMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Net New ARR This Month ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 200000"
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
                Calculate Monthly Burn Multiple
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
                <Flame className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Monthly Burn Multiple</CardTitle>
                  <CardDescription>Capital efficiency this month</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.burnMultiple.toFixed(2)}x</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Efficiency Status</p>
                  <Badge variant={result.status === 'Elite' || result.status === 'Strong' ? 'default' : result.status === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Capital Productivity</p>
                  <Badge variant={result.strength === 'Very Strong' || result.strength === 'Strong' ? 'default' : result.strength === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Burn per $1 ARR</p>
                  <p className="text-lg font-bold">${result.burnMultiple.toFixed(2)}</p>
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
          <CardDescription>Key components required for the monthly burn multiple calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Flame className="h-4 w-4" />
                Monthly Net Burn
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Cash consumed in the month: total cash out minus cash in from operations. Exclude financing (e.g. equity, debt) and one-time items.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Opex, capex, working capital changes</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>From cash flow statement (operating + investing)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude equity, debt, and one-time financing flows</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Same month as net new ARR for accurate multiple</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                <BarChart3 className="h-4 w-4" />
                Net New ARR This Month
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                ARR added in the same month: ending ARR minus beginning ARR (new + expansion âˆ’ churn âˆ’ contraction). If using MRR change, multiply by 12.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Net new from new customers + expansion âˆ’ churn âˆ’ contraction</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Same month as net burn for accurate multiple</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>If using MRR change, multiply by 12 to get net new ARR</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Exclude one-time revenue; use recurring only</span>
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
              Monthly Burn Multiple = Monthly Net Burn Ã· Net New ARR (same month)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            How many dollars of burn it takes to add one dollar of ARR in that month. Lower is better; under 1.5 is often strong. Pair with CAC payback and LTV:CAC for full efficiency.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Explore other SaaS and capital efficiency tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/burn-multiple-efficiency-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Burn Multiple (Efficiency)</p>
                      <p className="text-sm text-muted-foreground">Any period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/saas-cac-payback-period-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Payback Period</p>
                      <p className="text-sm text-muted-foreground">Months to recover CAC</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/saas-customer-acquisition-cost-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">SaaS CAC Calculator</p>
                      <p className="text-sm text-muted-foreground">Cost per customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">With revenue growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/arr-growth-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">ARR Growth Calculator</p>
                      <p className="text-sm text-muted-foreground">Net new ARR & growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to Monthly Burn Multiple: Capital Efficiency for SaaS" />
        <meta itemProp="description" content="Expert guide to monthly burn multiple: formula, benchmarks, and how it connects to CAC payback and LTV:CAC for capital efficiency." />
        <meta itemProp="keywords" content="monthly burn multiple, burn multiple formula, capital efficiency SaaS, net burn net new ARR, startup efficiency metric" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-monthly-burn-multiple-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Monthly Burn Multiple</h1>
        <p className="text-lg italic text-muted-foreground">How many dollars of burn it takes to add one dollar of ARR in a monthâ€”and why it matters for capital efficiency and scalability.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#burn-definition" className="hover:underline">What Is Monthly Burn Multiple?</a></li>
          <li><a href="#burn-formula" className="hover:underline">Formula and Components</a></li>
          <li><a href="#burn-benchmarks" className="hover:underline">Benchmarks and Interpretation</a></li>
          <li><a href="#burn-payback" className="hover:underline">Burn Multiple vs CAC Payback and LTV:CAC</a></li>
          <li><a href="#burn-improve" className="hover:underline">How to Improve Burn Multiple</a></li>
          <li><a href="#burn-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="burn-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Monthly Burn Multiple?</h2>
        <p><strong className="font-semibold text-foreground">Monthly burn multiple</strong> is net burn in a single month divided by net new ARR added in that same month. It answers: &quot;How many dollars of cash did we burn to add one dollar of ARR this month?&quot;</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">A Measure of Capital Efficiency</h3>
        <p>Lower is better; under 1 means each dollar of burn created more than a dollar of ARR. It is a vital metric for investors, boards, and CFOs to assess how efficiently cash converts to recurring revenue.</p>
        <hr />

        <h2 id="burn-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formula and Components</h2>
        <p>Monthly Burn Multiple = Monthly Net Burn Ã· Net New ARR (same month). Use net burn from cash flow (exclude financing) and net new ARR from recurring revenue change in that month.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Monthly Burn Multiple = Monthly Net Burn Ã· Net New ARR (same month)
          </p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Net Burn and Net New ARR</h3>
        <p>Net burn is cash consumed (operating + investing activities). Net new ARR is the change in ARR over the monthâ€”new + expansion âˆ’ churn âˆ’ contraction.</p>
        <hr />

        <h2 id="burn-benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks and Interpretation</h2>
        <p><strong className="font-semibold text-foreground">Elite (&lt;1):</strong> Each dollar of burn creates more than a dollar of ARR. <strong className="font-semibold text-foreground">Strong (1â€“1.5):</strong> Good capital productivity. <strong className="font-semibold text-foreground">Moderate (1.5â€“2.5):</strong> Workable; track trend. <strong className="font-semibold text-foreground">Weak (&gt;2.5):</strong> Reassess spend and growth strategy.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Multiple (Under 1.5)</h3>
        <p>Historically, a burn multiple under 1.5 has been considered strong for SaaS, indicating that capital converts efficiently to recurring revenue.</p>
        <hr />

        <h2 id="burn-payback" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burn Multiple vs CAC Payback and LTV:CAC</h2>
        <p>Burn multiple shows <em>capital-to-ARR</em> efficiency; CAC payback shows <em>time</em> to recover CAC; LTV:CAC shows <em>lifetime return</em>.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Using All Three Together</h3>
        <p>Target burn multiple under 1.5, payback under 12â€“18 months, and LTV:CAC â‰¥ 3:1 for healthy unit economics and scalable growth.</p>
        <hr />

        <h2 id="burn-improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Burn Multiple</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Reduce burn by cutting low-ROI spend and improving payback (CAC, margin, ARPA).</li>
          <li>Accelerate net new ARR through pricing, packaging, and channel efficiency.</li>
          <li>Track monthly and use a rolling 3-month average to smooth volatility.</li>
        </ul>
        <hr />

        <h2 id="burn-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Monthly burn multiple is the core metric for measuring <strong className="font-semibold text-foreground">capital-to-ARR efficiency</strong> in a given month. It serves as an essential complement to CAC payback and LTV:CAC for capital efficiency.</p>
        <p>Target burn multiple under 1.5 where possible, and pair it with payback and LTV:CAC for scalable, sustainable growth.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about monthly burn multiple</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is monthly burn multiple?</h4>
            <p className="text-muted-foreground">
              Monthly burn multiple is net burn in a single month divided by net new ARR added in that same month. It measures how many dollars of burn it takes to add one dollar of ARR in that month. Lower is better; under 1.5 is often strong.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good monthly burn multiple?</h4>
            <p className="text-muted-foreground">
              Elite: under 1; Strong: 1â€“1.5; OK: 1.5â€“2.5; Risky: over 2.5. Benchmarks vary by stage and market.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use ARR or MRR for net new?</h4>
            <p className="text-muted-foreground">
              Use net new ARR for the month (change in ARR over the month). If you track MRR change, multiply by 12 to get net new ARR for consistency with standard burn multiple benchmarks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Do I include capital expenditures in net burn?</h4>
            <p className="text-muted-foreground">
              Yes. Use net burn from the cash flow statement (operating + investing activities). Exclude financing flows (equity, debt) and one-time items so the multiple reflects operating efficiency.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How often should I track burn multiple?</h4>
            <p className="text-muted-foreground">
              Track monthly and publish a rolling 3-month average to smooth volatility. Consistency lets you see trendlines and the impact of go-to-market or efficiency changes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if net new ARR is negative?</h4>
            <p className="text-muted-foreground">
              If net new ARR is negative (contraction or churn exceeds new + expansion), burn multiple is not meaningful for that month. Focus on improving retention and growth before interpreting the multiple.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does monthly burn multiple differ from period burn multiple?</h4>
            <p className="text-muted-foreground">
              Monthly burn multiple uses one month of burn and one month of net new ARR. Period burn multiple (e.g. quarterly) uses burn and net new ARR over the same period. Same formula; different period length.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why pair burn multiple with CAC payback?</h4>
            <p className="text-muted-foreground">
              Burn multiple shows capital-to-ARR efficiency; CAC payback shows time to recover CAC per customer. Both measure capital efficiencyâ€”use them together for a full view of spend and growth.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do investors care about burn multiple?</h4>
            <p className="text-muted-foreground">
              Investors use burn multiple to assess how efficiently cash converts to recurring revenue. Elite (&lt;1) or strong (1â€“1.5) multiples suggest capital-efficient growth; weak (&gt;2.5) multiples raise concerns.
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
                <span className="text-sm text-muted-foreground">To monitor monthly capital efficiency and link burn to ARR growth.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & Board Members</strong>
                <span className="text-sm text-muted-foreground">To assess how efficiently cash converts to recurring revenue.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Finance & Ops Teams</strong>
                <span className="text-sm text-muted-foreground">To report monthly burn multiple and rolling averages.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Analysts</strong>
                <span className="text-sm text-muted-foreground">To compare with CAC payback and LTV:CAC for full efficiency view.</span>
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
                <span><strong>Monthly volatility:</strong> Single-month burn and ARR can be lumpy. Use a rolling 3-month average to smooth volatility and see trendlines.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Financing excluded:</strong> Net burn must exclude equity and debt inflows. Including them understates burn and distorts the multiple.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Negative net new ARR:</strong> If net new ARR is negative, burn multiple is not meaningful for that month. Focus on retention and growth.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Elite efficiency</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  $200K monthly burn, $250K net new ARR â†’ burn multiple 0.8x. Each dollar of burn creates more than a dollar of ARR; capital-efficient growth.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: High burn multiple</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  $400K monthly burn, $120K net new ARR â†’ burn multiple 3.3x. Weak efficiency; reassess CAC, payback, and spend to improve capital productivity.
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
          <p>The Monthly Burn Multiple Calculator measures how many dollars of burn it takes to add one dollar of ARR in a month.</p>
          <p>Use it with CAC payback and LTV:CAC to assess capital efficiency and scalability of growth.</p>
          <p>Target burn multiple under 1.5 where possible and track monthly with a rolling average to smooth volatility.</p>
        </CardContent>
      </Card>
    </div>
  );
}
