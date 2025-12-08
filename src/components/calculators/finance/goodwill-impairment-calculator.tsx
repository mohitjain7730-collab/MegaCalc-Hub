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
  carryingValue: z.number({ invalid_type_error: 'Enter carrying value' }).min(0),
  fairValue: z.number({ invalid_type_error: 'Enter fair value' }).min(0),
  reportingUnitCarryingValue: z.number({ invalid_type_error: 'Enter reporting unit carrying value' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  carryingValue: number;
  fairValue: number;
  reportingUnitCarryingValue?: number;
  impairmentLoss: number;
  impairmentPercentage: number;
  remainingCarryingValue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter goodwill carrying value (book value).',
  'Enter reporting unit fair value.',
  'Optionally enter reporting unit carrying value.',
  'Review goodwill impairment calculation.',
];

const faqs = [
  {
    question: 'What is goodwill impairment?',
    answer:
      'Goodwill impairment occurs when the carrying value (book value) of goodwill exceeds its fair value. Under accounting standards (ASC 350, IFRS 3), goodwill must be tested for impairment annually (or more frequently if events indicate potential impairment). If impaired, goodwill is written down to fair value, recognizing an impairment loss that reduces earnings.',
  },
  {
    question: 'How is goodwill impairment calculated?',
    answer:
      'Goodwill Impairment = Carrying Value - Fair Value (if carrying value > fair value). The impairment loss equals the excess of carrying value over fair value. If fair value exceeds carrying value, no impairment exists. The carrying value after impairment equals the fair value, and the remaining carrying value cannot exceed fair value.',
  },
  {
    question: 'What is the two-step impairment test?',
    answer:
      'The two-step test (under US GAAP, simplified one-step under IFRS): Step 1: Compare reporting unit fair value to its carrying value. If fair value < carrying value, proceed to Step 2. Step 2: Calculate implied fair value of goodwill and compare to carrying value. Impairment = Carrying Value - Implied Fair Value of Goodwill. This calculator performs Step 1 and simplified Step 2 analysis.',
  },
  {
    question: 'When is goodwill tested for impairment?',
    answer:
      'Goodwill must be tested for impairment: annually (at the same time each year), more frequently if events or circumstances indicate potential impairment (e.g., significant decline in stock price, adverse changes in business, loss of key personnel, legal issues), and whenever a reporting unit is identified for disposal.',
  },
  {
    question: 'What is a reporting unit?',
    answer:
      'A reporting unit is the level at which goodwill is tested for impairment - typically an operating segment or one level below. It\'s the component of a business for which discrete financial information is available and management regularly reviews. Goodwill is allocated to reporting units based on expected synergies.',
  },
  {
    question: 'How do I determine fair value of a reporting unit?',
    answer:
      'Fair value of a reporting unit can be determined using: quoted market prices (if available), comparable company multiples, discounted cash flow analysis, or a combination of methods. Fair value represents what a market participant would pay for the reporting unit in an orderly transaction. Professional valuation expertise is typically required.',
  },
  {
    question: 'What causes goodwill impairment?',
    answer:
      'Goodwill impairment is caused by factors that reduce the value of the reporting unit below its carrying value, such as: significant decline in operating performance, loss of key customers or contracts, adverse changes in industry or market conditions, increased competition, technological obsolescence, regulatory changes, or macroeconomic factors.',
  },
  {
    question: 'What is the impact of goodwill impairment?',
    answer:
      'Goodwill impairment reduces: earnings (impairment loss is recognized as an expense), total assets (goodwill carrying value is reduced), and book value per share. Impairment is a non-cash charge but signals that the acquisition did not create expected value. Repeated impairments may indicate overpayment or poor integration.',
  },
  {
    question: 'Can goodwill impairment be reversed?',
    answer:
      'Under US GAAP (ASC 350), goodwill impairment cannot be reversed once recognized. Under IFRS, impairment reversals are also generally not permitted for goodwill. Once impaired, goodwill remains at the lower carrying value unless the reporting unit is disposed of. This differs from other assets where reversals may be permitted.',
  },
  {
    question: 'How do I prevent goodwill impairment?',
    answer:
      'Prevent goodwill impairment by: ensuring realistic acquisition valuations and synergy expectations, effective integration and execution of acquisition strategy, monitoring reporting unit performance and market conditions, timely identification of impairment indicators, and proactive management of factors affecting value. However, impairment may still occur due to external factors beyond control.',
  },
];

const relatedCalculators = [
  {
    name: 'Purchase Price Allocation (PPA) Calculator',
    slug: 'purchase-price-allocation-ppa-calculator',
    description: 'Calculate purchase price allocation.',
  },
  {
    name: 'Intangible Asset Amortization Calculator',
    slug: 'intangible-asset-amortization-calculator',
    description: 'Calculate intangible asset amortization.',
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

const baseUrl = 'https://mycalculating.com/category/finance/goodwill-impairment-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Goodwill Impairment Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Goodwill Impairment Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate goodwill impairment by comparing carrying value to fair value and determining impairment loss.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const carryingValue = values.carryingValue;
  const fairValue = values.fairValue;
  const reportingUnitCarryingValue = values.reportingUnitCarryingValue;
  
  // Goodwill Impairment = Carrying Value - Fair Value (if carrying value > fair value)
  let impairmentLoss = 0;
  if (carryingValue > fairValue) {
    impairmentLoss = carryingValue - fairValue;
  }
  
  // Impairment Percentage = (Impairment Loss / Carrying Value) * 100
  const impairmentPercentage = carryingValue > 0 ? (impairmentLoss / carryingValue) * 100 : 0;
  
  // Remaining Carrying Value after impairment = Fair Value (cannot exceed fair value)
  const remainingCarryingValue = fairValue;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (impairmentLoss === 0) {
    status = 'optimal';
    interpretation = `No impairment: Fair value (${fairValue.toLocaleString()}) exceeds or equals carrying value (${carryingValue.toLocaleString()}). Goodwill is not impaired.`;
  } else {
    interpretation = `Goodwill impaired: Impairment loss of ${impairmentLoss.toLocaleString()} (${impairmentPercentage.toFixed(1)}% of carrying value).`;
    
    if (impairmentPercentage > 50) {
      status = 'low';
      interpretation += ' Severe impairment - more than 50% of goodwill value lost.';
    } else if (impairmentPercentage > 25) {
      status = 'moderate';
      interpretation += ' Significant impairment - more than 25% of goodwill value lost.';
    } else {
      status = 'good';
      interpretation += ' Moderate impairment.';
    }
  }

  const recommendations: string[] = [];
  
  if (impairmentLoss === 0) {
    recommendations.push(`No impairment identified: Fair value of ${fairValue.toLocaleString()} equals or exceeds carrying value of ${carryingValue.toLocaleString()}. Goodwill is not impaired and no write-down is required. Continue monitoring for impairment indicators and test annually.`);
  } else {
    recommendations.push(`Goodwill impairment: Impairment loss of ${impairmentLoss.toLocaleString()} identified (${impairmentPercentage.toFixed(1)}% of carrying value). Carrying value ${carryingValue.toLocaleString()} exceeds fair value ${fairValue.toLocaleString()}. Goodwill must be written down to fair value, recognizing the impairment loss as an expense that reduces earnings.`);
    
    if (impairmentPercentage > 50) {
      recommendations.push('CRITICAL: Severe impairment (>50%) - More than half of goodwill value has been lost, indicating significant deterioration in the reporting unit\'s value. This may indicate: overpayment in the original acquisition, poor integration, severe market/industry decline, or fundamental business issues. Review acquisition strategy and reporting unit performance.');
    } else if (impairmentPercentage > 25) {
      recommendations.push('Significant impairment warning: More than 25% of goodwill value impaired suggests meaningful deterioration in reporting unit value. Review factors causing impairment, assess whether issues are temporary or permanent, and consider strategic actions to improve value or divest the reporting unit.');
    }
    
    recommendations.push(`Remaining value: After impairment, goodwill carrying value is reduced from ${carryingValue.toLocaleString()} to ${remainingCarryingValue.toLocaleString()} (fair value). The impairment loss cannot be reversed under accounting standards, and goodwill remains at this reduced level unless the reporting unit is disposed of.`);
    
    if (reportingUnitCarryingValue && reportingUnitCarryingValue > fairValue) {
      recommendations.push(`Reporting unit analysis: Reporting unit carrying value ${reportingUnitCarryingValue.toLocaleString()} exceeds fair value ${fairValue.toLocaleString()}, confirming Step 1 of the impairment test (fair value < carrying value). This triggers Step 2 analysis to determine the implied fair value of goodwill and calculate specific goodwill impairment.`);
    }
  }
  
  recommendations.push('Impairment testing: Goodwill must be tested for impairment annually (or more frequently if events indicate potential impairment). Maintain documentation of fair value measurements, assumptions used, and factors considered. Monitor for impairment indicators such as declines in stock price, operating performance, or adverse market conditions.');

  const plan = [
    { label: 'This Week', detail: `Calculate goodwill impairment: ${impairmentLoss > 0 ? `Impairment loss ${impairmentLoss.toLocaleString()} (${impairmentPercentage.toFixed(1)}%)` : 'No impairment identified'}. Document fair value measurement, assumptions, and factors considered.` },
    { label: 'This Month', detail: `${impairmentLoss > 0 ? 'Recognize impairment loss in financial statements. ' : ''}Complete detailed impairment analysis: document reporting unit fair value determination method, review impairment indicators and triggering events, assess factors causing impairment, and prepare required disclosures. Consult with valuation experts and auditors.` },
    { label: 'Ongoing', detail: 'Establish annual impairment testing schedule. Monitor reporting unit performance and market conditions for impairment indicators. Update fair value assessments as new information becomes available. Document ongoing monitoring and any events that may trigger additional impairment testing.' },
  ];

  return { carryingValue, fairValue, reportingUnitCarryingValue, impairmentLoss, impairmentPercentage, remainingCarryingValue, interpretation, status, recommendations, plan };
};

export default function GoodwillImpairmentCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carryingValue: undefined,
      fairValue: undefined,
      reportingUnitCarryingValue: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="goodwill-impairment-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Goodwill Impairment Calculator
          </CardTitle>
          <CardDescription>Calculate goodwill impairment by comparing carrying value to fair value and determining impairment loss.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your goodwill impairment test parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="carryingValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goodwill Carrying Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fairValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goodwill Fair Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 400000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportingUnitCarryingValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Unit Carrying Value (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2000000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">For Step 1 analysis</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Impairment
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
            <CardDescription>See goodwill impairment calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Carrying Value</p>
                <p className="text-2xl font-semibold text-primary">{result.carryingValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Book value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fair Value</p>
                <p className="text-2xl font-semibold text-primary">{result.fairValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Market value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impairment Loss</p>
                <p className="text-2xl font-semibold text-primary">{result.impairmentLoss.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{result.impairmentPercentage.toFixed(1)}%</p>
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
            <strong>Goodwill Impairment Loss</strong> = Carrying Value - Fair Value (if Carrying Value &gt; Fair Value)
          </p>
          <p>If Fair Value ≥ Carrying Value: No Impairment (Impairment Loss = 0)</p>
          <p>
            <strong>Impairment Percentage</strong> = (Impairment Loss / Carrying Value) * 100
          </p>
          <p>
            <strong>Remaining Carrying Value</strong> = Fair Value (after impairment, cannot exceed fair value)
          </p>
          <p>Goodwill impairment occurs when the carrying value (book value) of goodwill exceeds its fair value. The impairment loss equals the excess and must be recognized as an expense, reducing earnings and the carrying value of goodwill. Goodwill is tested for impairment annually (or more frequently if events indicate potential impairment) under accounting standards (ASC 350, IFRS 3).</p>
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
                <p className="text-sm text-muted-foreground">Remaining Carrying Value</p>
                <p className="text-xl font-semibold text-primary">{result.remainingCarryingValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">After impairment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Value Retained</p>
                <p className="text-xl font-semibold text-primary">{((result.fairValue / result.carryingValue) * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of original value</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impairment %</p>
                <p className="text-xl font-semibold text-primary">{result.impairmentPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Loss percentage</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your goodwill impairment test parameters to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Goodwill Impairment: Testing and Recognizing Impairment Losses" />
        <meta itemProp="description" content="An in-depth guide on goodwill impairment, testing goodwill for impairment and recognizing impairment losses when carrying value exceeds fair value." />
        <meta itemProp="keywords" content="goodwill impairment, impairment testing, goodwill write-down, ASC 350, IFRS 3, impairment loss" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/goodwill-impairment-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Goodwill Impairment: Testing and Recognizing Impairment Losses</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at goodwill impairment, testing goodwill for impairment and recognizing impairment losses when carrying value exceeds fair value.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Goodwill Impairment</a></li>
          <li><a href="#testing" className="hover:underline">Impairment Testing Process</a></li>
          <li><a href="#calculation" className="hover:underline">Impairment Calculation</a></li>
          <li><a href="#indicators" className="hover:underline">Impairment Indicators</a></li>
          <li><a href="#accounting" className="hover:underline">Accounting Treatment</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Goodwill Impairment</h2>
        <p>Goodwill impairment occurs when the <b>carrying value</b> (book value) of goodwill on a company's balance sheet exceeds its <b>fair value</b>, indicating that the value expected from the acquisition has not materialized or has declined. When impairment is identified, goodwill must be written down to fair value, recognizing an <b>impairment loss</b> that reduces both the asset's carrying value and the company's earnings. Unlike other assets that may be amortized or depreciated, goodwill is not amortized but must be tested for impairment periodically to ensure it is not overstated on the balance sheet.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What is Goodwill?</h3>
        <p><b>Goodwill</b> is an intangible asset that arises when a company acquires another business for a price that exceeds the fair value of the acquired company's identifiable net assets. It represents factors such as: <b>Expected synergies</b>—cost savings or revenue enhancements from combining operations. <b>Assembled workforce</b>—value of having trained employees in place. <b>Brand value and reputation</b>—market position and customer loyalty. <b>Strategic positioning</b>—entry into new markets or competitive advantages. <b>Future growth opportunities</b>—potential not captured in identifiable assets. Goodwill is unique because it cannot be sold separately and its value is inherently uncertain, making impairment testing critical for accurate financial reporting.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Impairment Occurs</h3>
        <p>Goodwill impairment reflects that the value expected from an acquisition has not been realized or has diminished. Common reasons include: <b>Overpayment in acquisition</b>—the purchase price exceeded the true economic value. <b>Failed integration</b>—expected synergies did not materialize or were not captured. <b>Market deterioration</b>—adverse changes in industry conditions, competition, or economy. <b>Business underperformance</b>—declining revenues, margins, or market share. <b>Regulatory or technological changes</b>—disruptions that reduce the business's value. <b>Loss of key assets</b>—departure of key personnel, loss of major customers, or expiration of critical contracts. Impairment is not necessarily a failure but rather an acknowledgment that the acquisition did not create the expected value.</p>

        <hr className="my-6" />

        <h2 id="testing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Goodwill Impairment Testing Process</h2>
        <p>Under accounting standards (ASC 350 in US, IAS 36 under IFRS), goodwill must be tested for impairment at least <b>annually</b> and more frequently if events or circumstances indicate that it is more likely than not (greater than 50% probability) that the fair value of a reporting unit is less than its carrying amount. The testing process involves identifying reporting units, determining their fair values, and comparing fair values to carrying amounts.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Reporting Units</h3>
        <p>Goodwill impairment testing is conducted at the <b>reporting unit</b> level, not at the entity level. A reporting unit is: <b>An operating segment</b> or one level below an operating segment, for which discrete financial information is available, and management regularly reviews the operating results. Reporting units are typically aligned with how management makes operating decisions and allocates resources. Goodwill is allocated to reporting units based on expected synergies from the acquisition. If a company has multiple reporting units with goodwill, each must be tested separately. The identification of reporting units requires judgment and must be documented.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Qualitative Assessment (Step Zero - Optional)</h3>
        <p>Before performing quantitative testing, entities may conduct a <b>qualitative assessment</b> (also called Step Zero) to determine whether it is more likely than not that the fair value of a reporting unit is less than its carrying amount. This assessment considers: <b>Macroeconomic conditions</b>—industry and market trends, interest rates, economic outlook. <b>Industry conditions</b>—competition, regulatory changes, technological obsolescence. <b>Entity-specific factors</b>—changes in management, strategy, or key personnel. <b>Financial performance</b>—revenue trends, profitability, cash flows. <b>Market capitalization</b>—if publicly traded, comparison of market cap to book value. <b>Events and circumstances</b>—litigation, loss of key customers, significant changes in business. If the qualitative assessment indicates it is <b>not</b> more likely than not that fair value is less than carrying value, quantitative testing is not required. Otherwise, quantitative testing must be performed.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Quantitative Testing: Single-Step Test (Current Method)</h3>
        <p>Under current US GAAP (ASC 350, as amended by ASU 2017-04), goodwill impairment testing uses a <b>single-step test</b>: Compare the fair value of the reporting unit to its carrying amount (including goodwill). If the fair value is greater than or equal to the carrying amount, no impairment exists. If the carrying amount exceeds the fair value, recognize an impairment loss equal to the difference, but not to exceed the carrying amount of goodwill allocated to that reporting unit. This simplified approach reduces complexity and cost compared to the previous two-step test, while still providing useful information to financial statement users.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Historical Two-Step Test (Prior Method)</h3>
        <p>Prior to 2017, US GAAP required a <b>two-step test</b>: <b>Step 1</b>—Compare reporting unit fair value to carrying amount. If fair value {'<'} carrying amount, proceed to Step 2. <b>Step 2</b>—Calculate implied fair value of goodwill by allocating the reporting unit's fair value to all assets and liabilities (including unrecognized intangibles). Compare implied fair value of goodwill to carrying amount. Impairment loss = carrying amount - implied fair value. This method was more complex and costly, leading to the FASB's simplification. However, understanding the two-step test helps explain the conceptual basis for impairment testing.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impairment Loss Calculation</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Impairment Loss = Carrying Value - Fair Value</strong></p>
          <p className="text-sm mt-2">(where Carrying Value {'>'} Fair Value, and loss limited to goodwill amount)</p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Determining Fair Value of Reporting Unit</h3>
        <p>The fair value of a reporting unit is typically determined using valuation techniques such as: <b>Discounted Cash Flow (DCF) Analysis</b>—estimates the present value of expected future cash flows. This requires projections of revenues, expenses, capital expenditures, and terminal value. Discount rate should reflect the reporting unit's risk profile (often using WACC). <b>Market Approach</b>—uses market multiples from comparable publicly traded companies or recent transactions. Common multiples include EV/Revenue, EV/EBITDA, P/E ratios. <b>Guideline Public Company Method</b>—applies multiples from similar public companies. <b>Guideline Transaction Method</b>—uses multiples from recent M&A transactions. <b>Combined Approach</b>—often, a combination of methods is used, with results weighted based on reliability and relevance. The selection of valuation technique requires significant judgment and professional expertise.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Impairment Loss Recognition</h3>
        <p>When impairment is identified: <b>Calculate the impairment loss</b> as the excess of carrying amount over fair value. <b>Limit the loss</b> to the amount of goodwill allocated to the reporting unit (cannot impair assets other than goodwill in this test). <b>Recognize the loss</b> as an expense in the income statement (typically as a separate line item or in operating expenses). <b>Reduce goodwill</b> on the balance sheet by the impairment amount. <b>Disclose the impairment</b> in financial statements, including the amount, reporting unit affected, and factors contributing to impairment. The impairment loss is a <b>non-cash charge</b> (does not affect cash flow directly) but reduces reported earnings and shareholders' equity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Impairment Percentage</h3>
        <p>The <b>impairment percentage</b> (impairment loss / carrying value × 100) provides insight into the severity of the impairment. <b>Severe impairment</b> ({'>'}50%)—indicates that more than half of goodwill value has been lost, suggesting fundamental issues with the acquisition or business performance. <b>Significant impairment</b> (25-50%)—suggests meaningful deterioration in value, requiring review of business strategy. <b>Moderate impairment</b> ({'<'}25%)—may indicate normal business fluctuations or minor overvaluation. The impairment percentage helps assess the impact on financial statements and may signal the need for strategic actions.</p>

        <hr className="my-6" />

        <h2 id="indicators" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impairment Indicators and Triggers</h2>
        <p>While goodwill must be tested annually, it should also be tested more frequently if events or circumstances indicate that impairment may have occurred. Recognizing these indicators early allows for timely testing and accurate financial reporting.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Macroeconomic Indicators</h3>
        <p>External factors that may trigger impairment testing include: <b>Significant decline in market capitalization</b>—for publicly traded companies, if market cap falls significantly below book value. <b>Industry downturn</b>—adverse changes in industry conditions, increased competition, or regulatory changes. <b>Economic recession</b>—broad economic decline affecting the business's market. <b>Interest rate changes</b>—significant increases affecting discount rates and fair value. <b>Currency fluctuations</b>—for multinational companies, adverse currency movements. <b>Regulatory changes</b>—new regulations that negatively impact the business model. These external factors may reduce the fair value of reporting units even if internal performance is stable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Entity-Specific Indicators</h3>
        <p>Internal factors that may indicate impairment include: <b>Operating performance deterioration</b>—declining revenues, margins, or profitability. <b>Negative cash flows</b>—operating cash flows turn negative or decline significantly. <b>Loss of key customers</b>—departure of major customers or contracts. <b>Management changes</b>—departure of key executives or management team. <b>Litigation or claims</b>—significant legal issues affecting the business. <b>Product obsolescence</b>—technological changes making products or services obsolete. <b>Loss of competitive position</b>—declining market share or competitive advantages. <b>Asset disposals</b>—plans to dispose of a reporting unit or significant portion of its assets. These indicators suggest that the value expected from the acquisition may not be realized.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Testing Frequency</h3>
        <p>While annual testing is required, entities should perform additional testing when: <b>Triggering events occur</b>—any of the indicators above suggest potential impairment. <b>Significant changes in business</b>—major restructuring, divestitures, or changes in strategy. <b>Market conditions change rapidly</b>—sudden shifts in industry or economy. <b>Reporting unit is being disposed</b>—testing may be required before disposal. Entities should establish processes to monitor for impairment indicators throughout the year, not just at the annual testing date. Documentation of monitoring activities and rationale for testing (or not testing) is important for audit purposes.</p>

        <hr className="my-6" />

        <h2 id="accounting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accounting Treatment and Financial Impact</h2>
        <p>Goodwill impairment has significant accounting and financial reporting implications that affect the income statement, balance sheet, and financial ratios.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Income Statement Impact</h3>
        <p>Goodwill impairment losses are recognized as <b>expenses</b> in the income statement, reducing: <b>Net income</b>—impairment reduces net income by the full amount of the loss. <b>Earnings per share (EPS)</b>—reduces both basic and diluted EPS. <b>Operating income</b>—if reported as operating expense, reduces operating income. The impairment loss is typically reported as a separate line item or included in operating expenses, depending on the company's presentation. Because impairment is a <b>non-cash charge</b>, it does not affect operating cash flow, but it does reduce reported earnings. This can impact: stock price (negative signal to investors), debt covenants (may violate earnings-based covenants), management compensation (if tied to earnings), and analyst coverage (may trigger downgrades).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Balance Sheet Impact</h3>
        <p>On the balance sheet, goodwill impairment: <b>Reduces goodwill</b>—the carrying value of goodwill is reduced by the impairment amount. <b>Reduces total assets</b>—lower assets on the balance sheet. <b>Reduces shareholders' equity</b>—through retained earnings (since net income is reduced). <b>Affects financial ratios</b>—asset turnover, return on assets (ROA), debt-to-equity, and other ratios may change. The reduced goodwill amount becomes the new carrying value, and future impairment tests compare fair value to this reduced amount. Once impaired, goodwill cannot be written back up (impairments cannot be reversed under US GAAP), so the reduction is permanent unless the reporting unit is disposed of.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Disclosure Requirements</h3>
        <p>Entities must disclose significant information about goodwill impairment, including: <b>Amount of impairment loss</b>—total impairment recognized in the period. <b>Reporting units affected</b>—which reporting units experienced impairment. <b>Fair value measurement</b>—description of how fair value was determined (valuation technique, key assumptions). <b>Carrying amount of goodwill</b>—by reporting unit, before and after impairment. <b>Factors contributing to impairment</b>—explanation of events or circumstances that led to impairment. <b>Qualitative assessment</b>—if qualitative assessment was performed, description of factors considered. These disclosures provide transparency and help users understand the nature and cause of impairment. Entities should prepare clear, informative disclosures that explain the impairment without being overly technical.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Reversal of Impairment</h3>
        <p>Under <b>US GAAP (ASC 350)</b>, goodwill impairment losses <b>cannot be reversed</b> once recognized, even if the fair value of the reporting unit subsequently increases. This is different from other assets where reversals may be permitted under certain circumstances. Under <b>IFRS (IAS 36)</b>, reversals of goodwill impairment are also generally not permitted. The rationale is that goodwill is inherently uncertain and subjective, and allowing reversals could lead to earnings management. Once impaired, goodwill remains at the reduced carrying value unless: the reporting unit is disposed of (goodwill is derecognized), or the reporting unit's goodwill is reallocated (if reporting units are reorganized). This permanent reduction emphasizes the importance of accurate initial valuations and careful monitoring for impairment indicators.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Goodwill impairment testing is a critical ongoing requirement for companies with goodwill on their balance sheets. Impairment occurs when carrying value exceeds fair value, requiring recognition of impairment losses that reduce earnings. Regular testing, proper fair value measurement, and monitoring for impairment indicators are essential for compliance with accounting standards and accurate financial reporting.</p>
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
          <p>This tool calculates goodwill impairment by comparing carrying value to fair value and determining impairment loss.</p>
          <p>Outputs include impairment loss, impairment percentage, remaining carrying value, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


