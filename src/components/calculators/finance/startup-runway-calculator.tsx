'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  currentCash: z.number({ invalid_type_error: 'Enter current cash' }).min(0),
  monthlyBurnRate: z.number({ invalid_type_error: 'Enter monthly burn rate' }).min(0),
  monthlyRevenue: z.number({ invalid_type_error: 'Enter monthly revenue' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentCash: number;
  monthlyBurnRate: number;
  monthlyRevenue: number;
  netBurnRate: number;
  runwayMonths: number;
  runwayDays: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current cash balance (total available cash).',
  'Enter monthly burn rate (total monthly expenses).',
  'Optionally enter monthly revenue to calculate net burn rate.',
  'Review runway in months and days, and recommendations for cash management.',
];

const faqs = [
  {
    question: 'What is startup runway?',
    answer:
      'Startup runway is the number of months (or days) a company can operate before running out of cash, assuming current burn rate and no additional funding. It\'s calculated as: Runway = Current Cash / Monthly Burn Rate.',
  },
  {
    question: 'What is burn rate?',
    answer:
      'Burn rate is the rate at which a company spends cash, typically measured monthly. Gross burn rate is total monthly expenses. Net burn rate accounts for revenue: Net Burn = Gross Burn - Monthly Revenue.',
  },
  {
    question: 'How do I calculate monthly burn rate?',
    answer:
      'Monthly burn rate = Total monthly operating expenses (salaries, rent, marketing, etc.). For net burn rate, subtract monthly revenue: Net Burn = Monthly Expenses - Monthly Revenue.',
  },
  {
    question: 'What is a good runway?',
    answer:
      'Most startups aim for 12-18 months of runway. Less than 6 months is critical and requires immediate fundraising or cost reduction. 18+ months provides more flexibility but may indicate underinvestment in growth.',
  },
  {
    question: 'How does revenue affect runway?',
    answer:
      'Revenue reduces net burn rate, extending runway. If monthly revenue exceeds expenses (positive cash flow), runway becomes infinite assuming revenue continues. Net burn = Gross burn - Revenue.',
  },
  {
    question: 'When should I start fundraising?',
    answer:
      'Start fundraising when you have 6-9 months of runway remaining. Fundraising typically takes 3-6 months, so starting early ensures you don\'t run out of cash during the process. Having 12+ months gives you leverage in negotiations.',
  },
  {
    question: 'How can I extend runway?',
    answer:
      'Extend runway by: reducing expenses (cutting non-essential costs), increasing revenue (faster growth), raising additional capital, or improving unit economics (reducing cost per customer acquisition).',
  },
  {
    question: 'What is the difference between gross and net burn?',
    answer:
      'Gross burn rate is total monthly expenses regardless of revenue. Net burn rate subtracts revenue from expenses. Net burn is more accurate for runway calculation as it reflects actual cash consumption.',
  },
  {
    question: 'How do I account for one-time expenses?',
    answer:
      'For runway calculation, use recurring monthly expenses. One-time expenses (equipment purchases, legal fees) should be excluded from monthly burn rate or amortized over their useful life.',
  },
  {
    question: 'What about future funding rounds?',
    answer:
      'Runway calculation assumes no additional funding. If you\'re planning a funding round, calculate runway to that date and ensure you have sufficient cash to reach it. Factor in fundraising timeline and probability of success.',
  },
];

const relatedCalculators = [
  {
    name: 'Burn Rate Calculator',
    slug: 'burn-rate-calculator',
    description: 'Calculate monthly cash burn rate.',
  },
  {
    name: 'Pre-Money vs Post-Money Valuation Calculator',
    slug: 'pre-money-vs-post-money-valuation-calculator',
    description: 'Calculate startup funding valuations.',
  },
  {
    name: 'Comparable Company Valuation Calculator',
    slug: 'comparable-company-valuation-multiples-calculator',
    description: 'Estimate company value using multiples.',
  },
  {
    name: 'Break-Even Analysis Calculator',
    slug: 'break-even-analysis-calculator',
    description: 'Calculate when revenue covers expenses.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/startup-runway-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Startup Runway Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Startup Runway Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate startup runway - how long your cash will last based on current cash balance and monthly burn rate.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentCash = values.currentCash;
  const monthlyBurnRate = values.monthlyBurnRate;
  const monthlyRevenue = values.monthlyRevenue || 0;

  // Calculate net burn rate
  const netBurnRate = monthlyBurnRate - monthlyRevenue;

  // Calculate runway
  let runwayMonths = 0;
  let runwayDays = 0;
  
  if (netBurnRate > 0) {
    runwayMonths = currentCash / netBurnRate;
    runwayDays = runwayMonths * 30;
  } else if (netBurnRate < 0) {
    // Positive cash flow - infinite runway (assuming revenue continues)
    runwayMonths = Infinity;
    runwayDays = Infinity;
  } else {
    // Break-even
    runwayMonths = Infinity;
    runwayDays = Infinity;
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The startup has adequate runway to operate and pursue growth. Monitor cash flow and plan for future funding needs.';

  if (runwayMonths < 3) {
    status = 'low';
    interpretation = 'Critical runway: less than 3 months remaining. Immediate action required: start fundraising immediately, reduce expenses, or secure bridge financing to avoid running out of cash.';
  } else if (runwayMonths < 6) {
    status = 'moderate';
    interpretation = 'Short runway: less than 6 months remaining. Start fundraising immediately as the process typically takes 3-6 months. Consider cost reductions to extend runway.';
  } else if (runwayMonths >= 6 && runwayMonths < 12) {
    status = 'good';
    interpretation = 'Moderate runway: 6-12 months remaining. Begin fundraising process soon to ensure sufficient time. Monitor burn rate and revenue growth closely.';
  } else if (runwayMonths >= 12 && runwayMonths < 18) {
    status = 'optimal';
    interpretation = 'Good runway: 12-18 months remaining. This provides adequate time for fundraising and growth. Plan for next funding round while maintaining focus on growth.';
  } else if (runwayMonths === Infinity) {
    status = 'optimal';
    interpretation = 'Positive cash flow: revenue exceeds expenses, providing infinite runway assuming revenue continues. Focus on growth and profitability improvement.';
  } else {
    status = 'good';
    interpretation = 'Extended runway: 18+ months remaining. Provides flexibility but may indicate underinvestment in growth. Consider accelerating growth investments if appropriate.';
  }

  const recommendations = [
    `Monitor cash runway: ${runwayMonths === Infinity ? 'Infinite' : runwayMonths.toFixed(1)} months of runway ${runwayMonths < 6 ? 'requires immediate action' : runwayMonths < 12 ? 'requires planning for fundraising' : 'provides adequate time'}.`,
    `Track burn rate trends: monitor whether monthly burn rate is increasing, decreasing, or stable. Net burn rate of ${netBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month ${netBurnRate > 0 ? 'consumes cash' : 'generates positive cash flow'}.`,
    'Plan fundraising timeline: start fundraising 6-9 months before running out of cash. The process typically takes 3-6 months from first meeting to cash in bank.',
  ];
  if (runwayMonths < 6) {
    recommendations.push('Urgent action required: reduce expenses immediately, accelerate revenue growth, or secure bridge financing. Consider extending runway through cost reductions.');
  }
  if (monthlyRevenue > 0 && netBurnRate > 0) {
    recommendations.push(`Revenue growth impact: increasing monthly revenue by ${(netBurnRate * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })} would extend runway by approximately ${((currentCash / (netBurnRate * 0.9)) - runwayMonths).toFixed(1)} months.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate current runway: ${runwayMonths === Infinity ? 'Infinite' : `${runwayMonths.toFixed(1)} months (${runwayDays.toFixed(0)} days)`}. Assess urgency of fundraising or cost reduction.` },
    { label: 'This Month', detail: runwayMonths < 6 ? 'Start fundraising immediately or implement cost reductions. Time is critical with limited runway remaining.' : 'Plan for next funding round. Update financial projections and prepare investor materials if runway is less than 12 months.' },
    { label: 'Ongoing', detail: 'Monitor cash balance, burn rate, and revenue monthly. Update runway calculations regularly and adjust strategy based on cash position and growth trajectory.' },
  ];

  return {
    currentCash,
    monthlyBurnRate,
    monthlyRevenue,
    netBurnRate,
    runwayMonths: runwayMonths === Infinity ? 999 : runwayMonths,
    runwayDays: runwayDays === Infinity ? 99999 : runwayDays,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function StartupRunwayCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCash: undefined,
      monthlyBurnRate: undefined,
      monthlyRevenue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="startup-runway-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Startup Runway Calculator
          </CardTitle>
          <CardDescription>Calculate startup runway - how long your cash will last based on current cash balance and monthly burn rate.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your cash flow data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Cash Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Monthly Burn Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Revenue ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate runway
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See runway in months and days, net burn rate, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Runway (Months)</p>
                <p className={`text-2xl font-semibold ${result.runwayMonths < 6 ? 'text-red-600' : result.runwayMonths < 12 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.runwayMonths >= 999 ? 'Infinite' : result.runwayMonths.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">months</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Runway (Days)</p>
                <p className={`text-2xl font-semibold ${result.runwayDays < 180 ? 'text-red-600' : result.runwayDays < 360 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.runwayDays >= 99999 ? 'Infinite' : result.runwayDays.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Burn Rate</p>
                <p className={`text-2xl font-semibold ${result.netBurnRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.netBurnRate > 0 ? '-' : '+'}{Math.abs(result.netBurnRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Net Burn Rate</strong> = Monthly Burn Rate - Monthly Revenue. This represents actual cash consumption after accounting for revenue.
          </p>
          <p>
            <strong>Runway (Months)</strong> = Current Cash / Net Burn Rate. If net burn is negative (positive cash flow), runway is infinite assuming revenue continues.
          </p>
          <p>
            <strong>Runway (Days)</strong> = Runway (Months) Ã— 30. Approximate days until cash runs out.
          </p>
          <p>
            <strong>Gross Burn Rate</strong> = Total monthly expenses (salaries, rent, marketing, etc.) regardless of revenue.
          </p>
          <p>Startup runway indicates how long a company can operate before running out of cash. Most startups aim for 12-18 months of runway. Start fundraising when you have 6-9 months remaining.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gross Burn Rate</p>
                <p className="text-xl font-semibold text-primary">{result.monthlyBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cash / Month</p>
                <p className="text-xl font-semibold text-primary">
                  {result.netBurnRate > 0 ? (result.currentCash / result.netBurnRate).toFixed(1) : 'Infinite'}
                </p>
                <p className="text-xs text-muted-foreground">Months of cash</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Revenue Coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {result.monthlyBurnRate > 0 ? `${((result.monthlyRevenue / result.monthlyBurnRate) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of expenses</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your cash flow data to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Startup Runway: Calculating Cash Runway for Startups" />
    <meta itemProp="description" content="A comprehensive guide to calculating startup runway - how long your cash will last based on current cash balance, monthly burn rate, and revenue." />
    <meta itemProp="keywords" content="startup runway, cash runway, burn rate, startup cash management, runway calculator, startup financing, cash flow management" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-startup-runway-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Runway: Calculating Cash Runway for Startups</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating and managing startup runway - how long your cash will last based on burn rate and revenue.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Startup Runway?</a></li>
        <li><a href="#calculation" className="hover:underline">Runway Calculation</a></li>
        <li><a href="#burn" className="hover:underline">Burn Rate and Cash Management</a></li>
        <li><a href="#fundraising" className="hover:underline">Fundraising Timeline and Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Startup Runway?</h2>
    <p><b>Startup runway</b> is the number of months (or days) a company can operate before running out of cash, assuming current burn rate and no additional funding. It's a critical metric for startup survival and fundraising planning.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Runway answers the question: "How long until we run out of money?" It's calculated as: <b>Runway = Current Cash / Monthly Net Burn Rate</b>. If revenue exceeds expenses (positive cash flow), runway is effectively infinite assuming revenue continues.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Runway Matters</h3>
    <p>Understanding runway is essential for:</p>
    <ul>
        <li><b>Fundraising timing:</b> Start fundraising 6-9 months before running out of cash</li>
        <li><b>Cash management:</b> Make informed decisions about spending and growth investments</li>
        <li><b>Strategic planning:</b> Balance growth investments with cash preservation</li>
        <li><b>Risk management:</b> Identify cash flow risks and plan for contingencies</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Runway Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Runway (Months) = Current Cash / Net Burn Rate</b></p>
    </div>
    <p>Where <b>Net Burn Rate = Monthly Expenses - Monthly Revenue</b>. If revenue exceeds expenses, net burn is negative and runway is infinite (assuming revenue continues).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If a startup has $500,000 in cash, $50,000 monthly expenses, and $20,000 monthly revenue:</p>
    <ul>
        <li>Net burn rate = $50,000 - $20,000 = $30,000/month</li>
        <li>Runway = $500,000 / $30,000 = 16.7 months</li>
    </ul>

<hr />

    <h2 id="burn" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burn Rate and Cash Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Gross vs Net Burn Rate</h3>
    <p><b>Gross burn rate</b> is total monthly expenses regardless of revenue. <b>Net burn rate</b> subtracts revenue from expenses, representing actual cash consumption. Net burn is more accurate for runway calculation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What is a Good Runway?</h3>
    <ul>
        <li><b>Less than 3 months:</b> Critical - immediate action required</li>
        <li><b>3-6 months:</b> Short - start fundraising immediately</li>
        <li><b>6-12 months:</b> Moderate - begin fundraising process</li>
        <li><b>12-18 months:</b> Good - adequate time for fundraising and growth</li>
        <li><b>18+ months:</b> Extended - may indicate underinvestment in growth</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Extending Runway</h3>
    <p>Extend runway by: reducing expenses (cutting non-essential costs), increasing revenue (faster growth), raising additional capital, or improving unit economics (reducing customer acquisition cost).</p>

<hr />

    <h2 id="fundraising" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fundraising Timeline and Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">When to Start Fundraising</h3>
    <p>Start fundraising when you have <b>6-9 months of runway remaining</b>. The fundraising process typically takes 3-6 months from first investor meeting to cash in bank, so starting early is critical.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul>
        <li><b>Monitor regularly:</b> Update runway calculations monthly as cash and burn rate change</li>
        <li><b>Plan ahead:</b> Factor in fundraising timeline and probability of success</li>
        <li><b>Track trends:</b> Monitor whether burn rate is increasing, decreasing, or stable</li>
        <li><b>Account for seasonality:</b> Consider revenue and expense seasonality in calculations</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Startup runway</b> is a critical metric for cash management and fundraising planning. Calculate runway as current cash divided by net burn rate. Most startups aim for 12-18 months of runway and start fundraising when they have 6-9 months remaining. Regular monitoring and proactive cash management are essential for startup survival and growth.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool calculates startup runway - how long your cash will last based on current cash balance and monthly burn rate.</p>
          <p>Outputs include runway in months and days, net burn rate, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

