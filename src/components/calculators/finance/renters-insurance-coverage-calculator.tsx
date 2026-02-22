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
  personalPropertyValue: z.number({ invalid_type_error: 'Enter personal property value' }).min(0),
  liabilityCoverage: z.number({ invalid_type_error: 'Enter liability coverage' }).min(0).optional(),
  additionalLivingExpenses: z.number({ invalid_type_error: 'Enter additional living expenses' }).min(0).optional(),
  existingRentersInsurance: z.number({ invalid_type_error: 'Enter existing insurance' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  personalPropertyValue: number;
  liabilityCoverage: number;
  additionalLivingExpenses: number;
  existingRentersInsurance: number;
  recommendedPersonalPropertyCoverage: number;
  recommendedLiabilityCoverage: number;
  recommendedAdditionalLivingExpenses: number;
  totalRecommendedCoverage: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter personal property value (total value of belongings).',
  'Optionally enter desired liability coverage (typically $100,000-300,000).',
  'Optionally enter additional living expenses coverage (typically $5,000-20,000).',
  'Optionally enter existing renters insurance coverage.',
  'Review recommended personal property, liability, and additional living expenses coverage.',
];

const faqs = [
  {
    question: 'What is renters insurance?',
    answer:
      'Renters insurance protects your personal property (belongings) and provides liability coverage if you rent a home or apartment. It covers damage from fire, theft, storms, and other perils, as well as liability if someone is injured in your rental.',
  },
  {
    question: 'Do I need renters insurance?',
    answer:
      'While not always required by law, renters insurance is highly recommended. Your landlord\'s insurance covers the building, not your belongings. Renters insurance protects your personal property and provides liability coverage at relatively low cost.',
  },
  {
    question: 'How much personal property coverage do I need?',
    answer:
      'Personal property coverage should equal the total value of your belongings. Create a home inventory to estimate value. Typical coverage is $20,000-50,000, but can be higher for valuable belongings. Consider replacement cost vs actual cash value coverage.',
  },
  {
    question: 'What is replacement cost vs actual cash value?',
    answer:
      'Replacement cost coverage pays to replace items at current prices. Actual cash value (ACV) pays depreciated value (replacement cost minus depreciation). Replacement cost is better but costs more. ACV is cheaper but may not fully replace items.',
  },
  {
    question: 'How much liability coverage do I need?',
    answer:
      'Liability coverage protects if someone is injured in your rental or you cause damage. Standard coverage is $100,000, but consider $300,000-500,000 for better protection. Umbrella insurance can provide additional coverage above renters limits.',
  },
  {
    question: 'What are additional living expenses?',
    answer:
      'Additional living expenses (ALE) coverage pays for temporary housing if your rental becomes uninhabitable (e.g., fire, water damage). Typically $5,000-20,000 or 10-20% of personal property coverage. Covers hotel, meals, and other expenses.',
  },
  {
    question: 'How do I estimate personal property value?',
    answer:
      'Create a home inventory: list all belongings with purchase prices or current values. Include: furniture, electronics, appliances, clothing, jewelry, sports equipment, and other valuables. Total the values to estimate coverage needed.',
  },
  {
    question: 'What does renters insurance cover?',
    answer:
      'Renters insurance covers: personal property (belongings) from theft, fire, storms, and other perils; liability if someone is injured in your rental; additional living expenses if rental is uninhabitable; and medical payments for guests injured in your rental.',
  },
  {
    question: 'What doesn\'t renters insurance cover?',
    answer:
      'Renters insurance typically doesn\'t cover: floods (need separate flood insurance), earthquakes (need separate earthquake insurance), intentional damage, normal wear and tear, or damage from pests. Review policy exclusions carefully.',
  },
  {
    question: 'How much does renters insurance cost?',
    answer:
      'Renters insurance is relatively inexpensive: typically $15-30/month ($180-360/year) for $20,000-50,000 in personal property coverage. Cost varies by location, coverage amount, deductible, and insurer. Compare quotes from multiple insurers.',
  },
];

const relatedCalculators = [
  {
    name: 'Homeowners Insurance Coverage Estimator',
    slug: 'homeowners-insurance-coverage-estimator',
    description: 'Calculate homeowners insurance coverage needs.',
  },
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund requirements.',
  },
  {
    name: 'Net Worth Calculator',
    slug: 'net-worth-calculator',
    description: 'Calculate total net worth.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/renters-insurance-coverage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Renters Insurance Coverage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Renters Insurance Coverage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate renters insurance coverage needs including personal property, liability, and additional living expenses coverage.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const personalPropertyValue = values.personalPropertyValue;
  const liabilityCoverage = values.liabilityCoverage || 100000; // Default: $100,000
  const additionalLivingExpenses = values.additionalLivingExpenses || personalPropertyValue * 0.1; // Default: 10% of personal property
  const existingRentersInsurance = values.existingRentersInsurance || 0;

  // Recommended personal property coverage (should equal value of belongings)
  const recommendedPersonalPropertyCoverage = personalPropertyValue;

  // Recommended liability coverage (standard is $100,000, but $300,000-500,000 is better)
  const recommendedLiabilityCoverage = Math.max(liabilityCoverage, 100000);

  // Recommended additional living expenses (typically 10-20% of personal property)
  const recommendedAdditionalLivingExpenses = Math.max(additionalLivingExpenses, personalPropertyValue * 0.1);

  // Total recommended coverage (personal property + ALE, liability is separate)
  const totalRecommendedCoverage = recommendedPersonalPropertyCoverage + recommendedAdditionalLivingExpenses;

  // Coverage gap (personal property + ALE)
  const coverageGap = Math.max(0, totalRecommendedCoverage - existingRentersInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Renters insurance coverage calculated. Recommended coverage should protect personal property, provide liability protection, and cover additional living expenses if rental becomes uninhabitable.';

  const coverageRatio = existingRentersInsurance > 0 ? (existingRentersInsurance / totalRecommendedCoverage) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing renters insurance coverage meets or exceeds recommended needs. Review coverage periodically as personal property value changes.';
  } else if (coverageRatio >= 80) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet recommended amount, or review if current coverage is adequate.';
  } else if (coverageRatio >= 50) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet recommended amount for adequate protection of belongings and liability.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to recommended needs. Significant additional coverage recommended to adequately protect personal property and provide liability protection.';
  }

  const recommendations = [
    `Personal property coverage: ${recommendedPersonalPropertyCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended to cover total value of belongings. Create a home inventory to estimate actual value. Consider replacement cost coverage (pays current prices) vs actual cash value (pays depreciated value).`,
    `Liability coverage: ${recommendedLiabilityCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended. Standard is $100,000, but $300,000-500,000 provides better protection. Consider umbrella insurance for additional coverage above renters limits.`,
    `Additional living expenses: ${recommendedAdditionalLivingExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended (typically 10-20% of personal property coverage). This covers temporary housing, meals, and other expenses if your rental becomes uninhabitable.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Coverage gap: ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} additional coverage needed for personal property and additional living expenses. Review policy to ensure adequate protection.`);
  }
  if (personalPropertyValue < 10000) {
    recommendations.push('Low personal property value: If your belongings are worth less than $10,000, consider whether renters insurance is cost-effective. However, liability coverage is still valuable even with minimal belongings.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate renters insurance needs: Personal Property ${recommendedPersonalPropertyCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}, Liability ${recommendedLiabilityCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}, ALE ${recommendedAdditionalLivingExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'}.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Review and obtain renters insurance coverage. Compare quotes from multiple insurers. Ensure coverage matches personal property value and includes adequate liability and additional living expenses coverage.' : 'Review existing policy to ensure it remains adequate. Update coverage as personal property value changes (new purchases, gifts, etc.).' },
    { label: 'Ongoing', detail: 'Review renters insurance annually or when: personal property value changes significantly, you move to a new rental, or circumstances change. Update home inventory regularly to ensure coverage matches actual value of belongings.' },
  ];

  return {
    personalPropertyValue,
    liabilityCoverage,
    additionalLivingExpenses,
    existingRentersInsurance,
    recommendedPersonalPropertyCoverage,
    recommendedLiabilityCoverage,
    recommendedAdditionalLivingExpenses,
    totalRecommendedCoverage,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RentersInsuranceCoverageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalPropertyValue: undefined,
      liabilityCoverage: undefined,
      additionalLivingExpenses: undefined,
      existingRentersInsurance: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="renters-insurance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Renters Insurance Coverage Calculator
          </CardTitle>
          <CardDescription>Calculate renters insurance coverage needs including personal property, liability, and additional living expenses coverage.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your information</CardTitle>
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
                  name="personalPropertyValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Property Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 30000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liabilityCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Liability Coverage ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalLivingExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Living Expenses ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingRentersInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Renters Insurance ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 25000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate coverage needs
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
            <CardDescription>See recommended personal property, liability, and additional living expenses coverage amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Personal Property</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedPersonalPropertyCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Liability Coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedLiabilityCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Additional Living Expenses</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedAdditionalLivingExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Gap</p>
                <p className={`text-2xl font-semibold ${result.coverageGap > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
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
            <strong>Recommended Personal Property Coverage</strong> = Personal Property Value. Should equal total value of belongings. Create home inventory to estimate actual value.
          </p>
          <p>
            <strong>Recommended Liability Coverage</strong> = Max(Desired Liability, $100,000). Standard is $100,000, but $300,000-500,000 provides better protection. Consider umbrella insurance for additional coverage.
          </p>
          <p>
            <strong>Recommended Additional Living Expenses</strong> = Max(Desired ALE, 10% of Personal Property Value). Typically 10-20% of personal property coverage. Covers temporary housing if rental becomes uninhabitable.
          </p>
          <p>
            <strong>Total Recommended Coverage</strong> = Personal Property Coverage + Additional Living Expenses. Liability coverage is separate and doesn't count toward this total.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Total Recommended Coverage - Existing Renters Insurance. Additional coverage needed for personal property and additional living expenses.
          </p>
          <p>Renters insurance should cover total value of personal property, provide adequate liability protection ($100,000-500,000), and cover additional living expenses (10-20% of personal property). Review coverage annually as property value changes.</p>
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
                <p className="text-sm text-muted-foreground">Total Recommended</p>
                <p className="text-xl font-semibold text-primary">{result.totalRecommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$ (property + ALE)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalRecommendedCoverage > 0 ? `${((result.existingRentersInsurance / result.totalRecommendedCoverage) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of recommended</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your information to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Renters Insurance: Calculating Coverage Needs" />
    <meta itemProp="description" content="A comprehensive guide to calculating renters insurance coverage needs including personal property, liability, and additional living expenses coverage." />
    <meta itemProp="keywords" content="renters insurance, personal property coverage, liability coverage, renters insurance cost, rental insurance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-renters-insurance-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Renters Insurance: Calculating Coverage Needs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating renters insurance coverage needs to protect your personal property and provide liability protection.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Renters Insurance?</a></li>
        <li><a href="#property" className="hover:underline">Personal Property Coverage</a></li>
        <li><a href="#liability" className="hover:underline">Liability Coverage</a></li>
        <li><a href="#ale" className="hover:underline">Additional Living Expenses</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Renters Insurance?</h2>
    <p><b>Renters insurance</b> protects your personal property (belongings) and provides liability coverage if you rent a home or apartment. It covers damage from fire, theft, storms, and other perils, as well as liability if someone is injured in your rental.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Renters insurance answers: "What if my belongings are stolen or damaged, or someone is injured in my rental?" Your landlord's insurance covers the building, not your belongings. Renters insurance protects your personal property and provides liability coverage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <ul>
        <li><b>Personal property coverage:</b> Protects your belongings</li>
        <li><b>Liability coverage:</b> Protects if someone is injured in your rental</li>
        <li><b>Additional living expenses:</b> Pays for temporary housing if rental is uninhabitable</li>
        <li><b>Medical payments:</b> Covers medical expenses for guests injured in your rental</li>
    </ul>

<hr />

    <h2 id="property" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Personal Property Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amount</h3>
    <p>Personal property coverage should equal the total value of your belongings. Create a home inventory to estimate value. Typical coverage is $20,000-50,000, but can be higher for valuable belongings.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Replacement Cost vs Actual Cash Value</h3>
    <p><b>Replacement cost coverage</b> pays to replace items at current prices. <b>Actual cash value (ACV)</b> pays depreciated value (replacement cost minus depreciation). Replacement cost is better but costs more. ACV is cheaper but may not fully replace items.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Home Inventory</h3>
    <p>Create a detailed home inventory listing all belongings with values. This helps estimate personal property value and provides documentation for claims. Include: furniture, electronics, appliances, clothing, jewelry, sports equipment, and other valuables.</p>

<hr />

    <h2 id="liability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Liability Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amount</h3>
    <p>Liability coverage protects if someone is injured in your rental or you cause damage. Standard coverage is $100,000, but consider $300,000-500,000 for better protection. Umbrella insurance can provide additional coverage above renters limits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What Liability Covers</h3>
    <p>Liability coverage protects: if someone is injured in your rental (slip and fall, etc.), if you accidentally damage someone else's property, legal defense costs, and medical payments for guests injured in your rental.</p>

<hr />

    <h2 id="ale" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Additional Living Expenses</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amount</h3>
    <p>Additional living expenses (ALE) coverage pays for temporary housing if your rental becomes uninhabitable (e.g., fire, water damage). Typically $5,000-20,000 or 10-20% of personal property coverage. Covers hotel, meals, and other expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When ALE Applies</h3>
    <p>ALE coverage applies when your rental is uninhabitable due to a covered peril (fire, water damage, etc.). It covers: temporary housing (hotel, apartment), meals (if eating out more than usual), and other expenses above normal living costs.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Renters insurance</b> should cover total value of personal property, provide adequate liability protection ($100,000-500,000), and cover additional living expenses (10-20% of personal property). Create a home inventory to estimate property value. Review coverage annually as property value changes. Renters insurance is relatively inexpensive ($15-30/month) and provides valuable protection.</p>
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
          <p>This tool calculates renters insurance coverage needs including personal property, liability, and additional living expenses coverage.</p>
          <p>Outputs include recommended personal property coverage, liability coverage, additional living expenses, total recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
