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
  replacementCost: z.number({ invalid_type_error: 'Enter replacement cost' }).min(0),
  age: z.number({ invalid_type_error: 'Enter age' }).min(0),
  usefulLife: z.number({ invalid_type_error: 'Enter useful life' }).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  replacementCost: number;
  age: number;
  usefulLife: number;
  depreciationPercent: number;
  depreciationAmount: number;
  actualCashValue: number;
  replacementValue: number;
  difference: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter replacement cost (current cost to replace with new item).',
  'Enter age of item (years since purchase or construction).',
  'Enter useful life (expected lifespan in years).',
  'Review actual cash value, replacement value, and depreciation calculations.',
];

const faqs = [
  {
    question: 'What is replacement cost?',
    answer:
      'Replacement cost is the current cost to replace damaged property with new property of similar kind and quality, without deducting for depreciation. It represents the full cost to purchase new items or rebuild structures at current prices.',
  },
  {
    question: 'What is actual cash value (ACV)?',
    answer:
      'Actual cash value (ACV) is calculated by taking replacement cost and subtracting depreciation. ACV accounts for age, wear and tear, and obsolescence. Formula: ACV = Replacement Cost - Depreciation.',
  },
  {
    question: 'How is depreciation calculated?',
    answer:
      'Depreciation is calculated as: Depreciation % = (Age / Useful Life) Ã— 100. Depreciation Amount = Replacement Cost Ã— Depreciation %. Straight-line depreciation assumes equal wear over useful life.',
  },
  {
    question: 'What is useful life?',
    answer:
      'Useful life is the expected lifespan of an item. For example: roofs (20-30 years), HVAC systems (15-20 years), appliances (10-15 years), vehicles (10-15 years). Useful life varies by item type and quality.',
  },
  {
    question: 'Which is better: replacement cost or ACV coverage?',
    answer:
      'Replacement cost coverage provides more comprehensive protection by covering full replacement cost without depreciation. ACV coverage has lower premiums but may result in higher out-of-pocket expenses after a loss due to depreciation deductions.',
  },
  {
    question: 'How does age affect insurance value?',
    answer:
      'Older items have higher depreciation, resulting in lower actual cash value. A 10-year-old roof with 20-year useful life has 50% depreciation. A 5-year-old roof has 25% depreciation. Newer items have lower depreciation.',
  },
  {
    question: 'What about functional obsolescence?',
    answer:
      'Functional obsolescence (outdated features, design changes) may reduce value beyond age-based depreciation. Some policies account for functional obsolescence, while others use only age-based depreciation.',
  },
  {
    question: 'How do I determine replacement cost?',
    answer:
      'Replacement cost can be determined by: contractor estimates, construction cost databases, appraisals, or insurance company estimates. For homes, use square footage Ã— local construction costs per square foot.',
  },
  {
    question: 'What about inflation?',
    answer:
      'Replacement costs increase with inflation. Review and update coverage limits annually to account for inflation. Many policies include inflation protection riders that automatically adjust coverage limits.',
  },
  {
    question: 'How often should I review replacement value?',
    answer:
      'Review replacement value annually or when: construction costs change significantly, renovations are completed, or market conditions change. Ensure coverage limits match current replacement costs to avoid underinsurance.',
  },
];

