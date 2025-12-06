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
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0).optional(),
  postMoneyValuation: z.number({ invalid_type_error: 'Enter post-money valuation' }).min(0).optional(),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0).optional(),
  ownershipPercentage: z.number({ invalid_type_error: 'Enter ownership percentage' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  preMoneyValuation: number;
  postMoneyValuation: number;
  investmentAmount: number;
  ownershipPercentage: number;
  dilution: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter pre-money valuation (company value before investment) or post-money valuation (value after investment).',
  'Enter investment amount or ownership percentage being sold.',
  'Review calculated pre-money, post-money, ownership percentage, and dilution impact.',
  'Assess reasonableness of valuation and ownership terms.',
];

const faqs = [
  {
    question: 'What is pre-money valuation?',
    answer:
      'Pre-money valuation is the company\'s value immediately before receiving new investment. It represents the value of existing shares before the investment is added to the company.',
  },
  {
    question: 'What is post-money valuation?',
    answer:
      'Post-money valuation is the company\'s value immediately after receiving new investment. It equals pre-money valuation plus the investment amount: Post-Money = Pre-Money + Investment.',
  },
  {
    question: 'How do I calculate ownership percentage?',
    answer:
      'Ownership percentage = (Investment Amount / Post-Money Valuation) × 100. Alternatively, if you know pre-money and investment: Ownership % = Investment / (Pre-Money + Investment) × 100.',
  },
  {
    question: 'What is dilution?',
    answer:
      'Dilution is the reduction in existing shareholders\' ownership percentage when new shares are issued. If founders owned 100% before and now own 80%, they experienced 20% dilution.',
  },
  {
    question: 'How does pre-money vs post-money affect ownership?',
    answer:
      'For the same investment amount, a higher pre-money valuation means investors receive a smaller ownership percentage. Lower pre-money means investors get more ownership for the same investment.',
  },
  {
    question: 'What is a typical ownership percentage for seed rounds?',
    answer:
      'Seed rounds typically involve 10-25% dilution. Series A often involves 15-30% dilution. The exact percentage depends on company stage, traction, market size, and negotiation dynamics.',
  },
  {
    question: 'How do I negotiate pre-money valuation?',
    answer:
      'Negotiate based on traction, market size, team strength, competitive position, and comparable company valuations. Higher traction and growth justify higher pre-money valuations. Consider future funding needs to avoid over-dilution.',
  },
  {
    question: 'What about option pools?',
    answer:
      'Option pools are often created before investment (pre-money) or after (post-money). Pre-money option pools reduce effective pre-money valuation for founders. Post-money pools don\'t affect investor ownership percentage.',
  },
  {
    question: 'How does this affect future rounds?',
    answer:
      'Higher pre-money valuations in early rounds can make future fundraising easier but may create pressure to grow into the valuation. Lower pre-money may provide more room for growth but signals lower confidence.',
  },
  {
    question: 'What is the difference between pre-money and post-money for investors?',
    answer:
      'Investors care about post-money valuation as it determines their ownership percentage. Pre-money is more relevant for founders as it determines how much of the company they retain after the investment.',
  },
];

const relatedCalculators = [
  {
    name: 'Comparable Company Valuation Calculator',
    slug: 'comparable-company-valuation-multiples-calculator',
    description: 'Estimate company value using comparable multiples.',
  },
  {
    name: 'DCF Valuation Calculator',
    slug: 'dcf-calculator',
    description: 'Value companies using discounted cash flow.',
  },
  {
    name: 'Startup Runway Calculator',
    slug: 'startup-runway-calculator',
    description: 'Calculate how long startup cash will last.',
  },
  {
    name: 'Burn Rate Calculator',
    slug: 'burn-rate-calculator',
    description: 'Track startup cash consumption rate.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/pre-money-vs-post-money-valuation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Pre-Money vs Post-Money Valuation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Pre-Money vs Post-Money Valuation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate pre-money and post-money valuations, ownership percentages, and dilution for startup funding rounds.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  let preMoneyValuation = values.preMoneyValuation || 0;
  let postMoneyValuation = values.postMoneyValuation || 0;
  let investmentAmount = values.investmentAmount || 0;
  let ownershipPercentage = values.ownershipPercentage || 0;

  // Calculate missing values based on what's provided
  if (preMoneyValuation > 0 && investmentAmount > 0) {
    postMoneyValuation = preMoneyValuation + investmentAmount;
    ownershipPercentage = (investmentAmount / postMoneyValuation) * 100;
  } else if (postMoneyValuation > 0 && investmentAmount > 0) {
    preMoneyValuation = postMoneyValuation - investmentAmount;
    ownershipPercentage = (investmentAmount / postMoneyValuation) * 100;
  } else if (preMoneyValuation > 0 && ownershipPercentage > 0) {
    postMoneyValuation = preMoneyValuation / (1 - ownershipPercentage / 100);
    investmentAmount = postMoneyValuation - preMoneyValuation;
  } else if (postMoneyValuation > 0 && ownershipPercentage > 0) {
    investmentAmount = postMoneyValuation * (ownershipPercentage / 100);
    preMoneyValuation = postMoneyValuation - investmentAmount;
  }

  // Calculate dilution (assuming founders owned 100% before)
  const dilution = ownershipPercentage;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The pre-money and post-money valuations are calculated. Review ownership percentage and dilution to assess reasonableness of terms.';

  if (preMoneyValuation <= 0 || postMoneyValuation <= 0) {
    status = 'low';
    interpretation = 'Insufficient data to calculate valuations. Enter at least two of: pre-money valuation, post-money valuation, investment amount, or ownership percentage.';
  } else if (ownershipPercentage > 50) {
    status = 'moderate';
    interpretation = 'High ownership percentage suggests significant dilution for existing shareholders. Consider whether the investment terms are favorable and if the valuation is appropriate.';
  } else if (ownershipPercentage >= 20 && ownershipPercentage <= 35) {
    status = 'optimal';
    interpretation = 'Ownership percentage is within typical range for early-stage funding rounds. Terms appear reasonable for both founders and investors.';
  } else if (ownershipPercentage < 20) {
    status = 'good';
    interpretation = 'Low ownership percentage suggests favorable terms for founders with minimal dilution. Ensure the investment amount is sufficient for company needs.';
  } else {
    status = 'moderate';
    interpretation = 'Moderate to high ownership percentage. Review valuation and investment terms to ensure they align with company stage and growth prospects.';
  }

  const recommendations = [
    'Verify calculation inputs: ensure pre-money valuation, post-money valuation, investment amount, and ownership percentage are consistent and reasonable.',
    `Review dilution impact: ${ownershipPercentage.toFixed(1)}% ownership means existing shareholders will be diluted. Consider future funding rounds and total dilution over time.`,
    'Assess valuation reasonableness: compare pre-money valuation to comparable companies, traction metrics, and market size. Ensure valuation supports future fundraising.',
  ];
  if (ownershipPercentage > 40) {
    recommendations.push('High dilution: consider negotiating higher pre-money valuation or smaller investment amount to reduce dilution. High dilution may make future fundraising challenging.');
  }
  if (preMoneyValuation > 0 && investmentAmount > 0 && (investmentAmount / preMoneyValuation) < 0.1) {
    recommendations.push('Small investment relative to valuation: ensure the investment amount is sufficient for company needs and runway goals.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate pre-money and post-money valuations. Review ${ownershipPercentage.toFixed(1)}% ownership percentage and assess reasonableness of terms.` },
    { label: 'This Month', detail: 'Negotiate valuation terms based on company traction, market comparables, and future funding needs. Consider option pool impact on effective valuation.' },
    { label: 'Ongoing', detail: 'Monitor dilution over multiple funding rounds. Plan for future rounds to maintain reasonable founder ownership while securing necessary capital.' },
  ];

  return {
    preMoneyValuation,
    postMoneyValuation,
    investmentAmount,
    ownershipPercentage,
    dilution,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function PreMoneyVsPostMoneyValuationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preMoneyValuation: undefined,
      postMoneyValuation: undefined,
      investmentAmount: undefined,
      ownershipPercentage: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="pre-money-post-money-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Pre-Money vs Post-Money Valuation Calculator
          </CardTitle>
          <CardDescription>Calculate pre-money and post-money valuations, ownership percentages, and dilution for startup funding rounds.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your valuation data</CardTitle>
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
                  name="preMoneyValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Money Valuation ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postMoneyValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post-Money Valuation ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 6000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownershipPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ownership Percentage (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">Enter any two values to calculate the others.</p>
              <Button type="submit" className="w-full md:w-auto">
                Calculate valuation
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
            <CardDescription>See pre-money valuation, post-money valuation, investment amount, ownership percentage, and dilution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pre-Money Valuation</p>
                <p className="text-2xl font-semibold text-primary">{result.preMoneyValuation > 0 ? result.preMoneyValuation.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Post-Money Valuation</p>
                <p className="text-2xl font-semibold text-primary">{result.postMoneyValuation > 0 ? result.postMoneyValuation.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Investment Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.investmentAmount > 0 ? result.investmentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ownership %</p>
                <p className="text-2xl font-semibold text-primary">{result.ownershipPercentage > 0 ? `${result.ownershipPercentage.toFixed(1)}%` : 'N/A'}</p>
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
            <strong>Post-Money Valuation</strong> = Pre-Money Valuation + Investment Amount. This represents company value after the investment is added.
          </p>
          <p>
            <strong>Pre-Money Valuation</strong> = Post-Money Valuation - Investment Amount. This represents company value before the investment.
          </p>
          <p>
            <strong>Ownership Percentage</strong> = (Investment Amount / Post-Money Valuation) × 100. The percentage of the company the investor receives.
          </p>
          <p>
            <strong>Investment Amount</strong> = Post-Money Valuation × (Ownership Percentage / 100). The cash invested for the ownership stake.
          </p>
          <p>Pre-money and post-money valuations are fundamental concepts in startup financing. Pre-money is the value before investment, post-money includes the investment. The difference determines ownership percentage and dilution.</p>
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
                <p className="text-sm text-muted-foreground">Dilution</p>
                <p className="text-xl font-semibold text-primary">{result.dilution.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">For existing shareholders</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Investment / Pre-Money</p>
                <p className="text-xl font-semibold text-primary">
                  {result.preMoneyValuation > 0 ? `${((result.investmentAmount / result.preMoneyValuation) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of pre-money value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Founder Ownership</p>
                <p className="text-xl font-semibold text-primary">{(100 - result.ownershipPercentage).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">After investment</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your valuation data to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Pre-Money vs Post-Money Valuation: Understanding Startup Funding Valuations" />
    <meta itemProp="description" content="A comprehensive guide to pre-money and post-money valuations in startup funding, including how to calculate ownership percentages, dilution, and negotiate investment terms." />
    <meta itemProp="keywords" content="pre-money valuation, post-money valuation, startup funding, ownership percentage, dilution, investment terms, equity financing" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-pre-money-post-money-valuation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Pre-Money vs Post-Money Valuation: Understanding Startup Funding Valuations</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to pre-money and post-money valuations in startup funding, including ownership percentages, dilution, and investment term negotiations.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Pre-Money vs Post-Money Valuation</a></li>
        <li><a href="#calculation" className="hover:underline">Calculation and Formulas</a></li>
        <li><a href="#ownership" className="hover:underline">Ownership Percentage and Dilution</a></li>
        <li><a href="#negotiation" className="hover:underline">Valuation Negotiation and Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Pre-Money vs Post-Money Valuation</h2>
    <p><b>Pre-money valuation</b> is the company's value immediately before receiving new investment, representing the value of existing shares. <b>Post-money valuation</b> is the company's value immediately after receiving investment, equal to pre-money plus the investment amount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Relationship</h3>
    <p>The fundamental equation is: <b>Post-Money Valuation = Pre-Money Valuation + Investment Amount</b>. This relationship determines ownership percentage: <b>Ownership % = (Investment / Post-Money) × 100</b>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
    <p>Understanding pre-money vs post-money is critical for:</p>
    <ul>
        <li><b>Founders:</b> Knowing how much ownership they retain after investment</li>
        <li><b>Investors:</b> Understanding the ownership percentage they receive</li>
        <li><b>Negotiations:</b> Structuring investment terms and valuations</li>
        <li><b>Future rounds:</b> Planning for dilution across multiple funding rounds</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation and Formulas</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formulas</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Post-Money = Pre-Money + Investment</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Ownership % = (Investment / Post-Money) × 100</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Investment = Post-Money × (Ownership % / 100)</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If a company has a $5M pre-money valuation and receives a $1M investment:</p>
    <ul>
        <li>Post-money valuation = $5M + $1M = $6M</li>
        <li>Investor ownership = ($1M / $6M) × 100 = 16.67%</li>
        <li>Founder ownership = 100% - 16.67% = 83.33%</li>
    </ul>

<hr />

    <h2 id="ownership" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Ownership Percentage and Dilution</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Dilution</h3>
    <p><b>Dilution</b> is the reduction in existing shareholders' ownership percentage when new shares are issued. For founders who owned 100% before investment, dilution equals the investor's ownership percentage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Typical Ownership Ranges</h3>
    <ul>
        <li><b>Seed rounds:</b> 10-25% dilution (investors receive 10-25% ownership)</li>
        <li><b>Series A:</b> 15-30% dilution</li>
        <li><b>Series B+:</b> 10-20% per round</li>
    </ul>
    <p>These ranges vary based on company stage, traction, market size, and negotiation dynamics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Option Pools</h3>
    <p>Option pools for employees are often created before investment (pre-money) or after (post-money). Pre-money option pools reduce effective pre-money valuation for founders, while post-money pools don't affect investor ownership percentage.</p>

<hr />

    <h2 id="negotiation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Negotiation and Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Negotiating Pre-Money Valuation</h3>
    <p>Negotiate based on:</p>
    <ul>
        <li><b>Traction:</b> Revenue, users, growth rate, and key metrics</li>
        <li><b>Market size:</b> Total addressable market (TAM) and growth potential</li>
        <li><b>Team strength:</b> Founder experience and team capabilities</li>
        <li><b>Comparables:</b> Similar companies' valuations and funding rounds</li>
        <li><b>Competitive position:</b> Market position and competitive advantages</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul>
        <li><b>Plan for future rounds:</b> Consider total dilution across multiple rounds</li>
        <li><b>Balance valuation and ownership:</b> Higher pre-money means less dilution but may create pressure to grow</li>
        <li><b>Consider option pools:</b> Understand whether pools are pre-money or post-money</li>
        <li><b>Triangulate methods:</b> Use comparable company valuations, DCF, and precedent transactions</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Pre-money and post-money valuations</b> are fundamental concepts in startup financing. Pre-money is the value before investment, post-money includes the investment. The relationship determines ownership percentage and dilution. Understanding these concepts is essential for founders and investors to structure fair investment terms and plan for future funding rounds.</p>
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
          <p>This tool calculates pre-money and post-money valuations, ownership percentages, and dilution for startup funding rounds.</p>
          <p>Outputs include pre-money valuation, post-money valuation, investment amount, ownership percentage, dilution, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

