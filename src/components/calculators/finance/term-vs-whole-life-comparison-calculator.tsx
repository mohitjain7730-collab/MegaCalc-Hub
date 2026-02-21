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
  coverageAmount: z.number({ invalid_type_error: 'Enter coverage amount' }).min(0),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  termYears: z.number({ invalid_type_error: 'Enter term years' }).min(10).max(40),
  termAnnualPremium: z.number({ invalid_type_error: 'Enter term annual premium' }).min(0),
  wholeLifeAnnualPremium: z.number({ invalid_type_error: 'Enter whole life annual premium' }).min(0),
  wholeLifeCashValueRate: z.number({ invalid_type_error: 'Enter cash value growth rate' }).min(0).max(10).optional(),
  yearsToCompare: z.number({ invalid_type_error: 'Enter years to compare' }).min(1).max(50),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  coverageAmount: number;
  age: number;
  termYears: number;
  termAnnualPremium: number;
  wholeLifeAnnualPremium: number;
  wholeLifeCashValueRate: number;
  yearsToCompare: number;
  termTotalCost: number;
  wholeLifeTotalCost: number;
  wholeLifeCashValue: number;
  wholeLifeNetCost: number;
  savingsWithTerm: number;
  breakEvenYear: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter coverage amount and your age.',
  'Enter term policy details (term years and annual premium).',
  'Enter whole life policy details (annual premium and cash value growth rate).',
  'Enter number of years to compare (typically 20-30 years).',
  'Review total costs, cash value, net cost, and break-even analysis.',
];

