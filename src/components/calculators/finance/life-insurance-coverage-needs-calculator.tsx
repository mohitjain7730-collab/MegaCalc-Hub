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
  yearsOfCoverage: z.number({ invalid_type_error: 'Enter years of coverage' }).min(1).max(50),
  existingLifeInsurance: z.number({ invalid_type_error: 'Enter existing life insurance' }).min(0).optional(),
  debts: z.number({ invalid_type_error: 'Enter total debts' }).min(0).optional(),
  finalExpenses: z.number({ invalid_type_error: 'Enter final expenses' }).min(0).optional(),
  educationFunds: z.number({ invalid_type_error: 'Enter education funds needed' }).min(0).optional(),
  emergencyFund: z.number({ invalid_type_error: 'Enter emergency fund needed' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  annualIncome: number;
  yearsOfCoverage: number;
  existingLifeInsurance: number;
  debts: number;
  finalExpenses: number;
  educationFunds: number;
  emergencyFund: number;
  incomeReplacement: number;
  totalNeeds: number;
  recommendedCoverage: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter annual income to determine income replacement needs.',
  'Enter desired years of coverage (typically 10-20 years).',
  'Enter existing life insurance coverage (if any).',
  'Optionally enter debts, final expenses, education funds, and emergency fund needs.',
  'Review recommended coverage amount and compare to existing coverage.',
];

const faqs = [
  {
    question: 'What is life insurance coverage needs?',
    answer:
      'Life insurance coverage needs is the amount of insurance required to replace income, pay off debts, cover final expenses, fund education, and provide emergency funds for dependents if the insured dies.',
  },
  {
    question: 'How do I calculate coverage needs?',
    answer:
      'Coverage needs = Income replacement (annual income × years) + Debts + Final expenses + Education funds + Emergency fund - Existing life insurance. This ensures dependents can maintain their lifestyle and meet financial obligations.',
  },
  {
    question: 'How many years of coverage should I plan for?',
    answer:
      'Typically plan for 10-20 years of income replacement, depending on dependents\' ages and financial goals. For young children, plan until they reach adulthood (18-22 years). For spouses, consider until retirement age or when they can be self-sufficient.',
  },
  {
    question: 'What is income replacement?',
    answer:
      'Income replacement is the amount needed to replace lost income if the insured dies. It\'s calculated as annual income multiplied by years of coverage. This ensures dependents can maintain their standard of living.',
  },
  {
    question: 'Should I include Social Security benefits?',
    answer:
      'Social Security survivor benefits can reduce coverage needs, especially for families with young children. However, benefits may be limited and delayed, so many advisors recommend calculating needs without Social Security for conservative planning.',
  },
  {
    question: 'What about existing assets and savings?',
    answer:
      'Existing assets (savings, investments, retirement accounts) can reduce coverage needs. However, consider that some assets may be needed for retirement or other goals. Life insurance provides guaranteed protection separate from investment assets.',
  },
  {
    question: 'How do I account for inflation?',
    answer:
      'Coverage needs calculations typically use current dollar amounts. Consider that future expenses will increase with inflation. Some advisors use 3-5% inflation assumptions, while others use current dollars and plan to review coverage regularly.',
  },
  {
    question: 'What is the difference between term and whole life?',
    answer:
      'Term life insurance provides coverage for a specific period (10, 20, 30 years) at lower cost. Whole life provides permanent coverage with cash value but higher premiums. Most people use term life for income replacement needs.',
  },
  {
    question: 'How often should I review coverage needs?',
    answer:
      'Review coverage needs annually or when major life events occur: marriage, birth of children, income changes, debt changes, or changes in financial goals. Coverage needs typically decrease as children age and debts are paid off.',
  },
  {
    question: 'What if I have no dependents?',
    answer:
      'If you have no dependents, coverage needs may be minimal—just enough to cover final expenses and debts. However, consider future dependents, business partners, or estate planning needs when determining coverage.',
  },
];

const relatedCalculators = [
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund requirements.',
  },
  {
    name: 'Retirement Savings Calculator',
    slug: 'retirement-savings-calculator',
    description: 'Plan for retirement savings needs.',
  },
  {
    name: 'Net Worth Calculator',
    slug: 'net-worth-calculator',
    description: 'Calculate total net worth.',
  },
  {
    name: 'Break-Even Analysis Calculator',
    slug: 'break-even-analysis-calculator',
    description: 'Calculate when revenue covers expenses.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/life-insurance-coverage-needs-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Life Insurance Coverage Needs Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Life Insurance Coverage Needs Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate life insurance coverage needs based on income replacement, debts, final expenses, education funds, and emergency fund requirements.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const annualIncome = values.annualIncome;
  const yearsOfCoverage = values.yearsOfCoverage;
  const existingLifeInsurance = values.existingLifeInsurance || 0;
  const debts = values.debts || 0;
  const finalExpenses = values.finalExpenses || 0;
  const educationFunds = values.educationFunds || 0;
  const emergencyFund = values.emergencyFund || 0;

  // Calculate income replacement (typically 70-80% of income, using 75% as default)
  const incomeReplacement = annualIncome * 0.75 * yearsOfCoverage;

  // Calculate total needs
  const totalNeeds = incomeReplacement + debts + finalExpenses + educationFunds + emergencyFund;

  // Calculate recommended coverage (total needs minus existing coverage)
  const recommendedCoverage = Math.max(0, totalNeeds - existingLifeInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'The recommended life insurance coverage is calculated. Review coverage amount relative to your needs and ensure it adequately protects your dependents.';

  const coverageRatio = existingLifeInsurance > 0 ? (existingLifeInsurance / totalNeeds) * 100 : 0;

  if (recommendedCoverage <= 0) {
    status = 'optimal';
    interpretation = 'Existing life insurance coverage meets or exceeds calculated needs. Review coverage periodically as circumstances change, but current coverage appears adequate.';
  } else if (coverageRatio >= 80 && coverageRatio < 100) {
    status = 'good';
    interpretation = 'Existing coverage covers most needs. Consider small additional coverage to fully meet calculated needs, or review if some needs are overstated.';
  } else if (coverageRatio >= 50 && coverageRatio < 80) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some needs but significant gap remains. Consider increasing coverage to meet full calculated needs for adequate protection.';
  } else if (coverageRatio > 0 && coverageRatio < 50) {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to calculated needs. Significant additional coverage recommended to adequately protect dependents and meet financial obligations.';
  } else {
    status = 'low';
    interpretation = 'No existing life insurance coverage. Recommended coverage amount should be obtained to protect dependents and meet financial obligations in case of premature death.';
  }

  const recommendations = [
    `Review coverage needs: recommended coverage of ${recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${recommendedCoverage > 0 ? 'should be obtained' : 'is already met by existing coverage'}.`,
    'Consider term life insurance: for income replacement needs, term life insurance typically provides the best value with lower premiums than whole life for the same coverage amount.',
    'Review coverage regularly: reassess coverage needs annually or when major life events occur (marriage, children, income changes, debt changes).',
  ];
  if (recommendedCoverage > 0) {
    recommendations.push(`Coverage gap: ${recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} additional coverage needed to meet calculated needs. Consider obtaining term life insurance to fill this gap.`);
  }
  if (yearsOfCoverage > 20) {
    recommendations.push('Long coverage period: consider whether 20+ years of coverage is necessary. Coverage needs typically decrease as children age and debts are paid off.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate life insurance coverage needs: ${recommendedCoverage > 0 ? `${recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} recommended` : 'existing coverage appears adequate'}. Review with insurance professional.` },
    { label: 'This Month', detail: recommendedCoverage > 0 ? 'Obtain recommended life insurance coverage. Compare quotes from multiple insurers and select appropriate term length (10, 20, or 30 years) based on needs.' : 'Review existing coverage to ensure it remains adequate. Update beneficiaries and policy details as needed.' },
    { label: 'Ongoing', detail: 'Review coverage needs annually or when life circumstances change. Update coverage as income changes, debts are paid off, children age, or financial goals evolve.' },
  ];

  return {
    annualIncome,
    yearsOfCoverage,
    existingLifeInsurance,
    debts,
    finalExpenses,
    educationFunds,
    emergencyFund,
    incomeReplacement,
    totalNeeds,
    recommendedCoverage,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LifeInsuranceCoverageNeedsCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualIncome: undefined,
      yearsOfCoverage: undefined,
      existingLifeInsurance: undefined,
      debts: undefined,
      finalExpenses: undefined,
      educationFunds: undefined,
      emergencyFund: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="life-insurance-coverage-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Life Insurance Coverage Needs Calculator
          </CardTitle>
          <CardDescription>Calculate life insurance coverage needs based on income replacement, debts, final expenses, education funds, and emergency fund requirements.</CardDescription>
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
                  name="yearsOfCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Coverage</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="existingLifeInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Life Insurance ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Debts ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Expenses ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 15000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="educationFunds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Funds Needed ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyFund"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Fund Needed ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
            <CardDescription>See income replacement, total needs, recommended coverage, and coverage gap analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Income Replacement</p>
                <p className="text-2xl font-semibold text-primary">{result.incomeReplacement.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Needs</p>
                <p className="text-2xl font-semibold text-primary">{result.totalNeeds.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Coverage</p>
                <p className={`text-2xl font-semibold ${result.recommendedCoverage > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
            <strong>Income Replacement</strong> = Annual Income × 75% × Years of Coverage. Uses 75% of income as dependents typically need less than full income (no longer saving for retirement, etc.).
          </p>
          <p>
            <strong>Total Needs</strong> = Income Replacement + Debts + Final Expenses + Education Funds + Emergency Fund. This represents total financial needs if the insured dies.
          </p>
          <p>
            <strong>Recommended Coverage</strong> = Total Needs - Existing Life Insurance. This is the additional coverage needed to meet all financial obligations.
          </p>
          <p>
            <strong>Coverage Ratio</strong> = (Existing Coverage / Total Needs) × 100. Shows what percentage of needs are covered by existing insurance.
          </p>
          <p>Life insurance coverage needs ensure dependents can maintain their lifestyle, pay off debts, cover final expenses, fund education, and have emergency funds if the insured dies prematurely.</p>
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
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.totalNeeds > 0 ? `${((result.existingLifeInsurance / result.totalNeeds) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of total needs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Gap</p>
                <p className={`text-xl font-semibold ${result.recommendedCoverage > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {result.recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Monthly Income Need</p>
                <p className="text-xl font-semibold text-primary">{(result.annualIncome * 0.75 / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/month (75% of income)</p>
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
    <meta itemProp="name" content="The Definitive Guide to Life Insurance Coverage Needs: Calculating Adequate Life Insurance Protection" />
    <meta itemProp="description" content="A comprehensive guide to calculating life insurance coverage needs based on income replacement, debts, final expenses, education funds, and emergency fund requirements." />
    <meta itemProp="keywords" content="life insurance coverage, life insurance needs, income replacement, life insurance calculator, insurance coverage, financial protection, term life insurance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-life-insurance-coverage-needs-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Life Insurance Coverage Needs: Calculating Adequate Life Insurance Protection</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating life insurance coverage needs to ensure adequate financial protection for dependents.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Life Insurance Coverage Needs?</a></li>
        <li><a href="#calculation" className="hover:underline">Coverage Needs Calculation</a></li>
        <li><a href="#components" className="hover:underline">Components of Coverage Needs</a></li>
        <li><a href="#planning" className="hover:underline">Life Insurance Planning and Best Practices</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Life Insurance Coverage Needs?</h2>
    <p><b>Life insurance coverage needs</b> is the amount of insurance required to replace income, pay off debts, cover final expenses, fund education, and provide emergency funds for dependents if the insured dies. It ensures financial security for loved ones.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>Life insurance coverage needs answer: "How much insurance do I need to protect my family?" It's calculated as: <b>Total Needs = Income Replacement + Debts + Final Expenses + Education Funds + Emergency Fund - Existing Coverage</b>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Coverage Needs Matter</h3>
    <p>Calculating coverage needs is essential for:</p>
    <ul>
        <li><b>Financial security:</b> Ensuring dependents can maintain their lifestyle</li>
        <li><b>Debt protection:</b> Paying off mortgages, loans, and other debts</li>
        <li><b>Education funding:</b> Providing for children's education expenses</li>
        <li><b>Peace of mind:</b> Knowing loved ones are financially protected</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coverage Needs Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Total Needs = Income Replacement + Debts + Final Expenses + Education + Emergency Fund</b></p>
    </div>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>Recommended Coverage = Total Needs - Existing Life Insurance</b></p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Income Replacement</h3>
    <p>Income replacement typically uses 70-80% of annual income (75% is common) multiplied by years of coverage. Dependents need less than full income as the insured no longer needs retirement savings, personal expenses, etc.</p>

<hr />

    <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Components of Coverage Needs</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Income Replacement</h3>
    <p>Replace lost income for a specified period (typically 10-20 years). Calculate as: Annual Income × 75% × Years of Coverage. Plan until children reach adulthood or spouse can be self-sufficient.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Debts</h3>
    <p>Include all debts: mortgage, car loans, credit cards, personal loans, student loans. Life insurance should cover these to prevent dependents from inheriting debt burden.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Final Expenses</h3>
    <p>Include funeral costs, medical bills, estate settlement costs, and other final expenses. Typically $10,000-$25,000, but can vary based on location and preferences.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Education Funds</h3>
    <p>Estimate future education costs for children. Consider current college costs, inflation, and number of children. This ensures children's education is funded even if the insured dies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">5. Emergency Fund</h3>
    <p>Provide emergency fund for unexpected expenses. Typically 3-6 months of expenses, ensuring dependents have liquidity for emergencies without liquidating other assets.</p>

<hr />

    <h2 id="planning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Life Insurance Planning and Best Practices</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Term vs Whole Life</h3>
    <p><b>Term life insurance</b> provides coverage for a specific period (10, 20, 30 years) at lower cost and is ideal for income replacement needs. <b>Whole life</b> provides permanent coverage with cash value but higher premiums. Most people use term life for coverage needs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Review and Update</h3>
    <p>Review coverage needs annually or when major life events occur: marriage, birth of children, income changes, debt changes, or changes in financial goals. Coverage needs typically decrease as children age and debts are paid off.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul>
        <li><b>Use term life:</b> For income replacement, term life provides best value</li>
        <li><b>Review regularly:</b> Update coverage as circumstances change</li>
        <li><b>Consider both spouses:</b> Calculate coverage needs for both working and non-working spouses</li>
        <li><b>Factor in assets:</b> Consider existing assets but don't rely solely on investments</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Life insurance coverage needs</b> ensure financial protection for dependents. Calculate as income replacement plus debts, final expenses, education funds, and emergency fund, minus existing coverage. Review coverage needs regularly and update as life circumstances change. Term life insurance typically provides the best value for income replacement needs.</p>
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
          <p>This tool calculates life insurance coverage needs based on income replacement, debts, final expenses, education funds, and emergency fund requirements.</p>
          <p>Outputs include income replacement, total needs, recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

