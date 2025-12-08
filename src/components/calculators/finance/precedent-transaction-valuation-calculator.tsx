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
  targetRevenue: z.number({ invalid_type_error: 'Enter target revenue' }).min(0),
  targetEBITDA: z.number({ invalid_type_error: 'Enter target EBITDA' }).min(0).optional(),
  targetEBIT: z.number({ invalid_type_error: 'Enter target EBIT' }).min(0).optional(),
  medianTransactionEvRevenue: z.number({ invalid_type_error: 'Enter median transaction EV/Revenue' }).min(0).optional(),
  medianTransactionEvEBITDA: z.number({ invalid_type_error: 'Enter median transaction EV/EBITDA' }).min(0).optional(),
  medianTransactionEvEBIT: z.number({ invalid_type_error: 'Enter median transaction EV/EBIT' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  targetRevenue: number;
  targetEBITDA?: number;
  targetEBIT?: number;
  medianTransactionEvRevenue?: number;
  medianTransactionEvEBITDA?: number;
  medianTransactionEvEBIT?: number;
  estimatedEvFromRevenue: number;
  estimatedEvFromEBITDA: number;
  estimatedEvFromEBIT: number;
  averageEstimatedEv: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter target company revenue.',
  'Optionally enter target EBITDA and EBIT.',
  'Enter median transaction multiples from precedent transactions (EV/Revenue, EV/EBITDA, EV/EBIT).',
  'Review estimated enterprise values based on transaction multiples.',
];

const faqs = [
  {
    question: 'What is precedent transaction valuation?',
    answer:
      'Precedent transaction analysis (PTA) values a company based on prices paid for similar companies in past M&A transactions. It uses transaction multiples from historical deals, which reflect control premiums and synergies, making it useful for M&A valuation and control transaction analysis.',
  },
  {
    question: 'How does precedent transaction differ from comparable company analysis?',
    answer:
      'Precedent transactions use multiples from past M&A deals, which include control premiums and synergies, making them typically higher than trading multiples. Comparable company analysis uses current trading multiples from public markets, which don\'t include control premiums. Precedent transactions reflect what buyers actually paid for similar companies.',
  },
  {
    question: 'What are transaction multiples?',
    answer:
      'Transaction multiples are calculated from past M&A deals by dividing transaction enterprise value by the target company\'s financial metrics (revenue, EBITDA, EBIT). Common multiples include EV/Revenue, EV/EBITDA, and EV/EBIT. These multiples reflect what buyers paid, including control premiums and expected synergies.',
  },
  {
    question: 'How are precedent transactions selected?',
    answer:
      'Select precedent transactions based on: similar industry and business model, similar company size, recent transactions (typically last 3-5 years), similar transaction type (strategic vs. financial buyer), and comparable market conditions. Focus on transactions that closely match the target company to ensure relevant multiples.',
  },
  {
    question: 'Why are transaction multiples typically higher than trading multiples?',
    answer:
      'Transaction multiples include control premiums (typically 20-40%) that buyers pay for control, and synergies that buyers expect to realize. Trading multiples reflect minority interest values in public markets. This makes transaction multiples more appropriate for M&A and control transaction valuations.',
  },
  {
    question: 'How is estimated enterprise value calculated?',
    answer:
      'Estimated EV = Target Financial Metric × Median Transaction Multiple. For example: Estimated EV = Target Revenue × Median Transaction EV/Revenue, or Estimated EV = Target EBITDA × Median Transaction EV/EBITDA. Multiple estimates are averaged or a range is used for triangulation.',
  },
  {
    question: 'What is a control premium?',
    answer:
      'Control premium is the additional amount buyers pay above market price to acquire control of a company. Control premiums typically range from 20-40% but can vary widely. Precedent transactions include control premiums in their multiples, making them appropriate for valuing control transactions.',
  },
  {
    question: 'How recent should precedent transactions be?',
    answer:
      'Precedent transactions should typically be from the last 3-5 years to reflect current market conditions. Very old transactions may not reflect current market dynamics, multiples, or industry conditions. However, if relevant recent transactions are limited, older transactions can provide context if adjusted for market conditions.',
  },
  {
    question: 'Should I use median or average transaction multiples?',
    answer:
      'Median is generally preferred because it\'s less affected by outliers. Some transactions may have very high multiples due to unique factors (strategic value, competitive bidding), which can skew averages. However, review both median and average - if they differ significantly, investigate outliers and consider excluding them if not relevant.',
  },
  {
    question: 'How do I account for transaction-specific factors?',
    answer:
      'Account for differences by: adjusting for growth differences, considering strategic vs. financial buyer premiums, accounting for synergies included in transaction price, adjusting for market timing differences, and considering transaction size differences. Precedent transactions with very different characteristics may need adjustment or exclusion.',
  },
];

const relatedCalculators = [
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate comparable company valuation.',
  },
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge to equity value.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/precedent-transaction-valuation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Precedent Transaction Valuation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Precedent Transaction Valuation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Value a company using precedent transaction analysis by applying transaction multiples from past M&A deals, which include control premiums and synergies.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const targetRevenue = values.targetRevenue;
  const targetEBITDA = values.targetEBITDA;
  const targetEBIT = values.targetEBIT;
  const medianTransactionEvRevenue = values.medianTransactionEvRevenue;
  const medianTransactionEvEBITDA = values.medianTransactionEvEBITDA;
  const medianTransactionEvEBIT = values.medianTransactionEvEBIT;
  
  let estimatedEvFromRevenue = 0;
  let estimatedEvFromEBITDA = 0;
  let estimatedEvFromEBIT = 0;
  
  if (medianTransactionEvRevenue && medianTransactionEvRevenue > 0) {
    estimatedEvFromRevenue = targetRevenue * medianTransactionEvRevenue;
  }
  if (medianTransactionEvEBITDA && targetEBITDA && medianTransactionEvEBITDA > 0 && targetEBITDA > 0) {
    estimatedEvFromEBITDA = targetEBITDA * medianTransactionEvEBITDA;
  }
  if (medianTransactionEvEBIT && targetEBIT && medianTransactionEvEBIT > 0 && targetEBIT > 0) {
    estimatedEvFromEBIT = targetEBIT * medianTransactionEvEBIT;
  }
  
  const estimates: number[] = [];
  if (estimatedEvFromRevenue > 0) estimates.push(estimatedEvFromRevenue);
  if (estimatedEvFromEBITDA > 0) estimates.push(estimatedEvFromEBITDA);
  if (estimatedEvFromEBIT > 0) estimates.push(estimatedEvFromEBIT);
  
  const averageEstimatedEv = estimates.length > 0 ? estimates.reduce((sum, val) => sum + val, 0) / estimates.length : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Estimated enterprise value from precedent transactions: ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'Unable to calculate - enter at least one transaction multiple'}. `;
  if (estimates.length > 1) {
    const minEst = Math.min(...estimates);
    const maxEst = Math.max(...estimates);
    interpretation += `Valuation range: ${minEst.toLocaleString()} to ${maxEst.toLocaleString()} based on ${estimates.length} multiple${estimates.length > 1 ? 's' : ''}.`;
    const rangePercent = averageEstimatedEv > 0 ? ((maxEst - minEst) / averageEstimatedEv) * 100 : 0;
    if (rangePercent > 50) {
      status = 'moderate';
      interpretation += ' Wide range indicates valuation uncertainty - review transaction comparability.';
    }
  } else if (averageEstimatedEv > 0) {
    interpretation += `Based on ${estimates.length} transaction multiple. Note: Transaction multiples typically include control premiums (20-40%) and synergies, making them higher than trading multiples.`;
    status = 'good';
  } else {
    status = 'low';
    interpretation += 'Enter at least one transaction multiple and corresponding financial metric to calculate valuation.';
  }

  const recommendations: string[] = [];
  
  // Build first recommendation
  let firstRec = `Precedent transaction valuation: Estimated enterprise value of ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'N/A'} based on transaction multiples from past M&A deals.`;
  if (estimates.length > 1) {
    firstRec += ` Multiple estimates range from ${Math.min(...estimates).toLocaleString()} to ${Math.max(...estimates).toLocaleString()}, providing valuation triangulation.`;
  } else if (estimates.length === 1) {
    firstRec += ' Single multiple estimate provides baseline, but consider using multiple multiples for better triangulation.';
  } else {
    firstRec += ' Enter transaction multiples to calculate valuation.';
  }
  recommendations.push(firstRec);
  
  recommendations.push('Transaction multiple characteristics: Transaction multiples from precedent deals include control premiums (typically 20-40%) and expected synergies, making them typically 20-40% higher than trading multiples. Use precedent transactions for M&A and control transaction valuations.');
  recommendations.push('Comparability considerations: Ensure precedent transactions are similar in industry, size, growth, profitability, and transaction type. Focus on recent transactions (last 3-5 years). Review for outliers and transaction-specific factors (strategic value, competitive bidding) that may not apply to target.');
  recommendations.push('Convert to equity value: Use EV bridge to convert enterprise value to equity value: Equity Value = EV - Debt - Preferred Equity - Minority Interest + Cash + Investments. Divide equity value by shares outstanding for per-share valuation.');
  
  if (estimates.length === 0) {
    recommendations.push('CRITICAL: No transaction multiples entered - Enter at least one transaction multiple (EV/Revenue, EV/EBITDA, or EV/EBIT) along with the corresponding financial metric to calculate valuation. Transaction multiples are typically higher than trading multiples due to control premiums and synergies.');
  }
  if (estimates.length > 1) {
    const rangePercent = averageEstimatedEv > 0 ? ((Math.max(...estimates) - Math.min(...estimates)) / averageEstimatedEv) * 100 : 0;
    if (rangePercent > 50) {
      recommendations.push(`Wide valuation range (${rangePercent.toFixed(0)}% spread): Review comparability of precedent transactions, check for outliers, consider using median instead of individual transaction multiples, and assess if transactions have unique characteristics (strategic value, competitive bidding) that may not apply to target.`);
    }
  }

  const plan = [
    { label: 'This Week', detail: `Calculate precedent transaction valuation: Estimated EV ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'N/A'} based on ${estimates.length} transaction multiple(s). Document precedent transactions, multiples used, and assumptions.` },
    { label: 'This Month', detail: 'Validate valuation by: reviewing comparability of precedent transactions, checking for outliers and transaction-specific factors, comparing to other valuation methods (comparable companies, DCF), and converting EV to equity value using EV bridge. Consider adjustments for growth, profitability, or transaction type differences.' },
    { label: 'Ongoing', detail: 'Update valuation as: new relevant transactions occur, target company financials update, and market conditions evolve. Compare transaction multiples to trading multiples to assess control premium levels. Use precedent transactions for M&A analysis and control transaction valuations.' },
  ];

  return { targetRevenue, targetEBITDA, targetEBIT, medianTransactionEvRevenue, medianTransactionEvEBITDA, medianTransactionEvEBIT, estimatedEvFromRevenue, estimatedEvFromEBITDA, estimatedEvFromEBIT, averageEstimatedEv, interpretation, status, recommendations, plan };
};

export default function PrecedentTransactionValuationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetRevenue: undefined,
      targetEBITDA: undefined,
      targetEBIT: undefined,
      medianTransactionEvRevenue: undefined,
      medianTransactionEvEBITDA: undefined,
      medianTransactionEvEBIT: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="precedent-transaction-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Precedent Transaction Valuation Calculator
          </CardTitle>
          <CardDescription>Value a company using precedent transaction analysis by applying transaction multiples from past M&A deals, which include control premiums and synergies.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input target company data and precedent transaction multiples</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Company Revenue</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetEBITDA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target EBITDA (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetEBIT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target EBIT (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medianTransactionEvRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median Transaction EV/Revenue (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medianTransactionEvEBITDA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median Transaction EV/EBITDA (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medianTransactionEvEBIT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median Transaction EV/EBIT (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Valuation
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
            <CardDescription>See precedent transaction valuation estimates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EV from Revenue</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedEvFromRevenue > 0 ? result.estimatedEvFromRevenue.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Revenue multiple</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EV from EBITDA</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedEvFromEBITDA > 0 ? result.estimatedEvFromEBITDA.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">EBITDA multiple</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EV from EBIT</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedEvFromEBIT > 0 ? result.estimatedEvFromEBIT.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">EBIT multiple</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Estimated EV</p>
                <p className="text-2xl font-semibold text-primary">{result.averageEstimatedEv > 0 ? result.averageEstimatedEv.toLocaleString() : 'N/A'}</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
            <strong>Estimated EV from Revenue</strong> = Target Revenue × Median Transaction EV/Revenue Multiple
          </p>
          <p>
            <strong>Estimated EV from EBITDA</strong> = Target EBITDA × Median Transaction EV/EBITDA Multiple
          </p>
          <p>
            <strong>Estimated EV from EBIT</strong> = Target EBIT × Median Transaction EV/EBIT Multiple
          </p>
          <p>
            <strong>Average Estimated EV</strong> = Average of Available Estimates
          </p>
          <p>Precedent transaction valuation estimates enterprise value by applying transaction multiples from past M&A deals to the target company's financial metrics. Transaction multiples reflect what buyers actually paid, including control premiums (typically 20-40%) and expected synergies, making them typically higher than trading multiples. This makes precedent transactions particularly useful for M&A and control transaction valuations.</p>
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
                <p className="text-sm text-muted-foreground">Valuation Range</p>
                <p className="text-xl font-semibold text-primary">
                  {result.estimatedEvFromRevenue > 0 || result.estimatedEvFromEBITDA > 0 || result.estimatedEvFromEBIT > 0
                    ? `${Math.min(...[result.estimatedEvFromRevenue, result.estimatedEvFromEBITDA, result.estimatedEvFromEBIT].filter(v => v > 0)).toLocaleString()} - ${Math.max(...[result.estimatedEvFromRevenue, result.estimatedEvFromEBITDA, result.estimatedEvFromEBIT].filter(v => v > 0)).toLocaleString()}`
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Min - Max estimate</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Multiples Used</p>
                <p className="text-xl font-semibold text-primary">
                  {[result.medianTransactionEvRevenue && result.medianTransactionEvRevenue > 0 ? 'EV/Rev' : null, result.medianTransactionEvEBITDA && result.medianTransactionEvEBITDA > 0 ? 'EV/EBITDA' : null, result.medianTransactionEvEBIT && result.medianTransactionEvEBIT > 0 ? 'EV/EBIT' : null].filter(Boolean).join(', ') || 'None'}
                </p>
                <p className="text-xs text-muted-foreground">Transaction multiples</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter target company data and precedent transaction multiples to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Precedent Transaction Valuation: M&A Transaction Multiples Analysis" />
    <meta itemProp="description" content="An in-depth guide on precedent transaction valuation using transaction multiples from past M&A deals to value companies, including control premiums and synergies." />
    <meta itemProp="keywords" content="precedent transaction valuation, transaction multiples, M&A valuation, control premium, transaction analysis, PTA" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/precedent-transaction-valuation-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Precedent Transaction Valuation: M&A Transaction Multiples Analysis</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at precedent transaction valuation using transaction multiples from past M&A deals to value companies, including control premiums and synergies.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Precedent Transactions</a></li>
        <li><a href="#multiples" className="hover:underline">Transaction Multiples</a></li>
        <li><a href="#selection" className="hover:underline">Selecting Precedent Transactions</a></li>
        <li><a href="#calculation" className="hover:underline">Valuation Calculation</a></li>
        <li><a href="#premium" className="hover:underline">Control Premiums and Synergies</a></li>
        <li><a href="#application" className="hover:underline">Practical Application</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Precedent Transactions</h2>
    <p>Precedent transaction analysis values a company based on prices paid for similar companies in past M&A transactions, reflecting what buyers actually paid including control premiums and synergies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Characteristics</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Based on actual transaction prices, not market prices</li>
        <li>Includes control premiums (typically 20-40%)</li>
        <li>Reflects expected synergies from transactions</li>
        <li>Useful for M&A and control transaction valuations</li>
        <li>Typically higher multiples than trading multiples</li>
    </ul>

<hr className="my-6" />

    <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Transaction Multiples</h2>
    <p>Transaction multiples are calculated from past M&A deals by dividing transaction enterprise value by target company financial metrics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Multiples</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>EV/Revenue:</b> Transaction EV divided by revenue</li>
        <li><b>EV/EBITDA:</b> Transaction EV divided by EBITDA</li>
        <li><b>EV/EBIT:</b> Transaction EV divided by EBIT</li>
    </ul>

<hr className="my-6" />

    <h2 id="selection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selecting Precedent Transactions</h2>
    <p>Select transactions similar to the target in industry, size, growth, profitability, and transaction characteristics.</p>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Calculation</h2>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Estimated EV = Target Metric × Median Transaction Multiple</strong></p>
    </div>

<hr className="my-6" />

    <h2 id="premium" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Control Premiums and Synergies</h2>
    <p>Transaction multiples include control premiums and expected synergies, making them typically 20-40% higher than trading multiples.</p>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
    <p>Use precedent transactions for M&A analysis, control transaction valuations, and understanding what buyers pay for similar companies.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Precedent transaction valuation provides M&A-based company valuation using transaction multiples from past deals. These multiples reflect what buyers actually paid, including control premiums and synergies, making them typically higher than trading multiples and particularly useful for M&A and control transaction valuations. By selecting appropriate precedent transactions and applying median multiples to target company metrics, analysts can estimate enterprise value for control transactions.</p>
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
          <p>This tool values a company using precedent transaction analysis by applying transaction multiples from past M&A deals, which include control premiums and synergies.</p>
          <p>Outputs include estimated enterprise values from each multiple, average estimated EV, valuation range, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
