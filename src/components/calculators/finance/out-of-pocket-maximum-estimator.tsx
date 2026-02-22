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
  annualDeductible: z.number({ invalid_type_error: 'Enter annual deductible' }).min(0),
  coinsuranceRate: z.number({ invalid_type_error: 'Enter coinsurance rate' }).min(0).max(100).optional(),
  copayAmount: z.number({ invalid_type_error: 'Enter copay amount' }).min(0).optional(),
  expectedMedicalCosts: z.number({ invalid_type_error: 'Enter expected medical costs' }).min(0).optional(),
  monthlyIncome: z.number({ invalid_type_error: 'Enter monthly income' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  annualDeductible: number;
  coinsuranceRate: number;
  copayAmount: number;
  expectedMedicalCosts: number;
  monthlyIncome: number;
  estimatedOutOfPocket: number;
  outOfPocketMaximum: number;
  affordabilityPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter annual deductible (required).',
  'Optionally enter coinsurance rate (typically 20-30%) and copay amounts.',
  'Optionally enter expected medical costs for the year.',
  'Optionally enter monthly income to assess affordability.',
  'Review estimated out-of-pocket costs and out-of-pocket maximum.',
];

const faqs = [
  {
    question: 'What is out-of-pocket maximum?',
    answer:
      'Out-of-pocket maximum is the most you pay for covered healthcare services in a year (after premiums). Once you reach this limit, insurance pays 100% of covered costs. This protects against catastrophic medical expenses.',
  },
  {
    question: 'How is out-of-pocket maximum calculated?',
    answer:
      'Out-of-pocket maximum includes: deductibles, copays, and coinsurance. It does not include premiums. Once you reach the limit, insurance covers 100% of covered services. Limits vary by plan and are set by law (ACA limits).',
  },
  {
    question: 'What is the difference between deductible and out-of-pocket maximum?',
    answer:
      'Deductible is what you pay before insurance starts covering costs. Out-of-pocket maximum is the total you pay in a year (including deductible, copays, coinsurance). After reaching out-of-pocket maximum, insurance pays 100%.',
  },
  {
    question: 'What is coinsurance?',
    answer:
      'Coinsurance is the percentage you pay after meeting the deductible (typically 20-30%). For example, with 20% coinsurance, you pay 20% of costs and insurance pays 80% after the deductible is met.',
  },
  {
    question: 'What are ACA out-of-pocket maximum limits?',
    answer:
      'For 2024, ACA limits are: $9,450 for individual plans, $18,900 for family plans. These are maximumsâ€”many plans have lower limits. Limits increase annually with inflation.',
  },
  {
    question: 'How do I estimate my out-of-pocket costs?',
    answer:
      'Estimate as: Deductible + (Expected Costs - Deductible) Ã— Coinsurance Rate + Copays, up to the out-of-pocket maximum. If costs exceed the maximum, you only pay up to the maximum.',
  },
  {
    question: 'What if I don\'t use much healthcare?',
    answer:
      'If you don\'t use much healthcare, you may only pay premiums and occasional copays. You may not reach the deductible or out-of-pocket maximum. However, the maximum protects you if you have significant medical needs.',
  },
  {
    question: 'How does out-of-pocket maximum affect plan choice?',
    answer:
      'Lower out-of-pocket maximums provide better protection but typically have higher premiums. Higher maximums have lower premiums but higher potential costs. Balance based on expected medical needs and ability to pay.',
  },
  {
    question: 'What expenses count toward out-of-pocket maximum?',
    answer:
      'Counts toward maximum: deductibles, copays, coinsurance for covered services. Does not count: premiums, out-of-network costs (unless plan allows), non-covered services, or costs above allowed amounts.',
  },
  {
    question: 'Should I choose a plan with low out-of-pocket maximum?',
    answer:
      'Choose low out-of-pocket maximum if: you expect significant medical needs, want protection against high costs, or can afford higher premiums. Choose higher maximum if: you\'re healthy, want lower premiums, or can afford potential costs.',
  },
];

const relatedCalculators = [
  {
    name: 'Health Insurance Premium Affordability Calculator',
    slug: 'health-insurance-premium-affordability-calculator',
    description: 'Calculate health insurance affordability.',
  },
  {
    name: 'Critical Illness Insurance Benefit Calculator',
    slug: 'critical-illness-insurance-benefit-calculator',
    description: 'Calculate critical illness insurance needs.',
  },
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund requirements.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/out-of-pocket-maximum-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Out-of-Pocket Maximum Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Out-of-Pocket Maximum Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate out-of-pocket maximum costs and assess affordability based on deductible, coinsurance, copays, and expected medical costs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const annualDeductible = values.annualDeductible;
  const coinsuranceRate = values.coinsuranceRate || 20;
  const copayAmount = values.copayAmount || 0;
  const expectedMedicalCosts = values.expectedMedicalCosts || annualDeductible * 2;
  const monthlyIncome = values.monthlyIncome || 0;

  // Estimate out-of-pocket costs
  // If costs <= deductible: pay full costs
  // If costs > deductible: pay deductible + (costs - deductible) Ã— coinsurance rate + copays
  let estimatedOutOfPocket = 0;
  if (expectedMedicalCosts <= annualDeductible) {
    estimatedOutOfPocket = expectedMedicalCosts + copayAmount;
  } else {
    const costsAfterDeductible = expectedMedicalCosts - annualDeductible;
    estimatedOutOfPocket = annualDeductible + (costsAfterDeductible * coinsuranceRate / 100) + copayAmount;
  }

  // Out-of-pocket maximum (typically 2-3x deductible, but capped by ACA limits)
  // For estimation: use deductible Ã— 2.5 as typical ratio, but cap at ACA limit
  const acaLimit = 9450; // Individual plan limit for 2024
  const outOfPocketMaximum = Math.min(annualDeductible * 2.5, acaLimit);

  // Cap estimated costs at maximum
  const finalEstimatedOutOfPocket = Math.min(estimatedOutOfPocket, outOfPocketMaximum);

  // Affordability as percentage of income
  const annualIncome = monthlyIncome * 12;
  const affordabilityPercent = annualIncome > 0 ? (finalEstimatedOutOfPocket / annualIncome) * 100 : 0;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Out-of-pocket maximum estimated. This represents the most you might pay for covered healthcare services in a year (after premiums).';

  if (affordabilityPercent > 20) {
    status = 'low';
    interpretation = 'Out-of-pocket maximum exceeds 20% of income, which may be unaffordable. Consider plans with lower maximums, qualify for cost-sharing reductions, or ensure adequate savings to cover potential costs.';
  } else if (affordabilityPercent > 10) {
    status = 'moderate';
    interpretation = 'Out-of-pocket maximum is 10-20% of income, which may be challenging. Ensure you have savings or emergency fund to cover potential costs if medical care is needed.';
  } else if (affordabilityPercent <= 5) {
    status = 'optimal';
    interpretation = 'Out-of-pocket maximum is 5% or less of income, which is very affordable. Ensure you can also afford premiums and have adequate coverage.';
  } else {
    status = 'good';
    interpretation = 'Out-of-pocket maximum is 5-10% of income, which is reasonable. Review total healthcare costs including premiums to ensure full affordability.';
  }

  const recommendations = [
    `Estimated out-of-pocket costs: ${finalEstimatedOutOfPocket.toLocaleString(undefined, { maximumFractionDigits: 0 })} based on expected medical costs of ${expectedMedicalCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This includes deductible (${annualDeductible.toLocaleString(undefined, { maximumFractionDigits: 0 })}), coinsurance (${coinsuranceRate}%), and copays.`,
    `Out-of-pocket maximum: ${outOfPocketMaximum.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This is the most you pay for covered services in a year. Once reached, insurance pays 100% of covered costs.`,
    `Affordability: ${affordabilityPercent > 0 ? `${affordabilityPercent.toFixed(1)}% of income` : 'Enter income to assess affordability'}. ${affordabilityPercent > 10 ? 'This may be challengingâ€”ensure you have savings to cover potential costs.' : 'This is reasonable, but ensure you can afford if medical care is needed.'}`,
  ];
  if (finalEstimatedOutOfPocket >= outOfPocketMaximum) {
    recommendations.push('Maximum reached: Estimated costs reach the out-of-pocket maximum. You would pay the maximum amount, and insurance would cover all additional costs beyond that.');
  }
  if (annualDeductible > 0 && expectedMedicalCosts < annualDeductible) {
    recommendations.push('Below deductible: Expected costs are below the deductible, so you would pay full costs. Consider whether you can afford the deductible if medical needs arise.');
  }

  const plan = [
    { label: 'This Week', detail: `Estimate out-of-pocket costs: ${finalEstimatedOutOfPocket.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Out-of-pocket maximum: ${outOfPocketMaximum.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Assess affordability.` },
    { label: 'This Month', detail: 'Review plan options considering out-of-pocket maximums. Lower maximums provide better protection but typically have higher premiums. Ensure you can afford the maximum if medical care is needed.' },
    { label: 'Ongoing', detail: 'Monitor healthcare costs and track spending toward out-of-pocket maximum. Review plan options annually during open enrollment. Ensure emergency fund can cover out-of-pocket maximum if needed.' },
  ];

  return {
    annualDeductible,
    coinsuranceRate,
    copayAmount,
    expectedMedicalCosts,
    monthlyIncome,
    estimatedOutOfPocket: finalEstimatedOutOfPocket,
    outOfPocketMaximum,
    affordabilityPercent,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function OutOfPocketMaximumEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualDeductible: undefined,
      coinsuranceRate: undefined,
      copayAmount: undefined,
      expectedMedicalCosts: undefined,
      monthlyIncome: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="out-of-pocket-maximum-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Out-of-Pocket Maximum Estimator
          </CardTitle>
          <CardDescription>Estimate out-of-pocket maximum costs and assess affordability based on deductible, coinsurance, copays, and expected medical costs.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your plan details</CardTitle>
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
                  name="annualDeductible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Deductible ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coinsuranceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coinsurance Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="copayAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Copay Amount ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedMedicalCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Medical Costs ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8333" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate out-of-pocket costs
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
            <CardDescription>See estimated out-of-pocket costs, out-of-pocket maximum, and affordability assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated Out-of-Pocket</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedOutOfPocket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Out-of-Pocket Maximum</p>
                <p className="text-2xl font-semibold text-primary">{result.outOfPocketMaximum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Affordability</p>
                <p className={`text-2xl font-semibold ${result.affordabilityPercent > 20 ? 'text-red-600' : result.affordabilityPercent > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.affordabilityPercent > 0 ? `${result.affordabilityPercent.toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of income</p>
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
            <strong>If Costs â‰¤ Deductible:</strong> Out-of-Pocket = Costs + Copays. You pay full costs until deductible is met.
          </p>
          <p>
            <strong>If Costs &gt; Deductible:</strong> Out-of-Pocket = Deductible + (Costs - Deductible) Ã— Coinsurance Rate + Copays. After deductible, you pay coinsurance percentage.
          </p>
          <p>
            <strong>Out-of-Pocket Maximum:</strong> Typically 2-3Ã— deductible, capped by ACA limits ($9,450 individual, $18,900 family for 2024). This is the most you pay in a year.
          </p>
          <p>
            <strong>Estimated Costs (Capped):</strong> Min(Estimated Out-of-Pocket, Out-of-Pocket Maximum). Once maximum is reached, insurance pays 100%.
          </p>
          <p>
            <strong>Affordability %:</strong> (Estimated Out-of-Pocket / Annual Income) Ã— 100. Should ideally be â‰¤ 10% of income.
          </p>
          <p>Out-of-pocket maximum is the most you pay for covered healthcare services in a year (after premiums). It includes deductibles, copays, and coinsurance. Once reached, insurance pays 100% of covered costs.</p>
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
                <p className="text-sm text-muted-foreground">Costs After Deductible</p>
                <p className="text-xl font-semibold text-primary">
                  {result.expectedMedicalCosts > result.annualDeductible ? (result.expectedMedicalCosts - result.annualDeductible).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coinsurance Amount</p>
                <p className="text-xl font-semibold text-primary">
                  {result.expectedMedicalCosts > result.annualDeductible ? ((result.expectedMedicalCosts - result.annualDeductible) * result.coinsuranceRate / 100).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">% of Maximum</p>
                <p className="text-xl font-semibold text-primary">
                  {result.outOfPocketMaximum > 0 ? `${((result.estimatedOutOfPocket / result.outOfPocketMaximum) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of maximum</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your plan details to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Out-of-Pocket Maximum: Estimating Healthcare Costs" />
    <meta itemProp="description" content="A comprehensive guide to estimating out-of-pocket maximum costs and assessing affordability based on deductible, coinsurance, copays, and expected medical costs." />
    <meta itemProp="keywords" content="out-of-pocket maximum, healthcare costs, deductible, coinsurance, copay, health insurance costs" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-out-of-pocket-maximum-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Out-of-Pocket Maximum: Estimating Healthcare Costs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to estimating out-of-pocket maximum costs and assessing affordability for healthcare expenses.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Out-of-Pocket Maximum?</a></li>
        <li><a href="#calculation" className="hover:underline">Out-of-Pocket Cost Calculation</a></li>
        <li><a href="#components" className="hover:underline">Components: Deductible, Coinsurance, Copays</a></li>
        <li><a href="#affordability" className="hover:underline">Assessing Affordability</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Out-of-Pocket Maximum?</h2>
    <p><b>Out-of-pocket maximum</b> is the most you pay for covered healthcare services in a year (after premiums). Once you reach this limit, insurance pays 100% of covered costs. This protects against catastrophic medical expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Out-of-pocket maximum answers: "What's the most I might pay for healthcare in a year?" It includes deductibles, copays, and coinsurance, but not premiums. Once reached, insurance covers all additional covered costs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Features</h3>
    <ul>
        <li><b>Annual limit:</b> Resets each calendar year</li>
        <li><b>Includes:</b> Deductibles, copays, coinsurance</li>
        <li><b>Excludes:</b> Premiums, out-of-network costs (unless allowed), non-covered services</li>
        <li><b>Protection:</b> Caps your financial exposure to medical costs</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Out-of-Pocket Cost Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>If Costs â‰¤ Deductible: Out-of-Pocket = Costs + Copays</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>If Costs &gt; Deductible: Out-of-Pocket = Deductible + (Costs - Deductible) Ã— Coinsurance + Copays</b></p>
    </div>
    <p>Out-of-pocket costs are capped at the out-of-pocket maximum. Once reached, insurance pays 100% of covered costs.</p>

<hr />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Components: Deductible, Coinsurance, Copays</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Deductible</h3>
    <p>Deductible is what you pay before insurance starts covering costs. You pay full costs until the deductible is met. Higher deductibles typically mean lower premiums.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Coinsurance</h3>
    <p>Coinsurance is the percentage you pay after meeting the deductible (typically 20-30%). For example, with 20% coinsurance, you pay 20% of costs and insurance pays 80% after the deductible.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Copays</h3>
    <p>Copays are fixed amounts you pay for specific services (e.g., $25 for doctor visits). Copays typically count toward the deductible and out-of-pocket maximum.</p>

<hr />

    <h2 id="affordability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Assessing Affordability</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Affordability Guidelines</h3>
    <ul>
        <li><b>Optimal:</b> Out-of-pocket maximum â‰¤ 5% of income</li>
        <li><b>Good:</b> Out-of-pocket maximum 5-10% of income</li>
        <li><b>Moderate:</b> Out-of-pocket maximum 10-20% of income (may be challenging)</li>
        <li><b>Low:</b> Out-of-pocket maximum {'>'} 20% of income (may be unaffordable)</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Planning for Costs</h3>
    <p>Ensure you have savings or emergency fund to cover the out-of-pocket maximum if medical care is needed. Consider plans with lower maximums if you expect significant medical needs or have limited savings.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Out-of-pocket maximum</b> is the most you pay for covered healthcare services in a year. Calculate as deductible + coinsurance + copays, capped at the maximum. Assess affordability relative to income and ensure you can afford the maximum if medical care is needed. Review plan options considering both premiums and out-of-pocket maximums.</p>
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
          <p>This tool estimates out-of-pocket maximum costs and assesses affordability based on deductible, coinsurance, copays, and expected medical costs.</p>
          <p>Outputs include estimated out-of-pocket costs, out-of-pocket maximum, affordability percentage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
