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
  homeValue: z.number({ invalid_type_error: 'Enter home value' }).min(0),
  replacementCost: z.number({ invalid_type_error: 'Enter replacement cost' }).min(0).optional(),
  personalPropertyValue: z.number({ invalid_type_error: 'Enter personal property value' }).min(0).optional(),
  liabilityCoverage: z.number({ invalid_type_error: 'Enter liability coverage' }).min(0).optional(),
  existingHomeownersInsurance: z.number({ invalid_type_error: 'Enter existing insurance' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  homeValue: number;
  replacementCost: number;
  personalPropertyValue: number;
  liabilityCoverage: number;
  existingHomeownersInsurance: number;
  recommendedDwellingCoverage: number;
  recommendedPersonalPropertyCoverage: number;
  recommendedLiabilityCoverage: number;
  totalRecommendedCoverage: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter home value (market value or purchase price).',
  'Optionally enter replacement cost (cost to rebuild home).',
  'Optionally enter personal property value and desired liability coverage.',
  'Optionally enter existing homeowners insurance coverage.',
  'Review recommended dwelling, personal property, and liability coverage amounts.',
];

const faqs = [
  {
    question: 'What is homeowners insurance?',
    answer:
      'Homeowners insurance protects your home, personal property, and provides liability coverage. It covers damage from fire, theft, storms, and other perils, as well as liability if someone is injured on your property.',
  },
  {
    question: 'How much dwelling coverage do I need?',
    answer:
      'Dwelling coverage should equal the replacement cost to rebuild your home (not market value). Replacement cost is typically 80-100% of home value, but can be higher in some areas. Use replacement cost, not market value.',
  },
  {
    question: 'What is replacement cost vs market value?',
    answer:
      'Market value is what you could sell your home for (includes land value). Replacement cost is what it costs to rebuild the home (materials and labor, excluding land). Insurance should cover replacement cost, not market value.',
  },
  {
    question: 'How much personal property coverage do I need?',
    answer:
      'Personal property coverage is typically 50-70% of dwelling coverage. For example, if dwelling coverage is $300,000, personal property coverage might be $150,000-210,000. Create a home inventory to estimate actual value.',
  },
  {
    question: 'How much liability coverage do I need?',
    answer:
      'Liability coverage protects if someone is injured on your property or you cause damage. Standard coverage is $100,000-300,000, but consider $300,000-500,000 for better protection. Umbrella insurance can provide additional coverage.',
  },
  {
    question: 'What about additional living expenses?',
    answer:
      'Additional living expenses (ALE) coverage pays for temporary housing if your home is uninhabitable. Typically 10-20% of dwelling coverage. For $300,000 dwelling, ALE might be $30,000-60,000.',
  },
  {
    question: 'What is the 80% rule?',
    answer:
      'The 80% rule states you should insure your home for at least 80% of replacement cost to receive full coverage for partial losses. If insured for less than 80%, you may receive reduced payments for claims.',
  },
  {
    question: 'How do I calculate replacement cost?',
    answer:
      'Replacement cost = Square footage × Cost per square foot to rebuild in your area. Cost per square foot varies by location ($100-300+). Get estimates from contractors or use online calculators. Don\'t include land value.',
  },
  {
    question: 'What about flood and earthquake insurance?',
    answer:
      'Standard homeowners insurance doesn\'t cover floods or earthquakes. You need separate policies: flood insurance (FEMA National Flood Insurance Program) and earthquake insurance. Consider these if you live in high-risk areas.',
  },
  {
    question: 'How often should I review coverage?',
    answer:
      'Review homeowners insurance annually or when: home value changes, renovations are made, personal property value changes, or market conditions change. Replacement costs increase with inflation and construction costs.',
  },
];

const relatedCalculators = [
  {
    name: 'Renters Insurance Coverage Calculator',
    slug: 'renters-insurance-coverage-calculator',
    description: 'Calculate renters insurance coverage needs.',
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

const baseUrl = 'https://mycalculating.com/category/finance/homeowners-insurance-coverage-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Homeowners Insurance Coverage Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Homeowners Insurance Coverage Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate homeowners insurance coverage needs including dwelling, personal property, and liability coverage based on home value and replacement cost.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const homeValue = values.homeValue;
  const replacementCost = values.replacementCost || homeValue * 0.9; // Default: 90% of home value (excluding land)
  const personalPropertyValue = values.personalPropertyValue || replacementCost * 0.6; // Default: 60% of dwelling
  const liabilityCoverage = values.liabilityCoverage || 300000; // Default: $300,000
  const existingHomeownersInsurance = values.existingHomeownersInsurance || 0;

  // Recommended dwelling coverage (replacement cost, at least 80% for full coverage)
  const recommendedDwellingCoverage = Math.max(replacementCost, homeValue * 0.8);

  // Recommended personal property coverage (typically 50-70% of dwelling)
  const recommendedPersonalPropertyCoverage = Math.max(personalPropertyValue, recommendedDwellingCoverage * 0.5);

  // Recommended liability coverage (standard is $100,000-300,000, but $300,000-500,000 is better)
  const recommendedLiabilityCoverage = Math.max(liabilityCoverage, 300000);

  // Total recommended coverage (dwelling + personal property, liability is separate)
  const totalRecommendedCoverage = recommendedDwellingCoverage + recommendedPersonalPropertyCoverage;

  // Coverage gap (dwelling + personal property)
  const coverageGap = Math.max(0, totalRecommendedCoverage - existingHomeownersInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Homeowners insurance coverage calculated. Recommended coverage should protect dwelling, personal property, and provide adequate liability protection.';

  const coverageRatio = existingHomeownersInsurance > 0 ? (existingHomeownersInsurance / totalRecommendedCoverage) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing homeowners insurance coverage meets or exceeds recommended needs. Review coverage periodically as home value and replacement costs change.';
  } else if (coverageRatio >= 80) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet recommended amount, or review if current coverage is adequate.';
  } else if (coverageRatio >= 50) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet recommended amount for adequate protection of home and property.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to recommended needs. Significant additional coverage recommended to adequately protect dwelling, personal property, and provide liability protection.';
  }

  const recommendations = [
    `Dwelling coverage: ${recommendedDwellingCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} (replacement cost to rebuild home). This should equal replacement cost, not market value. Ensure at least 80% of replacement cost to receive full coverage for partial losses.`,
    `Personal property coverage: ${recommendedPersonalPropertyCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} (typically 50-70% of dwelling coverage). Create a home inventory to estimate actual value of belongings.`,
    `Liability coverage: ${recommendedLiabilityCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended. Standard is $100,000-300,000, but $300,000-500,000 provides better protection. Consider umbrella insurance for additional coverage.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Coverage gap: ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} additional coverage needed for dwelling and personal property. Review policy to ensure adequate protection.`);
  }
  if (replacementCost < homeValue * 0.8) {
    recommendations.push('Replacement cost consideration: Replacement cost appears low relative to home value. Verify replacement cost estimates—it should reflect cost to rebuild, not market value (which includes land).');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate homeowners insurance needs: Dwelling ${recommendedDwellingCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}, Personal Property ${recommendedPersonalPropertyCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}, Liability ${recommendedLiabilityCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'}.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Review and update homeowners insurance policy. Compare quotes from multiple insurers. Ensure coverage matches replacement cost (not market value) and includes adequate personal property and liability coverage.' : 'Review existing policy to ensure it remains adequate. Update coverage as home value, replacement costs, and personal property value change.' },
    { label: 'Ongoing', detail: 'Review homeowners insurance annually or when: home value changes, renovations are made, personal property value changes, or market conditions change. Replacement costs increase with inflation and construction costs.' },
  ];

  return {
    homeValue,
    replacementCost,
    personalPropertyValue,
    liabilityCoverage,
    existingHomeownersInsurance,
    recommendedDwellingCoverage,
    recommendedPersonalPropertyCoverage,
    recommendedLiabilityCoverage,
    totalRecommendedCoverage,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function HomeownersInsuranceCoverageEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homeValue: undefined,
      replacementCost: undefined,
      personalPropertyValue: undefined,
      liabilityCoverage: undefined,
      existingHomeownersInsurance: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="homeowners-insurance-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Homeowners Insurance Coverage Estimator
          </CardTitle>
          <CardDescription>Calculate homeowners insurance coverage needs including dwelling, personal property, and liability coverage based on home value and replacement cost.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your home information</CardTitle>
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
                  name="homeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 400000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="replacementCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Replacement Cost ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 360000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalPropertyValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Property Value ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.01" placeholder="e.g., 300000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingHomeownersInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Homeowners Insurance ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See recommended dwelling, personal property, and liability coverage amounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dwelling Coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedDwellingCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
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
            <strong>Recommended Dwelling Coverage</strong> = Max(Replacement Cost, 80% of Home Value). Should equal replacement cost to rebuild home (not market value). At least 80% ensures full coverage for partial losses.
          </p>
          <p>
            <strong>Recommended Personal Property Coverage</strong> = Max(Personal Property Value, 50% of Dwelling Coverage). Typically 50-70% of dwelling coverage. Create home inventory to estimate actual value.
          </p>
          <p>
            <strong>Recommended Liability Coverage</strong> = Max(Desired Liability, $300,000). Standard is $100,000-300,000, but $300,000-500,000 provides better protection. Consider umbrella insurance for additional coverage.
          </p>
          <p>
            <strong>Total Recommended Coverage</strong> = Dwelling Coverage + Personal Property Coverage. Liability coverage is separate and doesn't count toward this total.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Total Recommended Coverage - Existing Homeowners Insurance. Additional coverage needed for dwelling and personal property.
          </p>
          <p>Homeowners insurance should cover replacement cost to rebuild your home (not market value), personal property value, and provide adequate liability protection. Review coverage annually as values change.</p>
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
                <p className="text-xs text-muted-foreground">$ (dwelling + property)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalRecommendedCoverage > 0 ? `${((result.existingHomeownersInsurance / result.totalRecommendedCoverage) * 100).toFixed(1)}%` : 'N/A'}
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
            <p className="text-sm text-muted-foreground">Enter your home information to see additional insights.</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Homeowners Insurance: Calculating Coverage Needs" />
    <meta itemProp="description" content="A comprehensive guide to calculating homeowners insurance coverage needs including dwelling, personal property, and liability coverage." />
    <meta itemProp="keywords" content="homeowners insurance, dwelling coverage, personal property coverage, liability coverage, home insurance, replacement cost" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-homeowners-insurance-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Homeowners Insurance: Calculating Coverage Needs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating homeowners insurance coverage needs to protect your home, personal property, and provide liability protection.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Homeowners Insurance?</a></li>
        <li><a href="#dwelling" className="hover:underline">Dwelling Coverage</a></li>
        <li><a href="#property" className="hover:underline">Personal Property Coverage</a></li>
        <li><a href="#liability" className="hover:underline">Liability Coverage</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Homeowners Insurance?</h2>
    <p><b>Homeowners insurance</b> protects your home, personal property, and provides liability coverage. It covers damage from fire, theft, storms, and other perils, as well as liability if someone is injured on your property.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <ul>
        <li><b>Dwelling coverage:</b> Protects the structure of your home</li>
        <li><b>Personal property coverage:</b> Protects your belongings</li>
        <li><b>Liability coverage:</b> Protects if someone is injured on your property</li>
        <li><b>Additional living expenses:</b> Pays for temporary housing if home is uninhabitable</li>
    </ul>

