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
  medianEvRevenue: z.number({ invalid_type_error: 'Enter median EV/Revenue' }).min(0).optional(),
  medianEvEBITDA: z.number({ invalid_type_error: 'Enter median EV/EBITDA' }).min(0).optional(),
  medianEvEBIT: z.number({ invalid_type_error: 'Enter median EV/EBIT' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  targetRevenue: number;
  targetEBITDA?: number;
  targetEBIT?: number;
  medianEvRevenue?: number;
  medianEvEBITDA?: number;
  medianEvEBIT?: number;
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
  'Enter median trading multiples from comparable companies (EV/Revenue, EV/EBITDA, EV/EBIT).',
  'Review estimated enterprise values and valuation range.',
];

const faqs = [
  {
    question: 'What is comparable company valuation?',
    answer:
      'Comparable company analysis (CCA) values a company by comparing it to similar publicly traded companies using trading multiples. This market-based approach uses multiples like EV/Revenue, EV/EBITDA, and EV/EBIT to estimate value based on how the market values similar companies.',
  },
  {
    question: 'What are trading multiples?',
    answer:
      'Trading multiples are ratios that compare enterprise value or market value to financial metrics. Common multiples include: EV/Revenue (enterprise value to revenue), EV/EBITDA (enterprise value to EBITDA), EV/EBIT (enterprise value to EBIT), P/E (price to earnings), and P/B (price to book). Multiples show how much the market pays per unit of financial performance.',
  },
  {
    question: 'How are comparable companies selected?',
    answer:
      'Comparable companies should be similar in: industry and business model, size (revenue, market cap), growth rates, profitability, geography, and capital structure. Select 5-15 comparable companies that closely match the target company across these dimensions to ensure relevant multiples.',
  },
  {
    question: 'How are median multiples calculated?',
    answer:
      'Median multiples are calculated by: collecting multiples for each comparable company, ordering them from lowest to highest, and taking the middle value (median). Median is preferred over average because it\'s less affected by outliers. Some analyses use average, 25th percentile, or 75th percentile multiples.',
  },
  {
    question: 'How is estimated enterprise value calculated?',
    answer:
      'Estimated EV = Target Financial Metric * Median Multiple. For example: Estimated EV = Target Revenue * Median EV/Revenue Multiple, or Estimated EV = Target EBITDA * Median EV/EBITDA Multiple. Multiple estimates are often averaged or a range is used.',
  },
  {
    question: 'Which multiple should I use?',
    answer:
      'Use multiple multiples for triangulation. EV/EBITDA is most common for companies with significant D&A. EV/Revenue is useful for early-stage or unprofitable companies. EV/EBIT removes D&A effects. Use the multiples most relevant to the industry and company stage, and average or use a range of estimates.',
  },
  {
    question: 'How do I convert enterprise value to equity value?',
    answer:
      'Convert EV to equity value using the EV bridge: Equity Value = Enterprise Value - Total Debt - Preferred Equity - Minority Interest + Cash + Investments. This gives the value attributable to common shareholders, which can be divided by shares outstanding for per-share valuation.',
  },
  {
    question: 'What are limitations of comparable company analysis?',
    answer:
      'Limitations include: finding truly comparable companies is difficult, market conditions affect multiples, accounting differences can distort comparisons, control premiums in M&A aren\'t reflected, company-specific factors may not be captured, and multiples may not reflect growth or risk differences adequately.',
  },
  {
    question: 'How do I account for growth differences?',
    answer:
      'Account for growth by: using growth-adjusted multiples, comparing companies with similar growth rates, adjusting multiples for growth premium/discount, or using PEG ratio (P/E divided by growth rate). Higher growth companies typically command higher multiples, so growth differences should be considered.',
  },
  {
    question: 'Should I use median or average multiples?',
    answer:
      'Median is generally preferred because it\'s less affected by outliers. Average can be skewed by extreme values. However, consider both: if median and average are similar, multiples are consistent; if they differ significantly, review for outliers. Some analyses use a range (25th to 75th percentile) to capture valuation uncertainty.',
  },
];

const relatedCalculators = [
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge to equity value.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction valuation.',
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

const baseUrl = 'https://mycalculating.com/category/finance/comparable-company-trading-multiples-valuation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Comparable Company (Trading Multiples) Valuation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Comparable Company (Trading Multiples) Valuation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Value a company using comparable company analysis by applying trading multiples (EV/Revenue, EV/EBITDA, EV/EBIT) from similar companies.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const targetRevenue = values.targetRevenue;
  const targetEBITDA = values.targetEBITDA;
  const targetEBIT = values.targetEBIT;
  const medianEvRevenue = values.medianEvRevenue;
  const medianEvEBITDA = values.medianEvEBITDA;
  const medianEvEBIT = values.medianEvEBIT;
  
  // Calculate estimated EV from each multiple
  let estimatedEvFromRevenue = 0;
  let estimatedEvFromEBITDA = 0;
  let estimatedEvFromEBIT = 0;
  
  if (medianEvRevenue && medianEvRevenue > 0) {
    estimatedEvFromRevenue = targetRevenue * medianEvRevenue;
  }
  if (medianEvEBITDA && targetEBITDA && medianEvEBITDA > 0 && targetEBITDA > 0) {
    estimatedEvFromEBITDA = targetEBITDA * medianEvEBITDA;
  }
  if (medianEvEBIT && targetEBIT && medianEvEBIT > 0 && targetEBIT > 0) {
    estimatedEvFromEBIT = targetEBIT * medianEvEBIT;
  }
  
  // Average of available estimates
  const estimates: number[] = [];
  if (estimatedEvFromRevenue > 0) estimates.push(estimatedEvFromRevenue);
  if (estimatedEvFromEBITDA > 0) estimates.push(estimatedEvFromEBITDA);
  if (estimatedEvFromEBIT > 0) estimates.push(estimatedEvFromEBIT);
  
  const averageEstimatedEv = estimates.length > 0 ? estimates.reduce((sum, val) => sum + val, 0) / estimates.length : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Estimated enterprise value: ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'Unable to calculate - enter at least one multiple'}. `;
  if (estimates.length > 1) {
    const minEst = Math.min(...estimates);
    const maxEst = Math.max(...estimates);
    interpretation += `Valuation range: ${minEst.toLocaleString()} to ${maxEst.toLocaleString()} based on ${estimates.length} multiple${estimates.length > 1 ? 's' : ''}.`;
    const rangePercent = averageEstimatedEv > 0 ? ((maxEst - minEst) / averageEstimatedEv) * 100 : 0;
    if (rangePercent > 50) {
      status = 'moderate';
      interpretation += ' Wide range indicates valuation uncertainty - review comparability of companies and multiples.';
    }
  } else if (averageEstimatedEv > 0) {
    interpretation += `Based on ${estimates.length} multiple${estimates.length > 1 ? 's' : ''}.`;
    status = 'good';
  } else {
    status = 'low';
    interpretation += 'Enter at least one multiple and corresponding financial metric to calculate valuation.';
  }

  const recommendations: string[] = [];
  
  // Build first recommendation
  let firstRec = `Comparable company valuation: Estimated enterprise value of ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'N/A'} based on trading multiples.`;
  if (estimates.length > 1) {
    firstRec += ` Multiple estimates range from ${Math.min(...estimates).toLocaleString()} to ${Math.max(...estimates).toLocaleString()}, providing valuation triangulation.`;
  } else if (estimates.length === 1) {
    firstRec += ' Single multiple estimate provides baseline, but consider using multiple multiples for better triangulation.';
  } else {
    firstRec += ' Enter multiples to calculate valuation.';
  }
  recommendations.push(firstRec);
  
  // Build second recommendation
  let secondRec = 'Multiple selection:';
  if (estimatedEvFromRevenue > 0) {
    secondRec += ' EV/Revenue multiple used.';
  }
  if (estimatedEvFromEBITDA > 0) {
    secondRec += ' EV/EBITDA multiple used (most common for mature companies).';
  }
  if (estimatedEvFromEBIT > 0) {
    secondRec += ' EV/EBIT multiple used.';
  }
  secondRec += ' Use multiples most relevant to the industry and company profitability stage.';
  recommendations.push(secondRec);
  
  recommendations.push('Comparability considerations: Ensure comparable companies are similar in industry, size, growth, profitability, and geography. Review for outliers in multiples and adjust if necessary. Consider growth, profitability, and risk differences between target and comparables.');
  recommendations.push('Convert to equity value: Use EV bridge to convert enterprise value to equity value: Equity Value = EV - Debt - Preferred Equity - Minority Interest + Cash + Investments. Divide equity value by shares outstanding for per-share valuation.');
  
  if (estimates.length === 0) {
    recommendations.push('CRITICAL: No multiples entered - Enter at least one trading multiple (EV/Revenue, EV/EBITDA, or EV/EBIT) along with the corresponding financial metric to calculate valuation. Using multiple multiples provides better triangulation.');
  }
  if (estimates.length > 1) {
    const rangePercent = averageEstimatedEv > 0 ? ((Math.max(...estimates) - Math.min(...estimates)) / averageEstimatedEv) * 100 : 0;
    if (rangePercent > 50) {
      recommendations.push(`Wide valuation range (${rangePercent.toFixed(0)}% spread): Review comparability of companies, check for outliers in multiples, consider using median instead of individual company multiples, and assess if target company has unique characteristics not captured by comparables.`);
    }
  }

  const plan = [
    { label: 'This Week', detail: `Calculate comparable company valuation: Estimated EV ${averageEstimatedEv > 0 ? averageEstimatedEv.toLocaleString() : 'N/A'} based on ${estimates.length} multiple(s). Document comparable companies, multiples used, and assumptions.` },
    { label: 'This Month', detail: 'Validate valuation by: reviewing comparability of companies, checking for outliers, comparing to other valuation methods (DCF, precedent transactions), and converting EV to equity value using EV bridge. Consider adjustments for growth, profitability, or risk differences.' },
    { label: 'Ongoing', detail: 'Update valuation regularly as: comparable company multiples change, target company financials update, market conditions evolve, and new comparable companies become available. Compare valuation to market prices and other valuation methods for triangulation.' },
  ];

  return { targetRevenue, targetEBITDA, targetEBIT, medianEvRevenue, medianEvEBITDA, medianEvEBIT, estimatedEvFromRevenue, estimatedEvFromEBITDA, estimatedEvFromEBIT, averageEstimatedEv, interpretation, status, recommendations, plan };
};

export default function ComparableCompanyTradingMultiplesValuationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetRevenue: undefined,
      targetEBITDA: undefined,
      targetEBIT: undefined,
      medianEvRevenue: undefined,
      medianEvEBITDA: undefined,
      medianEvEBIT: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="comparable-company-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Comparable Company (Trading Multiples) Valuation Calculator
          </CardTitle>
          <CardDescription>Value a company using comparable company analysis by applying trading multiples (EV/Revenue, EV/EBITDA, EV/EBIT) from similar companies.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input target company data and comparable multiples</CardTitle>
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
                  name="medianEvRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median EV/Revenue Multiple (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medianEvEBITDA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median EV/EBITDA Multiple (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medianEvEBIT"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Median EV/EBIT Multiple (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See comparable company valuation estimates.</CardDescription>
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
            <strong>Estimated EV from Revenue</strong> = Target Revenue * Median EV/Revenue Multiple
          </p>
          <p>
            <strong>Estimated EV from EBITDA</strong> = Target EBITDA * Median EV/EBITDA Multiple
          </p>
          <p>
            <strong>Estimated EV from EBIT</strong> = Target EBIT * Median EV/EBIT Multiple
          </p>
          <p>
            <strong>Average Estimated EV</strong> = Average of Available Estimates
          </p>
          <p>Comparable company valuation estimates enterprise value by applying trading multiples from similar companies to the target company's financial metrics. Using multiple multiples provides triangulation and helps assess valuation range. Median multiples are preferred over averages as they're less affected by outliers. This market-based approach reflects how the market values similar companies.</p>
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
                  {[result.medianEvRevenue && result.medianEvRevenue > 0 ? 'EV/Rev' : null, result.medianEvEBITDA && result.medianEvEBITDA > 0 ? 'EV/EBITDA' : null, result.medianEvEBIT && result.medianEvEBIT > 0 ? 'EV/EBIT' : null].filter(Boolean).join(', ') || 'None'}
                </p>
                <p className="text-xs text-muted-foreground">Active multiples</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter target company data and comparable multiples to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Comparable Company Valuation: Trading Multiples Analysis" />
        <meta itemProp="description" content="An in-depth guide on comparable company valuation using trading multiples, selecting comparables, calculating multiples, and applying them to value companies." />
        <meta itemProp="keywords" content="comparable company valuation, trading multiples, EV multiples, EV/EBITDA, EV/Revenue, company valuation, CCA" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/comparable-company-trading-multiples-valuation-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Comparable Company Valuation: Trading Multiples Analysis</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at comparable company valuation using trading multiples to estimate company value based on how the market values similar companies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Comparable Company Analysis</a></li>
          <li><a href="#multiples" className="hover:underline">Trading Multiples</a></li>
          <li><a href="#selection" className="hover:underline">Selecting Comparables</a></li>
          <li><a href="#calculation" className="hover:underline">Valuation Calculation</a></li>
          <li><a href="#application" className="hover:underline">Practical Application</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations and Considerations</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Comparable Company Analysis</h2>
        <p>Comparable company analysis (CCA) values a company by comparing it to similar publicly traded companies using trading multiples, reflecting market-based valuation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Concept</h3>
        <p>The underlying assumption is that similar companies should trade at similar multiples. By identifying comparable companies and their trading multiples, we can estimate the target company's value.</p>

        <hr className="my-6" />

        <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Trading Multiples</h2>
        <p>Common EV-based multiples used in comparable company analysis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">EV/Revenue</h3>
        <p>Useful for: early-stage companies, unprofitable companies, revenue-focused valuations. Formula: EV / Revenue</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">EV/EBITDA</h3>
        <p>Most common multiple, useful for: mature companies, capital-intensive industries, companies with significant D&A. Formula: EV / EBITDA</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">EV/EBIT</h3>
        <p>Useful when: removing D&A effects, comparing companies with different depreciation policies. Formula: EV / EBIT</p>

        <hr className="my-6" />

        <h2 id="selection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selecting Comparables</h2>
        <p>Selecting appropriate comparable companies is critical for accurate valuation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Criteria</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Same or similar industry</li>
          <li>Similar business model</li>
          <li>Comparable size (revenue, market cap)</li>
          <li>Similar growth rates</li>
          <li>Similar profitability</li>
          <li>Similar geography</li>
        </ul>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Calculation</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Estimated EV = Target Metric * Median Multiple</strong></p>
        </div>
        <p>Use multiple multiples for triangulation and range assessment.</p>

        <hr className="my-6" />

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
        <p>Apply comparable company valuation in M&A, investment analysis, and corporate finance.</p>

        <hr className="my-6" />

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Considerations</h2>
        <p>Be aware of limitations: comparability challenges, market conditions, accounting differences, company-specific factors, and growth/risk adjustments.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Comparable company valuation using trading multiples provides market-based company valuation by applying multiples from similar companies. By selecting appropriate comparables, calculating median multiples, and applying them to target company metrics, analysts can estimate enterprise value. Using multiple multiples provides triangulation and range assessment, improving valuation accuracy and confidence.</p>
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
          <p>This tool values a company using comparable company analysis by applying trading multiples (EV/Revenue, EV/EBITDA, EV/EBIT) from similar companies.</p>
          <p>Outputs include estimated enterprise values from each multiple, average estimated EV, valuation range, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
