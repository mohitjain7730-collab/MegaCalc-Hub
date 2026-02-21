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
  enterpriseValue: z.number({ invalid_type_error: 'Enter enterprise value' }).min(0),
  totalDebt: z.number({ invalid_type_error: 'Enter total debt' }).min(0),
  preferredEquity: z.number({ invalid_type_error: 'Enter preferred equity' }).min(0).optional(),
  minorityInterest: z.number({ invalid_type_error: 'Enter minority interest' }).min(0).optional(),
  cashAndEquivalents: z.number({ invalid_type_error: 'Enter cash and equivalents' }).min(0),
  investments: z.number({ invalid_type_error: 'Enter investments' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  enterpriseValue: number;
  totalDebt: number;
  preferredEquity: number;
  minorityInterest: number;
  cashAndEquivalents: number;
  investments: number;
  netDebt: number;
  equityValue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter enterprise value (total value of operating assets).',
  'Enter total debt and cash & cash equivalents.',
  'Optionally enter preferred equity, minority interest, and investments.',
  'Review equity value calculation and bridge components.',
];

const faqs = [
  {
    question: 'What is enterprise value bridge?',
    answer:
      'Enterprise value bridge reconciles enterprise value (total value of operating assets) with equity value (value attributable to shareholders) by accounting for debt, cash, preferred equity, minority interest, and other adjustments. The bridge shows how enterprise value translates to shareholder equity value.',
  },
  {
    question: 'How is equity value calculated from enterprise value?',
    answer:
      'Equity Value = Enterprise Value - Total Debt - Preferred Equity - Minority Interest + Cash and Cash Equivalents + Investments. This formula adjusts enterprise value by removing claims of debt holders and preferred shareholders, and adding back cash and non-operating assets.',
  },
  {
    question: 'What is enterprise value?',
    answer:
      'Enterprise value (EV) represents the total value of a company\'s operating assets, reflecting what it would cost to acquire the entire business. EV = Market Value of Equity + Net Debt. It\'s used because it values the company regardless of capital structure and is commonly used in M&A and valuation.',
  },
  {
    question: 'What is net debt?',
    answer:
      'Net debt = Total Debt - Cash and Cash Equivalents. It represents debt net of cash available to service it. Net debt is often used in the EV bridge as a simplified adjustment: Equity Value = EV - Net Debt - Preferred Equity - Minority Interest + Investments.',
  },
  {
    question: 'What is preferred equity?',
    answer:
      'Preferred equity represents preferred shares that have priority over common stock in dividends and liquidation. Preferred equity is subtracted from EV in the bridge because it represents a claim on the company separate from common equity.',
  },
  {
    question: 'What is minority interest?',
    answer:
      'Minority interest represents the portion of subsidiaries not owned by the parent company. It\'s subtracted from EV because that value belongs to minority shareholders, not the parent company\'s shareholders.',
  },
  {
    question: 'Why add cash and investments?',
    answer:
      'Cash and cash equivalents and investments (non-operating assets) are added back because they\'re not part of the operating business but belong to shareholders. EV values only operating assets, so cash and investments are added to get equity value.',
  },
  {
    question: 'How is the bridge used in valuation?',
    answer:
      'The EV bridge is used to: convert EV multiples to equity multiples, determine equity value from EV-based valuations, reconcile DCF (which values EV) with market equity values, and understand the impact of capital structure on shareholder value.',
  },
  {
    question: 'What if equity value is negative?',
    answer:
      'Negative equity value indicates that enterprise value is less than the value of debt and other claims. This may occur when a company is in financial distress, has very high debt relative to operating value, or when EV is calculated at a low valuation multiple. Review assumptions and company financials.',
  },
  {
    question: 'How does the bridge affect valuation multiples?',
    answer:
      'The bridge allows converting between EV-based multiples (EV/EBITDA, EV/Revenue) and equity-based multiples (P/E, P/B). Understanding the bridge helps analysts apply appropriate multiples and understand how capital structure affects valuation.',
  },
];

const relatedCalculators = [
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow.',
  },
  {
    name: 'Comparable Company (Trading Multiples) Valuation Calculator',
    slug: 'comparable-company-trading-multiples-valuation-calculator',
    description: 'Calculate comparable company valuation.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/enterprise-value-bridge-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Enterprise Value Bridge Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Enterprise Value Bridge Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate equity value from enterprise value using the EV bridge by adjusting for debt, cash, preferred equity, minority interest, and investments.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const enterpriseValue = values.enterpriseValue;
  const totalDebt = values.totalDebt;
  const preferredEquity = values.preferredEquity ?? 0;
  const minorityInterest = values.minorityInterest ?? 0;
  const cashAndEquivalents = values.cashAndEquivalents;
  const investments = values.investments ?? 0;
  
  // Net Debt = Total Debt - Cash and Cash Equivalents
  const netDebt = totalDebt - cashAndEquivalents;
  
  // Equity Value = Enterprise Value - Total Debt - Preferred Equity - Minority Interest + Cash and Cash Equivalents + Investments
  const equityValue = enterpriseValue - totalDebt - preferredEquity - minorityInterest + cashAndEquivalents + investments;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Equity value of ${equityValue.toLocaleString()} calculated from enterprise value ${enterpriseValue.toLocaleString()} by subtracting debt (${totalDebt.toLocaleString()}), preferred equity (${preferredEquity.toLocaleString()}), minority interest (${minorityInterest.toLocaleString()}), and adding cash (${cashAndEquivalents.toLocaleString()}) and investments (${investments.toLocaleString()}).`;
  
  if (equityValue < 0) {
    status = 'low';
    interpretation += ' Negative equity value indicates high debt relative to enterprise value - review financial structure.';
  } else if (equityValue < enterpriseValue * 0.3) {
    status = 'moderate';
    interpretation += ' Low equity value relative to enterprise value suggests significant debt burden.';
  } else {
    status = 'optimal';
  }

  const recommendations = [
    `EV Bridge calculation: Enterprise value ${enterpriseValue.toLocaleString()} converts to equity value ${equityValue.toLocaleString()}. Net debt: ${netDebt.toLocaleString()} (debt ${totalDebt.toLocaleString()} minus cash ${cashAndEquivalents.toLocaleString()}). This bridge shows how operating value translates to shareholder value.`,
    `Capital structure analysis: ${totalDebt > enterpriseValue * 0.5 ? 'High debt relative to enterprise value indicates leveraged capital structure. Monitor debt levels and ensure adequate cash flow for debt service.' : 'Debt levels appear manageable relative to enterprise value. Maintain balance between debt and equity.'}`,
    `Cash position: Cash and equivalents of ${cashAndEquivalents.toLocaleString()} ${cashAndEquivalents > totalDebt ? 'exceeds total debt, providing strong liquidity position.' : cashAndEquivalents > totalDebt * 0.5 ? 'provides reasonable liquidity coverage.' : 'may be insufficient relative to debt - consider maintaining higher cash reserves.'}`,
    `Valuation application: Use this bridge to convert EV-based valuations (from DCF or trading multiples) to equity value. This equity value can then be divided by shares outstanding to estimate equity value per share for stock valuation.`,
  ];
  
  if (equityValue < 0) {
    recommendations.push('CRITICAL: Negative equity value - Enterprise value is insufficient to cover debt and other claims. This indicates severe financial distress. Review enterprise value calculation, debt structure, and consider if company requires restructuring or if EV assumptions are too low.');
  }
  if (netDebt > enterpriseValue * 0.7) {
    recommendations.push('Very high net debt: Net debt exceeds 70% of enterprise value, indicating highly leveraged structure. High leverage increases financial risk and may limit financial flexibility. Consider deleveraging strategies if appropriate.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate EV bridge: Enterprise value ${enterpriseValue.toLocaleString()} → Equity value ${equityValue.toLocaleString()}. Document all bridge components (debt, cash, preferred equity, minority interest, investments).` },
    { label: 'This Month', detail: 'Use EV bridge to convert EV-based valuations to equity value. Apply equity value per share calculations using shares outstanding. Compare bridge results with market equity values to validate assumptions.' },
    { label: 'Ongoing', detail: 'Regularly update EV bridge as financials change (debt paydown, cash accumulation, etc.). Use bridge in M&A analysis, valuation work, and capital structure planning. Monitor capital structure ratios to maintain appropriate leverage.' },
  ];

  return { enterpriseValue, totalDebt, preferredEquity, minorityInterest, cashAndEquivalents, investments, netDebt, equityValue, interpretation, status, recommendations, plan };
};

