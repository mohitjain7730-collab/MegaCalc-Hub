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
  startingCash: z.number({ invalid_type_error: 'Enter starting cash' }).min(0),
  endingCash: z.number({ invalid_type_error: 'Enter ending cash' }).min(0),
  periodMonths: z.number({ invalid_type_error: 'Enter period in months' }).min(0.1).max(12),
  monthlyRevenue: z.number({ invalid_type_error: 'Enter monthly revenue' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  startingCash: number;
  endingCash: number;
  periodMonths: number;
  monthlyRevenue: number;
  grossBurnRate: number;
  netBurnRate: number;
  cashChange: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter starting cash balance at the beginning of the period.',
  'Enter ending cash balance at the end of the period.',
  'Enter period length in months (typically 1-3 months for accuracy).',
  'Optionally enter monthly revenue to calculate net burn rate.',
  'Review gross burn rate, net burn rate, and cash consumption trends.',
];

const faqs = [
  {
    question: 'What is burn rate?',
    answer:
      'Burn rate is the rate at which a company spends cash, typically measured monthly. Gross burn rate is total monthly expenses. Net burn rate accounts for revenue: Net Burn = Gross Burn - Monthly Revenue.',
  },
  {
    question: 'How do I calculate burn rate?',
    answer:
      'Burn rate = (Starting Cash - Ending Cash) / Period in Months. If revenue is provided, net burn rate = Gross Burn - Monthly Revenue. Use 1-3 month periods for accuracy as longer periods may include one-time items.',
  },
  {
    question: 'What is the difference between gross and net burn?',
    answer:
      'Gross burn rate is total monthly expenses regardless of revenue. Net burn rate subtracts revenue from expenses, representing actual cash consumption. Net burn is more accurate for runway calculations.',
  },
  {
    question: 'What is a typical burn rate for startups?',
    answer:
      'Burn rates vary widely by stage and industry. Early-stage startups may burn $20K-$100K/month, while growth-stage companies may burn $500K-$2M+/month. Focus on whether burn rate is sustainable relative to cash and growth goals.',
  },
  {
    question: 'How do I reduce burn rate?',
    answer:
      'Reduce burn rate by: cutting non-essential expenses, optimizing operations, reducing headcount or salaries, renegotiating contracts, delaying non-critical investments, or improving unit economics to reduce customer acquisition costs.',
  },
  {
    question: 'When is high burn rate acceptable?',
    answer:
      'High burn rate may be acceptable when: investing in high-growth opportunities with strong ROI, building market position in competitive markets, or when you have sufficient runway and clear path to profitability. Ensure burn rate aligns with growth strategy.',
  },
  {
    question: 'How do I account for one-time expenses?',
    answer:
      'For accurate burn rate, exclude one-time expenses (equipment purchases, legal fees, etc.) or amortize them. Use recurring monthly expenses for burn rate calculation. One-time items should be tracked separately.',
  },
  {
    question: 'What about revenue growth?',
    answer:
      'As revenue grows, net burn rate decreases (assuming expenses stay constant). Monitor both gross and net burn rates. If revenue growth outpaces expense growth, net burn may become negative (positive cash flow).',
  },
  {
    question: 'How does burn rate relate to runway?',
    answer:
      'Runway = Current Cash / Net Burn Rate. Higher burn rate means shorter runway. Monitor burn rate trends to forecast runway and plan fundraising. Aim to maintain 12-18 months of runway.',
  },
  {
    question: 'Should I track burn rate monthly or quarterly?',
    answer:
      'Track monthly for early-stage startups to catch issues early. Quarterly tracking may be sufficient for more established companies. Monthly tracking provides better visibility into trends and allows faster course correction.',
  },
];

const relatedCalculators = [
  {
    name: 'Startup Runway Calculator',
    slug: 'startup-runway-calculator',
    description: 'Calculate how long cash will last based on burn rate.',
  },
  {
    name: 'Pre-Money vs Post-Money Valuation Calculator',
    slug: 'pre-money-vs-post-money-valuation-calculator',
    description: 'Calculate startup funding valuations.',
  },
  {
    name: 'Break-Even Analysis Calculator',
    slug: 'break-even-analysis-calculator',
    description: 'Calculate when revenue covers expenses.',
  },
  {
    name: 'Cash Flow Forecasting Calculator',
    slug: 'cash-flow-forecasting-calculator',
    description: 'Forecast future cash flows.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/burn-rate-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Burn Rate Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Burn Rate Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate startup burn rate - monthly cash consumption rate based on cash balance changes over time.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const startingCash = values.startingCash;
  const endingCash = values.endingCash;
  const periodMonths = values.periodMonths;
  const monthlyRevenue = values.monthlyRevenue || 0;

  // Calculate cash change
  const cashChange = startingCash - endingCash;

  // Calculate gross burn rate
  const grossBurnRate = periodMonths > 0 ? cashChange / periodMonths : 0;

  // Calculate net burn rate
  const netBurnRate = grossBurnRate - monthlyRevenue;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The burn rate is calculated. Monitor trends over time and ensure burn rate aligns with growth strategy and available cash runway.';

  if (cashChange < 0) {
    status = 'optimal';
    interpretation = 'Positive cash flow: cash increased during the period, indicating revenue exceeds expenses. This is sustainable if revenue continues.';
  } else if (netBurnRate < 0) {
    status = 'optimal';
    interpretation = 'Negative net burn (positive cash flow): revenue exceeds expenses, generating cash. This is sustainable assuming revenue continues.';
  } else if (grossBurnRate > 0 && netBurnRate > 0) {
    if (netBurnRate > grossBurnRate * 0.9) {
      status = 'moderate';
      interpretation = 'High burn rate relative to revenue. Consider reducing expenses or accelerating revenue growth to improve cash flow sustainability.';
    } else {
      status = 'good';
      interpretation = 'Moderate burn rate with some revenue offset. Monitor trends and ensure burn rate is sustainable relative to cash runway.';
    }
  } else {
    status = 'low';
    interpretation = 'Unable to calculate burn rate. Verify cash balances and period length are correct.';
  }

  const recommendations = [
    `Monitor burn rate trends: ${netBurnRate < 0 ? 'Positive cash flow' : `Net burn of ${netBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month`} ${netBurnRate < 0 ? 'is sustainable if revenue continues' : 'requires monitoring relative to cash runway'}.`,
    'Track monthly: calculate burn rate monthly to identify trends early. Compare current period to previous periods to assess whether burn rate is increasing, decreasing, or stable.',
    'Review expense categories: analyze which expenses drive burn rate. Identify opportunities to reduce non-essential costs while maintaining growth investments.',
  ];
  if (netBurnRate > 0 && grossBurnRate > 0) {
    const revenueCoverage = (monthlyRevenue / grossBurnRate) * 100;
    if (revenueCoverage < 50) {
      recommendations.push(`Low revenue coverage: revenue covers only ${revenueCoverage.toFixed(1)}% of expenses. Focus on revenue growth or expense reduction to improve sustainability.`);
    }
  }
  if (periodMonths > 3) {
    recommendations.push('Use shorter periods: for accuracy, calculate burn rate using 1-3 month periods. Longer periods may include one-time items that skew results.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate burn rate: ${netBurnRate < 0 ? 'Positive cash flow' : `Net burn of ${netBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month`}. Compare to previous periods to identify trends.` },
    { label: 'This Month', detail: 'Analyze expense categories driving burn rate. Identify opportunities to reduce costs while maintaining growth. Review revenue growth impact on net burn rate.' },
    { label: 'Ongoing', detail: 'Track burn rate monthly and compare to runway calculations. Adjust spending and growth investments based on cash position and burn rate trends.' },
  ];

  return {
    startingCash,
    endingCash,
    periodMonths,
    monthlyRevenue,
    grossBurnRate,
    netBurnRate,
    cashChange,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function BurnRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startingCash: undefined,
      endingCash: undefined,
      periodMonths: undefined,
      monthlyRevenue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="burn-rate-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Burn Rate Calculator
          </CardTitle>
          <CardDescription>Calculate startup burn rate - monthly cash consumption rate based on cash balance changes over time.</CardDescription>
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
                  name="startingCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Cash Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endingCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ending Cash Balance ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 450000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Length (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                Calculate burn rate
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
            <CardDescription>See gross burn rate, net burn rate, cash change, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gross Burn Rate</p>
                <p className="text-2xl font-semibold text-primary">{result.grossBurnRate.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Burn Rate</p>
                <p className={`text-2xl font-semibold ${result.netBurnRate < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.netBurnRate < 0 ? '+' : ''}{Math.abs(result.netBurnRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cash Change</p>
                <p className={`text-2xl font-semibold ${result.cashChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.cashChange < 0 ? '+' : '-'}{Math.abs(result.cashChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
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
            <strong>Gross Burn Rate</strong> = (Starting Cash - Ending Cash) / Period in Months. This represents total monthly cash consumption regardless of revenue.
          </p>
          <p>
            <strong>Net Burn Rate</strong> = Gross Burn Rate - Monthly Revenue. This represents actual cash consumption after accounting for revenue. Negative net burn indicates positive cash flow.
          </p>
          <p>
            <strong>Cash Change</strong> = Starting Cash - Ending Cash. Positive change means cash decreased (cash was spent), negative change means cash increased (positive cash flow).
          </p>
          <p>Burn rate measures how quickly a company spends cash. Use 1-3 month periods for accuracy. Longer periods may include one-time items that skew results. Track monthly to identify trends.</p>
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
                <p className="text-sm text-muted-foreground">Annual Burn Rate</p>
                <p className="text-xl font-semibold text-primary">{(result.grossBurnRate * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Revenue Coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {result.grossBurnRate > 0 ? `${((result.monthlyRevenue / result.grossBurnRate) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of expenses</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cash Change %</p>
                <p className={`text-xl font-semibold ${result.cashChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.startingCash > 0 ? `${((result.cashChange / result.startingCash) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of starting cash</p>
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
                <Link href={`/category/finance/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Definitive Guide to Burn Rate: Calculating Startup Cash Consumption" />
    <meta itemProp="description" content="A comprehensive guide to calculating and managing startup burn rate - the monthly cash consumption rate based on cash balance changes over time." />
    <meta itemProp="keywords" content="burn rate, startup burn rate, cash burn, monthly burn rate, gross burn, net burn, startup cash management, cash consumption" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-burn-rate-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Burn Rate: Calculating Startup Cash Consumption</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating and managing startup burn rate - the rate at which companies consume cash.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Burn Rate?</a></li>
        <li><a href="#calculation" className="hover:underline">Burn Rate Calculation</a></li>
        <li><a href="#gross" className="hover:underline">Gross vs Net Burn Rate</a></li>
        <li><a href="#management" className="hover:underline">Burn Rate Management</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Burn Rate?</h2>
    <p><b>Burn rate</b> is the rate at which a company spends cash, typically measured monthly. It's a critical metric for startup cash management, runway calculation, and fundraising planning.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Burn rate answers: "How fast are we spending money?" It's calculated as: <b>Burn Rate = (Starting Cash - Ending Cash) / Period in Months</b>. Use 1-3 month periods for accuracy, as longer periods may include one-time items.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Burn Rate Matters</h3>
    <p>Understanding burn rate is essential for:</p>
    <ul>
        <li><b>Runway calculation:</b> Runway = Current Cash / Burn Rate</li>
        <li><b>Cash management:</b> Make informed spending decisions</li>
        <li><b>Fundraising planning:</b> Determine when to raise capital</li>
        <li><b>Growth strategy:</b> Balance growth investments with cash preservation</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burn Rate Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Gross Burn Rate = (Starting Cash - Ending Cash) / Period in Months</b></p>
    </div>
    <p>If revenue is provided, calculate net burn rate:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Net Burn Rate = Gross Burn Rate - Monthly Revenue</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If cash decreased from $500,000 to $450,000 over 1 month:</p>
    <ul>
        <li>Gross burn rate = ($500,000 - $450,000) / 1 = $50,000/month</li>
        <li>If monthly revenue is $20,000: Net burn = $50,000 - $20,000 = $30,000/month</li>
    </ul>

<hr />

    <h2 id="gross" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Gross vs Net Burn Rate</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Gross Burn Rate</h3>
    <p><b>Gross burn rate</b> is total monthly expenses regardless of revenue. It represents total cash outflows and is useful for understanding total spending, but doesn't reflect actual cash consumption when revenue exists.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Burn Rate</h3>
    <p><b>Net burn rate</b> subtracts revenue from expenses, representing actual cash consumption. Negative net burn indicates positive cash flow (revenue exceeds expenses). Net burn is more accurate for runway calculations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Use Each</h3>
    <p>Use gross burn for: understanding total spending, expense management, and when revenue is minimal. Use net burn for: runway calculations, cash flow planning, and when revenue is significant.</p>

<hr />

    <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Burn Rate Management</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Burn Rate</h3>
    <p>Reduce burn rate by: cutting non-essential expenses, optimizing operations, reducing headcount or salaries, renegotiating contracts, delaying non-critical investments, or improving unit economics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When High Burn is Acceptable</h3>
    <p>High burn rate may be acceptable when: investing in high-growth opportunities with strong ROI, building market position in competitive markets, or when you have sufficient runway and clear path to profitability.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul>
        <li><b>Track monthly:</b> Calculate burn rate monthly to identify trends early</li>
        <li><b>Exclude one-time items:</b> Use recurring expenses for accurate burn rate</li>
        <li><b>Compare periods:</b> Monitor whether burn rate is increasing, decreasing, or stable</li>
        <li><b>Link to runway:</b> Use burn rate to calculate and monitor runway</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Burn rate</b> is a critical metric for startup cash management. Calculate as (Starting Cash - Ending Cash) / Period in Months. Use net burn rate (gross burn minus revenue) for accurate runway calculations. Track monthly, exclude one-time items, and monitor trends to make informed cash management decisions.</p>
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
          <p>This tool calculates startup burn rate - monthly cash consumption rate based on cash balance changes over time.</p>
          <p>Outputs include gross burn rate, net burn rate, cash change, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

