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
  finalYearEBITDA: z.number({ invalid_type_error: 'Enter final year EBITDA' }).min(0).optional(),
  finalYearRevenue: z.number({ invalid_type_error: 'Enter final year revenue' }).min(0).optional(),
  exitMultipleEBITDA: z.number({ invalid_type_error: 'Enter exit multiple EBITDA' }).min(0).optional(),
  exitMultipleRevenue: z.number({ invalid_type_error: 'Enter exit multiple revenue' }).min(0).optional(),
  wacc: z.number({ invalid_type_error: 'Enter WACC' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  finalYearEBITDA?: number;
  finalYearRevenue?: number;
  exitMultipleEBITDA?: number;
  exitMultipleRevenue?: number;
  wacc?: number;
  terminalValueFromEBITDA: number;
  terminalValueFromRevenue: number;
  averageTerminalValue: number;
  presentValueOfTerminalValueEBITDA: number;
  presentValueOfTerminalValueRevenue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter final year EBITDA or revenue from forecast period.',
  'Enter corresponding exit multiple (EV/EBITDA or EV/Revenue).',
  'Optionally enter WACC to calculate present value.',
  'Review terminal value and present value calculations.',
];

const faqs = [
  {
    question: 'What is terminal value (Exit Multiple Method)?',
    answer:
      'Terminal value using the exit multiple method estimates the company\'s value at the end of the forecast period by applying a valuation multiple (typically EV/EBITDA or EV/Revenue) to the final year\'s financial metric. It assumes the company would be valued at exit using market multiples from comparable companies.',
  },
  {
    question: 'How is terminal value calculated using exit multiples?',
    answer:
      'Terminal Value = Final Year Financial Metric * Exit Multiple. For example: Terminal Value = Final Year EBITDA * EV/EBITDA Multiple, or Terminal Value = Final Year Revenue * EV/Revenue Multiple. The exit multiple is typically derived from comparable company analysis or industry benchmarks.',
  },
  {
    question: 'Which multiple should I use: EV/EBITDA or EV/Revenue?',
    answer:
      'EV/EBITDA is most common for profitable companies with significant D&A, as EBITDA normalizes for capital structure and accounting differences. EV/Revenue is useful for early-stage companies, unprofitable companies, or revenue-focused valuations. Use the multiple most relevant to the industry and company profitability stage.',
  },
  {
    question: 'How do I select an appropriate exit multiple?',
    answer:
      'Select exit multiples based on: comparable company trading multiples, precedent transaction multiples, industry benchmarks, company growth prospects (higher growth commands higher multiples), profitability levels, and market conditions. Median multiples from comparable companies are commonly used as a starting point.',
  },
  {
    question: 'How is present value of terminal value calculated?',
    answer:
      'Present Value of Terminal Value = Terminal Value / (1 + WACC)^n, where n is the number of years in the forecast period (typically 5). This discounts the terminal value (which is in year n) back to today\'s present value, consistent with discounting forecast period cash flows.',
  },
  {
    question: 'How does exit multiple method differ from Gordon Growth?',
    answer:
      'Exit multiple method applies a market multiple to a financial metric, assuming the company is sold at that multiple. Gordon Growth assumes perpetual growth at a constant rate. Exit multiple is preferred when: comparable multiples are reliable, the company may be sold, or growth is difficult to estimate. Many analysts use both methods for triangulation.',
  },
  {
    question: 'What if I use multiple exit multiples?',
    answer:
      'Using multiple exit multiples (e.g., both EV/EBITDA and EV/Revenue) provides triangulation and helps assess valuation range. Calculate terminal value using each multiple, then average or use a range. This approach provides more robust valuation estimates and helps identify outliers or unrealistic assumptions.',
  },
  {
    question: 'Should exit multiple match trading multiples?',
    answer:
      'Exit multiples can match current trading multiples, but often analysts apply a discount (5-15%) to reflect the uncertainty of future market conditions, or use precedent transaction multiples which include control premiums. The choice depends on whether you\'re assuming a strategic sale (higher multiples) or market-based exit (current trading multiples).',
  },
  {
    question: 'How sensitive is terminal value to exit multiple?',
    answer:
      'Terminal value is highly sensitive to exit multiple assumptions, often representing 50-80% of total DCF value. A 1x change in EV/EBITDA multiple can result in significant valuation differences. This is why exit multiple selection requires careful justification and sensitivity analysis to understand valuation range.',
  },
  {
    question: 'Can I use different multiples for different scenarios?',
    answer:
      'Yes, using different multiples for different scenarios (base case, upside, downside) provides a range of terminal values and helps assess valuation uncertainty. This approach is particularly useful in sensitivity analysis and when presenting valuation ranges to stakeholders.',
  },
];

const relatedCalculators = [
  {
    name: 'Terminal Value (Gordon Growth) Calculator',
    slug: 'terminal-value-gordon-growth-calculator',
    description: 'Calculate terminal value using Gordon Growth Model.',
  },
  {
    name: 'Discounted Cash Flow (DCF) Sensitivity Grid Calculator',
    slug: 'discounted-cash-flow-dcf-sensitivity-grid-calculator',
    description: 'Calculate DCF sensitivity analysis.',
  },
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate comparable company multiples.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/terminal-value-exit-multiple-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Terminal Value (Exit Multiple) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Terminal Value (Exit Multiple) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate terminal value using exit multiple method (EV/EBITDA or EV/Revenue) for DCF valuation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const finalYearEBITDA = values.finalYearEBITDA;
  const finalYearRevenue = values.finalYearRevenue;
  const exitMultipleEBITDA = values.exitMultipleEBITDA;
  const exitMultipleRevenue = values.exitMultipleRevenue;
  const wacc = values.wacc;
  
  let terminalValueFromEBITDA = 0;
  let terminalValueFromRevenue = 0;
  
  if (finalYearEBITDA && exitMultipleEBITDA && finalYearEBITDA > 0 && exitMultipleEBITDA > 0) {
    terminalValueFromEBITDA = finalYearEBITDA * exitMultipleEBITDA;
  }
  
  if (finalYearRevenue && exitMultipleRevenue && finalYearRevenue > 0 && exitMultipleRevenue > 0) {
    terminalValueFromRevenue = finalYearRevenue * exitMultipleRevenue;
  }
  
  const estimates: number[] = [];
  if (terminalValueFromEBITDA > 0) estimates.push(terminalValueFromEBITDA);
  if (terminalValueFromRevenue > 0) estimates.push(terminalValueFromRevenue);
  
  const averageTerminalValue = estimates.length > 0 ? estimates.reduce((sum, val) => sum + val, 0) / estimates.length : 0;
  
  const forecastPeriod = 5; // Typical forecast period
  const waccPct = wacc ? wacc / 100 : 0;
  let presentValueOfTerminalValueEBITDA = 0;
  let presentValueOfTerminalValueRevenue = 0;
  
  if (terminalValueFromEBITDA > 0 && wacc && waccPct > 0) {
    presentValueOfTerminalValueEBITDA = terminalValueFromEBITDA / Math.pow(1 + waccPct, forecastPeriod);
  }
  
  if (terminalValueFromRevenue > 0 && wacc && waccPct > 0) {
    presentValueOfTerminalValueRevenue = terminalValueFromRevenue / Math.pow(1 + waccPct, forecastPeriod);
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (estimates.length === 0) {
    status = 'low';
    interpretation = 'Enter at least one financial metric and corresponding exit multiple to calculate terminal value.';
  } else if (estimates.length === 1) {
    status = 'good';
    interpretation = `Terminal value: ${averageTerminalValue.toLocaleString()} using exit multiple method. Consider using multiple multiples for triangulation.`;
  } else {
    status = 'optimal';
    const minEst = Math.min(...estimates);
    const maxEst = Math.max(...estimates);
    interpretation = `Terminal value range: ${minEst.toLocaleString()} to ${maxEst.toLocaleString()}, average ${averageTerminalValue.toLocaleString()}. Multiple estimates provide triangulation.`;
  }

  const recommendations: string[] = [];
  
  if (estimates.length === 0) {
    recommendations.push('CRITICAL: No terminal value calculated - Enter at least one financial metric (EBITDA or Revenue) along with its corresponding exit multiple (EV/EBITDA or EV/Revenue) to calculate terminal value.');
  } else {
    if (terminalValueFromEBITDA > 0) {
      recommendations.push(`Terminal value from EBITDA: ${terminalValueFromEBITDA.toLocaleString()} = Final Year EBITDA ${finalYearEBITDA?.toLocaleString()} * EV/EBITDA Multiple ${exitMultipleEBITDA?.toFixed(1)}x. ${wacc ? `Present value: ${presentValueOfTerminalValueEBITDA.toLocaleString()}.` : 'Enter WACC to calculate present value.'}`);
    }
    if (terminalValueFromRevenue > 0) {
      recommendations.push(`Terminal value from Revenue: ${terminalValueFromRevenue.toLocaleString()} = Final Year Revenue ${finalYearRevenue?.toLocaleString()} * EV/Revenue Multiple ${exitMultipleRevenue?.toFixed(1)}x. ${wacc ? `Present value: ${presentValueOfTerminalValueRevenue.toLocaleString()}.` : 'Enter WACC to calculate present value.'}`);
    }
    
    if (estimates.length > 1) {
      const rangePercent = averageTerminalValue > 0 ? ((Math.max(...estimates) - Math.min(...estimates)) / averageTerminalValue) * 100 : 0;
      recommendations.push(`Multiple estimates: Using both EBITDA and Revenue multiples provides triangulation. Range: ${Math.min(...estimates).toLocaleString()} to ${Math.max(...estimates).toLocaleString()} (${rangePercent.toFixed(1)}% spread). Average: ${averageTerminalValue.toLocaleString()}.`);
    } else {
      recommendations.push('Consider using multiple multiples: Using both EV/EBITDA and EV/Revenue multiples provides better triangulation and helps assess valuation range. Compare to Gordon Growth method for additional validation.');
    }
  }
  
  recommendations.push('Exit multiple selection: Select exit multiples based on comparable company trading multiples, precedent transactions, or industry benchmarks. Consider company growth prospects, profitability, and market conditions. Exit multiples typically reflect current market conditions and may include a discount for future uncertainty.');

  const plan = [
    { label: 'This Week', detail: `Calculate terminal value: ${averageTerminalValue > 0 ? averageTerminalValue.toLocaleString() : 'N/A'} using exit multiple method${estimates.length > 1 ? ' (multiple estimates triangulated)' : ''}. Document exit multiple assumptions and rationale.` },
    { label: 'This Month', detail: 'Compare exit multiple terminal value to Gordon Growth method for triangulation. Perform sensitivity analysis by varying exit multiples. Review multiple selection - ensure they reflect appropriate comparables and market conditions.' },
    { label: 'Ongoing', detail: 'Update exit multiples as market conditions or comparable company multiples change. Monitor terminal value assumptions relative to total DCF value. Regularly validate multiples against market data and industry benchmarks.' },
  ];

  return { finalYearEBITDA, finalYearRevenue, exitMultipleEBITDA, exitMultipleRevenue, wacc, terminalValueFromEBITDA, terminalValueFromRevenue, averageTerminalValue, presentValueOfTerminalValueEBITDA, presentValueOfTerminalValueRevenue, interpretation, status, recommendations, plan };
};

export default function TerminalValueExitMultipleCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalYearEBITDA: undefined,
      finalYearRevenue: undefined,
      exitMultipleEBITDA: undefined,
      exitMultipleRevenue: undefined,
      wacc: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="terminal-value-exit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Terminal Value (Exit Multiple) Calculator
          </CardTitle>
          <CardDescription>Calculate terminal value using exit multiple method (EV/EBITDA or EV/Revenue) for DCF valuation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your terminal value parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="finalYearEBITDA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Year EBITDA (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exitMultipleEBITDA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple EV/EBITDA (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalYearRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Year Revenue (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exitMultipleRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Multiple EV/Revenue (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wacc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WACC (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">For present value calculation</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Terminal Value
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
            <CardDescription>See terminal value calculation and present value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">TV from EBITDA</p>
                <p className="text-2xl font-semibold text-primary">{result.terminalValueFromEBITDA > 0 ? result.terminalValueFromEBITDA.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">EV/EBITDA multiple</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">TV from Revenue</p>
                <p className="text-2xl font-semibold text-primary">{result.terminalValueFromRevenue > 0 ? result.terminalValueFromRevenue.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">EV/Revenue multiple</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Terminal Value</p>
                <p className="text-2xl font-semibold text-primary">{result.averageTerminalValue > 0 ? result.averageTerminalValue.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Calculation status</p>
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
            <strong>Terminal Value from EBITDA</strong> = Final Year EBITDA * Exit Multiple (EV/EBITDA)
          </p>
          <p>
            <strong>Terminal Value from Revenue</strong> = Final Year Revenue * Exit Multiple (EV/Revenue)
          </p>
          <p>
            <strong>Average Terminal Value</strong> = Average of Available Estimates
          </p>
          <p>
            <strong>Present Value of Terminal Value</strong> = Terminal Value / (1 + WACC)^n
          </p>
          <p>Where n = number of years in forecast period (typically 5)</p>
          <p>The exit multiple method calculates terminal value by applying a valuation multiple to the final year's financial metric, assuming the company would be valued at exit using market multiples. This method is commonly used when comparable company multiples are reliable and provides a market-based approach to terminal value estimation.</p>
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
                <p className="text-sm text-muted-foreground">PV from EBITDA</p>
                <p className="text-xl font-semibold text-primary">{result.presentValueOfTerminalValueEBITDA > 0 ? result.presentValueOfTerminalValueEBITDA.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Present value (EBITDA)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">PV from Revenue</p>
                <p className="text-xl font-semibold text-primary">{result.presentValueOfTerminalValueRevenue > 0 ? result.presentValueOfTerminalValueRevenue.toLocaleString() : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Present value (Revenue)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimates Used</p>
                <p className="text-xl font-semibold text-primary">{[result.terminalValueFromEBITDA > 0 ? 'EBITDA' : null, result.terminalValueFromRevenue > 0 ? 'Revenue' : null].filter(Boolean).join(', ') || 'None'}</p>
                <p className="text-xs text-muted-foreground">Active calculations</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your terminal value parameters to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
        <meta itemProp="name" content="The Complete Guide to Terminal Value: Exit Multiple Method" />
        <meta itemProp="description" content="An in-depth guide on calculating terminal value using exit multiple method (EV/EBITDA or EV/Revenue) for DCF valuation." />
        <meta itemProp="keywords" content="terminal value, exit multiple, EV/EBITDA, EV/Revenue, DCF terminal value, exit multiple method" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/terminal-value-exit-multiple-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Terminal Value: Exit Multiple Method</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at calculating terminal value using exit multiple method (EV/EBITDA or EV/Revenue) for DCF valuation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Exit Multiple Method</a></li>
          <li><a href="#multiples" className="hover:underline">Exit Multiple Selection</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Steps</a></li>
          <li><a href="#comparison" className="hover:underline">Exit Multiple vs Gordon Growth</a></li>
          <li><a href="#best" className="hover:underline">Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Exit Multiple Method</h2>
        <p>The exit multiple method estimates terminal value by applying a valuation multiple to the final year's financial metric.</p>

        <hr className="my-6" />

        <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Exit Multiple Selection</h2>
        <p>Select exit multiples based on comparable companies, precedent transactions, or industry benchmarks.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Steps</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Terminal Value = Final Year Metric * Exit Multiple</strong></p>
        </div>

        <hr className="my-6" />

        <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Exit Multiple vs Gordon Growth</h2>
        <p>Exit multiple provides a market-based approach, while Gordon Growth assumes perpetual growth. Many analysts use both for triangulation.</p>

        <hr className="my-6" />

        <h2 id="best" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Best Practices</h2>
        <p>Best practices include using multiple multiples for triangulation, selecting appropriate comparables, and performing sensitivity analysis.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The exit multiple method provides a market-based approach to estimating terminal value by applying valuation multiples to final year financial metrics. This method is particularly useful when comparable company multiples are reliable and provides an alternative to the Gordon Growth Model. Using multiple exit multiples and comparing to Gordon Growth results helps ensure robust terminal value estimates.</p>
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
          <p>This tool calculates terminal value using exit multiple method (EV/EBITDA or EV/Revenue) for DCF valuation.</p>
          <p>Outputs include terminal value from each multiple, average terminal value, present values, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