export default function EnterpriseValueBridgeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enterpriseValue: undefined,
      totalDebt: undefined,
      preferredEquity: undefined,
      minorityInterest: undefined,
      cashAndEquivalents: undefined,
      investments: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ev-bridge-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Enterprise Value Bridge Calculator
          </CardTitle>
          <CardDescription>Calculate equity value from enterprise value using the EV bridge by adjusting for debt, cash, preferred equity, minority interest, and investments.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your EV bridge components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enterpriseValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enterprise Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 2500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Equity (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minorityInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minority Interest (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investments (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Non-operating investments</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate EV Bridge
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
            <CardDescription>See EV bridge calculation and equity value.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Enterprise Value</p>
                <p className="text-2xl font-semibold text-primary">{result.enterpriseValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Starting point</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Debt</p>
                <p className="text-2xl font-semibold text-primary">{result.netDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Debt - Cash</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity Value</p>
                <p className="text-2xl font-semibold text-primary">{result.equityValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Shareholder value</p>
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
            <strong>Equity Value</strong> = Enterprise Value - Total Debt - Preferred Equity - Minority Interest + Cash and Cash Equivalents + Investments
          </p>
          <p>
            <strong>Net Debt</strong> = Total Debt - Cash and Cash Equivalents
          </p>
          <p>Alternatively using net debt:</p>
          <p>
            <strong>Equity Value</strong> = Enterprise Value - Net Debt - Preferred Equity - Minority Interest + Investments
          </p>
          <p>The enterprise value bridge reconciles enterprise value (total operating asset value) with equity value (shareholder value) by adjusting for debt, cash, preferred equity, minority interest, and investments. Enterprise value represents what it costs to acquire the entire business, while equity value represents the value attributable to common shareholders after accounting for all claims on the company.</p>
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
                <p className="text-sm text-muted-foreground">Equity / EV Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.enterpriseValue > 0 ? ((result.equityValue / result.enterpriseValue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Equity value / EV</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Debt / EV</p>
                <p className="text-xl font-semibold text-primary">
                  {result.enterpriseValue > 0 ? ((result.netDebt / result.enterpriseValue) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Leverage ratio</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your EV bridge components to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Enterprise Value Bridge: Converting EV to Equity Value" />
    <meta itemProp="description" content="An in-depth guide on the enterprise value bridge, calculating equity value from enterprise value by adjusting for debt, cash, preferred equity, minority interest, and investments." />
    <meta itemProp="keywords" content="enterprise value bridge, EV bridge, equity value, enterprise value, valuation bridge, capital structure" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/finance/enterprise-value-bridge-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Enterprise Value Bridge: Converting EV to Equity Value</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at the enterprise value bridge, calculating equity value from enterprise value by adjusting for debt, cash, preferred equity, minority interest, and investments.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Enterprise Value Bridge</a></li>
        <li><a href="#components" className="hover:underline">Bridge Components</a></li>
        <li><a href="#calculation" className="hover:underline">Bridge Calculation</a></li>
        <li><a href="#application" className="hover:underline">Valuation Applications</a></li>
        <li><a href="#multiples" className="hover:underline">Converting Multiples</a></li>
        <li><a href="#analysis" className="hover:underline">Capital Structure Analysis</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Enterprise Value Bridge</h2>
    <p>The enterprise value bridge reconciles enterprise value (total operating asset value) with equity value (value attributable to common shareholders) by accounting for capital structure components.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Enterprise Value vs Equity Value</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Enterprise Value:</b> Total value of operating assets, independent of capital structure</li>
        <li><b>Equity Value:</b> Value attributable to common shareholders after all other claims</li>
        <li><b>Bridge:</b> The calculation that connects EV to equity value</li>
    </ul>

<hr className="my-6" />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bridge Components</h2>
    <p>The bridge adjusts for various capital structure components.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Subtracted Components</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Total Debt:</b> Interest-bearing liabilities that must be repaid</li>
        <li><b>Preferred Equity:</b> Preferred shares with priority claims</li>
        <li><b>Minority Interest:</b> Value of subsidiaries not owned by parent</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Added Components</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Cash and Cash Equivalents:</b> Liquid assets available to shareholders</li>
        <li><b>Investments:</b> Non-operating investments (equity stakes, etc.)</li>
    </ul>

<hr className="my-6" />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bridge Calculation</h2>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Equity Value = EV - Debt - Preferred Equity - Minority Interest + Cash + Investments</strong></p>
    </div>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Applications</h2>
    <p>The EV bridge is essential for converting EV-based valuations to equity value.</p>

<hr className="my-6" />

    <h2 id="multiples" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Converting Multiples</h2>
    <p>The bridge allows conversion between EV-based and equity-based multiples.</p>

<hr className="my-6" />

    <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Capital Structure Analysis</h2>
    <p>The bridge reveals capital structure impact on shareholder value.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The enterprise value bridge is a fundamental tool in corporate finance, converting enterprise value to equity value by adjusting for debt, cash, preferred equity, minority interest, and investments. Understanding and applying the bridge is essential for valuation work, M&A analysis, and understanding how capital structure affects shareholder value.</p>
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
          <p>This tool calculates equity value from enterprise value using the EV bridge by adjusting for debt, cash, preferred equity, minority interest, and investments.</p>
          <p>Outputs include equity value, net debt, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
