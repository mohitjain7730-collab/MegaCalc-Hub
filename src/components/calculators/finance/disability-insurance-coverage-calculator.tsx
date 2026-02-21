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
  monthlyIncome: z.number({ invalid_type_error: 'Enter monthly income' }).min(0),
  monthlyExpenses: z.number({ invalid_type_error: 'Enter monthly expenses' }).min(0),
  spouseMonthlyIncome: z.number({ invalid_type_error: 'Enter spouse monthly income' }).min(0).optional(),
  existingDisabilityInsurance: z.number({ invalid_type_error: 'Enter existing disability insurance' }).min(0).optional(),
  benefitPercentage: z.number({ invalid_type_error: 'Enter benefit percentage' }).min(0).max(100).optional(),
  eliminationPeriod: z.number({ invalid_type_error: 'Enter elimination period' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  monthlyIncome: number;
  monthlyExpenses: number;
  spouseMonthlyIncome: number;
  existingDisabilityInsurance: number;
  benefitPercentage: number;
  eliminationPeriod: number;
  monthlyIncomeNeed: number;
  recommendedMonthlyBenefit: number;
  recommendedCoverage: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter monthly income and monthly expenses.',
  'Optionally enter spouse monthly income if applicable.',
  'Optionally enter existing disability insurance coverage.',
  'Optionally enter benefit percentage (typically 60-70%) and elimination period (typically 90 days).',
  'Review recommended monthly benefit, coverage amount, and coverage gap.',
];

const faqs = [
  {
    question: 'What is disability insurance?',
    answer:
      'Disability insurance provides income replacement if you become unable to work due to illness or injury. It pays a percentage of your income (typically 60-70%) as monthly benefits during disability.',
  },
  {
    question: 'How much disability insurance do I need?',
    answer:
      'Disability insurance should cover 60-70% of your income, adjusted for taxes (benefits are typically tax-free if you pay premiums with after-tax dollars). Also consider monthly expenses and spouse income when determining needs.',
  },
  {
    question: 'What is benefit percentage?',
    answer:
      'Benefit percentage is the portion of income replaced by disability insurance, typically 60-70%. Higher percentages cost more. Most policies cap benefits at 60-70% to prevent disincentives to return to work.',
  },
  {
    question: 'What is elimination period?',
    answer:
      'Elimination period (waiting period) is the time between disability onset and when benefits begin, typically 30, 60, 90, or 180 days. Longer elimination periods reduce premiums but require larger emergency fund.',
  },
  {
    question: 'How does spouse income affect coverage needs?',
    answer:
      'If spouse has significant income, disability insurance needs may be lower as household has alternative income source. However, consider: what if spouse also becomes disabled, or if spouse income is insufficient to maintain lifestyle.',
  },
  {
    question: 'What is the difference between short-term and long-term disability?',
    answer:
      'Short-term disability covers 3-6 months, long-term covers years or until retirement age. Most people need long-term disability insurance. Some employers provide short-term, but long-term is typically purchased individually.',
  },
  {
    question: 'What is own-occupation vs any-occupation coverage?',
    answer:
      'Own-occupation coverage pays if you can\'t work in your specific occupation. Any-occupation pays only if you can\'t work in any occupation. Own-occupation is more expensive but provides better protection.',
  },
  {
    question: 'How does age affect disability insurance?',
    answer:
      'Disability insurance premiums increase with age, and coverage becomes harder to obtain. Younger individuals should lock in coverage early. Premiums are typically level (don\'t increase with age) once policy is issued.',
  },
  {
    question: 'What about Social Security disability benefits?',
    answer:
      'Social Security Disability Insurance (SSDI) provides benefits but has strict eligibility requirements and low benefit amounts. Private disability insurance supplements SSDI and provides better protection.',
  },
  {
    question: 'Should I get group or individual disability insurance?',
    answer:
      'Group disability (through employer) is cheaper but may have limitations (benefit caps, limited own-occupation coverage, not portable). Individual disability provides better protection and portability but costs more. Consider both.',
  },
];

const relatedCalculators = [
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
  {
    name: 'Human Life Value (HLV) Calculator',
    slug: 'human-life-value-hlv-calculator',
    description: 'Calculate economic value of human life.',
  },
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund requirements.',
  },
  {
    name: 'Life Insurance Premium Estimator',
    slug: 'life-insurance-premium-estimator',
    description: 'Estimate life insurance premiums.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/disability-insurance-coverage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Disability Insurance Coverage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Disability Insurance Coverage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate disability insurance coverage needs based on income, expenses, spouse income, and existing coverage.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const monthlyIncome = values.monthlyIncome;
  const monthlyExpenses = values.monthlyExpenses;
  const spouseMonthlyIncome = values.spouseMonthlyIncome || 0;
  const existingDisabilityInsurance = values.existingDisabilityInsurance || 0;
  const benefitPercentage = values.benefitPercentage || 65;
  const eliminationPeriod = values.eliminationPeriod || 90;

  // Calculate monthly income need (expenses minus spouse income)
  const monthlyIncomeNeed = Math.max(0, monthlyExpenses - spouseMonthlyIncome);

  // Recommended monthly benefit (typically 60-70% of income, but at least income need)
  // Most policies cap at 60-70% of income
  const maxBenefitFromIncome = monthlyIncome * (benefitPercentage / 100);
  const recommendedMonthlyBenefit = Math.max(monthlyIncomeNeed, Math.min(maxBenefitFromIncome, monthlyIncome * 0.7));

  // Recommended coverage (annual benefit amount)
  const recommendedCoverage = recommendedMonthlyBenefit * 12;

  // Coverage gap
  const coverageGap = Math.max(0, recommendedMonthlyBenefit - existingDisabilityInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Disability insurance coverage calculated. Recommended coverage should replace 60-70% of income to maintain lifestyle during disability.';

  const coverageRatio = existingDisabilityInsurance > 0 ? (existingDisabilityInsurance / recommendedMonthlyBenefit) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing disability insurance coverage meets or exceeds recommended needs. Review coverage periodically as income and expenses change.';
  } else if (coverageRatio >= 80) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet recommended benefit amount, or review if current coverage is adequate.';
  } else if (coverageRatio >= 50) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet recommended benefit amount for adequate protection during disability.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to recommended needs. Significant additional coverage recommended to adequately protect income and maintain lifestyle during disability.';
  }

  const recommendations = [
    `Recommended monthly benefit: ${recommendedMonthlyBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month (${((recommendedMonthlyBenefit / monthlyIncome) * 100).toFixed(0)}% of income). This should cover expenses of ${monthlyExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month.`,
    `Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month` : 'None'} additional coverage needed. Most policies cap benefits at 60-70% of income to prevent disincentives to return to work.`,
    `Elimination period: ${eliminationPeriod} days. Ensure you have emergency fund to cover expenses during this waiting period before benefits begin.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Obtain additional coverage: ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month to meet recommended benefit amount. Consider own-occupation coverage for better protection.`);
  }
  if (spouseMonthlyIncome > 0) {
    recommendations.push(`Spouse income consideration: Spouse income of ${spouseMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month reduces coverage needs, but ensure total household income (benefits + spouse income) can cover expenses.`);
  }

  const plan = [
    { label: 'This Week', detail: `Calculate disability insurance needs: ${recommendedMonthlyBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month recommended. Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month` : 'None'}.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Obtain additional disability insurance coverage. Compare quotes from multiple insurers. Consider own-occupation coverage and appropriate elimination period (90 days is common).' : 'Review existing coverage to ensure it remains adequate. Update coverage as income and expenses change.' },
    { label: 'Ongoing', detail: 'Review disability insurance needs annually or when circumstances change (income, expenses, spouse income, family size). Ensure emergency fund covers elimination period expenses.' },
  ];

  return {
    monthlyIncome,
    monthlyExpenses,
    spouseMonthlyIncome,
    existingDisabilityInsurance,
    benefitPercentage,
    eliminationPeriod,
    monthlyIncomeNeed,
    recommendedMonthlyBenefit,
    recommendedCoverage,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function DisabilityInsuranceCoverageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: undefined,
      monthlyExpenses: undefined,
      spouseMonthlyIncome: undefined,
      existingDisabilityInsurance: undefined,
      benefitPercentage: undefined,
      eliminationPeriod: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="disability-insurance-coverage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Disability Insurance Coverage Calculator
          </CardTitle>
          <CardDescription>Calculate disability insurance coverage needs based on income, expenses, spouse income, and existing coverage.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your financial information</CardTitle>
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
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8333" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Expenses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spouseMonthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spouse Monthly Income ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 4000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingDisabilityInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Disability Insurance ($/month) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefitPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit Percentage (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eliminationPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Elimination Period (Days) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See recommended monthly benefit, coverage amount, coverage gap, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Monthly Benefit</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedMonthlyBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly Income Need</p>
                <p className="text-2xl font-semibold text-primary">{result.monthlyIncomeNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Gap</p>
                <p className={`text-2xl font-semibold ${result.coverageGap > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$/month</p>
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
            <strong>Monthly Income Need</strong> = Monthly Expenses - Spouse Monthly Income. Amount needed to cover expenses if disabled.
          </p>
          <p>
            <strong>Maximum Benefit from Income</strong> = Monthly Income × (Benefit Percentage / 100). Most policies cap benefits at 60-70% of income.
          </p>
          <p>
            <strong>Recommended Monthly Benefit</strong> = Max(Monthly Income Need, Min(Maximum Benefit from Income, 70% of Income)). Should cover expenses but typically capped at 60-70% of income.
          </p>
          <p>
            <strong>Recommended Coverage</strong> = Recommended Monthly Benefit × 12. Annual benefit amount.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Recommended Monthly Benefit - Existing Disability Insurance. Additional coverage needed.
          </p>
          <p>Disability insurance should replace 60-70% of income to maintain lifestyle during disability. Benefits are typically tax-free if premiums are paid with after-tax dollars. Most policies have elimination periods (waiting periods) before benefits begin.</p>
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
                <p className="text-sm text-muted-foreground">Benefit as % of Income</p>
                <p className="text-xl font-semibold text-primary">
                  {result.monthlyIncome > 0 ? `${((result.recommendedMonthlyBenefit / result.monthlyIncome) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of monthly income</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recommendedMonthlyBenefit > 0 ? `${((result.existingDisabilityInsurance / result.recommendedMonthlyBenefit) * 100).toFixed(1)}%` : 'N/A'}
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
            <p className="text-sm text-muted-foreground">Enter your financial information to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Disability Insurance Coverage: Calculating Disability Insurance Needs" />
    <meta itemProp="description" content="A comprehensive guide to calculating disability insurance coverage needs based on income, expenses, spouse income, and existing coverage." />
    <meta itemProp="keywords" content="disability insurance, disability coverage, income protection, disability benefits, long-term disability, disability insurance needs" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-disability-insurance-coverage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Disability Insurance Coverage: Calculating Disability Insurance Needs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating disability insurance coverage needs to protect income during disability.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Disability Insurance?</a></li>
        <li><a href="#calculation" className="hover:underline">Coverage Needs Calculation</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Coverage Needs</a></li>
        <li><a href="#types" className="hover:underline">Types of Disability Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Disability Insurance?</h2>
    <p><b>Disability insurance</b> provides income replacement if you become unable to work due to illness or injury. It pays a percentage of your income (typically 60-70%) as monthly benefits during disability, protecting your ability to maintain your lifestyle.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Disability insurance answers: "What happens to my income if I can't work?" It replaces 60-70% of income to cover expenses during disability. Benefits are typically tax-free if premiums are paid with after-tax dollars.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Disability Insurance Matters</h3>
    <p>Disability insurance is essential because:</p>
    <ul>
        <li><b>High risk:</b> 25% of workers will experience disability before retirement</li>
        <li><b>Income protection:</b> Maintains lifestyle during disability</li>
        <li><b>Long duration:</b> Disabilities can last years or until retirement</li>
        <li><b>Limited alternatives:</b> Social Security disability benefits are low and hard to qualify for</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coverage Needs Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Recommended Monthly Benefit = Max(Monthly Expenses - Spouse Income, Min(60-70% of Income, Income Need))</b></p>
    </div>
    <p>Coverage should replace 60-70% of income, but at minimum cover expenses minus spouse income. Most policies cap benefits at 60-70% to prevent disincentives to return to work.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <ul>
        <li><b>Monthly Income:</b> Current monthly income</li>
        <li><b>Monthly Expenses:</b> Essential expenses that must be covered</li>
        <li><b>Spouse Income:</b> Alternative income source (reduces needs)</li>
        <li><b>Benefit Percentage:</b> Typically 60-70% of income</li>
        <li><b>Elimination Period:</b> Waiting period before benefits begin (30-180 days)</li>
    </ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Coverage Needs</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Income and Expenses</h3>
    <p>Higher income and expenses increase coverage needs. Coverage should replace 60-70% of income, but at minimum cover essential expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Spouse Income</h3>
    <p>If spouse has significant income, coverage needs may be lower. However, consider: what if spouse also becomes disabled, or if spouse income is insufficient to maintain lifestyle.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Benefit Percentage</h3>
    <p>Most policies cap benefits at 60-70% of income. Higher percentages cost more. 60-70% is standard to prevent disincentives to return to work while providing adequate protection.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Elimination Period</h3>
    <p>Elimination period (waiting period) is the time between disability onset and when benefits begin. Longer periods (90-180 days) reduce premiums but require larger emergency fund to cover expenses during waiting period.</p>

<hr />

    <h2 id="types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Types of Disability Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Short-Term vs Long-Term</h3>
    <p><b>Short-term disability</b> covers 3-6 months, <b>long-term</b> covers years or until retirement age. Most people need long-term disability insurance. Some employers provide short-term, but long-term is typically purchased individually.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Own-Occupation vs Any-Occupation</h3>
    <p><b>Own-occupation coverage</b> pays if you can't work in your specific occupation. <b>Any-occupation coverage</b> pays only if you can't work in any occupation. Own-occupation is more expensive but provides better protection, especially for professionals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Group vs Individual</h3>
    <p><b>Group disability</b> (through employer) is cheaper but may have limitations (benefit caps, limited own-occupation coverage, not portable). <b>Individual disability</b> provides better protection and portability but costs more. Consider both.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Disability insurance</b> should replace 60-70% of income to maintain lifestyle during disability. Calculate needs based on income, expenses, spouse income, and existing coverage. Consider own-occupation coverage for better protection, and ensure emergency fund covers elimination period expenses. Review coverage needs annually as circumstances change.</p>
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
          <p>This tool calculates disability insurance coverage needs based on income, expenses, spouse income, and existing coverage.</p>
          <p>Outputs include recommended monthly benefit, monthly income need, recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
