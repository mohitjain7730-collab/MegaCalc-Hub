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
  currentAge: z.number({ invalid_type_error: 'Enter current age' }).min(50).max(100),
  careStartAge: z.number({ invalid_type_error: 'Enter care start age' }).min(50).max(100),
  careDurationYears: z.number({ invalid_type_error: 'Enter care duration' }).min(1).max(30),
  monthlyCareCost: z.number({ invalid_type_error: 'Enter monthly care cost' }).min(0),
  inflationRate: z.number({ invalid_type_error: 'Enter inflation rate' }).min(0).max(10).optional(),
  existingLongTermCareInsurance: z.number({ invalid_type_error: 'Enter existing coverage' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentAge: number;
  careStartAge: number;
  careDurationYears: number;
  monthlyCareCost: number;
  inflationRate: number;
  existingLongTermCareInsurance: number;
  yearsUntilCare: number;
  futureMonthlyCost: number;
  totalCareCost: number;
  recommendedCoverage: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current age and expected age when care will start.',
  'Enter expected care duration in years and current monthly care cost.',
  'Optionally enter inflation rate (typically 3-5%) and existing long-term care insurance coverage.',
  'Review total care cost, future monthly cost, recommended coverage, and coverage gap.',
];

const faqs = [
  {
    question: 'What is long-term care?',
    answer:
      'Long-term care includes assistance with daily living activities (bathing, dressing, eating, etc.) due to chronic illness, disability, or aging. It can be provided at home, in assisted living, or in nursing homes.',
  },
  {
    question: 'How much does long-term care cost?',
    answer:
      'Long-term care costs vary by location and type: home health aide ($5,000-6,000/month), assisted living ($4,000-5,000/month), nursing home ($8,000-10,000/month). Costs increase with inflation (typically 3-5% annually).',
  },
  {
    question: 'How long do people need long-term care?',
    answer:
      'Average duration is 2-3 years, but varies widely. Some need care for months, others for decades. Women typically need longer care (3.7 years average) than men (2.2 years average).',
  },
  {
    question: 'What is long-term care insurance?',
    answer:
      'Long-term care insurance helps pay for long-term care services. It typically covers home care, assisted living, and nursing home care. Benefits are paid when you need help with daily living activities or have cognitive impairment.',
  },
  {
    question: 'When should I buy long-term care insurance?',
    answer:
      'Best time to buy is in your 50s or early 60s when premiums are lower and you\'re more likely to qualify. Premiums increase significantly with age, and health issues may make you uninsurable.',
  },
  {
    question: 'How much long-term care insurance do I need?',
    answer:
      'Coverage should cover expected care costs over the care duration. Consider: current care costs, inflation, care duration, and ability to self-fund. Typically $200,000-$500,000 in coverage, or $150-$300/day benefit.',
  },
  {
    question: 'What is the elimination period?',
    answer:
      'Elimination period (waiting period) is the time before benefits begin, typically 30, 60, or 90 days. Longer elimination periods reduce premiums but require you to pay for care during the waiting period.',
  },
  {
    question: 'Does Medicare cover long-term care?',
    answer:
      'Medicare covers limited skilled nursing care (up to 100 days) after a hospital stay, but not custodial care (help with daily living). Medicaid covers long-term care but requires spending down assets to qualify.',
  },
  {
    question: 'What about hybrid life/long-term care policies?',
    answer:
      'Hybrid policies combine life insurance with long-term care benefits. If you don\'t need long-term care, beneficiaries receive a death benefit. Premiums are typically higher but provide dual protection.',
  },
  {
    question: 'How do I estimate future care costs?',
    answer:
      'Estimate future costs by: current monthly cost Ã— (1 + inflation rate)^years until care. For example, $5,000/month today at 4% inflation becomes $7,400/month in 10 years. Plan for cost increases.',
  },
];

const relatedCalculators = [
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
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
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/long-term-care-cost-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Long-Term Care Cost Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Long-Term Care Cost Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate long-term care costs and insurance needs based on care duration, monthly costs, inflation, and existing coverage.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentAge = values.currentAge;
  const careStartAge = values.careStartAge;
  const careDurationYears = values.careDurationYears;
  const monthlyCareCost = values.monthlyCareCost;
  const inflationRate = values.inflationRate || 4;
  const existingLongTermCareInsurance = values.existingLongTermCareInsurance || 0;

  // Calculate years until care starts
  const yearsUntilCare = Math.max(0, careStartAge - currentAge);

  // Calculate future monthly cost (with inflation)
  const futureMonthlyCost = monthlyCareCost * Math.pow(1 + inflationRate / 100, yearsUntilCare);

  // Calculate total care cost (simplified: assumes constant monthly cost, though it may increase)
  // For more accuracy, could calculate year-by-year with inflation, but simplified here
  const totalCareCost = futureMonthlyCost * careDurationYears * 12;

  // Recommended coverage (total care cost)
  const recommendedCoverage = totalCareCost;

  // Coverage gap
  const coverageGap = Math.max(0, recommendedCoverage - existingLongTermCareInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Long-term care costs calculated. Recommended coverage should provide financial protection for expected care duration and costs.';

  const coverageRatio = existingLongTermCareInsurance > 0 ? (existingLongTermCareInsurance / recommendedCoverage) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing long-term care insurance coverage meets or exceeds recommended needs. Review coverage periodically as care costs increase with inflation.';
  } else if (coverageRatio >= 70) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet recommended amount, or review if current coverage is adequate.';
  } else if (coverageRatio >= 40) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet recommended amount for adequate protection during long-term care.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to recommended needs. Significant additional coverage recommended to adequately protect finances during long-term care needs.';
  }

  const recommendations = [
    `Total care cost: ${totalCareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${careDurationYears} years. Future monthly cost: ${futureMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month (current cost ${monthlyCareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month with ${inflationRate}% inflation over ${yearsUntilCare} years).`,
    `Recommended coverage: ${recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} to cover total care costs. Long-term care insurance typically provides daily or monthly benefits (e.g., $150-300/day or $4,500-9,000/month).`,
    `Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'} additional coverage needed. Consider purchasing long-term care insurance in your 50s-60s when premiums are lower and you're more likely to qualify.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Obtain additional coverage: ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} to meet recommended coverage amount. Review policy features: elimination period, benefit period, inflation protection, and daily/monthly benefit amounts.`);
  }
  if (yearsUntilCare > 20) {
    recommendations.push('Long time horizon: With many years until care, costs will increase significantly with inflation. Consider inflation protection riders in long-term care insurance policies.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate long-term care costs: ${totalCareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${careDurationYears} years. Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'}.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Research long-term care insurance options. Compare policies considering: daily/monthly benefits, benefit period, elimination period, inflation protection, and premiums. Purchase in your 50s-60s for best rates.' : 'Review existing coverage to ensure it remains adequate. Update coverage as care costs increase with inflation and circumstances change.' },
    { label: 'Ongoing', detail: 'Review long-term care needs and costs annually. Care costs increase with inflation (typically 3-5% annually). Ensure coverage keeps pace with cost increases. Consider hybrid life/long-term care policies if appropriate.' },
  ];

  return {
    currentAge,
    careStartAge,
    careDurationYears,
    monthlyCareCost,
    inflationRate,
    existingLongTermCareInsurance,
    yearsUntilCare,
    futureMonthlyCost,
    totalCareCost,
    recommendedCoverage,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LongTermCareCostCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      careStartAge: undefined,
      careDurationYears: undefined,
      monthlyCareCost: undefined,
      inflationRate: undefined,
      existingLongTermCareInsurance: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="long-term-care-cost-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Long-Term Care Cost Calculator
          </CardTitle>
          <CardDescription>Calculate long-term care costs and insurance needs based on care duration, monthly costs, inflation, and existing coverage.</CardDescription>
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
                  name="currentAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="careStartAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Care Start Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="careDurationYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Care Duration (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyCareCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Monthly Care Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inflationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inflation Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingLongTermCareInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Long-Term Care Insurance ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate care costs
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
            <CardDescription>See total care cost, future monthly cost, recommended coverage, and coverage gap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Care Cost</p>
                <p className="text-2xl font-semibold text-primary">{result.totalCareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Future Monthly Cost</p>
                <p className="text-2xl font-semibold text-primary">{result.futureMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
            <strong>Years Until Care</strong> = Care Start Age - Current Age. Number of years until care is expected to begin.
          </p>
          <p>
            <strong>Future Monthly Cost</strong> = Current Monthly Cost Ã— (1 + Inflation Rate)^Years Until Care. Accounts for inflation increasing care costs over time.
          </p>
          <p>
            <strong>Total Care Cost</strong> = Future Monthly Cost Ã— Care Duration Years Ã— 12. Total cost over the expected care duration.
          </p>
          <p>
            <strong>Recommended Coverage</strong> = Total Care Cost. Coverage should match expected total care costs.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Recommended Coverage - Existing Long-Term Care Insurance. Additional coverage needed.
          </p>
          <p>Long-term care costs increase with inflation (typically 3-5% annually). Calculate future costs by applying inflation to current costs. Recommended coverage should cover total expected care costs over the care duration.</p>
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
                <p className="text-sm text-muted-foreground">Years Until Care</p>
                <p className="text-xl font-semibold text-primary">{result.yearsUntilCare}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Annual Care Cost</p>
                <p className="text-xl font-semibold text-primary">{(result.futureMonthlyCost * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recommendedCoverage > 0 ? `${((result.existingLongTermCareInsurance / result.recommendedCoverage) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of recommended</p>
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
    <meta itemProp="name" content="The Definitive Guide to Long-Term Care Costs: Calculating Long-Term Care Expenses" />
    <meta itemProp="description" content="A comprehensive guide to calculating long-term care costs and insurance needs based on care duration, monthly costs, inflation, and existing coverage." />
    <meta itemProp="keywords" content="long-term care, long-term care insurance, care costs, nursing home costs, assisted living costs, care planning" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-long-term-care-cost-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Long-Term Care Costs: Calculating Long-Term Care Expenses</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating long-term care costs and insurance needs to protect finances during long-term care needs.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Long-Term Care?</a></li>
        <li><a href="#costs" className="hover:underline">Long-Term Care Costs</a></li>
        <li><a href="#calculation" className="hover:underline">Cost Calculation</a></li>
        <li><a href="#insurance" className="hover:underline">Long-Term Care Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Long-Term Care?</h2>
    <p><b>Long-term care</b> includes assistance with daily living activities (bathing, dressing, eating, etc.) due to chronic illness, disability, or aging. It can be provided at home, in assisted living, or in nursing homes. Most people will need some form of long-term care in their lifetime.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Long-term care answers: "What happens if I can't care for myself?" It includes help with activities of daily living (ADLs) and can be needed for months or years. Costs are significant and typically not covered by health insurance or Medicare.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Statistics</h3>
    <ul>
        <li><b>70% of people</b> over 65 will need long-term care</li>
        <li><b>Average duration:</b> 2-3 years (women 3.7 years, men 2.2 years)</li>
        <li><b>Costs:</b> $4,000-10,000/month depending on type and location</li>
        <li><b>Inflation:</b> Care costs increase 3-5% annually</li>
    </ul>

<hr />

    <h2 id="costs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Long-Term Care Costs</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Care and Costs</h3>
    <ul>
        <li><b>Home health aide:</b> $5,000-6,000/month (part-time to full-time care at home)</li>
        <li><b>Assisted living:</b> $4,000-5,000/month (housing with assistance)</li>
        <li><b>Nursing home:</b> $8,000-10,000/month (skilled nursing care)</li>
    </ul>
    <p>Costs vary significantly by location (urban vs rural, state), type of care, and level of assistance needed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cost Inflation</h3>
    <p>Long-term care costs increase with inflation, typically 3-5% annually. This means costs double approximately every 15-20 years. Plan for significant cost increases if care is needed many years in the future.</p>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cost Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Future Monthly Cost = Current Monthly Cost Ã— (1 + Inflation Rate)^Years Until Care</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Total Care Cost = Future Monthly Cost Ã— Care Duration Years Ã— 12</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If current care costs $5,000/month, care starts in 20 years, and inflation is 4%:</p>
    <ul>
        <li>Future monthly cost = $5,000 Ã— (1.04)^20 = $10,960/month</li>
        <li>If care lasts 3 years: Total cost = $10,960 Ã— 3 Ã— 12 = $394,560</li>
    </ul>

<hr />

    <h2 id="insurance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Long-Term Care Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">When to Buy</h3>
    <p>Best time to buy is in your 50s or early 60s when premiums are lower and you're more likely to qualify. Premiums increase significantly with age, and health issues may make you uninsurable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Amounts</h3>
    <p>Coverage should match expected total care costs. Policies typically provide daily or monthly benefits (e.g., $150-300/day or $4,500-9,000/month). Consider inflation protection riders to keep benefits in line with cost increases.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Policy Features</h3>
    <ul>
        <li><b>Elimination period:</b> Waiting period before benefits begin (30, 60, or 90 days)</li>
        <li><b>Benefit period:</b> How long benefits are paid (2, 3, 5 years, or lifetime)</li>
        <li><b>Inflation protection:</b> Increases benefits to keep pace with cost inflation</li>
        <li><b>Daily/monthly benefit:</b> Amount paid per day or month</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Long-term care costs</b> are significant and increase with inflation. Calculate future costs by applying inflation to current costs. Recommended coverage should match total expected care costs over the care duration. Purchase long-term care insurance in your 50s-60s for best rates. Consider inflation protection to keep benefits in line with cost increases.</p>
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
          <p>This tool calculates long-term care costs and insurance needs based on care duration, monthly costs, inflation, and existing coverage.</p>
          <p>Outputs include total care cost, future monthly cost, recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
