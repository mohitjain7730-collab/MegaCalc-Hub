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
import { Flame, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentCash: z.number().min(0),
  monthlyBurnRate: z.number().min(0.01),
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
        { '@type': 'ListItem', position: 3, name: 'Pre-Revenue Startup Runway Calculator', item: 'https://mycalculating.com/category/finance/pre-revenue-startup-runway-calculator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Pre-Revenue Startup Runway Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate how many months your pre-revenue startup can run on current cash at a given monthly burn rate. Simple runway = cash ÷ burn.',
      url: 'https://mycalculating.com/category/finance/pre-revenue-startup-runway-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is pre-revenue startup runway?', acceptedAnswer: { '@type': 'Answer', text: 'Runway is how many months your startup can operate on current cash at the current monthly burn rate. Pre-revenue means no (or negligible) revenue, so runway = cash ÷ monthly burn.' } },
        { '@type': 'Question', name: 'How do I calculate runway?', acceptedAnswer: { '@type': 'Answer', text: 'Runway (months) = Current Cash ÷ Monthly Burn Rate. Example: $500K cash and $50K/month burn = 10 months runway.' } },
      ],
    },
  ],
};

export default function PreRevenueStartupRunwayCalculator() {
  const [result, setResult] = useState<{
    runwayMonths: number;
    runwayYears: number;
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
      currentCash: undefined,
      monthlyBurnRate: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.monthlyBurnRate <= 0) return null;
    const runwayMonths = v.currentCash / v.monthlyBurnRate;
    return { runwayMonths, runwayYears: runwayMonths / 12 };
  };

  const interpret = (months: number) => {
    if (months >= 24) return 'Excellent runway. You have ample time to reach milestones and plan fundraising.';
    if (months >= 18) return 'Strong runway. Plan fundraising or path to revenue before runway shortens.';
    if (months >= 12) return 'Moderate runway. Fundraising typically takes 3–6 months; start soon.';
    if (months >= 6) return 'Short runway. Urgent need to extend (fundraising or cost cuts).';
    return 'Critical runway. Immediate action required: cut burn or close funding.';
  };

  const getStatus = (months: number) => {
    if (months >= 24) return 'Excellent';
    if (months >= 18) return 'Strong';
    if (months >= 12) return 'Moderate';
    if (months >= 6) return 'Short';
    return 'Critical';
  };

  const getRecommendation = (months: number) => {
    if (months >= 24) return 'Maintain discipline. Use runway to hit milestones and raise on strength.';
    if (months >= 18) return 'Plan fundraising or path to revenue. Start outreach before runway dips below 12 months.';
    if (months >= 12) return 'Start fundraising now. Fundraising takes 3–6 months; don\'t wait.';
    if (months >= 6) return 'Urgent: cut burn or close funding. Runway is in the danger zone.';
    return 'Critical: cut burn immediately or close funding. Runway is too short for comfort.';
  };

  const getStrength = (months: number) => {
    if (months >= 24) return 'Very Strong';
    if (months >= 18) return 'Strong';
    if (months >= 12) return 'Moderate';
    if (months >= 6) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (months: number, cash: number, burn: number) => {
    const insights = [];
    if (months >= 18) {
      insights.push('Runway supports milestone-based fundraising');
      insights.push('Plan fundraising or path to revenue before runway shortens');
      insights.push('Track burn monthly to avoid runway creep');
    } else if (months >= 12) {
      insights.push('Fundraising typically takes 3–6 months; start soon');
      insights.push('Consider cost cuts to extend runway if fundraising slips');
      insights.push('Pair with break-even calculator when revenue starts');
    } else {
      insights.push('Runway is tight; prioritize extending cash (fundraising or cuts)');
      insights.push('Avoid new fixed costs until runway is extended');
      insights.push('Use runway extension calculator to model new capital impact');
    }
    insights.push(`$${cash.toLocaleString()} ÷ $${burn.toLocaleString()}/mo = ${months.toFixed(1)} months`);
    return insights;
  };

  const getConsiderations = () => [
    'Use current cash (no expected near-term revenue for pre-revenue)',
    'Monthly burn = total monthly expenses; use same basis as burn rate calculator',
    'Exclude one-time inflows (e.g. expected funding) unless you add them to cash',
    'Runway assumes constant burn; plan for seasonal or step-up in spend',
    'Pair with break-even calculator once you have revenue to plan path to profitability',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc !== null) {
      setResult({
        runwayMonths: calc.runwayMonths,
        runwayYears: calc.runwayYears,
        interpretation: interpret(calc.runwayMonths),
        status: getStatus(calc.runwayMonths),
        recommendation: getRecommendation(calc.runwayMonths),
        strength: getStrength(calc.runwayMonths),
        insights: getInsights(calc.runwayMonths, values.currentCash, values.monthlyBurnRate),
        considerations: getConsiderations(),
      });
    }
  };

  return (
    <div className="space-y-8">
      <Script id="pre-revenue-runway-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter current cash and monthly burn rate to calculate pre-revenue startup runway (months of cash left)
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
                          placeholder="e.g., 500000"
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
                  name="monthlyBurnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        Monthly Burn Rate ($)
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
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Runway
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
                  <CardTitle>Pre-Revenue Runway</CardTitle>
                  <CardDescription>Months of cash left at current burn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.runwayMonths.toFixed(1)} months</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.runwayYears.toFixed(2)} years
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Runway Status</p>
                  <Badge variant={result.status === 'Excellent' || result.status === 'Strong' ? 'default' : result.status === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Financial Strength</p>
                  <Badge variant={result.strength === 'Very Strong' || result.strength === 'Strong' ? 'default' : result.strength === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Time to act</p>
                  <p className="text-lg font-bold">{result.runwayMonths < 12 ? 'Plan now' : 'Monitor'}</p>
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
                <CardDescription>Runway and planning</CardDescription>
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
          <CardDescription>Key components required for the pre-revenue runway calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Current Cash
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total cash and cash equivalents available today. Exclude expected future funding unless it is committed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Bank balance and liquid equivalents</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Exclude receivables or non-liquid assets unless certain</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Pre-revenue: no expected near-term revenue</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Update when you raise or draw down</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Flame className="h-4 w-4" />
                Monthly Burn Rate
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Total monthly cash expenses: salaries, rent, software, marketing, and other opex. Same as net burn when revenue is zero.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Salaries, rent, software, marketing, legal, etc.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Use same basis as burn rate calculator</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Exclude one-time costs; use recurring monthly run rate</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Runway = cash ÷ burn (months)</span>
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
              Runway (months) = Current Cash ÷ Monthly Burn Rate
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            How many months your startup can operate on current cash at the current burn rate. Pre-revenue assumes no revenue; for revenue-growing startups use the runway calculator with revenue growth.
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
            <Link href="/category/finance/startup-cash-flow-break-even-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Cash Flow Break-Even</p>
                      <p className="text-sm text-muted-foreground">When revenue covers opex</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/burn-rate-calculator-pre-revenue" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Flame className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Burn Rate (Pre-Revenue)</p>
                      <p className="text-sm text-muted-foreground">Detailed expense burn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/startup-runway-calculator-with-revenue-growth" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Startup Runway with Revenue Growth</p>
                      <p className="text-sm text-muted-foreground">Path to profitability</p>
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
            <Link href="/category/finance/startup-runway-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Startup Runway</p>
                      <p className="text-sm text-muted-foreground">With optional revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/saas-burn-rate-calculator-gross-vs-net" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">SaaS Burn Rate</p>
                      <p className="text-sm text-muted-foreground">Gross vs Net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to Pre-Revenue Startup Runway" />
        <meta itemProp="description" content="Expert guide to pre-revenue startup runway: formula, interpretation, and how to extend runway with fundraising or cost cuts." />
        <meta itemProp="keywords" content="pre-revenue runway, startup runway calculator, months of cash, burn rate, startup survival" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-01-30" />
        <meta itemProp="url" content="/definitive-pre-revenue-runway-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Pre-Revenue Startup Runway</h1>
        <p className="text-lg italic text-muted-foreground">How many months your pre-revenue startup can run on current cash at the current burn rate—and why it matters for survival and fundraising.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#runway-definition" className="hover:underline">What Is Pre-Revenue Runway?</a></li>
          <li><a href="#runway-formula" className="hover:underline">Formula and Components</a></li>
          <li><a href="#runway-interpretation" className="hover:underline">Interpreting Runway and Benchmarks</a></li>
          <li><a href="#runway-extension" className="hover:underline">Extending Runway</a></li>
          <li><a href="#runway-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="runway-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Pre-Revenue Runway?</h2>
        <p><strong className="font-semibold text-foreground">Pre-revenue runway</strong> is how many months your startup can operate on current cash at the current monthly burn rate when there is no (or negligible) revenue.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Runway Matters for Pre-Revenue Startups</h3>
        <p>Pre-revenue startups consume cash every month. Runway tells you how long you have to reach milestones (e.g. product launch, first revenue, fundraising) before cash runs out.</p>
        <hr />

        <h2 id="runway-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formula and Components</h2>
        <p>Runway (months) = Current Cash ÷ Monthly Burn Rate. Simple and critical for pre-revenue planning.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Runway (months) = Current Cash ÷ Monthly Burn Rate
          </p>
        </div>
        <h3 className="text-xl font-semibold text-foreground mt-6">Defining Cash and Burn</h3>
        <p>Current cash = liquid cash and equivalents. Monthly burn = total monthly cash expenses (salaries, rent, software, marketing, etc.). Use same basis as your burn rate calculator.</p>
        <hr />

        <h2 id="runway-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Runway and Benchmarks</h2>
        <p><strong className="font-semibold text-foreground">18–24+ months:</strong> Strong runway. <strong className="font-semibold text-foreground">12–18 months:</strong> Plan fundraising or path to revenue. <strong className="font-semibold text-foreground">6–12 months:</strong> Start fundraising; process often takes 3–6 months. <strong className="font-semibold text-foreground">Under 6 months:</strong> Critical; cut burn or close funding.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Fundraising Timeline</h3>
        <p>Fundraising typically takes 3–6 months from first meetings to close. Start when runway is 12+ months so you are not desperate.</p>
        <hr />

        <h2 id="runway-extension" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Extending Runway</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Raise new capital (equity or debt) to add cash.</li>
          <li>Reduce monthly burn (cut non-essential spend, defer hires).</li>
          <li>Use the Runway Extension calculator to model impact of new capital or savings.</li>
        </ul>
        <hr />

        <h2 id="runway-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Pre-revenue startup runway is the core metric for <strong className="font-semibold text-foreground">how long you can run on current cash</strong>. Use it with break-even and runway extension calculators to plan survival and fundraising.</p>
        <p>Target 12+ months runway where possible and start fundraising before runway dips into the danger zone.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about pre-revenue startup runway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is pre-revenue startup runway?</h4>
            <p className="text-muted-foreground">
              Runway is how many months your startup can operate on current cash at the current monthly burn rate. Pre-revenue means no (or negligible) revenue, so runway = cash ÷ monthly burn.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I calculate runway?</h4>
            <p className="text-muted-foreground">
              Runway (months) = Current Cash ÷ Monthly Burn Rate. Example: $500K cash and $50K/month burn = 10 months runway.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a good runway for a pre-revenue startup?</h4>
            <p className="text-muted-foreground">
              Generally 12–18+ months is healthy. Under 12 months, start fundraising (process often takes 3–6 months). Under 6 months is critical; cut burn or close funding.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I include expected funding in current cash?</h4>
            <p className="text-muted-foreground">
              Only if it is committed (signed term sheet or closed). Otherwise use actual cash; model new capital with the Runway Extension calculator.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What counts as monthly burn?</h4>
            <p className="text-muted-foreground">
              Total monthly cash expenses: salaries, rent, software, marketing, legal, and other opex. Exclude one-time costs; use recurring run rate. Same as burn rate calculator.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does pre-revenue runway differ from runway with revenue?</h4>
            <p className="text-muted-foreground">
              Pre-revenue runway assumes no revenue, so runway = cash ÷ burn. With revenue, net burn is lower (burn − revenue), so runway extends; use the Startup Runway Calculator with Revenue Growth for that.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">When should I start fundraising?</h4>
            <p className="text-muted-foreground">
              Start when runway is 12+ months. Fundraising typically takes 3–6 months; starting too late forces bad terms or running out of cash.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How can I extend runway without fundraising?</h4>
            <p className="text-muted-foreground">
              Reduce monthly burn: cut non-essential spend, defer hires, renegotiate contracts. Use the Runway Extension calculator to model impact of savings.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why do investors care about runway?</h4>
            <p className="text-muted-foreground">
              Investors use runway to assess how much time you have to hit milestones and whether you need funding soon. Short runway can signal desperation; 12+ months is often preferred.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my burn rate changes?</h4>
            <p className="text-muted-foreground">
              Runway assumes constant burn. If you add headcount or spend, burn rises and runway shortens. Update inputs when plans change and track monthly.
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
                <strong className="block text-primary mb-1">Pre-Revenue Founders</strong>
                <span className="text-sm text-muted-foreground">To know how many months of cash you have and when to fundraise.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors &amp; Board Members</strong>
                <span className="text-sm text-muted-foreground">To assess runway and urgency of next round.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Finance &amp; Ops Teams</strong>
                <span className="text-sm text-muted-foreground">To report runway and plan burn vs milestones.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Accelerators &amp; Advisors</strong>
                <span className="text-sm text-muted-foreground">To help portfolio companies plan runway and fundraising.</span>
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
                <span><strong>Constant burn:</strong> Runway assumes burn stays constant. Hiring or spend increases shorten runway; update inputs when plans change.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No revenue:</strong> Pre-revenue assumes no revenue. If you have revenue, use Startup Runway with Revenue Growth for a more accurate runway.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>One-time items:</strong> Exclude one-time inflows (e.g. expected funding) from cash unless committed; exclude one-time costs from burn.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Healthy runway</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  $600K cash, $30K/month burn → 20 months runway. Strong position to hit milestones and raise on strength; start fundraising before runway dips below 12 months.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Short runway</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  $200K cash, $45K/month burn → 4.4 months runway. Critical; cut burn or close funding immediately. Fundraising takes 3–6 months—do not wait.
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
          <p>The Pre-Revenue Startup Runway Calculator shows how many months your startup can run on current cash at the current monthly burn rate.</p>
          <p>Use it with break-even and runway extension calculators to plan survival and fundraising.</p>
          <p>Target 12+ months runway where possible and start fundraising before runway dips into the danger zone.</p>
        </CardContent>
      </Card>
    </div>
  );
}
