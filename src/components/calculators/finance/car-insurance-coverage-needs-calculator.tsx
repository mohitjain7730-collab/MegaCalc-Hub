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
  vehicleValue: z.number({ invalid_type_error: 'Enter vehicle value' }).min(0),
  netWorth: z.number({ invalid_type_error: 'Enter net worth' }).min(0),
  stateMinimumBodilyInjury: z.number({ invalid_type_error: 'Enter state minimum bodily injury' }).min(0),
  stateMinimumPropertyDamage: z.number({ invalid_type_error: 'Enter state minimum property damage' }).min(0),
  isFinanced: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  vehicleValue: number;
  netWorth: number;
  stateMinimumBodilyInjury: number;
  stateMinimumPropertyDamage: number;
  isFinanced: boolean;
  recommendedBodilyInjuryPerPerson: number;
  recommendedBodilyInjuryPerAccident: number;
  recommendedPropertyDamage: number;
  recommendedComprehensiveCollision: number;
  totalRecommendedCoverage: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your vehicle value and net worth.',
  'Enter state minimum bodily injury and property damage requirements.',
  'Indicate if vehicle is financed or leased.',
  'Review recommended coverage levels for liability, comprehensive, and collision.',
];

const faqs = [
  {
    question: 'How much car insurance coverage do I need?',
    answer:
      'Coverage needs depend on vehicle value, net worth, state requirements, and financing status. Higher net worth requires more liability coverage to protect assets. Financed vehicles typically require comprehensive and collision coverage.',
  },
  {
    question: 'What is liability coverage?',
    answer:
      'Liability coverage pays for damages you cause to others in an accident. It includes bodily injury (per person and per accident) and property damage. State minimums are often insufficient to protect assets.',
  },
  {
    question: 'How does net worth affect coverage needs?',
    answer:
      'Higher net worth requires more liability coverage to protect assets from lawsuits. If your net worth is $100,000, consider at least $100,000/$300,000/$100,000 coverage (bodily injury per person/per accident/property damage).',
  },
  {
    question: 'Do I need comprehensive and collision coverage?',
    answer:
      'Comprehensive and collision are required for financed/leased vehicles. For owned vehicles, consider vehicle value: if repairs would be affordable, you may skip these coverages to save on premiums.',
  },
  {
    question: 'What are typical coverage limits?',
    answer:
      'Common coverage limits: 25/50/25 (minimum), 50/100/50 (moderate), 100/300/100 (recommended for most), 250/500/250 (high net worth). Higher limits provide better asset protection.',
  },
  {
    question: 'How does vehicle value affect coverage?',
    answer:
      'Higher vehicle value increases comprehensive and collision coverage needs. If vehicle value is low (under $5,000), you may skip comprehensive/collision to save on premiums, as repair costs may exceed vehicle value.',
  },
  {
    question: 'What about uninsured/underinsured motorist coverage?',
    answer:
      'Uninsured/underinsured motorist coverage protects you if the other driver lacks sufficient insurance. Recommended limits match your liability coverage. Required in some states.',
  },
  {
    question: 'Can I reduce coverage to save money?',
    answer:
      'You can reduce comprehensive/collision if vehicle value is low and you can afford repairs. However, reducing liability coverage below asset protection levels risks financial loss in lawsuits.',
  },
  {
    question: 'How often should I review coverage?',
    answer:
      'Review coverage annually or when: vehicle value changes significantly, net worth increases, moving to a new state, or financing is paid off. Adjust coverage to match current needs.',
  },
  {
    question: 'What about gap insurance?',
    answer:
      'Gap insurance covers the difference between vehicle value and loan balance if vehicle is totaled. Recommended for new vehicles or those with high loan-to-value ratios.',
  },
];

