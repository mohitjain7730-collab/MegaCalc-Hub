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
  segment1Value: z.number({ invalid_type_error: 'Enter segment 1 value' }).min(0).optional(),
  segment2Value: z.number({ invalid_type_error: 'Enter segment 2 value' }).min(0).optional(),
  segment3Value: z.number({ invalid_type_error: 'Enter segment 3 value' }).min(0).optional(),
  segment4Value: z.number({ invalid_type_error: 'Enter segment 4 value' }).min(0).optional(),
  totalDebt: z.number({ invalid_type_error: 'Enter total debt' }).min(0),
  cashAndEquivalents: z.number({ invalid_type_error: 'Enter cash and equivalents' }).min(0),
  nonOperatingAssets: z.number({ invalid_type_error: 'Enter non-operating assets' }).min(0).optional(),
  nonOperatingLiabilities: z.number({ invalid_type_error: 'Enter non-operating liabilities' }).min(0).optional(),
  conglomerateDiscount: z.number({ invalid_type_error: 'Enter conglomerate discount' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  segment1Value?: number;
  segment2Value?: number;
  segment3Value?: number;
  segment4Value?: number;
  totalDebt: number;
  cashAndEquivalents: number;
  nonOperatingAssets?: number;
  nonOperatingLiabilities?: number;
  conglomerateDiscount?: number;
  totalSegmentValue: number;
  netDebt: number;
  enterpriseValue: number;
  equityValue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter values for each business segment (optional, enter at least one).',
  'Enter total debt and cash & cash equivalents.',
  'Optionally enter non-operating assets and liabilities.',
  'Optionally enter conglomerate discount percentage.',
  'Review SOTP valuation calculation.',
];

const faqs = [
  {
    question: 'What is Sum-of-the-Parts (SOTP) valuation?',
    answer:
      'Sum-of-the-Parts (SOTP) valuation values a company by valuing each business segment separately and summing those values. This approach is particularly useful for conglomerates or diversified companies operating in multiple industries, as it allows segment-specific valuation methods and multiples.',
  },
  {
    question: 'How is SOTP valuation calculated?',
    answer:
      'SOTP Enterprise Value = Sum of Segment Values - Net Debt + Non-Operating Assets - Non-Operating Liabilities. Net Debt = Total Debt - Cash and Cash Equivalents. Equity Value = Enterprise Value after applying any conglomerate discount. Each segment is valued using appropriate methods (DCF, multiples, etc.).',
  },
  {
    question: 'How do I value each business segment?',
    answer:
      'Value each segment using methods appropriate to that segment: DCF for segments with predictable cash flows, comparable company multiples for segments with good comparables, precedent transactions for segments being sold, asset-based valuation for asset-heavy segments, or sum of segment parts for segments with subsidiaries.',
  },
  {
    question: 'What is a conglomerate discount?',
    answer:
      'Conglomerate discount is a reduction applied to the sum of segment values to account for the complexities and potential inefficiencies of managing diverse business units. It typically ranges from 5-20% and reflects factors like management complexity, lack of focus, and market preference for pure-play companies.',
  },
  {
    question: 'How do I handle net debt in SOTP?',
    answer:
      'Net debt (Total Debt - Cash) is subtracted from the sum of segment values because debt is a company-wide obligation, not allocated to specific segments. Cash is added back separately (or net debt is subtracted) to arrive at enterprise value. Enterprise value represents the value of operations independent of capital structure.',
  },
  {
    question: 'What are non-operating assets and liabilities?',
    answer:
      'Non-operating assets are assets not essential to operations (e.g., investments, excess cash beyond working capital needs). Non-operating liabilities are obligations not from core operations (e.g., pension liabilities, legal reserves). These are adjusted separately because they don\'t relate to segment operations.',
  },
  {
    question: 'When should I use SOTP valuation?',
    answer:
      'Use SOTP when: the company operates in diverse industries with different valuation characteristics, segments have different growth or profitability profiles, you want to understand segment value contribution, the company may be broken up or segments sold separately, or comparable company analysis is difficult for the whole company.',
  },
  {
    question: 'How do I convert SOTP enterprise value to equity value?',
    answer:
      'Equity Value = SOTP Enterprise Value - Total Debt - Preferred Equity - Minority Interest + Cash + Investments. Alternatively: Equity Value = SOTP Enterprise Value - Net Debt - Preferred Equity - Minority Interest + Investments. This gives the value attributable to common shareholders.',
  },
  {
    question: 'Should I apply conglomerate discount?',
    answer:
      'Conglomerate discount is optional and depends on: whether the company is a true conglomerate, market evidence of discount for similar companies, complexity of managing diverse segments, and analyst judgment. Not all diversified companies warrant a discount - some benefit from diversification. Use 5-20% range if appropriate.',
  },
  {
    question: 'How do I validate SOTP valuation?',
    answer:
      'Validate SOTP by: comparing to other valuation methods (DCF, comparable companies), checking if sum exceeds market cap (potential breakup value), reviewing segment valuation methods and assumptions, assessing reasonableness of conglomerate discount, and comparing to precedent transactions of similar diversified companies.',
  },
];

const relatedCalculators = [
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge to equity value.',
  },
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate segment valuations.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate DCF for segments.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/sum-of-the-parts-sotp-valuation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Sum-of-the-Parts (SOTP) Valuation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sum-of-the-Parts (SOTP) Valuation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Value a company using Sum-of-the-Parts (SOTP) method by valuing each business segment separately and summing those values.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const segment1Value = values.segment1Value ?? 0;
  const segment2Value = values.segment2Value ?? 0;
  const segment3Value = values.segment3Value ?? 0;
  const segment4Value = values.segment4Value ?? 0;
  const totalDebt = values.totalDebt;
  const cashAndEquivalents = values.cashAndEquivalents;
  const nonOperatingAssets = values.nonOperatingAssets ?? 0;
  const nonOperatingLiabilities = values.nonOperatingLiabilities ?? 0;
  const conglomerateDiscount = values.conglomerateDiscount;
  
  // Sum of segment values
  const totalSegmentValue = segment1Value + segment2Value + segment3Value + segment4Value;
  
  // Net Debt = Total Debt - Cash and Cash Equivalents
  const netDebt = totalDebt - cashAndEquivalents;
  
  // Enterprise Value = Sum of Segments - Net Debt + Non-Operating Assets - Non-Operating Liabilities
  let enterpriseValue = totalSegmentValue - netDebt + nonOperatingAssets - nonOperatingLiabilities;
  
  // Apply conglomerate discount if specified
  if (conglomerateDiscount && conglomerateDiscount > 0) {
    enterpriseValue = enterpriseValue * (1 - conglomerateDiscount / 100);
  }
  
  // Equity Value = Enterprise Value (after adjustments)
  const equityValue = enterpriseValue;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (totalSegmentValue === 0) {
    status = 'low';
    interpretation = 'No segment values entered - enter at least one segment value.';
  } else {
    interpretation = `SOTP Enterprise Value: ${enterpriseValue.toLocaleString()}, Equity Value: ${equityValue.toLocaleString()}.`;
    
    if (conglomerateDiscount && conglomerateDiscount > 0) {
      interpretation += ` Conglomerate discount of ${conglomerateDiscount}% applied.`;
    }
    
    if (enterpriseValue < 0) {
      status = 'low';
      interpretation += ' Negative enterprise value - review segment values and debt assumptions.';
    } else {
      status = 'optimal';
    }
  }

  const recommendations: string[] = [];
  
  if (totalSegmentValue === 0) {
    recommendations.push('CRITICAL: No segment values entered - Enter at least one business segment value to calculate SOTP valuation. Each segment should be valued using appropriate methods (DCF, multiples, etc.).');
  } else {
    const numSegments = [segment1Value, segment2Value, segment3Value, segment4Value].filter(v => v > 0).length;
    recommendations.push(`SOTP valuation: Enterprise value of ${enterpriseValue.toLocaleString()} calculated from ${numSegments} business segment(s) totaling ${totalSegmentValue.toLocaleString()}. Net debt: ${netDebt.toLocaleString()} (debt ${totalDebt.toLocaleString()} minus cash ${cashAndEquivalents.toLocaleString()}).`);
    
    if (conglomerateDiscount && conglomerateDiscount > 0) {
      recommendations.push(`Conglomerate discount: ${conglomerateDiscount}% discount applied to account for complexities of managing diverse business units. This is typical for true conglomerates and reflects market preference for pure-play companies. Discounts typically range from 5-20%.`);
    }
    
    if (nonOperatingAssets > 0 || nonOperatingLiabilities > 0) {
      recommendations.push(`Non-operating adjustments: Non-operating assets ${nonOperatingAssets.toLocaleString()} and liabilities ${nonOperatingLiabilities.toLocaleString()} adjusted. These represent items not essential to segment operations and are handled separately in SOTP valuation.`);
    }
    
    recommendations.push('Segment valuation: Each segment should be valued using methods appropriate to that segment (DCF for predictable cash flows, multiples for segments with good comparables). Ensure segment valuations are based on appropriate valuation methods and assumptions.');
    
    if (enterpriseValue < 0) {
      recommendations.push('WARNING: Negative enterprise value indicates segment values are insufficient to cover net debt and adjustments. Review segment valuation assumptions, verify debt and cash amounts, and ensure all segments are properly valued.');
    }
  }
  
  recommendations.push('Validation: Compare SOTP valuation to other methods (DCF, comparable companies). Check if sum exceeds market cap (potential breakup value). Review segment valuation methods. Assess reasonableness of conglomerate discount if applied.');

  const plan = [
    { label: 'This Week', detail: `Calculate SOTP valuation: Enterprise value ${enterpriseValue.toLocaleString()}, Equity value ${equityValue.toLocaleString()}${conglomerateDiscount && conglomerateDiscount > 0 ? ` (with ${conglomerateDiscount}% conglomerate discount)` : ''}. Document segment valuations and assumptions.` },
    { label: 'This Month', detail: 'Validate SOTP by comparing to other valuation methods. Review segment valuation methods and assumptions. Assess reasonableness of conglomerate discount if applied. Check if SOTP value exceeds market cap (indicates potential breakup value).' },
    { label: 'Ongoing', detail: 'Update segment valuations as business conditions change. Monitor for changes in segment performance that may affect individual segment values. Reassess conglomerate discount if company structure changes. Compare to market cap to identify potential value creation opportunities.' },
  ];

  return { segment1Value: segment1Value > 0 ? segment1Value : undefined, segment2Value: segment2Value > 0 ? segment2Value : undefined, segment3Value: segment3Value > 0 ? segment3Value : undefined, segment4Value: segment4Value > 0 ? segment4Value : undefined, totalDebt, cashAndEquivalents, nonOperatingAssets: nonOperatingAssets > 0 ? nonOperatingAssets : undefined, nonOperatingLiabilities: nonOperatingLiabilities > 0 ? nonOperatingLiabilities : undefined, conglomerateDiscount, totalSegmentValue, netDebt, enterpriseValue, equityValue, interpretation, status, recommendations, plan };
};

export default function SumOfThePartsSotpValuationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segment1Value: undefined,
      segment2Value: undefined,
      segment3Value: undefined,
      segment4Value: undefined,
      totalDebt: undefined,
      cashAndEquivalents: undefined,
      nonOperatingAssets: undefined,
      nonOperatingLiabilities: undefined,
      conglomerateDiscount: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sotp-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Sum-of-the-Parts (SOTP) Valuation Calculator
          </CardTitle>
          <CardDescription>Value a company using Sum-of-the-Parts (SOTP) method by valuing each business segment separately and summing those values.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your SOTP valuation components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="segment1Value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment 1 Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="segment2Value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment 2 Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 300000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="segment3Value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment 3 Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="segment4Value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment 4 Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Debt</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cashAndEquivalents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash & Cash Equivalents</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nonOperatingAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Non-Operating Assets (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nonOperatingLiabilities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Non-Operating Liabilities (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conglomerateDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conglomerate Discount (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Typically 5-20%</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate SOTP Valuation
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
            <CardDescription>See SOTP valuation calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Segment Value</p>
                <p className="text-2xl font-semibold text-primary">{result.totalSegmentValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Sum of segments</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Debt</p>
                <p className="text-2xl font-semibold text-primary">{result.netDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Debt - Cash</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Enterprise Value</p>
                <p className="text-2xl font-semibold text-primary">{result.enterpriseValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SOTP EV</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity Value</p>
                <p className="text-2xl font-semibold text-primary">{result.equityValue.toLocaleString()}</p>
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
            <strong>Total Segment Value</strong> = Sum of All Segment Values
          </p>
          <p>
            <strong>Net Debt</strong> = Total Debt - Cash and Cash Equivalents
          </p>
          <p>
            <strong>SOTP Enterprise Value</strong> = Total Segment Value - Net Debt + Non-Operating Assets - Non-Operating Liabilities
          </p>
          <p>
            <strong>After Conglomerate Discount</strong> = SOTP Enterprise Value * (1 - Discount %)
          </p>
          <p>
            <strong>Equity Value</strong> = SOTP Enterprise Value (after adjustments)
          </p>
          <p>Sum-of-the-Parts (SOTP) valuation values a company by valuing each business segment separately using appropriate methods (DCF, multiples, etc.) and summing those values. Net debt is subtracted and non-operating items are adjusted to arrive at enterprise value. A conglomerate discount may be applied to reflect the complexities of managing diverse business units.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Number of Segments</p>
                <p className="text-xl font-semibold text-primary">
                  {[result.segment1Value, result.segment2Value, result.segment3Value, result.segment4Value].filter(v => v && v > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Active segments</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-xl font-semibold text-primary">{result.totalDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Interest-bearing debt</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cash</p>
                <p className="text-xl font-semibold text-primary">{result.cashAndEquivalents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Cash & equivalents</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Calculation status</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your SOTP valuation components to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Sum-of-the-Parts (SOTP) Valuation: Segment-Based Company Valuation" />
        <meta itemProp="description" content="An in-depth guide on Sum-of-the-Parts (SOTP) valuation, valuing each business segment separately and summing those values to estimate total company value." />
        <meta itemProp="keywords" content="SOTP valuation, sum of the parts, segment valuation, conglomerate valuation, business segment valuation" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/sum-of-the-parts-sotp-valuation-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Sum-of-the-Parts (SOTP) Valuation: Segment-Based Company Valuation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at Sum-of-the-Parts (SOTP) valuation, valuing each business segment separately and summing those values to estimate total company value.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding SOTP Valuation</a></li>
          <li><a href="#segments" className="hover:underline">Segment Valuation</a></li>
          <li><a href="#calculation" className="hover:underline">SOTP Calculation</a></li>
          <li><a href="#discount" className="hover:underline">Conglomerate Discount</a></li>
          <li><a href="#application" className="hover:underline">Practical Application</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding SOTP Valuation</h2>
        <p>SOTP valuation values a company by valuing each business segment separately using appropriate methods and summing those values.</p>

        <hr className="my-6" />

        <h2 id="segments" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Segment Valuation</h2>
        <p>Value each segment using methods appropriate to that segment: DCF, multiples, asset-based, or other methods.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SOTP Calculation</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>SOTP EV = Sum(Segments) - Net Debt + Non-Operating Assets - Non-Operating Liabilities</strong></p>
        </div>

        <hr className="my-6" />

        <h2 id="discount" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conglomerate Discount</h2>
        <p>Conglomerate discount (typically 5-20%) may be applied to account for complexities of managing diverse business units.</p>

        <hr className="my-6" />

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
        <p>Use SOTP for diversified companies, conglomerates, or when segments have different valuation characteristics.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Sum-of-the-Parts (SOTP) valuation provides a segment-based approach to company valuation, allowing analysts to value each business segment separately using appropriate methods and sum those values. This approach is particularly useful for diversified companies or conglomerates where different segments have different growth, profitability, or valuation characteristics. Proper segment valuation and appropriate application of conglomerate discounts are essential for accurate SOTP valuations.</p>
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
          <p>This tool values a company using Sum-of-the-Parts (SOTP) method by valuing each business segment separately and summing those values.</p>
          <p>Outputs include enterprise value, equity value, segment totals, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