<hr />

    <h2 id="dwelling" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dwelling Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Replacement Cost vs Market Value</h3>
    <p><b>Market value</b> is what you could sell your home for (includes land value). <b>Replacement cost</b> is what it costs to rebuild the home (materials and labor, excluding land). Insurance should cover replacement cost, not market value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The 80% Rule</h3>
    <p>The 80% rule states you should insure your home for at least 80% of replacement cost to receive full coverage for partial losses. If insured for less than 80%, you may receive reduced payments for claims.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Replacement Cost</h3>
    <p>Replacement cost = Square footage × Cost per square foot to rebuild in your area. Cost per square foot varies by location ($100-300+). Get estimates from contractors or use online calculators. Don't include land value.</p>

<hr />

    <h2 id="property" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Personal Property Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amount</h3>
    <p>Personal property coverage is typically 50-70% of dwelling coverage. For example, if dwelling coverage is $300,000, personal property coverage might be $150,000-210,000. Create a home inventory to estimate actual value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Home Inventory</h3>
    <p>Create a detailed home inventory listing all belongings with values. This helps estimate personal property value and provides documentation for claims. Include: furniture, electronics, appliances, clothing, jewelry, and other valuables.</p>

<hr />

    <h2 id="liability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Liability Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amount</h3>
    <p>Liability coverage protects if someone is injured on your property or you cause damage. Standard coverage is $100,000-300,000, but consider $300,000-500,000 for better protection. Umbrella insurance can provide additional coverage above homeowners limits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Additional Considerations</h3>
    <p>Consider: flood insurance (separate policy, not covered by standard homeowners), earthquake insurance (separate policy), and umbrella insurance (additional liability coverage above homeowners limits).</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Homeowners insurance</b> should cover replacement cost to rebuild your home (not market value), personal property value (typically 50-70% of dwelling), and provide adequate liability protection ($300,000-500,000 recommended). Review coverage annually as home value, replacement costs, and personal property value change.</p>
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
          <p>This tool calculates homeowners insurance coverage needs including dwelling, personal property, and liability coverage.</p>
          <p>Outputs include recommended dwelling coverage, personal property coverage, liability coverage, total recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