const relatedCalculators = [
  {
    name: 'Homeowners Insurance Coverage Estimator',
    slug: 'homeowners-insurance-coverage-estimator',
    description: 'Calculate homeowners insurance coverage needs.',
  },
  {
    name: 'Renters Insurance Coverage Calculator',
    slug: 'renters-insurance-coverage-calculator',
    description: 'Calculate renters insurance coverage needs.',
  },
  {
    name: 'Life Insurance Premium Estimator',
    slug: 'life-insurance-premium-estimator',
    description: 'Estimate life insurance premiums.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/car-insurance-coverage-needs-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Car Insurance Coverage Needs Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Car Insurance Coverage Needs Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate car insurance coverage needs based on vehicle value, net worth, state requirements, and financing status.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const vehicleValue = values.vehicleValue;
  const netWorth = values.netWorth;
  const stateMinimumBodilyInjury = values.stateMinimumBodilyInjury;
  const stateMinimumPropertyDamage = values.stateMinimumPropertyDamage;
  const isFinanced = values.isFinanced || false;

  // Calculate recommended bodily injury coverage based on net worth
  // General rule: bodily injury per person should be at least equal to net worth
  // Per accident should be 2-3x per person
  let recommendedBodilyInjuryPerPerson = Math.max(stateMinimumBodilyInjury, netWorth);
  if (netWorth < 50000) {
    recommendedBodilyInjuryPerPerson = Math.max(stateMinimumBodilyInjury, 50000);
  } else if (netWorth < 100000) {
    recommendedBodilyInjuryPerPerson = Math.max(stateMinimumBodilyInjury, 100000);
  } else if (netWorth < 250000) {
    recommendedBodilyInjuryPerPerson = Math.max(stateMinimumBodilyInjury, 100000);
  } else {
    recommendedBodilyInjuryPerPerson = Math.max(stateMinimumBodilyInjury, 250000);
  }

  // Per accident is typically 2-3x per person
  const recommendedBodilyInjuryPerAccident = recommendedBodilyInjuryPerPerson * 2.5;

  // Property damage should be at least equal to net worth or $100,000, whichever is higher
  const recommendedPropertyDamage = Math.max(stateMinimumPropertyDamage, Math.max(netWorth, 100000));

  // Comprehensive and collision: required if financed, recommended if vehicle value > $10,000
  const recommendedComprehensiveCollision = isFinanced || vehicleValue > 10000 ? vehicleValue : 0;

  const totalRecommendedCoverage = (recommendedBodilyInjuryPerPerson || 0) + (recommendedBodilyInjuryPerAccident || 0) + (recommendedPropertyDamage || 0) + (recommendedComprehensiveCollision || 0);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Recommended coverage levels calculated based on your vehicle value, net worth, and state requirements. These levels provide adequate asset protection and meet financing requirements if applicable.';

  if (recommendedBodilyInjuryPerPerson < netWorth * 0.8) {
    status = 'low';
    interpretation = 'Recommended liability coverage may be insufficient to protect your assets. Consider increasing coverage to match or exceed your net worth to protect against lawsuits.';
  } else if (recommendedBodilyInjuryPerPerson < netWorth) {
    status = 'moderate';
    interpretation = 'Recommended coverage is close to your net worth. Consider increasing liability coverage slightly above net worth for better asset protection.';
  } else if (isFinanced && recommendedComprehensiveCollision === 0) {
    status = 'moderate';
    interpretation = 'Comprehensive and collision coverage are typically required for financed vehicles. Verify with your lender, as lack of coverage may violate loan terms.';
  } else {
    status = 'optimal';
    interpretation = 'Recommended coverage levels provide adequate protection for your assets and vehicle. Coverage meets or exceeds state requirements and financing needs.';
  }

  const recommendations = [
    `Recommended liability coverage: ${recommendedBodilyInjuryPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}/${recommendedBodilyInjuryPerAccident.toLocaleString(undefined, { maximumFractionDigits: 0 })}/${recommendedPropertyDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })} (bodily injury per person/per accident/property damage).`,
    `Comprehensive and collision: ${recommendedComprehensiveCollision > 0 ? `Recommended coverage of $${recommendedComprehensiveCollision.toLocaleString(undefined, { maximumFractionDigits: 0 })} (vehicle value).` : 'Not required for owned vehicle with low value. Consider skipping to save on premiums if you can afford repairs.'}`,
    `Asset protection: Liability coverage of $${recommendedBodilyInjuryPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })} per person protects assets up to $${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Consider umbrella insurance for additional protection if net worth exceeds $500,000.`,
  ];
  if (isFinanced) {
    recommendations.push('Financed vehicles typically require comprehensive and collision coverage. Verify exact requirements with your lender to avoid violating loan terms.');
  }
  if (vehicleValue < 5000) {
    recommendations.push('Low vehicle value may make comprehensive/collision coverage cost-prohibitive. Consider skipping if repair costs would exceed vehicle value.');
  }

  const plan = [
    { label: 'This Week', detail: `Review recommended coverage: ${recommendedBodilyInjuryPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}/${recommendedBodilyInjuryPerAccident.toLocaleString(undefined, { maximumFractionDigits: 0 })}/${recommendedPropertyDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Get quotes from 3-5 insurers for these coverage levels.` },
    { label: 'This Month', detail: 'Compare quotes and select policy with recommended coverage levels. Ensure comprehensive/collision coverage if vehicle is financed. Consider uninsured/underinsured motorist coverage matching liability limits.' },
    { label: 'Ongoing', detail: 'Review coverage annually or when net worth changes significantly, vehicle value changes, or financing is paid off. Adjust coverage to match current needs and asset protection requirements.' },
  ];

  return {
    vehicleValue,
    netWorth,
    stateMinimumBodilyInjury,
    stateMinimumPropertyDamage,
    isFinanced,
    recommendedBodilyInjuryPerPerson,
    recommendedBodilyInjuryPerAccident,
    recommendedPropertyDamage,
    recommendedComprehensiveCollision,
    totalRecommendedCoverage,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CarInsuranceCoverageNeedsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleValue: undefined,
      netWorth: undefined,
      stateMinimumBodilyInjury: undefined,
      stateMinimumPropertyDamage: undefined,
      isFinanced: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="car-insurance-coverage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Car Insurance Coverage Needs Calculator
          </CardTitle>
          <CardDescription>Calculate car insurance coverage needs based on vehicle value, net worth, state requirements, and financing status.</CardDescription>
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
                  name="vehicleValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Value ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 25000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netWorth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Worth ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stateMinimumBodilyInjury"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Minimum Bodily Injury per Person ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 25000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stateMinimumPropertyDamage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Minimum Property Damage ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFinanced"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Vehicle is Financed or Leased</FormLabel>
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
            <CardDescription>See recommended coverage levels for liability, comprehensive, and collision coverage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bodily Injury per Person</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedBodilyInjuryPerPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bodily Injury per Accident</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedBodilyInjuryPerAccident.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Property Damage</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedPropertyDamage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Comprehensive/Collision</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedComprehensiveCollision.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
            <strong>Recommended Bodily Injury per Person</strong> = Max(State Minimum, Net Worth-based recommendation). For net worth &lt; $50K: $50K; $50K-$100K: $100K; $100K-$250K: $100K; &gt; $250K: $250K.
          </p>
          <p>
            <strong>Recommended Bodily Injury per Accident</strong> = Bodily Injury per Person × 2.5. Typically 2-3x per person coverage.
          </p>
          <p>
            <strong>Recommended Property Damage</strong> = Max(State Minimum, Net Worth, $100,000). Protects against property damage claims.
          </p>
          <p>
            <strong>Recommended Comprehensive/Collision</strong> = Vehicle Value if financed or vehicle value &gt; $10,000, else 0. Required for financed vehicles, recommended for high-value vehicles.
          </p>
          <p>
            <strong>Total Recommended Coverage</strong> = Sum of all recommended coverage amounts. Represents total coverage needs.
          </p>
          <p>Car insurance coverage needs are based on asset protection (liability should match or exceed net worth), state requirements, and vehicle value. Higher net worth requires more liability coverage to protect assets from lawsuits.</p>
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
                <p className="text-sm text-muted-foreground">Coverage Above State Minimum</p>
                <p className="text-xl font-semibold text-primary">
                  ${(result.recommendedBodilyInjuryPerPerson - result.stateMinimumBodilyInjury).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">Additional protection</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Asset Protection Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.netWorth > 0 ? ((result.recommendedBodilyInjuryPerPerson / result.netWorth) * 100).toFixed(0) : 'N/A'}%
                </p>
                <p className="text-xs text-muted-foreground">Coverage to net worth</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Car Insurance Coverage Needs: Protecting Your Assets and Vehicle" />
    <meta itemProp="description" content="A comprehensive guide to calculating car insurance coverage needs based on vehicle value, net worth, state requirements, and financing status." />
    <meta itemProp="keywords" content="car insurance coverage, auto insurance needs, liability coverage, comprehensive collision, asset protection" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-car-insurance-coverage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Car Insurance Coverage Needs: Protecting Your Assets and Vehicle</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding and calculating car insurance coverage needs based on risk factors and asset protection requirements.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Car Insurance Coverage Types</a></li>
        <li><a href="#liability" className="hover:underline">Liability Coverage: Protecting Your Assets</a></li>
        <li><a href="#comprehensive" className="hover:underline">Comprehensive and Collision Coverage</a></li>
        <li><a href="#calculation" className="hover:underline">Coverage Calculation</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Car Insurance Coverage Types</h2>
    <p><b>Car insurance coverage</b> protects you financially from accidents, theft, and other vehicle-related risks. Coverage needs depend on vehicle value, net worth, state requirements, and financing status.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Coverage Types</h3>
    <ul>
        <li><b>Liability coverage:</b> Protects against damages you cause to others (bodily injury and property damage)</li>
        <li><b>Comprehensive coverage:</b> Covers non-collision incidents (theft, vandalism, natural disasters)</li>
        <li><b>Collision coverage:</b> Covers collision-related damages to your vehicle</li>
        <li><b>Uninsured/underinsured motorist:</b> Protects you if the other driver lacks sufficient insurance</li>
    </ul>

<hr />

    <h2 id="liability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Liability Coverage: Protecting Your Assets</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Bodily Injury Coverage</h3>
    <p>Bodily injury coverage pays for medical expenses, lost wages, and pain and suffering of others in accidents you cause. Coverage is expressed as per person/per accident limits (e.g., 100/300 means $100K per person, $300K per accident).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Property Damage Coverage</h3>
    <p>Property damage coverage pays for damage to others' property (vehicles, structures, etc.) in accidents you cause. Recommended minimum is $100,000, though state minimums are often lower (typically $15,000-$25,000).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Asset Protection</h3>
    <p>Liability coverage should match or exceed your net worth to protect assets from lawsuits. If your net worth is $100,000, consider at least $100,000/$300,000/$100,000 coverage. Higher net worth requires higher coverage limits.</p>

<hr />

    <h2 id="comprehensive" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comprehensive and Collision Coverage</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">When Required</h3>
    <p>Comprehensive and collision coverage are typically required for financed or leased vehicles. Lenders require these coverages to protect their financial interest in the vehicle.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When Recommended</h3>
    <p>For owned vehicles, comprehensive and collision are recommended if vehicle value exceeds $10,000. If vehicle value is low (under $5,000), you may skip these coverages to save on premiums, as repair costs may exceed vehicle value.</p>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coverage Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Recommended Coverage Levels</h3>
    <p>Coverage needs are calculated as: <b>Recommended Coverage = Max(State Minimum, Asset Protection Need, Vehicle Value)</b>. Liability coverage should match or exceed net worth. Comprehensive/collision should match vehicle value if financed or high-value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Asset Protection Formula</h3>
    <p>Bodily injury per person should be at least equal to net worth. Per accident should be 2-3x per person. Property damage should be at least $100,000 or equal to net worth, whichever is higher.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Car insurance coverage needs</b> are based on asset protection (liability should match or exceed net worth), state requirements, and vehicle value. Higher net worth requires more liability coverage. Financed vehicles require comprehensive/collision. Review coverage annually and adjust to match current needs.</p>
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
          <p>This tool calculates car insurance coverage needs based on vehicle value, net worth, state requirements, and financing status.</p>
          <p>Outputs include recommended liability coverage (bodily injury and property damage), comprehensive/collision coverage, total recommended coverage, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