const faqs = [
  {
    question: 'What is the difference between term and whole life insurance?',
    answer:
      'Term life insurance provides coverage for a specific period (10, 20, 30 years) at lower premiums but no cash value. Whole life provides permanent coverage with cash value accumulation but higher premiums.',
  },
  {
    question: 'Which is better: term or whole life?',
    answer:
      'Term life is typically better for income replacement needs due to lower cost. Whole life may be suitable for estate planning, permanent coverage needs, or if you want cash value accumulation, but it\'s significantly more expensive.',
  },
  {
    question: 'What is cash value in whole life insurance?',
    answer:
      'Cash value is a savings component in whole life insurance that grows tax-deferred. You can borrow against it or surrender the policy for cash, but it reduces the death benefit. Growth rates typically range from 2-6% annually.',
  },
  {
    question: 'How do I calculate break-even point?',
    answer:
      'Break-even point is when whole life cash value plus premiums paid equals total term premiums. This typically occurs after 15-25 years, but term life usually provides better value for income replacement needs.',
  },
  {
    question: 'What is the cost difference?',
    answer:
      'Whole life premiums are typically 5-15 times higher than term life for the same coverage amount. The difference can be invested elsewhere, often providing better returns than whole life cash value growth.',
  },
  {
    question: 'When should I consider whole life?',
    answer:
      'Consider whole life for: estate planning needs, permanent coverage requirements, forced savings discipline, or if you\'ve maxed out other tax-advantaged accounts. Most people are better served with term life.',
  },
  {
    question: 'Can I convert term to whole life?',
    answer:
      'Many term policies include conversion options allowing you to convert to whole life without medical underwriting. This provides flexibility but conversion premiums are typically higher than new whole life policies.',
  },
  {
    question: 'What about investment returns?',
    answer:
      'If you invest the premium difference between term and whole life in a diversified portfolio, you typically achieve better returns than whole life cash value growth (2-6%) over long periods.',
  },
  {
    question: 'How does age affect the comparison?',
    answer:
      'Younger individuals benefit more from term life due to lower premiums. Whole life becomes relatively more expensive as you age. Term life premiums increase at renewal, while whole life premiums remain level.',
  },
  {
    question: 'What are the tax implications?',
    answer:
      'Term life premiums are not tax-deductible. Whole life cash value grows tax-deferred, and loans are typically tax-free. Death benefits are generally tax-free for both types. Consult a tax advisor for specifics.',
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
    name: 'Human Life Value (HLV) Calculator',
    slug: 'human-life-value-hlv-calculator',
    description: 'Calculate economic value of human life.',
  },
  {
    name: 'Disability Insurance Coverage Calculator',
    slug: 'disability-insurance-coverage-calculator',
    description: 'Calculate disability insurance needs.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/term-vs-whole-life-comparison-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Term vs Whole Life Comparison Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Term vs Whole Life Comparison Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Compare term life and whole life insurance costs, cash value, and break-even analysis to make informed insurance decisions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const coverageAmount = values.coverageAmount;
  const age = values.age;
  const termYears = values.termYears;
  const termAnnualPremium = values.termAnnualPremium;
  const wholeLifeAnnualPremium = values.wholeLifeAnnualPremium;
  const wholeLifeCashValueRate = values.wholeLifeCashValueRate || 3;
  const yearsToCompare = values.yearsToCompare;

  // Calculate term total cost (assume term is renewed at same rate for simplicity, or stops after term years)
  const termTotalCost = Math.min(termYears, yearsToCompare) * termAnnualPremium;

  // Calculate whole life total cost
  const wholeLifeTotalCost = wholeLifeAnnualPremium * yearsToCompare;

  // Calculate whole life cash value (simplified: assumes linear growth from 0, with compound interest)
  // Cash value typically starts accumulating after year 1-2, grows slowly initially
  let wholeLifeCashValue = 0;
  for (let year = 1; year <= yearsToCompare; year++) {
    // Simplified: assume cash value starts accumulating from year 2, grows at specified rate
    if (year >= 2) {
      const annualContribution = wholeLifeAnnualPremium * 0.3; // Roughly 30% of premium goes to cash value
      wholeLifeCashValue = wholeLifeCashValue * (1 + wholeLifeCashValueRate / 100) + annualContribution;
    }
  }

  // Net cost of whole life (premiums paid minus cash value)
  const wholeLifeNetCost = wholeLifeTotalCost - wholeLifeCashValue;

  // Savings with term (difference in premiums, assuming invested)
  const savingsWithTerm = wholeLifeTotalCost - termTotalCost;

  // Break-even year (when cash value + premiums = term premiums)
  let breakEvenYear = 0;
  let cumulativeCashValue = 0;
  for (let year = 1; year <= 50; year++) {
    if (year >= 2) {
      const annualContribution = wholeLifeAnnualPremium * 0.3;
      cumulativeCashValue = cumulativeCashValue * (1 + wholeLifeCashValueRate / 100) + annualContribution;
    }
    const wholeLifeCostToDate = wholeLifeAnnualPremium * year;
    const termCostToDate = Math.min(termYears, year) * termAnnualPremium;
    if (cumulativeCashValue + wholeLifeCostToDate >= termCostToDate && breakEvenYear === 0) {
      breakEvenYear = year;
      break;
    }
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Comparison shows term life typically provides better value for income replacement needs. Whole life may be suitable for permanent coverage or estate planning.';

  if (wholeLifeNetCost < termTotalCost && yearsToCompare <= termYears) {
    status = 'moderate';
    interpretation = 'Whole life net cost is lower than term cost within the comparison period, but this assumes you surrender the policy. Term life typically provides better long-term value for income replacement.';
  } else if (savingsWithTerm > coverageAmount * 0.5) {
    status = 'optimal';
    interpretation = 'Significant savings with term life insurance. The premium difference can be invested elsewhere, typically providing better returns than whole life cash value growth.';
  } else {
    status = 'good';
    interpretation = 'Term life provides cost savings. Consider your specific needs: term for income replacement, whole life for permanent coverage or estate planning.';
  }

  const recommendations = [
    `Cost comparison: Term life costs ${termTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs whole life ${wholeLifeTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${yearsToCompare} years. Savings with term: ${savingsWithTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
    `Cash value analysis: Whole life cash value of ${wholeLifeCashValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} after ${yearsToCompare} years. Net cost (premiums - cash value): ${wholeLifeNetCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
    breakEvenYear > 0 ? `Break-even point: ${breakEvenYear} years. After this point, whole life cash value plus premiums may exceed term costs, but term life typically provides better value when premium difference is invested.` : 'Break-even analysis: Whole life does not break even within typical policy duration. Term life provides better value for income replacement needs.',
  ];
  if (savingsWithTerm > 0) {
    recommendations.push(`Investment opportunity: Invest the ${savingsWithTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} premium difference in a diversified portfolio. Historical returns (7-10% annually) typically exceed whole life cash value growth (2-6%).`);
  }

  const plan = [
    { label: 'This Week', detail: `Compare term vs whole life: Review costs, cash value, and break-even analysis. Term life saves ${savingsWithTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })} over ${yearsToCompare} years.` },
    { label: 'This Month', detail: 'Evaluate your needs: If you need income replacement, term life is typically better. If you need permanent coverage or estate planning, consider whole life but understand the higher cost.' },
    { label: 'Ongoing', detail: 'Review insurance needs regularly. As circumstances change (income, dependents, assets), reassess whether term or whole life better serves your goals.' },
  ];

  return {
    coverageAmount,
    age,
    termYears,
    termAnnualPremium,
    wholeLifeAnnualPremium,
    wholeLifeCashValueRate,
    yearsToCompare,
    termTotalCost,
    wholeLifeTotalCost,
    wholeLifeCashValue,
    wholeLifeNetCost,
    savingsWithTerm,
    breakEvenYear,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function TermVsWholeLifeComparisonCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverageAmount: undefined,
      age: undefined,
      termYears: undefined,
      termAnnualPremium: undefined,
      wholeLifeAnnualPremium: undefined,
      wholeLifeCashValueRate: undefined,
      yearsToCompare: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="term-vs-whole-life-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Term vs Whole Life Comparison Calculator
          </CardTitle>
          <CardDescription>Compare term life and whole life insurance costs, cash value, and break-even analysis to make informed insurance decisions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your insurance details</CardTitle>
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
                  name="coverageAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Policy Years</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="termAnnualPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term Annual Premium ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 800" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wholeLifeAnnualPremium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Whole Life Annual Premium ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wholeLifeCashValueRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Value Growth Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsToCompare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years to Compare</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Compare policies
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
            <CardDescription>See cost comparison, cash value, net cost, and break-even analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Term Total Cost</p>
                <p className="text-2xl font-semibold text-primary">{result.termTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Whole Life Total Cost</p>
                <p className="text-2xl font-semibold text-primary">{result.wholeLifeTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Whole Life Cash Value</p>
                <p className="text-2xl font-semibold text-primary">{result.wholeLifeCashValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Savings with Term</p>
                <p className="text-2xl font-semibold text-green-600">{result.savingsWithTerm.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
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
            <strong>Term Total Cost</strong> = Term Annual Premium Ã— Min(Term Years, Years to Compare). Represents total premiums paid for term coverage.
          </p>
          <p>
            <strong>Whole Life Total Cost</strong> = Whole Life Annual Premium Ã— Years to Compare. Represents total premiums paid for whole life coverage.
          </p>
          <p>
            <strong>Whole Life Cash Value</strong> = Accumulated cash value with compound growth. Typically 30% of premiums go to cash value, growing at 2-6% annually.
          </p>
          <p>
            <strong>Whole Life Net Cost</strong> = Whole Life Total Cost - Cash Value. Represents actual cost after accounting for cash value accumulation.
          </p>
          <p>
            <strong>Savings with Term</strong> = Whole Life Total Cost - Term Total Cost. The premium difference that can be invested elsewhere.
          </p>
          <p>
            <strong>Break-Even Year</strong> = Year when whole life cash value + premiums paid equals term premiums paid. Typically occurs after 15-25 years.
          </p>
          <p>Term life insurance provides coverage for a specific period at lower cost. Whole life provides permanent coverage with cash value but higher premiums. Most people are better served with term life for income replacement needs.</p>
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
                <p className="text-sm text-muted-foreground">Whole Life Net Cost</p>
                <p className="text-xl font-semibold text-primary">{result.wholeLifeNetCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">$ (premiums - cash value)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Break-Even Year</p>
                <p className="text-xl font-semibold text-primary">{result.breakEvenYear > 0 ? result.breakEvenYear : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Premium Ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {result.termAnnualPremium > 0 ? (result.wholeLifeAnnualPremium / result.termAnnualPremium).toFixed(1) : 'N/A'}x
                </p>
                <p className="text-xs text-muted-foreground">Whole life / Term</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your insurance details to see additional insights.</p>
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
    <meta itemProp="name" content="The Definitive Guide to Term vs Whole Life Insurance: Comparing Life Insurance Options" />
    <meta itemProp="description" content="A comprehensive guide to comparing term life and whole life insurance, including cost analysis, cash value, break-even points, and when to choose each type." />
    <meta itemProp="keywords" content="term life insurance, whole life insurance, life insurance comparison, cash value, break-even analysis, permanent life insurance" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-term-vs-whole-life-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Term vs Whole Life Insurance: Comparing Life Insurance Options</h1>
    <p className="text-lg italic text-gray-700">A comprehensive guide to comparing term life and whole life insurance, including cost analysis, cash value accumulation, and when each type is appropriate.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#overview" className="hover:underline">Overview: Term vs Whole Life Insurance</a></li>
        <li><a href="#comparison" className="hover:underline">Cost and Value Comparison</a></li>
        <li><a href="#cash" className="hover:underline">Cash Value and Investment Component</a></li>
        <li><a href="#when" className="hover:underline">When to Choose Each Type</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Term vs Whole Life Insurance</h2>
    <p><b>Term life insurance</b> provides coverage for a specific period (10, 20, 30 years) at lower premiums but no cash value. <b>Whole life insurance</b> provides permanent coverage with cash value accumulation but significantly higher premiums.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Differences</h3>
    <ul>
        <li><b>Coverage duration:</b> Term is temporary (10-30 years), whole life is permanent</li>
        <li><b>Premiums:</b> Term premiums are 5-15x lower than whole life for same coverage</li>
        <li><b>Cash value:</b> Term has no cash value, whole life accumulates cash value over time</li>
        <li><b>Flexibility:</b> Term is simple and flexible, whole life is complex with investment component</li>
    </ul>

<hr />

    <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cost and Value Comparison</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Premium Comparison</h3>
    <p>Whole life premiums are typically 5-15 times higher than term life for the same coverage amount. For example, a $1M 20-year term policy might cost $800/year, while whole life could cost $12,000/year.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Total Cost Analysis</h3>
    <p>Over 20 years, term life might cost $16,000 total, while whole life costs $240,000. The $224,000 difference can be invested elsewhere, typically providing better returns than whole life cash value growth (2-6% annually).</p>

<hr />

    <h2 id="cash" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cash Value and Investment Component</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">How Cash Value Works</h3>
    <p>Whole life insurance includes a cash value component that grows tax-deferred. Typically, 30% of premiums go to cash value, which grows at 2-6% annually. You can borrow against it or surrender the policy for cash.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Break-Even Analysis</h3>
    <p>Break-even point is when whole life cash value plus premiums paid equals total term premiums. This typically occurs after 15-25 years, but term life usually provides better value when the premium difference is invested in a diversified portfolio.</p>

<hr />

    <h2 id="when" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When to Choose Each Type</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Choose Term Life For</h3>
    <ul>
        <li><b>Income replacement:</b> Protecting dependents during working years</li>
        <li><b>Mortgage protection:</b> Covering mortgage debt</li>
        <li><b>Cost efficiency:</b> Maximum coverage for minimum cost</li>
        <li><b>Flexibility:</b> Ability to adjust coverage as needs change</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Consider Whole Life For</h3>
    <ul>
        <li><b>Estate planning:</b> Permanent coverage for estate tax planning</li>
        <li><b>Forced savings:</b> Discipline of regular premium payments</li>
        <li><b>Permanent needs:</b> Coverage that never expires</li>
        <li><b>Maxed tax-advantaged accounts:</b> Additional tax-deferred growth</li>
    </ul>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Term life insurance</b> typically provides better value for income replacement needs due to significantly lower cost. <b>Whole life insurance</b> may be suitable for permanent coverage, estate planning, or forced savings, but comes with much higher premiums. Most people are better served with term life, investing the premium difference elsewhere for better returns.</p>
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
          <p>This tool compares term life and whole life insurance costs, cash value, and break-even analysis.</p>
          <p>Outputs include total costs, cash value, net cost, savings with term, break-even year, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
