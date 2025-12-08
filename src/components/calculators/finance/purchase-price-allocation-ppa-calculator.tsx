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
  purchasePrice: z.number({ invalid_type_error: 'Enter purchase price' }).min(0),
  tangibleAssetsFairValue: z.number({ invalid_type_error: 'Enter tangible assets fair value' }).min(0).optional(),
  intangibleAssetsFairValue: z.number({ invalid_type_error: 'Enter intangible assets fair value' }).min(0).optional(),
  liabilitiesFairValue: z.number({ invalid_type_error: 'Enter liabilities fair value' }).min(0).optional(),
  identifiableAssetsFairValue: z.number({ invalid_type_error: 'Enter identifiable assets fair value' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  purchasePrice: number;
  tangibleAssetsFairValue?: number;
  intangibleAssetsFairValue?: number;
  liabilitiesFairValue?: number;
  identifiableAssetsFairValue?: number;
  netIdentifiableAssets: number;
  goodwill: number;
  goodwillPercentage: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter purchase price (total consideration paid).',
  'Enter fair values of identifiable assets and liabilities (or enter separately: tangible assets, intangible assets, liabilities).',
  'Review purchase price allocation and goodwill calculation.',
];

const faqs = [
  {
    question: 'What is Purchase Price Allocation (PPA)?',
    answer:
      'Purchase Price Allocation (PPA) is the process of allocating the purchase price of an acquired company among its assets and liabilities based on their fair values. This allocation determines the amount attributed to goodwill, which represents the premium paid over net identifiable assets. PPA is required under accounting standards (ASC 805, IFRS 3) for business combinations.',
  },
  {
    question: 'How is goodwill calculated in PPA?',
    answer:
      'Goodwill = Purchase Price - Net Identifiable Assets. Net Identifiable Assets = Fair Value of Identifiable Assets - Fair Value of Liabilities. Alternatively: Goodwill = Purchase Price - (Tangible Assets + Intangible Assets - Liabilities). Goodwill represents the excess of purchase price over the fair value of net identifiable assets.',
  },
  {
    question: 'What are identifiable assets?',
    answer:
      'Identifiable assets are assets that can be separated from the entity and sold, transferred, licensed, rented, or exchanged, either individually or together with a related contract, identifiable asset, or liability. They include: tangible assets (property, equipment, inventory), intangible assets (patents, trademarks, customer relationships), and other identifiable assets.',
  },
  {
    question: 'What is fair value in PPA?',
    answer:
      'Fair value is the price that would be received to sell an asset or paid to transfer a liability in an orderly transaction between market participants. In PPA, all assets and liabilities of the acquired company must be measured at fair value as of the acquisition date, regardless of their previous carrying values on the target\'s books.',
  },
  {
    question: 'What are common intangible assets in PPA?',
    answer:
      'Common intangible assets identified in PPA include: customer relationships, trademarks and brand names, patents and technology, non-compete agreements, software and IT assets, contracts and backlog, and other identifiable intangibles. Each must be separately identified and valued at fair value.',
  },
  {
    question: 'What if goodwill is negative?',
    answer:
      'Negative goodwill (also called a bargain purchase gain) occurs when the fair value of net identifiable assets exceeds the purchase price. This is rare but can occur in distressed sales or when assets are undervalued. Under accounting standards, negative goodwill is recognized as a gain in earnings immediately.',
  },
  {
    question: 'What is a reasonable goodwill percentage?',
    answer:
      'Goodwill as a percentage of purchase price varies widely by industry and transaction type. Typical ranges: Technology companies (30-60%), Manufacturing (20-40%), Services (15-35%), Retail (10-30%). Higher goodwill percentages may indicate strong brand value, customer relationships, or strategic value. Very high percentages (>70%) may warrant scrutiny.',
  },
  {
    question: 'How do I value intangible assets?',
    answer:
      'Intangible assets are valued using methods such as: income approach (discounted cash flow of future benefits), market approach (comparable transactions or market multiples), and cost approach (replacement or reproduction cost). Customer relationships often use income approach, while technology may use cost or income approach. Professional valuation experts typically perform this analysis.',
  },
  {
    question: 'What happens to goodwill after PPA?',
    answer:
      'Goodwill is recorded on the balance sheet as an intangible asset. Unlike other assets, goodwill is not amortized but is tested for impairment annually (or more frequently if events indicate potential impairment). If the fair value of the reporting unit falls below its carrying amount, goodwill impairment is recognized, reducing earnings.',
  },
  {
    question: 'What are disclosure requirements for PPA?',
    answer:
      'Accounting standards require disclosure of: purchase price breakdown, fair values of major asset and liability classes, amount of goodwill recognized, description of intangible assets identified, and key assumptions used in fair value measurements. These disclosures provide transparency about the acquisition and allocation process.',
  },
];

const relatedCalculators = [
  {
    name: 'Goodwill Impairment Calculator',
    slug: 'goodwill-impairment-calculator',
    description: 'Calculate goodwill impairment.',
  },
  {
    name: 'Intangible Asset Amortization Calculator',
    slug: 'intangible-asset-amortization-calculator',
    description: 'Calculate intangible asset amortization.',
  },
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge.',
  },
  {
    name: 'Deal Value vs Enterprise Value Bridge Calculator',
    slug: 'deal-value-vs-enterprise-value-bridge-calculator',
    description: 'Calculate deal value bridge.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/purchase-price-allocation-ppa-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Purchase Price Allocation (PPA) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Purchase Price Allocation (PPA) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate purchase price allocation (PPA) by allocating purchase price among assets and liabilities to determine goodwill.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const purchasePrice = values.purchasePrice;
  const tangibleAssetsFairValue = values.tangibleAssetsFairValue ?? 0;
  const intangibleAssetsFairValue = values.intangibleAssetsFairValue ?? 0;
  const liabilitiesFairValue = values.liabilitiesFairValue ?? 0;
  const identifiableAssetsFairValue = values.identifiableAssetsFairValue;
  
  // Calculate net identifiable assets
  let netIdentifiableAssets = 0;
  
  if (identifiableAssetsFairValue !== undefined && identifiableAssetsFairValue > 0) {
    // If total identifiable assets fair value is provided, use it
    netIdentifiableAssets = identifiableAssetsFairValue - liabilitiesFairValue;
  } else {
    // Otherwise sum tangible and intangible assets
    netIdentifiableAssets = tangibleAssetsFairValue + intangibleAssetsFairValue - liabilitiesFairValue;
  }
  
  // Goodwill = Purchase Price - Net Identifiable Assets
  const goodwill = purchasePrice - netIdentifiableAssets;
  
  // Goodwill as percentage of purchase price
  const goodwillPercentage = purchasePrice > 0 ? (goodwill / purchasePrice) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (netIdentifiableAssets === 0 && (tangibleAssetsFairValue === 0 && intangibleAssetsFairValue === 0 && !identifiableAssetsFairValue)) {
    status = 'low';
    interpretation = 'No identifiable assets entered - enter asset fair values to calculate PPA.';
  } else if (goodwill < 0) {
    status = 'low';
    interpretation = `Negative goodwill (bargain purchase gain) of ${Math.abs(goodwill).toLocaleString()}. Net identifiable assets exceed purchase price - this is rare and may indicate distressed sale or undervalued assets.`;
  } else {
    interpretation = `Goodwill: ${goodwill.toLocaleString()} (${goodwillPercentage.toFixed(1)}% of purchase price).`;
    
    if (goodwillPercentage > 70) {
      status = 'moderate';
      interpretation += ' Very high goodwill percentage - may warrant scrutiny or indicate strong intangible value.';
    } else if (goodwillPercentage > 50) {
      status = 'good';
      interpretation += ' High goodwill percentage, typical for companies with strong brands or customer relationships.';
    } else {
      status = 'optimal';
      interpretation += ' Goodwill percentage appears reasonable.';
    }
  }

  const recommendations: string[] = [];
  
  if (netIdentifiableAssets === 0 && (tangibleAssetsFairValue === 0 && intangibleAssetsFairValue === 0 && !identifiableAssetsFairValue)) {
    recommendations.push('CRITICAL: No identifiable assets entered - Enter fair values of identifiable assets (tangible assets, intangible assets) and liabilities to calculate purchase price allocation. All assets and liabilities must be measured at fair value as of the acquisition date.');
  } else {
    recommendations.push(`Purchase Price Allocation: Purchase price of ${purchasePrice.toLocaleString()} allocated as follows: Net Identifiable Assets ${netIdentifiableAssets.toLocaleString()} (${((netIdentifiableAssets / purchasePrice) * 100).toFixed(1)}%), Goodwill ${goodwill.toLocaleString()} (${goodwillPercentage.toFixed(1)}%). Goodwill represents the premium paid over net identifiable assets.`);
    
    if (goodwill < 0) {
      recommendations.push('CRITICAL: Negative goodwill (bargain purchase) - Net identifiable assets exceed purchase price. This is rare and may indicate: distressed sale, assets undervalued, or accounting measurement issues. Under accounting standards, negative goodwill is recognized as a gain immediately. Review fair value measurements carefully.');
    } else {
      if (goodwillPercentage > 70) {
        recommendations.push(`High goodwill percentage warning: Goodwill of ${goodwillPercentage.toFixed(1)}% is very high and may warrant scrutiny. While high goodwill can reflect strong brands, customer relationships, or strategic value, ensure all identifiable intangible assets are properly identified and valued. Very high goodwill increases future impairment risk.`);
      }
      
      recommendations.push('Asset allocation: Ensure all identifiable assets (tangible and intangible) are separately identified and valued at fair value. Common intangibles include customer relationships, trademarks, patents, technology, and contracts. Professional valuation experts typically perform detailed fair value measurements for PPA.');
      
      recommendations.push('Goodwill accounting: Goodwill is recorded on the balance sheet and tested for impairment annually (or more frequently if events indicate potential impairment). Unlike other assets, goodwill is not amortized. High goodwill amounts increase the risk of future impairment charges if the acquired business underperforms.');
    }
  }
  
  recommendations.push('Compliance: PPA must comply with accounting standards (ASC 805 in US, IFRS 3 internationally). All assets and liabilities must be measured at fair value. Disclosure requirements include purchase price breakdown, fair values of major classes, goodwill amount, and key assumptions used.');

  const plan = [
    { label: 'This Week', detail: `Calculate purchase price allocation: Goodwill ${goodwill.toLocaleString()} (${goodwillPercentage.toFixed(1)}% of purchase price), Net Identifiable Assets ${netIdentifiableAssets.toLocaleString()}. Document all asset and liability fair values and assumptions.` },
    { label: 'This Month', detail: 'Complete detailed PPA analysis: Identify all tangible and intangible assets, obtain professional valuations for significant assets, document fair value measurement methods and assumptions, and ensure compliance with accounting standards. Prepare required disclosures.' },
    { label: 'Ongoing', detail: 'Monitor goodwill for impairment indicators. Test goodwill for impairment annually (or more frequently if events indicate potential impairment). Update fair value assessments if new information becomes available. Maintain documentation of PPA assumptions and valuations.' },
  ];

  return { purchasePrice, tangibleAssetsFairValue: tangibleAssetsFairValue > 0 ? tangibleAssetsFairValue : undefined, intangibleAssetsFairValue: intangibleAssetsFairValue > 0 ? intangibleAssetsFairValue : undefined, liabilitiesFairValue: liabilitiesFairValue > 0 ? liabilitiesFairValue : undefined, identifiableAssetsFairValue, netIdentifiableAssets, goodwill, goodwillPercentage, interpretation, status, recommendations, plan };
};

export default function PurchasePriceAllocationPpaCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchasePrice: undefined,
      tangibleAssetsFairValue: undefined,
      intangibleAssetsFairValue: undefined,
      liabilitiesFairValue: undefined,
      identifiableAssetsFairValue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="ppa-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Purchase Price Allocation (PPA) Calculator
          </CardTitle>
          <CardDescription>Calculate purchase price allocation (PPA) by allocating purchase price among assets and liabilities to determine goodwill.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your PPA components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identifiableAssetsFairValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiable Assets Fair Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 800000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Or enter separately below</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tangibleAssetsFairValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tangible Assets Fair Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 400000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intangibleAssetsFairValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intangible Assets Fair Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 300000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liabilitiesFairValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Liabilities Fair Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate PPA
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
            <CardDescription>See purchase price allocation and goodwill calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Purchase Price</p>
                <p className="text-2xl font-semibold text-primary">{result.purchasePrice.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total consideration</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Identifiable Assets</p>
                <p className="text-2xl font-semibold text-primary">{result.netIdentifiableAssets.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Assets - Liabilities</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Goodwill</p>
                <p className="text-2xl font-semibold text-primary">{result.goodwill.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{result.goodwillPercentage.toFixed(1)}% of purchase price</p>
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
            <strong>Net Identifiable Assets</strong> = Fair Value of Identifiable Assets - Fair Value of Liabilities
          </p>
          <p>Alternatively: Net Identifiable Assets = (Tangible Assets + Intangible Assets) - Liabilities</p>
          <p>
            <strong>Goodwill</strong> = Purchase Price - Net Identifiable Assets
          </p>
          <p>
            <strong>Goodwill %</strong> = (Goodwill / Purchase Price) * 100
          </p>
          <p>Purchase Price Allocation (PPA) allocates the purchase price of an acquired company among its assets and liabilities based on fair values. Goodwill represents the excess of purchase price over net identifiable assets and reflects factors like brand value, customer relationships, and expected synergies. PPA is required under accounting standards (ASC 805, IFRS 3) for business combinations.</p>
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
                <p className="text-sm text-muted-foreground">Tangible Assets</p>
                <p className="text-xl font-semibold text-primary">{result.tangibleAssetsFairValue?.toLocaleString() ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Fair value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Intangible Assets</p>
                <p className="text-xl font-semibold text-primary">{result.intangibleAssetsFairValue?.toLocaleString() ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Fair value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Liabilities</p>
                <p className="text-xl font-semibold text-primary">{result.liabilitiesFairValue?.toLocaleString() ?? 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Fair value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Goodwill %</p>
                <p className="text-xl font-semibold text-primary">{result.goodwillPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of purchase price</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your PPA components to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Purchase Price Allocation (PPA): Goodwill and Asset Allocation in M&A" />
        <meta itemProp="description" content="An in-depth guide on purchase price allocation (PPA), allocating purchase price among assets and liabilities to determine goodwill in business combinations." />
        <meta itemProp="keywords" content="purchase price allocation, PPA, goodwill, business combination, fair value, asset allocation, M&A accounting" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/purchase-price-allocation-ppa-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Purchase Price Allocation (PPA): Goodwill and Asset Allocation in M&A</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at purchase price allocation (PPA), allocating purchase price among assets and liabilities to determine goodwill in business combinations.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding PPA</a></li>
          <li><a href="#allocation" className="hover:underline">Asset and Liability Allocation</a></li>
          <li><a href="#goodwill" className="hover:underline">Goodwill Calculation</a></li>
          <li><a href="#fair" className="hover:underline">Fair Value Measurement</a></li>
          <li><a href="#compliance" className="hover:underline">Accounting Standards and Compliance</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Purchase Price Allocation (PPA)</h2>
        <p>Purchase Price Allocation (PPA) is a critical accounting process required when one company acquires another in a business combination. Under accounting standards, the acquirer must allocate the total purchase price to all identifiable assets acquired and liabilities assumed based on their <b>fair values</b> at the acquisition date. Any excess of purchase price over the net fair value of identifiable net assets is recorded as <b>goodwill</b>, representing future economic benefits not individually identified and separately recognized.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why PPA is Required</h3>
        <p>PPA serves several critical purposes: <b>Financial reporting accuracy</b>—ensures the acquirer's balance sheet reflects the true economic value of assets acquired, not historical book values. <b>Investor transparency</b>—provides clear visibility into what the acquirer paid for and how the purchase price was allocated. <b>Future impairment testing</b>—establishes the basis for testing goodwill and other assets for impairment. <b>Tax planning</b>—affects future tax deductions through amortization of intangibles and depreciation of tangible assets. <b>Regulatory compliance</b>—required by accounting standards (ASC 805 in US, IFRS 3 internationally) for all business combinations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Acquisition Method</h3>
        <p>Both ASC 805 and IFRS 3 require the <b>acquisition method</b> (also called purchase method) for business combinations. This method requires: identifying the acquirer (usually the entity that obtains control), determining the acquisition date (the date the acquirer obtains control), recognizing and measuring identifiable assets and liabilities at fair value, and recognizing and measuring goodwill or bargain purchase gain. The acquisition method ensures consistent accounting treatment regardless of how the combination is structured (merger, stock purchase, asset purchase).</p>

        <hr className="my-6" />

        <h2 id="allocation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Asset and Liability Identification and Allocation</h2>
        <p>All identifiable assets and liabilities must be separately identified and measured at fair value as of the acquisition date. The identification process requires careful analysis to ensure no assets or liabilities are overlooked, as this directly impacts the amount of goodwill recorded.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Tangible Assets</h3>
        <p><b>Tangible assets</b> include physical assets with identifiable lives: <b>Property, plant, and equipment (PP&E)</b>—land, buildings, machinery, equipment, vehicles (valued at fair market value, often using appraisals). <b>Inventory</b>—raw materials, work-in-process, finished goods (valued at selling price less costs to complete and dispose, or replacement cost). <b>Other tangible assets</b>—furniture, fixtures, computer hardware, leasehold improvements. Tangible assets are typically valued using market approaches (comparable sales), cost approaches (replacement cost less depreciation), or income approaches (for income-producing assets).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Intangible Assets</h3>
        <p><b>Intangible assets</b> are non-physical assets that must be separately identified if they meet criteria for recognition: they arise from contractual or legal rights, or they are separable (can be sold, transferred, licensed, or rented). Common intangible assets in PPA include: <b>Customer relationships</b>—valued based on expected cash flows from existing customers, customer retention rates, and economic life. <b>Trademarks and brand names</b>—valued using relief-from-royalty method or market comparisons. <b>Patents and technology</b>—valued based on expected future cash flows or cost to develop. <b>Non-compete agreements</b>—valued based on income approach. <b>Software and IT assets</b>—valued at fair value of developed technology. <b>Contracts and backlog</b>—valued based on expected profitability. <b>Licenses and franchises</b>—valued based on remaining term and expected cash flows.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Liabilities Assumed</h3>
        <p>All liabilities assumed must be recognized and measured at fair value, including: <b>Debt obligations</b>—valued at present value of future payments using market interest rates. <b>Contingent liabilities</b>—recognized at fair value if probable and can be reliably estimated (warranties, litigation, environmental). <b>Unfavorable contracts</b>—recognized as liabilities if contract terms are below market (onerous contracts). <b>Deferred tax liabilities</b>—arising from fair value adjustments to assets. <b>Other obligations</b>—accrued expenses, pension obligations, lease liabilities.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Net Identifiable Assets</h3>
        <p>The <b>net identifiable assets</b> equals the sum of all identifiable assets less the sum of all identifiable liabilities, all measured at fair value. This represents the fair value of what was acquired, excluding goodwill. The calculation: Net Identifiable Assets = (Tangible Assets + Intangible Assets) - Liabilities. This is a critical figure as it determines the amount of goodwill (or bargain purchase gain) recorded.</p>

        <hr className="my-6" />

        <h2 id="goodwill" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Goodwill Calculation and Interpretation</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Goodwill = Purchase Price - Net Identifiable Assets</strong></p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Goodwill</h3>
        <p><b>Goodwill</b> represents the excess of purchase price over the fair value of net identifiable assets. It reflects: <b>Synergies</b>—expected cost savings, revenue enhancements, or operational improvements from combining the businesses. <b>Assembled workforce</b>—value of having an experienced, trained team in place (cannot be separately recognized as an asset). <b>Market position and reputation</b>—benefits from established market presence. <b>Strategic value</b>—value from strategic positioning, entry into new markets, or competitive advantages. <b>Future growth opportunities</b>—potential not captured in identifiable assets. Goodwill is recorded as an intangible asset on the balance sheet but is <b>not amortized</b>; instead, it must be tested for impairment annually.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Goodwill as a Percentage of Purchase Price</h3>
        <p>The <b>goodwill percentage</b> (goodwill / purchase price × 100) provides insight into the acquisition's characteristics. Typical ranges by industry: <b>Technology companies</b>—30% to 60% (high intangible value, customer relationships, technology). <b>Manufacturing</b>—20% to 40% (mix of tangible and intangible assets). <b>Services</b>—15% to 35% (customer relationships, workforce). <b>Retail</b>—10% to 30% (location value, brand). Very high goodwill percentages (&gt;70%) may indicate overpayment, strong intangible value, or need to review whether all identifiable intangibles were properly identified and valued.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Bargain Purchase (Negative Goodwill)</h3>
        <p>A <b>bargain purchase</b> occurs when the fair value of net identifiable assets <b>exceeds</b> the purchase price, resulting in negative goodwill. This is rare but can occur in: <b>Distressed sales</b>—seller needs to dispose quickly. <b>Undervalued assets</b>—fair values significantly exceed book values. <b>Measurement errors</b>—incorrect fair value assessments. Under accounting standards, a bargain purchase gain is recognized in earnings immediately, which is unusual as gains are typically not recognized in business combinations. The gain must be disclosed separately and requires careful review to ensure fair values were correctly measured.</p>

        <hr className="my-6" />

        <h2 id="fair" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fair Value Measurement Techniques</h2>
        <p>Fair value is defined as the price that would be received to sell an asset or paid to transfer a liability in an orderly transaction between market participants at the measurement date. All assets and liabilities in PPA must be measured at fair value, regardless of their carrying values on the target's books.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Valuation Approaches</h3>
        <p>Three primary approaches are used to determine fair value: <b>Market Approach</b>—uses prices and other information from market transactions involving identical or comparable assets or liabilities. Examples: comparable company multiples for intangible assets, comparable transactions for equipment. <b>Income Approach</b>—converts future cash flows to a single present value amount. Examples: discounted cash flow (DCF) for customer relationships, relief-from-royalty for trademarks, multi-period excess earnings method for technology. <b>Cost Approach</b>—reflects the amount required to replace the service capacity of an asset (replacement cost). Examples: replacement cost less depreciation for equipment, cost to develop technology. The selection of approach depends on asset type, availability of market data, and relevance to the specific asset.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Fair Value Hierarchy (ASC 820)</h3>
        <p>Fair value measurements are categorized into a three-level hierarchy: <b>Level 1</b>—quoted prices in active markets for identical assets (highest priority, most reliable). <b>Level 2</b>—observable inputs other than Level 1 prices, such as quoted prices for similar assets or inputs derived from observable market data. <b>Level 3</b>—unobservable inputs based on entity's own assumptions (lowest priority, requires significant judgment). Most PPA fair values fall into Level 3, requiring significant professional judgment and valuation expertise. Entities must disclose the level of fair value hierarchy for major asset and liability classes.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Professional Valuation Services</h3>
        <p>Due to the complexity and judgment required in fair value measurement, companies typically engage <b>professional valuation experts</b> to perform PPA valuations. These experts bring: specialized knowledge of valuation techniques and methodologies, understanding of accounting standards and regulatory requirements, access to market data and comparable transactions, objectivity and independence, and expertise in valuing specific asset types (intangible assets, specialized equipment, etc.). The involvement of qualified valuation professionals helps ensure compliance with accounting standards and provides support for audit purposes.</p>

        <hr className="my-6" />

        <h2 id="compliance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accounting Standards and Compliance Requirements</h2>
        <p>PPA must comply with specific accounting standards that provide detailed guidance on recognition, measurement, and disclosure requirements for business combinations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">US GAAP: ASC 805</h3>
        <p>In the United States, <b>Accounting Standards Codification (ASC) 805, "Business Combinations"</b>, governs PPA under US Generally Accepted Accounting Principles (GAAP). Key requirements: requires the acquisition method for all business combinations, mandates recognition of all identifiable assets and liabilities at fair value, provides guidance on identifying and measuring intangible assets, requires recognition of contingent assets and liabilities at fair value if probable and estimable, allows a <b>measurement period</b> (typically up to one year) to finalize fair value measurements as additional information becomes available, and requires extensive disclosures about the business combination and fair value measurements.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">International Standards: IFRS 3</h3>
        <p>Internationally, <b>IFRS 3, "Business Combinations"</b>, provides similar guidance but with some differences from US GAAP: also requires the acquisition method, requires recognition of all identifiable assets and liabilities at fair value, has similar requirements for contingent liabilities but with some differences in recognition criteria, allows a measurement period similar to US GAAP, requires disclosure of the acquirer's identity, acquisition date, and description of the combination, and mandates disclosure of fair value measurements and valuation techniques used. While similar, there are nuanced differences between ASC 805 and IFRS 3 that entities must consider when applying the standards.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Measurement Period Adjustments</h3>
        <p>Both ASC 805 and IFRS 3 allow a <b>measurement period</b>, typically up to one year from the acquisition date, to finalize the PPA as additional information becomes available. During this period: provisional values may be used for assets and liabilities where fair value cannot be determined at acquisition date, adjustments to provisional values are recognized retrospectively (as if made at acquisition date), entities must reflect new information obtained about facts and circumstances that existed at acquisition date, and entities cannot adjust for changes in estimates that reflect events after the acquisition date. After the measurement period ends, adjustments are generally made to current period earnings unless they represent corrections of errors.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Disclosure Requirements</h3>
        <p>Both standards require extensive disclosures about business combinations, including: <b>Purchase price breakdown</b>—cash, equity instruments, contingent consideration, assumed liabilities. <b>Fair value of major asset and liability classes</b>—tangible assets, intangible assets, liabilities by category. <b>Goodwill recognized</b>—amount and explanation of factors contributing to goodwill. <b>Intangible assets identified</b>—description and fair value of major intangible asset classes. <b>Valuation techniques used</b>—methods and key assumptions for fair value measurements. <b>Contingent consideration</b>—description and fair value. <b>Bargain purchase gains</b>—if applicable, explanation of factors contributing to gain. These disclosures provide transparency about the acquisition and allow users of financial statements to understand the basis for recorded values.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Purchase Price Allocation is a critical process in M&A accounting, requiring allocation of purchase price among assets and liabilities at fair value to determine goodwill. Proper PPA ensures compliance with accounting standards, provides transparency about acquisition value, and establishes the basis for future goodwill impairment testing. Professional valuation expertise is typically required for accurate fair value measurements.</p>
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
          <p>This tool calculates purchase price allocation (PPA) by allocating purchase price among assets and liabilities to determine goodwill.</p>
          <p>Outputs include net identifiable assets, goodwill, goodwill percentage, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


