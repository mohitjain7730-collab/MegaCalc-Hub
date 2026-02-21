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
  currentAge: z.number({ invalid_type_error: 'Enter current age' }).min(18).max(100),
  retirementAge: z.number({ invalid_type_error: 'Enter retirement age' }).min(50).max(100),
  annualIncome: z.number({ invalid_type_error: 'Enter annual income' }).min(0),
  annualExpenses: z.number({ invalid_type_error: 'Enter annual expenses' }).min(0),
  discountRate: z.number({ invalid_type_error: 'Enter discount rate' }).min(0).max(15).optional(),
  inflationRate: z.number({ invalid_type_error: 'Enter inflation rate' }).min(0).max(10).optional(),
  existingLifeInsurance: z.number({ invalid_type_error: 'Enter existing life insurance' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentAge: number;
  retirementAge: number;
  annualIncome: number;
  annualExpenses: number;
  discountRate: number;
  inflationRate: number;
  existingLifeInsurance: number;
  yearsToRetirement: number;
  netAnnualContribution: number;
  presentValueOfFutureEarnings: number;
  humanLifeValue: number;
  recommendedCoverage: number;
  coverageGap: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter current age and expected retirement age.',
  'Enter annual income and annual expenses.',
  'Optionally enter discount rate (typically 3-5%) and inflation rate (typically 2-3%).',
  'Optionally enter existing life insurance coverage.',
  'Review human life value, present value of future earnings, and recommended coverage.',
];

const faqs = [
  {
    question: 'What is Human Life Value (HLV)?',
    answer:
      'Human Life Value is the economic value of a person\'s life, calculated as the present value of future earnings minus personal expenses. It represents the financial contribution a person makes to their dependents over their working lifetime.',
  },
  {
    question: 'How is HLV calculated?',
    answer:
      'HLV = Present Value of (Annual Income - Annual Expenses) over remaining working years. It discounts future earnings to present value using a discount rate, accounting for inflation and time value of money.',
  },
  {
    question: 'What is the discount rate?',
    answer:
      'Discount rate accounts for time value of money and risk. Typical rates are 3-5%. Higher rates reduce present value (more conservative), lower rates increase present value. Use 3-4% for conservative estimates, 5-6% for moderate risk.',
  },
  {
    question: 'How does inflation affect HLV?',
    answer:
      'Inflation reduces purchasing power over time. If income grows with inflation but expenses also increase, net contribution may remain constant in real terms. HLV calculations typically use real (inflation-adjusted) rates or nominal rates with inflation adjustments.',
  },
  {
    question: 'What is the difference between HLV and life insurance needs?',
    answer:
      'HLV calculates economic value based on earnings. Life insurance needs also consider debts, final expenses, education funds, and emergency funds. HLV provides a baseline, but actual coverage needs may be higher or lower.',
  },
  {
    question: 'Should I use HLV for life insurance coverage?',
    answer:
      'HLV provides a starting point for life insurance coverage, but also consider: debts, final expenses, education funds, emergency funds, and spouse\'s earning capacity. Coverage needs may be higher or lower than HLV depending on circumstances.',
  },
  {
    question: 'How does age affect HLV?',
    answer:
      'HLV decreases with age as remaining working years decrease. A 30-year-old with 35 years to retirement has higher HLV than a 50-year-old with 15 years. Younger individuals typically need more coverage relative to current income.',
  },
  {
    question: 'What about income growth?',
    answer:
      'HLV calculations can account for expected income growth. If income grows faster than inflation, HLV increases. However, many calculations assume constant real income (income grows with inflation) for simplicity and conservatism.',
  },
  {
    question: 'How do I account for spouse income?',
    answer:
      'If spouse has significant income, HLV and coverage needs may be lower as dependents have alternative income source. However, consider: what if spouse also dies, or if spouse income is insufficient to maintain lifestyle.',
  },
  {
    question: 'Should HLV be recalculated regularly?',
    answer:
      'Yes, recalculate HLV annually or when major changes occur: income changes, expenses change, age increases, retirement plans change, or family circumstances change (marriage, children, divorce). HLV typically decreases as you approach retirement.',
  },
];

const relatedCalculators = [
  {
    name: 'Life Insurance Coverage Needs Calculator',
    slug: 'life-insurance-coverage-needs-calculator',
    description: 'Calculate life insurance coverage needs.',
  },
  {
    name: 'Life Insurance Premium Estimator',
    slug: 'life-insurance-premium-estimator',
    description: 'Estimate life insurance premiums.',
  },
  {
    name: 'Term vs Whole Life Comparison Calculator',
    slug: 'term-vs-whole-life-comparison-calculator',
    description: 'Compare term and whole life insurance.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/human-life-value-hlv-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Human Life Value (HLV) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Human Life Value (HLV) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate human life value - the economic value of a person\'s life based on present value of future earnings minus expenses.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentAge = values.currentAge;
  const retirementAge = values.retirementAge;
  const annualIncome = values.annualIncome;
  const annualExpenses = values.annualExpenses;
  const discountRate = values.discountRate || 4;
  const inflationRate = values.inflationRate || 2.5;
  const existingLifeInsurance = values.existingLifeInsurance || 0;

  // Calculate years to retirement
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Net annual contribution (income minus personal expenses)
  const netAnnualContribution = annualIncome - annualExpenses;

  // Calculate present value of future earnings
  // Using real discount rate (discount rate - inflation rate) for conservative estimate
  const realDiscountRate = (discountRate - inflationRate) / 100;
  
  let presentValueOfFutureEarnings = 0;
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Future value of net contribution, discounted to present
    const futureValue = netAnnualContribution * Math.pow(1 + inflationRate / 100, year);
    const presentValue = futureValue / Math.pow(1 + discountRate / 100, year);
    presentValueOfFutureEarnings += presentValue;
  }

  // Human Life Value = Present Value of Future Earnings
  const humanLifeValue = presentValueOfFutureEarnings;

  // Recommended coverage (HLV, but may need adjustment for other needs)
  const recommendedCoverage = humanLifeValue;

  // Coverage gap
  const coverageGap = Math.max(0, recommendedCoverage - existingLifeInsurance);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Human Life Value calculated. This represents the economic value of future earnings. Consider additional factors (debts, final expenses, education) when determining actual coverage needs.';

  const coverageRatio = existingLifeInsurance > 0 ? (existingLifeInsurance / humanLifeValue) * 100 : 0;

  if (coverageGap <= 0) {
    status = 'optimal';
    interpretation = 'Existing life insurance coverage meets or exceeds Human Life Value. Consider whether additional coverage is needed for debts, final expenses, or education funds beyond HLV.';
  } else if (coverageRatio >= 70) {
    status = 'good';
    interpretation = 'Existing coverage covers most of Human Life Value. Consider small additional coverage to fully meet HLV, or review if other needs (debts, education) require additional coverage.';
  } else if (coverageRatio >= 40) {
    status = 'moderate';
    interpretation = 'Existing coverage covers some of Human Life Value, but significant gap remains. Consider increasing coverage to meet HLV and other financial obligations.';
  } else {
    status = 'low';
    interpretation = 'Existing coverage is insufficient relative to Human Life Value. Significant additional coverage recommended to adequately protect dependents and meet financial obligations.';
  }

  const recommendations = [
    `Human Life Value: ${humanLifeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} represents the present value of future earnings over ${yearsToRetirement} years. This is the economic value of your life.`,
    `Net annual contribution: ${netAnnualContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year (income - expenses). This is the amount available to support dependents.`,
    `Coverage gap: ${coverageGap > 0 ? coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'None'} additional coverage needed to meet Human Life Value. Consider also debts, final expenses, and education funds.`,
  ];
  if (coverageGap > 0) {
    recommendations.push(`Recommended coverage: ${recommendedCoverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} based on HLV. However, also consider: debts, final expenses, education funds, and emergency funds when determining total coverage needs.`);
  }
  if (yearsToRetirement > 30) {
    recommendations.push('Long working horizon: With many years to retirement, HLV is high. Consider term life insurance for cost-effective coverage over your working years.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate Human Life Value: ${humanLifeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Review coverage gap of ${coverageGap.toLocaleString(undefined, { maximumFractionDigits: 0 })} and assess total coverage needs.` },
    { label: 'This Month', detail: coverageGap > 0 ? 'Obtain additional life insurance coverage to meet HLV and other needs (debts, final expenses, education). Consider term life insurance for cost-effective coverage.' : 'Review existing coverage to ensure it remains adequate. Consider whether additional coverage is needed for debts, final expenses, or education beyond HLV.' },
    { label: 'Ongoing', detail: 'Recalculate HLV annually or when circumstances change (income, expenses, age, retirement plans). Update coverage as needed to maintain adequate protection for dependents.' },
  ];

  return {
    currentAge,
    retirementAge,
    annualIncome,
    annualExpenses,
    discountRate,
    inflationRate,
    existingLifeInsurance,
    yearsToRetirement,
    netAnnualContribution,
    presentValueOfFutureEarnings,
    humanLifeValue,
    recommendedCoverage,
    coverageGap,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function HumanLifeValueHlvCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      retirementAge: undefined,
      annualIncome: undefined,
      annualExpenses: undefined,
      discountRate: undefined,
      inflationRate: undefined,
      existingLifeInsurance: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="human-life-value-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Human Life Value (HLV) Calculator
          </CardTitle>
          <CardDescription>Calculate human life value - the economic value of a person's life based on present value of future earnings minus expenses.</CardDescription>
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
                  name="currentAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retirementAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retirement Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="annualExpenses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Expenses ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 40000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate HLV
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
            <CardDescription>See Human Life Value, present value of future earnings, recommended coverage, and coverage gap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Human Life Value</p>
                <p className="text-2xl font-semibold text-primary">{result.humanLifeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Annual Contribution</p>
                <p className="text-2xl font-semibold text-primary">{result.netAnnualContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$/year</p>
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
            <strong>Years to Retirement</strong> = Retirement Age - Current Age. Number of remaining working years.
          </p>
          <p>
            <strong>Net Annual Contribution</strong> = Annual Income - Annual Expenses. Amount available to support dependents after personal expenses.
          </p>
          <p>
            <strong>Present Value of Future Earnings</strong> = Sum of [Net Contribution Ã— (1 + Inflation)^Year / (1 + Discount Rate)^Year] for each year to retirement. Discounts future earnings to present value.
          </p>
          <p>
            <strong>Human Life Value (HLV)</strong> = Present Value of Future Earnings. Represents the economic value of a person's life based on future earnings potential.
          </p>
          <p>
            <strong>Recommended Coverage</strong> = Human Life Value. Starting point for life insurance coverage, but also consider debts, final expenses, and education funds.
          </p>
          <p>
            <strong>Coverage Gap</strong> = Recommended Coverage - Existing Life Insurance. Additional coverage needed to meet HLV.
          </p>
          <p>Human Life Value calculates the economic value of a person's life as the present value of future earnings minus expenses. It provides a baseline for life insurance coverage, but actual needs may include additional factors like debts and education funds.</p>
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
                <p className="text-sm text-muted-foreground">Years to Retirement</p>
                <p className="text-xl font-semibold text-primary">{result.yearsToRetirement}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Coverage Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.humanLifeValue > 0 ? `${((result.existingLifeInsurance / result.humanLifeValue) * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Of HLV</p>
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
    <meta itemProp="name" content="The Definitive Guide to Human Life Value: Calculating Economic Value of Human Life" />
    <meta itemProp="description" content="A comprehensive guide to calculating Human Life Value (HLV) - the economic value of a person's life based on present value of future earnings minus expenses." />
    <meta itemProp="keywords" content="human life value, HLV, economic value, life insurance coverage, present value, future earnings, insurance planning" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-human-life-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Human Life Value: Calculating Economic Value of Human Life</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to calculating Human Life Value (HLV) - the economic value of a person's life based on present value of future earnings.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: What is Human Life Value?</a></li>
        <li><a href="#calculation" className="hover:underline">HLV Calculation</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting HLV</a></li>
        <li><a href="#application" className="hover:underline">Application to Life Insurance</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: What is Human Life Value?</h2>
    <p><b>Human Life Value (HLV)</b> is the economic value of a person's life, calculated as the present value of future earnings minus personal expenses. It represents the financial contribution a person makes to their dependents over their working lifetime.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Core Concept</h3>
    <p>HLV answers: "What is the economic value of my life to my dependents?" It's calculated as: <b>HLV = Present Value of (Annual Income - Annual Expenses) over remaining working years</b>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why HLV Matters</h3>
    <p>HLV provides a baseline for:</p>
    <ul>
        <li><b>Life insurance coverage:</b> Starting point for determining coverage needs</li>
        <li><b>Financial planning:</b> Understanding economic contribution to family</li>
        <li><b>Estate planning:</b> Assessing financial impact of premature death</li>
        <li><b>Risk management:</b> Quantifying financial risk of death or disability</li>
    </ul>

<hr />

    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HLV Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Basic Formula</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-lg font-mono"><b>HLV = Î£ [Net Contribution Ã— (1 + Inflation)^Year / (1 + Discount Rate)^Year]</b></p>
    </div>
    <p>Where Net Contribution = Annual Income - Annual Expenses, summed over remaining working years, discounted to present value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Components</h3>
    <ul>
        <li><b>Annual Income:</b> Current or expected future income</li>
        <li><b>Annual Expenses:</b> Personal expenses that won't be needed if person dies</li>
        <li><b>Discount Rate:</b> Accounts for time value of money (typically 3-5%)</li>
        <li><b>Inflation Rate:</b> Expected inflation (typically 2-3%)</li>
        <li><b>Years to Retirement:</b> Remaining working years</li>
    </ul>

<hr />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting HLV</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">1. Age</h3>
    <p>HLV decreases with age as remaining working years decrease. A 30-year-old with 35 years to retirement has higher HLV than a 50-year-old with 15 years.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Income and Expenses</h3>
    <p>Higher income and lower expenses increase HLV. Net contribution (income - expenses) is the key driver. Higher earners with lower expenses have significantly higher HLV.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Discount Rate</h3>
    <p>Higher discount rates reduce present value (more conservative). Lower rates increase present value. Use 3-4% for conservative estimates, 5-6% for moderate risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">4. Inflation</h3>
    <p>Inflation affects both income and expenses. If both grow with inflation, net contribution remains constant in real terms. HLV calculations typically use real (inflation-adjusted) discount rates.</p>

<hr />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application to Life Insurance</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">HLV as Baseline</h3>
    <p>HLV provides a starting point for life insurance coverage, but also consider: debts, final expenses, education funds, emergency funds, and spouse's earning capacity. Coverage needs may be higher or lower than HLV.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Additional Considerations</h3>
    <ul>
        <li><b>Debts:</b> Mortgage, loans, credit cards</li>
        <li><b>Final expenses:</b> Funeral, medical bills, estate settlement</li>
        <li><b>Education funds:</b> Children's education costs</li>
        <li><b>Emergency fund:</b> 3-6 months of expenses</li>
        <li><b>Spouse income:</b> Alternative income source reduces needs</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Human Life Value</b> calculates the economic value of a person's life as the present value of future earnings minus expenses. It provides a baseline for life insurance coverage, but actual needs may include additional factors. Recalculate HLV annually or when circumstances change, as it typically decreases as you approach retirement.</p>
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
          <p>This tool calculates Human Life Value - the economic value of a person's life based on present value of future earnings minus expenses.</p>
          <p>Outputs include Human Life Value, net annual contribution, present value of future earnings, recommended coverage, coverage gap, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