const relatedCalculators = [
  {
    name: 'Homeowners Insurance Coverage Estimator',
    slug: 'homeowners-insurance-coverage-estimator',
    description: 'Calculate homeowners insurance coverage needs.',
  },
  {
    name: 'Car Insurance Coverage Needs Calculator',
    slug: 'car-insurance-coverage-needs-calculator',
    description: 'Calculate car insurance coverage needs.',
  },
  {
    name: 'Insurance Reserve Requirement Calculator',
    slug: 'insurance-reserve-requirement-calculator',
    description: 'Calculate insurance reserve requirements.',
  },
  {
    name: 'Expected Loss (Insurance Risk) Calculator',
    slug: 'expected-loss-insurance-risk-calculator',
    description: 'Calculate expected loss from insurance risk.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/insurance-replacement-value-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Insurance Replacement Value Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Insurance Replacement Value Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate insurance replacement value and actual cash value based on replacement cost, age, and useful life.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const replacementCost = values.replacementCost;
  const age = values.age;
  const usefulLife = values.usefulLife;

  // Calculate depreciation percentage (straight-line depreciation)
  // Depreciation % = (Age / Useful Life) Ã— 100, capped at 100%
  const depreciationPercent = usefulLife > 0 ? Math.min(100, (age / usefulLife) * 100) : 0;

  // Calculate depreciation amount
  const depreciationAmount = replacementCost * (depreciationPercent / 100);

  // Calculate actual cash value (ACV) = Replacement Cost - Depreciation
  const actualCashValue = replacementCost - depreciationAmount;

  // Replacement value is the same as replacement cost (current cost to replace)
  const replacementValue = replacementCost;

  // Difference between replacement value and ACV
  const difference = replacementValue - actualCashValue;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Replacement value and actual cash value calculated. Replacement cost coverage provides full replacement value, while ACV coverage provides depreciated value.';

  if (depreciationPercent >= 100) {
    status = 'low';
    interpretation = 'Item has reached or exceeded its useful life (100% depreciation). Actual cash value is $0. Consider replacement rather than insurance coverage for items beyond useful life.';
  } else if (depreciationPercent > 75) {
    status = 'moderate';
    interpretation = 'Item has high depreciation (over 75% of useful life). Actual cash value is significantly lower than replacement cost. Replacement cost coverage provides much better protection than ACV coverage.';
  } else if (depreciationPercent < 25) {
    status = 'optimal';
    interpretation = 'Item has low depreciation (under 25% of useful life). Actual cash value is close to replacement cost. Both replacement cost and ACV coverage provide similar protection for newer items.';
  } else {
    status = 'good';
    interpretation = 'Item has moderate depreciation. Replacement cost coverage provides better protection than ACV coverage, as the difference between replacement cost and ACV increases with depreciation.';
  }

  const recommendations = [
    `Replacement value: $${replacementValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is the current cost to replace the item with new property of similar kind and quality.`,
    `Actual cash value (ACV): $${actualCashValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This is replacement cost minus depreciation (${depreciationPercent.toFixed(1)}% depreciation based on ${age} years of age and ${usefulLife}-year useful life).`,
    `Difference: $${difference.toLocaleString(undefined, { maximumFractionDigits: 2 })}. This represents the additional coverage provided by replacement cost insurance vs. ACV insurance.`,
  ];
  if (depreciationPercent > 50) {
    recommendations.push('High depreciation means replacement cost coverage provides significantly better protection than ACV coverage. Consider replacement cost coverage to avoid large out-of-pocket expenses after a loss.');
  } else {
    recommendations.push('Moderate depreciation means both replacement cost and ACV coverage provide reasonable protection. Replacement cost coverage still provides better protection but the difference is smaller.');
  }
  if (age >= usefulLife) {
    recommendations.push('Item has exceeded useful life. Consider replacement rather than insurance coverage. If insuring, replacement cost coverage is essential as ACV would be $0.');
  }

  const plan = [
    { label: 'This Week', detail: `Review replacement value: $${replacementValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} and ACV: $${actualCashValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Assess current insurance coverage to ensure it matches replacement cost, not ACV.` },
    { label: 'This Month', detail: 'Compare insurance policies: replacement cost vs. ACV coverage. Consider replacement cost coverage if depreciation is high (over 50%) or if you cannot afford the difference between replacement cost and ACV after a loss.' },
    { label: 'Ongoing', detail: 'Review replacement value annually. Update coverage limits to account for inflation and changes in replacement costs. Ensure coverage matches current replacement costs to avoid underinsurance.' },
  ];

  return {
    replacementCost,
    age,
    usefulLife,
    depreciationPercent,
    depreciationAmount,
    actualCashValue,
    replacementValue,
    difference,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function InsuranceReplacementValueCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      replacementCost: undefined,
      age: undefined,
      usefulLife: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="insurance-replacement-value-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Insurance Replacement Value Calculator
          </CardTitle>
          <CardDescription>Calculate insurance replacement value and actual cash value based on replacement cost, age, and useful life.</CardDescription>
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
                  name="replacementCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Replacement Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="usefulLife"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Useful Life (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate values
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
            <CardDescription>See replacement value, actual cash value, depreciation, and coverage recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Replacement Value</p>
                <p className="text-2xl font-semibold text-primary">{result.replacementValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Actual Cash Value</p>
                <p className="text-2xl font-semibold text-primary">{result.actualCashValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Depreciation</p>
                <p className="text-2xl font-semibold text-primary">{result.depreciationPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of useful life</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Difference</p>
                <p className="text-2xl font-semibold text-primary">{result.difference.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
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
            <strong>Depreciation Percentage</strong> = (Age / Useful Life) Ã— 100, capped at 100%. Represents the percentage of useful life consumed.
          </p>
          <p>
            <strong>Depreciation Amount</strong> = Replacement Cost Ã— (Depreciation % / 100). The dollar amount of depreciation based on age and useful life.
          </p>
          <p>
            <strong>Actual Cash Value (ACV)</strong> = Replacement Cost - Depreciation Amount. The depreciated value of the item, accounting for age, wear and tear, and obsolescence.
          </p>
          <p>
            <strong>Replacement Value</strong> = Replacement Cost. The current cost to replace the item with new property of similar kind and quality, without deducting for depreciation.
          </p>
          <p>
            <strong>Difference</strong> = Replacement Value - Actual Cash Value. The additional coverage provided by replacement cost insurance vs. ACV insurance.
          </p>
          <p>Replacement cost coverage provides full replacement value without depreciation. ACV coverage provides depreciated value. Higher depreciation means larger difference between replacement cost and ACV, making replacement cost coverage more valuable.</p>
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
                <p className="text-sm text-muted-foreground">Depreciation Amount</p>
                <p className="text-xl font-semibold text-primary">
                  ${result.depreciationAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">$</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Remaining Useful Life</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, result.usefulLife - result.age).toFixed(0)} years
                </p>
                <p className="text-xs text-muted-foreground">Years remaining</p>
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
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/FinancialProduct"
      >
    <meta itemProp="name" content="The Definitive Guide to Insurance Replacement Value: Replacement Cost vs Actual Cash Value" />
    <meta itemProp="description" content="A comprehensive guide to calculating insurance replacement value and actual cash value based on replacement cost, age, and useful life." />
    <meta itemProp="keywords" content="insurance replacement value, replacement cost, actual cash value, ACV, depreciation, insurance coverage" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-01-02" />
    <meta itemProp="url" content="/definitive-insurance-replacement-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Insurance Replacement Value: Replacement Cost vs Actual Cash Value</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive guide to understanding replacement cost and actual cash value in insurance coverage.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#overview" className="hover:underline">Overview: Replacement Cost vs Actual Cash Value</a></li>
        <li><a href="#depreciation" className="hover:underline">Depreciation Calculation</a></li>
        <li><a href="#coverage" className="hover:underline">Coverage Types</a></li>
        <li><a href="#considerations" className="hover:underline">Key Considerations</a></li>
    </ul>
<hr />

    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Replacement Cost vs Actual Cash Value</h2>
    <p><b>Insurance replacement value</b> determines how much you receive after a covered loss. Replacement cost provides full replacement value, while actual cash value (ACV) provides depreciated value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <ul>
        <li><b>Replacement Cost:</b> Current cost to replace with new property of similar kind and quality, without depreciation</li>
        <li><b>Actual Cash Value (ACV):</b> Replacement cost minus depreciation, accounting for age and wear</li>
        <li><b>Depreciation:</b> Reduction in value due to age, wear and tear, and obsolescence</li>
    </ul>

<hr />

    <h2 id="depreciation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Depreciation Calculation</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Straight-Line Depreciation</h3>
    <p>Depreciation is calculated as: <b>Depreciation % = (Age / Useful Life) Ã— 100</b></p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
    <p>If a 10-year-old roof has a 20-year useful life and replacement cost of $20,000:</p>
    <ul>
        <li>Depreciation %: (10 / 20) Ã— 100 = 50%</li>
        <li>Depreciation Amount: $20,000 Ã— 50% = $10,000</li>
        <li>ACV: $20,000 - $10,000 = $10,000</li>
    </ul>
    <p>Replacement cost coverage would pay $20,000, while ACV coverage would pay $10,000.</p>

<hr />

    <h2 id="coverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coverage Types</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Replacement Cost Coverage</h3>
    <p>Replacement cost coverage provides full replacement value without depreciation. Premiums are higher, but you receive full replacement cost after a loss, reducing out-of-pocket expenses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Actual Cash Value Coverage</h3>
    <p>ACV coverage provides depreciated value. Premiums are lower, but you receive less after a loss due to depreciation deductions. The difference between replacement cost and ACV must be paid out-of-pocket.</p>

<hr />

    <h2 id="considerations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Considerations</h2>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">Age and Depreciation</h3>
    <p>Older items have higher depreciation, resulting in larger differences between replacement cost and ACV. Replacement cost coverage becomes more valuable as items age.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Inflation</h3>
    <p>Replacement costs increase with inflation. Review and update coverage limits annually to account for inflation. Many policies include inflation protection riders.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Useful Life</h3>
    <p>Useful life varies by item type: roofs (20-30 years), HVAC (15-20 years), appliances (10-15 years). Accurate useful life estimates improve depreciation calculations.</p>

<hr />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p><b>Insurance replacement value</b> determines coverage payouts. Replacement cost provides full replacement value, while ACV provides depreciated value. Higher depreciation means larger differences, making replacement cost coverage more valuable. Review coverage annually and update limits to account for inflation.</p>
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
          <p>This tool calculates insurance replacement value and actual cash value based on replacement cost, age, and useful life.</p>
          <p>Outputs include replacement value, actual cash value, depreciation percentage and amount, difference between replacement cost and ACV, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
