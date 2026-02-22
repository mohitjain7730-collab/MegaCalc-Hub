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
  reportedBookValue: z.number({ invalid_type_error: 'Enter reported book value' }).min(0),
  goodwill: z.number({ invalid_type_error: 'Enter goodwill' }).min(0).optional(),
  intangibleAssets: z.number({ invalid_type_error: 'Enter intangible assets' }).min(0).optional(),
  offBalanceSheetItems: z.number({ invalid_type_error: 'Enter off-balance sheet items' }).optional(),
  marketValueAdjustments: z.number({ invalid_type_error: 'Enter market value adjustments' }).optional(),
  otherAdjustments: z.number({ invalid_type_error: 'Enter other adjustments' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  reportedBookValue: number;
  goodwill: number;
  intangibleAssets: number;
  offBalanceSheetItems: number;
  marketValueAdjustments: number;
  otherAdjustments: number;
  adjustedBookValue: number;
  adjustmentAmount: number;
  adjustmentPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter reported book value of equity from financial statements.',
  'Optionally enter goodwill amount to be removed or adjusted.',
  'Optionally enter intangible assets to be adjusted.',
  'Optionally enter off-balance sheet items (liabilities or assets) to be included.',
  'Optionally enter market value adjustments for assets or liabilities.',
  'Optionally enter other adjustments (write-downs, impairments, etc.).',
  'Review adjusted book value, total adjustments, and recommendations.',
];

const faqs = [
  {
    question: 'What is adjusted book value?',
    answer:
      'Adjusted book value is the reported book value of equity modified to reflect economic reality rather than just accounting numbers. It removes items like goodwill that may not represent economic value and adds off-balance sheet items that should be included.',
  },
  {
    question: 'Why adjust book value?',
    answer:
      'Reported book value may not reflect true economic value due to accounting rules, historical cost basis, goodwill from acquisitions, off-balance sheet items, and market value differences. Adjustments make book value more meaningful for valuation and analysis.',
  },
  {
    question: 'What is goodwill and should it be removed?',
    answer:
      'Goodwill is the premium paid in acquisitions above the fair value of net assets. It represents intangible value but may not be recoverable. Many analysts remove or write down goodwill to get a more conservative book value, especially if acquisitions haven\'t created expected value.',
  },
  {
    question: 'What are off-balance sheet items?',
    answer:
      'Off-balance sheet items are assets or liabilities not recorded on the balance sheet but that have economic impact. Examples include operating leases (now capitalized under IFRS 16/ASC 842), contingent liabilities, guarantees, and certain derivatives. These should be included in adjusted book value.',
  },
  {
    question: 'When should market value adjustments be made?',
    answer:
      'Market value adjustments are appropriate when book values significantly differ from market values. Common examples include real estate (often carried at cost but worth more), investments in securities (should use market values), and certain financial instruments. Adjust to reflect current economic value.',
  },
  {
    question: 'How do intangible assets affect book value?',
    answer:
      'Intangible assets like patents, trademarks, and customer relationships may be carried at cost or not recognized at all. If these have significant economic value not reflected in book value, they should be added. Conversely, if recognized intangibles are impaired, they should be written down.',
  },
  {
    question: 'What is clean surplus accounting?',
    answer:
      'Clean surplus accounting means book value changes only through net income and dividends (retained earnings). Other comprehensive income items, stock buybacks, and certain transactions can create "dirty surplus." Adjusted book value should reflect clean surplus for use in residual income models.',
  },
  {
    question: 'How does adjusted book value relate to valuation?',
    answer:
      'Adjusted book value provides a more accurate starting point for valuation models like residual income, price-to-book ratios, and asset-based valuations. It reflects economic reality rather than accounting conventions, leading to more meaningful valuation multiples and intrinsic value estimates.',
  },
  {
    question: 'Should I always remove goodwill?',
    answer:
      'Not necessarily. Goodwill removal is a conservative approach, but if acquisitions have created genuine value and synergies are being realized, some goodwill may be justified. Consider removing goodwill if acquisitions have underperformed or if you want a more conservative valuation.',
  },
  {
    question: 'What about deferred tax assets and liabilities?',
    answer:
      'Deferred tax assets (DTAs) may not be recoverable if the company doesn\'t generate sufficient future taxable income. Deferred tax liabilities (DTLs) may never be paid if assets aren\'t sold. Adjust these based on recoverability and payment likelihood to get a more accurate adjusted book value.',
  },
];

const relatedCalculators = [
  {
    name: 'Residual Income Model Calculator',
    slug: 'residual-income-model-calculator',
    description: 'Value equity using adjusted book value in residual income model.',
  },
  {
    name: 'Market Value Added (MVA) Calculator',
    slug: 'market-value-added-mva-calculator',
    description: 'Compare market value to book value of capital.',
  },
  {
    name: 'Return on Equity Calculator',
    slug: 'return-on-equity-calculator',
    description: 'Calculate ROE using adjusted book value.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate total company value including debt and cash.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/adjusted-book-value-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Adjusted Book Value Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Adjusted Book Value Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate adjusted book value of equity by modifying reported book value to reflect economic reality through goodwill, intangible, and other adjustments.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const reportedBookValue = values.reportedBookValue;
  const goodwill = values.goodwill || 0;
  const intangibleAssets = values.intangibleAssets || 0;
  const offBalanceSheetItems = values.offBalanceSheetItems || 0;
  const marketValueAdjustments = values.marketValueAdjustments || 0;
  const otherAdjustments = values.otherAdjustments || 0;

  // Calculate total adjustments
  // Negative adjustments: goodwill removal, intangible write-downs
  // Positive adjustments: off-balance sheet items, market value increases, other additions
  const negativeAdjustments = -(goodwill + intangibleAssets);
  const positiveAdjustments = offBalanceSheetItems + marketValueAdjustments + otherAdjustments;
  const totalAdjustments = negativeAdjustments + positiveAdjustments;

  const adjustedBookValue = reportedBookValue + totalAdjustments;
  const adjustmentAmount = totalAdjustments;
  const adjustmentPercent = reportedBookValue > 0 ? (adjustmentAmount / reportedBookValue) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The adjusted book value reflects economic reality after appropriate adjustments. The adjustments appear reasonable and improve the accuracy of book value for valuation purposes.';

  if (adjustmentPercent < -30) {
    status = 'low';
    interpretation = 'Large negative adjustments significantly reduce book value. This may indicate substantial goodwill or intangible assets that don\'t reflect economic value, or significant write-downs are needed. Verify adjustments are appropriate.';
  } else if (adjustmentPercent < -10) {
    status = 'moderate';
    interpretation = 'Moderate negative adjustments reduce book value, which is common when removing goodwill or writing down impaired assets. Ensure adjustments reflect economic reality rather than being overly conservative.';
  } else if (Math.abs(adjustmentPercent) <= 10) {
    status = 'optimal';
    interpretation = 'Adjustments are relatively small, suggesting reported book value is reasonably close to economic value. Minor adjustments for off-balance sheet items or market values improve accuracy without major changes.';
  } else {
    status = 'good';
    interpretation = 'Positive adjustments increase book value, which may reflect unrecognized assets, market value increases, or off-balance sheet items. Ensure these adjustments are justified and verifiable.';
  }

  const recommendations = [
    'Verify adjustment rationale: ensure all adjustments are justified by economic reality, not just accounting differences. Document the reasoning for each adjustment.',
    `Review adjustment magnitude: ${Math.abs(adjustmentPercent).toFixed(1)}% adjustment is ${Math.abs(adjustmentPercent) > 20 ? 'substantial' : 'moderate'}. Ensure adjustments are reasonable and don't overstate or understate economic value.`,
    'Consider industry context: some industries (e.g., technology, pharmaceuticals) may have significant intangible value not on balance sheet, while others (e.g., financial services) may have off-balance sheet items to include.',
  ];
  if (goodwill > 0) {
    recommendations.push(`Goodwill removal: removing ${goodwill.toLocaleString()} in goodwill is conservative. Consider whether acquisitions have created value that justifies some goodwill retention.`);
  }
  if (offBalanceSheetItems !== 0) {
    recommendations.push(`Off-balance sheet items: ${offBalanceSheetItems > 0 ? 'Adding' : 'Subtracting'} ${Math.abs(offBalanceSheetItems).toLocaleString()} for off-balance sheet items. Ensure these are properly identified and quantified.`);
  }
  if (Math.abs(adjustmentPercent) > 30) {
    recommendations.push('Large adjustments: verify that such significant adjustments are appropriate. Consider whether the company\'s accounting policies or business model require these substantial modifications.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate adjusted book value starting from reported book value (${reportedBookValue.toLocaleString()}). Apply all relevant adjustments to reflect economic reality.` },
    { label: 'This Month', detail: 'Review and validate adjustments by comparing to industry peers, checking for similar off-balance sheet items, and verifying market value estimates are current and reasonable.' },
    { label: 'Ongoing', detail: 'Update adjusted book value as financial statements are released. Monitor changes in goodwill, intangible assets, and off-balance sheet items to maintain accurate adjusted book value over time.' },
  ];

  return {
    reportedBookValue,
    goodwill,
    intangibleAssets,
    offBalanceSheetItems,
    marketValueAdjustments,
    otherAdjustments,
    adjustedBookValue,
    adjustmentAmount,
    adjustmentPercent,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function AdjustedBookValueCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportedBookValue: undefined,
      goodwill: undefined,
      intangibleAssets: undefined,
      offBalanceSheetItems: undefined,
      marketValueAdjustments: undefined,
      otherAdjustments: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="adjusted-book-value-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Adjusted Book Value Calculator
          </CardTitle>
          <CardDescription>Calculate adjusted book value of equity by modifying reported book value to reflect economic reality through goodwill, intangible, and other adjustments.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your book value data</CardTitle>
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
                  name="reportedBookValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported Book Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goodwill"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goodwill to Remove ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intangibleAssets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intangible Assets to Remove ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 30000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offBalanceSheetItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Off-Balance Sheet Items ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketValueAdjustments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Value Adjustments ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherAdjustments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Adjustments ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate adjusted book value
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
            <CardDescription>See adjusted book value, total adjustments, adjustment percentage, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reported Book Value</p>
                <p className="text-2xl font-semibold text-primary">{result.reportedBookValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Adjustments</p>
                <p className={`text-2xl font-semibold ${result.adjustmentAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.adjustmentAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted Book Value</p>
                <p className="text-2xl font-semibold text-primary">{result.adjustedBookValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjustment %</p>
                <p className={`text-2xl font-semibold ${Math.abs(result.adjustmentPercent) < 10 ? 'text-green-600' : 'text-yellow-600'}`}>{result.adjustmentPercent.toFixed(1)}%</p>
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
            <strong>Adjusted Book Value</strong> = Reported Book Value + Total Adjustments. Adjustments include removing goodwill and intangibles, adding off-balance sheet items, applying market value adjustments, and other modifications.
          </p>
          <p>
            <strong>Negative Adjustments</strong> = -(Goodwill + Intangible Assets). These reduce book value by removing items that may not reflect economic value.
          </p>
          <p>
            <strong>Positive Adjustments</strong> = Off-Balance Sheet Items + Market Value Adjustments + Other Adjustments. These increase book value by including items not on the balance sheet or reflecting market values.
          </p>
          <p>
            <strong>Total Adjustments</strong> = Negative Adjustments + Positive Adjustments. The net effect of all adjustments on reported book value.
          </p>
          <p>
            <strong>Adjustment Percentage</strong> = (Total Adjustments / Reported Book Value) Ã— 100. Shows the magnitude of adjustments relative to reported book value.
          </p>
          <p>Adjusted book value provides a more accurate measure of economic value than reported book value, making it useful for valuation models, price-to-book ratios, and residual income calculations.</p>
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
                <p className="text-sm text-muted-foreground">Negative Adjustments</p>
                <p className="text-xl font-semibold text-red-600">
                  -{(result.goodwill + result.intangibleAssets).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Goodwill + Intangibles</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Positive Adjustments</p>
                <p className="text-xl font-semibold text-green-600">
                  {(result.offBalanceSheetItems + result.marketValueAdjustments + result.otherAdjustments).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Off-BS + Market + Other</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted / Reported</p>
                <p className="text-xl font-semibold text-primary">{(result.adjustedBookValue / result.reportedBookValue).toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Multiple</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your book value data to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Adjusted Book Value: Calculating Economic Book Value for Valuation" />
    <meta itemProp="description" content="An in-depth guide on calculating adjusted book value of equity by modifying reported book value to reflect economic reality through goodwill removal, intangible adjustments, off-balance sheet items, and market value corrections." />
    <meta itemProp="keywords" content="adjusted book value, economic book value, book value adjustments, goodwill removal, tangible book value, off-balance sheet items, book value calculation, equity valuation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-adjusted-book-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Adjusted Book Value: Calculating Economic Book Value for Valuation</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating adjusted book value by modifying reported book value to reflect economic reality through various adjustments for more accurate valuation and analysis.</p>


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Adjusted Book Value?</a></li>
        <li><a href="#why" className="hover:underline">Why Adjust Book Value?</a></li>
        <li><a href="#goodwill" className="hover:underline">Goodwill and Intangible Assets</a></li>
        <li><a href="#offbalance" className="hover:underline">Off-Balance Sheet Items</a></li>
        <li><a href="#market" className="hover:underline">Market Value Adjustments</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Valuation</a></li>
    </ul>
<hr />

    {/* OVERVIEW: WHAT IS ADJUSTED BOOK VALUE */}
    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Adjusted Book Value?</h2>
    <p><b>Adjusted book value</b>, also known as <b>economic book value</b> or <b>tangible book value</b> (when intangibles are removed), is the reported book value of equity modified to reflect economic reality rather than just accounting numbers. While reported book value follows accounting rules and conventions, adjusted book value aims to represent the true economic value of shareholders' equity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Reported book value is calculated as <b>Total Assets - Total Liabilities</b> and represents the accounting value of shareholders' equity. However, accounting rules, historical cost basis, and various accounting treatments can cause reported book value to differ significantly from economic value.</p>
    <p>Adjusted book value addresses these differences by:</p>
    <ul>
        <li><b>Removing items that don't reflect economic value:</b> Goodwill, impaired intangibles, overstated assets</li>
        <li><b>Adding items not on the balance sheet:</b> Off-balance sheet assets, operating leases, contingent assets</li>
        <li><b>Adjusting to market values:</b> Real estate, investments, certain financial instruments</li>
        <li><b>Correcting for accounting anomalies:</b> Write-downs, impairments, one-time adjustments</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Adjusted Book Value Matters</h3>
    <p>Adjusted book value is crucial for:</p>
    <ul>
        <li><b>Valuation models:</b> Residual income model, price-to-book ratios, asset-based valuations</li>
        <li><b>Financial analysis:</b> Return on equity (ROE), book value per share, equity multiples</li>
        <li><b>Investment decisions:</b> Identifying undervalued or overvalued companies</li>
        <li><b>Merger and acquisition:</b> Assessing fair value of target companies</li>
    </ul>

<hr />

    {/* WHY ADJUST BOOK VALUE */}
    <h2 id="why" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Adjust Book Value?</h2>
    <p>Several factors cause reported book value to differ from economic value:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Historical Cost Accounting</h3>
    <p>Assets are typically recorded at historical cost, which may differ significantly from current market value. For example, real estate purchased decades ago may be worth many times its book value, while technology assets may be obsolete and worth less than book value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Goodwill from Acquisitions</h3>
    <p>When a company acquires another business, any premium paid above the fair value of net assets is recorded as goodwill. This goodwill may not represent recoverable economic value, especially if the acquisition hasn't created expected synergies or value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Intangible Assets</h3>
    <p>Intangible assets like patents, trademarks, and customer relationships may be carried at cost or not recognized at all if internally developed. Conversely, recognized intangibles may be impaired and worth less than book value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Off-Balance Sheet Items</h3>
    <p>Certain assets and liabilities may not appear on the balance sheet but have economic impact. Examples include operating leases (now capitalized under IFRS 16/ASC 842), contingent liabilities, guarantees, and certain derivatives.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Market Value Differences</h3>
    <p>For certain assets like investments in securities, real estate, or financial instruments, market values may differ significantly from book values. Adjusting to market values provides a more accurate picture of economic value.</p>

<hr />

    {/* GOODWILL AND INTANGIBLE ASSETS */}
    <h2 id="goodwill" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Goodwill and Intangible Assets</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Goodwill Removal</h3>
    <p><b>Goodwill</b> represents the premium paid in acquisitions above the fair value of identifiable net assets. It's an accounting entry that may or may not reflect economic value.</p>
    <p><b>When to remove goodwill:</b></p>
    <ul>
        <li>Acquisitions have underperformed expectations</li>
        <li>You want a conservative valuation (tangible book value)</li>
        <li>Goodwill represents a significant portion of book value</li>
        <li>Industry practice is to exclude goodwill</li>
    </ul>
    <p><b>When to retain goodwill:</b></p>
    <ul>
        <li>Acquisitions have created genuine value and synergies</li>
        <li>Goodwill represents brand value, customer relationships, or other recoverable intangibles</li>
        <li>You want a less conservative valuation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Intangible Assets</h3>
    <p><b>Intangible assets</b> include patents, trademarks, customer lists, software, and other non-physical assets. These may need adjustment because:</p>
    <ul>
        <li><b>Internally developed intangibles:</b> Often not recognized on balance sheet but may have value</li>
        <li><b>Impaired intangibles:</b> May be worth less than book value and should be written down</li>
        <li><b>Valuable intangibles:</b> May be worth more than book value and should be marked up</li>
    </ul>
    <p><b>Tangible book value</b> is calculated by removing all intangible assets (including goodwill) from book value, providing the most conservative measure of equity value.</p>

<hr />

    {/* OFF-BALANCE SHEET ITEMS */}
    <h2 id="offbalance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Off-Balance Sheet Items</h2>
    <p>Off-balance sheet items are assets or liabilities not recorded on the balance sheet but that have economic impact. These should be included in adjusted book value:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Operating Leases</h3>
    <p>Under IFRS 16 and ASC 842, operating leases are now capitalized on the balance sheet. However, for companies reporting under older standards or for analysis purposes, operating lease obligations should be added as liabilities (reducing book value) or the right-of-use asset should be added (increasing book value).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Contingent Liabilities</h3>
    <p>Contingent liabilities like lawsuits, environmental remediation, or guarantees may not be recorded but represent potential obligations. These should be estimated and subtracted from book value if material.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Contingent Assets</h3>
    <p>Conversely, contingent assets like potential legal settlements or insurance recoveries may not be recorded but represent potential value. These can be added to book value if probable and estimable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Derivatives and Hedging</h3>
    <p>Certain derivatives may be off-balance sheet or recorded at values that don't reflect economic reality. Adjust to fair value for accurate book value.</p>

<hr />

    {/* MARKET VALUE ADJUSTMENTS */}
    <h2 id="market" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Market Value Adjustments</h2>
    <p>For certain assets and liabilities, market values provide a more accurate measure of economic value than book values:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Real Estate</h3>
    <p>Real estate is typically carried at historical cost less depreciation, which may differ significantly from current market value. For companies with substantial real estate holdings, adjusting to market value can significantly impact book value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investments in Securities</h3>
    <p>Investments in stocks, bonds, or other securities should be valued at market prices rather than historical cost. This is particularly important for financial institutions, investment companies, or holding companies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial Instruments</h3>
    <p>Certain financial instruments like derivatives, structured products, or complex securities should be marked to market to reflect current economic value rather than historical cost or model values.</p>

<hr />

    {/* APPLICATIONS IN VALUATION */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Valuation</h2>
    <p>Adjusted book value is used in various valuation contexts:</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Residual Income Model</h3>
    <p>The residual income model uses adjusted book value as the starting point for valuation. Clean, adjusted book value ensures accurate residual income calculations and equity value estimates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Price-to-Book Ratios</h3>
    <p>Price-to-book (P/B) ratios using adjusted book value provide more meaningful comparisons than ratios using reported book value. Adjusted P/B ratios better reflect whether a stock is trading above or below economic book value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Return on Equity (ROE)</h3>
    <p>ROE calculated using adjusted book value (Adjusted ROE = Net Income / Adjusted Book Value) provides a more accurate measure of profitability relative to economic equity, rather than accounting equity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Asset-Based Valuations</h3>
    <p>For asset-heavy businesses or liquidation scenarios, adjusted book value provides a better estimate of net asset value than reported book value, reflecting what assets could actually be sold for.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Merger and Acquisition</h3>
    <p>In M&A transactions, adjusted book value helps assess the fair value of target companies by reflecting economic reality rather than accounting numbers, leading to more accurate purchase price allocations.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Adjusted book value</b> is a crucial concept in financial analysis and valuation. By modifying reported book value to reflect economic reality through goodwill removal, intangible adjustments, off-balance sheet items, and market value corrections, analysts can obtain a more accurate measure of shareholders' equity.</p>
    <p>Key to successful adjustment is ensuring all modifications are justified by economic reality, properly documented, and consistent with the purpose of the analysis. Whether for residual income models, price-to-book ratios, or asset-based valuations, adjusted book value provides a more meaningful foundation than reported book value alone.</p>
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
          <p>This tool calculates adjusted book value of equity by modifying reported book value to reflect economic reality through various adjustments.</p>
          <p>Outputs include reported book value, adjustments (goodwill, intangibles, off-balance sheet items, market values, other), adjusted book value, adjustment amount and percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
