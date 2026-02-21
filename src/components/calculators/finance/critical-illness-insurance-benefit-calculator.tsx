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
  annualIncome: z.number({ invalid_type_error: 'Enter annual income' }).min(0),
  monthlyExpenses: z.number({ invalid_type_error: 'Enter monthly expenses' }).min(0),
  existingSavings: z.number({ invalid_type_error: 'Enter existing savings' }).min(0).optional(),
  treatmentCost: z.number({ invalid_type_error: 'Enter treatment cost' }).min(0).optional(),
  recoveryMonths: z.number({ invalid_type_error: 'Enter recovery months' }).min(1).max(60).optional(),
  existingCriticalIllnessCoverage: z.number({ invalid_type_error: 'Enter existing coverage' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  annualIncome: number;
  monthlyExpenses: number;
  existingSavings: number;
  treatmentCost: number;
  recoveryMonths: number;
  existingCriticalIllnessCoverage: number;
  totalFinancialNeed: number;
  recommendedBenefit: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter annual income and monthly expenses.',
  'Optionally enter existing savings and estimated treatment costs.',
  'Optionally enter expected recovery period in months.',
  'Optionally enter existing critical illness insurance coverage.',
  'Review recommended benefit amount, total financial need, and coverage gap.',
];

const faqs = [
  {
    question: 'What is critical illness insurance?',
    answer:
      'Critical illness insurance provides a lump-sum payment upon diagnosis of a covered critical illness (cancer, heart attack, stroke, etc.). Benefits are paid regardless of medical expenses and can be used for any purpose.',
  },
  {
    question: 'How much critical illness insurance do I need?',
    answer:
      'Coverage should cover: treatment costs, income replacement during recovery, living expenses, and any additional costs. Typically 1-2 years of income or $50,000-$200,000 depending on income and expenses.',
  },
  {
    question: 'What does critical illness insurance cover?',
    answer:
      'Common covered conditions include: cancer, heart attack, stroke, organ transplant, kidney failure, major burns, paralysis, and other specified critical illnesses. Coverage varies by policy, so review specific conditions covered.',
  },
  {
    question: 'How is this different from health insurance?',
    answer:
      'Health insurance covers medical bills. Critical illness insurance provides a lump-sum payment regardless of medical expenses. You can use benefits for any purpose: medical bills, income replacement, living expenses, or other needs.',
  },
  {
    question: 'When do benefits get paid?',
    answer:
      'Benefits are typically paid as a lump sum after diagnosis and survival period (usually 30 days). Payment is made regardless of whether you continue treatment or recover. Benefits are usually tax-free.',
  },
  {
    question: 'What is a survival period?',
    answer:
      'Survival period is the time you must survive after diagnosis (typically 30 days) to receive benefits. If you die within the survival period, benefits may not be paid. This protects against terminal illness claims.',
  },
  {
    question: 'Can I have multiple critical illness policies?',
    answer:
      'Yes, you can have multiple policies from different insurers. Benefits are paid independently, so you can receive benefits from all policies if diagnosed with a covered condition. This provides additional financial protection.',
  },
  {
    question: 'How does this compare to disability insurance?',
    answer:
      'Critical illness insurance pays a lump sum upon diagnosis. Disability insurance provides monthly income replacement if you can\'t work. They serve different purposes: critical illness for immediate needs, disability for long-term income replacement.',
  },
  {
    question: 'What happens if I don\'t get a critical illness?',
    answer:
      'If you don\'t get a covered critical illness, you don\'t receive benefits. Some policies offer return of premium riders (pay back premiums if no claim), but these increase costs. Consider it insurance protection, not an investment.',
  },
  {
    question: 'Should I get critical illness insurance?',
    answer:
      'Consider critical illness insurance if: you have dependents, limited savings, high treatment costs, or want financial protection beyond health insurance. It provides immediate cash when diagnosed with a critical illness, regardless of other coverage.',
  },
];

const relatedCalculators = [
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
  {
    name: 'Health Insurance Premium Affordability Calculator',
    slug: 'health-insurance-premium-affordability-calculator',
    description: 'Calculate health insurance affordability.',
  },
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund requirements.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/critical-illness-insurance-benefit-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Critical Illness Insurance Benefit Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Critical Illness Insurance Benefit Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate critical illness insurance benefit needs based on income, expenses, treatment costs, and recovery period.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const annualIncome = values.annualIncome;
  const monthlyExpenses = values.monthlyExpenses;
  const existingSavings = values.existingSavings || 0;
  const treatmentCost = values.treatmentCost || 0;
  const recoveryMonths = values.recoveryMonths || 12;
  const existingCriticalIllnessCoverage = values.existingCriticalIllnessCoverage || 0;

  // Calculate total financial need
  // Treatment costs + income replacement during recovery + living expenses - existing savings
  const incomeReplacement = (annualIncome / 12) * recoveryMonths;
  const livingExpenses = monthlyExpenses * recoveryMonths;
  const totalFinancialNeed = treatmentCost + incomeReplacement + livingExpenses - existingSavings;

  // Recommended benefit (typically 1-2 years of income, but at least total financial need)
  const recommendedBenefit = Math.max(totalFinancialNeed, annualIncome * 1.5);

  // Coverage gap
  const coverageGap = Math.max(0, recommendedBenefit - existingCriticalIllnessCoverage);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Critical illness insurance benefit calculated. Recommended coverage should provide financial protection during critical illness diagnosis and recovery.';

  const coverageRatio = existingCriticalIllnessCoverage > 0 ? (existingCriticalIllnessCoverage / recommendedBenefit) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing critical illness coverage meets or exceeds recommended needs. Review coverage periodically as income and expenses change.';
  } else if (coverageRatio >= 70) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet recommended benefit amount, or review if current coverage is adequate.';
  } else if (coverageRatio >= 40) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet recommended benefit amount for adequate protection during critical illness.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to recommended needs. Significant additional coverage recommended to adequately protect finances during critical illness diagnosis and recovery.';
  }

  const recommendations = [
    `Recommended benefit: ${recommendedBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This covers treatment costs (${treatmentCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}), income replacement (${incomeReplacement.toLocaleString(undefined, { maximumFractionDigits: 0 })}), and living expenses (${livingExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}) during ${recoveryMonths} months of recovery.`,
    `Total financial need: ${totalFinancialNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })} after accounting for existing savings (${existingSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}).`,
    `Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'} additional coverage needed. Critical illness insurance provides lump-sum payment regardless of medical expenses, giving flexibility in how benefits are used.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Obtain additional coverage: ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} to meet recommended benefit amount. Benefits are typically paid as lump sum after diagnosis and survival period (usually 30 days).`);
  }
  if (existingSavings < treatmentCost) {
    recommendations.push('Insufficient savings: Existing savings may not cover treatment costs. Critical illness insurance provides immediate cash when diagnosed, regardless of other coverage or savings.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate critical illness insurance needs: ${recommendedBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended. Coverage gap: ${coverageGap > 0 ? `${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'None'}.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Obtain additional critical illness insurance coverage. Compare quotes from multiple insurers. Review covered conditions and survival period requirements.' : 'Review existing coverage to ensure it remains adequate. Update coverage as income, expenses, and family circumstances change.' },
    { label: 'Ongoing', detail: 'Review critical illness insurance needs annually or when circumstances change (income, expenses, family size, health status). Ensure coverage keeps pace with financial needs and treatment costs.' },
  ];

  return {
    annualIncome,
    monthlyExpenses,
    existingSavings,
    treatmentCost,
    recoveryMonths,
    existingCriticalIllnessCoverage,
    totalFinancialNeed,
    recommendedBenefit,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CriticalIllnessInsuranceBenefitCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualIncome: undefined,
      monthlyExpenses: undefined,
      existingSavings: undefined,
      treatmentCost: undefined,
      recoveryMonths: undefined,
      existingCriticalIllnessCoverage: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="critical-illness-benefit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Critical Illness Insurance Benefit Calculator
          </CardTitle>
          <CardDescription>Calculate critical illness insurance benefit needs based on income, expenses, treatment costs, and recovery period.</CardDescription>
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
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="existingSavings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Savings ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treatmentCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Treatment Cost ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Period (Months) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingCriticalIllnessCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Critical Illness Coverage ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate benefit needs
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
            <CardDescription>See recommended benefit, total financial need, coverage gap, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Benefit</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedBenefit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Financial Need</p>
                <p className="text-2xl font-semibold text-primary">{result.totalFinancialNeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Gap</p>
                <p className={`text-2xl font-semibold ${result.coverageGap > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
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
            <strong>Income Replacement</strong> = (Annual Income / 12) × Recovery Months. Income needed during recovery period.
          </p>
          <p>
            <strong>Living Expenses</strong> = Monthly Expenses × Recovery Months. Essential expenses during recovery.
          </p>
          <p>
            <strong>Total Financial Need</strong> = Treatment Cost + Income Replacement + Living Expenses - Existing Savings. Total amount needed during critical illness.
          </p>
          <p>
            <strong>Recommended Benefit</strong> = Max(Total Financial Need, 1.5 × Annual Income). Typically 1-2 years of income, but at least total financial need.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Recommended Benefit - Existing Critical Illness Coverage. Additional coverage needed.
          </p>
          <p>Critical illness insurance provides a lump-sum payment upon diagnosis of a covered critical illness. Benefits are paid regardless of medical expenses and can be used for any purpose: treatment costs, income replacement, living expenses, or other needs.</p>
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
                <p className="text-sm text-muted-foreground">Income Replacement</p>
                <p className="text-xl font-semibold text-primary">{((result.annualIncome / 12) * result.recoveryMonths).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Living Expenses</p>
                <p className="text-xl font-semibold text-primary">{(result.monthlyExpenses * result.recoveryMonths).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recommendedBenefit > 0 ? `${((result.existingCriticalIllnessCoverage / result.recommendedBenefit) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of recommended</p>
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
    <meta itemProp="name" content="The Definitive Guide to Critical Illness Insurance: Calculating Benefit Needs" />
    <meta itemProp="description" content="A comprehensive guide to calculating critical illness insurance benefit needs based on income, expenses, treatment costs, and recovery period." />
    <meta itemProp="keywords" content="critical illness insurance, critical illness benefit, health insurance, insurance planning, lump sum benefit" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-critical-illness-insurance-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Critical Illness Insurance: Calculating Benefit Needs</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating critical illness insurance benefit needs to protect finances during critical illness diagnosis and recovery.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Critical Illness Insurance?</a></li>
        <li><a href="#calculation" className="hover:underline">Benefit Needs Calculation</a></li>
        <li><a href="#coverage" className="hover:underline">Covered Conditions and Benefits</a></li>
        <li><a href="#comparison" className="hover:underline">Comparison with Other Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Critical Illness Insurance?</h2>
    <p><b>Critical illness insurance</b> provides a lump-sum payment upon diagnosis of a covered critical illness (cancer, heart attack, stroke, etc.). Benefits are paid regardless of medical expenses and can be used for any purpose: treatment costs, income replacement, living expenses, or other needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Critical illness insurance answers: "What happens financially if I'm diagnosed with a critical illness?" It provides immediate cash (lump-sum payment) when diagnosed, giving flexibility in how benefits are used. Benefits are typically tax-free.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Features</h3>
    <ul>
        <li><b>Lump-sum payment:</b> One-time payment upon diagnosis</li>
        <li><b>Flexible use:</b> Benefits can be used for any purpose</li>
        <li><b>No medical expense requirement:</b> Paid regardless of medical bills</li>
        <li><b>Survival period:</b> Must survive 30 days after diagnosis (typically)</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benefit Needs Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Total Financial Need = Treatment Cost + Income Replacement + Living Expenses - Existing Savings</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Recommended Benefit = Max(Total Financial Need, 1.5 × Annual Income)</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <ul>
        <li><b>Treatment costs:</b> Medical bills, procedures, medications</li>
        <li><b>Income replacement:</b> Lost income during recovery (typically 12-24 months)</li>
        <li><b>Living expenses:</b> Essential expenses during recovery</li>
        <li><b>Existing savings:</b> Available funds to offset needs</li>
    </ul>

<hr />

    <h2 id="coverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Covered Conditions and Benefits</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Common Covered Conditions</h3>
    <p>Most policies cover: cancer, heart attack, stroke, organ transplant, kidney failure, major burns, paralysis, and other specified critical illnesses. Coverage varies by policy, so review specific conditions covered.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Survival Period</h3>
    <p>Survival period is the time you must survive after diagnosis (typically 30 days) to receive benefits. If you die within the survival period, benefits may not be paid. This protects against terminal illness claims.</p>

<hr />

    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comparison with Other Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Critical Illness vs Health Insurance</h3>
    <p>Health insurance covers medical bills. Critical illness insurance provides a lump-sum payment regardless of medical expenses. You can use benefits for any purpose: medical bills, income replacement, living expenses, or other needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Critical Illness vs Disability Insurance</h3>
    <p>Critical illness insurance pays a lump sum upon diagnosis. Disability insurance provides monthly income replacement if you can't work. They serve different purposes: critical illness for immediate needs, disability for long-term income replacement.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Critical illness insurance</b> provides a lump-sum payment upon diagnosis of a covered critical illness. Calculate needs based on treatment costs, income replacement, living expenses, and existing savings. Recommended benefit is typically 1-2 years of income or total financial need, whichever is higher. Benefits are paid regardless of medical expenses and can be used for any purpose.</p>
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
          <p>This tool calculates critical illness insurance benefit needs based on income, expenses, treatment costs, and recovery period.</p>
          <p>Outputs include recommended benefit, total financial need, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
