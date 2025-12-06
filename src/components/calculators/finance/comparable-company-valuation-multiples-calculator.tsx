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
  revenue: z.number({ invalid_type_error: 'Enter revenue' }).min(0).optional(),
  ebitda: z.number({ invalid_type_error: 'Enter EBITDA' }).min(0).optional(),
  netIncome: z.number({ invalid_type_error: 'Enter net income' }).min(0).optional(),
  evRevenueMultiple: z.number({ invalid_type_error: 'Enter EV/Revenue multiple' }).min(0).optional(),
  evEbitdaMultiple: z.number({ invalid_type_error: 'Enter EV/EBITDA multiple' }).min(0).optional(),
  peMultiple: z.number({ invalid_type_error: 'Enter P/E multiple' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  revenue: number;
  ebitda: number;
  netIncome: number;
  evRevenueMultiple: number;
  evEbitdaMultiple: number;
  peMultiple: number;
  evFromRevenue: number;
  evFromEbitda: number;
  equityValueFromPE: number;
  averageValuation: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter company financial metrics (Revenue, EBITDA, Net Income).',
  'Enter comparable company multiples (EV/Revenue, EV/EBITDA, P/E).',
  'Review calculated enterprise value and equity value estimates.',
  'Compare valuation methods and assess reasonableness of multiples.',
];

const faqs = [
  {
    question: 'What is comparable company valuation?',
    answer:
      'Comparable company valuation (comps) estimates company value by applying valuation multiples from similar public companies. It uses ratios like EV/Revenue, EV/EBITDA, and P/E to derive enterprise value or equity value.',
  },
  {
    question: 'What are valuation multiples?',
    answer:
      'Valuation multiples are ratios that compare company value to financial metrics. Common multiples include EV/Revenue (enterprise value to revenue), EV/EBITDA (enterprise value to earnings before interest, taxes, depreciation, amortization), and P/E (price to earnings).',
  },
  {
    question: 'How do I select comparable companies?',
    answer:
      'Select companies with similar business models, industry, size, growth rates, and profitability. Ideally, use 5-10 comparable companies and calculate median or mean multiples to reduce the impact of outliers.',
  },
  {
    question: 'What is the difference between EV and equity value?',
    answer:
      'Enterprise Value (EV) represents total company value including debt and excluding cash. Equity Value is the value of shareholders\' equity. EV = Equity Value + Debt - Cash. Use EV multiples for capital structure-agnostic valuation.',
  },
  {
    question: 'When should I use EV/Revenue vs EV/EBITDA?',
    answer:
      'Use EV/Revenue for companies with negative or low profitability, early-stage companies, or when EBITDA is not meaningful. Use EV/EBITDA for profitable companies as it accounts for operating efficiency and is less affected by capital structure.',
  },
  {
    question: 'How do I interpret the valuation range?',
    answer:
      'A wide range suggests high uncertainty or that comparables are not truly similar. Narrow ranges indicate more reliable valuation. Consider the median or average, but also review the distribution and exclude outliers if justified.',
  },
  {
    question: 'What are limitations of comparable company valuation?',
    answer:
      'Limitations include difficulty finding true comparables, market inefficiencies affecting public company prices, differences in growth rates and profitability, and the need to adjust for company-specific factors like size, geography, and business model differences.',
  },
  {
    question: 'How do I adjust for company size differences?',
    answer:
      'Larger companies often trade at premium multiples due to liquidity, stability, and scale advantages. Consider size-based adjustments or use size-matched comparables. Private company discounts may also apply for smaller or less liquid companies.',
  },
  {
    question: 'Should I use median or mean multiples?',
    answer:
      'Median multiples are less affected by outliers and often preferred. Mean multiples can be skewed by extreme values. Consider both and understand why outliers exist—they may represent valid comparables or should be excluded.',
  },
  {
    question: 'How does this compare to DCF valuation?',
    answer:
      'Comparable company valuation is market-based and reflects current market sentiment, while DCF is intrinsic value based on fundamentals. Use both methods and triangulate—they should yield similar results if assumptions are consistent. Comps are faster but less detailed.',
  },
];

const relatedCalculators = [
  {
    name: 'DCF Valuation Calculator',
    slug: 'dcf-calculator',
    description: 'Value companies using discounted cash flow method.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value from equity value, debt, and cash.',
  },
  {
    name: 'EV / EBITDA Multiple Calculator',
    slug: 'ev-ebit-ebitda-multiple-calculator',
    description: 'Calculate EV/EBITDA and EV/EBIT multiples.',
  },
  {
    name: 'Price-to-Earnings Ratio Calculator',
    slug: 'price-to-earnings-ratio-calculator',
    description: 'Calculate P/E ratio for equity valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/comparable-company-valuation-multiples-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Comparable Company Valuation (Multiples) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Comparable Company Valuation (Multiples) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate company value using comparable company valuation multiples including EV/Revenue, EV/EBITDA, and P/E ratios.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const revenue = values.revenue || 0;
  const ebitda = values.ebitda || 0;
  const netIncome = values.netIncome || 0;
  const evRevenueMultiple = values.evRevenueMultiple || 0;
  const evEbitdaMultiple = values.evEbitdaMultiple || 0;
  const peMultiple = values.peMultiple || 0;

  // Calculate valuations
  const evFromRevenue = revenue > 0 && evRevenueMultiple > 0 ? revenue * evRevenueMultiple : 0;
  const evFromEbitda = ebitda > 0 && evEbitdaMultiple > 0 ? ebitda * evEbitdaMultiple : 0;
  const equityValueFromPE = netIncome > 0 && peMultiple > 0 ? netIncome * peMultiple : 0;

  // Calculate average (only include valid valuations)
  const validValuations = [evFromRevenue, evFromEbitda, equityValueFromPE].filter(v => v > 0);
  const averageValuation = validValuations.length > 0 
    ? validValuations.reduce((sum, val) => sum + val, 0) / validValuations.length 
    : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The comparable company valuation provides a reasonable estimate based on market multiples. Multiple valuation methods should be used to triangulate value.';

  const valuationRange = validValuations.length > 1 
    ? Math.max(...validValuations) - Math.min(...validValuations)
    : 0;
  const rangePercent = averageValuation > 0 ? (valuationRange / averageValuation) * 100 : 0;

  if (validValuations.length === 0) {
    status = 'low';
    interpretation = 'Insufficient data to calculate valuation. Enter at least one financial metric and corresponding multiple to estimate company value.';
  } else if (rangePercent > 50 && validValuations.length > 1) {
    status = 'moderate';
    interpretation = 'Wide valuation range suggests high uncertainty or that comparables may not be truly similar. Review multiple selection and consider company-specific adjustments.';
  } else if (rangePercent <= 30 || validValuations.length === 1) {
    status = 'optimal';
    interpretation = 'Valuation estimates are reasonably consistent, suggesting reliable comparable company selection. Consider triangulating with other valuation methods.';
  } else {
    status = 'good';
    interpretation = 'Valuation range is moderate. Multiple methods provide useful cross-validation. Review assumptions and comparables for accuracy.';
  }

  const recommendations = [
    'Verify comparable company selection: ensure companies have similar business models, industry, size, growth rates, and profitability to your target company.',
    'Use multiple valuation methods: triangulate between EV/Revenue, EV/EBITDA, and P/E multiples to cross-validate estimates and identify outliers.',
    'Consider median vs mean: median multiples are less affected by outliers. Review the distribution of comparable multiples and exclude outliers if justified.',
  ];
  if (rangePercent > 50) {
    recommendations.push('Wide valuation range: investigate why multiples differ significantly. Consider size adjustments, growth rate differences, or excluding less comparable companies.');
  }
  if (validValuations.length < 2) {
    recommendations.push('Use multiple methods: enter additional financial metrics and multiples to improve valuation reliability through cross-validation.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate company valuation using comparable multiples. Review ${validValuations.length} valuation method(s) and assess reasonableness of estimates.` },
    { label: 'This Month', detail: 'Refine comparable company selection by reviewing business models, growth rates, and profitability. Update multiples based on current market conditions and recent transactions.' },
    { label: 'Ongoing', detail: 'Monitor comparable company multiples over time. Update valuations as market conditions change and new comparable data becomes available.' },
  ];

  return {
    revenue,
    ebitda,
    netIncome,
    evRevenueMultiple,
    evEbitdaMultiple,
    peMultiple,
    evFromRevenue,
    evFromEbitda,
    equityValueFromPE,
    averageValuation,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function ComparableCompanyValuationMultiplesCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: undefined,
      ebitda: undefined,
      netIncome: undefined,
      evRevenueMultiple: undefined,
      evEbitdaMultiple: undefined,
      peMultiple: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="comparable-company-valuation-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Comparable Company Valuation (Multiples) Calculator
          </CardTitle>
          <CardDescription>Estimate company value using comparable company valuation multiples including EV/Revenue, EV/EBITDA, and P/E ratios.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your financial data and multiples</CardTitle>
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
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evRevenueMultiple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EV/Revenue Multiple - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ebitda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EBITDA ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evEbitdaMultiple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EV/EBITDA Multiple - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Income ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="peMultiple"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P/E Multiple - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
            <CardDescription>See enterprise value, equity value, and valuation estimates from multiple methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EV from Revenue</p>
                <p className="text-2xl font-semibold text-primary">{result.evFromRevenue > 0 ? result.evFromRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EV from EBITDA</p>
                <p className="text-2xl font-semibold text-primary">{result.evFromEbitda > 0 ? result.evFromEbitda.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity from P/E</p>
                <p className="text-2xl font-semibold text-primary">{result.equityValueFromPE > 0 ? result.equityValueFromPE.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Valuation</p>
                <p className="text-2xl font-semibold text-primary">{result.averageValuation > 0 ? result.averageValuation.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'N/A'}</p>
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
            <strong>Enterprise Value from Revenue</strong> = Revenue × EV/Revenue Multiple. Used for companies with low or negative profitability.
          </p>
          <p>
            <strong>Enterprise Value from EBITDA</strong> = EBITDA × EV/EBITDA Multiple. Accounts for operating efficiency and is less affected by capital structure.
          </p>
          <p>
            <strong>Equity Value from P/E</strong> = Net Income × P/E Multiple. Direct equity valuation based on earnings.
          </p>
          <p>
            <strong>Average Valuation</strong> = Mean of all valid valuation estimates. Provides a balanced estimate when multiple methods are used.
          </p>
          <p>Comparable company valuation estimates company value by applying market multiples from similar public companies. Select 5-10 truly comparable companies and use median or mean multiples to reduce outlier impact.</p>
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
                  {(() => {
                    const vals = [result.evFromRevenue, result.evFromEbitda, result.equityValueFromPE].filter(v => v > 0);
                    return vals.length > 1 ? `${(Math.max(...vals) - Math.min(...vals)).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Methods Used</p>
                <p className="text-xl font-semibold text-primary">
                  {[result.evFromRevenue, result.evFromEbitda, result.equityValueFromPE].filter(v => v > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Valuation methods</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Range %</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const vals = [result.evFromRevenue, result.evFromEbitda, result.equityValueFromPE].filter(v => v > 0);
                    const range = vals.length > 1 ? Math.max(...vals) - Math.min(...vals) : 0;
                    const avg = result.averageValuation;
                    return avg > 0 ? `${((range / avg) * 100).toFixed(1)}%` : 'N/A';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Of average</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your financial data and multiples to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Comparable Company Valuation: Using Multiples for Company Valuation" />
    <meta itemProp="description" content="A comprehensive guide to comparable company valuation using multiples like EV/Revenue, EV/EBITDA, and P/E ratios to estimate company value based on similar public companies." />
    <meta itemProp="keywords" content="comparable company valuation, comps, valuation multiples, EV/Revenue, EV/EBITDA, P/E ratio, company valuation, market multiples" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-comparable-company-valuation-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Comparable Company Valuation: Using Multiples for Company Valuation</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to estimating company value using comparable company valuation multiples, including EV/Revenue, EV/EBITDA, and P/E ratios from similar public companies.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Comparable Company Valuation?</a></li>
        <li><a href="#multiples" className="hover:underline">Common Valuation Multiples</a></li>
        <li><a href="#selection" className="hover:underline">Selecting Comparable Companies</a></li>
        <li><a href="#applications" className="hover:underline">Applications and Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Comparable Company Valuation?</h2>
    <p><b>Comparable company valuation</b> (also called "comps" or "trading multiples") estimates company value by applying valuation multiples from similar public companies. It's a market-based approach that reflects current market sentiment and is widely used in M&A, IPOs, and investment analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>The method assumes that similar companies should trade at similar multiples. By identifying public companies with comparable business models, industries, and financial characteristics, you can apply their market multiples to estimate your target company's value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Advantages</h3>
    <ul>
        <li><b>Market-based:</b> Reflects current market conditions and investor sentiment</li>
        <li><b>Quick and simple:</b> Faster than DCF and requires less detailed forecasting</li>
        <li><b>Transparent:</b> Easy to explain and justify to stakeholders</li>
        <li><b>Real-time:</b> Uses current market prices and multiples</li>
    </ul>

<hr />

    <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Valuation Multiples</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">EV/Revenue Multiple</h3>
    <p><b>Enterprise Value to Revenue</b> is useful for companies with negative or low profitability, early-stage companies, or when EBITDA is not meaningful. Formula: EV = Revenue × EV/Revenue Multiple.</p>
    <p><b>When to use:</b> Companies with negative EBITDA, high-growth startups, or when revenue is the primary value driver.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EV/EBITDA Multiple</h3>
    <p><b>Enterprise Value to EBITDA</b> accounts for operating efficiency and is less affected by capital structure differences. It's the most commonly used multiple for profitable companies. Formula: EV = EBITDA × EV/EBITDA Multiple.</p>
    <p><b>When to use:</b> Profitable companies, mature businesses, or when comparing companies with different capital structures.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">P/E Multiple</h3>
    <p><b>Price to Earnings</b> directly values equity based on earnings. Formula: Equity Value = Net Income × P/E Multiple. Note: P/E is an equity multiple, while EV multiples are enterprise-level.</p>
    <p><b>When to use:</b> When focusing on equity value, comparing dividend-paying companies, or when earnings are stable and predictable.</p>

<hr />

    <h2 id="selection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Selecting Comparable Companies</h2>
    <p>Selecting appropriate comparables is critical for accurate valuation:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Criteria</h3>
    <ul>
        <li><b>Industry:</b> Same or closely related industry</li>
        <li><b>Business model:</b> Similar revenue streams, customer base, and operations</li>
        <li><b>Size:</b> Similar revenue, market cap, or enterprise value</li>
        <li><b>Growth rate:</b> Similar historical and expected growth</li>
        <li><b>Profitability:</b> Similar margins and return metrics</li>
        <li><b>Geography:</b> Similar markets and regulatory environments</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sample Size</h3>
    <p>Ideally use 5-10 comparable companies. Too few (1-3) lacks statistical validity, while too many (15+) may include less comparable companies. Calculate both median and mean multiples, with median often preferred as it's less affected by outliers.</p>

<hr />

    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications and Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Triangulation</h3>
    <p>Use multiple valuation methods (comps, DCF, precedent transactions) and triangulate results. If methods yield similar values, confidence increases. Large discrepancies suggest reviewing assumptions or method selection.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Adjustments</h3>
    <p>Adjust for company-specific factors: size premiums/discounts, growth rate differences, profitability variations, geographic considerations, and liquidity discounts for private companies. These adjustments improve accuracy but require judgment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations</h3>
    <p>Comparable company valuation has limitations: difficulty finding true comparables, market inefficiencies affecting public company prices, differences in growth and profitability, and the need for company-specific adjustments. Always use alongside other valuation methods.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Comparable company valuation</b> is a powerful market-based valuation method that estimates company value using multiples from similar public companies. Key to success is selecting truly comparable companies, using appropriate multiples (EV/Revenue, EV/EBITDA, P/E), and triangulating with other valuation methods for accuracy.</p>
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
          <p>This tool estimates company value using comparable company valuation multiples including EV/Revenue, EV/EBITDA, and P/E ratios.</p>
          <p>Outputs include enterprise value from revenue and EBITDA multiples, equity value from P/E multiple, average valuation, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

